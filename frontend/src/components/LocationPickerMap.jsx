import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Loader, AlertCircle, Check } from 'lucide-react';
import { Loader as JSAPILoader } from '@googlemaps/js-api-loader';

/**
 * LocationPickerMap Component
 * Interactive Google Maps location picker with reverse geocoding
 * Replaces manual latitude/longitude input fields
 */
const LocationPickerMap = ({
  onLocationSelect,
  initialLocation = { lat: 28.6139, lng: 77.209, address: '' },
  searchPlaceholder = 'Search location...',
  className = '',
}) => {
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const geocoderRef = useRef(null);

  const [location, setLocation] = useState({
    lat: initialLocation.lat,
    lng: initialLocation.lng,
    address: initialLocation.address || '',
  });

  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Google Maps API
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);

        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setError('Google Maps API key not configured');
          return;
        }

        const loader = new JSAPILoader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['maps', 'places', 'geocoding'],
        });

        const google = await loader.load();

        // Create map instance
        const mapInstance = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: { lat: location.lat, lng: location.lng },
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: getMapStyles(), // Dark theme to match your app
        });

        mapInstanceRef.current = mapInstance;
        geocoderRef.current = new google.maps.Geocoder();

        // Create marker
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstance,
          draggable: true,
          title: 'Drag to select location or click on map',
          animation: google.maps.Animation.DROP,
        });

        markerRef.current = marker;

        // Handle map clicks
        mapInstance.addListener('click', (e) => {
          const clickedLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          updateMarkerLocation(clickedLocation, google);
        });

        // Handle marker drag
        marker.addListener('dragend', () => {
          const draggedLocation = {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng(),
          };
          updateMarkerLocation(draggedLocation, google);
        });

        // Setup Places Autocomplete
        setupAutocomplete(google, searchInputRef.current);

        setIsMapReady(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Map initialization failed:', err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    if (mapRef.current && !isMapReady) {
      initMap();
    }
  }, []);

  // Update marker position and geocode address
  const updateMarkerLocation = async (newLocation, google) => {
    if (markerRef.current) {
      markerRef.current.setPosition(newLocation);
      mapInstanceRef.current.panTo(newLocation);
    }

    // Reverse geocode to get address
    try {
      const result = await geocoderRef.current.geocode({
        location: new google.maps.LatLng(newLocation.lat, newLocation.lng),
      });

      // Use formatted_address if available, otherwise construct from address components
      let address = 'Selected Location';
      if (result && result.length > 0) {
        address = result[0].formatted_address;
      } else {
        // Fallback: use the search input if available, or show coordinates
        address = searchInput.trim() ? searchInput : `${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)}`;
      }
      
      setLocation({
        lat: newLocation.lat,
        lng: newLocation.lng,
        address: address,
      });
      setShowConfirm(true);
      setError('');
    } catch (err) {
      console.error('Geocoding failed:', err);
      // On error, show a friendly message or use the search input
      const fallbackAddress = searchInput.trim() ? searchInput : `Location (${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)})`;
      setLocation({
        lat: newLocation.lat,
        lng: newLocation.lng,
        address: fallbackAddress,
      });
      setShowConfirm(true);
      setError('');
    }
  };

  // Setup Places Autocomplete
  const setupAutocomplete = (google, inputElement) => {
    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      types: ['geocode'],
      componentRestrictions: { country: 'in' }, // Restrict to India - change if needed
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) {
        setError('Invalid location selected');
        return;
      }

      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      // Use place formatted_address if available, otherwise use name or fallback
      const placeName = place.formatted_address || place.name || 'Location';
      
      // Update location with place name before reverse geocoding
      setLocation({
        lat: newLocation.lat,
        lng: newLocation.lng,
        address: placeName,
      });
      setShowConfirm(true);
      setSearchInput(placeName);
      setError('');
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(newLocation);
      }
      
      if (markerRef.current) {
        markerRef.current.setPosition(newLocation);
      }
    });

    autocompleteRef.current = autocomplete;
  };

  // Confirm location selection (without submitting parent form)
  const handleConfirm = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onLocationSelect({
      lat: location.lat,
      lng: location.lng,
      address: location.address,
    });
    setShowConfirm(false);
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-dark-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-field pl-10"
          />
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-xl overflow-hidden border border-dark-700 shadow-xl"
      >
        <div
          ref={mapRef}
          className="w-full h-96 bg-dark-800"
          style={{ minHeight: '400px' }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-dark-950/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 animate-spin text-primary-500" />
              <p className="text-dark-300 text-sm">Loading map...</p>
            </div>
          </div>
        )}

        {/* Info Overlay - Top Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 bg-dark-900/95 backdrop-blur-md p-4 rounded-lg border border-dark-700 max-w-xs shadow-lg"
        >
          <div className="text-xs text-dark-400 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-dark-300 font-medium mb-1">Location Tips:</p>
                <ul className="space-y-1 text-dark-400">
                  <li>• Click on map to select</li>
                  <li>• Drag marker to refine</li>
                  <li>• Or search above</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Location Details & Confirm Card */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 bg-gradient-to-r from-dark-800 to-dark-900 border border-primary-500/30 rounded-xl space-y-4"
          >
            {/* Address Display */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-dark-400 uppercase tracking-wide">
                Selected Address
              </label>
              <p className="text-dark-100 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="break-words">{location.address}</span>
              </p>
            </div>

            {/* Coordinates Display */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-dark-700/50 rounded-lg">
                <p className="text-dark-500 text-xs font-medium mb-1">Latitude</p>
                <p className="font-mono text-primary-400">{location.lat.toFixed(6)}</p>
              </div>
              <div className="p-2 bg-dark-700/50 rounded-lg">
                <p className="text-dark-500 text-xs font-medium mb-1">Longitude</p>
                <p className="font-mono text-primary-400">{location.lng.toFixed(6)}</p>
              </div>
            </div>

            {/* Confirm Button */}
            <motion.button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleConfirm(e);
              }}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Check className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Confirm Location</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Location Display (when not confirming) */}
      {!showConfirm && location.address && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-dark-800 rounded-lg border border-dark-700"
        >
          <p className="text-xs text-dark-500 font-medium mb-1">Current Selection:</p>
          <p className="text-dark-200 text-sm line-clamp-2">{location.address}</p>
          <p className="text-xs text-dark-500 mt-2">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Dark theme map styles to match the app
const getMapStyles = () => [
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1f2937' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b5563' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b5563' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#16213e' }],
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#374151' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#273142' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [{ color: '#4f5966' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#6b7c8f' }],
  },
  {
    featureType: 'surface',
    elementType: 'all',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#374151' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1f3a52' }],
  },
];

export default LocationPickerMap;
