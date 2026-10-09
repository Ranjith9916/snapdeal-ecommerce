# Frontend-Backend Architecture Mapping

This document maps the existing Figma Make frontend features to the verified Supabase PostgreSQL schema to guide the integration phase.

## Tech Stack Overview
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: `react-router-dom` (Home, Search, Product, Wishlist, Cart, Checkout, Dashboard)
- **State**: React hooks (`useState`, `useEffect`, Context API for Toasts). Moving to Supabase JS.
- **Current Data**: Hardcoded arrays in `src/data/` and component files.

## Feature Mapping

| Frontend Feature | Supabase Backend | Access Control / Source of Truth |
| :--- | :--- | :--- |
| **Authentication (Sign up/Login/Logout)** | Supabase Auth API (`@supabase/supabase-js`) | Handled securely by Supabase GoTrue server. |
| **User Profile / Dashboard** | `profiles` table | Read/Update restricted to `auth.uid() = id`. Trigger `handle_new_user` handles creation. |
| **Product Listings (Home/Search/Category)** | `products` table | Public read via RLS. |
| **Product Details (Images, Specs, Colors)** | `products` table | Public read via RLS. Images stored as `TEXT[]`. |
| **Categories / Filters** | `categories` table | Public read via RLS. |
| **Cart (Add/Remove/Qty/Color)** | `cart_items` table | Strict RLS: `auth.uid() = user_id`. |
| **Wishlist** | `wishlist_items` table | Strict RLS: `auth.uid() = user_id`. |
| **Addresses** | `addresses` table | Strict RLS: `auth.uid() = user_id`. |
| **Checkout processing & totals calculation** | `checkout` RPC | **Authoritative**: Validates coupons, locks stock, calculates totals, creates orders, clears cart securely. |
| **Coupons validation** | `coupons` table via `checkout` RPC | Secure server-side access only; table is not public. |
| **Order History** | `orders` table | Read-only RLS for `auth.uid() = user_id`. Protected by `ON DELETE RESTRICT`. |
| **Ordered Products** | `order_items` table | Read-only RLS via parent order ownership. |
| **Reviews** | `reviews` table | Public read. Insert requires `status = 'Delivered'` on a past order. |

## Data Flow Principles
1. **Never trust the client for totals or logic**: The frontend passes IDs and quantities (cart) or just inputs (checkout). The database calculates money and applies business rules.
2. **Component Abstraction**: Supabase data calls will be abstracted into dedicated service layers (e.g., `src/lib/supabase.ts`, `src/services/`) to avoid cluttering UI components.
3. **Optimistic Updates**: Use React state to optimistically update the UI while Supabase resolves in the background for a snappy user experience, especially for cart and wishlist actions.
