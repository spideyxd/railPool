export const PREDEFINED_DESTINATIONS = [
  { name: 'Airport T1', lat: 28.5562, lng: 77.1199 },
  { name: 'Connaught Place', lat: 28.6292, lng: 77.1896 },
  { name: 'Sector 62 Noida', lat: 28.5862, lng: 77.3912 },
  { name: 'Gurgaon Mall', lat: 28.4595, lng: 77.0266 },
  { name: 'Airport T2', lat: 28.5520, lng: 77.1167 },
];

// Haversine formula to calculate distance
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format date and time
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get time remaining
export const getTimeRemaining = (dateString) => {
  const now = new Date();
  const arrival = new Date(dateString);
  const diff = arrival - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
};
