import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, AlertCircle, MapPin } from 'lucide-react';
import { Loader as JSAPILoader } from '@googlemaps/js-api-loader';

/**
 * LocationDisplay Component
 * Read-only map display for showing selected or multiple locations
 * Use this for viewing pickup/dropoff locations without editing
 */
const LocationDisplay = ({
  locations = [], // Array of {lat, lng, title, color, label}
  center = { lat: 28.6139, lng: 77.209 },
  zoom = 13,
  height = '300px',
  showInfoWindows = true,
  markerAnimations = true,
  className = '',
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
          libraries: ['maps'],
        });

        const google = await loader.load();

        const mapInstance = new google.maps.Map(mapRef.current, {
          zoom: zoom,
          center: center,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: getMapStyles(),
        });

        mapInstanceRef.current = mapInstance;

        // Add markers for all locations
        if (locations.length > 0) {
          locations.forEach((location, index) => {
            addMarker(location, index, google);
          });

          // Auto-fit bounds if multiple locations
          if (locations.length > 1) {
            fitBounds(locations, google);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Map initialization failed:', err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    if (mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, []);

  const addMarker = (location, index, google) => {
    if (!mapInstanceRef.current) return;

    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: mapInstanceRef.current,
      title: location.title || `Location ${index + 1}`,
      label: location.label || String(index + 1),
      animation: markerAnimations ? google.maps.Animation.DROP : undefined,
      icon: location.color
        ? {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: location.color,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          }
        : undefined,
    });

    markersRef.current.push(marker);

    // Add info window if enabled
    if (showInfoWindows && location.title) {
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #1f2937; padding: 8px; font-size: 12px; max-width: 200px;">
            <strong>${location.title}</strong>
            <br/>
            <span style="color: #6b7280;">${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</span>
          </div>
        `,
      });

      marker.addListener('click', () => {
        // Close other info windows
        infoWindowsRef.current.forEach((iw) => iw.close());
        infoWindow.open(mapInstanceRef.current, marker);
      });

      infoWindowsRef.current.push(infoWindow);
    }
  };

  const fitBounds = (locationsArray, google) => {
    const bounds = new google.maps.LatLngBounds();
    locationsArray.forEach((loc) => {
      bounds.extend(new google.maps.LatLng(loc.lat, loc.lng));
    });
    mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-dark-700 ${className}`}>
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full bg-dark-800"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-950/40 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-6 h-6 animate-spin text-primary-500" />
            <p className="text-dark-300 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3 items-center max-w-xs">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Locations List - Bottom Left */}
      {locations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-4 left-4 bg-dark-900/95 backdrop-blur-md p-3 rounded-lg border border-dark-700 shadow-lg max-w-xs"
        >
          <div className="space-y-2">
            {locations.map((loc, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <MapPin
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: loc.color || '#0ea5e9' }}
                />
                <div>
                  <p className="font-medium text-dark-100">{loc.title || `Location ${idx + 1}`}</p>
                  <p className="text-xs text-dark-500 font-mono">
                    {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Dark theme map styles
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

export default LocationDisplay;
