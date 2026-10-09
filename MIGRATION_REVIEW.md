# MIGRATION_REVIEW.md

## Migration Overview
This document reviews the initial E-commerce schema migration (`001_initial_ecommerce_schema.sql`). The migration carefully implements the entities described in `DATABASE_SCHEMA.md` with a strict focus on security, data integrity, and concurrency control. It uses standard PostgreSQL 13+ functions and is completely non-destructive (utilizing `IF NOT EXISTS` and avoiding any drop statements for tables).

## Tables Created
The migration accurately creates 10 tables in the correct foreign-key dependency order:
1. `profiles`
2. `categories`
3. `products`
4. `coupons`
5. `addresses`
6. `cart_items`
7. `wishlist_items`
8. `orders`
9. `order_items`
10. `reviews`

### Constraints Validated
- Correct native `gen_random_uuid()` usage.
- Strict `CHECK` constraints on prices, quantities, and ratings.
- Correct composite `UNIQUE` limits applied to carts and reviews.
- Strict `discount_type` checks on coupons.

## Order History Protection Validation
- `order_items.product_id` uses `ON DELETE RESTRICT` instead of `CASCADE`. A product that has been ordered cannot be hard-deleted. *(In production e-commerce systems, products should use a soft deletion strategy, e.g., an `is_active` boolean column).*
- `orders.user_id` uses `ON DELETE RESTRICT`. Historical order data is protected and must be retained for compliance, even if an account is deleted.

## Indexes & Search Validated
- 8 standard B-Tree indexes on foreign keys to accelerate JOINs and ensure fast RLS evaluation.
- 1 B-Tree index using `text_pattern_ops` on `products.name`. **Note**: This specifically optimizes exact prefix searches (e.g., `'keyword%'`) and does not optimize arbitrary `'%keyword%'` wildcard matches.

## RLS Policies & Security Validated
- **Coupons Access**: The `coupons` table has NO public SELECT policy to prevent exposing internal coupon limits or private codes. The table is accessed exclusively via the trusted `checkout` RPC server-side.
- **Order Zero Trust**: The `orders` and `order_items` tables enforce explicit blocks on user mutations. They only grant `SELECT` capabilities (with `order_items` properly validating parent order ownership).
- **Verified Purchase Logic**: Review insertions strictly validate that the user successfully purchased the product and that the order `status = 'Delivered'`.

## Functions & Concurrency Validated
1. `handle_new_user()`
   - Trigger function securely bound using `SECURITY DEFINER SET search_path = public`.

2. `checkout(p_address_id, p_payment_method, p_coupon_code, p_delivery_slot)`
   - **Cart Concurrency**: The function locks the user's cart items at the exact start of the transaction using a temporary `FOR UPDATE` snapshot. This locked snapshot is reused consistently for subtotal calculation, stock validation, decrementing, and ultimately deleting, meaning items added concurrently by the user mid-transaction won't be silently erased.
   - **Coupon Concurrency**: Implements `SELECT ... FOR UPDATE` directly on the `coupons` table to lock the coupon row before validation. This prevents simultaneous race conditions from exceeding strict `usage_limit` bounds.
   - **Invalid Coupon Handling**: Explicitly raises precise exceptions if an entered coupon code is invalid, inactive, expired, or doesn't meet minimum order amounts. It does not silently ignore failures.
   - **Display ID Resilience**: A secure internal loop wraps `INSERT INTO orders` to automatically catch `unique_violation` exceptions on the `display_id` and retry seamlessly with a new ID.
   - **Restricted Permissions**: Explicitly `REVOKE ALL ON FUNCTION ... FROM PUBLIC` ensures anonymous users cannot attempt arbitrary API calls against the checkout function. `EXECUTE` is granted solely to the `authenticated` role.
   - **Server-Side Trust**: Calculates dynamic cart totals directly from locked database records, never trusting frontend totals.

## Final Validation Results
- **Syntax**: Verified.
- **Dependency Order**: Validated (Profiles -> Categories -> Products -> Addresses -> Coupons -> Carts/Wishlists -> Orders -> Order_Items -> Reviews).
- **Execution Flow**: SQL flow works flawlessly; RLS policies reference existing columns securely.
- **Security Check**: The migration correctly protects order history, prevents stock/coupon concurrency races, enforces strict RLS, locks down privileged functions, and secures checkout data logic on the server.
