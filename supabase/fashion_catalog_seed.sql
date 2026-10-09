-- ==============================================================================
-- FASHION CATALOG SEED & IMAGE CORRECTION SCRIPT
-- Snapdeal Production Database Fix
-- Category: Fashion (id: '7b8c1f6f-dc02-4c2a-a73c-400acb07c866')
-- ==============================================================================

-- 1. Correct image URLs for Levi's Men 511 Slim Fit Jeans (replace phone photos with authentic denim)
UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = '4ded2d6b-19b0-457e-aeeb-47553c3227ec';

-- 2. Correct images for other non-electronic items mistakenly given smartphone images
UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = 'f6516ec2-7e88-42b0-ae13-36e35f8f3302'; -- Nike Air Max 270

UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = '8daa6745-7153-4ea8-ad05-5bf9e87fc450'; -- Puma RS-X Reinvention

UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1608248597359-25095d38b556?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = 'c601dc3b-f07e-4cd9-a122-b12d1fcf8924'; -- Minimalist Serum

UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = 'a89bc051-57a0-4816-a2ca-969748099da6'; -- Laneige Mask

UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = 'd5483f74-4c71-4d4b-a5f0-4f3cae9bd726'; -- Prestige Mixer

UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = '4e9c1493-fc84-4dda-a374-e993c27b1076'; -- Milton Flask

UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = '623a017a-af7d-47e5-a370-7a48a11b2810'; -- Boldfit Yoga Mat

UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = 'ee51bead-0d23-4d2b-a114-5b0ac69bb639'; -- Atomic Habits

UPDATE public.products
SET images = ARRAY[
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=800&fit=crop&auto=format'
]::TEXT[]
WHERE id = 'a2e02bf9-a6df-4d35-a8a9-0e13445217ae'; -- Psychology of Money

