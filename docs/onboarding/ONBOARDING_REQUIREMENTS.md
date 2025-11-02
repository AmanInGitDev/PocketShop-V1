# Onboarding & Registration Requirements

## Overview
Create a smooth, beautiful onboarding process inspired by Zomato's vendor landing page design. The process should guide vendors through registration and multi-stage onboarding.

## User Flow

### 1. Landing Page
- **Inspiration:** Zomato Vendor Landing Page
- **Purpose:** Initial entry point for vendors
- **Design:** Beautiful, modern UI with clear call-to-action
- **Content:** Should clearly state what the platform does for vendors

### 2. Registration Screen
- **Fields:**
  - Mobile Number
  - OTP (sent after mobile number entry)
- **Flow:** 
  - User enters mobile number
  - OTP is sent and verified
  - Upon successful OTP verification → proceed to Onboarding Stages

### 3. Onboarding Stages (3 Parts)
After OTP verification, user is taken through a multi-stage onboarding process with navigation sidebar showing:
- Restaurant Info (Stage 1)
- Operational Details (Stage 2)
- Plans (Stage 3)

#### Stage 1: Restaurant Info
**Fields to collect:**
- Restaurant Name Details
- Owner Name
- Details
- Location (with map integration/placeholder)
- Address

#### Stage 2: Operational Details
**Fields/Features to include:**
- Menu Image Upload
- Restaurant Display Picture (DP)
- Restaurant Timings
- Working Days
- Add Bank Account / UPI ID
- Customized Timing and Slot (feature)

#### Stage 3: Plans
**Plan Options:**
- **Free Plan - Gold:**
  - Zero setup cost
  - Unlimited QR scans & orders
  - Smart Order Dashboard
  - UPI Payment Support
- **Version 2 - Platinum (Pro):**
  - Status: "COMING SOON"

### 4. Terms and Conditions
- After completing all 3 onboarding stages
- Modal/Window with Terms & Conditions text
- Checkbox to accept Terms & Conditions
- "Accept" button
- Once accepted → Account is created and user is registered

### 5. Post-Registration
- **Immediate:** Account created, user can proceed
- **Later (in Dashboard):** Additional account information can be filled in Account Info section (not to be implemented now)

## Technical Considerations

### Database Schema
- Reference: `vendor_profiles` table in Supabase
- Key fields:
  - `user_id` (links to auth.users)
  - `mobile_number`
  - `business_name`, `owner_name`, `address`, etc.
  - `operational_hours` (jsonb)
  - `working_days` (array)
  - `onboarding_status` (to track progress)
  - And other relevant fields

### Authentication
- Mobile number + OTP verification
- User account creation after OTP verification
- Link vendor profile to user account

## Design Guidelines

### Inspiration
- Zomato Vendor Landing Page (dark theme, food imagery, clean design)
- Modern, professional aesthetic
- Clear visual hierarchy
- Smooth transitions between stages

### Navigation
- Sidebar navigation visible during onboarding showing:
  - "Resto Info"
  - "Operational details"
  - "Plans"
- Visual indicator showing current active stage

## Post-Onboarding
- After completing onboarding → Direct redirect to Dashboard
- Login users → Direct redirect to Dashboard (bypass onboarding if already completed)
- Incomplete onboarding → Redirect to appropriate onboarding stage

## Implementation Notes
- [ ] Landing page design
- [ ] Registration (Mobile + OTP) screen
- [ ] Onboarding Stage 1: Restaurant Info
- [ ] Onboarding Stage 2: Operational Details
- [ ] Onboarding Stage 3: Plans
- [ ] Terms & Conditions modal
- [ ] Navigation sidebar for onboarding stages
- [ ] Progress tracking (onboarding_status)
- [ ] Integration with Supabase authentication
- [ ] Integration with vendor_profiles table
- [ ] Responsive design
- [ ] Smooth transitions/animations

## Status
**Current Phase:** Requirements Documentation
**Next Steps:** Awaiting user guidance for step-by-step implementation

