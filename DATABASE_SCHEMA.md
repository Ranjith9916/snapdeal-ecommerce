# Database Schema Design

Based on the frontend requirements of the e-commerce application, here is the detailed database schema designed for Supabase PostgreSQL.

## 1. Entity Relationship Overview

The core of the system revolves around the **User Profile** (linked to Supabase Auth) and **Products**. 
Users can manage their **Addresses**, add items to their **Cart** (`cart_items`) or **Wishlist** (`wishlist_items`), and place **Orders** (`orders` and `order_items`). Users can also leave **Reviews** on products and use **Coupons** for discounts.

### Entities Evaluated but NOT Required:
- **`carts`**: A standalone `carts` table is unnecessary. Since a user only has one active cart, mapping `cart_items.user_id` directly to the user profile is more efficient and eliminates unnecessary JOINs.
- **`wishlists`**: Similar to carts, mapping `wishlist_items.user_id` directly to the user (with an optional `folder_name` column) is sufficient and optimal for this frontend.
- **`product_images`**: The frontend handles product images as a simple array of URLs (up to 4 images per product). A PostgreSQL `text[]` (array of text) column on the `products` table perfectly encapsulates this without requiring a separate table for image metadata.

---

## 2. Complete Table Definitions & Columns

> **Note on UUIDs**: This schema uses the native `gen_random_uuid()` function introduced in PostgreSQL 13 instead of `uuid_generate_v4()`. This avoids the need to enable the `uuid-ossp` extension, improving portability and security.

### 1. `profiles`
**Purpose**: Stores extended user information linked to Supabase Auth.
- `id` (UUID, Primary Key) - References `auth.users(id)`.
- `first_name` (Text, Nullable)
- `last_name` (Text, Nullable)
- `phone` (Text, Nullable)
- `points` (Integer, Default 0) - For reward points seen in Dashboard.
- `notification_settings` (JSONB, Default `{}`) - User preferences.
- `created_at` (Timestamp with time zone, Default `now()`)
- `updated_at` (Timestamp with time zone, Default `now()`)

### 2. `categories`
**Purpose**: Organizes products into browseable sections.
- `id` (UUID, Primary Key) - Default `gen_random_uuid()`
- `name` (Text, NOT NULL)
- `slug` (Text, NOT NULL, UNIQUE)
- `created_at` (Timestamp with time zone, Default `now()`)

### 3. `products`
**Purpose**: The central catalog entity containing all product details.
- `id` (UUID, Primary Key) - Default `gen_random_uuid()`
- `category_id` (UUID, Nullable) - References `categories(id)`.
- `name` (Text, NOT NULL)
- `brand` (Text, Nullable)
- `description` (Text, Nullable)
- `price` (Numeric(10,2), NOT NULL)
- `original_price` (Numeric(10,2), Nullable)
- `discount` (Integer, Nullable) - Percentage discount.
- `stock_quantity` (Integer, Default 0, NOT NULL)
- `seller` (Text, Nullable)
- `images` (Text[], Default `array[]::text[]`)
- `colors` (Text[], Default `array[]::text[]`)
- `specs` (JSONB, NOT NULL, Default `'{}'::jsonb`) - Key/Value pairs for specifications.
- `offers` (JSONB, NOT NULL, Default `'[]'::jsonb`) - Special promotional texts.
- `created_at` (Timestamp with time zone, Default `now()`)
- `updated_at` (Timestamp with time zone, Default `now()`)

### 4. `coupons`
**Purpose**: Manages discount codes cleanly distinguishing between percentage and fixed values.
- `id` (UUID, Primary Key) - Default `gen_random_uuid()`
- `code` (Text, NOT NULL, UNIQUE)
- `description` (Text, Nullable)
- `discount_type` (Text, NOT NULL) - Allowed values: 'percentage', 'fixed'
- `discount_value` (Numeric(10,2), NOT NULL)
- `is_active` (Boolean, Default true, NOT NULL)
- `minimum_order_amount` (Numeric(10,2), Default 0, NOT NULL)
- `max_discount_amount` (Numeric(10,2), Nullable) - Used mainly for percentage discounts
- `usage_limit` (Integer, Nullable) - Max times this coupon can be used overall
- `used_count` (Integer, Default 0, NOT NULL)
- `expiry_date` (Timestamp with time zone, Nullable)
- `created_at` (Timestamp with time zone, Default `now()`)

