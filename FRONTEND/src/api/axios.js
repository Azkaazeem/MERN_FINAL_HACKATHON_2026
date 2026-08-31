import axios from 'axios';

// Dynamically resolve API URL using environment variable OR deployed Vercel backend OR local host
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://mern-final-hackathon-2026.vercel.app/api') ||
  'https://mern-final-hackathon-2026.vercel.app/api' || 
  'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
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