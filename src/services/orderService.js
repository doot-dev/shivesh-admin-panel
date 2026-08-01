import api from './api';

const BASE = '/api/v1/admin/orders';

const orderService = {
  getOrders: async (params = {}) => {
    const response = await api.get(BASE, { params });
    return response.data;
  },

  getOrder: async (orderId, params = {}) => {
    const response = await api.get(`${BASE}/${orderId}`, { params });
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

  updateOrderStatus: async (orderId, data) => {
    const response = await api.put(`${BASE}/${orderId}/status`, data);
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

  // TM details
  addTm: async (orderId, data) => {
    const response = await api.post(`${BASE}/${orderId}/tm`, data);
    return response.data;
  },

  getTms: async (orderId) => {
    const response = await api.get(`${BASE}/${orderId}/tm`);
    return response.data;
  },

  updateTm: async (orderId, tmId, data) => {
    const response = await api.put(`${BASE}/${orderId}/tm/${tmId}`, data);
    return response.data;
  },

  deleteTm: async (orderId, tmId) => {
    const response = await api.delete(`${BASE}/${orderId}/tm/${tmId}`);
    return response.data;
  },

  // Order vendors
  addOrderVendor: async (data) => {
    const response = await api.post(`${BASE}/vendor/create`, data);
    return response.data;
  },

  getOrderVendors: async (orderId) => {
    const response = await api.get(`${BASE}/${orderId}/vendor/list`);
    return response.data;
  },

  updateOrderVendor: async (data) => {
    const response = await api.put(`${BASE}/vendor`, data);
    return response.data;
  },

  deleteOrderVendor: async (orderId, orderVendorId) => {
    const response = await api.delete(`${BASE}/${orderId}/vendor/${orderVendorId}`);
    return response.data;
  },

  // Order technicians
  addOrderTechnician: async (data) => {
    const response = await api.post(`${BASE}/technician/create`, data);
    return response.data;
  },

  getOrderTechnicians: async (orderId) => {
    const response = await api.get(`${BASE}/${orderId}/technician/list`);
    return response.data;
  },

  updateOrderTechnician: async (data) => {
    const response = await api.put(`${BASE}/technician`, data);
    return response.data;
  },

  deleteOrderTechnician: async (orderId, orderTechnicianId) => {
    const response = await api.delete(`${BASE}/${orderId}/technician/${orderTechnicianId}`);
    return response.data;
  },

  // Cube tests
  addCubeTest: async (orderId, formData) => {
    const response = await api.post(`${BASE}/${orderId}/cube-test`, formData);
    return response.data;
  },

  getCubeTests: async (orderId) => {
    const response = await api.get(`${BASE}/${orderId}/cube-test`);
    return response.data;
  },

  updateCubeTest: async (orderId, cubeTestId, formData) => {
    const response = await api.put(`${BASE}/${orderId}/cube-test/${cubeTestId}`, formData);
    return response.data;
  },

  deleteCubeTest: async (orderId, cubeTestId) => {
    const response = await api.delete(`${BASE}/${orderId}/cube-test/${cubeTestId}`);
    return response.data;
  },
};

export default orderService;
