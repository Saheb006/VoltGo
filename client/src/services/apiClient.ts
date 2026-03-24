import axios from 'axios';

// Create centralized axios instance with proper configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Equivalent to credentials: 'include' in fetch
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // You can add token logic here if needed in future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
      console.error('Unauthorized access - redirecting to login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
