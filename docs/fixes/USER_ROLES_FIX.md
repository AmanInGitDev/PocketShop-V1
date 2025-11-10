# User Roles Fix for Manual Supabase Users

## Problem
If a user was created directly in Supabase (not through the app registration), the following may be missing:
1. `user_roles` entry (required by RLS policy)
2. `vendor_profiles` entry

This causes login to fail because the RLS policy for `vendor_profiles` INSERT requires a `user_roles` entry to exist.

## Solution

### Option 1: Run SQL in Supabase SQL Editor (Recommended)

If you have a user ID (`bf7b221e-4485-47e9-8b92-55184d8efa58` in your case), run this SQL:

```sql
-- First, ensure user_roles entry exists
INSERT INTO public.user_roles (user_id, role)
VALUES ('bf7b221e-4485-47e9-8b92-55184d8efa58', 'vendor')
ON CONFLICT (user_id) DO NOTHING;

-- Then create vendor profile if it doesn't exist
INSERT INTO public.vendor_profiles (
  user_id,
  email,
  business_name,
  owner_name,
  onboarding_status
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'business_name', u.email::text, 'My Business'),
  COALESCE(u.raw_user_meta_data->>'full_name', u.email::text, 'Vendor'),
  'incomplete'
FROM auth.users u
WHERE u.id = 'bf7b221e-4485-47e9-8b92-55184d8efa58'
ON CONFLICT (user_id) DO NOTHING;
```

### Option 2: Update User Metadata and Trigger Profile Creation

1. Go to Supabase Dashboard → Authentication → Users
2. Find your user and click Edit
3. Add to `raw_user_meta_data`:
   ```json
   {
     "user_type": "vendor",
     "business_name": "Your Business Name",
     "full_name": "Your Name"
   }
   ```
4. The trigger should automatically create both `user_roles` and `vendor_profiles` entries

### Option 3: Use Supabase Service Role (Admin)

If you have service role access, you can run:

```sql
-- This bypasses RLS
SET LOCAL ROLE service_role;

-- Create user_roles entry
INSERT INTO public.user_roles (user_id, role)
VALUES ('bf7b221e-4485-47e9-8b92-55184d8efa58', 'vendor')
ON CONFLICT (user_id) DO NOTHING;

-- Create vendor profile
INSERT INTO public.vendor_profiles (
  user_id,
  email,
  business_name,
  owner_name,
  onboarding_status
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'business_name', split_part(u.email, '@', 1), 'My Business'),
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Vendor'),
  'incomplete'
FROM auth.users u
WHERE u.id = 'bf7b221e-4485-47e9-8b92-55184d8efa58'
ON CONFLICT (user_id) DO NOTHING;
```

## Verification

After running the fix, verify with:

```sql
-- Check user_roles
SELECT * FROM public.user_roles WHERE user_id = 'bf7b221e-4485-47e9-8b92-55184d8efa58';

-- Check vendor_profiles
SELECT * FROM public.vendor_profiles WHERE user_id = 'bf7b221e-4485-47e9-8b92-55184d8efa58';
```

Both queries should return exactly one row.

## Note

The app has been updated to handle missing profiles more gracefully. Even if profile creation fails, login should still work and redirect to onboarding where the profile can be created properly.

