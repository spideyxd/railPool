# 🗺️ Google Maps Location Picker - Quick Reference

## ⚡ 60-Second Setup

```bash
# 1. Install
npm install @googlemaps/js-api-loader

# 2. Configure .env.local
echo "REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_KEY" >> frontend/.env.local

# 3. Restart
npm start
```

## 🔑 Get API Key (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable: **Maps JavaScript API**, **Geocoding API**, **Places API**
3. Create **API Key**
4. Add restrictions (optional but recommended)

## 📍 How It Works

| User Action | Result |
|------------|--------|
| Click on map | Marker moves, address appears |
| Type in search | Autocomplete suggestions |
| Drag marker | Location updates in real-time |
| Click Confirm | Form fields update |

## 💻 Use in Code

**For Location Selection (Editing)**
```jsx
import LocationPickerMap from '../components/LocationPickerMap';

<LocationPickerMap
  onLocationSelect={(data) => {
    updateForm({
      lat: data.lat,
      lng: data.lng,
      address: data.address
    });
  }}
  initialLocation={{ lat: 28.6139, lng: 77.209 }}
/>
```

**For Viewing Locations (Read-only)**
```jsx
import LocationDisplay from '../components/LocationDisplay';

<LocationDisplay
  locations={[
    { lat: 28.6139, lng: 77.209, title: 'Delhi', color: '#0ea5e9' }
  ]}
  height="400px"
/>
```

**For Utility Operations**
```jsx
import { useGoogleMaps } from '../hooks/useGoogleMaps';

const { reverseGeocode, calculateDistance } = useGoogleMaps();

const address = await reverseGeocode(28.6139, 77.209);
const distKm = calculateDistance(28.6139, 77.209, 28.5721, 77.0364);
```

## 📁 File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── LocationPickerMap.jsx      ← Main picker component
│   │   └── LocationDisplay.jsx         ← Map viewer component
│   ├── hooks/
│   │   └── useGoogleMaps.js           ← Utility hook
│   └── pages/
│       └── Dashboard.js                ← Uses LocationPickerMap
└── .env.local                          ← API key
```

## 🎯 Where It's Used

| Page | Field | Component |
|------|-------|-----------|
| Dashboard | Destination | LocationPickerMap |

## 🐛 Quick Troubleshoot

| Issue | Solution |
|-------|----------|
| Map not showing | Check API key in `.env.local` |
| Search not working | Enable Places API |
| Address lookup fails | Enable Geocoding API |
| "Invalid Client" error | Check Google Cloud Console permissions |

## 🔗 Important Links

- [Setup Guide](./GOOGLE_MAPS_SETUP.md) - Full instructions
- [Implementation Guide](./GOOGLE_MAPS_IMPLEMENTATION.md) - Examples & API reference
- [Google Cloud Console](https://console.cloud.google.com/) - Manage keys
- [Maps Documentation](https://developers.google.com/maps/documentation/javascript) - Official docs

## ⚙️ Environment Variables

```env
# Required
REACT_APP_GOOGLE_MAPS_API_KEY=AIza...

# Optional (already set)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=...
```

## 💰 Pricing Notes

- **Free**: $200/month credit
- **Maps JS API**: $7 per 1000 requests
- **Geocoding**: $5 per 1000 requests  
- **Places API**: $7 per 1000 requests
- **Usual cost**: ~$0 for development/small apps

## 🔒 Security Checklist

- [ ] API key in `.env.local` (environment only)
- [ ] `.env.local` in `.gitignore` (not tracked)
- [ ] HTTP referrer restrictions enabled
- [ ] API-specific restrictions applied
- [ ] Separate keys for dev/prod

## 📊 Common Patterns

**Get address from coordinates:**
```javascript
const { reverseGeocode } = useGoogleMaps();
const address = await reverseGeocode(28.6139, 77.209);
```

**Get coordinates from address:**
```javascript
const { forwardGeocode } = useGoogleMaps();
const result = await forwardGeocode('Delhi Airport');
// Returns: {lat, lng, address, placeId}
```

**Calculate distance:**
```javascript
const { calculateDistance } = useGoogleMaps();
const km = calculateDistance(28.6139, 77.209, 28.5721, 77.0364);
```

**Check if point is in bounds:**
```javascript
const { getBounds, isPointInBounds } = useGoogleMaps();
const bounds = getBounds(locations);
const isIn = isPointInBounds({lat: 28.6, lng: 77.2}, bounds);
```

## 🚀 Quick Deploy

1. Get production API key
2. Update `.env.local` (or CI/CD secrets)
3. Deploy with `npm build`
4. Monitor API usage in Google Cloud Console

## 📞 Need Help?

1. **Docs**: Read [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)
2. **Examples**: Check [GOOGLE_MAPS_IMPLEMENTATION.md](./GOOGLE_MAPS_IMPLEMENTATION.md)
3. **Console**: Open DevTools (F12) and check errors
4. **Cloud**: Verify settings in Google Cloud Console

---

**Last Updated**: April 4, 2026  
**Status**: Production Ready ✅
