import axios from 'axios';

// Dynamically resolve API URL in both production Vercel and local development
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// Request Interceptor: Attach Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;