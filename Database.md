# PocketShop Complete Onboarding & Database Schema Guide

Complete database setup guide tailored for your vendor & user onboarding flows with Supabase authentication.

---

## Part 1: Database Schema for Onboarding

### 1.1: Vendor Profiles (Onboarding Storage)

```sql
-- Vendor Profile Table
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  business_name TEXT NOT NULL,
  business_type TEXT, -- 'food', 'retail', 'salon', 'clinic', etc.
  
  -- Contact Information
  email TEXT NOT NULL,
  mobile_number TEXT NOT NULL UNIQUE, -- REQUIRED field
  
  -- Business Details (Onboarding Fields)
  owner_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'IN',
  
  -- Operational Details
  operational_hours JSONB, -- {"monday": {"open": "09:00", "close": "22:00"}, ...}
  working_days TEXT[], -- ['monday', 'tuesday', ...]
  
  -- Business Setup
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  
  -- QR Code & System
  qr_code_id TEXT UNIQUE,
  qr_code_url TEXT,
  
  -- Account Status
  onboarding_status TEXT DEFAULT 'incomplete' CHECK (onboarding_status IN ('incomplete', 'basic_info', 'operational_details', 'planning_selected', 'completed')),
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB -- For additional future fields
);

-- Indexes for faster queries
CREATE INDEX idx_vendor_user_id ON public.vendor_profiles(user_id);
CREATE INDEX idx_vendor_email ON public.vendor_profiles(email);
CREATE INDEX idx_vendor_mobile ON public.vendor_profiles(mobile_number);

-- Enable RLS
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
```

### 1.2: User/Customer Profiles (Onboarding Storage)

```sql
-- User Profile Table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contact Information
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL UNIQUE, -- REQUIRED for all users (even guests later)
  email TEXT,
  
  -- Additional Info
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Account Status
  is_guest_converted BOOLEAN DEFAULT FALSE, -- Track if guest converted to registered
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB
);

-- Indexes
CREATE INDEX idx_customer_user_id ON public.customer_profiles(user_id);
CREATE INDEX idx_customer_mobile ON public.customer_profiles(mobile_number);

-- Enable RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
```

### 1.3: Guest Sessions (Before Registration)

```sql
-- Guest Sessions Table
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL, -- Stored in localStorage
  
  -- Guest Information
  customer_name TEXT,
  mobile_number TEXT NOT NULL, -- REQUIRED
  email TEXT,
  
  -- Session Status
  is_active BOOLEAN DEFAULT TRUE,
  converted_to_user_id UUID REFERENCES auth.users(id), -- If guest later registers
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Indexes
CREATE INDEX idx_guest_session_token ON public.guest_sessions(session_token);
CREATE INDEX idx_guest_mobile ON public.guest_sessions(mobile_number);

-- Enable RLS
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
```

### 1.4: User Roles Tracker

```sql
-- User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('vendor', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### 1.5: Products Table (Menu Items)

```sql
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  image_url TEXT,
  
  is_available BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_vendor_id ON public.products(vendor_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
```

### 1.6: Orders Table

```sql
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  
  -- Customer Reference (nullable for guests)
  customer_id UUID REFERENCES public.customer_profiles(id),
  guest_session_id UUID REFERENCES public.guest_sessions(id),
  
  -- Order Details
  items JSONB NOT NULL, -- [{product_id, quantity, price, name}]
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_method TEXT,
  
  -- Order Info
  customer_phone TEXT, -- Store for reference
  customer_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
```

---

## Part 2: Trigger Functions for Automatic Profile Creation

### 2.1: Vendor Profile Creation Trigger

```sql
-- Function to handle new vendor signup
CREATE OR REPLACE FUNCTION public.handle_new_vendor()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into vendor_profiles
  INSERT INTO public.vendor_profiles (
    user_id,
    email,
    business_name,
    mobile_number,
    onboarding_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', ''),
    'basic_info' -- Start with basic info stage
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'vendor');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users for vendors
DROP TRIGGER IF EXISTS on_vendor_auth_user_created ON auth.users;
CREATE TRIGGER on_vendor_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'user_type' = 'vendor')
  EXECUTE FUNCTION public.handle_new_vendor();
