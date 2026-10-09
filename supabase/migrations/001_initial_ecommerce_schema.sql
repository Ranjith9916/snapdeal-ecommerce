-- Migration: 001_initial_ecommerce_schema.sql
-- Description: Initial schema setup for E-commerce backend securely linked to Supabase Auth.

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    points INTEGER DEFAULT 0 NOT NULL,
    notification_settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Secure Auth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    brand TEXT,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10,2),
    discount INTEGER,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    seller TEXT,
    images TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    offers JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    minimum_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(10,2),
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT check_percentage_discount CHECK (discount_type != 'percentage' OR discount_value <= 100)
);

-- 5. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT,
    full_name TEXT NOT NULL,
    address_text TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. CART_ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 10),
    selected_color TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, product_id, selected_color)
);

-- 7. WISHLIST_ITEMS
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    folder_name TEXT NOT NULL DEFAULT 'All',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, product_id, folder_name)
);

-- 8. ORDERS
-- ON DELETE RESTRICT on user_id to protect historical order records from account deletion.
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    shipping_full_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0 NOT NULL,
    delivery_fee NUMERIC(10,2) DEFAULT 0 NOT NULL,
    status TEXT NOT NULL DEFAULT 'Processing',
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    delivery_slot TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. ORDER_ITEMS
-- ON DELETE RESTRICT on product_id prevents deleting a product if it was ever ordered.
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time NUMERIC(10,2) NOT NULL,
    selected_color TEXT NOT NULL DEFAULT '',
    status TEXT,
    user_rating INTEGER,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 11. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
-- text_pattern_ops only optimizes prefix searches ('keyword%'), not arbitrary '%keyword%' ILIKE searches.
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories & Products (Public Read)
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);

-- Coupons
-- NO PUBLIC SELECT POLICY. Coupons are accessed securely via the checkout RPC to prevent data leakage.