### 5. `addresses`
**Purpose**: Stores saved shipping/billing addresses for users.
- `id` (UUID, Primary Key) - Default `gen_random_uuid()`
- `user_id` (UUID, NOT NULL) - References `profiles(id)`.
- `label` (Text, Nullable) - e.g., 'Home', 'Office'.
- `full_name` (Text, NOT NULL)
- `address_text` (Text, NOT NULL)
- `phone` (Text, NOT NULL)
- `created_at` (Timestamp with time zone, Default `now()`)
- `updated_at` (Timestamp with time zone, Default `now()`)

### 6. `cart_items`
**Purpose**: Tracks items currently in a user's shopping cart.
- `id` (UUID, Primary Key) - Default `gen_random_uuid()`
- `user_id` (UUID, NOT NULL) - References `profiles(id)`.
- `product_id` (UUID, NOT NULL) - References `products(id)`.
- `quantity` (Integer, Default 1, NOT NULL)
- `selected_color` (Text, NOT NULL, Default `''`)
- `created_at` (Timestamp with time zone, Default `now()`)
- `updated_at` (Timestamp with time zone, Default `now()`)

### 7. `wishlist_items`
**Purpose**: Tracks items a user has saved for later.
- `id` (UUID, Primary Key) - Default `gen_random_uuid()`
- `user_id` (UUID, NOT NULL) - References `profiles(id)`.
- `product_id` (UUID, NOT NULL) - References `products(id)`.
- `folder_name` (Text, Default 'All', NOT NULL)
- `created_at` (Timestamp with time zone, Default `now()`)

### 8. `orders`
**Purpose**: Stores high-level details of a placed order along with a snapshot of the shipping address.
- `id` (UUID, Primary Key) - Default `gen_random_uuid()`
- `display_id` (Text, NOT NULL, UNIQUE) - e.g., '#SD-8847623'
- `user_id` (UUID, NOT NULL) - References `profiles(id)`.
- `address_id` (UUID, NOT NULL) - References `addresses(id)`.
- `shipping_full_name` (Text, NOT NULL) - Snapshot field
- `shipping_phone` (Text, NOT NULL) - Snapshot field
- `shipping_address` (Text, NOT NULL) - Snapshot field
- `total_amount` (Numeric(10,2), NOT NULL)
- `discount_amount` (Numeric(10,2), Default 0)
- `delivery_fee` (Numeric(10,2), Default 0)
- `status` (Text, Default 'Processing', NOT NULL)
- `payment_method` (Text, NOT NULL)
- `payment_status` (Text, Default 'pending', NOT NULL) - Allowed: 'pending', 'paid', 'failed', 'refunded'
- `delivery_slot` (Text, Nullable)
- `created_at` (Timestamp with time zone, Default `now()`)
- `updated_at` (Timestamp with time zone, Default `now()`)

> **Address Snapshot Explanation**: The `shipping_*` fields capture the exact address details at checkout. Users frequently update or delete their saved `addresses`. If the `orders` table solely relied on a JOIN to `addresses`, historical orders would reflect the changed address rather than where the order was actually shipped.

### 9. `order_items`
**Purpose**: Stores individual line items within an order (frozen at checkout time).
- `id` (UUID, Primary Key) - Default `gen_random_uuid()`
- `order_id` (UUID, NOT NULL) - References `orders(id)`.
- `product_id` (UUID, NOT NULL) - References `products(id)`.
- `quantity` (Integer, NOT NULL)
- `price_at_time` (Numeric(10,2), NOT NULL)
- `selected_color` (Text, NOT NULL, Default `''`)
- `status` (Text, Nullable) - e.g., 'Returned', 'Cancelled'.
- `user_rating` (Integer, Nullable)
- `created_at` (Timestamp with time zone, Default `now()`)

### 10. `reviews`
**Purpose**: Stores customer feedback and ratings for products.
- `id` (UUID, Primary Key) - Default `gen_random_uuid()`
- `product_id` (UUID, NOT NULL) - References `products(id)`.
- `user_id` (UUID, NOT NULL) - References `profiles(id)`.
- `rating` (Integer, NOT NULL)
- `comment` (Text, Nullable)
- `helpful_count` (Integer, Default 0)
- `created_at` (Timestamp with time zone, Default `now()`)
- `updated_at` (Timestamp with time zone, Default `now()`)

---

## 3. Constraints & Indexes

