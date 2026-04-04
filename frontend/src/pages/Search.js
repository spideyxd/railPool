import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Train, MapPin, Calendar, Loader, ArrowRight, ChevronLeft } from 'lucide-react';
import { rideAPI } from '../services/api';
import SpotlightCard from '../components/SpotlightCard';
import ShinyText from '../components/ShinyText';

const Search = () => {
  const [searchType, setSearchType] = useState('manual');
  const [formData, setFormData] = useState({
    pnr: '',
    train_number: '',
    journey_date: '',
    destination_station: '',
  });
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchTrain = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const response = await rideAPI.searchTrain(
        formData.pnr,
        formData.train_number,
        formData.journey_date,
        formData.destination_station
      );
      setRides(response.data.trains);
    } catch (err) {
      setError('Failed to search trains');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrain = (train) => {
    navigate('/results', {
      state: {
        station: train.destination,
        arrival_time: train.arrival_time,
      },
    });
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
    <div className="min-h-screen">
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
          <ShinyText text="RailPool Search" className="text-xl font-bold" />
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
        <SpotlightCard className="max-w-2xl mx-auto p-8 border-none">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Find Riders to Share Your Journey</h2>
            <p className="text-dark-400">Search for trains and find people heading your direction</p>
          </div>

          {/* Type Selection Tabs */}
          <motion.div
            variants={itemVariants}
            className="flex gap-3 mb-8 p-1 bg-gray-100 dark:bg-dark-800/50 rounded-lg w-fit"
          >
            {[
              { value: 'train', label: 'Search by Train', icon: Train },
              { value: 'manual', label: 'Manual Search', icon: MapPin },
            ].map((tab) => (
              <motion.button
                key={tab.value}
                onClick={() => setSearchType(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  searchType === tab.value
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'text-gray-500 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSearchTrain} className="space-y-5">
            {searchType === 'train' ? (
              <>
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-medium">PNR Number (Optional)</label>
                  <input
                    type="text"
                    name="pnr"
                    value={formData.pnr}
                    onChange={handleChange}
                    placeholder="e.g., 1234567890"
                    className="input-field"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-medium">OR Train Number (Optional)</label>
                  <input
                    type="text"
                    name="train_number"
                    value={formData.train_number}
                    onChange={handleChange}
                    placeholder="e.g., 12345"
                    className="input-field"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-medium">Journey Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3 w-5 h-5 text-dark-500 pointer-events-none" />
                    <input
                      type="date"
                      name="journey_date"
                      value={formData.journey_date}
                      onChange={handleChange}
                      className="input-field pl-12"
                    />
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium">Destination Station</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 w-5 h-5 text-dark-500 pointer-events-none" />
                  <input
                    type="text"
                    name="destination_station"
                    value={formData.destination_station}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Delhi Central, Bangalore City"
                    className="input-field pl-12"
                  />
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 group mt-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Searching...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <SearchIcon className="w-5 h-5" />
                  Search Trains
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </motion.button>
          </form>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </SpotlightCard>

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
                <Train className="w-12 h-12 mx-auto text-dark-600 mb-4" />
                <p className="text-dark-400">No trains found. Try different search parameters.</p>
              </motion.div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold mb-6">Found {rides.length} Trains</h3>
                <motion.div className="grid md:grid-cols-2 gap-6">
                  {rides.map((train, index) => (
                    <TrainCard
                      key={index}
                      train={train}
                      idx={index}
                      onSelect={handleSelectTrain}
                    />
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const TrainCard = ({ train, idx, onSelect }) => {
  return (
    <SpotlightCard index={idx} className="group p-6">
      <div className="mb-4">
        <h4 className="text-lg font-semibold">{train.train_name}</h4>
        <p className="text-sm text-dark-400">Train #{train.train_number}</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-dark-300">
          <MapPin className="w-4 h-4 text-primary-400" />
          <span>{train.source} → {train.destination}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-dark-300">
          <Calendar className="w-4 h-4 text-primary-400" />
          <span>{new Date(train.arrival_time).toLocaleString()}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(train)}
        className="w-full btn-primary group/btn flex items-center justify-center gap-2"
      >
        Find Matches
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </motion.button>
    </SpotlightCard>
  );
};

export default Search;
