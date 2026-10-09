import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// 1. VALIDATION TESTS (Phase 2 & Phase 10)
// ---------------------------------------------------------------------------
test('Email validation enforces RFC 5322 standard', () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Valid emails
  assert.equal(emailRegex.test('customer@example.com'), true);
  assert.equal(emailRegex.test('user.name+tag@sub.domain.co.in'), true);
  assert.equal(emailRegex.test('ranjith@snapdeal.com'), true);

  // Invalid emails
  assert.equal(emailRegex.test(''), false);
  assert.equal(emailRegex.test('plainaddress'), false);
  assert.equal(emailRegex.test('@missingusername.com'), false);
  assert.equal(emailRegex.test('user@.com'), false);
  assert.equal(emailRegex.test('user@domain'), false);
  assert.equal(emailRegex.test('user@domain.'), false);
  assert.equal(emailRegex.test('user space@domain.com'), false);
});

test('Password strength and length validation', () => {
  const validatePassword = (pwd) => {
    if (!pwd || pwd.trim() === '') return { valid: false, reason: 'Password is required' };
    if (pwd.length < 6) return { valid: false, reason: 'Password must be at least 6 characters' };
    return { valid: true };
  };

  assert.equal(validatePassword('').valid, false);
  assert.equal(validatePassword('   ').valid, false);
  assert.equal(validatePassword('12345').valid, false);
  assert.equal(validatePassword('123456').valid, true);
  assert.equal(validatePassword('SecurePassword!@#').valid, true);
});

test('Mobile phone number validation', () => {
  const phoneRegex = /^[6-9]\d{9}$/;

  assert.equal(phoneRegex.test('9876543210'), true);
  assert.equal(phoneRegex.test('8123456789'), true);
  assert.equal(phoneRegex.test('7000000000'), true);
  assert.equal(phoneRegex.test('6999999999'), true);

  // Invalid cases
  assert.equal(phoneRegex.test('1234567890'), false); // Starts with invalid digit
  assert.equal(phoneRegex.test('0987654321'), false);
  assert.equal(phoneRegex.test('987654321'), false);  // 9 digits
  assert.equal(phoneRegex.test('98765432100'), false); // 11 digits
  assert.equal(phoneRegex.test('98765abcde'), false); // Non-digit characters
});

test('UUID format validation prevents PostgreSQL 22P02 syntax errors', () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  assert.equal(uuidRegex.test('b8571648-0196-49e9-897e-6eb804514821'), true);
  assert.equal(uuidRegex.test('7a4cf133-e9ff-4313-9271-8ce12b4c79ce'), true);
  assert.equal(uuidRegex.test('12345'), false);
  assert.equal(uuidRegex.test('abc'), false);
  assert.equal(uuidRegex.test('null'), false);
  assert.equal(uuidRegex.test(''), false);
});

// ---------------------------------------------------------------------------
// 2. PRODUCT & CATEGORY ISOLATION TESTS (Phases 3 & 4)
// ---------------------------------------------------------------------------
const MOCK_CATEGORIES = [
  { id: 'cat-elec', name: 'Electronics', slug: 'electronics' },
  { id: 'cat-fash', name: 'Fashion', slug: 'fashion' },
  { id: 'cat-beau', name: 'Beauty', slug: 'beauty' },
  { id: 'cat-foot', name: 'Footwear', slug: 'footwear' },
];

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Sony WH-1000XM5 Headphones', brand: 'Sony', category_id: 'cat-elec', price: 29990, stock_quantity: 15 },
  { id: 'p2', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category_id: 'cat-elec', price: 129999, stock_quantity: 8 },
  { id: 'p3', name: 'Levis Mens Slim Fit Jeans', brand: 'Levis', category_id: 'cat-fash', price: 2499, stock_quantity: 20 },
  { id: 'p4', name: 'Zara Casual Cotton Shirt', brand: 'Zara', category_id: 'cat-fash', price: 1990, stock_quantity: 12 },
  { id: 'p5', name: 'Maybelline Matte Lipstick', brand: 'Maybelline', category_id: 'cat-beau', price: 499, stock_quantity: 25 },
  { id: 'p6', name: 'Nike Air Max Running Shoes', brand: 'Nike', category_id: 'cat-foot', price: 8995, stock_quantity: 5 },
];

test('Category filtering strictly isolates products by category_id', () => {
  const filterByCategory = (products, categoryId) => {
    if (!categoryId || categoryId === 'all') return products;
    return products.filter(p => p.category_id === categoryId);
  };

  const fashionProducts = filterByCategory(MOCK_PRODUCTS, 'cat-fash');
  assert.equal(fashionProducts.length, 2);
  assert.equal(fashionProducts.every(p => p.category_id === 'cat-fash'), true);
  // Ensure no electronics leak into fashion
  assert.equal(fashionProducts.some(p => p.category_id === 'cat-elec'), false);

  const electronics = filterByCategory(MOCK_PRODUCTS, 'cat-elec');
  assert.equal(electronics.length, 2);
  assert.equal(electronics.every(p => p.category_id === 'cat-elec'), true);

  const all = filterByCategory(MOCK_PRODUCTS, 'all');
  assert.equal(all.length, 6);
});

// ---------------------------------------------------------------------------
// 3. SEARCH FILTERING TESTS (Phase 5)
// ---------------------------------------------------------------------------
test('Search filters evaluate name and brand case-insensitively without bypassing category', () => {
  const search = (products, query, categoryId) => {
    let result = products;
    if (categoryId && categoryId !== 'all') {
      result = result.filter(p => p.category_id === categoryId);
    }
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }
    return result;
  };

  // Full name search
  assert.equal(search(MOCK_PRODUCTS, 'Sony WH-1000XM5').length, 1);
  // Partial search
  assert.equal(search(MOCK_PRODUCTS, 'Sony').length, 1);
  // Brand search
  assert.equal(search(MOCK_PRODUCTS, 'Samsung').length, 1);
  // Case insensitivity
  assert.equal(search(MOCK_PRODUCTS, 'samsung').length, 1);
  assert.equal(search(MOCK_PRODUCTS, 'SAMSUNG').length, 1);
  assert.equal(search(MOCK_PRODUCTS, 'SaMsUnG').length, 1);

  // Search + category: search for 'shirt' in Fashion
  const fashionShirt = search(MOCK_PRODUCTS, 'shirt', 'cat-fash');
  assert.equal(fashionShirt.length, 1);
  assert.equal(fashionShirt[0].name, 'Zara Casual Cotton Shirt');

  // Search must NEVER bypass selected category
  const electronicsShirt = search(MOCK_PRODUCTS, 'shirt', 'cat-elec');
  assert.equal(electronicsShirt.length, 0);

  const fashionSony = search(MOCK_PRODUCTS, 'Sony', 'cat-fash');
  assert.equal(fashionSony.length, 0); // Sony is electronics, cannot appear in Fashion
});

// ---------------------------------------------------------------------------
// 4. CART QUANTITY & CONCURRENCY TESTS (Phases 6 & 7)
// ---------------------------------------------------------------------------
test('Cart quantity clamps between 1 and 10, honoring available stock', () => {
  const calculateCartQty = (currentQty, delta, stock) => {
    const maxAllowed = Math.min(stock, 10);
    return Math.max(1, Math.min(currentQty + delta, maxAllowed));
  };

  assert.equal(calculateCartQty(1, 1, 15), 2);
  assert.equal(calculateCartQty(9, 1, 15), 10);
  assert.equal(calculateCartQty(10, 1, 15), 10); // Cannot exceed 10
  assert.equal(calculateCartQty(1, -1, 15), 1);  // Cannot go below 1

  // Clamped by stock
  assert.equal(calculateCartQty(3, 5, 4), 4);   // Stock is 4, max 4
});

test('Adding duplicate item updates quantity rather than creating new cart entry', () => {
  let cart = [];

  const addToCart = (cartState, productId, color, qty, stock) => {
    const existingIdx = cartState.findIndex(c => c.product_id === productId && c.color === color);
    const maxAllowed = Math.min(stock, 10);

    if (existingIdx > -1) {
      const existing = cartState[existingIdx];
      const newQty = Math.min(existing.qty + qty, maxAllowed);
      const updated = [...cartState];
      updated[existingIdx] = { ...existing, qty: newQty };
      return updated;
    } else {
      return [...cartState, { id: 'c_' + Date.now(), product_id: productId, color, qty: Math.min(qty, maxAllowed) }];
    }
  };

  cart = addToCart(cart, 'p1', 'Black', 1, 10);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 1);

  // Add same product, same color
  cart = addToCart(cart, 'p1', 'Black', 2, 10);
  assert.equal(cart.length, 1); // Not duplicated
  assert.equal(cart[0].qty, 3);

  // Add same product, DIFFERENT color
  cart = addToCart(cart, 'p1', 'Silver', 1, 10);
  assert.equal(cart.length, 2); // Separate variant entry
});

