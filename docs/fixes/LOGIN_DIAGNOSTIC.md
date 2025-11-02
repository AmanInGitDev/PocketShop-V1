# Login Diagnostic Guide

## Problem: Profile Query Timeout

If you're seeing `Exception in profile fetch/creation: Error: Profile query timeout`, follow these diagnostic steps.

## Step 1: Verify Supabase Project Status

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check if your project shows a "Resume" button
3. If paused, click "Resume" and wait 2-3 minutes for the database to restart

## Step 2: Verify RLS Policies

The most common cause is missing or incorrect Row Level Security (RLS) policies.

### Check Current Policies

Run this SQL in Supabase SQL Editor:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'vendor_profiles';

-- List all policies on vendor_profiles
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
WHERE tablename = 'vendor_profiles';
```

### Required RLS Policies

Run this SQL to create/verify the required policies:

```sql
-- 1. Vendors can view their own profile
DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can view own profile"
ON public.vendor_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Vendors can insert their own profile
DROP POLICY IF EXISTS "Vendors can insert own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can insert own profile"
ON public.vendor_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'vendor'
  )
);

-- 3. Vendors can update their own profile
DROP POLICY IF EXISTS "Vendors can update own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can update own profile"
ON public.vendor_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Public can view active vendor profiles (for storefront)
DROP POLICY IF EXISTS "Public can view active vendor profiles" ON public.vendor_profiles;
CREATE POLICY "Public can view active vendor profiles"
ON public.vendor_profiles
FOR SELECT
USING (is_active = TRUE);
```

## Step 3: Verify Table Structure

Run this SQL to verify the table exists and has correct structure:

```sql
-- Check table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'vendor_profiles'
ORDER BY ordinal_position;

-- Verify user_id column exists
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'vendor_profiles' 
AND column_name = 'user_id';
```

## Step 4: Test Query Directly

Test if you can query your profile directly:

```sql
-- Get your user ID first (run this while logged in to Supabase dashboard)
SELECT id, email 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Then test the profile query (replace USER_ID with your actual user ID)
SELECT * 
FROM public.vendor_profiles 
WHERE user_id = 'USER_ID_HERE';
```

## Step 5: Check user_roles Table

The INSERT policy requires a `user_roles` entry. Verify it exists:

```sql
-- Check if user_roles entry exists for your user
SELECT * 
FROM public.user_roles 
WHERE user_id = 'YOUR_USER_ID_HERE' AND role = 'vendor';

-- If missing, create it (replace USER_ID with your actual user ID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'vendor')
ON CONFLICT (user_id) DO NOTHING;
```

## Step 6: Test Authentication

Check if your authentication is working:

1. Open browser console (F12)
2. Run this JavaScript:
```javascript
// In browser console while on your site
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// If session exists, test profile query
if (session?.user) {
  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  console.log('Profile:', data);
  console.log('Error:', error);
}
```

## Step 7: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to log in
4. Look for requests to Supabase:
   - Find requests to `rest/v1/vendor_profiles`
   - Check the response status code
   - If 403: RLS policy issue
   - If 404: Table doesn't exist
   - If 500: Database error

## Common Fixes

### Fix 1: Missing user_roles Entry

If the INSERT policy fails because of missing `user_roles`:

```sql
-- Create user_roles entry for existing user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'vendor'
FROM auth.users
WHERE id = 'YOUR_USER_ID_HERE'
ON CONFLICT (user_id) DO NOTHING;
```

### Fix 2: RLS Policy Too Restrictive

If policies are too restrictive, temporarily disable RLS for testing:

```sql
-- WARNING: Only for testing! Re-enable RLS after fixing policies
ALTER TABLE public.vendor_profiles DISABLE ROW LEVEL SECURITY;

-- Test login

-- Re-enable RLS
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
```

### Fix 3: Profile Doesn't Exist

If your profile doesn't exist, create it manually:

```sql
-- Create profile for existing user (replace values)
INSERT INTO public.vendor_profiles (
  user_id,
  email,
  business_name,
  mobile_number,
  onboarding_status
)
VALUES (
  'YOUR_USER_ID_HERE',
  'your-email@example.com',
  'Your Business Name',
  '+1234567890',
  'incomplete'
)
ON CONFLICT (user_id) DO NOTHING;
```

## Verification Checklist

- [ ] Supabase project is active (not paused)
- [ ] `vendor_profiles` table exists
- [ ] RLS is enabled on `vendor_profiles`
- [ ] "Vendors can view own profile" policy exists
- [ ] "Vendors can insert own profile" policy exists
- [ ] `user_roles` table has entry for your user with role='vendor'
- [ ] Profile query works when run directly in SQL Editor
- [ ] Browser console shows session exists
- [ ] Network tab shows successful API calls

## Still Not Working?

If after checking all above, the issue persists:

1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Check browser console for exact error messages
3. Verify environment variables are set correctly:
   ```bash
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Try creating a fresh test user through the registration flow
5. Check if the issue is network-related (slow connection)

## Quick Test Script

Run this in your browser console to test everything at once:

```javascript
(async () => {
  // 1. Check session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('1. Session:', session ? '✓ Exists' : '✗ Missing', sessionError);
  
  if (!session?.user) {
    console.error('No session found. Please log in first.');
    return;
  }
  
  // 2. Check profile
  const { data: profile, error: profileError } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  console.log('2. Profile:', profile ? '✓ Found' : '✗ Missing', profileError);
  
  // 3. Check user_roles
  const { data: role, error: roleError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  console.log('3. User Role:', role ? '✓ Found' : '✗ Missing', roleError);
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log('Session:', session ? '✓' : '✗');
  console.log('Profile:', profile ? '✓' : '✗');
  console.log('Role:', role ? '✓' : '✗');
  
  if (!profile) {
    console.warn('\n⚠️ Profile missing! This is why login fails.');
    console.log('Fix: Run the profile creation SQL or complete registration.');
  }
})();
```

