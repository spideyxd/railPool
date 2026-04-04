import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideAPI, requestAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [myIntents, setMyIntents] = useState([]);
  const [myRequests, setMyRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
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

  const handleDeactivate = async (id) => {
    try {
      await rideAPI.deactivateIntent(id);
      loadData();
    } catch (err) {
      setError('Failed to deactivate');
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>RailPool</h1>
        <button onClick={() => navigate('/search')} className="btn-primary">
          Search Rides
        </button>
        <button onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }} className="btn-secondary">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            Create Ride
          </button>
          <button
            className={activeTab === 'intents' ? 'active' : ''}
            onClick={() => setActiveTab('intents')}
          >
            My Rides ({myIntents.length})
          </button>
          <button
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({myRequests.sent.length + myRequests.received.length})
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="tab-content">
          {activeTab === 'create' && (
            <CreateRideForm onSuccess={loadData} />
          )}
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
        </div>
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
    seats_available: '',
    seats_needed: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
      setFormData({
        station: '',
        arrival_time: '',
        destination_name: '',
        destination_lat: '',
        destination_lng: '',
        intent_type: 'seeking',
        seats_available: '',
        seats_needed: '',
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <h3>Create Ride Intent</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Station</label>
          <input
            type="text"
            name="station"
            value={formData.station}
            onChange={handleChange}
            required
            placeholder="e.g., Delhi Central"
          />
        </div>
        <div className="form-group">
          <label>Arrival Time</label>
          <input
            type="datetime-local"
            name="arrival_time"
            value={formData.arrival_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Destination Name</label>
          <input
            type="text"
            name="destination_name"
            value={formData.destination_name}
            onChange={handleChange}
            required
            placeholder="e.g., Airport T1"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              name="destination_lat"
              value={formData.destination_lat}
              onChange={handleChange}
              required
              step="0.0001"
              placeholder="28.5562"
            />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              name="destination_lng"
              value={formData.destination_lng}
              onChange={handleChange}
              required
              step="0.0001"
              placeholder="77.1199"
            />
          </div>
        </div>
        <div className="form-group">
          <label>I am...</label>
          <select
            name="intent_type"
            value={formData.intent_type}
            onChange={handleChange}
          >
            <option value="seeking">Seeking a ride (looking for driver)</option>
            <option value="offering">Offering a ride (I'm the driver)</option>
          </select>
        </div>
        {formData.intent_type === 'offering' && (
          <div className="form-group">
            <label>Available Seats</label>
            <input
              type="number"
              name="seats_available"
              value={formData.seats_available}
              onChange={handleChange}
              required
              min="1"
              max="7"
            />
          </div>
        )}
        {formData.intent_type === 'seeking' && (
          <div className="form-group">
            <label>Seats Needed</label>
            <input
              type="number"
              name="seats_needed"
              value={formData.seats_needed}
              onChange={handleChange}
              required
              min="1"
              max="7"
            />
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Ride Intent'}
        </button>
      </form>
    </div>
  );
};

const RideIntentsList = ({ intents, loading, onDeactivate }) => {
  if (loading) return <p>Loading...</p>;
  if (intents.length === 0) return <p className="empty-state">No rides created yet</p>;

  return (
    <div className="list-section">
      <h3>My Ride Intents</h3>
      {intents.map((intent) => (
        <div key={intent.id} className="card">
          <div className="card-header">
            <h4>{intent.destination_name}</h4>
            <span className={`badge ${intent.intent_type}`}>
              {intent.intent_type === 'offering' ? 'Offering' : 'Seeking'}
            </span>
          </div>
          <p><strong>Station:</strong> {intent.station}</p>
          <p><strong>Arrival:</strong> {new Date(intent.arrival_time).toLocaleString()}</p>
          <p>
            <strong>Seats:</strong>{' '}
            {intent.intent_type === 'offering'
              ? `${intent.seats_available} available`
              : `${intent.seats_needed} needed`}
          </p>
          <p><strong>Status:</strong> {intent.is_active ? 'Active' : 'Inactive'}</p>
          {intent.is_active && (
            <button
              onClick={() => onDeactivate(intent.id)}
              className="btn-danger"
            >
              Deactivate
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const RequestsList = ({ requests, loading, onUpdate }) => {
  const [error, setError] = useState('');

  const handleRespond = async (requestId, status) => {
    try {
      await requestAPI.respondToRequest(requestId, status);
      onUpdate();
    } catch (err) {
      setError('Failed to respond');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="list-section">
      {error && <div className="error-message">{error}</div>}
      
      <h3>Received Requests</h3>
      {requests.received.length === 0 ? (
        <p className="empty-state">No received requests</p>
      ) : (
        requests.received.map((req) => (
          <div key={req.id} className="card">
            <p><strong>Status:</strong> {req.status}</p>
            <button
              onClick={() => handleRespond(req.id, 'accepted')}
              className="btn-success"
              disabled={req.status !== 'pending'}
            >
              Accept
            </button>
            <button
              onClick={() => handleRespond(req.id, 'rejected')}
              className="btn-danger"
              disabled={req.status !== 'pending'}
            >
              Reject
            </button>
            {req.status === 'accepted' && (
              <button
                onClick={() => window.location.href = `/chat/${req.id}`}
                className="btn-primary"
              >
                Chat
              </button>
            )}
          </div>
        ))
      )}

      <h3 style={{ marginTop: '20px' }}>Sent Requests</h3>
      {requests.sent.length === 0 ? (
        <p className="empty-state">No sent requests</p>
      ) : (
        requests.sent.map((req) => (
          <div key={req.id} className="card">
            <p><strong>Status:</strong> {req.status}</p>
            {req.status === 'accepted' && (
              <button
                onClick={() => window.location.href = `/chat/${req.id}`}
                className="btn-primary"
              >
                Chat
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
