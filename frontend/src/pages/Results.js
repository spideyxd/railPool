import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { rideAPI, requestAPI } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import '../styles/Results.css';

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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);

    // Get destination from form if available
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

    try {
      const arrivalTime =
        location.state?.arrival_time || new Date().toISOString();
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
      alert('Request sent successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    }
  };

  return (
    <div className="results-container">
      <nav className="navbar">
        <h1>RailPool</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Dashboard
        </button>
      </nav>

      <div className="results-content">
        <div className="search-filters">
          <h3>Destination Details</h3>
          {error && <div className="error-message">{error}</div>}
          <div className="filter-form">
            <div className="form-group">
              <label>Destination Name</label>
              <input
                type="text"
                value={destination.name}
                onChange={(e) =>
                  setDestination((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Airport T1"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  value={destination.lat}
                  onChange={(e) =>
                    setDestination((prev) => ({ ...prev, lat: e.target.value }))
                  }
                  step="0.0001"
                  placeholder="28.5562"
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  value={destination.lng}
                  onChange={(e) =>
                    setDestination((prev) => ({ ...prev, lng: e.target.value }))
                  }
                  step="0.0001"
                  placeholder="77.1199"
                />
              </div>
            </div>
            <button onClick={handleSearch} disabled={loading} className="btn-primary">
              {loading ? 'Searching...' : 'Find Matches'}
            </button>
          </div>
        </div>

        <div className="matches-section">
          <h3>Matching Riders ({matches.length})</h3>
          {matches.length === 0 && !loading ? (
            <p className="empty-state">No matches found. Try searching first or adjust your criteria.</p>
          ) : (
            <div className="matches-list">
              {matches.map((match) => (
                <div key={match.ride_intent.id} className="match-card">
                  <div className="match-header">
                    <h4>{match.user.name}</h4>
                    <div className="rating">⭐ {match.user.rating}</div>
                  </div>

                  <div className="match-details">
                    <p>
                      <strong>Destination:</strong> {match.ride_intent.destination_name}
                    </p>
                    <p>
                      <strong>Arrival:</strong>{' '}
                      {formatDateTime(match.ride_intent.arrival_time)}
                    </p>
                    <p>
                      <strong>Distance:</strong> {match.distance} km
                    </p>
                    <p>
                      <strong>Match Score:</strong>{' '}
                      <span className="score">{match.match_score}%</span>
                    </p>
                    <p>
                      <strong>
                        {match.ride_intent.intent_type === 'offering'
                          ? 'Available Seats'
                          : 'Seats Needed'}
                        :
                      </strong>{' '}
                      {match.ride_intent.intent_type === 'offering'
                        ? match.ride_intent.seats_available
                        : match.ride_intent.seats_needed}
                    </p>
                    <p>
                      <strong>Phone:</strong> {match.user.phone || 'Not provided'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSendRequest(match.ride_intent.id)}
                    className="btn-primary"
                  >
                    Send Pool Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
