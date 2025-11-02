# Registration & OAuth Redirect Fixes

## Issues Fixed

### 1. **Email Confirmation Issue**
**Problem**: After email/password registration, users were redirected but couldn't proceed because email confirmation was required.

**Fix**:
- Added check for email confirmation status
- Shows clear message to user to check email
- After email confirmation, user is automatically redirected to onboarding
- Added `emailRedirectTo` in signup options to redirect after confirmation

### 2. **OAuth Redirect Issue**
**Problem**: After Google OAuth, users were not redirected anywhere.

**Fix**:
- Updated OAuth redirect URL to `/vendor/auth?oauth=true`
- Added redirect logic in `onAuthStateChange` handler
- Automatically redirects to onboarding if profile incomplete, or dashboard if complete
- Clears OAuth URL parameters after successful authentication

### 3. **Route Issues**
**Problem**: Routes were redirecting to wrong paths.

**Fix**:
- Updated all redirects to use correct onboarding paths (`/vendor/onboarding/stage-1`)
- Added new onboarding routes to App.tsx

## Supabase Configuration Checks

### 1. **Disable Email Confirmation (Recommended for Development)**

In Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Email**
2. **Disable** "Confirm email" toggle
3. This allows immediate login after registration

OR keep it enabled and users will need to confirm email first.

### 2. **Check Database Connection**

Verify these in Supabase Dashboard:

**RLS Policies on `vendor_profiles`:**
```sql
-- Should exist:
-- 1. "Vendors can view own profile" (SELECT)
-- 2. "Vendors can insert own profile" (INSERT)
-- 3. "Vendors can update own profile" (UPDATE)
```

**Trigger Function:**
```sql
-- Should exist: handle_new_vendor()
-- This automatically creates vendor_profiles when user_type='vendor'
```

### 3. **Check OAuth Settings**

1. Go to **Authentication** → **Providers** → **Google**
2. Ensure Google OAuth is enabled
3. Check redirect URLs include your domain
4. Add these redirect URLs:
   - `http://localhost:5173/**` (development)
   - `https://yourdomain.com/**` (production)

## Testing the Fixes

### Email/Password Registration:
1. Fill registration form
2. Submit
3. If email confirmation disabled → Should redirect to onboarding immediately
4. If email confirmation enabled → Check email, click confirmation link → Should redirect to onboarding

### Google OAuth:
1. Click "Sign in with Google"
2. Complete Google authentication
3. Should automatically redirect to:
   - `/vendor/onboarding/stage-1` if profile incomplete
   - `/vendor/dashboard` if onboarding complete

### Phone OTP:
1. Enter phone number
2. Enter OTP
3. Should redirect to `/vendor/onboarding/stage-1`

## Database Connection Verification

Run this query in Supabase SQL Editor to verify connection:

```sql
-- Check if vendor_profiles table exists and is accessible
SELECT COUNT(*) FROM vendor_profiles;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'vendor_profiles';

-- Check trigger function
SELECT proname FROM pg_proc WHERE proname = 'handle_new_vendor';
```

## Common Issues & Solutions

### Issue: "User not authenticated" after registration
**Solution**: Disable email confirmation OR wait for user to confirm email

### Issue: OAuth redirects but stays on auth page
**Solution**: Check OAuth redirect URLs in Supabase settings match your domain

### Issue: Profile creation fails
**Solution**: 
1. Check RLS policies allow INSERT
2. Check trigger function exists and is enabled
3. Check user_type metadata is set correctly

### Issue: Redirect loop
**Solution**: Check `onboarding_status` in vendor_profiles - should be 'incomplete' or 'completed'

## Next Steps

1. **Test each registration method** (Email, OAuth, OTP)
2. **Verify database writes** - Check vendor_profiles table after registration
3. **Test redirect flow** - Ensure users go to correct pages
4. **Check console logs** - Look for any errors in browser console

