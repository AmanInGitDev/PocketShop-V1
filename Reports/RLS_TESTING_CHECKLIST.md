# PocketShop RLS Policies Testing Checklist

This document provides step-by-step instructions to test all RLS policies using Supabase SQL Editor and API calls.

## Prerequisites

- ✅ All tables created (`pocketshop_schema.sql` executed)
- ✅ Triggers created (`pocketshop_triggers.sql` executed)
- ✅ RLS policies created (`pocketshop_rls_policies.sql` executed)
- ✅ Test users created (one vendor, one customer)

---

## Setup: Create Test Users

### Step 1: Create Test Vendor via Supabase Dashboard

1. Go to **Authentication > Users > Add User**
2. Create user:
   - Email: `test-vendor@example.com`
   - Password: `TestPassword123!`
   - User Metadata (raw_user_meta_data):
     ```json
     {
       "user_type": "vendor",
       "business_name": "Test Vendor Shop",
       "mobile_number": "+919876543210"
     }
     ```
3. Note the `user_id` (UUID) - you'll need this for testing

### Step 2: Create Test Customer via Supabase Dashboard

1. Go to **Authentication > Users > Add User**
2. Create user:
   - Phone: `+919876543211`
   - User Metadata (raw_user_meta_data):
     ```json
     {
       "user_type": "customer",
       "name": "Test Customer"
     }
     ```
3. Note the `user_id` (UUID)

### Step 3: Verify Profiles Created

```sql
-- Check vendor profile
SELECT id, user_id, email, business_name, onboarding_status
FROM public.vendor_profiles
WHERE email = 'test-vendor@example.com';

-- Check customer profile
SELECT id, user_id, name, mobile_number, phone_verified
FROM public.customer_profiles
WHERE mobile_number = '+919876543211';
```

---

## Testing Method 1: SQL Editor with Service Role

**Note:** Service role bypasses RLS. Use this to set up test data, then test with authenticated users.

### Switch to Authenticated User Context

In Supabase SQL Editor, you can simulate user context using:

```sql
-- Set session for vendor user (replace with actual user_id)
SET LOCAL request.jwt.claim.sub = 'VENDOR_USER_ID_HERE';

-- Set session for customer user
SET LOCAL request.jwt.claim.sub = 'CUSTOMER_USER_ID_HERE';

-- Clear session (public access)
RESET request.jwt.claim.sub;
```

**However**, the recommended approach is to test via the Supabase Client API (see Method 2 below).

---

## Testing Method 2: Supabase Client API (Recommended)

Use the Supabase JavaScript client to test policies with actual authentication.

### Helper Function: Guest Session Token Validator

First, create this function in Supabase SQL Editor to help with guest session testing:

```sql
-- Function to validate guest session token and return session data
CREATE OR REPLACE FUNCTION public.get_guest_session_by_token(token TEXT)
RETURNS TABLE (
  id UUID,
  session_token TEXT,
  customer_name TEXT,
  mobile_number TEXT,
  is_active BOOLEAN,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gs.id,
    gs.session_token,
    gs.customer_name,
    gs.mobile_number,
    gs.is_active,
    gs.expires_at
  FROM public.guest_sessions gs
  WHERE gs.session_token = token
    AND gs.is_active = TRUE
    AND gs.expires_at > NOW();
END;
$$;
```

---

## Test Checklist by Table

### ✅ 1. VENDOR_PROFILES Policies

#### Test 1.1: Vendor Can View Own Profile
**Context:** Authenticated as vendor
```javascript
// Frontend code
const { data, error } = await supabase
  .from('vendor_profiles')
  .select('*')
  .eq('user_id', userId) // Should return own profile
  .single();

// Expected: ✅ Returns vendor's own profile
```

**SQL Test (as vendor):**
```sql
-- Simulate vendor context (replace USER_ID)
SET LOCAL request.jwt.claim.sub = 'VENDOR_USER_ID';
SELECT * FROM public.vendor_profiles WHERE user_id = auth.uid();
-- Expected: ✅ Returns 1 row (own profile)
```