-- Addresses
CREATE POLICY "Users can view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- Cart Items
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Wishlist Items
CREATE POLICY "Users can view own wishlist" ON public.wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON public.wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON public.wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Order Items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Reviews
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert review if purchased" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
        SELECT 1 FROM public.order_items oi 
        JOIN public.orders o ON oi.order_id = o.id 
        WHERE o.user_id = auth.uid() AND oi.product_id = reviews.product_id AND o.status = 'Delivered'
    )
);
CREATE POLICY "Users can update own review" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own review" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- 13. SECURE CHECKOUT RPC
CREATE OR REPLACE FUNCTION public.checkout(
    p_address_id UUID,
    p_payment_method TEXT,
    p_coupon_code TEXT DEFAULT NULL,
    p_delivery_slot TEXT DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_address_record RECORD;
    v_cart_item RECORD;
    v_product RECORD;
    v_order_id UUID;
    v_display_id TEXT;
    v_subtotal NUMERIC(10,2) := 0;
    v_discount NUMERIC(10,2) := 0;
    v_delivery NUMERIC(10,2) := 0;
    v_total NUMERIC(10,2) := 0;
    v_coupon RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Verify address ownership
    SELECT * INTO v_address_record FROM public.addresses WHERE id = p_address_id AND user_id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid address';
    END IF;

    -- Create a snapshot of the cart locked FOR UPDATE to prevent concurrent modifications
    CREATE TEMP TABLE tmp_checkout_cart ON COMMIT DROP AS 
    SELECT * FROM public.cart_items WHERE user_id = v_user_id ORDER BY product_id FOR UPDATE;

    IF NOT EXISTS (SELECT 1 FROM tmp_checkout_cart) THEN
        RAISE EXCEPTION 'Cart is empty';
    END IF;

    -- Lock products and calculate subtotal securely using the locked cart snapshot
    -- Ordering by product_id prevents deadlocks under high concurrency
    FOR v_cart_item IN (SELECT * FROM tmp_checkout_cart ORDER BY product_id) LOOP
        -- Select for update locks the product row from simultaneous modifications
        SELECT * INTO v_product FROM public.products WHERE id = v_cart_item.product_id FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % not found', v_cart_item.product_id;
        END IF;
        
        IF v_product.stock_quantity < v_cart_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product ID %', v_cart_item.product_id;
        END IF;

        v_subtotal := v_subtotal + (v_product.price * v_cart_item.quantity);
    END LOOP;

    -- Handle Coupon Validation
    IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
        -- Lock the coupon row to prevent concurrent checkouts from exceeding limits simultaneously
        SELECT * INTO v_coupon FROM public.coupons WHERE code = p_coupon_code FOR UPDATE;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid coupon code';
        END IF;

        IF v_coupon.is_active = false THEN
            RAISE EXCEPTION 'Coupon is no longer active';
        END IF;

        IF v_coupon.expiry_date IS NOT NULL AND v_coupon.expiry_date < now() THEN
            RAISE EXCEPTION 'Coupon has expired';
        END IF;

        IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
            RAISE EXCEPTION 'Coupon usage limit exceeded';
        END IF;

        IF v_subtotal < v_coupon.minimum_order_amount THEN
            RAISE EXCEPTION 'Minimum order amount for this coupon is %', v_coupon.minimum_order_amount;
        END IF;

        -- Apply discount
        IF v_coupon.discount_type = 'percentage' THEN
            v_discount := (v_subtotal * v_coupon.discount_value / 100);
            IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
                v_discount := v_coupon.max_discount_amount;
            END IF;
        ELSE
            v_discount := v_coupon.discount_value;
        END IF;
        
        -- Ensure discount doesn't exceed subtotal
        IF v_discount > v_subtotal THEN
            v_discount := v_subtotal;
        END IF;

        -- Update coupon usage count
        UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;
    END IF;

    -- Calculate delivery fee
    IF v_subtotal > 499 THEN
        v_delivery := 0;
    ELSE
        v_delivery := 49;
    END IF;

    v_total := v_subtotal - v_discount + v_delivery;
    
    -- Generate reliable display id with collision protection
    LOOP
        v_display_id := '#SD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        BEGIN
            -- Insert Order with snapshot address fields
            INSERT INTO public.orders (
                display_id, user_id, address_id, shipping_full_name, shipping_phone, shipping_address,
                total_amount, discount_amount, delivery_fee, status, payment_method, payment_status, delivery_slot
            ) VALUES (
                v_display_id, v_user_id, p_address_id, v_address_record.full_name, v_address_record.phone, v_address_record.address_text,
                v_total, v_discount, v_delivery, 'Processing', p_payment_method, 'pending', p_delivery_slot
            ) RETURNING id INTO v_order_id;
            EXIT; -- Success, break out of retry loop
        EXCEPTION WHEN unique_violation THEN
            -- Collision detected, continue loop and generate a new ID
        END;
    END LOOP;

    -- Insert Order Items and Update Stock based on our locked cart snapshot
    FOR v_cart_item IN (SELECT * FROM tmp_checkout_cart) LOOP
        -- Read trusted price from database, not client
        SELECT price INTO v_product FROM public.products WHERE id = v_cart_item.product_id;
        
        INSERT INTO public.order_items (order_id, product_id, quantity, price_at_time, selected_color)
        VALUES (v_order_id, v_cart_item.product_id, v_cart_item.quantity, v_product.price, v_cart_item.selected_color);

        -- Decrement stock atomically
        UPDATE public.products 
        SET stock_quantity = stock_quantity - v_cart_item.quantity 
        WHERE id = v_cart_item.product_id;
    END LOOP;

    -- Clear cart securely using ONLY the IDs we locked at the start, preventing deletion of items added mid-checkout
    DELETE FROM public.cart_items WHERE id IN (SELECT id FROM tmp_checkout_cart);

    RETURN v_display_id;
END;
$$;

-- Secure Function Permissions
REVOKE ALL ON FUNCTION public.checkout(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.checkout(UUID, TEXT, TEXT, TEXT) TO authenticated;
