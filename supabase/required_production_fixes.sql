-- ============================================================================
-- REQUIRED PRODUCTION FIXES FOR SUPABASE DATABASE
-- Instructions: Execute this entire script in your Supabase SQL Editor.
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================================

-- 1. SEED PRODUCTION COUPONS
INSERT INTO public.coupons (code, description, discount_type, discount_value, is_active, minimum_order_amount, max_discount_amount, usage_limit, used_count)
VALUES 
    ('SNAP20', '20% off on all eligible electronics and gadgets', 'percentage', 20.00, true, 999.00, 2000.00, 1000, 0),
    ('SAVE500', 'Flat ₹500 off on orders above ₹2,000', 'fixed', 500.00, true, 2000.00, NULL, 500, 0),
    ('FASHION30', '30% off on fashion and apparel collections', 'percentage', 30.00, true, 999.00, 1500.00, 1000, 0),
    ('FREESHIP', 'Free standard shipping on any order', 'fixed', 49.00, true, 0.00, NULL, 10000, 0)
ON CONFLICT (code) DO UPDATE SET
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    is_active = EXCLUDED.is_active,
    minimum_order_amount = EXCLUDED.minimum_order_amount,
    max_discount_amount = EXCLUDED.max_discount_amount;

-- 2. COUPON VALIDATION RPC (Secure server-side validation)
CREATE OR REPLACE FUNCTION public.validate_coupon(
    p_coupon_code TEXT,
    p_order_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_coupon RECORD;
    v_discount NUMERIC(10,2) := 0;
BEGIN
    IF p_coupon_code IS NULL OR trim(p_coupon_code) = '' THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Coupon code cannot be empty');
    END IF;

    SELECT * INTO v_coupon 
    FROM public.coupons 
    WHERE upper(code) = upper(trim(p_coupon_code));

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Invalid coupon code');
    END IF;

    IF NOT v_coupon.is_active THEN
        RETURN jsonb_build_object('valid', false, 'message', 'This coupon is no longer active');
    END IF;

    IF v_coupon.expiry_date IS NOT NULL AND v_coupon.expiry_date < now() THEN
        RETURN jsonb_build_object('valid', false, 'message', 'This coupon has expired');
    END IF;

    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
        RETURN jsonb_build_object('valid', false, 'message', 'This coupon usage limit has been reached');
    END IF;

    IF p_order_amount < v_coupon.minimum_order_amount THEN
        RETURN jsonb_build_object(
            'valid', false, 
            'message', 'Minimum order amount for this coupon is ₹' || v_coupon.minimum_order_amount::TEXT
        );
    END IF;

    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := (p_order_amount * v_coupon.discount_value / 100.0);
        IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
            v_discount := v_coupon.max_discount_amount;
        END IF;
    ELSE
        v_discount := v_coupon.discount_value;
    END IF;

    IF v_discount > p_order_amount THEN
        v_discount := p_order_amount;
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'code', v_coupon.code,
        'description', v_coupon.description,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'calculated_discount', v_discount
    );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_coupon(TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT, NUMERIC) TO authenticated, anon;


-- 3. SECURE CHECKOUT RPC (Authoritative pricing & atomic stock concurrency)
CREATE OR REPLACE FUNCTION public.checkout(
    p_address_id UUID,
    p_payment_method TEXT,
    p_coupon_code TEXT DEFAULT NULL,
    p_delivery_slot TEXT DEFAULT NULL
) RETURNS JSONB
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
            RAISE EXCEPTION 'Insufficient stock for product % (Only % left)', v_product.name, v_product.stock_quantity;
        END IF;

        v_subtotal := v_subtotal + (v_product.price * v_cart_item.quantity);
    END LOOP;

    -- Handle Coupon Validation
    IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) != '' THEN
        -- Lock the coupon row to prevent concurrent checkouts from exceeding limits simultaneously
        SELECT * INTO v_coupon FROM public.coupons WHERE upper(code) = upper(trim(p_coupon_code)) FOR UPDATE;
        
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
            RAISE EXCEPTION 'Minimum order amount for coupon % is ₹%', v_coupon.code, v_coupon.minimum_order_amount;
        END IF;

        -- Apply discount
        IF v_coupon.discount_type = 'percentage' THEN
            v_discount := (v_subtotal * v_coupon.discount_value / 100.0);
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

    -- Additional slot pricing
    IF p_delivery_slot = 'Express Delivery' THEN
        v_delivery := v_delivery + 99;
    ELSIF p_delivery_slot = 'Same Day Delivery' THEN
        v_delivery := v_delivery + 199;
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
                v_total, v_discount, v_delivery, 'Processing', p_payment_method, 'paid', p_delivery_slot
            ) RETURNING id INTO v_order_id;
            EXIT; -- Success, break out of retry loop
        EXCEPTION WHEN unique_violation THEN
            -- Collision detected, continue loop and generate a new ID
        END;
    END LOOP;

    -- Insert Order Items and Update Stock based on locked cart snapshot
    FOR v_cart_item IN (SELECT * FROM tmp_checkout_cart) LOOP
        -- Read trusted price from database
        SELECT price INTO v_product FROM public.products WHERE id = v_cart_item.product_id;
        
        INSERT INTO public.order_items (order_id, product_id, quantity, price_at_time, selected_color, status)
        VALUES (v_order_id, v_cart_item.product_id, v_cart_item.quantity, v_product.price, v_cart_item.selected_color, 'Confirmed');

        -- Decrement stock atomically (locking prevents concurrency issues)
        UPDATE public.products 
        SET stock_quantity = stock_quantity - v_cart_item.quantity 
        WHERE id = v_cart_item.product_id;
    END LOOP;

    -- Clear user cart securely
    DELETE FROM public.cart_items WHERE id IN (SELECT id FROM tmp_checkout_cart);

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'display_id', v_display_id,
        'total', v_total,
        'subtotal', v_subtotal,
        'discount', v_discount,
        'delivery', v_delivery
    );
END;
$$;

REVOKE ALL ON FUNCTION public.checkout(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.checkout(UUID, TEXT, TEXT, TEXT) TO authenticated;
