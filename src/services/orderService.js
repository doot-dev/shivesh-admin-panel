import api from './api';

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