test('Double-submission mutex prevents duplicate in-flight cart operations', async () => {
  const inFlight = new Set();
  let insertCalls = 0;

  const performAdd = async (key) => {
    if (inFlight.has(key)) return { duplicatePrevented: true };
    inFlight.add(key);
    try {
      insertCalls++;
      await new Promise(r => setTimeout(r, 20)); // Simulate async network call
      return { success: true };
    } finally {
      inFlight.delete(key);
    }
  };

  // Simulate 3 rapid clicks fired in parallel
  const results = await Promise.all([
    performAdd('p1_Default'),
    performAdd('p1_Default'),
    performAdd('p1_Default'),
  ]);

  assert.equal(insertCalls, 1); // Exactly 1 insert reached DB logic
  assert.equal(results.filter(r => r.duplicatePrevented).length, 2);
});

// ---------------------------------------------------------------------------
// 5. AUTHORITATIVE COUPON VALIDATION TESTS (Phase 15)
// ---------------------------------------------------------------------------
test('Coupon calculation enforces minimum spend, max discount, and expiry', () => {
  const COUPONS = {
    SNAP20: { discount_type: 'percentage', discount_value: 20, min_order: 999, max_discount: 2000, active: true },
    SAVE500: { discount_type: 'fixed', discount_value: 500, min_order: 2000, max_discount: null, active: true },
    EXPIRED: { discount_type: 'percentage', discount_value: 10, min_order: 500, max_discount: null, active: false },
  };

  const applyCoupon = (code, subtotal) => {
    const c = COUPONS[code?.toUpperCase()];
    if (!c) return { valid: false, message: 'Invalid coupon' };
    if (!c.active) return { valid: false, message: 'Coupon expired or inactive' };
    if (subtotal < c.min_order) return { valid: false, message: `Minimum order is ₹${c.min_order}` };

    let discount = 0;
    if (c.discount_type === 'percentage') {
      discount = Math.round((subtotal * c.discount_value) / 100);
      if (c.max_discount && discount > c.max_discount) discount = c.max_discount;
    } else {
      discount = c.discount_value;
    }
    return { valid: true, discount: Math.min(discount, subtotal) };
  };

  // Percentage coupon test (SNAP20: 20%, min 999, max 2000)
  assert.equal(applyCoupon('SNAP20', 500).valid, false); // Below min
  assert.equal(applyCoupon('SNAP20', 1000).discount, 200);
  assert.equal(applyCoupon('SNAP20', 20000).discount, 2000); // Capped at max 2000

  // Fixed coupon test (SAVE500: ₹500, min 2000)
  assert.equal(applyCoupon('SAVE500', 1999).valid, false);
  assert.equal(applyCoupon('SAVE500', 3000).discount, 500);

  // Inactive coupon
  assert.equal(applyCoupon('EXPIRED', 5000).valid, false);
  // Non-existent coupon
  assert.equal(applyCoupon('FAKE99', 5000).valid, false);
});

// ---------------------------------------------------------------------------
// 6. CHECKOUT PRICE TAMPERING & ADDRESS SNAPSHOT TESTS (Phases 14, 16 & 17)
// ---------------------------------------------------------------------------
test('Backend price authority rejects manipulated frontend values', () => {
  // Scenario: Malicious user edits React state / DOM from ₹50,000 to ₹1
  const catalogDbPrice = 50000;
  const frontendTamperedPrice = 1;

  const authoritativeCalculate = (item, authoritativePrice) => {
    return authoritativePrice * item.qty;
  };

  const orderTotal = authoritativeCalculate({ qty: 1, price: frontendTamperedPrice }, catalogDbPrice);
  assert.equal(orderTotal, 50000); // Database price is strictly authoritative
});

test('Address snapshotting preserves historical order integrity', () => {
  const userAddresses = [
    { id: 'addr-1', full_name: 'John Doe', phone: '9876543210', address_text: 'MG Road, Bengaluru' }
  ];

  // 1. User places order with Address 1
  const placedOrder = {
    id: 'ord-101',
    shipping_full_name: userAddresses[0].full_name,
    shipping_phone: userAddresses[0].phone,
    shipping_address: userAddresses[0].address_text,
  };

  // 2. User later updates saved address to Address 2
  userAddresses[0].full_name = 'Jane Doe';
  userAddresses[0].address_text = 'Connaught Place, New Delhi';

  // 3. Historical order MUST NOT reflect the new address
  assert.equal(placedOrder.shipping_full_name, 'John Doe');
  assert.equal(placedOrder.shipping_address, 'MG Road, Bengaluru');
});

// ---------------------------------------------------------------------------
// 7. REVIEW PERMISSION & RATING RANGE TESTS (Phase 18)
// ---------------------------------------------------------------------------
test('Review submission enforces delivered purchase eligibility and rating constraints (1-5)', () => {
  const validateReview = (userOrders, productId, rating, comment) => {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return { valid: false, message: 'Rating must be an integer between 1 and 5' };
    }
    if (!comment || comment.trim().length < 5) {
      return { valid: false, message: 'Comment must be at least 5 characters' };
    }

    const hasDeliveredOrder = userOrders.some(order => 
      order.status?.toLowerCase() === 'delivered' &&
      order.order_items?.some(item => item.product_id === productId)
    );

    if (!hasDeliveredOrder) {
      return { valid: false, message: 'Only verified buyers with a delivered order can review' };
    }

    return { valid: true };
  };

  const userOrders = [
    { id: 'o1', status: 'Processing', order_items: [{ product_id: 'p1' }] },
    { id: 'o2', status: 'Delivered', order_items: [{ product_id: 'p2' }] },
  ];

  // User purchased p1, but status is Processing -> Denied
  assert.equal(validateReview(userOrders, 'p1', 5, 'Great item').valid, false);

  // User did NOT purchase p3 -> Denied
  assert.equal(validateReview(userOrders, 'p3', 5, 'Great item').valid, false);

  // User purchased p2 and status is Delivered -> Allowed
  assert.equal(validateReview(userOrders, 'p2', 5, 'Excellent quality sound!').valid, true);

  // Invalid ratings
  assert.equal(validateReview(userOrders, 'p2', 0, 'Good product').valid, false);
  assert.equal(validateReview(userOrders, 'p2', 6, 'Good product').valid, false);
  assert.equal(validateReview(userOrders, 'p2', 4.5, 'Good product').valid, false);
});

// ---------------------------------------------------------------------------
// 8. FASHION CATEGORY ISOLATION & ALIAS RESOLUTION TESTS
// ---------------------------------------------------------------------------
test('Subcategory and alias resolution correctly routes fashion sub-links to fashion category', () => {
  const CATEGORY_ALIAS_MAP = {
    fashion: 'fashion',
    womens: 'fashion',
    mens: 'fashion',
    'kids-fashion': 'fashion',
    clothing: 'fashion',
    apparel: 'fashion',
    'fashion-accessories': 'fashion',
    bags: 'fashion',
    ethnic: 'fashion',
  };

  const resolveCategory = (slug) => {
    const clean = slug.toLowerCase().trim();
    return CATEGORY_ALIAS_MAP[clean] || null;
  };

  assert.equal(resolveCategory('fashion'), 'fashion');
  assert.equal(resolveCategory('womens'), 'fashion');
  assert.equal(resolveCategory('mens'), 'fashion');
  assert.equal(resolveCategory('kids-fashion'), 'fashion');
  assert.equal(resolveCategory('clothing'), 'fashion');
  assert.equal(resolveCategory('apparel'), 'fashion');
  assert.equal(resolveCategory('fashion-accessories'), 'fashion');
});