```

### 2.2: Customer Profile Creation Trigger

```sql
-- Function to handle new customer signup via OTP
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into customer_profiles
  INSERT INTO public.customer_profiles (
    user_id,
    email,
    name,
    mobile_number,
    phone_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.phone, COALESCE(NEW.raw_user_meta_data->>'phone', '')),
    TRUE -- Phone is verified via OTP
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users for customers
DROP TRIGGER IF EXISTS on_customer_auth_user_created ON auth.users;
CREATE TRIGGER on_customer_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'user_type' = 'customer')
  EXECUTE FUNCTION public.handle_new_customer();
```

---

## Part 3: Row Level Security (RLS) Policies

### 3.1: Vendor Profiles RLS

```sql
-- Vendors can view their own profile
DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can view own profile"
ON public.vendor_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Vendors can update their own profile
DROP POLICY IF EXISTS "Vendors can update own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can update own profile"
ON public.vendor_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Only vendors can insert (via trigger)
DROP POLICY IF EXISTS "Vendors can insert own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can insert own profile"
ON public.vendor_profiles FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'vendor'
  )
);

-- Public can view vendor info for storefront
DROP POLICY IF EXISTS "Public can view vendor info" ON public.vendor_profiles;
CREATE POLICY "Public can view vendor info"
ON public.vendor_profiles FOR SELECT
USING (is_active = TRUE);
```

### 3.2: Customer Profiles RLS

```sql
-- Customers can view their own profile
DROP POLICY IF EXISTS "Customers can view own profile" ON public.customer_profiles;
CREATE POLICY "Customers can view own profile"
ON public.customer_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Customers can update their own profile
DROP POLICY IF EXISTS "Customers can update own profile" ON public.customer_profiles;
CREATE POLICY "Customers can update own profile"
ON public.customer_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Only customers can insert (via trigger)
DROP POLICY IF EXISTS "Customers can insert own profile" ON public.customer_profiles;
CREATE POLICY "Customers can insert own profile"
ON public.customer_profiles FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'customer'
  )
);
```

### 3.3: Products RLS

```sql
-- Public can view available products
DROP POLICY IF EXISTS "Anyone can view available products" ON public.products;
CREATE POLICY "Anyone can view available products"
ON public.products FOR SELECT
USING (is_available = TRUE);

-- Vendors can insert their own products
DROP POLICY IF EXISTS "Vendors can insert their products" ON public.products;
CREATE POLICY "Vendors can insert their products"
ON public.products FOR INSERT
WITH CHECK (
  vendor_id = (
    SELECT id FROM public.vendor_profiles
    WHERE user_id = auth.uid()
  )
);

-- Vendors can update their own products
DROP POLICY IF EXISTS "Vendors can update their products" ON public.products;
CREATE POLICY "Vendors can update their products"
ON public.products FOR UPDATE
USING (
  vendor_id = (
    SELECT id FROM public.vendor_profiles
    WHERE user_id = auth.uid()
  )
);

-- Vendors can delete their own products
DROP POLICY IF EXISTS "Vendors can delete their products" ON public.products;
CREATE POLICY "Vendors can delete their products"
ON public.products FOR DELETE
USING (
  vendor_id = (
    SELECT id FROM public.vendor_profiles
    WHERE user_id = auth.uid()
  )
);
```

### 3.4: Orders RLS

```sql
-- Vendors can view their own orders
DROP POLICY IF EXISTS "Vendors can view their orders" ON public.orders;
CREATE POLICY "Vendors can view their orders"
ON public.orders FOR SELECT
USING (
  vendor_id = (
    SELECT id FROM public.vendor_profiles
    WHERE user_id = auth.uid()
  )
);

