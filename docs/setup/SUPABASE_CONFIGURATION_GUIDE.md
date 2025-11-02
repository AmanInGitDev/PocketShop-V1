# Supabase Configuration Guide - Complete Setup

## 🔧 Critical Supabase Settings for Registration & OAuth

### 1. **OAuth Redirect URLs (Google Provider)**

In Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google OAuth
3. Add these redirect URLs to **Redirect URLs** field:

```
http://localhost:5173/vendor/auth
http://localhost:5173/vendor/onboarding/stage-1
http://localhost:5173/vendor/dashboard
http://127.0.0.1:5173/vendor/auth
https://YOURDOMAIN.com/vendor/auth
https://YOURDOMAIN.com/vendor/onboarding/stage-1
https://YOURDOMAIN.com/vendor/dashboard
https://ovfcvyvyavpzkiyjfhezp.supabase.co/auth/v1/callback
```

**Note**: Replace `YOURDOMAIN.com` with your actual production domain.

### 2. **Email Confirmation Settings**

**Option A: Disable Email Confirmation (Recommended for Development)**

1. Go to **Authentication** → **Providers** → **Email**
2. **Turn OFF** "Confirm email" toggle
3. This allows immediate login after registration

**Option B: Keep Email Confirmation Enabled**

1. Keep "Confirm email" toggle **ON**
2. Users must confirm email before accessing app
3. Confirmation email redirects to `/vendor/onboarding/stage-1`
4. Add redirect URL: `http://localhost:5173/vendor/onboarding/stage-1`

### 3. **Site URL Configuration**

In **Authentication** → **URL Configuration**:

- **Site URL**: `http://localhost:5173` (development) or `https://YOURDOMAIN.com` (production)
- **Redirect URLs**: Add all the URLs listed in section 1 above

### 4. **Phone OTP Settings**

1. Go to **Authentication** → **Providers** → **Phone**
2. Enable Phone provider
3. Configure Twilio (or your SMS provider) if needed
4. For development, use Supabase test OTP: `000000`

### 5. **Database RLS Policies**

Verify these policies exist on `vendor_profiles` table:

```sql
-- 1. Vendors can view their own profile
CREATE POLICY "Vendors can view own profile"
ON public.vendor_profiles FOR SELECT
USING (auth.uid() = user_id);

-- 2. Vendors can insert their own profile
CREATE POLICY "Vendors can insert own profile"
ON public.vendor_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Vendors can update their own profile
CREATE POLICY "Vendors can update own profile"
ON public.vendor_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Public can view active vendor profiles (for storefront)
CREATE POLICY "Public can view active vendor profiles"
ON public.vendor_profiles FOR SELECT
USING (is_active = TRUE);
```

Run in Supabase SQL Editor if missing.

### 6. **Database Trigger Function**

Ensure this trigger exists to auto-create vendor profiles:

```sql
-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_vendor';

-- If not exists, create it (see Reports/pocketshop_triggers.sql)
```

The trigger should:
- Fire on `INSERT` to `auth.users`
- Check for `user_type = 'vendor'` in metadata
- Create corresponding `vendor_profiles` record

### 7. **Testing Checklist**

After configuration:

- [ ] Google OAuth redirects properly
- [ ] Email registration works (with/without confirmation)
- [ ] Phone OTP registration works
- [ ] User profile created in `vendor_profiles` table
- [ ] Redirect to `/vendor/onboarding/stage-1` after registration
- [ ] Redirect to `/vendor/dashboard` after onboarding complete

### 8. **Common Issues & Solutions**

#### Issue: "Redirect URI mismatch"
**Solution**: Add the exact redirect URL to Supabase OAuth settings

#### Issue: "User not authenticated after OAuth"
**Solution**: 
- Check redirect URLs include callback URL
- Verify OAuth provider is enabled
- Check browser console for errors

#### Issue: "Profile not created after registration"
**Solution**:
- Check trigger function exists and is enabled
- Verify RLS policies allow INSERT
- Check `user_type` metadata is set correctly

#### Issue: "Cannot access dashboard after registration"
**Solution**:
- Check `onboarding_status` in vendor_profiles
- Verify RLS policies allow SELECT
- Check user is authenticated (session exists)

### 9. **Environment Variables**

Ensure these are set in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 10. **Production Checklist**

Before going live:

- [ ] Update Site URL to production domain
- [ ] Update all redirect URLs to production domain
- [ ] Enable email confirmation (security)
- [ ] Set up proper SMS provider (not test mode)
- [ ] Review and test all RLS policies
- [ ] Test complete registration flow end-to-end
- [ ] Test OAuth flow end-to-end
- [ ] Test phone OTP flow end-to-end

## 📝 Quick Reference

**Supabase Dashboard URLs:**
- Authentication: `https://supabase.com/dashboard/project/YOUR_PROJECT/auth`
- Database: `https://supabase.com/dashboard/project/YOUR_PROJECT/editor`
- SQL Editor: `https://supabase.com/dashboard/project/YOUR_PROJECT/sql`

**Important Files:**
- Schema: `Reports/pocketshop_schema.sql`
- Triggers: `Reports/pocketshop_triggers.sql`
- RLS Policies: `Reports/pocketshop_rls_policies.sql`

