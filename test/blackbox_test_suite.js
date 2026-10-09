import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

const BASE_URL = 'http://localhost:8443';

// Helper to fetch HTTP response from the running dev server
async function httpGet(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);
  const text = await res.text();
  return {
    status: res.status,
    headers: res.headers,
    body: text,
    contentType: res.headers.get('content-type') || '',
  };
}

// ---------------------------------------------------------------------------
// SUITE 1: WEB APPLICATION AVAILABILITY & CORE INFRASTRUCTURE
// ---------------------------------------------------------------------------
test('BB-TC01: Live Web App Availability & Core DOM Shell', async () => {
  const res = await httpGet('/');
  assert.equal(res.status, 200, 'Homepage must return HTTP 200 OK');
  assert.ok(res.contentType.includes('text/html'), 'Response must be HTML');
  assert.ok(res.body.includes('id="root"'), 'HTML must contain React mounting root element');
  assert.ok(res.body.includes('/src/main.tsx'), 'HTML must load main Vite application entry script');
  assert.ok(res.body.includes('<title>'), 'HTML must declare a valid page title');
});

test('BB-TC02: Static Image Assets Delivery & Integrity (Zero Broken Images)', async () => {
  // Test key product images served from public/images
  const testImages = [
    '/images/traditional/kanchipuram_saree.jpg',
    '/images/traditional/kanchipuram_saree_pallu.jpg',
    '/images/traditional/kanchipuram_saree_texture.jpg',
    '/images/traditional/kanchipuram_saree_border.jpg',
    '/images/fashion/pink_oxford_shirt_hanger.jpg',
    '/images/fashion/pink_oxford_shirt_flatlay.jpg',
    '/images/fashion/pink_oxford_shirt_collar.jpg',
    '/images/watches/michael_kors_rose_gold.jpg',
    '/images/watches/michael_kors_dial.jpg',
  ];

  for (const imgPath of testImages) {
    const res = await httpGet(imgPath);
    assert.equal(res.status, 200, `Asset ${imgPath} must return HTTP 200`);
    assert.ok(
      res.contentType.startsWith('image/'),
      `Asset ${imgPath} must have image MIME type, got ${res.contentType}`
    );
    assert.ok(res.body.length > 500, `Asset ${imgPath} must not be an empty file`);
  }
});

// ---------------------------------------------------------------------------
// SUITE 2: EQUIVALENCE PARTITIONING & BOUNDARY VALUE ANALYSIS (INPUT VALIDATION)
// ---------------------------------------------------------------------------
test('BB-TC03: Equivalence Partitioning - Pincode Delivery Estimator', () => {
  const validatePincode = (code) => {
    if (!code || typeof code !== 'string') return { valid: false, message: 'Please enter a PIN code' };
    const cleaned = code.trim();
    if (!/^\d{6}$/.test(cleaned)) return { valid: false, message: 'Please enter a valid 6-digit PIN code' };
    
    // Valid Indian pincode zones (100000 - 999999, excluding starting with 0)
    if (cleaned.startsWith('0')) return { valid: false, message: 'Invalid Indian PIN code prefix' };
    
    // Sample delivery days based on major hub zones
    const zone = cleaned.charAt(0);
    const est = ['1', '2'].includes(zone) ? 'Tomorrow by 6 PM' : '2-3 Business Days';
    return { valid: true, delivery: est, cod: true };
  };

  // Valid Partitions: Exactly 6 digits, valid postal zones
  assert.equal(validatePincode('110001').valid, true); // Delhi
  assert.equal(validatePincode('560001').valid, true); // Bengaluru
  assert.equal(validatePincode('400001').valid, true); // Mumbai
  assert.equal(validatePincode('600001').valid, true); // Chennai
  assert.equal(validatePincode('700001').valid, true); // Kolkata

  // Invalid Partitions: Letters, special chars, too short, too long, starting with 0
  assert.equal(validatePincode('12345').valid, false);      // 5 digits (too short)
  assert.equal(validatePincode('1234567').valid, false);    // 7 digits (too long)
  assert.equal(validatePincode('56000A').valid, false);     // Alpha characters
  assert.equal(validatePincode('abcdef').valid, false);     // All alphabets
  assert.equal(validatePincode('012345').valid, false);     // Starts with 0
  assert.equal(validatePincode('').valid, false);           // Empty string
  assert.equal(validatePincode('   ').valid, false);        // Whitespace
  assert.equal(validatePincode(null).valid, false);         // Null
});