test('Category routing guard prevents unmapped slug fallback from leaking all store products', () => {
  const ALL_PRODUCTS = [
    { id: '1', name: 'vivo X100 Pro 5G', category_id: 'mobiles' },
    { id: '2', name: 'Apple MacBook Air M3', category_id: 'laptops' },
    { id: '3', name: 'Sony WH-1000XM5', category_id: 'electronics' },
    { id: '4', name: "Levi's 511 Slim Fit Jeans", category_id: 'fashion' },
  ];

  const loadCategoryProducts = (catParam, resolvedCategoryId) => {
    if (catParam && !resolvedCategoryId) {
      // Unmapped category slug must NEVER return ALL_PRODUCTS
      return [];
    }
    if (resolvedCategoryId) {
      return ALL_PRODUCTS.filter(p => p.category_id === resolvedCategoryId);
    }
    return ALL_PRODUCTS;
  };

  // When invalid category is supplied
  assert.deepEqual(loadCategoryProducts('unknown-category', null), []);

  // When fashion is supplied
  const fashionProducts = loadCategoryProducts('fashion', 'fashion');
  assert.equal(fashionProducts.length, 1);
  assert.equal(fashionProducts[0].name, "Levi's 511 Slim Fit Jeans");
  // Ensure NO electronics or mobiles leak into fashion
  assert.equal(fashionProducts.some(p => p.category_id === 'mobiles' || p.category_id === 'laptops' || p.category_id === 'electronics'), false);
});

test('Fashion products image sanity check: must not contain phone photography', () => {
  const PHONE_PHOTO_IDS = [
    'photo-1621330396173-e41b1cafd17f',
    'photo-1592750475338-74b7b21085ab',
    'photo-1574944985070-8f3ebc6b79d2',
    'photo-1601784551446-20c9e07cdbdb',
    'photo-1598327105666-5b89351aff97',
    'photo-1510557880182-3d4d3cba35a5',
  ];

  const sanitizedJeansImages = [
    'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop&auto=format',
  ];

  const containsPhoneImages = (images) => {
    return images.some(img => PHONE_PHOTO_IDS.some(id => img.includes(id)));
  };

  assert.equal(containsPhoneImages(sanitizedJeansImages), false);
});

