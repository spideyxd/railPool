import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Clock, Users, Star, Send, Loader } from 'lucide-react';
import { Loader as JSAPILoader } from '@googlemaps/js-api-loader';
import { rideAPI, requestAPI } from '../services/api';

/**
 * RideDetailsModal - Full ride details with map and request functionality
 */
const RideDetailsModal = ({ ride, isOpen, onClose, onRequestSuccess }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');

  // Initialize map when modal opens or ride changes
  useEffect(() => {
    if (isOpen && mapRef.current && ride && ride.destination_lat && ride.destination_lng) {
      // Reset map instance if ride changes
      mapInstanceRef.current = null;
      initializeMap();
    }
  }, [isOpen, ride]);

  // Cleanup when modal closes
  useEffect(() => {
    return () => {
      if (!isOpen) {
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const initializeMap = async () => {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key not found');
        return;
      }

      // Validate coordinates exist
      if (!ride?.destination_lat || !ride?.destination_lng) {
        console.error('Ride coordinates missing:', { lat: ride?.destination_lat, lng: ride?.destination_lng });
        return;
      }

      const loader = new JSAPILoader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['maps', 'places'],
      });

      const google = await loader.load();

      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center: {
          lat: parseFloat(ride.destination_lat),
          lng: parseFloat(ride.destination_lng),
        },
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: getDarkMapStyles(),
      });

      mapInstanceRef.current = mapInstance;

      // Add marker at ride location
      new google.maps.Marker({
        position: {
          lat: parseFloat(ride.destination_lat),
          lng: parseFloat(ride.destination_lng),
        },
        map: mapInstance,
        title: ride.destination_name || 'Ride Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
    } catch (err) {
      console.error('Map initialization failed:', err);
    }
  };

  const handleRequestToJoin = async () => {
    if (!ride || !ride.id) return;

    setRequesting(true);
    setError('');

    try {
      await requestAPI.sendRequest(ride.id);
      setRequested(true);
      
      if (onRequestSuccess) {
        onRequestSuccess();
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    } finally {
      setRequesting(false);
    }
  };

  if (!isOpen || !ride) return null;

  const isOffering = ride.intent_type === 'offering';
  const distanceText = ride.distance ? `${ride.distance.toFixed(1)} km away` : 'Unknown distance';
  const categoryColors = {
    near: 'bg-green-500/10 border-green-500/30 text-green-400',
    medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    far: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  };

  const getDistanceCategory = (distance) => {
    if (distance < 5) return 'near';
    if (distance < 15) return 'medium';
    return 'far';
  };

  const category = getDistanceCategory(ride.distance || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-2xl font-bold gradient-text">Ride Details</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-dark-400" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {/* Map */}
          <div
            ref={mapRef}
            className="w-full h-64 bg-dark-800"
          />

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Station & Address */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-dark-400 font-medium">Station</p>
                  <p className="text-lg font-semibold text-white">{ride.station}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-dark-400 font-medium">Destination</p>
                  <p className="text-base text-dark-100">{ride.destination_name}</p>
                </div>
              </div>
            </div>

            {/* Date, Station & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-dark-800 rounded-lg border border-dark-700">
                <p className="text-xs text-dark-500 font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Arrival Date
                </p>
                <p className="font-medium">
                  {ride.arrival_date ? new Date(ride.arrival_date + 'T00:00:00').toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-dark-800 rounded-lg border border-dark-700">
                <p className="text-xs text-dark-500 font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {isOffering ? 'Seats Available' : 'Seats Needed'}
                </p>
                <p className="font-medium">
                  {isOffering ? ride.seats_available : ride.seats_needed}
                </p>
              </div>
            </div>

            {/* Distance Badge */}
            <div
              className={`px-4 py-3 rounded-lg border flex items-center justify-between ${
                categoryColors[category]
              }`}
            >
              <span className="font-medium">{distanceText}</span>
            </div>

            {/* Creator Info */}
            <div className="p-4 bg-dark-800 rounded-lg border border-dark-700 space-y-3">
              <p className="text-sm text-dark-400 font-medium">Ride Creator</p>
              <div className="flex items-center gap-3">
                {ride.creator?.avatar_url && (
                  <img
                    src={ride.creator.avatar_url}
                    alt={ride.creator.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-500/30"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-white">{ride.creator?.name}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-dark-300">{ride.creator?.rating || 5.0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {requested && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
              >
                ✓ Request sent successfully!
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer - Action Button */}
        <div className="p-6 border-t border-dark-700 bg-dark-950">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRequestToJoin}
            disabled={requesting || requested}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              requested
                ? 'bg-green-500/20 text-green-400 cursor-default'
                : 'btn-primary'
            }`}
          >
            {requesting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Sending Request...
              </>
            ) : requested ? (
              <>
                <Send className="w-5 h-5" />
                Request Sent
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Request to Join
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const getDarkMapStyles = () => [
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#374151' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1f2937' }],
  },
];

export default RideDetailsModal;
