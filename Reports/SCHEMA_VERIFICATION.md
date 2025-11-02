# PocketShop Schema Verification Checklist

Run these verification queries in the Supabase SQL Editor after executing `pocketshop_schema.sql` to confirm all tables were created successfully.

## Verification Steps

### 1. Verify All Tables Exist
```sql
-- Check that all 6 core tables are present in the public schema
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN (
    'vendor_profiles',
    'customer_profiles',
    'guest_sessions',
    'user_roles',
    'products',
    'orders'
  )
ORDER BY tablename;
```
**Expected Result:** Should return 6 rows, one for each table.

---

### 2. Verify Table Structure (Check Columns)
```sql
-- Verify vendor_profiles has all required columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'vendor_profiles'
ORDER BY ordinal_position;
```
**Expected Result:** Should show all columns including: id, user_id, business_name, mobile_number, onboarding_status, etc.

---

### 3. Verify Indexes Were Created
```sql
-- Check that indexes exist on key columns
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'vendor_profiles',
    'customer_profiles',
    'guest_sessions',
    'user_roles',
    'products',
    'orders'
  )
ORDER BY tablename, indexname;
```
**Expected Result:** Should show multiple indexes including:
- `idx_vendor_profiles_user_id`, `idx_vendor_profiles_email`, `idx_vendor_profiles_mobile_number`
- `idx_customer_profiles_user_id`, `idx_customer_profiles_mobile_number`
- `idx_guest_sessions_session_token`, `idx_guest_sessions_mobile_number`
- `idx_products_vendor_id`
- `idx_orders_vendor_id`, `idx_orders_customer_id`, etc.

---

### 4. Verify RLS is Enabled
```sql
-- Check that Row Level Security is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'vendor_profiles',
    'customer_profiles',
    'guest_sessions',
    'user_roles',
    'products',
    'orders'
  )
ORDER BY tablename;
```
**Expected Result:** All 6 tables should have `rowsecurity = true`.

---

### 5. Verify Foreign Key Constraints
```sql
-- Check foreign key relationships are properly established
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'vendor_profiles',
    'customer_profiles',
    'guest_sessions',
    'user_roles',
    'products',
    'orders'
  )
ORDER BY tc.table_name, kcu.column_name;
```
**Expected Result:** Should show foreign keys such as:
- `vendor_profiles.user_id` → `auth.users.id`
- `customer_profiles.user_id` → `auth.users.id`
- `products.vendor_id` → `vendor_profiles.id`
- `orders.vendor_id` → `vendor_profiles.id`
- `orders.customer_id` → `customer_profiles.id`
- `orders.guest_session_id` → `guest_sessions.id`

---

## Quick All-in-One Verification Query

If you want to run a single comprehensive check:

```sql
-- Comprehensive verification query
SELECT 
  'Tables Created' AS check_type,
  COUNT(*) AS count,
  STRING_AGG(tablename, ', ' ORDER BY tablename) AS details
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('vendor_profiles', 'customer_profiles', 'guest_sessions', 'user_roles', 'products', 'orders')

UNION ALL

SELECT 
  'RLS Enabled' AS check_type,
  COUNT(*) AS count,
  STRING_AGG(tablename, ', ' ORDER BY tablename) AS details
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('vendor_profiles', 'customer_profiles', 'guest_sessions', 'user_roles', 'products', 'orders')
  AND rowsecurity = true

UNION ALL

SELECT 
  'Indexes Created' AS check_type,
  COUNT(*) AS count,
  NULL AS details
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('vendor_profiles', 'customer_profiles', 'guest_sessions', 'user_roles', 'products', 'orders');
```

**Expected Results:**
- Tables Created: `count = 6`
- RLS Enabled: `count = 6`
- Indexes Created: `count >= 15` (multiple indexes per table)

---

## Next Steps After Verification

1. ✅ All tables created successfully
2. ✅ RLS policies can now be created (see `Database.md` Part 3)
3. ✅ Trigger functions can be added (see `Database.md` Part 2)
4. ✅ Ready for application integration


