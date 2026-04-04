import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideAPI } from '../services/api';
import '../styles/Search.css';

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

  return (
    <div className="search-container">
      <nav className="navbar">
        <h1>RailPool</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Dashboard
        </button>
      </nav>

      <div className="search-content">
        <div className="search-card">
          <h2>Find Riders to Share Your Journey</h2>

          <div className="search-type-tabs">
            <button
              className={searchType === 'train' ? 'active' : ''}
              onClick={() => setSearchType('train')}
            >
              Search by Train
            </button>
            <button
              className={searchType === 'manual' ? 'active' : ''}
              onClick={() => setSearchType('manual')}
            >
              Manual Search
            </button>
          </div>

          <form onSubmit={handleSearchTrain}>
            {searchType === 'train' ? (
              <>
                <div className="form-group">
                  <label>PNR Number</label>
                  <input
                    type="text"
                    name="pnr"
                    value={formData.pnr}
                    onChange={handleChange}
                    placeholder="Enter PNR (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>OR Train Number</label>
                  <input
                    type="text"
                    name="train_number"
                    value={formData.train_number}
                    onChange={handleChange}
                    placeholder="Enter Train Number (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Journey Date</label>
                  <input
                    type="date"
                    name="journey_date"
                    value={formData.journey_date}
                    onChange={handleChange}
                  />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label>Destination Station</label>
                <input
                  type="text"
                  name="destination_station"
                  value={formData.destination_station}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Delhi Central, Bangalore City"
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Searching...' : 'Search Trains'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {searched && !loading && (
            <div className="search-results">
              {rides.length === 0 ? (
                <p className="empty-state">No trains found. Try different parameters.</p>
              ) : (
                <>
                  <h3>Found {rides.length} trains</h3>
                  {rides.map((train, index) => (
                    <div key={index} className="train-card">
                      <h4>{train.train_name}</h4>
                      <p><strong>Number:</strong> {train.train_number}</p>
                      <p><strong>From:</strong> {train.source}</p>
                      <p><strong>To:</strong> {train.destination}</p>
                      <p>
                        <strong>Arrival:</strong>{' '}
                        {new Date(train.arrival_time).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleSelectTrain(train)}
                        className="btn-primary"
                      >
                        Find Matches
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
