# HDZ-Store: International Premium Ecommerce

HDZ-Store is a production-ready, full-stack ecommerce platform designed for high-conversion AliExpress dropshipping. Built with a modern luxury aesthetic, it combines the efficiency of Amazon with the premium feel of high-end Shopify stores.

## 🚀 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Motion (animations), Recharts (analytics)
- **Backend**: Node.js Express (Stripe integration, API proxy)
- **Database/Auth**: Supabase (PostgreSQL, Real-time Auth)
- **Payments**: Stripe Checkout (Secure international payments)
- **UI Components**: Shadcn UI (Customized for luxury feel)

---

## 🛠️ Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials from Supabase and Stripe.

```env
# Supabase
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_pk
STRIPE_SECRET_KEY=your_sk

# App
APP_URL=http://localhost:3000
```

### 2. Supabase Database Schema
Run the following SQL in your Supabase SQL Editor to initialize the database:

```sql
-- Profiles table for users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  shipping_address JSONB,
  items JSONB,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### 3. Stripe Setup
1. Create a [Stripe Account](https://stripe.com).
2. Go to Developers > API Keys.
3. Add the Publishable Key and Secret Key to your `.env`.
4. (Optional) Set up a Webhook for `checkout.session.completed` to automate order status updates.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the full-stack dev server:
   ```bash
   npm run dev
   ```
   *The Express server handles Stripe API calls while Vite handles the frontend.*

---

## 🚢 Deployment (Vercel)

1. Connect your repository to Vercel.
2. Vercel will automatically detect the settings.
3. **Important**: Add all Environment Variables in Vercel Project Settings.
4. Deployment command `npm run build` is already optimized for Vercel.

---

## 📁 Folder Structure
- `/src/components`: Reusable UI primitives and section components.
- `/src/pages`: Full page views (Home, Products, Admin, etc).
- `/src/hooks`: Custom React hooks (Cart, Auth).
- `/src/lib`: External service clients (Stripe, Supabase).
- `/server.ts`: Express backend entry point.
- `/constants.ts`: Store metadata, categories, and sample product data.