#### Test 1.2: Public Can View Active Vendors
**Context:** Unauthenticated (public)
```javascript
// Frontend code (no auth)
const { data, error } = await supabase
  .from('vendor_profiles')
  .select('*')
  .eq('is_active', true); // Should return active vendors only

// Expected: ✅ Returns only vendors where is_active = TRUE
```

**SQL Test (public):**
```sql
-- First, activate a vendor
UPDATE public.vendor_profiles 
SET is_active = TRUE 
WHERE email = 'test-vendor@example.com';

-- Then test as public (no auth context)
SELECT * FROM public.vendor_profiles WHERE is_active = TRUE;
-- Expected: ✅ Returns active vendors only
```

#### Test 1.3: Vendor Can Update Own Profile
**Context:** Authenticated as vendor
```javascript
const { data, error } = await supabase
  .from('vendor_profiles')
  .update({ 
    business_name: 'Updated Business Name',
    description: 'New description'
  })
  .eq('user_id', userId)
  .select();

// Expected: ✅ Update succeeds
```

#### Test 1.4: Vendor Cannot Update Other Vendor's Profile
**Context:** Authenticated as vendor, trying to update different vendor
```javascript
// Get a different vendor's ID
const { data: otherVendor } = await supabase
  .from('vendor_profiles')
  .select('id')
  .neq('user_id', userId)
  .limit(1)
  .single();

// Try to update (should fail)
const { error } = await supabase
  .from('vendor_profiles')
  .update({ business_name: 'Hacked Name' })
  .eq('id', otherVendor.id);

// Expected: ❌ Error - Policy violation
```

---

### ✅ 2. CUSTOMER_PROFILES Policies

#### Test 2.1: Customer Can View Own Profile
**Context:** Authenticated as customer
```javascript
const { data, error } = await supabase
  .from('customer_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

// Expected: ✅ Returns customer's own profile
```

#### Test 2.2: Customer Cannot View Other Customer's Profile
**Context:** Authenticated as customer
```javascript
// Try to view another customer (should fail)
const { data, error } = await supabase
  .from('customer_profiles')
  .select('*')
  .neq('user_id', userId)
  .limit(1);

// Expected: ❌ Returns empty array (policy blocks access)
```

#### Test 2.3: Customer Can Update Own Profile
**Context:** Authenticated as customer
```javascript
const { data, error } = await supabase
  .from('customer_profiles')
  .update({ 
    name: 'Updated Name',
    email: 'newemail@example.com'
  })
  .eq('user_id', userId)
  .select();

// Expected: ✅ Update succeeds
```

---

### ✅ 3. PRODUCTS Policies

#### Test 3.1: Public Can View Available Products
**Context:** Unauthenticated
```javascript
// Create a product first (as vendor)
const { data: product } = await supabase
  .from('products')
  .insert({
    vendor_id: vendorProfileId,
    name: 'Test Product',
    price: 25.50,
    is_available: true
  })
  .select()
  .single();

// Then view as public
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_available', true);

// Expected: ✅ Returns available products
```

#### Test 3.2: Public Cannot View Unavailable Products
**Context:** Unauthenticated
```javascript
// First, set product to unavailable (as vendor)
await supabase
  .from('products')
  .update({ is_available: false })
  .eq('id', productId);

// Then try to view as public
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId);

// Expected: ❌ Returns empty (product filtered out by RLS)
```

#### Test 3.3: Vendor Can Insert Own Products
**Context:** Authenticated as vendor
```javascript
const { data, error } = await supabase
  .from('products')
  .insert({
    vendor_id: ownVendorId,
    name: 'New Product',
    price: 15.99,
    category: 'Food',
    is_available: true
  })
  .select();

// Expected: ✅ Insert succeeds
```

#### Test 3.4: Vendor Cannot Insert Products for Other Vendors
**Context:** Authenticated as vendor
```javascript
// Get another vendor's ID
const { data: otherVendor } = await supabase
  .from('vendor_profiles')
  .select('id')
  .neq('user_id', userId)
  .limit(1)
  .single();

// Try to insert (should fail)
const { error } = await supabase
  .from('products')
  .insert({
    vendor_id: otherVendor.id,
    name: 'Unauthorized Product',
    price: 10.00
  });

// Expected: ❌ Error - Policy violation
```

