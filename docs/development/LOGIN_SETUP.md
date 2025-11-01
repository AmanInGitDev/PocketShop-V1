# Login Setup Guide

Complete guide for setting up vendor authentication and login functionality.

## 📋 Prerequisites

- Supabase project created
- Supabase project URL and anon key
- Node.js 18+ installed

## 🔧 Step 1: Environment Variables

1. Copy the example file:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Where to find these:**
   - Go to your Supabase Dashboard
   - Click on **Settings** → **API**
   - Copy the **Project URL** → `VITE_SUPABASE_URL`
   - Copy the **anon/public** key → `VITE_SUPABASE_ANON_KEY`

**Note:** If you created `.env` instead of `.env.local`, rename it:
```bash
cd frontend
mv .env .env.local
```

## 👤 Step 2: Verify User in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Verify your demo user exists:
   - Email: `your-demo-email@example.com`
   - Status: Should be "Confirmed" (if email confirmation is enabled)

## 🔐 Step 3: Create RLS Policies for vendor_profiles

Since you've already created the `vendor_profiles` table, you just need to add the Row Level Security policies.

Run this SQL in your Supabase SQL Editor (or use the `docs/database/RLS_POLICIES.sql` file):

```sql
-- Row Level Security (RLS) Policies for vendor_profiles

-- 1. Vendors can view their own profile
DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can view own profile"
ON public.vendor_profiles FOR SELECT
USING (auth.uid() = user_id);

-- 2. Vendors can update their own profile
DROP POLICY IF EXISTS "Vendors can update own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can update own profile"
ON public.vendor_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Vendors can insert their own profile
DROP POLICY IF EXISTS "Vendors can insert own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can insert own profile"
ON public.vendor_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Public can view active vendor info (for storefront)
DROP POLICY IF EXISTS "Public can view active vendor info" ON public.vendor_profiles;
CREATE POLICY "Public can view active vendor info"
ON public.vendor_profiles FOR SELECT
USING (is_active = TRUE);
```

## 📝 Step 4: Create Vendor Profile (If Needed)

If your demo user doesn't have a vendor profile yet, you have two options:

### Option A: Let the app create it automatically
- Just log in! The app will automatically create a vendor profile if it doesn't exist.

### Option B: Create it manually in Supabase
Go to **SQL Editor** and run:

```sql
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
INSERT INTO public.vendor_profiles (
  user_id,
  email,
  business_name,
  mobile_number,
  owner_name,
  onboarding_status
) VALUES (
  'YOUR_USER_ID',  -- Get this from Authentication → Users
  'your-email@example.com',  -- Your demo user email
  'Demo Business',
  '+1234567890',  -- Your phone number
  'Demo Owner',
  'incomplete'
);
```

## 🚀 Step 5: Test Login

1. **Restart your dev server** (important!):
   ```bash
   cd frontend
   npm run dev
   ```

2. Open your browser and go to: `http://localhost:5173/vendor/login`

3. Enter your demo user credentials:
   - Email: `your-demo-email@example.com`
   - Password: `your-demo-password`

4. Click "Sign In"

5. **Success!** You should be redirected to `/vendor/dashboard`

## 🔍 Troubleshooting

### Common Issues:

**"Missing Supabase environment variables"**
- Make sure file is named `.env.local` (not `.env`)
- Restart dev server

**"Error fetching vendor profile"**
- Check RLS policies are set up (see Step 3)
- Check browser console for specific error
- The app will automatically create a vendor profile if it doesn't exist

**"Invalid login credentials"**
- Verify email/password in Supabase Dashboard
- Check if email confirmation is required (disable it in Auth settings for testing)

**User logs in but gets redirected back to login**
- Check if the `vendor_profiles` table exists and has proper RLS policies
- Verify the user's ID matches between `auth.users` and `vendor_profiles.user_id`
- Make sure RLS policies allow the authenticated user to access their profile

### Still getting errors?

1. **Check browser console** (F12) for error messages
2. **Check Network tab** to see if API calls are working
3. **Verify**:
   - ✅ `.env.local` file exists with correct values
   - ✅ RLS policies are created
   - ✅ User exists in Supabase Authentication
   - ✅ Dev server was restarted after creating `.env.local`

## 📝 Notes

- The app automatically creates a vendor profile in the `vendor_profiles` table if it doesn't exist when you log in
- Email confirmation can be disabled in Supabase Dashboard → Authentication → Settings
- Make sure your Supabase project allows email/password authentication
- The app maps `vendor_profiles` data to the User type (using `owner_name` or `business_name` as `full_name`, `logo_url` as `avatar_url`)

## 📚 Related Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Complete Supabase authentication setup
- [Database Setup](../database/) - Database schema and RLS policies
- [Project Structure](../../PROJECT_STRUCTURE.md) - Project organization

