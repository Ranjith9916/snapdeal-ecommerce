# Backend Plan for E-commerce Application

## 1. Current Frontend Architecture
- **Framework**: React 19 + Vite.
- **Styling**: Tailwind CSS v4.
- **Routing**: Client-side routing using `react-router-dom` (v7) with pages for Home, Search, Product, Wishlist, Cart, Checkout, and Dashboard.
- **State Management**: Currently relies on local component state (`useState`, `useEffect`) and prop drilling. A Context provider is used for Toasts (`ToastProvider`). No global state management libraries (like Redux or Zustand) are installed.
- **Data Fetching**: Currently, the application uses hardcoded mock data imported from `src/data/products.ts` and `src/data/categoryProducts.ts`, along with component-level dummy arrays (e.g., in `CartPage.tsx`, `WishlistPage.tsx`, `CheckoutPage.tsx`).
- **Icons**: `lucide-react` is used for iconography.

## 2. Required Backend Architecture
- **Backend-as-a-Service (BaaS)**: **Supabase** will be utilized as the primary backend to provide Postgres Database, Authentication, and Edge Functions (if needed).
- **Database**: PostgreSQL (provided by Supabase).
- **API Layer**: Supabase auto-generated REST APIs (PostgREST) accessed via the `@supabase/supabase-js` client in the React frontend.
- **Storage**: Supabase Storage for product images and user avatars (if applicable).
- **State Management (Frontend integration)**: To sync backend state with the frontend efficiently without modifying the design, we recommend integrating `@supabase/supabase-js` and potentially a data-fetching library like React Query (`@tanstack/react-query`) to handle caching, loading states, and mutations gracefully.

## 3. Database Tables
1. **`users`**: Extended profile data (links to Supabase Auth `auth.users`).
2. **`addresses`**: User shipping/billing addresses.
3. **`categories`**: Product categories and subcategories.
4. **`products`**: Product details (title, description, price, original_price, discount, stock, images).
5. **`product_reviews`**: Customer reviews and ratings for products.
6. **`cart_items`**: Items currently in user shopping carts.
7. **`wishlist_items`**: Items saved by users for later.
8. **`orders`**: Order summaries (total, status, payment method, delivery address).
9. **`order_items`**: Individual items within a specific order.
10. **`coupons`**: Discount codes and promotional offers.

## 4. Database Relationships
- **Users to Addresses**: One-to-Many.
- **Categories to Products**: One-to-Many (or Many-to-Many if a product belongs to multiple categories).
- **Users to Cart Items**: One-to-Many.
- **Products to Cart Items**: One-to-Many.
- **Users to Wishlist Items**: One-to-Many.
- **Products to Wishlist Items**: One-to-Many.
- **Users to Orders**: One-to-Many.
- **Orders to Order Items**: One-to-Many.
- **Products to Order Items**: One-to-Many.
- **Users to Reviews**: One-to-Many.
- **Products to Reviews**: One-to-Many.

## 5. Authentication Design
- **Provider**: Supabase Auth.
- **Methods**: Email/Password login and registration. (Optional: OAuth providers like Google).
- **Session Management**: Handled automatically by Supabase client (JWT stored securely in local storage/cookies).
- **Frontend Integration**: Update `LoginModal.tsx` to use Supabase Auth APIs instead of mock states. Use Supabase session state to toggle authenticated views in the Header and Sidebar.
- **Row Level Security (RLS)**: Enforced at the PostgreSQL level to ensure users can only access their own cart, wishlist, orders, and profile data.

## 6. API Requirements
Since Supabase auto-generates REST APIs, we require the following data operations:
- **Auth**: `signUp`, `signInWithPassword`, `signOut`, `getUser`.
- **Products**: `GET /products` (with filters, search, pagination), `GET /products/:id`.
- **Categories**: `GET /categories`.
- **Cart**: `GET /cart_items`, `POST /cart_items`, `PATCH /cart_items/:id` (qty update), `DELETE /cart_items/:id`.
- **Wishlist**: `GET /wishlist_items`, `POST /wishlist_items`, `DELETE /wishlist_items/:id`.
- **Orders**: `GET /orders`, `POST /orders` (checkout process), `GET /orders/:id`.
- **Addresses**: `GET /addresses`, `POST /addresses`, `PUT /addresses/:id`, `DELETE /addresses/:id`.

