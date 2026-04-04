import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, Loader, ArrowRight, ChevronLeft, Navigation, Users, Clock, TrendingUp } from 'lucide-react';
import { rideAPI } from '../services/api';
import StationAutocomplete from '../components/StationAutocomplete';
import LocationPickerMap from '../components/LocationPickerMap';
import { getDistanceCategory, formatDistance } from '../utils/distance';

const Search = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [arrivalTime, setArrivalTime] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setError('');
  };

  const handleLocationSelect = (locationData) => {
    setUserLocation(locationData);
    setError('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedStation) {
      setError('Please select a station');
      return;
    }

    if (!arrivalTime) {
      setError('Please select your arrival date and time');
      return;
    }

    if (!userLocation) {
      setError('Please select your location on the map');
      return;
    }

    setError('');
    setLoading(true);
    setSearched(true);

    try {
      // Search rides by station with user-selected arrival time
      const response = await rideAPI.searchRides(
        selectedStation.name,
        arrivalTime,
        userLocation.lat,
        userLocation.lng,
        3600 // 1 hour time buffer
      );

      // Backend returns { matches: [...], count: N }
      // Each match has: { ride_intent, user, distance, match_score }
      let matchedRides = response.data.matches || [];

      // Transform to ride object for display
      matchedRides = matchedRides.map(match => ({
        ...match.ride_intent,
        distance: match.distance,
        match_score: match.match_score,
        creator: match.user,
      }));

      // Sort by distance (already calculated by backend, but ensure sorting)
      matchedRides = matchedRides.sort((a, b) => (a.distance || 999) - (b.distance || 999));

      setRides(matchedRides);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search rides');
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navigation */}
      <nav className="glass backdrop-blur-xl border-b border-dark-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
            whileHover={{ x: -5 }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </motion.button>
          <h1 className="text-xl font-bold gradient-text">RailPool Search</h1>
          <div className="w-20" />
        </div>
      </nav>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Main Card */}
        <motion.div variants={itemVariants} className="card max-w-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Find People on Your Route</h2>
            <p className="text-dark-400">Select your station and destination to find nearby riders</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Station Selection */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary-500" />
                Select Your Station
              </label>
              <StationAutocomplete
                value={selectedStation?.code || ''}
                onChange={handleStationSelect}
                placeholder="Search by station name or code..."
              />
              {selectedStation && (
                <p className="text-xs text-dark-400">
                  ✓ Station selected: {selectedStation.name} ({selectedStation.code})
                </p>
              )}
            </motion.div>

            {/* Arrival Time */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                When Do You Want to Travel?
              </label>
              <input
                type="datetime-local"
                value={arrivalTime}
                onChange={(e) => {
                  setArrivalTime(e.target.value);
                  setError('');
                }}
                required
                className="input-field"
              />
              {arrivalTime && (
                <p className="text-xs text-dark-400">
                  ✓ Arrival time selected: {new Date(arrivalTime).toLocaleString()}
                </p>
              )}
            </motion.div>

            {/* Location Picker */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                Select Your Location
              </label>
              <LocationPickerMap
                onLocationSelect={handleLocationSelect}
                initialLocation={{
                  lat: userLocation?.lat || 28.6139,
                  lng: userLocation?.lng || 77.209,
                  address: userLocation?.address || '',
                }}
                searchPlaceholder="Search for your pickup location..."
              />
              {userLocation && (
                <p className="text-xs text-dark-400">
                  ✓ Location selected: {userLocation.address}
                </p>
              )}
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2"
              >
                <span>⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading || !selectedStation || !arrivalTime || !userLocation}
              className={`w-full py-3 group rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                loading || !selectedStation || !arrivalTime || !userLocation
                  ? 'btn-secondary opacity-50 cursor-not-allowed'
                  : 'btn-primary'
              }`}
              whileHover={selectedStation && arrivalTime && userLocation ? { scale: 1.02 } : {}}
              whileTap={selectedStation && arrivalTime && userLocation ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Searching for matches...
                </>
              ) : (
                <>
                  <SearchIcon className="w-5 h-5" />
                  Search Riders
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results Section */}
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : rides.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-12"
              >
                <Users className="w-12 h-12 mx-auto text-dark-600 mb-4" />
                <p className="text-dark-400 mb-2">No riders found for this route</p>
                <p className="text-dark-500 text-sm">Try adjusting your location or station</p>
              </motion.div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Found {rides.length} Riders</h3>
                  <div className="flex items-center gap-2 text-primary-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Sorted by distance
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {rides.map((ride, index) => (
                    <RideCard
                      key={ride.id || index}
                      ride={ride}
                      index={index}
                    />
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Info Card */}
        {!searched && (
          <motion.div
            variants={itemVariants}
            className="mt-12 card border-primary-500/30 bg-primary-500/5"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              How It Works
            </h3>
            <ol className="space-y-3 text-sm text-dark-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold">1</span>
                <span>Select your train station</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold">2</span>
                <span>Select your preferred arrival date and time</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold">3</span>
                <span>Mark your pickup location on the map</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold">4</span>
                <span>Get matched with nearby riders instantly</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold">5</span>
                <span>Results are sorted by distance (nearest first)</span>
              </li>
            </ol>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const RideCard = ({ ride, index }) => {
  const distanceCategory = getDistanceCategory(ride.distance || 0);
  const categoryColors = {
    near: 'bg-green-500/10 border-green-500/30 text-green-400',
    medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    far: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card group hover:border-primary-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white mb-1">
            {ride.intent_type === 'offering' ? '🚗 Offering a Ride' : '🔍 Looking for Ride'}
          </h4>
          <p className="text-sm text-dark-400">{ride.station}</p>
        </div>
        <div className={`px-3 py-1 rounded-lg border text-xs font-medium ${categoryColors[distanceCategory]}`}>
          {formatDistance(ride.distance)}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-dark-500 text-xs">Destination</p>
            <p className="text-dark-200">{ride.destination_name || 'Location'}</p>
          </div>
        </div>

        {/* Arrival Time */}
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-dark-500 text-xs">Arrival Time</p>
            <p className="text-dark-200">
              {new Date(ride.arrival_time).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Seats */}
        <div className="flex items-start gap-3">
          <Users className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-dark-500 text-xs">
              {ride.intent_type === 'offering' ? 'Available Seats' : 'Seats Needed'}
            </p>
            <p className="text-dark-200">
              {ride.intent_type === 'offering' ? ride.seats_available : ride.seats_needed} 
              {' '}
              {ride.intent_type === 'offering' ? 'seats' : 'seats needed'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        className="w-full mt-4 btn-primary py-2 text-sm group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        View Details
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform inline" />
      </motion.button>
    </motion.div>
  );
};

export default Search;
