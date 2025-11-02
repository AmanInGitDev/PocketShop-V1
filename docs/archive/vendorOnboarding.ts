/**
 * PocketShop Vendor Onboarding Service
 * TypeScript utility for managing vendor onboarding workflow
 */

import { supabase } from '../services/supabase';

/**
 * Onboarding status stages
 */
export type OnboardingStatus =
  | 'incomplete'
  | 'basic_info'
  | 'business_details'
  | 'operational_details'
  | 'planning_selected'
  | 'completed';

/**
 * Operational hours structure
 */
export interface OperationalHours {
  [day: string]: {
    open: string;
    close: string;
  };
}

/**
 * Business details for stage 2
 */
export interface BusinessDetails {
  owner_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  business_type: string;
}

/**
 * Operational details for stage 3
 */
export interface OperationalDetails {
  operational_hours: OperationalHours;
  working_days: string[];
  description: string;
}

/**
 * Vendor Onboarding Service
 * Handles all onboarding stage updates with proper status management
 */
export class VendorOnboardingService {
  /**
   * Get current vendor profile and onboarding status
   */
  async getCurrentStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Stage 1: Update after registration
   * Sets onboarding_status to 'basic_info'
   */
  async updateStage1(businessName: string, mobileNumber: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vendor_profiles')
      .update({
        business_name: businessName,
        mobile_number: mobileNumber,
        onboarding_status: 'basic_info',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Stage 2: Update business details
   * Sets onboarding_status to 'business_details'
   */
  async updateStage2(details: BusinessDetails) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vendor_profiles')
      .update({
        owner_name: details.owner_name,
        address: details.address,
        city: details.city,
        state: details.state,
        postal_code: details.postal_code,
        business_type: details.business_type,
        onboarding_status: 'business_details',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Stage 3: Update operational details
   * Sets onboarding_status to 'operational_details'
   */
  async updateStage3(details: OperationalDetails) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vendor_profiles')
      .update({
        operational_hours: details.operational_hours,
        working_days: details.working_days,
        description: details.description,
        onboarding_status: 'operational_details',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Stage 4: Update plan selection
   * Sets onboarding_status to 'planning_selected'
   */
  async updateStage4(selectedPlan: 'free' | 'gold') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current metadata
    const { data: profile } = await supabase
      .from('vendor_profiles')
      .select('metadata')
      .eq('user_id', user.id)
      .single();

    if (profile?.error) throw profile.error;

    // Merge plan info into metadata
    const updatedMetadata = {
      ...(profile?.metadata || {}),
      selected_plan: selectedPlan,
      plan_selected_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('vendor_profiles')
      .update({
        metadata: updatedMetadata,
        onboarding_status: 'planning_selected',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Stage 5: Complete onboarding
   * Sets onboarding_status to 'completed' and is_active to true
   */
  async completeOnboarding() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vendor_profiles')
      .update({
        onboarding_status: 'completed',
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Partial update: Update only operational_hours
   * Useful for auto-save or partial form submissions
   */
  async updateOperationalHours(hours: OperationalHours) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vendor_profiles')
      .update({
        operational_hours: hours,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Partial update: Merge into existing operational_hours
   * Preserves other days when updating specific day
   */
  async mergeOperationalHours(day: string, hours: { open: string; close: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current operational_hours
    const { data: profile } = await supabase
      .from('vendor_profiles')
      .select('operational_hours')
      .eq('user_id', user.id)
      .single();

    if (profile?.error) throw profile.error;

    // Merge new hours into existing
    const updatedHours = {
      ...(profile?.operational_hours || {}),
      [day]: hours
    };

    const { data, error } = await supabase
      .from('vendor_profiles')
      .update({
        operational_hours: updatedHours,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Partial update: Update metadata field
   * Adds/updates nested property in metadata JSONB
   */
  async updateMetadata(key: string, value: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current metadata
    const { data: profile } = await supabase
      .from('vendor_profiles')
      .select('metadata')
      .eq('user_id', user.id)
      .single();

    if (profile?.error) throw profile.error;

    // Merge new value into metadata
    const updatedMetadata = {
      ...(profile?.metadata || {}),
      [key]: value
    };

    const { data, error } = await supabase
      .from('vendor_profiles')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check if onboarding is completed
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const profile = await this.getCurrentStatus();
      return profile.onboarding_status === 'completed' && profile.is_active === true;
    } catch {
      return false;
    }
  }

  /**
   * Get next onboarding stage
   */
  async getNextStage(): Promise<OnboardingStatus | null> {
    try {
      const profile = await this.getCurrentStatus();
      const status = profile.onboarding_status;

      const stageMap: Record<OnboardingStatus, OnboardingStatus | null> = {
        incomplete: 'basic_info',
        basic_info: 'business_details',
        business_details: 'operational_details',
        operational_details: 'planning_selected',
        planning_selected: 'completed',
        completed: null
      };

      return stageMap[status] || null;
    } catch {
      return 'incomplete';
    }
  }
}

// Export singleton instance
export const vendorOnboarding = new VendorOnboardingService();