-- Customers can view their own orders
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
CREATE POLICY "Customers can view their own orders"
ON public.orders FOR SELECT
USING (
  customer_id = (
    SELECT id FROM public.customer_profiles
    WHERE user_id = auth.uid()
  )
);

-- Anyone can create orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (TRUE);

-- Vendors can update order status
DROP POLICY IF EXISTS "Vendors can update order status" ON public.orders;
CREATE POLICY "Vendors can update order status"
ON public.orders FOR UPDATE
USING (
  vendor_id = (
    SELECT id FROM public.vendor_profiles
    WHERE user_id = auth.uid()
  )
);
```

### 3.5: Guest Sessions RLS

```sql
-- Anyone can create guest sessions
DROP POLICY IF EXISTS "Anyone can create guest sessions" ON public.guest_sessions;
CREATE POLICY "Anyone can create guest sessions"
ON public.guest_sessions FOR INSERT
WITH CHECK (TRUE);

-- Anyone can view guest sessions (via token)
DROP POLICY IF EXISTS "Anyone can view guest sessions" ON public.guest_sessions;
CREATE POLICY "Anyone can view guest sessions"
ON public.guest_sessions FOR SELECT
USING (TRUE);
```

---

## Part 4: Onboarding Flow - Data Collection

### 4.1: Vendor Onboarding Stages

**Stage 1: Basic Info** (Registration Screen)
- Email (from Auth)
- Password (from Auth)
- Business Name
- Mobile Number âœ“ REQUIRED

**Stage 2: Business Details** (Onboarding Screen 1)
- Owner Name
- Address
- City
- State
- Postal Code
- Business Type

**Stage 3: Operational Details** (Onboarding Screen 2)
- Operating Hours (JSON format)
- Working Days (Monday-Sunday)
- Description

**Stage 4: Planning Selection** (Onboarding Screen 3)
- Free Plan / Gold Plan (future billing)
- Add bank account (future payment)

**Database Update:**
```sql
-- Update vendor profile after each stage
UPDATE public.vendor_profiles
SET 
  owner_name = 'John Doe',
  address = '123 Main St',
  business_type = 'food',
  onboarding_status = 'business_details',
  updated_at = NOW()
WHERE user_id = auth.uid();
```

### 4.2: Customer Onboarding (Minimal)

**Stage 1: Phone OTP** (Registration Screen)
- Mobile Number âœ“ REQUIRED
- OTP Verification

**Stage 2: Basic Info** (Optional - After OTP)
- Name
- Email (optional)

**Database Update:**
```sql
-- Customer profile auto-created by trigger on OTP verification
-- Can update with name/email after
UPDATE public.customer_profiles
SET 
  name = 'Jane Doe',
  email = 'jane@example.com',
  updated_at = NOW()
WHERE user_id = auth.uid();
```

### 4.3: Guest Checkout (No Auth)

**Guest Session Creation:**
- Mobile Number âœ“ REQUIRED
- Name (optional)
- Email (optional)

**Database Insert:**
```sql
-- Create guest session
INSERT INTO public.guest_sessions (
  session_token,
  customer_name,
  mobile_number,
  email
) VALUES (
  'guest_1234567890_abc123',
  'Guest User',
  '+919876543210',
  'guest@example.com'
) RETURNING *;
```

---

## Part 5: Authentication Providers Integration

### 5.1: Email/Password (Vendor Registration)

```javascript
// Vendor registration with Supabase
async function registerVendor(email, password, businessName, mobileNumber) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: businessName,
        mobile_number: mobileNumber,
        user_type: 'vendor' // Trigger function will use this
      },
      emailRedirectTo: `${window.location.origin}/vendor/verify-email`
    }
  });

  if (error) throw error;
  
  // Vendor profile created automatically via trigger
  return data.user;
}
```

### 5.2: Phone OTP (Customer Registration)

```javascript
// Step 1: Send OTP
async function sendOTPtoCustomer(phone) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phone,
    options: {
      shouldCreateUser: true,
      data: {
        user_type: 'customer'
      }
    }
  });

  if (error) throw error;
  return data;
}

