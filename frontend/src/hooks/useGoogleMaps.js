import { useCallback, useRef, useState } from 'react';
import { Loader as JSAPILoader } from '@googlemaps/js-api-loader';

/**
 * useGoogleMaps Hook
 * Utility hook for loading Google Maps API and performing common operations
 */
export const useGoogleMaps = () => {
  const googleRef = useRef(null);
  const geocoderRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load Google Maps API
  const loadMapsAPI = useCallback(async () => {
    if (googleRef.current) return googleRef.current; // Already loaded

    try {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Google Maps API key not configured');
        return null;
      }

      const loader = new JSAPILoader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['maps', 'places', 'geocoding'],
      });

      const google = await loader.load();
      googleRef.current = google;
      geocoderRef.current = new google.maps.Geocoder();
      setIsLoaded(true);
      setError(null);

      return google;
    } catch (err) {
      console.error('Failed to load Google Maps:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        if (!geocoderRef.current) {
          await loadMapsAPI();
        }

        const result = await geocoderRef.current.geocode({
          location: new googleRef.current.maps.LatLng(lat, lng),
        });

        return result[0]?.formatted_address || 'Address not found';
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
        throw new Error('Failed to get address');
      }
    },
    [loadMapsAPI]
  );

  // Forward geocode address to coordinates
  const forwardGeocode = useCallback(
    async (address) => {
      try {
        if (!geocoderRef.current) {
          await loadMapsAPI();
        }

        const result = await geocoderRef.current.geocode({
          address: address,
          componentRestrictions: { country: 'in' }, // Change if needed
        });

        if (result.length === 0) {
          throw new Error('Location not found');
        }

        const location = result[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng(),
          address: result[0].formatted_address,
          placeId: result[0].place_id,
        };
      } catch (err) {
        console.error('Forward geocoding failed:', err);
        throw err;
      }
    },
    [loadMapsAPI]
  );

  // Calculate distance between two coordinates
  const calculateDistance = useCallback(
    (lat1, lng1, lat2, lng2) => {
      // Haversine formula for distance calculation
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    },
    []
  );

  // Get bounds for multiple coordinates
  const getBounds = useCallback(
    (coordinates) => {
      if (!googleRef.current) return null;

      const bounds = new googleRef.current.maps.LatLngBounds();
      coordinates.forEach((coord) => {
        bounds.extend(new googleRef.current.maps.LatLng(coord.lat, coord.lng));
      });
      return bounds;
    },
    []
  );

  // Check if a point is within bounds
  const isPointInBounds = useCallback((point, bounds) => {
    return bounds.contains(new googleRef.current.maps.LatLng(point.lat, point.lng));
  }, []);

  return {
    // State
    isLoaded,
    error,

    // Methods
    loadMapsAPI,
    reverseGeocode,
    forwardGeocode,
    calculateDistance,
    getBounds,
    isPointInBounds,

    // Raw references (for advanced usage)
    google: googleRef.current,
    geocoder: geocoderRef.current,
  };
};

/**
 * Utility function to format coordinates as string
 */
export const formatCoordinates = (lat, lng, precision = 4) => {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

/**
 * Utility function to parse coordinates from string
 */
export const parseCoordinates = (coordString) => {
  const [lat, lng] = coordString.split(',').map((coord) => parseFloat(coord.trim()));
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid coordinate format');
  }
  return { lat, lng };
};

/**
 * Utility function to validate coordinates
 */
export const isValidCoordinate = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Create a marker icon with custom styling
 */
export const createMarkerIcon = (color = '#0ea5e9', scale = 12) => {
  // Returns SVG-based custom marker
  const svgMarker = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svgMarker)}`;
};

export default useGoogleMaps;
