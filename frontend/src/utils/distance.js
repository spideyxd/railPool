/**
 * Distance Calculation Utilities
 * Uses Haversine formula to calculate distance between two coordinates
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert to radians
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
const toRad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Calculate distance from user location to multiple ride locations
 * @param {object} userLocation - { lat: number, lng: number }
 * @param {array} rides - Array of rides with lat/lng
 * @returns {array} Rides with distance property added
 */
export const calculateDistancesToRides = (userLocation, rides) => {
  if (!userLocation || !userLocation.lat || !userLocation.lng) {
    return rides;
  }

  return rides.map((ride) => ({
    ...ride,
    distance: calculateHaversineDistance(
      userLocation.lat,
      userLocation.lng,
      ride.destination_lat,
      ride.destination_lng
    ),
  }));
};

/**
 * Sort rides by distance (nearest first)
 * @param {array} rides - Array of rides with distance property
 * @returns {array} Sorted rides
 */
export const sortByDistance = (rides) => {
  return [...rides].sort((a, b) => (a.distance || 999) - (b.distance || 999));
};

/**
 * Filter rides by station and calculate distances
 * @param {array} rides - Array of all rides
 * @param {string} stationCode - Station code to filter by
 * @param {object} userLocation - User's location { lat, lng }
 * @returns {array} Filtered and sorted rides with distances
 */
export const filterAndSortRides = (rides, stationCode, userLocation) => {
  if (!rides || rides.length === 0) {
    return [];
  }

  // Filter by station
  const filtered = rides.filter(
    (ride) => ride.station === stationCode || ride.station_code === stationCode
  );

  // Calculate distances
  const withDistances = calculateDistancesToRides(userLocation, filtered);

  // Sort by distance
  return sortByDistance(withDistances);
};

/**
 * Format distance for display
 * @param {number} distance - Distance in km
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (!distance) return 'Distance unknown';
  if (distance < 1) return `${Math.round(distance * 1000)}m`;
  return `${distance}km`;
};

/**
 * Get distance category for styling/filtering
 * @param {number} distance - Distance in km
 * @returns {string} Category: near, medium, far
 */
export const getDistanceCategory = (distance) => {
  if (distance < 2) return 'near';
  if (distance < 5) return 'medium';
  return 'far';
};

export default {
  calculateHaversineDistance,
  calculateDistancesToRides,
  sortByDistance,
  filterAndSortRides,
  formatDistance,
  getDistanceCategory,
};