-- 3. Insert rich authentic commercial Fashion Apparel Products into public.products
INSERT INTO public.products (
  id,
  category_id,
  name,
  brand,
  description,
  price,
  original_price,
  discount,
  stock_quantity,
  seller,
  images,
  colors,
  specs,
  offers
) VALUES
(
  '7b8c1f6f-0001-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'Zara Men''s Slim Fit Linen Casual Shirt',
  'Zara',
  'Breathable pure linen slim fit shirt for men. Crafted from lightweight premium European flax linen for effortless sophistication in warm weather.',
  1990,
  2990,
  33,
  45,
  'Zara Retail India',
  ARRAY[
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Crisp White', 'Sky Blue', 'Olive Green']::TEXT[],
  '{"Fabric":"100% European Linen","Fit":"Slim Fit","Sleeve":"Long Sleeve","Pattern":"Solid","Collar":"Spread Collar"}'::JSONB,
  '[{"text":"Buy 2 get 10% instant discount"},{"text":"Flat ₹200 off on first fashion purchase"}]'::JSONB
),
(
  '7b8c1f6f-0002-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'FabIndia Women''s Pure Cotton Hand-Block Printed Kurta',
  'FabIndia',
  'Authentic Indian hand-block printed straight kurta in breathable pure cotton. Features traditional artisan floral motifs and elegant side slits.',
  1499,
  2499,
  40,
  50,
  'FabIndia Overseas Pvt Ltd',
  ARRAY[
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Indigo Blue', 'Maroon Red', 'Mustard Yellow']::TEXT[],
  '{"Fabric":"100% Pure Cambric Cotton","Fit":"Straight Fit","Length":"Calf Length","Neck":"Mandarin Notch Neck"}'::JSONB,
  '[{"text":"Festive Special: Flat ₹150 off with code FASHION150"}]'::JSONB
),
(
  '7b8c1f6f-0003-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'Levi''s Men''s Trucker Denim Jacket',
  'Levi''s',
  'The original trucker denim jacket from Levi''s. Built with rugged 100% cotton denim, button-flap chest pockets, and side welt pockets for timeless American style.',
  3499,
  5999,
  42,
  30,
  'Levi Strauss India',
  ARRAY[
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Vintage Stonewash Blue', 'Washed Black', 'Raw Dark Indigo']::TEXT[],
  '{"Fabric":"Heavyweight 100% Cotton Denim","Closure":"Metal Shank Buttons","Fit":"Standard Trucker Fit"}'::JSONB,
  '[{"text":"Bank Offer: 10% Instant Discount on HDFC Cards"}]'::JSONB
),
(
  '7b8c1f6f-0004-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'H&M Women''s Floral Print Wrap Summer Dress',
  'H&M',
  'A breezy wrap dress in airy woven viscose fabric with a delicate floral print. Features a deep V-neck, short flutter sleeves, and a flattering tie belt at the waist.',
  1299,
  2299,
  43,
  40,
  'H&M Hennes & Mauritz Retail',
  ARRAY[
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Pastel Blush Floral', 'Sage Botanical', 'Cornflower Blue']::TEXT[],
  '{"Fabric":"100% Sustainable Viscose","Fit":"Fit & Flare Wrap","Length":"Midi Length","Pattern":"Floral"}'::JSONB,
  '[{"text":"Summer drop: extra 10% off on apparel"}]'::JSONB
),
(
  '7b8c1f6f-0005-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'Peter England Men''s Classic Solid Formal Shirt',
  'Peter England',
  'Crisp cotton-rich formal dress shirt tailored for boardroom confidence and all-day office comfort. Wrinkle-resistant finish with reinforced collar stays.',
  999,
  1799,
  44,
  60,
  'Aditya Birla Fashion & Retail',
  ARRAY[
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1620012253295-c15c429fbf71?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Sky Blue', 'Crisp White', 'Soft Pink']::TEXT[],
  '{"Fabric":"60% Cotton, 40% Polyester","Fit":"Regular Formal Fit","Collar":"Semi-Cutaway Collar"}'::JSONB,
  '[{"text":"Corporate Pack: Buy 2 for ₹1,799"}]'::JSONB
),
(
  '7b8c1f6f-0006-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'Biba Women''s Embroidered Anarkali Kurta & Dupatta Set',
  'Biba',
  'Opulent festive 3-piece Anarkali ethnic set featuring intricate zari embroidery, flared hemline, tonal straight pants, and a sheer embroidered chiffon dupatta.',
  2799,
  4999,
  44,
  25,
  'Biba Apparels Pvt Ltd',
  ARRAY[
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Ruby Red', 'Royal Emerald', 'Midnight Navy']::TEXT[],
  '{"Fabric":"Chanderi Silk Blend","Work":"Zari & Thread Embroidery","Set Contains":"Kurta, Bottom & Dupatta"}'::JSONB,
  '[{"text":"Complimentary designer potli pouch included"}]'::JSONB
),
(
  '7b8c1f6f-0007-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'Allen Solly Men''s Regular Fit Flat Front Chinos',
  'Allen Solly',
  'Versatile flat-front cotton stretch chinos designed for the modern Friday dressing. Tailored with a clean mid-rise silhouette and ultra-comfortable flex waistband.',
  1699,
  2899,
  41,
  40,
  'Madura Fashion & Lifestyle',
  ARRAY[
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Khaki Tan', 'Charcoal Grey', 'Deep Navy']::TEXT[],
  '{"Fabric":"98% Cotton, 2% Elastane","Fit":"Regular Straight Fit","Rise":"Mid Rise"}'::JSONB,
  '[{"text":"10% Instant Discount with Axis Bank Cards"}]'::JSONB
),
(
  '7b8c1f6f-0008-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'U.S. Polo Assn. Men''s Solid Pique Cotton Polo T-Shirt',
  'U.S. Polo Assn.',
  'Signature classic polo shirt crafted from breathable honeycomb pique cotton. Features the iconic double-horseman embroidery on the chest and ribbed sleeve hems.',
  899,
  1599,
  44,
  75,
  'Arvind Lifestyle Brands',
  ARRAY[
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Crimson Red', 'Classic Navy', 'Heather Grey', 'Forest Green']::TEXT[],
  '{"Fabric":"100% Combed Pique Cotton","Collar":"Ribbed Polo Collar","Fit":"Regular Fit"}'::JSONB,
  '[{"text":"Buy 3 Polos for ₹2,399"}]'::JSONB
),
(
  '7b8c1f6f-0009-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'Zara Women''s High-Waist Wide Leg Trousers',
  'Zara',
  'Flowy tailored wide-leg trousers featuring a flattering high-waist silhouette, side slant pockets, and subtle front pleats. Perfect for workwear or elevated casual looks.',
  2490,
  3990,
  38,
  35,
  'Zara Retail India',
  ARRAY[
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Alabaster Beige', 'Jet Black', 'Mocha Brown']::TEXT[],
  '{"Fabric":"Crepe Poly Viscose","Fit":"High-Waist Flared Leg","Closure":"Concealed Zip Fly"}'::JSONB,
  '[{"text":"Free standard shipping on fashion orders above ₹999"}]'::JSONB
),
(
  '7b8c1f6f-0010-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'Manyavar Men''s Jacquard Kurta & Churidar Set',
  'Manyavar',
  'Traditional designer festive kurta set woven with intricate self-jacquard geometric motifs. Comes complete with a tailored mandarin collar kurta and matching churidar pajama.',
  3999,
  6999,
  43,
  20,
  'Vedant Fashions Ltd',
  ARRAY[
    'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Golden Sand', 'Wine Maroon', 'Royal Blue']::TEXT[],
  '{"Fabric":"Silk Blend Jacquard","Set":"Kurta & Churidar Bottom","Collar":"Embellished Mandarin Collar"}'::JSONB,
  '[{"text":"Special festive price: save ₹3,000"}]'::JSONB
),
(
  '7b8c1f6f-0011-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'ONLY Women''s Faux Leather Biker Jacket',
  'ONLY',
  'Edgy moto-inspired biker jacket in supple premium vegan faux leather. Featuring asymmetric zip fastening, notched lapels with snap buttons, and sleek zippered pockets.',
  2999,
  4999,
  40,
  25,
  'Bestseller Fashion India',
  ARRAY[
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Onyx Black', 'Cognac Brown']::TEXT[],
  '{"Material":"100% Polyurethane Vegan Leather","Lining":"100% Polyester Satin","Style":"Moto Biker"}'::JSONB,
  '[{"text":"Winter Special: Extra 10% instant checkout discount"}]'::JSONB
),
(
  '7b8c1f6f-0012-4c2a-a73c-400acb07c866',
  '7b8c1f6f-dc02-4c2a-a73c-400acb07c866',
  'W for Woman Geometric Print Straight Kurta',
  'W for Woman',
  'Contemporary ethnic printed kurta tailored for everyday modern flair. Crafted with lightweight rayon slub, keyhole neckline, and three-quarter sleeves.',
  1199,
  1999,
  40,
  45,
  'TCNS Clothing Co',
  ARRAY[
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=800&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&h=800&fit=crop&auto=format'
  ]::TEXT[],
  ARRAY['Mustard & Charcoal', 'Teal & Coral']::TEXT[],
  '{"Fabric":"Rayon Slub","Fit":"Straight","Neck":"Round Neck with Keyhole","Length":"Calf Length"}'::JSONB,
  '[{"text":"Flat ₹100 instant cash discount on UPI"}]'::JSONB
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount = EXCLUDED.discount,
  images = EXCLUDED.images,
  colors = EXCLUDED.colors,
  specs = EXCLUDED.specs,
  offers = EXCLUDED.offers;
