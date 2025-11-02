# Location Features Implementation

## Overview

This document describes the implementation of two key location-based features for PocketShop:
1. **Detect Location** - Uses browser Geolocation API
2. **Suggest Places** - Uses Google Places Autocomplete API

## Features Implemented

### 1. Detect Location Feature ✅

**Technology:** Browser Geolocation API (FREE)

**Components:**
- `LocationDetector.tsx` - Reusable React component
- Integrated into desktop and mobile views of LandingPage

**How It Works:**
1. Uses `navigator.geolocation.getCurrentPosition()` API
2. Requests user permission to access location
3. Returns latitude/longitude coordinates
4. Optional: Can reverse geocode to get address

**Key Features:**
- ✅ Free to use (no external services)
- ✅ Works on all modern browsers
- ✅ Requires HTTPS in production
- ✅ User permission required
- ✅ Loading states
- ✅ Error handling with user-friendly messages
- ✅ Exposed via ref for click delegation
- ✅ Visual feedback (loading, success, error states)

**Usage:**
```tsx
import LocationDetector from '@/components/LocationDetector';

const MyComponent = () => {
  const locationRef = useRef<LocationDetectorRef>(null);

  return (
    <>
      <button onClick={() => locationRef.current?.triggerDetection()}>
        Detect Location
      </button>
      <LocationDetector
        ref={locationRef}
        onLocationDetected={(location) => {
          console.log('Location:', location);
        }}
      />
    </>
  );
};
```

### 2. Suggest Places Feature ✅

**Technology:** Google Places Autocomplete API

**Components:**
- `PlacesAutocomplete.tsx` - Reusable React component
- Uses `@react-google-maps/api` and `use-places-autocomplete`
- Integrated into search bar on desktop and mobile

**How It Works:**
1. Loads Google Maps JavaScript library
2. Uses `use-places-autocomplete` hook for autocomplete
3. Debounces input (300ms) to reduce API calls
4. Shows dropdown with suggestions
5. Supports keyboard navigation (arrow keys, enter, escape)
6. Biases results to user's location if detected

**Key Features:**
- ✅ Autocomplete suggestions as you type
- ✅ Debounced input (300ms)
- ✅ Keyboard navigation support
- ✅ Mobile and desktop optimized
- ✅ Location biasing for better results
- ✅ Restricted to India by default
- ✅ Loading states
- ✅ Error handling
- ✅ Clean dropdown UI

**Usage:**
```tsx
import PlacesAutocomplete from '@/components/PlacesAutocomplete';

const MyComponent = () => {
  return (
    <PlacesAutocomplete
      onPlaceSelected={(place) => {
        console.log('Selected:', place.address);
        console.log('Coordinates:', place.latitude, place.longitude);
      }}
      initialLocation={{ latitude: 28.6139, longitude: 77.2090 }}
      placeholder="Search for places..."
    />
  );
};
```

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── LocationDetector.tsx      # Geolocation implementation
│   │   ├── PlacesAutocomplete.tsx    # Google Places autocomplete
│   │   └── index.ts                  # Component exports
│   ├── pages/
│   │   └── LandingPage.tsx           # Integration page
│   └── .env.example                  # Environment template
└── docs/
    ├── setup/
    │   └── GOOGLE_MAPS_SETUP.md      # Detailed setup guide
    └── LOCATION_FEATURES_IMPLEMENTATION.md  # This file
```

## Installation

### Dependencies
```bash
npm install @react-google-maps/api use-places-autocomplete
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add your Google Maps API key
3. Restart development server

See `docs/setup/GOOGLE_MAPS_SETUP.md` for detailed instructions.

## Integration Points

### LandingPage.tsx

**Desktop View:**
- Location section is clickable and triggers location detection
- Search input uses PlacesAutocomplete
- Hidden LocationDetector component for ref access

**Mobile View:**
- Same functionality as desktop
- Responsive layout with stacked design
- Touch-optimized interactions

**Key Handlers:**
```tsx
const handleLocationDetected = (location) => {
  setUserLocation(location.coordinates);
  setSearchLocation(location.address);
};

const handlePlaceSelected = (place) => {
  setSearchLocation(place.address);
  setUserLocation(place.coordinates);
};
```

## Technical Details

### Location Detection

**API:** `navigator.geolocation.getCurrentPosition()`

**Options Used:**
```typescript
{
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
}
```

**Error Handling:**
- PERMISSION_DENIED: User denied location access
- POSITION_UNAVAILABLE: Location data unavailable
- TIMEOUT: Request timed out
- UNKNOWN: Unexpected error

### Places Autocomplete

**Libraries:**
- `@react-google-maps/api` - Google Maps integration
- `use-places-autocomplete` - Autocomplete logic

**Configuration:**
```typescript
{
  requestOptions: {
    locationBias: userLocation,
    componentRestrictions: { country: 'in' }
  },
  debounce: 300
}
```

**Restrictions:**
- Limited to India (componentRestrictions)
- HTTP referrer restrictions on API key
- Only Places API enabled (not full Maps API)

## Testing

### Test Location Detection
1. Navigate to landing page
2. Click "Detect Location"
3. Grant location permission
4. Verify coordinates displayed

### Test Places Autocomplete
1. Ensure Google Maps API key is configured
2. Navigate to landing page
3. Type in search box
4. Verify suggestions appear
5. Click or press Enter to select
6. Verify location updates

## Cost Analysis

### Detect Location
- **Cost:** FREE
- **API:** Browser Geolocation API
- **Limitations:** Requires HTTPS and user permission

### Suggest Places
- **Cost:** ~$2.83 per 1,000 sessions
- **Free Credits:** $200/month from Google
- **Typical Usage:** ~70,000 sessions/month within free tier
- **Best For:** Small to medium applications

## Security Considerations

### API Key Security
1. ✅ Never commit `.env` files
2. ✅ Restrict API keys to specific domains
3. ✅ Use HTTP referrer restrictions
4. ✅ Limit API access to required services only

### Location Privacy
1. ✅ Always request explicit user permission
2. ✅ Show clear feedback when location is accessed
3. ✅ Don't store location without consent
4. ✅ Respect user's privacy choices

## Future Enhancements

### Potential Improvements
1. **Reverse Geocoding:** Convert coordinates to addresses
2. **Recent Searches:** Cache and show recent place searches
3. **Favorites:** Allow users to save favorite locations
4. **Map View:** Display selected locations on a map
5. **Distance Calculation:** Show distance to places
6. **Category Filters:** Filter suggestions by category
7. **Search History:** Remember and suggest past searches

### Advanced Features
1. **Location Tracking:** Continuous location updates (for delivery)
2. **Geofencing:** Define areas for special deals
3. **Nearby Deals:** Show location-based promotions
4. **Route Optimization:** Suggest best routes
5. **Offline Maps:** Cache map tiles for offline use

## Troubleshooting

### Common Issues

**Location Detection Not Working**
- Check HTTPS is enabled (required in production)
- Verify browser permissions
- Check console for errors

**Autocomplete Not Showing**
- Verify Google Maps API key is correct
- Check Places API is enabled
- Ensure billing is enabled
- Review browser console for API errors

**Suggestions Not Relevant**
- Check location biasing is working
- Verify country restrictions
- Review API response in console

## Resources

- [Geolocation API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [React Google Maps](https://github.com/JustFly1984/react-google-maps-api)
- [use-places-autocomplete](https://github.com/wellyshen/use-places-autocomplete)

## Support

For issues or questions:
1. Check this documentation
2. Review Google Maps setup guide
3. Check browser console for errors
4. Verify environment configuration
5. Review Google Cloud Console for API status

