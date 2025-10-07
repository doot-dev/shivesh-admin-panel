import axios from "axios";
import { localStorageKeys } from "../constant/constant";

const api = axios.create({
  baseURL: "http://31.97.206.154:3001", // change to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(localStorageKeys.accessToken);
    if (token) {
      config.headers.authorization = token; // Use lowercase 'authorization' and just the token value
    }
    
    // Log the actual request being sent
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      dataType: typeof config.data
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
