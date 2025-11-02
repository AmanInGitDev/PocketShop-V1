# PocketShop Vendor Onboarding SQL Guide

Complete SQL snippets and examples for managing vendor onboarding workflow, including status updates, partial saves, and safe update patterns.

---

## 1. Onboarding Status Updates

### Stage 1: After Registration → 'basic_info'

**When:** User completes initial registration form (email, password, business name, mobile number)

**SQL:**
```sql
-- Update onboarding status after registration
UPDATE public.vendor_profiles
SET 
  onboarding_status = 'basic_info',
  updated_at = NOW()
WHERE user_id = auth.uid();
```

**JavaScript (Client-side with RLS):**
```javascript
const { error } = await supabase
  .from('vendor_profiles')
  .update({
    onboarding_status: 'basic_info',
    updated_at: new Date().toISOString()
  })
  .eq('user_id', (await supabase.auth.getUser()).data.user.id);
```

---

### Stage 2: After Business Details → 'business_details'

**When:** User completes business details form (owner name, address, city, state, postal code, business type)

**SQL:**
```sql
-- Update onboarding status and business details
UPDATE public.vendor_profiles
SET 
  owner_name = 'John Doe',
  address = '123 Main Street',
  city = 'Mumbai',
  state = 'Maharashtra',
  postal_code = '400001',
  business_type = 'food',
  onboarding_status = 'business_details',
  updated_at = NOW()
WHERE user_id = auth.uid();
```

**JavaScript (Client-side with RLS):**
```javascript
const { error } = await supabase
  .from('vendor_profiles')
  .update({
    owner_name: 'John Doe',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400001',
    business_type: 'food',
    onboarding_status: 'business_details',
    updated_at: new Date().toISOString()
  })
  .eq('user_id', (await supabase.auth.getUser()).data.user.id);
```

---

### Stage 3: After Operational Details → 'operational_details'

**When:** User completes operational details (working hours, working days, description)

**SQL:**
```sql
-- Update onboarding status and operational details
UPDATE public.vendor_profiles
SET 
  operational_hours = '{
    "monday": {"open": "09:00", "close": "22:00"},
    "tuesday": {"open": "09:00", "close": "22:00"},
    "wednesday": {"open": "09:00", "close": "22:00"},
    "thursday": {"open": "09:00", "close": "22:00"},
    "friday": {"open": "09:00", "close": "23:00"},
    "saturday": {"open": "10:00", "close": "23:00"},
    "sunday": {"open": "10:00", "close": "22:00"}
  }'::jsonb,
  working_days = ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  description = 'Great food, great service!',
  onboarding_status = 'operational_details',
  updated_at = NOW()
WHERE user_id = auth.uid();
```

**JavaScript (Client-side with RLS):**
```javascript
const operationalHours = {
  monday: { open: "09:00", close: "22:00" },
  tuesday: { open: "09:00", close: "22:00" },
  wednesday: { open: "09:00", close: "22:00" },
  thursday: { open: "09:00", close: "22:00" },
  friday: { open: "09:00", close: "23:00" },
  saturday: { open: "10:00", close: "23:00" },
  sunday: { open: "10:00", close: "22:00" }
};

const { error } = await supabase
  .from('vendor_profiles')
  .update({
    operational_hours: operationalHours,
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    description: 'Great food, great service!',
    onboarding_status: 'operational_details',
    updated_at: new Date().toISOString()
  })
  .eq('user_id', (await supabase.auth.getUser()).data.user.id);
```

---

### Stage 4: After Plan Selection → 'planning_selected'

**When:** User selects a plan (Free Plan or Gold Plan)

**SQL:**
```sql
-- Update onboarding status after plan selection
-- Store plan info in metadata JSONB field
UPDATE public.vendor_profiles
SET 
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{selected_plan}',
    '"gold"'::jsonb
  ),
  onboarding_status = 'planning_selected',
  updated_at = NOW()
WHERE user_id = auth.uid();
```

