/**
 * PocketShop Storage Utilities
 * Helper functions for uploading vendor assets to Supabase Storage
 */

import { supabase } from '../services/supabase';

/**
 * Get vendor profile ID for the current authenticated user
 * @returns {Promise<string|null>} Vendor ID or null if not found
 */
export async function getVendorId(): Promise<string | null> {
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

/**
 * Vendor asset types
 */
export type VendorAssetType = 'logo' | 'banner' | 'dp' | 'product';

/**
 * Upload result
 */
export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload vendor asset (logo, banner, display picture, or product image)
 * 
 * @param file - File object to upload
 * @param type - Asset type: 'logo' | 'banner' | 'dp' | 'product'
 * @param productId - Required if type is 'product'
 * @returns Promise with URL and path, or null on error
 */
export async function uploadVendorAsset(
  file: File,
  type: VendorAssetType,
  productId?: string
): Promise<UploadResult | null> {
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
    let filePath: string;
    const fileExtension = file.name.split('.').pop() || 'jpg';
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

    // 6. Get public URL
    const { data: urlData } = supabase.storage
      .from('vendor-assets')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

/**
 * Upload with progress tracking
 * 
 * @param file - File object to upload
 * @param type - Asset type
 * @param productId - Required if type is 'product'
 * @param onProgress - Progress callback (0-100)
 * @returns Promise with URL and path, or null on error
 */
export async function uploadVendorAssetWithProgress(
  file: File,
  type: VendorAssetType,
  onProgress: (percent: number) => void,
  productId?: string
): Promise<UploadResult | null> {
  try {
    const vendorId = await getVendorId();
    if (!vendorId) {
      throw new Error('Vendor profile not found.');
    }

    const fileExtension = file.name.split('.').pop() || 'jpg';
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
        const percent = (progress.loaded / progress.total) * 100;
        onProgress(percent);
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('vendor-assets')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

/**
 * Get signed URL for private file access
 * Useful if bucket is private or you need time-limited access
 * 
 * @param filePath - Full path to file (e.g., 'vendorId/logo_123.jpg')
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL or null on error
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('vendor-assets')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    return null;
  }
}

/**
 * Delete vendor asset
 * 
 * @param filePath - Full path to file (e.g., 'vendorId/logo_123.jpg')
 * @returns true if successful, false otherwise
 */
export async function deleteVendorAsset(filePath: string): Promise<boolean> {
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

/**
 * Update vendor profile with logo URL
 * 
 * @param logoUrl - URL of uploaded logo
 * @returns true if successful, false otherwise
 */
export async function updateVendorLogo(logoUrl: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('vendor_profiles')
      .update({ logo_url: logoUrl })
      .eq('user_id', user.id);

    return !error;
  } catch (error) {
    console.error('Failed to update logo:', error);
    return false;
  }
}

/**
 * Update vendor profile with banner URL
 * 
 * @param bannerUrl - URL of uploaded banner
 * @returns true if successful, false otherwise
 */
export async function updateVendorBanner(bannerUrl: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('vendor_profiles')
      .update({ banner_url: bannerUrl })
      .eq('user_id', user.id);

    return !error;
  } catch (error) {
    console.error('Failed to update banner:', error);
    return false;
  }
}

/**
 * Update product with image URL
 * 
 * @param productId - Product UUID
 * @param imageUrl - URL of uploaded product image
 * @returns true if successful, false otherwise
 */
export async function updateProductImage(
  productId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('id', productId);

    return !error;
  } catch (error) {
    console.error('Failed to update product image:', error);
    return false;
  }
}


