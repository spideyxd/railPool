# 🗺️ Google Maps Location Picker Setup Guide

## Overview
Your RailPool app now features an interactive Google Maps location picker that replaces manual latitude/longitude input. Users can now:
- Click anywhere on the map to select a location
- Drag a marker to refine the location
- Search for locations using the search bar
- See the address in human-readable format
- Automatically capture lat/lng coordinates

---

## 📋 Required APIs

Enable these Google APIs in your Google Cloud Console:

1. **Maps JavaScript API** - For rendering the interactive map
2. **Geocoding API** - For converting coordinates to addresses (reverse geocoding)
3. **Places API** - For location search and autocomplete

---

## 🔧 Setup Steps

### Step 1: Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing "RailPool" project)
3. Go to **APIs & Services → Library**
4. Search for and enable:
   - Maps JavaScript API
   - Geocoding API
   - Places API

5. Go to **APIs & Services → Credentials**
6. Click **CREATE CREDENTIALS** → **API Key**
7. Copy your **API Key** (a long string starting with `AIza...`)

### Step 2: Enable Billing
⚠️ **Important**: Google Maps APIs require billing to be enabled. However, Google provides:
- **$200 monthly credit** (more than enough for development)
- Maps JavaScript API: $7 per 1000 requests
- Geocoding: $5 per 1000 requests
- Places API: $7 per 1000 requests

Set up billing in your Google Cloud Console under **Billing → Create Account**.

### Step 3: Add API Restrictions (Security)

⚠️ **Best Practice**: Restrict your API key to prevent unauthorized use

1. In Google Cloud Console, go to **Credentials**
2. Click your API Key
3. Under **Application restrictions**, select **HTTP referrers (web sites)**
4. Add your domains:
   - `http://localhost:3000/*` (development)
   - `http://localhost/*` (dev fallback)
   - `https://yourdomain.com/*` (production - replace with your domain)

5. Under **API restrictions**, select **Restrict key**
6. Check only:
   - Maps JavaScript API
   - Geocoding API
   - Places API

7. Click **SAVE**

### Step 4: Configure Frontend

Update `frontend/.env.local`:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-client-id

# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE_AIza...

# API Configuration
REACT_APP_API_URL=http://localhost:5000
```

### Step 5: Install Dependencies

```bash
cd frontend
npm install @googlemaps/js-api-loader
npm start
```

---

## 🚀 Usage

### In Your Forms

The `LocationPickerMap` component is now integrated into the **Create Ride** form. When users:

1. **Load the form** - Map appears centered on Delhi (default location)
2. **Search** - Type in the search box to find locations (Places Autocomplete)
3. **Click on map** - Marker moves to clicked location
4. **Drag marker** - Refine the location by dragging
5. **Confirm** - Click "Confirm Location" to update form values

The component automatically updates:
- `destination_lat` 
- `destination_lng`
- `destination_name` (address from reverse geocoding)

### Component API

```jsx
import LocationPickerMap from '../components/LocationPickerMap';

