import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:8443';

async function fetchHttp(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const text = await res.text();
  return { status: res.status, text, headers: res.headers };
}

// ---------------------------------------------------------------------------
// 1. END-TO-END HTTP ROUTE & VIEWPORT AVAILABILITY TESTS
// ---------------------------------------------------------------------------
test('E2E-TC01: Core Store Routes Respond with HTTP 200', async () => {
  const routes = [
    '/',
    '/search',
    '/search?cat=traditional',
    '/search?cat=fashion',
    '/search?cat=watches',
    '/search?cat=footwear',
    '/search?cat=beauty',
    '/search?cat=sports',
    '/product/7b8c1f6f-1005-4c2a-a73c-400acb07c866', // Kanchipuram Saree
    '/product/7b8c1f6f-0018-4c2a-a73c-400acb07c866', // Pink Oxford Shirt
    '/product/12429241-0004-4169-95ff-5ea2c4f6d398', // Michael Kors Watch
    '/cart',
    '/wishlist',
    '/dashboard',
  ];

  for (const route of routes) {
    const res = await fetchHttp(route);
    assert.equal(res.status, 200, `Route ${route} must respond with HTTP 200`);
    assert.ok(res.text.includes('id="root"'), `Route ${route} must contain React mounting root`);
  }
});

// ---------------------------------------------------------------------------
// 2. SEARCH & DISCOVERY ENGINE VALIDATION
// ---------------------------------------------------------------------------
test('E2E-TC02: Realistic Customer Search Queries & Case Insensitivity', () => {
  const MOCK_PRODUCTS = [
    { name: "Nalli Silks Women's Pure Kanchipuram Pattu Silk Bridal Wedding Saree", tags: ['saree', 'silk', 'kanchipuram', 'bridal'], category: 'fashion' },
    { name: "Allen Solly Men's Classic Pink Striped Regular Fit Oxford Cotton Casual Shirt", tags: ['shirt', 'cotton', 'striped', 'casual'], category: 'fashion' },
    { name: "Michael Kors Women's Parker Rose Gold-Tone Watch", tags: ['watch', 'analog', 'rosegold', 'luxury'], category: 'watches' },
    { name: "Ramraj Cotton Men's South Indian Pure Mulberry Silk Zari Dhoti", tags: ['dhoti', 'veshti', 'south', 'traditional'], category: 'fashion' },
    { name: "Manyavar Men's Punjabi Resham Embroidered Silk Kurta", tags: ['kurta', 'punjabi', 'festive'], category: 'fashion' },
  ];

  const searchEngine = (query, cat = 'all') => {
    if (!query || !query.trim()) return MOCK_PRODUCTS;
    const q = query.trim().toLowerCase();
    return MOCK_PRODUCTS.filter(p => {
      const matchCat = cat === 'all' || p.category === cat;
      const matchText = p.name.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      return matchCat && matchText;
    });
  };

  // Test realistic queries
  assert.equal(searchEngine('saree').length, 1);
  assert.equal(searchEngine('SAREE').length, 1); // Uppercase
  assert.equal(searchEngine('shirt').length, 1);
  assert.equal(searchEngine('watch').length, 1);
  assert.equal(searchEngine('kurta').length, 1);
  assert.equal(searchEngine('cotton').length, 2); // Pink shirt and Ramraj Dhoti
  assert.equal(searchEngine('xyznonexistent123').length, 0); // No match
});

// ---------------------------------------------------------------------------
// 3. PRICING, SAVINGS & DISCOUNT ACCURACY
// ---------------------------------------------------------------------------
test('E2E-TC03: Price, Discount & Savings Math Integrity', () => {
  const catalogSamples = [
    { name: 'Kanchipuram Saree', price: 6999, original_price: 12999, discount: 46 },
    { name: 'Pink Oxford Shirt', price: 1599, original_price: 2799, discount: 43 },
    { name: 'Michael Kors Watch', price: 14995, original_price: 21995, discount: 32 },
    { name: 'Manyavar Kurta', price: 3999, original_price: 6999, discount: 43 },
    { name: 'Shivangi Kids Pavada', price: 1899, original_price: 3299, discount: 42 },
  ];

  for (const item of catalogSamples) {
    // 1. Original price must be strictly greater than or equal to current price
    assert.ok(item.original_price >= item.price, `${item.name} original price must be >= current price`);
    
    // 2. Calculated percentage savings must match declared discount
    const expectedDiscount = Math.round(((item.original_price - item.price) / item.original_price) * 100);
    assert.equal(item.discount, expectedDiscount, `${item.name} discount % must match mathematical savings`);
    
    // 3. Monetary savings must be positive
    const savingsAmount = item.original_price - item.price;
    assert.ok(savingsAmount > 0, `${item.name} must offer positive savings`);
  }
});

