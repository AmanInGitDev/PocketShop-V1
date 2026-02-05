# Google OAuth Setup Verification

## Your Google Client ID
```
993790013015-k95j2chj71vkjlvlvkrg0t2f167mlumh.apps.googleusercontent.com
```

---

## ✅ Step 1: Verify in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** provider
5. Verify these settings:

### Google Provider Settings:
- **Enabled:** ✅ Toggle should be **ON**
- **Client ID (for OAuth):** `993790013015-k95j2chj71vkjlvlvkrg0t2f167mlumh.apps.googleusercontent.com`
- **Client Secret (for OAuth):** Should be set (masked with `****`)

**If Client ID or Secret is missing:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Copy the **Client ID** (visible)
5. If no Client Secret exists, click **"+ Add secret"** to create one
6. Copy the **Client Secret** (only shown once - save it securely)
7. Paste both into Supabase → Authentication → Providers → Google
8. Click **Save**

---

## ✅ Step 2: Verify Google Cloud Console Settings

### Authorized JavaScript Origins
**Must include:**
- `http://localhost:5173` (or your dev port)

### Authorized Redirect URIs
**Must include (exactly these):**
- `https://ovfcyvyavpzkijyfhezp.supabase.co/auth/v1/callback` ✅
- `http://localhost:5173/auth/callback` ✅

**Remove these (if present):**
- ❌ `http://localhost:5173/vendor/auth`
- ❌ `http://localhost:5173/vendor/onboarding/stage-1`
- ❌ `http://localhost:5173/vendor/dashboard`

---

## ✅ Step 3: Test the Connection

1. **Clear browser cache** (important!)
2. Open your app: `http://localhost:5173/login`
3. Open **DevTools** → **Console** tab
4. Click **"Sign in with Google"**
5. **Watch for errors:**

### Good Signs:
- Redirects to Google sign-in page
- After signing in, redirects back to `/auth/callback`
- Console shows: `[OAuth Callback] Session found`
- Redirects to dashboard or onboarding

### Bad Signs:
- Error: `redirect_uri_mismatch` → Google Redirect URI not configured
- Error: `invalid_client` → Client ID/Secret wrong in Supabase
- Error: `access_denied` → OAuth consent screen issue
- Timeout → Check Supabase Redirect URLs

---

## 🔍 Quick Verification Checklist

- [ ] Google Cloud Console: Client ID matches `993790013015-k95j2chj71vkjlvlvkrg0t2f167mlumh.apps.googleusercontent.com`
- [ ] Google Cloud Console: `http://localhost:5173` in JavaScript origins
- [ ] Google Cloud Console: `http://localhost:5173/auth/callback` in Redirect URIs
- [ ] Supabase: Google provider **Enabled** = ON
- [ ] Supabase: Client ID matches Google Cloud Console
- [ ] Supabase: Client Secret is set (not empty)
- [ ] Supabase: Redirect URLs include `http://localhost:5173/auth/callback`
- [ ] `.env.local` has correct Supabase URL and anon key
- [ ] Dev server restarted after env changes

---

## 🆘 Common Issues

### "redirect_uri_mismatch"
**Fix:** Add `http://localhost:5173/auth/callback` to Google Cloud Console → Authorized redirect URIs

### "invalid_client"
**Fix:** Copy Client ID and Secret from Google Cloud Console → Credentials → Your Client ID → Paste into Supabase

### "Sign-in timed out"
**Fix:** 
- Check Supabase Redirect URLs includes `http://localhost:5173/auth/callback`
- Check browser console for specific errors
- Check Network tab for failed Supabase requests

### Google button does nothing
**Fix:**
- Check browser console for JavaScript errors
- Verify Google provider is enabled in Supabase
- Verify Client ID/Secret are correct

---

## 📝 Notes

- **Client Secret** is sensitive - never commit to git
- **Redirect URIs** must match **exactly** (no trailing slashes, correct port)
- **JavaScript Origins** don't need trailing slashes
- After changing Google Cloud Console settings, changes are **immediate**
- After changing Supabase settings, **save** the changes