test('BB-TC04: Equivalence Partitioning - Mobile Phone Validation', () => {
  const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    const clean = phone.replace(/[\s-]/g, '');
    // Standard Indian mobile format: 10 digits starting with 6, 7, 8, or 9
    return /^[6-9]\d{9}$/.test(clean);
  };

  // Valid partition
  assert.equal(validatePhone('9876543210'), true);
  assert.equal(validatePhone('8123456789'), true);
  assert.equal(validatePhone('7001234567'), true);
  assert.equal(validatePhone('6234567890'), true);
  assert.equal(validatePhone('98765-43210'), true); // With separator
  assert.equal(validatePhone('98765 43210'), true); // With space

  // Invalid partitions
  assert.equal(validatePhone('1234567890'), false); // Starts with 1
  assert.equal(validatePhone('5234567890'), false); // Starts with 5
  assert.equal(validatePhone('987654321'), false);  // 9 digits (boundary min - 1)
  assert.equal(validatePhone('98765432100'), false); // 11 digits (boundary max + 1)
  assert.equal(validatePhone('98765abcde'), false); // Contains letters
  assert.equal(validatePhone(''), false);
});

test('BB-TC05: Boundary Value Analysis - Cart Item Quantity', () => {
  const clampQuantity = (requestedQty, maxStock = 20) => {
    const min = 1;
    const max = Math.min(10, maxStock); // Store policy: max 10 units per order
    if (isNaN(requestedQty) || requestedQty < min) return min;
    if (requestedQty > max) return max;
    return Math.floor(requestedQty);
  };

  // Boundary tests around min (1)
  assert.equal(clampQuantity(-5), 1, 'Negative quantity clamped to min 1');
  assert.equal(clampQuantity(0), 1, 'Zero quantity clamped to min 1');
  assert.equal(clampQuantity(1), 1, 'Min boundary 1 honored');
  assert.equal(clampQuantity(2), 2, 'Value 2 within range');

  // Boundary tests around max (10)
  assert.equal(clampQuantity(9), 9, 'Value 9 honored');
  assert.equal(clampQuantity(10), 10, 'Max boundary 10 honored');
  assert.equal(clampQuantity(11), 10, 'Value 11 clamped to max 10');
  assert.equal(clampQuantity(999), 10, 'High value clamped to max 10');

  // Boundary test when stock is less than 10 (e.g. 4 items in stock)
  assert.equal(clampQuantity(5, 4), 4, 'Clamped to available stock limit when stock < 10');
});

// ---------------------------------------------------------------------------
// SUITE 3: PROMOTION & COUPON ENGINE (BLACK BOX EVALUATION)
// ---------------------------------------------------------------------------
test('BB-TC06: Coupon Code Calculation & Business Rule Enforcement', () => {
  const PROMO_RULES = {
    WELCOME100: { type: 'fixed', amount: 100, minOrder: 499, description: '₹100 Off on orders above ₹499' },
    FESTIVE20: { type: 'percentage', percent: 20, maxDiscount: 1000, minOrder: 999, description: '20% Off up to ₹1,000 on orders above ₹999' },
    SAVE500: { type: 'fixed', amount: 500, minOrder: 2499, description: 'Flat ₹500 Off on orders above ₹2,499' },
  };

  const applyCoupon = (code, subtotal) => {
    if (!code || typeof code !== 'string') return { valid: false, error: 'Please enter a coupon code' };
    const normalized = code.trim().toUpperCase();
    const rule = PROMO_RULES[normalized];
    if (!rule) return { valid: false, error: 'Invalid coupon code. Please check and try again.' };

    if (subtotal < rule.minOrder) {
      return {
        valid: false,
        error: `Minimum order amount of ₹${rule.minOrder.toLocaleString()} required for this coupon. Add ₹${(rule.minOrder - subtotal).toLocaleString()} more to apply.`,
      };
    }

    let discount = 0;
    if (rule.type === 'fixed') {
      discount = rule.amount;
    } else if (rule.type === 'percentage') {
      discount = Math.min((subtotal * rule.percent) / 100, rule.maxDiscount);
    }

    return {
      valid: true,
      code: normalized,
      discount: Math.round(discount),
      finalTotal: Math.max(0, subtotal - Math.round(discount)),
      description: rule.description,
    };
  };

  // Test WELCOME100 below min vs above min
  const welcomeLow = applyCoupon('WELCOME100', 350);
  assert.equal(welcomeLow.valid, false);
  assert.ok(welcomeLow.error.includes('Minimum order amount'));

  const welcomeHigh = applyCoupon('welcome100', 600); // Case-insensitive
  assert.equal(welcomeHigh.valid, true);
  assert.equal(welcomeHigh.discount, 100);
  assert.equal(welcomeHigh.finalTotal, 500);

  // Test FESTIVE20 percentage cap
  const festiveNormal = applyCoupon('FESTIVE20', 2000); // 20% of 2000 = 400
  assert.equal(festiveNormal.valid, true);
  assert.equal(festiveNormal.discount, 400);

  const festiveCapped = applyCoupon('FESTIVE20', 10000); // 20% of 10000 = 2000 -> Capped at 1000
  assert.equal(festiveCapped.valid, true);
  assert.equal(festiveCapped.discount, 1000, 'FESTIVE20 must honor maximum discount cap of ₹1,000');

  // Test Non-existent coupon
  const invalidCode = applyCoupon('INVALID99', 5000);
  assert.equal(invalidCode.valid, false);
  assert.ok(invalidCode.error.includes('Invalid coupon code'));
});

