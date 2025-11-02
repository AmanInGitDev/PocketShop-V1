# 🚀 PocketShop Quick Start Guide

## ✅ You're Almost There!

Your credentials are configured. Now follow these **3 simple steps**:

---

## Step 1: Set Up Database (5 minutes)

1. Go to your Supabase Dashboard: https://app.supabase.com/project/ovfcyvyavpzkijyfhezp
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `DATABASE_SETUP_COMPLETE.sql` from your project root
5. **Copy the ENTIRE file** (all 700+ lines)
6. **Paste into SQL Editor**
7. Click **Run** (or press `Ctrl+Enter`)
8. Wait for "Success" message ✅

**That's it!** Your database is now ready.

---

## Step 2: Start Your App (30 seconds)

```bash
cd frontend
npm run dev
```

The app will open at: **http://localhost:3000** 🎉

---

## Step 3: Test Registration (1 minute)

1. Go to http://localhost:3000
2. Click **"Join PocketShop"**
3. Fill in the form:
   - Business Name: `Test Restaurant`
   - Email: `test@example.com`
   - Mobile Number: `+1234567890`
   - Password: `test123456`
4. Click **"Register"**
5. You'll be redirected to onboarding, then dashboard! ✅

---

## ✅ Verification

After registration, check Supabase:

1. Go to **Authentication** → **Users** → you'll see your new user ✅
2. Go to **Table Editor** → **vendor_profiles** → you'll see your profile ✅
3. Go to **Table Editor** → **user_roles** → you'll see role='vendor' ✅

**If you see all three, everything is working perfectly!** 🎉

---

## 🐛 Troubleshooting

### "Profile error" in console
→ Database not set up yet. Go back to Step 1.

### Can't register
→ Check triggers exist: `SELECT trigger_name FROM information_schema.triggers`

### App won't start
→ Make sure you're in the `frontend` folder and ran `npm install`

### "Loading..." screen forever
→ Check browser console (F12) for errors

---

## 📝 Quick Commands

```bash
# Start frontend
cd frontend
npm run dev

# Build for production
cd frontend
npm run build

# Install dependencies (if needed)
cd frontend
npm install
```

---

## 🎯 What to Do Next

1. ✅ Complete database setup (Step 1 above)
2. ✅ Test registration flow
3. ✅ Test login flow
4. ✅ Explore the dashboard
5. ✅ Check data in Supabase

---

**Need help?** Check `SETUP_COMPLETE.md` or `SUPABASE_SETUP.md` for detailed guides.

**You're ready to go!** 🚀