<LocationPickerMap
  onLocationSelect={(locationData) => {
    console.log('Selected location:', locationData);
    // locationData = { lat: number, lng: number, address: string }
    // Update your form state here
  }}
  initialLocation={{
    lat: 28.6139,        // Delhi coordinates
    lng: 77.209,
    address: 'Delhi, India'
  }}
  searchPlaceholder="Search for your destination..."
  className="my-4"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onLocationSelect` | function | required | Callback when location is confirmed |
| `initialLocation` | object | `{lat: 28.6139, lng: 77.209, address: ''}` | Initial map center and marker |
| `searchPlaceholder` | string | "Search location..." | Placeholder for search input |
| `className` | string | "" | Additional CSS classes |

---

## 🎨 Features Included

✅ **Interactive Map**
- Click anywhere to select location
- Drag marker to refine location
- Smooth animations (Framer Motion)
- Dark theme matching your app

✅ **Search & Autocomplete**
- Google Places autocomplete
- Restricted to India (configurable)
- Real-time suggestions

✅ **Reverse Geocoding**
- Automatic address lookup from coordinates
- Human-readable location display
- Copy-pasteable address format

✅ **Responsive Design**
- Full-width responsive map
- Mobile-friendly interface
- Touch-friendly marker dragging
- Floating info cards

✅ **User Experience**
- Loading states
- Error handling
- Confirmation workflow
- Visual feedback

---

## 🗺️ Customization

### Change Default Location

Edit [LocationPickerMap.jsx](../src/components/LocationPickerMap.jsx):

```javascript
const defaultLocation = {
  lat: 28.6139,  // Change this
  lng: 77.209,    // Change this
  address: 'Your City'
};
```

### Restrict to Different Country

In `LocationPickerMap.jsx`, find the autocomplete setup:

```javascript
const autocomplete = new google.maps.places.Autocomplete(inputElement, {
  types: ['geocode'],
  componentRestrictions: { country: 'in' }, // Change 'in' to your country code
});
```

### Custom Map Styling

The component includes a `getMapStyles()` function with dark theme. Customize colors there or use [Google Maps Style Generator](https://mapstyle.withgoogle.com/).

---

## 🐛 Troubleshooting

### Issue: "Google Maps API key not configured"
**Solution**: 
- Ensure `REACT_APP_GOOGLE_MAPS_API_KEY` is set in `frontend/.env.local`
- Restart development server: `npm start`
- Check browser console for full error message

### Issue: Map doesn't load
**Solution**:
- Verify API key in Google Cloud Console hasn't been restricted
- Check that Maps JavaScript API is enabled
- Look for CORS errors in browser console
- Ensure `http://localhost:3000/*` is in API key restrictions

### Issue: Search/Geocoding not working
**Solution**:
- Confirm Places API is enabled (for search)
- Confirm Geocoding API is enabled (for address lookup)
- Check billing is enabled on Google Cloud project

### Issue: Billing warning
**Solution**:
- This is normal - Google requires billing, but provides $200/month free credit
- Your usage is typically well under this limit during development
- You can set up billing alerts in Google Cloud Console

---

## 📊 Performance Tips

1. **Lazy Load Map** - Component loads only when form is active
2. **API Caching** - Google caches results to reduce API calls
3. **Request Limits** - Consider caching reverse geocoding results if needed

---

## 🔒 Security Best Practices

✅ **Implemented**:
- API key in environment variables (not hardcoded)
- HTTP referrer restrictions
- API-specific restrictions

⚠️ **Recommendations**:
- Never commit `.env.local` to git (use `.env.example`)
- Rotate API keys periodically
- Monitor API usage in Google Cloud Console
- Use separate keys for dev/prod

---

## 📱 Mobile Optimization

The component is fully responsive:
- Touch-friendly marker dragging
- Optimized for mobile screens
- Adjusts map height based on viewport
- Readable text on small screens

---

## 🚢 Migration Path

### From Manual Input to Map Picker

**Before**: Users entered coordinates manually
```jsx
<input name="destination_lat" type="number" />
<input name="destination_lng" type="number" />
```

**After**: Users pick visually on the map
```jsx
<LocationPickerMap onLocationSelect={handleLocation} />
```

The form submission logic remains unchanged - the component just provides a better UX for selecting coordinates.

---

## 📚 Additional Resources

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Places API](https://developers.google.com/maps/documentation/places)
- [API Loader Documentation](https://github.com/googlemaps/js-api-loader)

---

## ✅ Testing Checklist

- [ ] API key configured in `.env.local`
- [ ] `@googlemaps/js-api-loader` installed via npm
- [ ] Map loads without errors
- [ ] Can click on map to place marker
- [ ] Can drag marker around
- [ ] Search autocomplete works
- [ ] Address displays after location selection
- [ ] Coordinates update form fields
- [ ] Form submission still works with new coordinates
- [ ] Mobile screen looks good
- [ ] API usage is reasonable in Google Cloud Console

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12 → Console tab)
2. Verify API key and restrictions in Google Cloud Console
3. Ensure all required APIs are enabled
4. Check that `.env.local` is properly formatted
5. Try clearing browser cache and restarting dev server

---

**Status**: ✅ Component Complete | ⏳ API Configuration Pending  
**Created**: April 4, 2026  
**Last Updated**: April 4, 2026  
**Compatibility**: React 18+, Tailwind CSS 3+, Framer Motion 10+