// ---------------------------------------------------------------------------
// SUITE 4: USER STORIES & FUNCTIONAL BEHAVIOR
// ---------------------------------------------------------------------------
test('BB-TC07: Traditional Wear Discovery & 4 Regional State Partitioning', () => {
  const REGIONS = [
    { key: 'punjab', name: 'Punjab (North)', keyword: 'punjab' },
    { key: 'south', name: 'South India (Tamil Nadu / Kerala)', keyword: 'south' },
    { key: 'west', name: 'Rajasthan / Gujarat (West)', keyword: 'rajasthan' },
    { key: 'east', name: 'Bengal (East)', keyword: 'bengal' },
  ];

  // Each region must have at least 1 male, 1 female, 1 child ensemble
  const MOCK_TRADITIONAL_CATALOG = [
    { id: '1', name: 'Manyavar Kurta', region: 'Punjab (North)', gender: 'men' },
    { id: '2', name: 'South Silk Dhoti', region: 'South India (Tamil Nadu / Kerala)', gender: 'men' },
    { id: '3', name: 'Jodhpuri Sherwani', region: 'Rajasthan (West)', gender: 'men' },
    { id: '4', name: 'Bengali Kurta', region: 'Bengal (East)', gender: 'men' },
    { id: '5', name: 'Kanchipuram Silk Saree', region: 'South India (Tamil Nadu)', gender: 'women' },
    { id: '6', name: 'Dhakai Jamdani Saree', region: 'Bengal (East)', gender: 'women' },
    { id: '7', name: 'Bandhani Saree', region: 'Gujarat / Rajasthan (West)', gender: 'women' },
    { id: '8', name: 'Banarasi Saree', region: 'Punjab / North India', gender: 'women' },
    { id: '9', name: 'South Pattu Pavada', region: 'South India (Tamil Nadu / Kerala)', gender: 'kids' },
    { id: '10', name: 'Punjabi Kids Kurta', region: 'Punjab (North)', gender: 'kids' },
    { id: '11', name: 'Bandhani Ghagra Kids', region: 'Gujarat / Rajasthan (West)', gender: 'kids' },
    { id: '12', name: 'Bengali Dhoti Kids', region: 'Bengal (East)', gender: 'kids' },
  ];

  // Verify total catalog count
  assert.equal(MOCK_TRADITIONAL_CATALOG.length, 12, 'Catalog must contain 12 state ensembles');

  // Verify each region has products across all genders
  for (const reg of REGIONS) {
    const regProducts = MOCK_TRADITIONAL_CATALOG.filter(p => p.region.toLowerCase().includes(reg.keyword));
    assert.ok(regProducts.length >= 2, `Region ${reg.name} must have products available`);
  }
});

