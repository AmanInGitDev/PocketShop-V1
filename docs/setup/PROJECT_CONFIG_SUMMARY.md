# PocketShop - Complete Configuration Summary

**Last Updated:** Based on current codebase audit

---

## ✅ PORT CONFIGURATION

### Code Configuration
- **File:** `frontend/vite.config.ts`
- **Port:** `5173` ✅
- **URL:** `http://localhost:5173`

```typescript
server: {
  port: 5173,
  open: true
}
```

**Status:** ✅ CORRECT - All code uses port 5173

---

## ✅ AUTHENTICATION CONFIGURATION

### 1. Supabase Client (`frontend/src/lib/supabaseClient.ts`)

**Environment Variables Required:**
```env
VITE_SUPABASE_URL=https://ovfcyvyavpzkijyfhezp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Configuration:**
```typescript
auth: {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,  // ✅ Important for OAuth
}
```

**Status:** ✅ CORRECT

---

### 2. OAuth Google Sign-In (`frontend/src/features/auth/services/authService.ts`)

**Redirect URL:**
```typescript
redirectTo: `${window.location.origin}/auth/callback`
// Resolves to: http://localhost:5173/auth/callback
```

**Status:** ✅ CORRECT

---

### 3. Auth Callback Route (`frontend/src/routes/publicRoutes.ts`)

**Route:**
```typescript
{
  path: ROUTES.AUTH_CALLBACK,  // '/auth/callback'
  component: AuthCallbackPage,
  ...
}
```

**Status:** ✅ CORRECT

---

### 4. Route Constants (`frontend/src/constants/routes.ts`)

**OAuth Callback:**
```typescript
AUTH_CALLBACK: '/auth/callback'
```

**Status:** ✅ CORRECT

---

## ✅ SUPABASE DASHBOARD CONFIGURATION

### Required Settings:

**1. Site URL:**
```
http://localhost:5173
```

**2. Redirect URLs (must include):**
```
http://localhost:5173/auth/callback
http://localhost:5173/**
```

**3. Google Provider:**
- **Enabled:** ON
- **Client ID:** `993790013015-k95j2chj71vkjlvlvkrg0t2f167mlumh.apps.googleusercontent.com`
- **Client Secret:** (Must match Google Cloud Console)

**Status:** ⚠️ VERIFY IN SUPABASE DASHBOARD

---

## ✅ GOOGLE CLOUD CONSOLE CONFIGURATION

### Required Settings:

**1. Authorized JavaScript Origins:**
```
http://localhost:5173
```

**2. Authorized Redirect URIs (must include):**
```
https://ovfcyvyavpzkijyfhezp.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
```

**3. OAuth Client:**
- **Client ID:** `993790013015-k95j2chj71vkjlvlvkrg0t2f167mlumh.apps.googleusercontent.com`
- **Client Secret:** (Must match Supabase)

**Status:** ⚠️ VERIFY IN GOOGLE CLOUD CONSOLE

---

## ✅ ENVIRONMENT VARIABLES

### File: `frontend/.env.local` (create if missing)

**Required:**
```env
VITE_SUPABASE_URL=https://ovfcyvyavpzkijyfhezp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Optional:**
```env
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

**Status:** ⚠️ VERIFY FILE EXISTS AND VALUES ARE CORRECT

---

## ✅ CODE FLOW SUMMARY

### OAuth Google Sign-In Flow:

1. **User clicks "Sign in with Google"**
   - Calls: `signInWithGoogle()` from `authService.ts`
   - Redirects to: Google OAuth

2. **Google redirects to Supabase**
   - URL: `https://ovfcyvyavpzkijyfhezp.supabase.co/auth/v1/callback?code=...`
   - Google must have this URL in "Authorized redirect URIs"

3. **Supabase exchanges code for tokens**
   - Uses Client ID/Secret from Supabase → Providers → Google
   - Must match Google Cloud Console exactly

4. **Supabase redirects to your app**
   - URL: `http://localhost:5173/auth/callback#access_token=...`
   - Supabase must have this URL in "Redirect URLs"

5. **AuthCallbackPage processes session**
   - Detects tokens in URL hash
   - Establishes session via Supabase
   - Redirects to dashboard or onboarding

---

## ⚠️ VERIFICATION CHECKLIST

### Code (All ✅ - Verified)
- [x] Port: 5173 in vite.config.ts
- [x] OAuth redirectTo: `/auth/callback`
- [x] Route exists: `/auth/callback`
- [x] Supabase client: detectSessionInUrl: true

### Supabase Dashboard (⚠️ Verify)
- [ ] Site URL: `http://localhost:5173`
- [ ] Redirect URLs include: `http://localhost:5173/auth/callback`
- [ ] Google Provider: Enabled = ON
- [ ] Google Client ID matches Google Cloud Console
- [ ] Google Client Secret matches Google Cloud Console

### Google Cloud Console (⚠️ Verify)
- [ ] Authorized JavaScript Origins: `http://localhost:5173`
- [ ] Authorized Redirect URIs include: `https://ovfcyvyavpzkijyfhezp.supabase.co/auth/v1/callback`
- [ ] OAuth Consent Screen: Test users added (if in Testing mode)

### Environment Variables (⚠️ Verify)
- [ ] File exists: `frontend/.env.local`
- [ ] `VITE_SUPABASE_URL` = `https://ovfcyvyavpzkijyfhezp.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = (your actual key)
- [ ] Dev server restarted after changes

---

## 🔧 QUICK FIX COMMANDS

### Check if port 5173 is in use:
```powershell
netstat -ano | findstr :5173
```

### Kill Node processes:
```powershell
taskkill /F /IM node.exe
```

### Start dev server:
```powershell
cd frontend
npm run dev
```

---

## 📝 CURRENT ISSUE

**Error:** `Unable to exchange external code`

**Most Likely Cause:** Google Client Secret mismatch between Supabase and Google Cloud Console

**Fix Steps:**
1. Google Cloud Console → Credentials → Your OAuth Client
2. Create new Client Secret
3. Copy new secret
4. Supabase → Authentication → Providers → Google
5. Paste new secret → Save
6. Test again

---

## 📚 RELATED DOCS

- [AUTH_SETUP.md](AUTH_SETUP.md) - Initial auth setup
- [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - Google OAuth setup
- [PORT_CONFIG.md](PORT_CONFIG.md) - Port configuration details
- [../troubleshooting/oauth/OAUTH_TROUBLESHOOTING.md](../troubleshooting/oauth/OAUTH_TROUBLESHOOTING.md) - OAuth debugging
- [../troubleshooting/oauth/OAUTH_FIX.md](../troubleshooting/oauth/OAUTH_FIX.md) - OAuth error fixes

---

**Summary:** All code is correctly configured for port 5173 and OAuth callback `/auth/callback`. The issue is likely in Supabase/Google Cloud Console configuration mismatches.
