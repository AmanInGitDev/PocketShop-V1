# PocketShop Supabase Database Setup Guide

This guide will help you set up your complete Supabase database for PocketShop with one click.

## 📋 Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created
3. Your project's URL and anon key (already configured in `.env.local`)

## 🚀 Quick Setup (Copy & Paste in Supabase SQL Editor)

Go to your Supabase Dashboard → **SQL Editor** → **New Query**

Copy and paste all three files in this exact order:

### Step 1: Create Tables
Copy the entire contents of `Reports/pocketshop_schema.sql` and run it.

### Step 2: Create Triggers  
Copy the entire contents of `Reports/pocketshop_triggers.sql` and run it.

### Step 3: Create RLS Policies
Copy the entire contents of `Reports/pocketshop_rls_policies.sql` and run it.

## ✅ Verification

After running all three files, verify the setup:

### 1. Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

You should see:
- vendor_profiles
- customer_profiles
- guest_sessions
- user_roles
- products
- orders

### 2. Check Triggers
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

You should see:
- on_vendor_auth_user_created
- on_customer_auth_user_created

### 3. Test Registration

1. Go to your app: `http://localhost:3000`
2. Click "Join PocketShop"
3. Fill in the registration form
4. Check Supabase Dashboard → **Authentication** → **Users** to see your new user
5. Check **Table Editor** → **vendor_profiles** to see your vendor profile

## 🔑 What Was Created

### Tables
- **vendor_profiles**: Stores vendor business information
- **customer_profiles**: Stores customer information
- **guest_sessions**: Stores temporary guest checkout sessions
- **user_roles**: Tracks user roles (vendor/customer)
- **products**: Stores vendor products/menu items
- **orders**: Stores customer orders

### Triggers
- **handle_new_vendor()**: Automatically creates vendor profile when a user signs up with `user_type='vendor'`
- **handle_new_customer()**: Automatically creates customer profile when a user signs up with `user_type='customer'`

### Security
- Row Level Security (RLS) enabled on all tables
- Policies ensure users can only access their own data
- Public can view active vendor profiles and available products

## 🧪 Test the Complete Flow

### 1. Vendor Registration Test
1. Go to `/vendor/auth`
2. Click "Register"
3. Fill in:
   - Business Name: My Test Restaurant
   - Email: test@example.com
   - Mobile Number: +1234567890
   - Password: test123456
4. Click "Register"
5. You should be redirected to `/vendor/onboarding`
6. Complete onboarding steps
7. You should be redirected to `/vendor/dashboard`

### 2. Login Test
1. Go to `/vendor/auth`
2. Click "Login"
3. Enter your registered email and password
4. You should be redirected to `/vendor/dashboard`

## 🐛 Troubleshooting

### Issue: "Profile error" in console
**Solution**: Run all three SQL files in order. RLS policies must be created after triggers.

### Issue: Can't register user
**Solution**: Check that triggers are created. Run:
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name IN ('on_vendor_auth_user_created', 'on_customer_auth_user_created');
```

### Issue: Can't view vendor profile after login
**Solution**: Check RLS policies are created:
```sql
SELECT policy_name FROM pg_policies WHERE tablename = 'vendor_profiles';
```

### Issue: Mobile number not saved
**Solution**: The frontend code now passes `mobile_number`. Make sure you're on the latest code.

## 📚 Additional Resources

- Supabase Docs: https://supabase.com/docs
- RLS Policies: https://supabase.com/docs/guides/auth/row-level-security
- Database Triggers: https://supabase.com/docs/guides/database/triggers

## 🎉 Next Steps

Once database is set up, you can:
1. Start adding products from the dashboard
2. Test the complete order flow
3. Customize vendor onboarding steps
4. Add more business logic as needed

---

**Need Help?** Check the SQL files in the `Reports/` folder for detailed comments and explanations.