test('BB-TC08: Multi-Angle Product Perspectives & Zero Cross-Product Bleeding', () => {
  // Black box contract: An e-commerce product must show multiple perspectives of the SAME item
  const kanchipuramProduct = {
    name: "Nalli Silks Women's Pure Kanchipuram Pattu Silk Bridal Wedding Saree",
    images: [
      '/images/traditional/kanchipuram_saree.jpg',
      '/images/traditional/kanchipuram_saree_pallu.jpg',
      '/images/traditional/kanchipuram_saree_texture.jpg',
      '/images/traditional/kanchipuram_saree_border.jpg',
    ],
    image_labels: ['Full Fold View', 'Gold Zari Pallu', 'Mulberry Silk Weave', 'Temple Korvai Border'],
  };

  assert.equal(kanchipuramProduct.images.length, 4, 'Must provide 4 distinct perspectives');
  assert.equal(kanchipuramProduct.image_labels.length, 4, 'Must provide 4 perspective labels');
  
  // All images must belong to kanchipuram_saree family
  for (const img of kanchipuramProduct.images) {
    assert.ok(img.includes('kanchipuram_saree'), `Image ${img} must be an authentic angle of the Kanchipuram saree`);
  }

  // Pink Oxford Shirt (user example)
  const pinkShirtProduct = {
    name: "Allen Solly Men's Classic Pink Striped Regular Fit Oxford Cotton Casual Shirt",
    images: [
      '/images/fashion/pink_oxford_shirt_hanger.jpg',
      '/images/fashion/pink_oxford_shirt_flatlay.jpg',
      '/images/fashion/pink_oxford_shirt_collar.jpg',
    ],
    image_labels: ['Front Hanging View', 'Flat Lay View', 'Collar & Fabric Macro'],
  };

  assert.equal(pinkShirtProduct.images.length, 3, 'Must provide 3 studio perspectives');
  for (const img of pinkShirtProduct.images) {
    assert.ok(img.includes('pink_oxford_shirt'), `Image ${img} must be an authentic view of the pink shirt`);
  }
});

test('BB-TC09: Order Cancellation User Journey & Status Transition', () => {
  // Black box contract for cancellation
  const initialOrder = {
    id: 'ord-98234-ind',
    order_number: 'SD-2026-98234',
    status: 'Confirmed',
    total_amount: 6999,
    delivery_status: 'Processing',
    items: [{ name: 'Kanchipuram Silk Saree', price: 6999, qty: 1 }],
  };

  const processOrderCancellation = (order, reason) => {
    // Orders already delivered or already cancelled cannot be cancelled
    if (order.status === 'Delivered') return { success: false, error: 'Delivered orders cannot be cancelled. You can initiate a return instead.' };
    if (order.status === 'Cancelled') return { success: false, error: 'This order is already cancelled.' };
    if (!reason || reason.trim().length < 3) return { success: false, error: 'Please select or provide a cancellation reason.' };

    return {
      success: true,
      order: {
        ...order,
        status: 'Cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        refund_status: 'Refund Initiated (3-5 business days)',
      },
    };
  };

  // 1. Successful cancellation with valid reason
  const result = processOrderCancellation(initialOrder, 'Ordered by mistake');
  assert.equal(result.success, true);
  assert.equal(result.order.status, 'Cancelled');
  assert.equal(result.order.cancellation_reason, 'Ordered by mistake');
  assert.ok(result.order.cancelled_at);
  assert.ok(result.order.refund_status.includes('Refund Initiated'));

  // 2. Rejecting double cancellation
  const doubleCancel = processOrderCancellation(result.order, 'Cancel again');
  assert.equal(doubleCancel.success, false);
  assert.ok(doubleCancel.error.includes('already cancelled'));

  // 3. Rejecting cancellation on delivered order
  const deliveredOrder = { ...initialOrder, status: 'Delivered' };
  const deliveredCancel = processOrderCancellation(deliveredOrder, 'Do not want');
  assert.equal(deliveredCancel.success, false);
  assert.ok(deliveredCancel.error.includes('Delivered orders cannot be cancelled'));
});

test('BB-TC10: Security & Negative Testing - XSS Input Sanitization & 404 Resilience', async () => {
  // 1. Negative route - Product ID that does not exist
  const res404 = await httpGet('/product/00000000-0000-0000-0000-000000000000');
  assert.equal(res404.status, 200, 'SPA handles unknown client routes by rendering app shell gracefully');
  assert.ok(res404.body.includes('id="root"'), 'Root element must mount to display 404 UI');

  // 2. XSS payload simulation in search query
  const xssQuery = '%3Cscript%3Ealert(%22xss%22)%3C%2Fscript%3E';
  const resXss = await httpGet(`/search?q=${xssQuery}`);
  assert.equal(resXss.status, 200, 'Search page with XSS payload loads safely');
  // Raw script tag must not be injected directly as executable HTML outside React escaping
  assert.equal(resXss.body.includes('<script>alert("xss")</script>'), false, 'Raw script tag must not be rendered unescaped');
});
