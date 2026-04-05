import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  signup: (email, password, name, phone, gender) =>
    api.post('/auth/signup', { email, password, name, phone, gender }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  googleLogin: (token) =>
    api.post('/auth/google-login', { token }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (name, phone, gender) =>
    api.put('/auth/profile', { name, phone, gender }),
};

// Ride endpoints
export const rideAPI = {
  searchTrain: (pnr, train_number, journey_date, destination_station) =>
    api.post('/ride/search-train', { pnr, train_number, journey_date, destination_station }),
  searchRides: (train_number, station, arrival_date, destination_lat, destination_lng, time_buffer) =>
    api.post('/ride/search', {
      train_number: train_number || null,
      station,
      arrival_date,
      destination_lat: destination_lat || 0,
      destination_lng: destination_lng || 0,
      time_buffer: time_buffer || 3600,
    }),
  createRide: (train_number, train_name, station, arrival_date, destination_name, destination_lat, destination_lng, intent_type, seats_available, seats_needed) =>
    api.post('/ride/create', {
      train_number,
      train_name,
      station,
      arrival_date,
      destination_name,
      destination_lat,
      destination_lng,
      intent_type,
      seats_available,
      seats_needed,
    }),
  searchMatches: (train_number, station, arrival_date, destination_lat, destination_lng, time_buffer) =>
    api.post('/ride/search', {
      train_number: train_number || null,
      station,
      arrival_date,
      destination_lat,
      destination_lng,
      time_buffer,
    }),
  getMyIntents: () => api.get('/ride/my-intents'),
  deactivateIntent: (ride_intent_id) =>
    api.post(`/ride/${ride_intent_id}/deactivate`),
};

// Request endpoints
export const requestAPI = {
  sendRequest: (ride_intent_id) =>
    api.post('/request/send', { ride_intent_id }),
  respondToRequest: (request_id, status) =>
    api.post(`/request/${request_id}/respond`, { status }),
  getMyRequests: (status) =>
    api.get('/request/my-requests', { params: { status } }),
  getRequestDetails: (request_id) =>
    api.get(`/request/${request_id}`),
};

// Chat endpoints
export const chatAPI = {
  getMessages: (request_id, limit = 50) =>
    api.get(`/chat/${request_id}/messages`, { params: { limit } }),
  sendMessage: (request_id, content) =>
    api.post(`/chat/${request_id}/send`, { content }),
  getConversations: () =>
    api.get('/chat/conversations'),
};

export default api;