#### Test 3.5: Vendor Can Update Own Products
**Context:** Authenticated as vendor
```javascript
const { data, error } = await supabase
  .from('products')
  .update({ 
    price: 29.99,
    is_available: false
  })
  .eq('vendor_id', ownVendorId)
  .eq('id', productId)
  .select();

// Expected: ✅ Update succeeds
```

---

### ✅ 4. ORDERS Policies

#### Test 4.1: Vendor Can View Their Orders
**Context:** Authenticated as vendor
```javascript
// First create an order (as customer/guest)
const { data: order } = await supabase
  .from('orders')
  .insert({
    vendor_id: vendorId,
    customer_id: customerId,
    items: [{ product_id: 'xxx', quantity: 2, price: 25.50, name: 'Product' }],
    total_amount: 51.00,
    status: 'pending'
  })
  .select()
  .single();

// Then view as vendor
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('vendor_id', vendorId);

// Expected: ✅ Returns orders for this vendor
```

#### Test 4.2: Customer Can View Own Orders
**Context:** Authenticated as customer
```javascript
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('customer_id', customerProfileId);

// Expected: ✅ Returns customer's orders
```

#### Test 4.3: Customer Cannot View Other Customer's Orders
**Context:** Authenticated as customer
```javascript
// Try to view orders for different customer (should fail)
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .neq('customer_id', customerProfileId)
  .limit(1);

// Expected: ❌ Returns empty array
```

#### Test 4.4: Anyone Can Create Orders (Guest Checkout)
**Context:** Unauthenticated (public)
```javascript
// Create guest session first
const { data: guestSession } = await supabase
  .from('guest_sessions')
  .insert({
    session_token: 'guest_' + Date.now(),
    mobile_number: '+919876543212',
    customer_name: 'Guest User'
  })
  .select()
  .single();

// Create order as guest
const { data, error } = await supabase
  .from('orders')
  .insert({
    vendor_id: vendorId,
    guest_session_id: guestSession.id,
    items: [{ product_id: 'xxx', quantity: 1, price: 25.50, name: 'Product' }],
    total_amount: 25.50,
    customer_phone: '+919876543212',
    customer_name: 'Guest User'
  })
  .select();

// Expected: ✅ Insert succeeds (guest checkout works)
```

#### Test 4.5: Order INSERT Validation (WITH CHECK)
**Context:** Any (test validation)
```javascript
// Try to insert invalid order (no items)
const { error } = await supabase
  .from('orders')
  .insert({
    vendor_id: vendorId,
    items: null, // Invalid: items required
    total_amount: 0
  });

// Expected: ❌ Error - items IS NOT NULL check fails

// Try to insert invalid order (negative amount)
const { error2 } = await supabase
  .from('orders')
  .insert({
    vendor_id: vendorId,
    items: [{ product_id: 'xxx', quantity: 1, price: 10 }],
    total_amount: -10.00 // Invalid: must be >= 0
  });

// Expected: ❌ Error - total_amount >= 0 check fails
```

#### Test 4.6: Vendor Can Update Order Status
**Context:** Authenticated as vendor
```javascript
const { data, error } = await supabase
  .from('orders')
  .update({ 
    status: 'confirmed',
    payment_status: 'paid'
  })
  .eq('vendor_id', vendorId)
  .eq('id', orderId)
  .select();

// Expected: ✅ Update succeeds
```

#### Test 4.7: Customer Cannot Update Order Status
**Context:** Authenticated as customer
```javascript
// Try to update order status (should fail)
const { error } = await supabase
  .from('orders')
  .update({ status: 'completed' })
  .eq('customer_id', customerProfileId)
  .eq('id', orderId);

// Expected: ❌ Error - Policy violation (only vendors can update)
```

---

### ✅ 5. GUEST_SESSIONS Policies

#### Test 5.1: Anyone Can Create Guest Sessions
**Context:** Unauthenticated
```javascript
const { data, error } = await supabase
  .from('guest_sessions')
  .insert({
    session_token: 'test_token_' + Date.now(),
    mobile_number: '+919876543213',
    customer_name: 'Guest Test',
    email: 'guest@example.com'
  })
  .select();

// Expected: ✅ Insert succeeds
```

