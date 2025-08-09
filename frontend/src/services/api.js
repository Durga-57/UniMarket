import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({ error: 'No response from server' });
    } else {
      // Something happened in setting up the request
      return Promise.reject({ error: 'Request error' });
    }
  }
);

// Auth API
export const authApi = {
  register: async (username, email, password) => {
    try {
      const response = await api.post('/register', { username, email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  login: async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Listings API
export const listingsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/listings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getOne: async (id) => {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('/listings', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Messages API
export const messagesApi = {
  getAll: async () => {
    try {
      const response = await api.get('/messages');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  sendMessage: async (data) => {
    try {
      const response = await api.post('/messages', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
