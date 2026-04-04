import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Navigation, Phone, Star, Loader, ArrowRight, ChevronLeft, AlertCircle, Users } from 'lucide-react';
import { rideAPI, requestAPI } from '../services/api';
import { formatDateTime, calculateDistance } from '../utils/helpers';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [destination, setDestination] = useState({
    name: '',
    lat: '',
    lng: '',
  });
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (location.state?.station) {
      setDestination((prev) => ({
        ...prev,
        name: location.state.station,
      }));
    }
  }, [location]);

  const handleSearch = async () => {
    if (!destination.name || !destination.lat || !destination.lng) {
      setError('Please fill in all destination details');
      return;
    }

    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const arrivalTime = location.state?.arrival_time || new Date().toISOString();
      const response = await rideAPI.searchMatches(
        location.state?.station || 'Delhi Central',
        arrivalTime,
        parseFloat(destination.lat),
        parseFloat(destination.lng),
        3600
      );
      setMatches(response.data.matches);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (rideIntentId) => {
    try {
      const match = matches.find((m) => m.ride_intent.id === rideIntentId);
      const receiverId = match.ride_intent.user_id;

      await requestAPI.sendRequest(receiverId, rideIntentId);
      setMatches(matches.filter((m) => m.ride_intent.id !== rideIntentId));
      alert('Request sent successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navigation */}
      <nav className="glass backdrop-blur-xl border-b border-dark-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
            whileHover={{ x: -5 }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </motion.button>
          <h1 className="text-xl font-bold gradient-text">Find Matches</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary px-3 py-1.5 text-sm"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid lg:grid-cols-4 gap-8"
        >
          {/* Search Filter Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 card">
              <h3 className="text-lg font-semibold mb-6">Destination Details</h3>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Destination Name</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-dark-500 pointer-events-none" />
                    <input
                      type="text"
                      value={destination.name}
                      onChange={(e) =>
                        setDestination((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g., Airport T1"
                      className="input-field pl-10 h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-dark-400">Latitude</label>
                    <input
                      type="number"
                      value={destination.lat}
                      onChange={(e) =>
                        setDestination((prev) => ({ ...prev, lat: e.target.value }))
                      }
                      step="0.0001"
                      placeholder="28.5562"
                      className="input-field text-sm h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-dark-400">Longitude</label>
                    <input
                      type="number"
                      value={destination.lng}
                      onChange={(e) =>
                        setDestination((prev) => ({ ...prev, lng: e.target.value }))
                      }
                      step="0.0001"
                      placeholder="77.1199"
                      className="input-field text-sm h-10"
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full btn-primary py-2.5 group mt-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Searching...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Navigation className="w-4 h-4" />
                      <span className="text-sm">Find Matches</span>
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Matches Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
            transition={{ delay: 0.1 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {searched ? `Matching Riders (${matches.length})` : 'Ready to Search'}
              </h2>
              <p className="text-dark-400">
                {searched
                  ? 'Select a rider and send a pool request to start your journey together'
                  : 'Fill in your destination details and search to find riders'}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : !searched ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-16"
              >
                <Users className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                <p className="text-dark-400">Search for matches using the filter panel on the left</p>
              </motion.div>
            ) : matches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-16"
              >
                <Users className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                <p className="text-dark-400">No matches found. Try adjusting your criteria.</p>
              </motion.div>
            ) : (
              <motion.div className="grid gap-6">
                {matches.map((match, idx) => (
                  <MatchCard
                    key={match.ride_intent.id}
                    match={match}
                    idx={idx}
                    onSendRequest={handleSendRequest}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const MatchCard = ({ match, idx, onSendRequest }) => {
  const ride = match.ride_intent;
  const user = match.user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="card-hover"
    >
      <div className="grid sm:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="sm:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{user.name}</h4>
              <div className="flex items-center gap-1 text-sm text-primary-400">
                <Star className="w-3.5 h-3.5 fill-primary-400" />
                <span>{user.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <Phone className="w-4 h-4" />
              <a
                href={`tel:${user.phone}`}
                className="hover:text-primary-400 transition-colors"
              >
                {user.phone}
              </a>
            </div>
          )}
        </div>

        {/* Ride Details */}
        <div className="sm:col-span-1 space-y-3">
          <div>
            <p className="text-xs text-dark-500 mb-1">Destination</p>
            <p className="flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-primary-400" />
              {ride.destination_name}
            </p>
          </div>

          <div>
            <p className="text-xs text-dark-500 mb-1">Arrival Time</p>
            <p className="flex items-center gap-2 text-sm text-dark-300">
              <Calendar className="w-4 h-4 text-primary-400" />
              {formatDateTime(ride.arrival_time)}
            </p>
          </div>

          <div className="flex gap-3">
            <div>
              <p className="text-xs text-dark-500 mb-1">Distance</p>
              <p className="font-semibold text-primary-400">{match.distance.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-xs text-dark-500 mb-1">Match Score</p>
              <p className="font-semibold text-accent-400">{match.match_score.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Seats & Action */}
        <div className="sm:col-span-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-dark-500 mb-1">
              {ride.intent_type === 'offering' ? 'Available Seats' : 'Seats Needed'}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-400" />
              <span className="text-2xl font-bold">
                {ride.intent_type === 'offering'
                  ? ride.seats_available
                  : ride.seats_needed}
              </span>
            </div>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                ride.intent_type === 'offering'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {ride.intent_type === 'offering' ? '🚖 Offering' : '🔍 Seeking'}
            </motion.span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSendRequest(ride.id)}
            className="w-full btn-primary group flex items-center justify-center gap-2 py-2.5"
          >
            Send Request
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Results;
