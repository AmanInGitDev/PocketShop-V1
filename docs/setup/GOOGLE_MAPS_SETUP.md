# Google Maps API Setup Guide

This guide will help you set up the Google Maps API for the "Suggest Places" (autocomplete) feature in PocketShop.

## Prerequisites

- A Google account
- A valid payment method (Google provides $200/month free credit, you won't be charged unless you exceed this)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click on the project dropdown at the top of the page
4. Click "New Project"
5. Enter a project name (e.g., "PocketShop")
6. Click "Create"
7. Wait for the project to be created, then select it

### 2. Enable Billing

**Important:** Even though Google provides free credits, you must enable billing to use the Places API.

1. In the left sidebar, click "Billing"
2. Click "Link a billing account"
3. If you don't have a billing account:
   - Click "Create billing account"
   - Fill in your information
   - Add a payment method
4. Link your billing account to the project

**Note:** Google provides $200 in free credits every month. For most small/medium applications, this is more than enough.

### 3. Enable Required APIs

1. In the left sidebar, go to "APIs & Services" > "Library"
2. Search for "Places API"
3. Click on "Places API (New)"
4. Click "Enable"
5. (Optional) Search for and enable "Maps JavaScript API" if you want to display maps

### 4. Create an API Key

1. In the left sidebar, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Your API key will be generated
4. **IMPORTANT:** Click "Restrict Key" to secure it

### 5. Secure Your API Key (CRITICAL)

1. Click "Restrict Key" when the key is created (or click on the key name later)
2. Under "Application restrictions":
   - For development: Select "HTTP referrers (web sites)" and add:
     - `localhost:3000/*`
     - `http://localhost:3000/*`
     - `https://localhost:3000/*`
   - For production: Add your actual domain:
     - `https://yourdomain.com/*`
     - `https://www.yourdomain.com/*`
3. Under "API restrictions":
   - Select "Restrict key"
   - Check only:
     - Places API (New)
     - Maps JavaScript API (if enabled)
4. Click "Save"

**Why is this important?** Without restrictions, anyone can use your API key and consume your quota, potentially incurring charges.

### 6. Configure Your Environment

1. In your `frontend` directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. Save the file

4. **Restart your development server** if it's running

### 7. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the landing page
3. Try the following:
   - Click "Detect Location" to test geolocation (this doesn't require Google Maps)
   - Type in the search box to test autocomplete (this requires Google Maps)

## Features Implemented

### ✅ Detect Location (No Google Maps Required)
- Uses browser's built-in Geolocation API
- Completely free
- Requires HTTPS in production
- Asks user for permission

### ✅ Suggest Places (Requires Google Maps)
- Uses Google Places Autocomplete API
- Shows suggestions as you type
- Biased to nearby locations if location is detected
- Restricted to India by default

## Cost Information

### Places API Pricing (as of 2024)
- **Session-based autocomplete:** $2.83 per 1,000 sessions
- A session includes multiple autocomplete requests within 5 minutes
- Google provides $200 in free credits every month
- For a typical application: ~70,000 sessions/month within free tier

### Geolocation API
- **Completely FREE** - Uses browser's built-in API

## Troubleshooting

### Error: "Error loading Google Maps"
- Check that your API key is correct
- Verify that Places API is enabled
- Make sure billing is enabled

### Error: "This API key is restricted"
- Check your HTTP referrer restrictions
- Make sure you added `localhost:3000` for development
- Verify the API restrictions match what you enabled

### Error: "You have exceeded your quota"
- You've used more than $200/month
- Consider adding billing alerts
- Review your usage in the Google Cloud Console

### Autocomplete not showing suggestions
- Check browser console for errors
- Verify the API key is loaded: `console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)`
- Make sure your internet connection is working

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Pricing Information](https://developers.google.com/maps/billing-and-pricing/pricing)

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Always restrict API keys** to specific domains
3. **Monitor usage** in Google Cloud Console
4. **Set up billing alerts** to prevent unexpected charges
5. **Rotate API keys** if compromised

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Review the Google Cloud Console for API status
3. Verify all setup steps were completed correctly
4. Check the troubleshooting section above

