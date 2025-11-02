# PocketShop Supabase Storage Setup Guide

Complete guide for setting up file storage for vendor assets (logos, banners, product images) with proper security policies.

---

## 1. Storage Bucket Configuration

### Recommended Bucket Name
```
vendor-assets
```

**Rationale:**
- Clear and descriptive
- Follows kebab-case convention
- Easy to identify purpose
- Can be extended later for other asset types

### Folder Structure Convention

```
vendor-assets/
├── {vendorId}/
│   ├── logo.jpg              # Vendor logo
│   ├── banner.jpg            # Vendor banner image
│   ├── dp.jpg                # Display picture/profile image
│   └── products/
│       ├── {productId}.jpg   # Individual product images
│       ├── {productId}_1.jpg # Multiple images per product
│       └── {productId}_2.jpg
```

**Example paths:**
- `vendor-assets/550e8400-e29b-41d4-a716-446655440000/logo.jpg`
- `vendor-assets/550e8400-e29b-41d4-a716-446655440000/banner.jpg`
- `vendor-assets/550e8400-e29b-41d4-a716-446655440000/products/123e4567-e89b-12d3-a456-426614174000.jpg`

**Note:** `{vendorId}` should match `vendor_profiles.id` (UUID), not `user_id`. Use a lookup to get vendor_id from user_id.

---

## 2. Bucket Creation (UI Steps)

### Step 1: Create Bucket in Supabase Dashboard

1. Navigate to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Configure:
   - **Name:** `vendor-assets`
   - **Public bucket:** `OFF` (Private - controlled by policies)
   - **File size limit:** `5 MB` (adjust based on needs)
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/gif` (optional, but recommended)
4. Click **Create bucket**

### Step 2: Set Bucket to Private (Recommended)

Even if you set it as private during creation, verify:
1. Go to **Storage > vendor-assets**
2. Click **Settings** (gear icon)
3. Ensure **Public bucket** is `OFF`
4. This ensures all access is controlled by RLS policies

---

## 3. Storage Policies (RLS for Storage)

Supabase Storage uses RLS policies similar to database tables. Create policies via SQL Editor.

### Policy 3.1: Vendors Can Upload to Their Own Folder

```sql
-- Policy: Vendors can upload files to their own vendor folder
CREATE POLICY "Vendors can upload to own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-assets'
  AND (
    -- Path must start with vendor_id from vendor_profiles
    (storage.foldername(name))[1] IN (
      SELECT id::text 
      FROM public.vendor_profiles 
      WHERE user_id = auth.uid()
    )
  )
);
```

### Policy 3.2: Vendors Can Update Their Own Files

```sql
-- Policy: Vendors can update files in their own folder
CREATE POLICY "Vendors can update own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vendor-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM public.vendor_profiles 
    WHERE user_id = auth.uid()
  )
);
```

### Policy 3.3: Vendors Can Delete Their Own Files

```sql
-- Policy: Vendors can delete files from their own folder
CREATE POLICY "Vendors can delete own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vendor-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM public.vendor_profiles 
    WHERE user_id = auth.uid()
  )
);
```

### Policy 3.4: Public Can View Files (Optional - for public URLs)

If you want public access to vendor assets (logos, banners, product images):

```sql
-- Policy: Public can view files from active vendors
CREATE POLICY "Public can view vendor assets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vendor-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM public.vendor_profiles 
    WHERE is_active = TRUE
  )
);
```

**Alternative:** If you prefer signed URLs (more secure), remove this policy and use signed URLs in your application.

### Policy 3.5: Vendors Can View Their Own Files

```sql
-- Policy: Vendors can view files in their own folder
CREATE POLICY "Vendors can view own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vendor-assets'
  AND (
    -- Own folder
    (storage.foldername(name))[1] IN (
      SELECT id::text 
      FROM public.vendor_profiles 
      WHERE user_id = auth.uid()
    )
    OR
    -- Public vendor assets (if public policy exists)
    (storage.foldername(name))[1] IN (
      SELECT id::text 
      FROM public.vendor_profiles 
      WHERE is_active = TRUE
    )
  )
);
```

---

## 4. Complete Storage Policy SQL Script

Run this complete script to set up all policies:

```sql
-- ============================================================================
-- PocketShop Storage Policies
-- ============================================================================

-- Enable RLS on storage.objects (if not already enabled)
-- Note: This is usually enabled by default, but verify in Supabase Dashboard

