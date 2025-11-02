# Supabase Authentication Setup Guide

This guide will help you configure all three authentication methods (Email/Password, Google OAuth, and Phone OTP) in your Supabase project.

## 📋 Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created
3. Your project's URL and anon key

## 🔧 Step 1: Environment Variables

Create a `.env.local` file in the root of your project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
- Go to your Supabase Dashboard
- Click on **Settings** → **API**
- Copy the **Project URL** → `VITE_SUPABASE_URL`
- Copy the **anon/public** key → `VITE_SUPABASE_ANON_KEY`

---

## 📧 Step 2: Email/Password Authentication

Email/Password authentication is **enabled by default** in Supabase. No additional configuration needed!

### What works automatically:
- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Email verification (if enabled)
- ✅ Password reset

### Optional: Configure Email Templates
1. Go to **Authentication** → **Email Templates**
2. Customize your verification and password reset emails

---

## 🔵 Step 3: Google OAuth Setup

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
   - For local development, also add:
     ```
     http://localhost:3000/auth/v1/callback
     ```
5. Copy your **Client ID** and **Client Secret**

### 3.2 Configure Google in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Enable Google provider
5. Enter your **Client ID** and **Client Secret** from Google Cloud Console
6. Click **Save**

### 3.3 Set Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/vendor/dashboard
   http://localhost:3000/**
   ```
3. For production, add your production URL:
   ```
   https://yourdomain.com/vendor/dashboard
   https://yourdomain.com/**
   ```

---

## 📱 Step 4: Phone OTP (SMS) Setup

### 4.1 Choose SMS Provider

Supabase supports multiple SMS providers. The easiest to set up is **Twilio**.

### 4.2 Option A: Using Twilio (Recommended)

1. **Sign up for Twilio:**
   - Go to [Twilio](https://www.twilio.com/)
   - Create an account and verify your phone number
   - Get a phone number from Twilio

2. **Get Twilio Credentials:**
   - Go to Twilio Console → **Account** → **API Keys & Tokens**
   - Copy your **Account SID**
   - Copy your **Auth Token**

3. **Configure Twilio in Supabase:**
   - Go to Supabase Dashboard → **Authentication** → **Providers**
   - Find **Phone** and click to expand
   - Enable Phone provider
   - Select **Twilio** as the SMS provider
   - Enter:
     - **Twilio Account SID**
     - **Twilio Auth Token**
     - **Twilio Phone Number** (format: +1234567890)
   - Click **Save**

### 4.3 Option B: Using MessageBird

1. Sign up at [MessageBird](https://www.messagebird.com/)
2. Get your API key
3. Configure in Supabase under **Phone** provider settings

### 4.4 Option C: Using Vonage (Nexmo)

1. Sign up at [Vonage](https://www.vonage.com/)
2. Get your API key and secret
3. Configure in Supabase under **Phone** provider settings

### 4.5 Testing Phone OTP

- For development, Twilio provides a test number that accepts any OTP code
- Or use a real phone number you control

---

## 🗄️ Step 5: Database Setup

### 5.1 Create Users Table (if not exists)

Go to **SQL Editor** in Supabase and run:

```sql
-- Create users table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'vendor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## ✅ Step 6: Testing All Three Methods

### Test Email/Password:
1. Go to `/vendor/onboarding`
2. Fill in the registration form and register
3. Check your email for verification (if enabled)
4. Complete the onboarding process

### Test Google OAuth:
1. Go to `/vendor/onboarding`
2. Click "Sign in with Google"
3. Select your Google account
4. You should be redirected to the onboarding flow

### Test Phone OTP:
1. Go to `/vendor/onboarding`
2. Click on "Phone OTP" tab
3. Enter your phone number (format: +1234567890)
4. Click "Send OTP"
5. Enter the OTP code you receive via SMS
6. Click "Verify OTP"
7. You should be redirected to complete onboarding

---

## 🔍 Troubleshooting

### Google OAuth not working:
- ✅ Check that redirect URLs match exactly in both Google Console and Supabase
- ✅ Verify Client ID and Secret are correct
- ✅ Make sure Google+ API is enabled
- ✅ Check browser console for errors

### Phone OTP not working:
- ✅ Verify phone number format (must include country code, e.g., +1234567890)
- ✅ Check Twilio/MessageBird credentials are correct
- ✅ Verify you have credits in your SMS provider account
- ✅ Check Supabase logs for SMS sending errors

### Email/Password not working:
- ✅ Check that email provider is enabled in Supabase
- ✅ Verify SMTP settings if using custom email provider
- ✅ Check spam folder for verification emails

---

## 📝 Additional Notes

1. **Development vs Production:**
   - For local development, use `http://localhost:3000`
   - For production, update redirect URLs to your production domain

2. **Security:**
   - Never commit `.env.local` to git
   - Use environment variables for all sensitive keys
   - Enable Row Level Security (RLS) on all tables

3. **Vendor Profile Creation:**
   - Email/Password: Profile created during registration
   - Google OAuth: Profile created automatically on first login
   - Phone OTP: Profile created automatically on first login

---

## 🎉 You're All Set!

Once configured, all three authentication methods will work seamlessly together. Users can:
- Register with email/password
- Sign in with Google
- Sign in with phone OTP

All methods will create/update vendor profiles in your `users` table automatically.

