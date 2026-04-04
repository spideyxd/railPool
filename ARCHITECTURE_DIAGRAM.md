# 🏗️ Google Maps Location Picker - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        RailPool App                             │
│  (React 18 + Tailwind CSS + Framer Motion)                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Dashboard    LocationPicker   LocationDisplay
    (Create)    (Interactive)    (View-only)
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   useGoogleMaps Hook          Environment (.env.local)
   - reverseGeocode            - REACT_APP_GOOGLE_MAPS_API_KEY
   - forwardGeocode
   - calculateDistance
   - getBounds/isPointInBounds
        │
        │
        ▼
   Google Maps APIs (Cloud)
   ┌─────────────────────────────┐
   │ Maps JavaScript API         │
   │ Geocoding API               │
   │ Places API                  │
   └─────────────────────────────┘
```

---

## Data Flow Diagram

### User Selection Flow

```
User Interaction
    │
    ├─ [1] Click on Map
    │       └─> Event Listener catches click
    │       └─> Extract lat/lng from click event
    │       └─> Update marker position
    │       └─> Call reverseGeocode()
    │               ↓
    │           Google Geocoding API
    │           (coordinates → address)
    │               ↓
    │           Return formatted address
    │       └─> Update UI with address
    │       └─> Show confirmation card
    │
    ├─ [2] Drag Marker
    │       └─> Drag listener on marker
    │       └─> Extract new lat/lng
    │       └─> Update map center
    │       └─> Reverse geocode new position
    │       └─> Display new address
    │
    ├─ [3] Search Location
    │       └─> Type in search box
    │       └─> Google Places Autocomplete
    │               ↓
    │           Google Places API
    │           (suggestions)
    │               ↓
    │           Display suggestions
    │       └─> User selects suggestion
    │       └─> Extract place details
    │       └─> Get coordinates from place
    │       └─> Update marker
    │       └─> Display address
    │
    └─ [4] Click Confirm
            └─> Validate selected location
            └─> Return locationData Object
                    {
                      lat: number,
                      lng: number,
                      address: string
                    }
            └─> Process in Form
                    ├─ destination_lat = data.lat
                    ├─ destination_lng = data.lng
                    ├─ destination_name = data.address
                    └─ Update form state
            └─> Ready for form submission
```

---

## Component Dependency Graph

```
App (index.js)
│
└─ Dashboard.js
   │
   ├─ CreateRideForm
   │  │
   │  ├─ LocationPickerMap ◄─ Main Component
   │  │  │
   │  │  └─ useGoogleMaps Hook ◄─ Utility
   │  │     │
   │  │     └─ Google Maps JS Loader
   │  │
   │  └─ Form Fields
   │     (station, arrival_time, etc)
   │
   ├─ RideIntentsList
   │  │
   │  └─ LocationDisplay ◄─ View Component
   │     │
   │     └─ useGoogleMaps Hook
   │        │
   │        └─ Google Maps JS Loader
   │
   └─ RequestsList
```

---

## State Management Flow

```
Component Level State:

LocationPickerMap.jsx
├─ location
│  └─ { lat, lng, address }
├─ searchInput
├─ isLoading
├─ error
├─ showConfirm
└─ isMapReady

Dashboard.js (CreateRideForm)
└─ formData
   ├─ destination_lat (from map)
   ├─ destination_lng (from map)
   ├─ destination_name (from map)
   ├─ station
   ├─ arrival_time
   ├─ intent_type
   ├─ seats_available
   └─ seats_needed
```

---

## API Call Sequence

```
User selects location on map
        │
        ▼
[1] Google Maps loads
    POST → Google Maps JS Loader
    ← Returns google maps object

[2] User clicks/drags/searches
    ├─ If clicking on map:
    │  POST → Reverse Geocoding API
    │  Request: { lat, lng }
    │  Response: { formatted_address, ... }
    │
    ├─ If searching:
    │  POST → Places Autocomplete API
    │  Request: { searchTerm }
    │  Response: [{ suggestion1 }, { suggestion2 }, ...]
    │
    └─ If selecting from autocomplete:
       POST → Places Details API
       Request: { placeId }
       Response: { lat, lng, address, ... }