### Constraints
- **Foreign Keys**: Enforce referential integrity on all `_id` suffix columns.
- **UNIQUE**: `profiles(id)`, `categories(slug)`, `coupons(code)`, `orders(display_id)`.
- **UNIQUE COMPOSITE (Cart)**: `UNIQUE(user_id, product_id, selected_color)` on `cart_items` prevents duplicating rows for the exact same variation.
- **UNIQUE COMPOSITE (Reviews)**: `UNIQUE(user_id, product_id)` ensures a user can only leave one review per product.
- **CHECK**:
  - `products.price >= 0`
  - `products.stock_quantity >= 0`
  - `cart_items.quantity > 0` AND `cart_items.quantity <= 10`
  - `reviews.rating >= 1` AND `reviews.rating <= 5`
  - `order_items.quantity > 0`
  - `coupons.discount_type IN ('percentage', 'fixed')`
  - `coupons.discount_value > 0` AND `(coupons.discount_type != 'percentage' OR coupons.discount_value <= 100)`
  - `orders.payment_status IN ('pending', 'paid', 'failed', 'refunded')`

### Index Strategy & Search
- **Primary / Foreign Keys**: Indexed to speed up JOINs and RLS evaluations.
- **Product Search Strategy**: 
  - **MVP Level**: The application will use `ILIKE` for basic filtering on the `name` column.
  - **Production Scale**: Full-Text Search (FTS) should be implemented by adding a `tsvector` column (e.g., `search_vector`) to `products` that combines `name`, `brand`, and `description`, accompanied by a GIN index: `CREATE INDEX products_search_idx ON products USING GIN (search_vector);`.

---

## 4. Row Level Security (RLS) Strategy

Protecting core order data and preventing unauthorized manipulation is paramount.

- `profiles`: Customers can only `SELECT` and `UPDATE` their own profile.
- `categories`, `products`: Publicly readable (`SELECT`). Admin only for mutations.
- `addresses`, `cart_items`, `wishlist_items`: Customers can only perform CRUD operations where `user_id = auth.uid()`.
- `orders`: Customers can `SELECT` their own orders (`user_id = auth.uid()`). Customers **cannot** `INSERT`, `UPDATE`, or `DELETE` orders directly.
- `order_items`: Customers can only `SELECT` items belonging to their orders via an EXISTS clause referencing the parent `orders` table: `EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())`. Customers **cannot** directly `INSERT`, `UPDATE`, or `DELETE` order items.
- `coupons`: Publicly readable to check validity, Admin only for mutations.
- `reviews`: Publicly readable. Customers can `INSERT`/`UPDATE`/`DELETE` their own reviews. *Note: RLS policies can be further restricted to only allow reviews if an associated `order_items` record exists for that user and product (Verified Purchase logic).*

**Secure Order Creation**: Order creation (involving `orders`, `order_items`, `total_amount`, `payment_status`, and `stock_quantity`) is strictly handled server-side via a trusted PostgreSQL RPC function (`checkout`), bypassing the need for client-side INSERT permissions.

---

## 5. Data Flow

1. **Registration (Auth Trigger)**: 
   - User signs up via Supabase Auth.
   - A PostgreSQL trigger on `auth.users` securely inserts a row into `public.profiles`. The trigger function uses `SECURITY DEFINER set search_path = public` to prevent search path hijacking.
2. **Login**: 
   - Handled via Supabase client. Session state activates protected routes.
3. **Product Browsing**: 
   - `HomePage` and `SearchPage` issue `GET` requests to `products`.
4. **Cart**: 
   - Operations directly hit the `cart_items` table.
5. **Wishlist**: 
   - Toggles `wishlist_items` via client `INSERT` or `DELETE`.
6. **Checkout (Security & Concurrency)**: 
   - The user submits checkout details.
   - The frontend calls a secure **PostgreSQL RPC function**.
   - **Order Address Security**: The RPC verifies that the provided `address_id` belongs to `auth.uid()`, then copies the address text into the `shipping_*` snapshot fields on the new `orders` row.
   - **Stock Concurrency**: The RPC uses transaction locking (`SELECT ... FOR UPDATE` on `products`) to atomically validate and decrement `stock_quantity`, strictly preventing two simultaneous checkouts from overselling limited stock.
   - The RPC creates `orders`, creates `order_items`, and clears `cart_items` securely in one transaction.
7. **Reviews**: 
   - Authenticated users can review products, constrained to one review per product.