-- Policy 1: Vendors can upload to own folder
DROP POLICY IF EXISTS "Vendors can upload to own folder" ON storage.objects;
CREATE POLICY "Vendors can upload to own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM public.vendor_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Policy 2: Vendors can update own files
DROP POLICY IF EXISTS "Vendors can update own files" ON storage.objects;
CREATE POLICY "Vendors can update own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vendor-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM public.vendor_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Policy 3: Vendors can delete own files
DROP POLICY IF EXISTS "Vendors can delete own files" ON storage.objects;
CREATE POLICY "Vendors can delete own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vendor-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM public.vendor_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Policy 4: Public can view active vendor assets
DROP POLICY IF EXISTS "Public can view vendor assets" ON storage.objects;
CREATE POLICY "Public can view vendor assets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vendor-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM public.vendor_profiles 
    WHERE is_active = TRUE
  )
);

-- Policy 5: Vendors can view own files (including inactive vendors)
DROP POLICY IF EXISTS "Vendors can view own files" ON storage.objects;
CREATE POLICY "Vendors can view own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vendor-assets'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM public.vendor_profiles 
    WHERE user_id = auth.uid()
  )
);
```

---

## 5. JavaScript Upload Example

### Helper Function: Get Vendor ID from User ID

First, create a helper function to get vendor_id from the authenticated user:

```javascript
/**
 * Get vendor profile ID for the current authenticated user
 * @returns {Promise<string|null>} Vendor ID or null if not found
 */
async function getVendorId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('vendor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
  return data.id;
}
```

### Upload Function: Menu Image / Logo / Banner

```javascript
/**
 * Upload vendor asset (logo, banner, or product image)
 * @param {File} file - File object to upload
 * @param {string} type - 'logo' | 'banner' | 'dp' | 'product'
 * @param {string} [productId] - Required if type is 'product'
 * @returns {Promise<{url: string, path: string} | null>}
 */
async function uploadVendorAsset(file, type, productId = null) {
  try {
    // 1. Get vendor ID
    const vendorId = await getVendorId();
    if (!vendorId) {
      throw new Error('Vendor profile not found. Please complete onboarding.');
    }

    // 2. Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    // 3. Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // 4. Generate file path
    let filePath;
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();

    if (type === 'product') {
      if (!productId) {
        throw new Error('Product ID is required for product images.');
      }
      filePath = `${vendorId}/products/${productId}_${timestamp}.${fileExtension}`;
    } else {
      // logo, banner, or dp
      filePath = `${vendorId}/${type}_${timestamp}.${fileExtension}`;
    }

    // 5. Upload file
    const { data, error } = await supabase.storage
      .from('vendor-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Overwrite if file exists
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // 6. Get public URL (if bucket is public or policy allows)
    const { data: urlData } = supabase.storage
      .from('vendor-assets')
      .getPublicUrl(filePath);

    // Alternative: Get signed URL (if bucket is private)
    // const { data: signedUrlData } = await supabase.storage
    //   .from('vendor-assets')
    //   .createSignedUrl(filePath, 3600); // Valid for 1 hour
    // const publicUrl = signedUrlData.signedUrl;

    return {
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}
```

### Usage Examples

```javascript
// Example 1: Upload vendor logo
const logoInput = document.querySelector('#logo-input');
logoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const result = await uploadVendorAsset(file, 'logo');
  if (result) {
    console.log('Logo uploaded:', result.url);
    // Update vendor profile with logo URL
    await supabase
      .from('vendor_profiles')
      .update({ logo_url: result.url })
      .eq('user_id', (await supabase.auth.getUser()).data.user.id);
  } else {
    alert('Failed to upload logo');
  }
});

// Example 2: Upload banner image
const bannerInput = document.querySelector('#banner-input');
bannerInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const result = await uploadVendorAsset(file, 'banner');
  if (result) {
    console.log('Banner uploaded:', result.url);
    // Update vendor profile
    await supabase
      .from('vendor_profiles')
      .update({ banner_url: result.url })
      .eq('user_id', (await supabase.auth.getUser()).data.user.id);
  }
});

// Example 3: Upload product image
const productImageInput = document.querySelector('#product-image-input');
productImageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const productId = '123e4567-e89b-12d3-a456-426614174000'; // From your product
  const result = await uploadVendorAsset(file, 'product', productId);
  if (result) {
    console.log('Product image uploaded:', result.url);
    // Update product with image URL
    await supabase
      .from('products')
      .update({ image_url: result.url })
      .eq('id', productId);
  }
});
```

### Enhanced Upload with Progress

```javascript
/**
 * Upload with progress tracking
 */
