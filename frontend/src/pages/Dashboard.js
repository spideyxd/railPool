import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, LogOut, Check, X, MessageSquare, MapPin, Clock, Users, AlertCircle, Loader } from 'lucide-react';
import { rideAPI, requestAPI } from '../services/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [myIntents, setMyIntents] = useState([]);
  const [myRequests, setMyRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (activeTab !== 'create') {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'intents') {
        const response = await rideAPI.getMyIntents();
        setMyIntents(response.data.intents);
      } else if (activeTab === 'requests') {
        const response = await requestAPI.getMyRequests();
        setMyRequests({
          sent: response.data.sent_requests,
          received: response.data.received_requests,
        });
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeactivate = async (id) => {
    try {
      await rideAPI.deactivateIntent(id);
      loadData();
    } catch (err) {
      setError('Failed to deactivate');
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navigation Bar */}
      <nav className="glass backdrop-blur-xl border-b border-dark-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">RP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RailPool</h1>
              <p className="text-xs text-dark-400">Welcome, {user.name}</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/search')}
              className="btn-primary gap-2 flex items-center"
            >
              <Search className="w-4 h-4" />
              <span>Search Rides</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="btn-secondary gap-2 flex items-center"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-8 flex-wrap"
        >
          {[
            { id: 'create', label: 'Create Ride', icon: Plus },
            { id: 'intents', label: `My Rides (${myIntents.length})`, icon: MapPin },
            { id: 'requests', label: `Requests (${myRequests.sent.length + myRequests.received.length})`, icon: Users },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'create' && <CreateRideForm onSuccess={loadData} />}
          {activeTab === 'intents' && (
            <RideIntentsList
              intents={myIntents}
              loading={loading}
              onDeactivate={handleDeactivate}
            />
          )}
          {activeTab === 'requests' && (
            <RequestsList
              requests={myRequests}
              loading={loading}
              onUpdate={loadData}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

const CreateRideForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    station: '',
    arrival_time: '',
    destination_name: '',
    destination_lat: '',
    destination_lng: '',
    intent_type: 'seeking',
    seats_available: '4',
    seats_needed: '1',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      await rideAPI.createRide(
        formData.station,
        formData.arrival_time,
        formData.destination_name,
        formData.destination_lat,
        formData.destination_lng,
        formData.intent_type,
        formData.intent_type === 'offering' ? formData.seats_available : null,
        formData.intent_type === 'seeking' ? formData.seats_needed : null
      );
      setSuccess(true);
      setFormData({
        station: '',
        arrival_time: '',
        destination_name: '',
        destination_lat: '',
        destination_lng: '',
        intent_type: 'seeking',
        seats_available: '4',
        seats_needed: '1',
      });
      setTimeout(() => setSuccess(false), 3000);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid md:grid-cols-2 gap-8"
    >
      {/* Form */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Create Ride Intent</h2>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm"
          >
            Ride created successfully!
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Intent Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">I am...</label>
            <select
              name="intent_type"
              value={formData.intent_type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="seeking">Seeking a ride (looking for driver)</option>
              <option value="offering">Offering a ride (I'm the driver)</option>
            </select>
          </div>

          {/* Station */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Station</label>
            <input
              type="text"
              name="station"
              value={formData.station}
              onChange={handleChange}
              required
              placeholder="e.g., Delhi Central"
              className="input-field"
            />
          </div>

          {/* Arrival Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Arrival Time</label>
            <input
              type="datetime-local"
              name="arrival_time"
              value={formData.arrival_time}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Destination Name</label>
            <input
              type="text"
              name="destination_name"
              value={formData.destination_name}
              onChange={handleChange}
              required
              placeholder="e.g., Airport T1"
              className="input-field"
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Latitude</label>
              <input
                type="number"
                name="destination_lat"
                value={formData.destination_lat}
                onChange={handleChange}
                required
                step="0.0001"
                placeholder="28.5562"
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Longitude</label>
              <input
                type="number"
                name="destination_lng"
                value={formData.destination_lng}
                onChange={handleChange}
                required
                step="0.0001"
                placeholder="77.1199"
                className="input-field"
              />
            </div>
          </div>

          {/* Seats */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {formData.intent_type === 'offering' ? 'Available Seats' : 'Seats Needed'}
            </label>
            <input
              type="number"
              name={formData.intent_type === 'offering' ? 'seats_available' : 'seats_needed'}
              value={formData.intent_type === 'offering' ? formData.seats_available : formData.seats_needed}
              onChange={handleChange}
              required
              min="1"
              max="7"
              className="input-field"
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 group mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Create Ride Intent
              </span>
            )}
          </motion.button>
        </form>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">🚆 Getting Started</h3>
          <ul className="space-y-3 text-sm text-dark-300">
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
              <span>Fill in your train station and arrival time</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
              <span>Enter your destination details with coordinates</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
              <span>Specify if you're offering or seeking a ride</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
              <span>Wait for matches or browse all intents</span>
            </li>
          </ul>
        </div>

        <div className="card border-primary-500/30 bg-primary-500/5">
          <p className="text-sm text-dark-300">
            <strong className="text-primary-400">💡 Tip:</strong> Use accurate coordinates to get better matches with other riders.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const RideIntentsList = ({ intents, loading, onDeactivate }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (intents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card text-center py-12"
      >
        <MapPin className="w-12 h-12 mx-auto text-dark-600 mb-4" />
        <p className="text-dark-400">No rides created yet. Create one to get started!</p>
      </motion.div>
    );
  }

  return (
    <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {intents.map((intent, idx) => (
        <motion.div
          key={intent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="card-hover group"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{intent.destination_name}</h3>
              <p className="text-sm text-dark-400">{intent.station}</p>
            </div>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                intent.intent_type === 'offering'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {intent.intent_type === 'offering' ? '🚖 Offering' : '🔍 Seeking'}
            </motion.span>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm text-dark-300">
              <Clock className="w-4 h-4 text-primary-400" />
              <span>{new Date(intent.arrival_time).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-dark-300">
              <Users className="w-4 h-4 text-primary-400" />
              <span>
                {intent.intent_type === 'offering'
                  ? `${intent.seats_available} seats available`
                  : `${intent.seats_needed} seats needed`}
              </span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              intent.is_active
                ? 'bg-green-500/20 text-green-400'
                : 'bg-dark-700 text-dark-400'
            }`}>
              {intent.is_active ? '● Active' : '● Inactive'}
            </div>
          </div>

          {/* Action */}
          {intent.is_active && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDeactivate(intent.id)}
              className="w-full py-2 px-4 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-sm font-medium"
            >
              Deactivate
            </motion.button>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

const RequestsList = ({ requests, loading, onUpdate }) => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRespond = async (requestId, status) => {
    try {
      await requestAPI.respondToRequest(requestId, status);
      onUpdate();
    } catch (err) {
      setError('Failed to respond');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Received Requests */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Received Requests</h2>
        {error && (
          <motion.div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </motion.div>
        )}
        {requests.received.length === 0 ? (
          <motion.div className="card text-center py-12">
            <Users className="w-12 h-12 mx-auto text-dark-600 mb-4" />
            <p className="text-dark-400">No received requests yet</p>
          </motion.div>
        ) : (
          <motion.div className="grid md:grid-cols-2 gap-6">
            {requests.received.map((req, idx) => (
              <RequestCard
                key={req.id}
                request={req}
                idx={idx}
                onRespond={handleRespond}
                onChat={() => navigate(`/chat/${req.id}`)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Sent Requests */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Sent Requests</h2>
        {requests.sent.length === 0 ? (
          <motion.div className="card text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-dark-600 mb-4" />
            <p className="text-dark-400">No sent requests yet</p>
          </motion.div>
        ) : (
          <motion.div className="grid md:grid-cols-2 gap-6">
            {requests.sent.map((req, idx) => (
              <RequestCard
                key={req.id}
                request={req}
                idx={idx}
                isSent
                onChat={() => navigate(`/chat/${req.id}`)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const RequestCard = ({ request, idx, isSent, onRespond, onChat }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="card-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          request.status === 'pending'
            ? 'bg-yellow-500/20 text-yellow-400'
            : request.status === 'accepted'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      <div className="space-y-4">
        {!isSent && request.status === 'pending' && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRespond(request.id, 'accepted')}
              className="flex-1 py-2 px-3 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Accept
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRespond(request.id, 'rejected')}
              className="flex-1 py-2 px-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Reject
            </motion.button>
          </div>
        )}

        {request.status === 'accepted' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onChat}
            className="w-full py-2 px-4 btn-primary flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Continue Chatting
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
