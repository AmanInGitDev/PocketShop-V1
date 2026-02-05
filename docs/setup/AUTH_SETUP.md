# PocketShop Auth Setup Checklist

Use this checklist when authentication is not working.

---

## Step 1: Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (or use existing)
3. Wait for the project to finish provisioning

---

## Step 2: Environment Variables

Create `frontend/.env.local` with:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Where to find these:**
- Supabase Dashboard → **Project Settings** (gear icon) → **API**
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

**Verify in browser console:** On app load you should see:
```
Supabase Config: { url: '✓ Set', key: '✓ Set' }
```
If you see `✗ Missing`, the env vars are not loaded. Restart the dev server (`npm run dev`) after changing `.env.local`.

---

## Step 3: Supabase Auth Settings

In Supabase Dashboard → **Authentication** → **URL Configuration**:

| Setting | Value |
|---------|-------|
| **Site URL** | `http://localhost:5173` (or your dev URL, e.g. `http://localhost:3000`) |
| **Redirect URLs** | Add these (one per line): |
| | `http://localhost:5173/**` |
| | `http://localhost:5173/login` |
| | `http://localhost:5173/auth/callback` |
| | `http://localhost:5173/vendor/onboarding/stage-1` |
| | `http://127.0.0.1:5173/**` (if you use 127.0.0.1) |

**Important:** Match the port your app runs on. Check terminal output when you run `npm run dev`.

---

## Step 4: Email Auth Settings (Optional but Recommended for Dev)

In **Authentication** → **Providers** → **Email**:

- **Enable Email provider** – must be ON
- **Confirm email** – For local dev, you can turn this **OFF** so you can log in without confirming email. For production, keep it ON.
- **Secure email change** – optional

If "Confirm email" is ON and you have no SMTP configured, Supabase sends magic links from its own email. Check spam. Or disable confirm for dev.

---

## Step 5: Database Setup

Run the setup script so tables and triggers exist:

1. Supabase Dashboard → **SQL Editor** → **New Query**
2. Open `docs/database/DATABASE_SETUP_COMPLETE.sql`
3. Copy the **entire** file and paste into the SQL Editor
4. Click **Run**
5. Ensure there are no errors

This creates:
- `vendor_profiles`, `customer_profiles`, `user_roles`, etc.
- Triggers that create a vendor profile when a user signs up with `user_type: 'vendor'`
- RLS policies

---

## Step 6: Auth Providers (Google, Phone)

**Google OAuth** (optional):
- Authentication → Providers → Google → Enable
- Add OAuth credentials from Google Cloud Console

**Phone OTP** (optional):
- Authentication → Providers → Phone → Enable
- Requires Twilio (or similar) for SMS in production

For basic testing, **email/password** is enough.

---

## Step 7: Quick Test

1. Restart dev server: `npm run dev`
2. Open the app (e.g. `http://localhost:5173`)
3. Go to **Register** (`/register`)
4. Fill: Business name, email, mobile, password
5. Click **Register**
6. If confirm email is OFF: you should land on onboarding stage 1
7. If confirm email is ON: check email and confirm, then you should land on stage 1

---

## Common Issues

### "Missing Supabase environment variables"
- Create `frontend/.env.local` with correct values
- Restart dev server
- Env vars must start with `VITE_` for Vite to expose them

### Login/register does nothing or errors
- Check browser **Network** tab for failed requests to `*.supabase.co`
- Check **Console** for errors
- Confirm Site URL and Redirect URLs in Supabase match your app URL

### "User already registered" or signup fails
- Check Supabase **Authentication** → **Users** – user may already exist
- Try a different email

### Redirects to login after confirming email
- Ensure Redirect URLs include `http://localhost:YOUR_PORT/vendor/onboarding/stage-1`
- Check that `detectSessionInUrl: true` is set in `supabaseClient.ts` (it is by default)

### Database errors (e.g. "relation does not exist")
- Run `docs/database/DATABASE_SETUP_COMPLETE.sql` in Supabase SQL Editor

### Trigger not creating vendor profile
- Ensure signup passes `user_type: 'vendor'` in metadata (the app does this)
- Check Supabase **Table Editor** → `vendor_profiles` after signup

---

## Port Note

Vite default port is **5173**. If your app runs on a different port, update Supabase Site URL and Redirect URLs to match.