**JavaScript (Client-side with RLS):**
```javascript
const { data: profile } = await supabase
  .from('vendor_profiles')
  .select('metadata')
  .eq('user_id', (await supabase.auth.getUser()).data.user.id)
  .single();

const updatedMetadata = {
  ...(profile.metadata || {}),
  selected_plan: 'gold',
  plan_selected_at: new Date().toISOString()
};

const { error } = await supabase
  .from('vendor_profiles')
  .update({
    metadata: updatedMetadata,
    onboarding_status: 'planning_selected',
    updated_at: new Date().toISOString()
  })
  .eq('user_id', (await supabase.auth.getUser()).data.user.id);
```

---

### Stage 5: After Accept & Finish → 'completed' and Activate

**When:** User completes onboarding and accepts terms

**SQL:**
```sql
-- Complete onboarding and activate vendor
UPDATE public.vendor_profiles
SET 
  onboarding_status = 'completed',
  is_active = TRUE,
  updated_at = NOW()
WHERE user_id = auth.uid();
```

**JavaScript (Client-side with RLS):**
```javascript
const { error } = await supabase
  .from('vendor_profiles')
  .update({
    onboarding_status: 'completed',
    is_active: true,
    updated_at: new Date().toISOString()
  })
  .eq('user_id', (await supabase.auth.getUser()).data.user.id);
```

---

## 2. Safe UPDATE Patterns with RLS

### Pattern 1: Client-Side Update (with RLS)

**Use Case:** Frontend application updating vendor profile as authenticated user

**Why Safe:** RLS policies ensure `auth.uid() = user_id`, so users can only update their own records.

```javascript
/**
 * Safe client-side update using RLS
 * RLS policy ensures user can only update their own profile
 */
async function updateVendorProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('vendor_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id) // Explicit check (RLS also enforces this)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Usage
await updateVendorProfile({
  business_name: 'Updated Business Name',
  city: 'Delhi'
});
```

**SQL Equivalent (what happens under the hood):**
```sql
-- Supabase client automatically adds WHERE user_id = auth.uid()
-- RLS policy also enforces: USING (auth.uid() = user_id)
UPDATE public.vendor_profiles
SET 
  business_name = 'Updated Business Name',
  city = 'Delhi',
  updated_at = NOW()
WHERE user_id = auth.uid(); -- Added by client library
```

---

### Pattern 2: Edge Function Update (Server-Side with User Context)

**Use Case:** Backend Edge Function that needs to update on behalf of authenticated user

**Why Safe:** Edge Function receives user's JWT, so `auth.uid()` works correctly.

```typescript
// Supabase Edge Function (Deno)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Get authenticated user from JWT
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    }
  )

  // Update vendor profile (RLS enforced)
  const { data, error } = await supabase
    .from('vendor_profiles')
    .update({
      onboarding_status: 'completed',
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', (await supabase.auth.getUser()).data.user.id)
    .select()
    .single()

  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

### Pattern 3: Service Role Update (Admin/System Operations)

**Use Case:** Backend operations that need to bypass RLS (admin actions, system updates, bulk operations)

**⚠️ Warning:** Service role bypasses RLS. Use only in secure backend code, never expose to frontend.

```typescript
// Backend service (Node.js)
import { createClient } from '@supabase/supabase-js'

// Use SERVICE_ROLE_KEY (not anon key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Admin update - bypasses RLS
 * Use only for:
 * - Admin operations
 * - System maintenance
 * - Bulk updates
 * - Scheduled jobs
 */
async function adminUpdateVendorProfile(vendorId: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('vendor_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', vendorId) // Can update any vendor (bypasses RLS)
    .select()
    .single()

  if (error) throw error
  return data
}

