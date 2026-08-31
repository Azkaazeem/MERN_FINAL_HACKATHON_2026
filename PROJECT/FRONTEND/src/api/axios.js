import axios from 'axios';

// Get API base URL with full production Vercel priority
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Only use localhost if the browser itself is explicitly opened on localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  // Everywhere else (Production Vercel, etc.), ALWAYS use Deployed Vercel Backend
  return 'https://mern-final-hackathon-2026.vercel.app/api';
};

const API = axios.create({
  baseURL: 'https://mern-final-hackathon-2026.vercel.app/api',
});

// Dynamic Runtime Request Interceptor
API.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;