import api from './api';

const BASE = '/api/v1/admin/bills';

const billService = {
  getBills: async (params = {}) => {
    const response = await api.get(`${BASE}/list`, { params });
    return response.data;
  },

  getBill: async (billNo) => {
    const response = await api.get(`${BASE}/${billNo}`);
    return response.data;
  },

  getBillByOrder: async (orderId) => {
    const response = await api.get(`${BASE}/order/${orderId}`);
    return response.data;
  },

  createBill: async (data) => {
    const response = await api.post(`${BASE}/create`, data);
    return response.data;
  },

  updateBill: async (data) => {
    const response = await api.put(BASE, data);
    return response.data;
  },

  updateBillStatus: async (data) => {
    const response = await api.put(`${BASE}/status`, data);
    return response.data;
  },

  // Invoice PDF with the bill document and challans appended. Fetched as a blob
  // because the endpoint needs the auth header a plain link can't send.
  getInvoicePdf: async (billNo) => {
    const response = await api.get(`${BASE}/${billNo}/invoice`, { responseType: 'blob' });
    return response.data;
  },

  deleteBill: async (billNo) => {
    const response = await api.delete(`${BASE}/${billNo}`);
    return response.data;
  },

  uploadDocument: async (billNo, file) => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post(`${BASE}/${billNo}/document`, formData);
    return response.data;
  },

  // W11: review trucks on the ORDER, before any bill exists.
  uploadOrderChallan: async (orderId, tmId, file) => {
    const formData = new FormData();
    formData.append('challan', file);
    const response = await api.post(`/api/v1/admin/orders/${orderId}/tm/${tmId}/challan`, formData);
    return response.data;
  },

  reviewOrderTm: async (orderId, tmId, data) => {
    const response = await api.put(`/api/v1/admin/orders/${orderId}/tm/${tmId}/approval`, data);
    return response.data;
  },

  // G16: the billing list's Export — the sales register for the chosen dates.
  exportBills: async (params = {}) => {
    const response = await api.get(`${BASE}/export`, { params, responseType: 'blob' });
    return response.data;
  },

  uploadChallan: async (billNo, tmId, file) => {
    const formData = new FormData();
    formData.append('challan', file);
    const response = await api.post(`${BASE}/${billNo}/tm/${tmId}/challan`, formData);
    return response.data;
  },

  setTmApproval: async (billNo, tmId, data) => {
    const response = await api.put(`${BASE}/${billNo}/tm/${tmId}/approval`, data);
    return response.data;
  },
};

export default billService;