#### Test 5.2: Validate Guest Session Token (Function)
**Context:** Application layer (use helper function)
```javascript
// Call the helper function
const { data, error } = await supabase
  .rpc('get_guest_session_by_token', { 
    token: 'test_token_1234567890' 
  });

// Expected: ✅ Returns session if token matches and is active
```

**SQL Test:**
```sql
-- Create a guest session
INSERT INTO public.guest_sessions (
  session_token,
  mobile_number,
  customer_name
) VALUES (
  'test_token_12345',
  '+919876543214',
  'Test Guest'
);

-- Validate token
SELECT * FROM public.get_guest_session_by_token('test_token_12345');
-- Expected: ✅ Returns session data
```

#### Test 5.3: User Can View Converted Guest Session
**Context:** Authenticated as customer (after converting guest session)
```sql
-- Convert guest session to user
UPDATE public.guest_sessions
SET converted_to_user_id = 'CUSTOMER_USER_ID'
WHERE session_token = 'test_token_12345';

-- Then view as that user
-- Expected: ✅ User can see their converted session
```

---

### ✅ 6. USER_ROLES Policies

#### Test 6.1: User Can View Own Role
**Context:** Authenticated as any user
```javascript
const { data, error } = await supabase
  .from('user_roles')
  .select('*')
  .eq('user_id', userId)
  .single();

// Expected: ✅ Returns user's role
```

#### Test 6.2: Public Can View Roles
**Context:** Unauthenticated
```javascript
const { data, error } = await supabase
  .from('user_roles')
  .select('*');

// Expected: ✅ Returns all roles (needed for vendor lookups)
```

---

## Comprehensive Test Script

Run this complete test sequence:

```javascript
// 1. Authenticate as vendor
const { data: { session: vendorSession } } = await supabase.auth.signInWithPassword({
  email: 'test-vendor@example.com',
  password: 'TestPassword123!'
});

// 2. Verify vendor can see own profile
const { data: vendorProfile } = await supabase
  .from('vendor_profiles')
  .select('*')
  .eq('user_id', vendorSession.user.id)
  .single();
console.log('✅ Vendor profile:', vendorProfile);

// 3. Create a product
const { data: product } = await supabase
  .from('products')
  .insert({
    vendor_id: vendorProfile.id,
    name: 'Test Product',
    price: 25.50,
    is_available: true
  })
  .select()
  .single();
console.log('✅ Product created:', product);

// 4. Switch to customer context
await supabase.auth.signOut();
const { data: { session: customerSession } } = await supabase.auth.signInWithOtp({
  phone: '+919876543211',
  token: '123456' // OTP code
});

// 5. Verify customer can see available products
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_available', true);
console.log('✅ Available products:', products);

// 6. Create order as customer
const { data: order } = await supabase
  .from('orders')
  .insert({
    vendor_id: vendorProfile.id,
    customer_id: customerProfileId,
    items: [{ product_id: product.id, quantity: 2, price: 25.50, name: 'Test Product' }],
    total_amount: 51.00
  })
  .select()
  .single();
console.log('✅ Order created:', order);

// 7. Switch back to vendor, verify can see order
await supabase.auth.signOut();
await supabase.auth.setSession(vendorSession);

const { data: vendorOrders } = await supabase
  .from('orders')
  .select('*')
  .eq('vendor_id', vendorProfile.id);
console.log('✅ Vendor orders:', vendorOrders);
```

---

## Quick Verification Queries

Run these in Supabase SQL Editor to verify policies exist:

```sql
-- Check all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Success Criteria

✅ **All tests pass if:**
1. Vendors can only access their own profiles and products
2. Customers can only access their own profiles and orders
3. Public can view active vendors and available products
4. Guest checkout works (orders can be created without auth)
5. Policy violations return appropriate errors
6. WITH CHECK constraints prevent invalid data

---

## Troubleshooting

### Policy Not Working?
1. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. Check policy exists: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`
3. Verify user is authenticated: `SELECT auth.uid();`
4. Check user has correct role: `SELECT * FROM public.user_roles WHERE user_id = auth.uid();`

### Common Issues
- **"new row violates row-level security policy"**: Check WITH CHECK clause
- **"permission denied for table"**: Verify RLS is enabled and policies exist
- **Policy not firing**: Check USING clause matches your query conditions


