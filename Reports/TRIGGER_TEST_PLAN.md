# PocketShop Trigger Functions Test Plan

This document provides a step-by-step guide to verify that the authentication triggers are working correctly.

## Prerequisites

- ✅ `pocketshop_schema.sql` has been executed (all tables exist)
- ✅ `pocketshop_triggers.sql` has been executed (functions and triggers created)
- ✅ Supabase project is accessible and SQL Editor is open

---

## Test Plan: 3-Step Verification

### Step 1: Test Vendor Signup Trigger

**Objective:** Verify that signing up as a vendor automatically creates `vendor_profiles` and `user_roles` entries.

**Method A: Via Supabase Auth API (Recommended)**

```javascript
// In your frontend or via Supabase Dashboard > Authentication > Add User
// Or use Supabase client:

const { data, error } = await supabase.auth.signUp({
  email: 'test-vendor@example.com',
  password: 'TestPassword123!',
  options: {
    data: {
      user_type: 'vendor',
      business_name: 'Test Vendor Shop',
      mobile_number: '+919876543210'
    }
  }
});
```

**Method B: Direct SQL Insert (For Testing Only)**

```sql
-- WARNING: This bypasses Supabase Auth and may cause issues
-- Only use for testing trigger logic directly
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  raw_user_meta_data,
  created_at,
  updated_at,
  email_confirmed_at
)
VALUES (
  gen_random_uuid(),
  'test-vendor@example.com',
  crypt('TestPassword123!', gen_salt('bf')),
  '{"user_type": "vendor", "business_name": "Test Vendor Shop", "mobile_number": "+919876543210"}'::jsonb,
  NOW(),
  NOW(),
  NOW()
)
RETURNING id, email;
```

**Verification Query:**

```sql
-- Check vendor profile was created
SELECT 
  vp.id,
  vp.user_id,
  vp.email,
  vp.business_name,
  vp.mobile_number,
  vp.onboarding_status,
  ur.role
FROM public.vendor_profiles vp
LEFT JOIN public.user_roles ur ON ur.user_id = vp.user_id
WHERE vp.email = 'test-vendor@example.com';
```

**Expected Result:**
- ✅ One row returned
- ✅ `business_name` = 'Test Vendor Shop'
- ✅ `mobile_number` = '+919876543210'
- ✅ `onboarding_status` = 'basic_info'
- ✅ `role` = 'vendor'

---

### Step 2: Test Customer Signup Trigger

**Objective:** Verify that signing up as a customer (via OTP) automatically creates `customer_profiles` and `user_roles` entries.

**Method A: Via Supabase Auth API (Recommended)**

```javascript
// Step 1: Send OTP
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+919876543211',
  options: {
    shouldCreateUser: true,
    data: {
      user_type: 'customer',
      name: 'Test Customer'
    }
  }
});

// Step 2: Verify OTP (use code from SMS)
const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
  phone: '+919876543211',
  token: '123456', // OTP code from SMS
  type: 'sms'
});
```

**Method B: Direct SQL Insert (For Testing Only)**

```sql
-- Simulate customer created via OTP (phone field populated)
INSERT INTO auth.users (
  id,
  phone,
  raw_user_meta_data,
  phone_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '+919876543211',
  '{"user_type": "customer", "name": "Test Customer"}'::jsonb,
  NOW(),
  NOW(),
  NOW()
)
RETURNING id, phone;
```

**Verification Query:**

```sql
-- Check customer profile was created
SELECT 
  cp.id,
  cp.user_id,
  cp.name,
  cp.mobile_number,
  cp.phone_verified,
  cp.email,
  ur.role
FROM public.customer_profiles cp
LEFT JOIN public.user_roles ur ON ur.user_id = cp.user_id
WHERE cp.mobile_number = '+919876543211';
```

**Expected Result:**
- ✅ One row returned
- ✅ `name` = 'Test Customer'
- ✅ `mobile_number` = '+919876543211'
- ✅ `phone_verified` = TRUE
- ✅ `role` = 'customer'

---

### Step 3: Verify No Duplicate Role Insertions

**Objective:** Ensure that if triggers fire multiple times (or manual role insertions occur), duplicates are prevented.

**Test Query:**

```sql
-- Attempt to manually insert duplicate role (should be ignored)
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role
FROM public.user_roles
WHERE role = 'vendor'
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

-- Verify only one role exists per user
SELECT 
  user_id,
  role,
  COUNT(*) as role_count
FROM public.user_roles
GROUP BY user_id, role
HAVING COUNT(*) > 1;
```

**Expected Result:**
- ✅ No rows returned (no duplicates found)
- ✅ Each user_id appears only once in user_roles

**Additional Verification:**

```sql
-- Check all created profiles have corresponding roles
SELECT 
  'vendor_profiles' as table_name,
  COUNT(*) as total_profiles,
  COUNT(DISTINCT ur.user_id) as profiles_with_roles
FROM public.vendor_profiles vp
LEFT JOIN public.user_roles ur ON ur.user_id = vp.user_id AND ur.role = 'vendor'

UNION ALL

SELECT 
  'customer_profiles' as table_name,
  COUNT(*) as total_profiles,
  COUNT(DISTINCT ur.user_id) as profiles_with_roles
FROM public.customer_profiles cp
LEFT JOIN public.user_roles ur ON ur.user_id = cp.user_id AND ur.role = 'customer';
```

**Expected Result:**
- ✅ `total_profiles` = `profiles_with_roles` for both tables
- ✅ All profiles have matching roles

---

## Troubleshooting

### Issue: Trigger Not Firing

**Check 1: Verify triggers exist**
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users';
```

**Check 2: Verify functions exist**
```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_vendor', 'handle_new_customer');
```

### Issue: Profile Created But Role Missing

**Check:**
```sql
-- Find profiles without roles
SELECT 
  vp.user_id,
  vp.email,
  'vendor' as expected_role
FROM public.vendor_profiles vp
LEFT JOIN public.user_roles ur ON ur.user_id = vp.user_id
WHERE ur.user_id IS NULL

UNION ALL

SELECT 
  cp.user_id,
  cp.mobile_number as email,
  'customer' as expected_role
FROM public.customer_profiles cp
LEFT JOIN public.user_roles ur ON ur.user_id = cp.user_id
WHERE ur.user_id IS NULL;
```

### Issue: user_type Not Recognized

**Check raw_user_meta_data:**
```sql
SELECT 
  id,
  email,
  phone,
  raw_user_meta_data,
  raw_user_meta_data->>'user_type' as user_type
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**Solution:** Ensure `user_type` is set correctly during signup:
- Vendor: `raw_user_meta_data->>'user_type' = 'vendor'`
- Customer: `raw_user_meta_data->>'user_type' = 'customer'`

---

## Cleanup (Optional)

After testing, you may want to clean up test data:

```sql
-- Delete test profiles and users (cascade will handle related records)
DELETE FROM auth.users 
WHERE email LIKE 'test-%@example.com' 
   OR phone LIKE '+91987654321%';
```

---

## Success Criteria

✅ **All tests pass if:**
1. Vendor signup creates `vendor_profiles` entry with correct data
2. Vendor signup creates `user_roles` entry with role = 'vendor'
3. Customer signup creates `customer_profiles` entry with correct data
4. Customer signup creates `user_roles` entry with role = 'customer'
5. No duplicate roles exist for any user
6. All profiles have corresponding role entries