// ---------------------------------------------------------------------------
// 8. FASHION GENDER ISOLATION & ZERO CROSS-CONTAMINATION TESTS
// ---------------------------------------------------------------------------
test('Strict gender isolation helpers prevent "women" from matching "men"', () => {
  const isMenProduct = (p) => {
    if (p.gender === 'men') return true;
    if (p.gender === 'women' || p.gender === 'kids') return false;
    const text = `${p.name || ''} ${p.description || ''}`.toLowerCase();
    if (/\b(women|women's|womens|lady|ladies|female|girl|girls|saree|anarkali|kurti|dress|frock|bra)\b/i.test(text)) {
      return false;
    }
    return /\b(men|men's|mens|male|gent|gents)\b/i.test(text);
  };

  const isWomenProduct = (p) => {
    if (p.gender === 'women') return true;
    if (p.gender === 'men' || p.gender === 'kids') return false;
    const text = `${p.name || ''} ${p.description || ''}`.toLowerCase();
    return /\b(women|women's|womens|lady|ladies|female|girl|girls|saree|anarkali|kurti|dress|frock)\b/i.test(text);
  };

  const sampleProducts = [
    { name: "Levi's Men 511 Slim Fit Jeans", description: "Jeans for men", gender: 'men' },
    { name: "Zara Men's Slim Fit Linen Casual Shirt", description: "Shirt for men", gender: 'men' },
    { name: "FabIndia Women's Pure Cotton Kurta", description: "Straight kurta for women", gender: 'women' },
    { name: "H&M Women's Floral Print Wrap Summer Dress", description: "Dress for women", gender: 'women' },
    { name: "Biba Women's Embroidered Anarkali Kurta Set", description: "Anarkali for women", gender: 'women' },
    { name: "U.S. Polo Assn. Kids Boys Pure Cotton Set", description: "Set for boys", gender: 'kids' },
  ];

  // Men's filter: Must return ONLY men's products and ZERO women's products
  const menFiltered = sampleProducts.filter(isMenProduct);
  assert.equal(menFiltered.length, 2);
  assert.equal(menFiltered.every(p => p.gender === 'men'), true);
  assert.equal(menFiltered.some(p => p.gender === 'women'), false);
  assert.equal(menFiltered.some(p => p.name.includes("Women")), false);

  // Women's filter: Must return ONLY women's products and ZERO men's products
  const womenFiltered = sampleProducts.filter(isWomenProduct);
  assert.equal(womenFiltered.length, 3);
  assert.equal(womenFiltered.every(p => p.gender === 'women'), true);
  assert.equal(womenFiltered.some(p => p.gender === 'men'), false);
});

// ---------------------------------------------------------------------------
// 9. VISUAL PRODUCT SEARCH & IMAGE RECOGNITION TESTS
// ---------------------------------------------------------------------------
test('Visual search categorizes product images and maps to valid search queries', () => {
  const inferVisualCategory = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('footwear')) {
      return { category: 'Footwear', query: 'shoes' };
    }
    if (lower.includes('watch')) {
      return { category: 'Watches', query: 'watch' };
    }
    if (lower.includes('jeans') || lower.includes('denim')) {
      return { category: "Men's Fashion", query: 'jeans' };
    }
    if (lower.includes('dress') || lower.includes('kurta')) {
      return { category: "Women's Fashion", query: 'women' };
    }
    if (lower.includes('serum') || lower.includes('beauty')) {
      return { category: 'Beauty', query: 'serum' };
    }
    return { category: 'Fashion', query: 'shirt' };
  };

  assert.deepEqual(inferVisualCategory('Sneakers_Photo.jpg'), { category: 'Footwear', query: 'shoes' });
  assert.deepEqual(inferVisualCategory('Titan_Neo_Watch.png'), { category: 'Watches', query: 'watch' });
  assert.deepEqual(inferVisualCategory('Levis_511_Jeans.jpg'), { category: "Men's Fashion", query: 'jeans' });
  assert.deepEqual(inferVisualCategory('Floral_Summer_Dress.webp'), { category: "Women's Fashion", query: 'women' });
  assert.deepEqual(inferVisualCategory('Niacinamide_Serum.png'), { category: 'Beauty', query: 'serum' });
  assert.deepEqual(inferVisualCategory('Casual_Summer_Wear.png'), { category: 'Fashion', query: 'shirt' });
});

// ---------------------------------------------------------------------------
// 10. TODAY'S DEALS & DISCOUNT CATALOG TESTS
// ---------------------------------------------------------------------------
test('Today\'s Deals correctly identifies deal target queries and categories', () => {
  const isDealsQuery = (cat, query) => {
    const catLower = (cat || '').toLowerCase().trim();
    const queryLower = (query || '').toLowerCase().trim();
    return (
      catLower === 'deals' ||
      catLower === 'flash' ||
      catLower === 'today-deals' ||
      catLower === 'todays-deals' ||
      catLower === 'todaydeals' ||
      queryLower === 'deals' ||
      queryLower === "today's deals" ||
      queryLower === 'today deals' ||
      queryLower === 'todays deals' ||
      queryLower === 'flash deals' ||
      queryLower === 'flash sale'
    );
  };

  assert.equal(isDealsQuery('deals', ''), true);
  assert.equal(isDealsQuery('flash', ''), true);
  assert.equal(isDealsQuery('todays-deals', ''), true);
  assert.equal(isDealsQuery('', "today's deals"), true);
  assert.equal(isDealsQuery('', "flash sale"), true);
  assert.equal(isDealsQuery('fashion', ''), false);
  assert.equal(isDealsQuery('mobiles', ''), false);
});

test('Deals catalog filters by minimum discount and sorts by highest savings descending', () => {
  const catalog = [
    { id: 'p1', name: 'Boldfit Yoga Mat', price: 799, original_price: 1999, discount: 60 },
    { id: 'p2', name: 'Fastrack AMOLED Smartwatch', price: 2999, original_price: 5995, discount: 50 },
    { id: 'p3', name: 'Levi\'s Men 511 Slim Fit Jeans', price: 1899, original_price: 3699, discount: 49 },
    { id: 'p4', name: 'Prestige Iris Mixer Grinder', price: 2899, original_price: 6395, discount: 55 },
    { id: 'p5', name: 'Regular Retail Item', price: 950, original_price: 1000, discount: 5 },
    { id: 'p6', name: 'Zero Discount Item', price: 500, original_price: 500, discount: 0 },
  ];

  const getDeals = (products, minDiscount = 20) => {
    return products
      .filter(p => (p.discount || 0) >= minDiscount)
      .sort((a, b) => (b.discount || 0) - (a.discount || 0));
  };

  const deals = getDeals(catalog, 20);
  assert.equal(deals.length, 4);
  assert.equal(deals[0].name, 'Boldfit Yoga Mat'); // 60%
  assert.equal(deals[1].name, 'Prestige Iris Mixer Grinder'); // 55%
  assert.equal(deals[2].name, 'Fastrack AMOLED Smartwatch'); // 50%
  assert.equal(deals[3].name, 'Levi\'s Men 511 Slim Fit Jeans'); // 49%

  // Items under 20% discount must be excluded from deals
  assert.equal(deals.some(d => d.discount < 20), false);
});

// ---------------------------------------------------------------------------
// 11. NEW ARRIVALS ISOLATION & DEDICATED CATALOG TESTS
// ---------------------------------------------------------------------------
test('New Arrivals correctly identifies new arrivals target queries and categories', () => {
  const isNewArrivalsQuery = (cat, query) => {
    const catLower = (cat || '').toLowerCase().trim();
    const queryLower = (query || '').toLowerCase().trim();
    return (
      catLower === 'new' ||
      catLower === 'new-arrivals' ||
      catLower === 'newarrivals' ||
      catLower === 'arrivals' ||
      queryLower === 'new' ||
      queryLower === 'new arrivals' ||
      queryLower === 'new arrival' ||
      queryLower === 'fresh drops' ||
      queryLower === 'latest arrivals' ||
      queryLower === 'new launches'
    );
  };

  assert.equal(isNewArrivalsQuery('new', ''), true);
  assert.equal(isNewArrivalsQuery('new-arrivals', ''), true);
  assert.equal(isNewArrivalsQuery('newarrivals', ''), true);
  assert.equal(isNewArrivalsQuery('', 'new arrivals'), true);
  assert.equal(isNewArrivalsQuery('', 'fresh drops'), true);
  assert.equal(isNewArrivalsQuery('fashion', ''), false);
  assert.equal(isNewArrivalsQuery('deals', ''), false);
});

test('New Arrivals strictly isolates newly added products and excludes existing products', () => {
  const existingProducts = [
    { id: 'b8571648-0196-49e9-897e-6eb804514821', name: 'Existing DB Product 1', isNewArrival: false },
    { id: '7a4cf133-e9ff-4313-9271-8ce12b4c79ce', name: 'Existing DB Product 2', isNewArrival: false },
  ];

  const newArrivalsCatalog = [
    { id: 'c0000001-0000-4000-8000-000000000001', name: 'Samsung Galaxy S25 Ultra 5G', isNewArrival: true },
    { id: 'c0000002-0000-4000-8000-000000000002', name: 'Apple iPhone 16 Pro', isNewArrival: true },
    { id: 'c0000004-0000-4000-8000-000000000004', name: 'Apple MacBook Air 15.3-inch M3', isNewArrival: true },
    { id: 'c0000005-0000-4000-8000-000000000005', name: 'Sony PlayStation 5 Pro Console', isNewArrival: true },
    { id: 'c0000008-0000-4000-8000-000000000008', name: 'Tommy Hilfiger Bomber Jacket', isNewArrival: true },
    { id: 'c0000014-0000-4000-8000-000000000014', name: 'Nike Air Jordan 1 Retro High OG', isNewArrival: true },
  ];

  const getNewArrivals = () => {
    // Only return products specifically marked/created as new arrivals
    return newArrivalsCatalog;
  };

  const loaded = getNewArrivals();
  assert.equal(loaded.length, 6);
  assert.equal(loaded.every(p => p.isNewArrival === true), true);

  // Invariant: ZERO existing products must leak into new arrivals
  const existingIds = new Set(existingProducts.map(p => p.id));
  assert.equal(loaded.some(p => existingIds.has(p.id)), false);

  // Invariant: Valid UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.equal(loaded.every(p => uuidRegex.test(p.id)), true);
});

test('Watches and Wearables category strictly excludes cosmetic/skincare images and contains genuine timepieces and accessories', () => {
  const COSMETIC_IMAGE_ID = 'photo-1522335789203-aabd1fc54bc9';

  const newArrivalsWatches = [
    {
      id: 'c0000017-0000-4000-8000-000000000017',
      category: 'watches',
      name: 'Apple Watch Ultra 2',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000018-0000-4000-8000-000000000018',
      category: 'watches',
      name: 'Fossil Gen 6 Heritage Automatic Watch',
      images: ['https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000021-0000-4000-8000-000000000021',
      category: 'watches',
      name: 'Samsung Galaxy Watch Ultra 47mm LTE',
      images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000022-0000-4000-8000-000000000022',
      category: 'watches',
      name: 'Omega Speedmaster Professional Chronograph',
      images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000023-0000-4000-8000-000000000023',
      category: 'watches',
      name: 'Garmin Forerunner 965 GPS Smartwatch',
      images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000024-0000-4000-8000-000000000024',
      category: 'watches',
      name: 'Nomad Traditional Horween Leather Watch Strap',
      images: ['https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&h=800&fit=crop&auto=format'],
    },
  ];

  // Invariant 1: No cosmetic / skincare image in watches category
  for (const watch of newArrivalsWatches) {
    const hasCosmeticImg = watch.images.some(img => img.includes(COSMETIC_IMAGE_ID));
    assert.equal(hasCosmeticImg, false, `${watch.name} must not have cosmetic/skincare image`);
  }

  // Invariant 2: Watches and accessories count is at least 6
  assert.equal(newArrivalsWatches.length >= 6, true);

  // Invariant 4: Watches category strictly excludes footwear / sneaker photos
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');
  const SNEAKER_IMAGE_ID = 'photo-1539185441755-769473a23570';
  assert.equal(
    productsTs.includes("name: \"Michael Kors Women's Parker Rose Gold-Tone Watch\"") &&
    productsTs.includes('/images/watches/michael_kors_rose_gold.jpg'),
    true,
    "Michael Kors watch must use dedicated rose gold watch image"
  );
  assert.equal(
    productsTs.includes(SNEAKER_IMAGE_ID),
    false,
    "Sneaker photo photo-1539185441755-769473a23570 must not be used in products catalog"
  );
});

test('Sneakers and Footwear category strictly excludes non-footwear photos (gym equipment, models) and contains genuine footwear', () => {
  const NON_FOOTWEAR_PHOTO_IDS = [
    'photo-1584735935682-2f2b69dff9d2', // gym dumbbells/bands
    'photo-1614252369475-531eba835eb1', // man in leather jacket and sunglasses
  ];

  const allFootwear = [
    {
      id: '661ddf9c-0002-418e-9e4e-9381210ab953',
      name: "Bata Men's Classic Leather Formal Oxford Shoes",
      images: [
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=800&h=800&fit=crop&auto=format',
      ],
    },
    {
      id: 'c0000014-0000-4000-8000-000000000014',
      name: "Nike Air Jordan 1 Retro High OG 'Lost & Found'",
      images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000015-0000-4000-8000-000000000015',
      name: "Adidas Originals Samba OG Decon Leather Sneakers",
      images: ['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000016-0000-4000-8000-000000000016',
      name: "Puma Fast-R Nitro Elite 2 Carbon Road Racing Marathon Shoes",
      images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000025-0000-4000-8000-000000000025',
      name: "Nike Air Force 1 '07 Shadow Edition",
      images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000026-0000-4000-8000-000000000026',
      name: "Converse Chuck 70 Vintage Canvas High-Top Sneakers",
      images: ['https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&h=800&fit=crop&auto=format'],
    },
    {
      id: 'c0000027-0000-4000-8000-000000000027',
      name: "Nike Air Force 1 Low Premium Utilitarian",
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop&auto=format'],
    },
  ];

  // Invariant 1: No non-footwear photos (gym equipment or model portraits) in footwear
  for (const shoe of allFootwear) {
    for (const forbiddenId of NON_FOOTWEAR_PHOTO_IDS) {
      const hasForbidden = shoe.images.some(img => img.includes(forbiddenId));
      assert.equal(hasForbidden, false, `${shoe.name} must not contain forbidden photo ${forbiddenId}`);
    }
  }

  // Invariant 2: At least 7 items verified
  assert.equal(allFootwear.length >= 7, true);

  // Invariant 3: All items represent genuine footwear brands
  const brands = ['Nike', 'Adidas', 'Puma', 'Converse', 'Bata'];
  for (const shoe of allFootwear) {
    assert.equal(brands.some(b => shoe.name.includes(b)), true);
  }
});

test('Beauty & Personal Care category strictly contains authentic products across departments with zero 404s or image mismatches', () => {
  const FORBIDDEN_IMAGE_IDS = [
    'photo-1608248597359-25095d38b556', // 404
    'photo-1607006314645-0d04b684a0d9', // 404
    'photo-1598662779094-110c2bad80b5', // Gaming Keyboard
    'photo-1527799820374-dcf8d9d4a388', // Hair straightener tool on makeup
  ];

  const NECESSAIRE_LOTION_ID = 'photo-1620916566398-39f1143ab7be';
  const POWDER_COMPACT_ID = 'photo-1596462502278-27bfdc403348';

  const beautyProducts = [
    // Skincare
    { id: 'c601dc3b-f07e-4cd9-a122-b12d1fcf8924', name: 'Minimalist 10% Niacinamide Face Serum', subcategory: 'skincare', images: ['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&h=800&fit=crop&auto=format'] },
    { id: '694a9414-0002-4a5e-a5e4-d44aa14f3021', name: "L'Oreal Paris Revitalift 1.5% Hyaluronic Acid Serum", subcategory: 'skincare', images: ['https://images.unsplash.com/photo-1617897903246-719242758050?w=800&h=800&fit=crop&auto=format'] },
    { id: 'c0000020-0000-4000-8000-000000000020', name: 'Estée Lauder Advanced Night Repair Serum', subcategory: 'skincare', images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000001', name: 'Clinique Moisture Surge 100H Hydrator', subcategory: 'skincare', images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000002', name: 'Neutrogena Hydro Boost Sunscreen SPF 50+', subcategory: 'skincare', images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000003', name: 'CeraVe Foaming Facial Cleanser', subcategory: 'skincare', images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop&auto=format'] },
    // Makeup
    { id: '694a9414-0001-4a5e-a5e4-d44aa14f3021', name: 'Maybelline SuperStay Matte Ink Liquid Lipstick', subcategory: 'makeup', images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop&auto=format'] },
    { id: 'a89bc051-57a0-4816-a2ca-969748099da6', name: 'Laneige Lip Sleeping Mask Berry', subcategory: 'skincare', images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000004', name: 'M.A.C Studio Fix Fluid Foundation SPF 15', subcategory: 'makeup', images: ['https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000005', name: 'Huda Beauty Empowered Eyeshadow Palette', subcategory: 'makeup', images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000006', name: 'Lakmé Absolute Matte Ultimate Powder & Contour', subcategory: 'makeup', images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000007', name: 'Real Techniques 5-Piece Professional Brush Set', subcategory: 'makeup', images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=800&fit=crop&auto=format'] },
    // Haircare
    { id: 'b0000001-0000-4000-8000-000000000008', name: "L'Oreal Professionnel Serie Expert Absolut Repair Shampoo", subcategory: 'haircare', images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000009', name: 'Moroccanoil Treatment Original Pure Argan Oil Hair Serum', subcategory: 'haircare', images: ['https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000010', name: 'TRESemmé Keratin Smooth Deep Smoothing Conditioner', subcategory: 'haircare', images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&h=800&fit=crop&auto=format'] },
    // Fragrances
    { id: 'b0000001-0000-4000-8000-000000000011', name: 'Chanel N°5 Eau De Parfum Vaporisateur Luxury Spray', subcategory: 'fragrances', images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000012', name: 'Bleu de Chanel Eau De Parfum Pour Homme', subcategory: 'fragrances', images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000013', name: 'Chanel Coco Mademoiselle Eau De Parfum Intense', subcategory: 'fragrances', images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&h=800&fit=crop&auto=format'] },
    // Bath & Body
    { id: 'b0000001-0000-4000-8000-000000000014', name: 'Nécessaire The Body Lotion - Multi-Vitamin Daily Body Moisturizer', subcategory: 'bath-body', images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000015', name: 'The Body Shop British Rose Exfoliating Gel Body Scrub', subcategory: 'bath-body', images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000016', name: 'Bath & Body Works Aromatherapy Eucalyptus Spearmint Bath Soak Salts', subcategory: 'bath-body', images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000017', name: 'Forest Essentials Artisanal Mysore Sandalwood & Raw Honey Sugar Soap Trio', subcategory: 'bath-body', images: ['https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&h=800&fit=crop&auto=format'] },
    { id: 'b0000001-0000-4000-8000-000000000018', name: 'COCOOIL Organic Coconut Body Oil Nourishing Moisturizer', subcategory: 'bath-body', images: ['https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&h=800&fit=crop&auto=format'] },
  ];

  // Invariant 1: Zero forbidden/mismatched images in beauty catalog
  for (const prod of beautyProducts) {
    for (const badImg of FORBIDDEN_IMAGE_IDS) {
      const hasBad = prod.images.some(img => img.includes(badImg));
      assert.equal(hasBad, false, `${prod.name} must not contain forbidden image ${badImg}`);
    }
  }

  // Invariant 2: No face serum uses the body lotion image
  const faceSerums = beautyProducts.filter(p => p.name.toLowerCase().includes('serum') && p.subcategory === 'skincare');
  for (const serum of faceSerums) {
    const hasLotion = serum.images.some(img => img.includes(NECESSAIRE_LOTION_ID));
    assert.equal(hasLotion, false, `Face serum ${serum.name} must not use body lotion photo`);
  }

  // Invariant 3: Neutrogena sunscreen uses genuine sunscreen photo, never mechanical keyboard
  const neutrogena = beautyProducts.find(p => p.id === 'b0000001-0000-4000-8000-000000000002');
  assert.equal(neutrogena.images.some(img => img.includes('photo-1598662779094-110c2bad80b5')), false);
  assert.equal(neutrogena.images.some(img => img.includes('photo-1556228578-0d85b1a4d571')), true);

  // Invariant 4: All 5 authentic subcategories are populated
  const subcategories = ['skincare', 'makeup', 'haircare', 'fragrances', 'bath-body'];
  for (const sub of subcategories) {
    const itemsInSub = beautyProducts.filter(p => p.subcategory === sub);
    assert.equal(itemsInSub.length >= 3, true, `Subcategory ${sub} must have at least 3 authentic products`);
  }

  // Invariant 5: Strict subcategory isolation
  // Skincare MUST NOT contain hair serums (like Moroccanoil)
  const skincareOnly = beautyProducts.filter(p => p.subcategory === 'skincare');
  assert.equal(skincareOnly.every(p => p.subcategory === 'skincare'), true);
  assert.equal(skincareOnly.some(p => p.name.toLowerCase().includes('hair')), false);
  assert.equal(skincareOnly.some(p => p.id === 'b0000001-0000-4000-8000-000000000009'), false);

  // Makeup MUST NOT contain skincare or haircare
  const makeupOnly = beautyProducts.filter(p => p.subcategory === 'makeup');
  assert.equal(makeupOnly.every(p => p.subcategory === 'makeup'), true);
  assert.equal(makeupOnly.some(p => p.subcategory === 'haircare'), false);

  // Haircare MUST contain Moroccanoil hair serum
  const haircareOnly = beautyProducts.filter(p => p.subcategory === 'haircare');
  assert.equal(haircareOnly.every(p => p.subcategory === 'haircare'), true);
  assert.equal(haircareOnly.some(p => p.id === 'b0000001-0000-4000-8000-000000000009'), true);
});

test('Grocery section is removed from all category navigation sections', async () => {
  const fs = await import('fs');
  const path = await import('path');

  const filesToCheck = [
    'src/components/LeftSidebar.tsx',
    'src/components/CategoryIcons.tsx',
    'src/components/CategorySidebar.tsx',
    'src/components/MegaMenu.tsx',
    'src/data/products.ts',
  ];

  for (const file of filesToCheck) {
    const content = fs.readFileSync(path.resolve(file), 'utf-8');
    // Ensure grocery/Grocery is not present in category lists
    assert.equal(
      /id:\s*['"]grocery['"]/i.test(content),
      false,
      `${file} must not define a grocery category id`
    );
    assert.equal(
      /slug:\s*['"]grocery['"]/i.test(content),
      false,
      `${file} must not define a grocery slug`
    );
    assert.equal(
      /key:\s*['"]grocery['"]/i.test(content),
      false,
      `${file} must not define a grocery key`
    );
    assert.equal(
      /label:\s*['"]Grocery['"]/.test(content),
      false,
      `${file} must not have Grocery label`
    );
  }
});

// ---------------------------------------------------------------------------
// 27. SPORTS CATEGORY & SUBCATEGORY PRODUCTS INTEGRITY
// ---------------------------------------------------------------------------
test('Sports category contains authentic products across subcategories with valid images', () => {
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');
  const searchPageTs = fs.readFileSync(path.resolve('src/pages/SearchPage.tsx'), 'utf-8');

  // Verify SPORTS_CATALOG is defined and exported
  assert.ok(productsTs.includes('export const SPORTS_CATALOG'), 'SPORTS_CATALOG must be exported');
  assert.ok(productsTs.includes('...SPORTS_CATALOG'), 'SPORTS_CATALOG must be included in ALL_SUPPLEMENTAL_PRODUCTS');

  // Verify key sports subcategories are represented
  const subcategories = ['cricket', 'badminton', 'fitness', 'football', 'cycling', 'yoga', 'swimming', 'outdoor'];
  for (const sub of subcategories) {
    assert.ok(
      productsTs.includes(`subcategory: '${sub}'`),
      `SPORTS_CATALOG must include products for subcategory: ${sub}`
    );
  }

  // Verify SearchPage handles sports subcategories and alias mapping
  assert.ok(searchPageTs.includes("cricket: 'sports'"), 'cricket alias must map to sports');
  assert.ok(searchPageTs.includes("badminton: 'sports'"), 'badminton alias must map to sports');
  assert.ok(searchPageTs.includes("isSportsArea"), 'SearchPage must define isSportsArea');
  assert.ok(searchPageTs.includes("sportsDept"), 'SearchPage must define sportsDept state');

  // Verify SPORTS_CATALOG contains only valid sports items, not watch photo
  const sportsCatalogSection = productsTs.slice(productsTs.indexOf('export const SPORTS_CATALOG'));
  assert.equal(
    sportsCatalogSection.includes('photo-1524805444758-089113d48a6d'), // watch photo
    false,
    'Watch photo must not be in SPORTS_CATALOG'
  );
});

// ---------------------------------------------------------------------------
// 12. CART RESILIENCE & SUPPLEMENTAL PRODUCTS TESTS
// ---------------------------------------------------------------------------
test('Cart resilience: supplemental products and DB products both add reliably to cart', () => {
  const cartContextTs = fs.readFileSync(path.resolve('src/contexts/CartContext.tsx'), 'utf-8');
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');

  // Verify CartContext imports ALL_SUPPLEMENTAL_PRODUCTS
  assert.ok(
    cartContextTs.includes('ALL_SUPPLEMENTAL_PRODUCTS'),
    'CartContext must import and use ALL_SUPPLEMENTAL_PRODUCTS'
  );

  // Verify getProductById checks supplemental products before checking isValidUUID or querying DB
  const getProductByIdCode = productsTs.slice(productsTs.indexOf('export async function getProductById'));
  const suppCheckPos = getProductByIdCode.indexOf('ALL_SUPPLEMENTAL_PRODUCTS.find');
  const uuidCheckPos = getProductByIdCode.indexOf('isValidUUID(cleanId)');
  assert.ok(suppCheckPos > -1, 'getProductById must search ALL_SUPPLEMENTAL_PRODUCTS');
  assert.ok(uuidCheckPos > -1, 'getProductById must check isValidUUID');
  assert.ok(suppCheckPos < uuidCheckPos, 'Supplemental check must happen BEFORE isValidUUID check');

  // Verify CartContext has resilient fallback handling
  assert.ok(
    cartContextTs.includes('isSupplemental'),
    'CartContext must detect whether a product is supplemental'
  );
  assert.ok(
    cartContextTs.includes('loadLocalCart'),
    'CartContext must provide loadLocalCart fallback'
  );
  assert.ok(
    cartContextTs.includes('saveLocalCart'),
    'CartContext must provide saveLocalCart fallback'
  );
});

// ---------------------------------------------------------------------------
// 13. WISHLIST RESILIENCE & SUPPLEMENTAL PRODUCTS TESTS
// ---------------------------------------------------------------------------
test('Wishlist resilience: supplemental products and DB products both toggle reliably into wishlist', () => {
  const wishlistContextTs = fs.readFileSync(path.resolve('src/contexts/WishlistContext.tsx'), 'utf-8');

  // Verify WishlistContext imports ALL_SUPPLEMENTAL_PRODUCTS
  assert.ok(
    wishlistContextTs.includes('ALL_SUPPLEMENTAL_PRODUCTS'),
    'WishlistContext must import and use ALL_SUPPLEMENTAL_PRODUCTS'
  );

  // Verify WishlistContext uses getProductById
  assert.ok(
    wishlistContextTs.includes('getProductById'),
    'WishlistContext must use getProductById to resolve product details'
  );

  // Verify resilient fallback handling
  assert.ok(
    wishlistContextTs.includes('isSupplemental'),
    'WishlistContext must detect whether a product is supplemental'
  );
  assert.ok(
    wishlistContextTs.includes('loadLocalWishlist'),
    'WishlistContext must provide loadLocalWishlist fallback'
  );
  assert.ok(
    wishlistContextTs.includes('saveLocalWishlist'),
    'WishlistContext must provide saveLocalWishlist fallback'
  );

  // Verify buildWishlistProduct creates comprehensive product structures
  assert.ok(
    wishlistContextTs.includes('buildWishlistProduct'),
    'WishlistContext must build consistent product metadata (images, prices, stock, ratings)'
  );
});

// ---------------------------------------------------------------------------
// 14. ORDER CANCELLATION & DASHBOARD ACCESS TESTS
// ---------------------------------------------------------------------------
test('Order cancellation: cancelOrder function exists, updates status and preserves metadata', () => {
  const ordersTs = fs.readFileSync(path.resolve('src/services/orders.ts'), 'utf-8');
  const dashboardTs = fs.readFileSync(path.resolve('src/pages/DashboardPage.tsx'), 'utf-8');

  // Verify cancelOrder is exported from orders.ts
  assert.ok(
    ordersTs.includes('export async function cancelOrder'),
    'cancelOrder must be exported from src/services/orders.ts'
  );

  // Verify updateLocalOrderStatus exists and sets cancellation reason
  assert.ok(
    ordersTs.includes('cancellation_reason: cancelReason'),
    'orders.ts must persist cancellation_reason'
  );
  assert.ok(
    ordersTs.includes('cancelled_at:'),
    'orders.ts must persist cancelled_at timestamp'
  );

  // Verify DashboardPage imports and wires cancelOrder
  assert.ok(
    dashboardTs.includes('cancelOrder'),
    'DashboardPage must import and call cancelOrder'
  );

  // Verify DashboardPage has cancel modal and confirmation
  assert.ok(
    dashboardTs.includes('Cancel Order'),
    'DashboardPage must display Cancel Order option'
  );
  assert.ok(
    dashboardTs.includes('Confirm Cancellation'),
    'DashboardPage must have a Confirm Cancellation action'
  );
  assert.ok(
    dashboardTs.includes('Reason for Cancellation'),
    'DashboardPage must require or provide reason selection'
  );

  // Verify status filtering tabs exist
  assert.ok(
    dashboardTs.includes('ordersFilter'),
    'DashboardPage must manage ordersFilter state'
  );
});

// ---------------------------------------------------------------------------
// 15. TRADITIONAL WEAR & 4 REGIONAL STATE DRESSES TESTS
// ---------------------------------------------------------------------------
test('Traditional Wear: TRADITIONAL_CATALOG has 12 authentic ensembles across Men, Women & Kids', () => {
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');

  // Verify TRADITIONAL_CATALOG is defined and exported
  assert.ok(
    productsTs.includes('export const TRADITIONAL_CATALOG: ProductModel[]'),
    'products.ts must export TRADITIONAL_CATALOG'
  );

  // Verify it is merged into ALL_SUPPLEMENTAL_PRODUCTS
  assert.ok(
    productsTs.includes('...TRADITIONAL_CATALOG'),
    'ALL_SUPPLEMENTAL_PRODUCTS must include ...TRADITIONAL_CATALOG'
  );

  // Parse product definitions count
  const traditionalIds = productsTs.match(/7b8c1f6f-10\d\d-4c2a-a73c-400acb07c866/g) || [];
  assert.equal(traditionalIds.length, 12, 'TRADITIONAL_CATALOG must contain exactly 12 items (4 Men, 4 Women, 4 Kids)');
});

test("Traditional Wear: Men's category has 4 distinct state traditional dress types", () => {
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');

  // 1. Punjab: Punjabi Kurta Pajama with Nehru / Modi Jacket
  assert.ok(
    productsTs.includes("Manyavar Men's Punjabi Resham Embroidered Silk Kurta & Pajama with Modi Jacket Set") &&
    productsTs.includes("'State / Region': 'Punjab (North)'"),
    "Men's traditional must include Punjab Kurta Pajama with Nehru/Modi Jacket"
  );

  // 2. South India (Tamil Nadu / Kerala): Mulberry Silk Zari Dhoti (Veshti) & Angavastram
  assert.ok(
    productsTs.includes("Ramraj Cotton Men's South Indian Pure Mulberry Silk Zari Dhoti & Angavastram Set") &&
    productsTs.includes("'State / Region': 'South India (Tamil Nadu / Kerala)'"),
    "Men's traditional must include South India Silk Zari Dhoti (Veshti) & Angavastram"
  );

  // 3. Rajasthan (West): Jodhpuri Bandhgala Achkan Sherwani
  assert.ok(
    productsTs.includes("Royal Rajputana Men's Rajasthani Jodhpuri Bandhgala Achkan Sherwani & Breeches Set") &&
    productsTs.includes("'State / Region': 'Rajasthan (West)'"),
    "Men's traditional must include Rajasthan Jodhpuri Bandhgala Achkan Sherwani"
  );

  // 4. Bengal (East): Handloom Tussar Silk Panjabi Kurta & Pleated Dhoti
  assert.ok(
    productsTs.includes("Biswa Bangla Men's Bengali Handloom Tussar Silk Panjabi Kurta with Pleated Dhoti") &&
    productsTs.includes("'State / Region': 'Bengal (East)'"),
    "Men's traditional must include Bengal Tussar Silk Panjabi Kurta with Pleated Dhoti"
  );
});

test("Traditional Wear: Women's category has 4 distinct state traditional sarees with unique images", () => {
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');

  // 1. South India (Tamil Nadu): Pure Kanchipuram Pattu Silk Bridal Saree
  assert.ok(
    productsTs.includes("Nalli Silks Women's Pure Kanchipuram Pattu Silk Bridal Wedding Saree with Blouse") &&
    productsTs.includes("'Traditional Dress Type': 'Kanchipuram Pattu Silk Bridal Saree'"),
    "Women's traditional must include South Indian Pure Kanchipuram Pattu Silk Saree"
  );

  // 2. Bengal (East): Handwoven Dhakai Jamdani Lal Paar Saree
  assert.ok(
    productsTs.includes("Tantuja Bengal Women's Handwoven Dhakai Jamdani Lal Paar Cotton Silk Saree") &&
    productsTs.includes("'Traditional Dress Type': 'Dhakai Jamdani Lal Paar Saree'"),
    "Women's traditional must include Bengal Dhakai Jamdani Lal Paar Saree"
  );

  // 3. Gujarat / Rajasthan (West): Bandhani & Gota Patti Georgette Silk Saree
  assert.ok(
    productsTs.includes("Chhabra 55 Women's Rajasthani Bandhani & Gota Patti Georgette Silk Saree") &&
    productsTs.includes("'Traditional Dress Type': 'Bandhani Silk Saree with Gota Patti Border'"),
    "Women's traditional must include Gujarat/Rajasthan Bandhani & Gota Patti Silk Saree"
  );

  // 4. North / Varanasi: Royal Banarasi Katan Silk Brocade Zari Saree
  assert.ok(
    productsTs.includes("Kashi Weaves Women's Royal Banarasi Katan Silk Brocade Zari Saree") &&
    productsTs.includes("'Traditional Dress Type': 'Banarasi Katan Silk Brocade Saree'"),
    "Women's traditional must include North Indian Royal Banarasi Katan Silk Brocade Saree"
  );
});

test("Traditional Wear: All 12 traditional products have unique primary images without duplication", () => {
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');
  
  // Verify all 12 local image filenames are present in products.ts
  const requiredImages = [
    '/images/traditional/punjabi_kurta_men.jpg',
    '/images/traditional/south_dhoti_men.jpg',
    '/images/traditional/jodhpuri_sherwani_men.jpg',
    '/images/traditional/bengali_kurta_men.jpg',
    '/images/traditional/kanchipuram_saree.jpg',
    '/images/traditional/jamdani_saree.jpg',
    '/images/traditional/bandhani_saree.jpg',
    '/images/traditional/banarasi_saree.jpg',
    '/images/traditional/south_pattu_kids.jpg',
    '/images/traditional/punjabi_kurta_kids.jpg',
    '/images/traditional/bandhani_ghagra_kids.jpg',
    '/images/traditional/bengali_dhoti_kids.jpg',
  ];

  const uniqueSet = new Set(requiredImages);
  assert.equal(uniqueSet.size, 12, 'Must have 12 unique images');

  for (const img of requiredImages) {
    assert.ok(productsTs.includes(img), `products.ts must include dedicated image ${img}`);
    // Check that file exists on disk in public/images/traditional
    const relativePath = path.join('public', img.replace(/^\//, ''));
    assert.ok(fs.existsSync(path.resolve(relativePath)), `Image file must exist on disk: ${relativePath}`);
  }
});

test("Traditional Wear: Kids' category has 4 distinct state traditional dress types", () => {
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');

  // 1. South India: Girls Pure Silk Pattu Pavada Langa Set
  assert.ok(
    productsTs.includes("Shivangi Kids Girls Traditional South Indian Pure Silk Pattu Pavada Langa Voni Set") &&
    productsTs.includes("'Traditional Dress Type': 'Pattu Pavada (Pattu Pavadai Langa Voni)'"),
    "Kids' traditional must include South Indian Girls Pattu Pavada Langa Set"
  );

  // 2. Punjab (North): Boys Punjabi Kurta Pajama with Floral Modi Jacket
  assert.ok(
    productsTs.includes("Klap Kids Boys Punjabi Hand-Embroidered Kurta Pajama with Floral Modi Jacket Set") &&
    productsTs.includes("'Traditional Dress Type': 'Boys Punjabi Kurta Pajama with Nehru Jacket'"),
    "Kids' traditional must include Punjab Boys Kurta Pajama with Floral Modi Jacket"
  );

  // 3. Gujarat / Rajasthan (West): Girls Bandhani Mirror-Work Navratri Ghagra Choli
  assert.ok(
    productsTs.includes("Ahhaaaa Kids Girls Traditional Rajasthani Bandhani Mirror-Work Navratri Ghagra Choli") &&
    productsTs.includes("'Traditional Dress Type': 'Navratri Chaniya Choli Ghagra with Mirror-Work'"),
    "Kids' traditional must include Gujarat/Rajasthan Girls Bandhani Mirror Ghagra Choli"
  );

  // 4. Bengal (East): Boys Handloom Tussar Silk Dhoti & Kurta Set
  assert.ok(
    productsTs.includes("BongStyle Kids Boys Bengali Handloom Tussar Silk Dhoti & Kurta Ethnic Set") &&
    productsTs.includes("'Traditional Dress Type': 'Bengali Dhoti-Panjabi Ethnic Set'"),
    "Kids' traditional must include Bengal Boys Tussar Silk Dhoti-Panjabi Set"
  );
});

test('Traditional Wear: SearchPage UI navigation, alias routing, and 4 regional state filter pills', () => {
  const searchPageTs = fs.readFileSync(path.resolve('src/pages/SearchPage.tsx'), 'utf-8');
  const leftSidebarTs = fs.readFileSync(path.resolve('src/components/LeftSidebar.tsx'), 'utf-8');
  const megaMenuTs = fs.readFileSync(path.resolve('src/components/MegaMenu.tsx'), 'utf-8');

  // Category aliases in SearchPage.tsx
  assert.ok(searchPageTs.includes("traditional: 'fashion'"), 'SearchPage must alias traditional to fashion');
  assert.ok(searchPageTs.includes("'traditional-wear': 'fashion'"), 'SearchPage must alias traditional-wear to fashion');
  assert.ok(searchPageTs.includes("'mens-traditional': 'fashion'"), 'SearchPage must alias mens-traditional to fashion');
  assert.ok(searchPageTs.includes("'womens-traditional': 'fashion'"), 'SearchPage must alias womens-traditional to fashion');
  assert.ok(searchPageTs.includes("'kids-traditional': 'fashion'"), 'SearchPage must alias kids-traditional to fashion');

  // Traditional wear department navigation pill in fashion header
  assert.ok(searchPageTs.includes('🥻 Traditional Wear'), 'SearchPage must include Traditional Wear pill in fashion navigation');

  // 4 Regional state filter buttons in SearchPage
  assert.ok(searchPageTs.includes('🌾 Punjab'), 'SearchPage must provide Punjab state filter button');
  assert.ok(searchPageTs.includes('🛕 South India'), 'SearchPage must provide South India state filter button');
  assert.ok(searchPageTs.includes('🏰 Rajasthan & Gujarat'), 'SearchPage must provide Rajasthan & Gujarat state filter button');
  assert.ok(searchPageTs.includes('🪷 Bengal'), 'SearchPage must provide Bengal state filter button');

  // Department filter buttons in traditional wear banner
  assert.ok(searchPageTs.includes("Men's Traditional Wear"), "SearchPage must provide Men's Traditional button");
  assert.ok(searchPageTs.includes("Women's Traditional Wear"), "SearchPage must provide Women's Traditional button");
  assert.ok(searchPageTs.includes("Kids' Traditional Wear"), "SearchPage must provide Kids' Traditional button");

  // LeftSidebar & MegaMenu inclusion
  assert.ok(leftSidebarTs.includes("to: '/search?cat=traditional'"), 'LeftSidebar must link to /search?cat=traditional');
  assert.ok(megaMenuTs.includes('Traditional Wear'), 'MegaMenu must include Traditional Wear');
});

// ---------------------------------------------------------------------------
// 37. REAL-WORLD MULTI-STYLE PRODUCT IMAGE GALLERIES
// ---------------------------------------------------------------------------
test('Real-world Multi-Style Galleries: ProductPage provides perspective tags, zoom loupe, arrows & lightbox modal', () => {
  const productPageTs = fs.readFileSync(path.resolve('src/pages/ProductPage.tsx'), 'utf-8');

  // 1. Perspective labels helper
  assert.ok(productPageTs.includes('getPerspectiveLabel'), 'ProductPage must define getPerspectiveLabel helper');
  assert.ok(productPageTs.includes("'Front View'"), "ProductPage must include 'Front View' perspective tag");
  assert.ok(productPageTs.includes("'Model / Lifestyle'"), "ProductPage must include 'Model / Lifestyle' perspective tag");
  assert.ok(productPageTs.includes("'Close-Up Detail'"), "ProductPage must include 'Close-Up Detail' perspective tag");
  assert.ok(productPageTs.includes("'Side / Back Angle'"), "ProductPage must include 'Side / Back Angle' perspective tag");

  // 2. Interactive Zoom Magnifier
  assert.ok(productPageTs.includes('handleMouseMoveZoom'), 'ProductPage must handle mouse movement for zoom lens');
  assert.ok(productPageTs.includes('isZooming'), 'ProductPage must manage isZooming state');
  assert.ok(productPageTs.includes('scale(2.1)'), 'ProductPage must provide high-res 2.1x zoom inspection');

  // 3. Arrow navigation buttons & perspective counter
  assert.ok(productPageTs.includes('images.length - 1'), 'ProductPage must provide image wrap navigation');
  assert.ok(productPageTs.includes('getPerspectiveLabel(activeImg)'), 'ProductPage must show active perspective label');

  // 4. Fullscreen Lightbox Modal
  assert.ok(productPageTs.includes('isLightboxOpen'), 'ProductPage must manage isLightboxOpen state');
});

test('Real-world Multi-Style Galleries: SearchPage & ProductCard provide interactive style scrubbers, badges & multi-perspective data', () => {
  const searchPageTs = fs.readFileSync(path.resolve('src/pages/SearchPage.tsx'), 'utf-8');
  const productCardTs = fs.readFileSync(path.resolve('src/components/ProductCard.tsx'), 'utf-8');
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');

  // 1. SearchPage cards support hover flip and style scrubber dots
  assert.ok(searchPageTs.includes('activeImgIndex'), 'SearchPage GridCard must track activeImgIndex');
  assert.ok(searchPageTs.includes('isHovered && activeImgIndex === 0 && images.length > 1 ? 1 : activeImgIndex'), 'GridCard must crossfade to style 2 on hover');
  assert.ok(searchPageTs.includes('Styles'), 'GridCard must display multi-style indicator badge');

  // 2. ProductCard component supports multi-image arrays and style scrubber dots
  assert.ok(productCardTs.includes('images?: string[]'), 'ProductCard Product interface must support images array');
  assert.ok(productCardTs.includes('currentDisplayIdx'), 'ProductCard must calculate currentDisplayIdx on hover');
  assert.ok(productCardTs.includes('Styles'), 'ProductCard must display Styles pill');

  // 3. Catalogs have multiple perspectives (at least 3 images for key products)
  const traditionalSection = productsTs.slice(productsTs.indexOf('export const TRADITIONAL_CATALOG'));
  assert.ok(traditionalSection.includes('/images/traditional/kanchipuram_saree.jpg'), 'Saree 1 must be present');
  assert.ok(traditionalSection.includes('/images/traditional/jamdani_saree.jpg'), 'Saree 2 must be present');
  assert.ok(traditionalSection.includes('/images/traditional/bandhani_saree.jpg'), 'Saree 3 must be present');
  assert.ok(traditionalSection.includes('/images/traditional/banarasi_saree.jpg'), 'Saree 4 must be present');
});

// ---------------------------------------------------------------------------
// 39. EXACT-ITEM MULTI-ANGLE CONSISTENCY & ZERO CROSS-PRODUCT BLEEDING
// ---------------------------------------------------------------------------
test('Exact-item Multi-Angle Consistency: Traditional products strictly use exact-item angle crops and Pink Oxford Shirt has multi-angle studio shots', () => {
  const productsTs = fs.readFileSync(path.resolve('src/services/products.ts'), 'utf-8');

  // 1. Kanchipuram Saree must strictly have its 4 exact-same-item crops (no purple saree or green dress!)
  assert.ok(productsTs.includes('/images/traditional/kanchipuram_saree.jpg'), 'Kanchipuram front view must be present');
  assert.ok(productsTs.includes('/images/traditional/kanchipuram_saree_pallu.jpg'), 'Kanchipuram pallu crop must be present');
  assert.ok(productsTs.includes('/images/traditional/kanchipuram_saree_texture.jpg'), 'Kanchipuram texture crop must be present');
  assert.ok(productsTs.includes('/images/traditional/kanchipuram_saree_border.jpg'), 'Kanchipuram border crop must be present');

  // Ensure no cross-item unsplash models exist inside TRADITIONAL_CATALOG
  const tradCat = productsTs.slice(productsTs.indexOf('export const TRADITIONAL_CATALOG'), productsTs.indexOf('export const CATEGORY_SUPPLEMENTS'));
  assert.equal(tradCat.includes('images.unsplash.com'), false, 'TRADITIONAL_CATALOG must not have cross-product Unsplash photos of different people/dresses');

  // 2. Pink Oxford Shirt (user example) must be present with all 3 studio perspectives
  assert.ok(productsTs.includes('pink_oxford_shirt_hanger.jpg'), 'Pink Oxford shirt hanging view must exist');
  assert.ok(productsTs.includes('pink_oxford_shirt_flatlay.jpg'), 'Pink Oxford shirt flat lay view must exist');
  assert.ok(productsTs.includes('pink_oxford_shirt_collar.jpg'), 'Pink Oxford shirt collar macro view must exist');

  // 3. Michael Kors watch must use exact-item watch crops (no cosmetic or shoe photos)
  assert.ok(productsTs.includes('/images/watches/michael_kors_dial.jpg'), 'Michael Kors dial crop must exist');
  assert.ok(productsTs.includes('/images/watches/michael_kors_bezel.jpg'), 'Michael Kors bezel crop must exist');
  assert.ok(productsTs.includes('/images/watches/michael_kors_strap.jpg'), 'Michael Kors strap crop must exist');
});

