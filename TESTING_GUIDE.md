# Testing Guide for Location Features

## Quick Start Testing

### 1. Start Your Development Server

```bash
cd frontend
npm run dev
```

The server should start at `http://localhost:3000`

### 2. Test Detect Location Feature

#### Desktop:
1. Navigate to the landing page
2. Find the search bar in the hero section
3. Click on the **"Location"** section on the left side
4. Grant permission when browser asks
5. Verify:
   - ✅ Location coordinates appear
   - ✅ Loading spinner shows while detecting
   - ✅ Success state is shown

#### Mobile (Responsive Testing):
1. Open browser DevTools (F12)
2. Click device toggle (mobile icon)
3. Select a device (e.g., iPhone 12)
4. Repeat the same steps as above

### 3. Test Places Autocomplete Feature

#### Desktop:
1. Click in the search input box (right side of search bar)
2. Start typing a location (e.g., "Pune")
3. Verify:
   - ✅ Suggestions dropdown appears
   - ✅ Multiple suggestions shown
   - ✅ Keyboard navigation works (arrow keys)
   - ✅ Clicking a suggestion selects it
   - ✅ Pressing Enter selects highlighted suggestion

#### Keyboard Navigation:
- **Arrow Down:** Navigate to next suggestion
- **Arrow Up:** Navigate to previous suggestion
- **Enter:** Select highlighted suggestion
- **Escape:** Close suggestions

### 4. Integration Testing

1. Click "Detect Location"
2. Wait for coordinates
3. Then type in search box
4. Verify suggestions are biased to your location

## Expected Behavior

### ✅ Detect Location

**Success State:**
```
Location
19.0760, 72.8777
```

**Loading State:**
```
Location
Detecting...
```

**Error State:**
```
Location
Failed (permission denied)
```

### ✅ Places Autocomplete

**Typing "Delhi":**
```
Search box: [Delhi_________]
Dropdown:
📍 Delhi, Delhi, India
📍 New Delhi, Delhi, India
📍 Delhi Cantonment, Delhi, India
📍 Connaught Place, New Delhi, Delhi, India
...
```

## Console Verification

Open browser DevTools (F12) → Console tab:

### ✅ Good - No Errors:
```
Location detected: 19.0760, 72.8777
```

### ❌ Errors to Look For:

**Google Maps Not Loaded:**
```
Error loading Google Maps. Please check your API key.
```
**Solution:** Verify API key in `.env.local`

**API Key Invalid:**
```
Error: The provided API key is invalid.
```
**Solution:** Check API key in Google Cloud Console

**Places API Not Enabled:**
```
Error: Places API is not enabled.
```
**Solution:** Enable Places API in Google Cloud Console

**Quota Exceeded:**
```
Error: Quota exceeded for Places API.
```
**Solution:** Check billing and usage limits

## Browser Compatibility

### ✅ Fully Supported:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### ⚠️ Geolocation Requires HTTPS:
- **Localhost:** Works with HTTP
- **Production:** Requires HTTPS

## Troubleshooting

### Issue: Location not detected

**Check:**
- ✅ Is location permission granted?
- ✅ Is browser geolocation enabled?
- ✅ Is HTTPS enabled (production)?
- ✅ Check browser console for errors

**Common Solutions:**
```bash
# If on macOS and location not working
# Check System Preferences → Security & Privacy → Privacy → Location Services
```

### Issue: Autocomplete not showing

**Check:**
- ✅ Is API key correct in `.env.local`?
- ✅ Is Places API enabled in Google Cloud?
- ✅ Is billing enabled?
- ✅ Are restrictions too strict?
- ✅ Check browser console for errors

**Quick API Key Check:**
```bash
cd frontend
cat .env.local | grep GOOGLE
# Should show: VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

### Issue: Suggestions showing foreign locations

**Expected:** Since we restricted to India, all suggestions should be in India

**If seeing foreign locations:**
- Check that country restriction is set to 'in' in PlacesAutocomplete.tsx

## Performance Testing

### Expected Performance:
- **Location detection:** < 2 seconds
- **Autocomplete response:** < 300ms after typing stops
- **Suggestions load:** < 1 second

### Load Testing:
1. Type continuously in search box
2. Verify debouncing works (not making request for every keystroke)
3. Check API calls in Network tab (should be throttled)

## Mobile Testing

### iOS Safari:
- Location detection works
- Autocomplete works
- Keyboard navigation works

### Android Chrome:
- Location detection works
- Autocomplete works
- Touch navigation works

## Security Verification

### ✅ Check in Network Tab:
- API calls go to: `maps.googleapis.com`
- API key is sent but restricted
- No CORS errors

### ✅ Verify Restrictions:
- Test from different localhost port: Should fail
- Test from different domain: Should fail
- Test from your domain: Should work

## Success Criteria

### Must Have:
- [x] Detect location works on click
- [x] Permission prompt appears
- [x] Coordinates displayed
- [x] Autocomplete shows suggestions
- [x] Click and keyboard navigation works
- [x] Mobile responsive
- [x] No console errors
- [x] Loading states work
- [x] Error states handled

### Nice to Have:
- [ ] Recent searches cached
- [ ] Reverse geocoding (coordinates → address)
- [ ] Map view integration
- [ ] Search history

## Next Steps After Testing

1. ✅ Verify API key restrictions are set
2. ✅ Monitor usage in Google Cloud Console
3. ✅ Set up billing alerts
4. ✅ Test on production domain
5. ✅ Document any issues found

## Quick Commands

```bash
# Start dev server
cd frontend && npm run dev

# Check API key
cat frontend/.env.local | grep GOOGLE

# Verify no TypeScript errors
cd frontend && npm run build

# Check linting
cd frontend && npm run lint
```

## Need Help?

If tests fail:
1. Check browser console for specific errors
2. Verify API key configuration
3. Review Google Cloud Console for API status
4. Check `SECURITY_SETUP_REQUIRED.md` for security setup
5. Review `docs/setup/GOOGLE_MAPS_SETUP.md` for detailed setup

---

**Happy Testing! 🎉**