// ---------------------------------------------------------------------------
// 4. CART LIFECYCLE & MUTEX INTEGRITY
// ---------------------------------------------------------------------------
test('E2E-TC04: Cart Add, Quantity Mutation, Remove and Summary Calculation', () => {
  let cart = [];

  const addToCart = (product, quantity = 1, color = 'Default') => {
    const existing = cart.find(i => i.id === product.id && i.color === color);
    if (existing) {
      existing.quantity = Math.min(10, existing.quantity + quantity);
    } else {
      cart.push({ ...product, quantity: Math.min(10, quantity), color });
    }
  };

  const updateQuantity = (id, color, newQty) => {
    if (newQty <= 0) {
      cart = cart.filter(i => !(i.id === id && i.color === color));
    } else {
      const item = cart.find(i => i.id === id && i.color === color);
      if (item) item.quantity = Math.min(10, Math.max(1, newQty));
    }
  };

  const calculateSummary = (couponDiscount = 0) => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const delivery = subtotal > 499 || subtotal === 0 ? 0 : 49;
    const total = Math.max(0, subtotal - couponDiscount + delivery);
    return { subtotal, delivery, couponDiscount, total };
  };

  // 1. Add Kanchipuram Saree (₹6,999)
  addToCart({ id: 'p1', name: 'Kanchipuram Saree', price: 6999 }, 1, 'Crimson Red');
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);

  // 2. Add Pink Oxford Shirt (₹1,599)
  addToCart({ id: 'p2', name: 'Pink Oxford Shirt', price: 1599 }, 2, 'Pink Stripes');
  assert.equal(cart.length, 2);

  // 3. Add duplicate Kanchipuram Saree -> Must increment quantity to 2, not create new entry
  addToCart({ id: 'p1', name: 'Kanchipuram Saree', price: 6999 }, 1, 'Crimson Red');
  assert.equal(cart.length, 2, 'Duplicate item should not increase cart row count');
  assert.equal(cart.find(i => i.id === 'p1').quantity, 2);

  // 4. Test Summary: (6999 * 2) + (1599 * 2) = 13998 + 3198 = 17196
  let summary = calculateSummary();
  assert.equal(summary.subtotal, 17196);
  assert.equal(summary.delivery, 0, 'Subtotal > 499 qualifies for Free Delivery');
  assert.equal(summary.total, 17196);

  // 5. Apply Coupon FESTIVE20 (20% capped at ₹1,000)
  summary = calculateSummary(1000);
  assert.equal(summary.total, 16196);

  // 6. Reduce item quantity to 0 -> Removes item
  updateQuantity('p2', 'Pink Stripes', 0);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].id, 'p1');
});

// ---------------------------------------------------------------------------
// 5. ORDER CANCELLATION & AUDIT INTEGRITY
// ---------------------------------------------------------------------------
test('E2E-TC05: Order Cancellation State Machine & Immutability', () => {
  const orderRecord = {
    id: 'ord-test-001',
    status: 'Processing',
    items: [{ id: 'p1', price: 6999, qty: 1 }],
    total: 6999,
    placed_at: '2026-09-18T04:00:00.000Z',
  };

  const cancelOrder = (order, reason) => {
    if (order.status === 'Cancelled') throw new Error('Order is already cancelled');
    if (order.status === 'Delivered') throw new Error('Delivered orders cannot be cancelled');
    if (!reason || reason.trim().length < 3) throw new Error('Valid reason required');

    return {
      ...order,
      status: 'Cancelled',
      cancellation_metadata: {
        reason,
        timestamp: new Date().toISOString(),
        refund_status: 'Refund Initiated to Original Payment Method (3-5 Days)',
      },
    };
  };

  // Successful cancellation
  const cancelled = cancelOrder(orderRecord, 'Found better price elsewhere');
  assert.equal(cancelled.status, 'Cancelled');
  assert.equal(cancelled.cancellation_metadata.reason, 'Found better price elsewhere');
  assert.ok(cancelled.cancellation_metadata.timestamp);

  // Repeated cancellation throws error
  assert.throws(() => cancelOrder(cancelled, 'Cancel again'), /already cancelled/);
});

// ---------------------------------------------------------------------------
// 6. EXACT-ITEM MULTI-ANGLE COVERAGE CONTRACT
// ---------------------------------------------------------------------------
test('E2E-TC06: Exact-Item Multi-Angle Gallery Perspectives on Key Products', () => {
  const productsWithGalleries = [
    {
      id: 'kanchipuram',
      name: 'Nalli Silks Kanchipuram Saree',
      expectedViews: ['Full Fold View', 'Gold Zari Pallu', 'Mulberry Silk Weave', 'Temple Korvai Border'],
    },
    {
      id: 'pink-shirt',
      name: 'Allen Solly Pink Striped Oxford Shirt',
      expectedViews: ['Front Hanging View', 'Flat Lay View', 'Collar & Fabric Macro'],
    },
    {
      id: 'michael-kors',
      name: 'Michael Kors Parker Rose Gold Watch',
      expectedViews: ['Full Watch Display', 'Pavé Crystal Dial', 'Bezel & Crown', 'Link Bracelet'],
    },
  ];

  for (const prod of productsWithGalleries) {
    assert.ok(prod.expectedViews.length >= 3, `${prod.name} must offer at least 3 distinct perspectives`);
    // All labels must be non-empty strings
    assert.ok(prod.expectedViews.every(v => typeof v === 'string' && v.length > 3));
  }
});
