# Debug Loading Issue

If you're stuck on "Loading...", check these:

## Quick Fixes

1. **Open Browser Console** (F12 or Right-click → Inspect → Console)
   - Look for any red error messages
   - Copy any errors you see

2. **Check Network Tab** (F12 → Network)
   - Look for failed requests to Supabase
   - Check if `vendor_profiles` queries are failing

3. **Most Common Issue: Missing RLS Policies**
   - The app is trying to query `vendor_profiles` but might not have permission
   - **Fix:** Run the RLS policies SQL in Supabase (see below)

## Step-by-Step Debug

### Step 1: Check Browser Console
Open console and look for:
- `Profile error: ...` - This shows what's wrong with vendor_profiles query
- `Error fetching vendor profile: ...` - RLS policy issue
- `Error creating vendor profile: ...` - Insert permission issue

### Step 2: Add RLS Policies
Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Vendors can view their own profile
DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can view own profile"
ON public.vendor_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Vendors can insert their own profile
DROP POLICY IF EXISTS "Vendors can insert own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors can insert own profile"
ON public.vendor_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Step 3: Check Your User
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Make sure your demo user exists and is confirmed

### Step 4: Test Connection
Open browser console and run:
```javascript
// Check if Supabase is connected
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

## What the Fix Does

The updated code now:
- ✅ Always stops loading, even if there's an error
- ✅ Logs detailed error messages to console
- ✅ Allows login even if vendor_profiles query fails (uses basic user info)
- ✅ Handles missing profiles gracefully

## Still Stuck?

Share the console error messages and I'll help debug!