// Usage
await adminUpdateVendorProfile('vendor-uuid', {
  is_active: false, // Admin deactivation
  onboarding_status: 'incomplete'
})
```

**SQL Equivalent:**
```sql
-- Service role bypasses RLS, so direct UPDATE works
-- ⚠️ Only use in secure backend code
UPDATE public.vendor_profiles
SET 
  is_active = FALSE,
  onboarding_status = 'incomplete',
  updated_at = NOW()
WHERE id = 'vendor-uuid';
```

---

## 3. UPSERT Examples

### UPSERT 1: Client-Side Upsert (with RLS)

**Use Case:** Create profile if doesn't exist, update if exists (for idempotent operations)

```javascript
/**
 * Client-side upsert with RLS
 * Creates profile if missing, updates if exists
 */
async function upsertVendorProfile(profileData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('vendor_profiles')
    .upsert({
      user_id: user.id, // Required for INSERT
      ...profileData,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id', // Conflict resolution
      ignoreDuplicates: false // Update if exists
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Usage
await upsertVendorProfile({
  business_name: 'My Business',
  mobile_number: '+919876543210',
  onboarding_status: 'basic_info'
});
```

**SQL Equivalent:**
```sql
-- UPSERT using INSERT ... ON CONFLICT
INSERT INTO public.vendor_profiles (
  user_id,
  business_name,
  mobile_number,
  onboarding_status,
  updated_at
)
VALUES (
  auth.uid(),
  'My Business',
  '+919876543210',
  'basic_info',
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  business_name = EXCLUDED.business_name,
  mobile_number = EXCLUDED.mobile_number,
  onboarding_status = EXCLUDED.onboarding_status,
  updated_at = NOW();
```

---

### UPSERT 2: Service Role Upsert (Backend)

**Use Case:** Backend operations that need to create/update vendor profiles from external systems or admin actions

```typescript
/**
 * Service role upsert - bypasses RLS
 * Use for:
 * - Backend API endpoints
 * - Data migrations
 * - Admin operations
 * - Integration with external systems
 */
async function adminUpsertVendorProfile(userId: string, profileData: any) {
  const { data, error } = await supabaseAdmin
    .from('vendor_profiles')
    .upsert({
      user_id: userId, // Can reference any user_id
      ...profileData,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Usage: Create/update vendor profile from admin panel
await adminUpsertVendorProfile('user-uuid', {
  business_name: 'Admin Created Business',
  email: 'business@example.com',
  mobile_number: '+919876543210',
  onboarding_status: 'completed',
  is_active: true
});
```

**SQL Equivalent:**
```sql
-- Service role upsert
INSERT INTO public.vendor_profiles (
  user_id,
  business_name,
  email,
  mobile_number,
  onboarding_status,
  is_active,
  updated_at
)
VALUES (
  'user-uuid',
  'Admin Created Business',
  'business@example.com',
  '+919876543210',
  'completed',
  TRUE,
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  business_name = EXCLUDED.business_name,
  email = EXCLUDED.email,
  mobile_number = EXCLUDED.mobile_number,
  onboarding_status = EXCLUDED.onboarding_status,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
```

---

## 4. Partial Updates (JSONB Fields)

### Update Only operational_hours (Partial Save)

**Use Case:** User saves only operational hours without affecting other fields

**SQL:**
```sql
-- Update only operational_hours JSONB field
UPDATE public.vendor_profiles
SET 
  operational_hours = '{
    "monday": {"open": "09:00", "close": "22:00"},
    "tuesday": {"open": "09:00", "close": "22:00"}
  }'::jsonb,
  updated_at = NOW()
WHERE user_id = auth.uid();
```

**JavaScript (Client-side):**
```javascript
// Partial update - only operational_hours
const { error } = await supabase
  .from('vendor_profiles')
  .update({
    operational_hours: {
      monday: { open: "09:00", close: "22:00" },
      tuesday: { open: "09:00", close: "22:00" }
    },
    updated_at: new Date().toISOString()
  })
  .eq('user_id', (await supabase.auth.getUser()).data.user.id);
```

---

### Update Nested JSONB Field (Merge Strategy)

**Use Case:** Update only specific nested fields in JSONB without overwriting entire object

**SQL:**
```sql
-- Merge into existing operational_hours (preserve other days)
UPDATE public.vendor_profiles
SET 
  operational_hours = jsonb_set(
    COALESCE(operational_hours, '{}'::jsonb),
    '{monday}',
    '{"open": "10:00", "close": "23:00"}'::jsonb
  ),
  updated_at = NOW()
WHERE user_id = auth.uid();
```

**JavaScript (Client-side with merge):**
```javascript
// Get current profile
const { data: profile } = await supabase
  .from('vendor_profiles')
  .select('operational_hours')
  .eq('user_id', (await supabase.auth.getUser()).data.user.id)
  .single();

// Merge new hours into existing
const updatedHours = {
  ...(profile.operational_hours || {}),
  monday: { open: "10:00", close: "23:00" }
};

// Update with merged data
const { error } = await supabase
  .from('vendor_profiles')
  .update({
    operational_hours: updatedHours,
    updated_at: new Date().toISOString()
  })
  .eq('user_id', (await supabase.auth.getUser()).data.user.id);
```

---

### Update metadata JSONB Field (Add/Update Nested Property)

**Use Case:** Store additional data in metadata without overwriting existing metadata

**SQL:**
```sql
-- Add/update nested property in metadata
UPDATE public.vendor_profiles
SET 
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{bank_account}',
    '{"account_number": "123456789", "ifsc": "HDFC0001234"}'::jsonb
  ),
  updated_at = NOW()
WHERE user_id = auth.uid();
```

**JavaScript (Client-side):**
```javascript
// Get current metadata
const { data: profile } = await supabase
  .from('vendor_profiles')
  .select('metadata')
  .eq('user_id', (await supabase.auth.getUser()).data.user.id)
  .single();

// Merge new metadata
const updatedMetadata = {
  ...(profile.metadata || {}),
  bank_account: {
    account_number: "123456789",
    ifsc: "HDFC0001234"
  }
};

// Update
const { error } = await supabase
  .from('vendor_profiles')
  .update({
    metadata: updatedMetadata,
    updated_at: new Date().toISOString()
  })
  .eq('user_id', (await supabase.auth.getUser()).data.user.id);
```

---

## 5. When to Use Client-Side vs Server-Side

### ✅ Use Client-Side Updates When:

1. **User-initiated actions** (onboarding form submissions, profile edits)
2. **Real-time updates** (user typing in form, auto-save)
3. **Simple operations** (single table updates)
4. **RLS protection needed** (let Supabase enforce security)
5. **Frontend context available** (user is authenticated in browser)

**Example:**
```javascript
// User fills onboarding form and clicks "Save"
await supabase
  .from('vendor_profiles')
  .update({ onboarding_status: 'business_details' })
  .eq('user_id', userId);
```

---

### ✅ Use Server-Side (Service Role) When:

1. **Admin operations** (activating/deactivating vendors, bulk updates)
2. **System operations** (scheduled jobs, data migrations)
3. **External integrations** (webhooks, third-party APIs)
4. **Complex transactions** (multiple table updates, data validation)
5. **Security-sensitive operations** (payment processing, sensitive data)
6. **Bypass RLS needed** (update records for different users)

**Example:**
```typescript
// Admin deactivates vendor from admin panel
await supabaseAdmin
  .from('vendor_profiles')
  .update({ is_active: false })
  .eq('id', vendorId);
```

---

### ✅ Use Edge Functions When:

1. **Custom business logic** (complex validations, calculations)
2. **Multiple operations** (update multiple tables atomically)
3. **External API calls** (send emails, SMS, webhooks)
4. **Scheduled tasks** (cron jobs, background processing)
5. **Server-side validation** (verify data before saving)

**Example:**
```typescript
// Edge Function: Complete onboarding with validation
serve(async (req) => {
  const { vendorId } = await req.json()
  
  // Validate vendor has all required fields
  const { data: vendor } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('id', vendorId)
    .single()
  
  if (!vendor.mobile_number || !vendor.business_name) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400
    })
  }
  
  // Update status
  await supabase
    .from('vendor_profiles')
    .update({ onboarding_status: 'completed', is_active: true })
    .eq('id', vendorId)
  
  // Send welcome email (external API call)
  await sendWelcomeEmail(vendor.email)
  
  return new Response(JSON.stringify({ success: true }))
})
```

---

## 6. Complete Onboarding Flow Example

```javascript
/**
 * Complete onboarding workflow
 * Handles all stages with proper status updates
 */
class VendorOnboardingService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  async getCurrentStatus() {
    const { data: { user } } = await this.supabase.auth.getUser();
    const { data } = await this.supabase
      .from('vendor_profiles')
      .select('onboarding_status, *')
      .eq('user_id', user.id)
      .single();
    return data;
  }

  async updateStage1(businessName, mobileNumber) {
    const { data: { user } } = await this.supabase.auth.getUser();
    return await this.supabase
      .from('vendor_profiles')
      .update({
        business_name: businessName,
        mobile_number: mobileNumber,
        onboarding_status: 'basic_info',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
  }

  async updateStage2(businessDetails) {
    const { data: { user } } = await this.supabase.auth.getUser();
    return await this.supabase
      .from('vendor_profiles')
      .update({
        ...businessDetails,
        onboarding_status: 'business_details',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
  }

  async updateStage3(operationalDetails) {
    const { data: { user } } = await this.supabase.auth.getUser();
    return await this.supabase
      .from('vendor_profiles')
      .update({
        operational_hours: operationalDetails.hours,
        working_days: operationalDetails.days,
        description: operationalDetails.description,
        onboarding_status: 'operational_details',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
  }

  async updateStage4(selectedPlan) {
    const { data: { user } } = await this.supabase.auth.getUser();
    const { data: profile } = await this.supabase
      .from('vendor_profiles')
      .select('metadata')
      .eq('user_id', user.id)
      .single();

    const updatedMetadata = {
      ...(profile.metadata || {}),
      selected_plan: selectedPlan,
      plan_selected_at: new Date().toISOString()
    };

    return await this.supabase
      .from('vendor_profiles')
      .update({
        metadata: updatedMetadata,
        onboarding_status: 'planning_selected',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
  }

  async completeOnboarding() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return await this.supabase
      .from('vendor_profiles')
      .update({
        onboarding_status: 'completed',
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
  }
}

// Usage
const onboardingService = new VendorOnboardingService(supabase);

// Stage 1
await onboardingService.updateStage1('My Business', '+919876543210');

// Stage 2
await onboardingService.updateStage2({
  owner_name: 'John Doe',
  address: '123 Main St',
  city: 'Mumbai',
  state: 'Maharashtra',
  postal_code: '400001',
  business_type: 'food'
});

// Stage 3
await onboardingService.updateStage3({
  hours: { monday: { open: '09:00', close: '22:00' } },
  days: ['monday', 'tuesday', 'wednesday'],
  description: 'Great food!'
});

// Stage 4
await onboardingService.updateStage4('gold');

// Complete
await onboardingService.completeOnboarding();
```

---

## Summary

✅ **Client-Side Updates:** Use for user-initiated actions with RLS protection  
✅ **Service Role Updates:** Use for admin/system operations that bypass RLS  
✅ **Edge Functions:** Use for complex business logic and multi-step operations  
✅ **Partial Updates:** Use JSONB merge strategies to update nested fields  
✅ **Status Management:** Update `onboarding_status` at each stage  
✅ **Activation:** Set `is_active = TRUE` only when onboarding is `completed`

All patterns are production-ready and follow Supabase best practices!