## 7. Product Functionality
- **Listing**: Fetch dynamic lists for `trendingProducts`, `flashSaleProducts`, and `recommendedProducts` from the database.
- **Detail Page**: Fetch individual product details, specifications, and related products based on category.
- **Search & Filter**: Utilize Supabase text search capabilities and filtering (by category, price, rating) to populate the `SearchPage`.
- **Reviews**: Aggregate ratings dynamically and display paginated reviews.

## 8. Cart Functionality
- **State**: Replace the `initCart` dummy data in `CartPage.tsx`.
- **Operations**: Adding to cart, updating quantities, and removing items will perform optimistic UI updates while mutating data in the `cart_items` table.
- **Coupons**: Validate coupon codes against the `coupons` table to calculate discounts dynamically.

## 9. Wishlist Functionality
- **State**: Replace dummy arrays in `WishlistPage.tsx` and `WishlistPanel.tsx`.
- **Folders/Collections**: Optional enhancement to group wishlist items (currently mocked as 'Electronics', 'Fashion', etc.) by adding a `folder_id` or `folder_name` to `wishlist_items`.
- **Operations**: Toggle wishlist status directly from `ProductCard.tsx` and `ProductPage.tsx`.

## 10. Order Functionality
- **Checkout Process**: The `CheckoutPage.tsx` will fetch real `savedAddresses`.
- **Order Creation**: Upon clicking "Place Order", a transaction should insert a record into `orders` and multiple records into `order_items`, followed by clearing the user's `cart_items`.
- **Tracking**: The `DashboardPage.tsx` will fetch real order history and status from the `orders` table.

## 11. User Functionality
- **Dashboard**: Display real user details, addresses, and order history.
- **Profile Management**: Allow users to update their name, phone number, and password.

## 12. Admin Functionality
*(Currently, there is no explicit admin UI in the provided frontend)*
- **Data Management**: Admin tasks (adding products, managing inventory, updating order statuses) can be handled directly via the **Supabase Studio** dashboard initially.
- **Future Enhancement**: A separate protected route (e.g., `/admin`) could be built later for store managers.

## 13. Security Requirements
- **Row Level Security (RLS)**:
  - `products`: Public read-only.
  - `cart_items`, `wishlist_items`, `addresses`, `orders`: Authenticated users can only `SELECT`, `INSERT`, `UPDATE`, `DELETE` their own rows (`auth.uid() = user_id`).
- **Data Validation**: Enforce database constraints (e.g., `price >= 0`, `qty > 0`).
- **Environment Variables**: Store Supabase URL and Anon Key in `.env.local` securely.

## 14. Supabase Integration Plan
1. **Project Setup**: Create a new project in Supabase.
2. **Schema Migration**: Create SQL scripts for the tables, relationships, and RLS policies defined above.
3. **Seed Data**: Write a script to migrate the existing mock data (`products.ts`, `categoryProducts.ts`) into the Supabase PostgreSQL database.
4. **Client Setup**: Install `@supabase/supabase-js` in the frontend and create a singleton client in `src/lib/supabase.ts`.
5. **Auth Implementation**: Hook up `LoginModal.tsx` to Supabase Auth.
6. **Data Hookup**: Progressively replace static data imports in pages and components with asynchronous calls to Supabase.

## 15. Implementation Phases
- **Phase 1: Database & Auth Setup**
  - Initialize Supabase project.
  - Define schema, apply RLS, and insert seed data.
  - Configure Supabase client in the React app.
  - Implement Auth in `LoginModal` and protect user routes.
- **Phase 2: Product & Catalog Integration**
  - Fetch products for `HomePage` sections.
  - Implement Search & Filter logic for `SearchPage`.
  - Fetch dynamic data for `ProductPage`.
- **Phase 3: Cart & Wishlist Integration**
  - Implement CRUD operations for the Cart.
  - Implement CRUD operations for the Wishlist.
  - Sync UI state with backend changes.
- **Phase 4: Checkout & Orders**
  - Fetch user addresses during checkout.
  - Implement the order creation transaction.
  - Display order history in the User Dashboard.
- **Phase 5: Refinement & Testing**
  - Handle loading states and error boundaries.
  - Ensure all optimistic UI updates work flawlessly.
  - Final security and RLS policy audit.