async function uploadVendorAssetWithProgress(file, type, productId, onProgress) {
  const vendorId = await getVendorId();
  if (!vendorId) throw new Error('Vendor profile not found');

  const fileExtension = file.name.split('.').pop();
  const timestamp = Date.now();
  const filePath = productId 
    ? `${vendorId}/products/${productId}_${timestamp}.${fileExtension}`
    : `${vendorId}/${type}_${timestamp}.${fileExtension}`;

  // Upload with progress callback
  const { data, error } = await supabase.storage
    .from('vendor-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    }, (progress) => {
      if (onProgress) {
        const percent = (progress.loaded / progress.total) * 100;
        onProgress(percent);
      }
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('vendor-assets')
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath
  };
}

// Usage with progress bar
uploadVendorAssetWithProgress(file, 'logo', null, (percent) => {
  console.log(`Upload progress: ${percent.toFixed(1)}%`);
  // Update progress bar UI
  document.querySelector('#progress-bar').style.width = `${percent}%`;
});
```

---

## 6. Delete File Function

```javascript
/**
 * Delete vendor asset
 * @param {string} filePath - Full path to file (e.g., 'vendorId/logo_123.jpg')
 * @returns {Promise<boolean>}
 */
async function deleteVendorAsset(filePath) {
  try {
    const { error } = await supabase.storage
      .from('vendor-assets')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}
```

---

## 7. Verification Steps

### Step 1: Verify Bucket Created

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE name = 'vendor-assets';
```

### Step 2: Verify Policies Created

```sql
-- Check storage policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%vendor%';
```

### Step 3: Test Upload (JavaScript)

```javascript
// Test upload as authenticated vendor
async function testUpload() {
  // 1. Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Not authenticated');
    return;
  }

  // 2. Get vendor profile
  const { data: vendorProfile } = await supabase
    .from('vendor_profiles')
    .select('id, user_id')
    .eq('user_id', user.id)
    .single();

  if (!vendorProfile) {
    console.error('Vendor profile not found');
    return;
  }

  // 3. Create a test file (or use actual file input)
  const testFile = new File(['test'], 'test-logo.jpg', { type: 'image/jpeg' });

  // 4. Upload
  const result = await uploadVendorAsset(testFile, 'logo');
  
  if (result) {
    console.log('✅ Upload successful:', result.url);
  } else {
    console.error('❌ Upload failed');
  }
}
```

### Step 4: Verify File in Storage

1. Go to **Supabase Dashboard > Storage > vendor-assets**
2. Navigate to your vendor folder
3. Verify file exists

### Step 5: Test Policy Enforcement

```javascript
// Try to upload to wrong vendor folder (should fail)
async function testPolicyEnforcement() {
  const wrongVendorId = '00000000-0000-0000-0000-000000000000';
  const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

  const { error } = await supabase.storage
    .from('vendor-assets')
    .upload(`${wrongVendorId}/hacked.jpg`, testFile);

  if (error) {
    console.log('✅ Policy working - upload blocked:', error.message);
  } else {
    console.error('❌ Policy failed - upload succeeded');
  }
}
```

---

## 8. Best Practices

1. **File Naming:** Use timestamps or UUIDs to prevent collisions
2. **File Validation:** Always validate file type and size on client AND server
3. **Error Handling:** Provide clear error messages to users
4. **Cleanup:** Delete old files when replacing with new ones
5. **CDN:** Supabase Storage uses CDN, so URLs are fast globally
6. **Signed URLs:** Use signed URLs for private assets that expire
7. **Image Optimization:** Consider resizing/compressing images before upload

---

## 9. Complete Example: React Component

```javascript
import { useState } from 'react';
import { supabase } from './supabase';

function LogoUpload() {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadVendorAsset(file, 'logo');
    
    if (result) {
      setLogoUrl(result.url);
      // Update vendor profile
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('vendor_profiles')
        .update({ logo_url: result.url })
        .eq('user_id', user.id);
    }
    
    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {logoUrl && <img src={logoUrl} alt="Logo" />}
    </div>
  );
}
```

---

## Summary

✅ **Bucket:** `vendor-assets` (private)  
✅ **Structure:** `{vendorId}/{type}.jpg` or `{vendorId}/products/{productId}.jpg`  
✅ **Policies:** Vendors can only upload/update/delete in their own folder  
✅ **Public Access:** Optional policy for viewing active vendor assets  
✅ **JavaScript:** Complete upload functions with error handling  

All code is production-ready and follows Supabase best practices!


