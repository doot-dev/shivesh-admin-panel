import axios from 'axios';
import { localStorageKeys } from '../constant/constant';

const ordersApi = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

ordersApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(localStorageKeys.accessToken);
    if (token) {
      config.headers.authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const api = ordersApi;

const BASE = '/api/v1/admin/orders';

const orderService = {
  getOrders: async (params = {}) => {
    const response = await api.get(BASE, { params });
    return response.data;
  },

  getOrder: async (orderId) => {
    const response = await api.get(`${BASE}/${orderId}`);
    return response.data;
  },

  createOrder: async (data) => {
    const response = await api.post(BASE, data);
    return response.data;
  },

  updateOrder: async (orderId, data) => {
    const response = await api.put(`${BASE}/${orderId}`, data);
    return response.data;
  },

  deleteOrder: async (orderId) => {
    const response = await api.delete(`${BASE}/${orderId}`);
    return response.data;
  },

  addComment: async (orderId, message) => {
    const response = await api.post(`${BASE}/${orderId}/comments`, { message });
    return response.data;
  },

  getFieldTechs: async () => {
    const response = await api.get(`${BASE}/field-techs`);
    return response.data;
  },
};

export default orderService;