[3] User confirms
    ← Return location data to form

[4] Form submitted
    POST → Your Backend API
    /auth/ride/create
    Payload: { ..., destination_lat, destination_lng, ... }
    Response: { success, rideId, ... }
```

---

## File Organization

```
frontend/
├── src/
│   ├── components/
│   │   ├── LocationPickerMap.jsx          (440 lines)
│   │   │   ├─ Map initialization
│   │   │   ├─ Marker management
│   │   │   ├─ Search implementation
│   │   │   ├─ Reverse geocoding
│   │   │   └─ Animations
│   │   │
│   │   ├── LocationDisplay.jsx            (250 lines)
│   │   │   ├─ Read-only map display
│   │   │   ├─ Multi-marker support
│   │   │   ├─ Info windows
│   │   │   └─ Auto-zoom to bounds
│   │   │
│   │   └── FluidCanvas.jsx                (existing shader)
│   │
│   ├── hooks/
│   │   └── useGoogleMaps.js               (200 lines)
│   │       ├─ API loading
│   │       ├─ Reverse geocoding
│   │       ├─ Forward geocoding
│   │       ├─ Distance calculation
│   │       └─ Bounds helper
│   │
│   ├── pages/
│   │   ├── Dashboard.js                   (modified)
│   │   │   └─ Uses LocationPickerMap
│   │   │
│   │   └── Search.js                      (existing)
│   │
│   ├── services/
│   │   └── api.js                         (existing)
│   │
│   └── index.js
│
├── .env.local
│   └─ REACT_APP_GOOGLE_MAPS_API_KEY
│
├── package.json                           (updated)
│   └─ @googlemaps/js-api-loader
│
└── public/
    └── index.html
```

---

## Google Maps API Integration

```
┌────────────────────────────────────────┐
│      JS API Loader (npm package)       │
│  @googlemaps/js-api-loader v1.16.2     │
└────────────┬─────────────────────────┬─┘
             │                         │
      ┌──────▼────────┐          ┌─────▼──────┐
      │ Maps JS API   │          │ Geocoding  │
      │               │          │ API        │
      ├─ Map display  │          ├─ Reverse   │
      ├─ Markers      │          │  geocode   │
      ├─ Events       │          ├─ Forward   │
      ├─ Zoom/Pan     │          │  geocode   │
      └─ Styling      │          └────────────┘
             │
             ▼
      ┌──────────────────────┐
      │ Places Autocomplete  │
      │   (optional)         │
      ├─ Search suggestions  │
      ├─ Place details       │
      ├─ Address components  │
      └─ Place types/icons   │
```

---

## Event Flow Diagram

```
User Action                  Component Response        State Update

Click on Map
    │
    ▼
click event listener
    ├─ Extract coordinates
    ├─ Create LatLng object
    ├─ Get location geometry
    │
    ▼
Update marker
    ├─ setPosition(newLocation)
    ├─ panToCenter(newLocation)
    │
    ▼
Reverse Geocode
    ├─ Call Geocoding API
    ├─ Parse response
    │
    ▼
Update State
    ├─ setLocation({ lat, lng, address })
    ├─ setShowConfirm(true)
    │
    ▼
Re-render
    └─ Display address card
       Display current selection
       Show confirm button
```

---

## Component Props Flow

```
Dashboard.js (parent)
    │
    ├─ Creates: formData state
    │   └─ { destination_lat, destination_lng, destination_name, ... }
    │
    ▼
LocationPickerMap (child)
    │
    ├─ Receives Props:
    │  ├─ onLocationSelect (callback)
    │  ├─ initialLocation (lat, lng, address)
    │  ├─ searchPlaceholder (string)
    │  └─ className (string)
    │
    ├─ Manages internal state:
    │  ├─ location (current selection)
    │  ├─ searchInput (search field)
    │  ├─ isLoading (loading state)
    │  ├─ error (error messages)
    │  ├─ showConfirm (confirmation card)
    │  └─ isMapReady (map loaded)
    │
    └─ Calls Callback:
       onLocationSelect({lat, lng, address})
            │
            ▼
       Back to Dashboard
       └─ setFormData updates in parent
          ├─ destination_lat = data.lat
          ├─ destination_lng = data.lng
          └─ destination_name = data.address