// Step 2: Verify OTP
async function verifyOTPCustomer(phone, otp) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phone,
    token: otp,
    type: 'sms'
  });

  if (error) throw error;
  
  // Customer profile created automatically via trigger
  return data.user;
}
```

### 5.3: Google OAuth (Vendor - Optional)

```javascript
// Vendor Google Sign-In
async function signInVendorWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/vendor/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      },
      scopes: 'profile email'
    }
  });

  if (error) throw error;
  return data;
}
```

---

## Part 6: Data Flow Diagrams

### Vendor Flow:
```
1. Register Screen
   â†“
   Email + Password + Business Name + Mobile Number
   â†“
2. Supabase Auth Sign-Up
   â†“
   Trigger: Create vendor_profiles entry
   Trigger: Create user_roles entry (role='vendor')
   â†“
3. Email Verification
   â†“
4. Onboarding Screen 1 (Business Details)
   â†“
   Update vendor_profiles (owner_name, address, etc.)
   â†“
5. Onboarding Screen 2 (Operational Details)
   â†“
   Update vendor_profiles (working_days, operational_hours)
   â†“
6. Onboarding Screen 3 (Plan Selection)
   â†“
   Complete Registration â†’ Redirect to Dashboard
```

### Customer Flow:
```
1. Login Screen
   â†“
   Enter Mobile Number
   â†“
2. Supabase OTP Sign-In
   â†“
3. Enter OTP from SMS
   â†“
   Trigger: Create customer_profiles entry
   Trigger: Create user_roles entry (role='customer')
   â†“
4. Redirect to Dashboard/Menu
```

### Guest Flow:
```
1. Scan QR Code
   â†“
2. Browse Menu (Public Products)
   â†“
3. Click "Continue as Guest"
   â†“
4. Guest Session Form
   â†“
   Mobile Number + Name (optional) + Email (optional)
   â†“
5. Insert into guest_sessions table
   â†“
   Store session_token in localStorage
   â†“
6. Proceed to Checkout
   â†“
7. Place Order (linked to guest_session_id)
```

---

## Part 7: Key Points for Implementation

| Aspect | Details |
|--------|---------|
| **Vendor Mobile** | REQUIRED in registration, stored in `vendor_profiles.mobile_number` |
| **Customer Mobile** | REQUIRED for OTP, stored in `customer_profiles.mobile_number` |
| **Guest Mobile** | REQUIRED during guest checkout, stored in `guest_sessions.mobile_number` |
| **Auth Trigger** | Email/Password creates vendor, OTP creates customer via triggers |
| **Onboarding Stages** | Tracked in `vendor_profiles.onboarding_status` field |
| **Session Storage** | Guest sessions use `session_token` in localStorage |
| **RLS Security** | Vendors only see their data, customers see theirs, public sees available items |

---

## Part 8: Database Setup Checklist

- [ ] All tables created with indexes
- [ ] RLS enabled on all tables
- [ ] Trigger functions created for vendors
- [ ] Trigger functions created for customers
- [ ] RLS policies created for all tables
- [ ] Email provider configured in Supabase
- [ ] SMS/OTP provider configured (Twilio/MessageBird)
- [ ] Google OAuth configured (optional, for vendors)
- [ ] Test vendor registration flow
- [ ] Test customer OTP flow
- [ ] Test guest session creation
- [ ] Verify data is being stored correctly

---

## Part 9: SQL Summary (All-in-One)

Run this to set up everything:

```sql
-- 1. Create all tables (from sections 1.1-1.6 above)
-- 2. Create trigger functions (from sections 2.1-2.2)
-- 3. Create RLS policies (from sections 3.1-3.5)
-- 4. Test by signing up as vendor and customer
-- 5. Verify data in public.vendor_profiles, public.customer_profiles, public.user_roles
```

Help me One by one