```

---

## Error Handling Flow

```
User Interaction
    │
    ├─ Try block
    │  ├─ Load API
    │  ├─ Initialize map
    │  ├─ Process user input
    │  ├─ API calls
    │  └─ State updates
    │
    └─ Catch block
       ├─ Identify error type
       ├─ Set error state
       ├─ Log to console
       └─ Display error UI
          ├─ Error alert box
          ├─ User-friendly message
          ├─ Retry option
          └─ Recovery path
```

---

## Performance Optimization Strategy

```
Lazy Loading:
├─ Maps API loads only when component mounts
├─ Scripts load progressively
└─ Minimal initial bundle impact

Caching:
├─ Geocoding results cached
├─ Map styles cached
└─ Marker icons cached

Event Optimization:
├─ Debounced search input (if needed)
├─ Throttled map interactions
└─ Efficient event listener cleanup

Memory Management:
├─ Cleanup on unmount
├─ Remove event listeners
├─ Clear references
└─ Prevent memory leaks
```

---

## Security Flow

```
Environment Variables (.env.local)
└─ REACT_APP_GOOGLE_MAPS_API_KEY (never logged)
         │
         ▼
Application Runtime
└─ Only in browser
  ├─ Not logged to console
  ├─ Not sent to backend
  ├─ Protected by CORS
  └─ Restricted by API key settings

Google Cloud Console
├─ API Key Restrictions
│  ├─ HTTP Referrers (your domain only)
│  ├─ API Limits (Maps/Geocoding/Places only)
│  └─ Usage Monitoring
│
└─ Billing Alerts
   ├─ Monthly spending limit
   ├─ Email notifications
   └─ Usage tracking
```

---

## Testing Flow

```
Unit Tests
├─ useGoogleMaps hook
├─ Coordinate utilities
├─ Distance calculations
└─ State management

Integration Tests
├─ Component mounting
├─ Props passing
├─ Callback execution
└─ State updates

E2E Tests
├─ Map displays
├─ Click functionality
├─ Search works
├─ Form integration
└─ Submission successful

Manual Testing
├─ Desktop browsers
├─ Mobile devices
├─ Touch interactions
├─ API responsiveness
└─ Error scenarios
```

---

## Deployment Flow

```
Development
├─ API Key (dev restricted)
├─ Local testing
└─ .env.local not committed

Staging
├─ API Key (staging domain)
├─ Full testing
└─ Performance monitoring

Production
├─ API Key (production restricted)
├─ Billing configured
├─ Monitoring active
├─ Rate limiting set
└─ Error tracking enabled
```

---

## Summary: Everything Works Together

```
User Opens Dashboard
    ↓
Fillls form (Station, Arrival Time, etc)
    ↓
Scrolls to "Select Destination Location"
    ↓
LocationPickerMap loads
    ├─ Google Maps API initializes
    ├─ Map renders at default location
    └─ Search bar ready
    ↓
User interacts:
    ├─ Clicks on map → Marker moves → Address updates
    ├─ Searches location → Suggestions appear → Selects one
    └─ Drags marker → Position updates → Address refreshes
    ↓
User confirms location
    ↓
Form updates:
    ├─ destination_lat (number)
    ├─ destination_lng (number)
    └─ destination_name (address text)
    ↓
User clicks "Create Ride"
    ↓
Form submits to backend
    ├─ Backend receives coordinates
    ├─ Stores in database
    └─ Response success
    ↓
User sees confirmation
    ↓
Ride created with location! ✅
```

---

**This architecture ensures:**
✅ Clean separation of concerns  
✅ Reusable components  
✅ Efficient API usage  
✅ Optimal performance  
✅ Easy to test and debug  
✅ Security best practices  
✅ Mobile responsive  
✅ Production ready  

---

**Created**: April 4, 2026
