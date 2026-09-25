import api from './api';

// Phase 2 payments + client account (W21, W24, W35). Payment URLs use the
// payment id — receipt numbers contain "/".
const paymentService = {
  account: async (clientId) => (await api.get(`/api/v1/admin/client/${clientId}/account`)).data,
  ledger: async (clientId) => (await api.get(`/api/v1/admin/client/${clientId}/ledger`)).data,
  preview: async (body) => (await api.post('/api/v1/admin/payments/preview', body)).data,
  record: async (body) => (await api.post('/api/v1/admin/payments', body)).data,
  list: async (params) => (await api.get('/api/v1/admin/payments', { params })).data,
  adjust: async (id, body) => (await api.post(`/api/v1/admin/payments/${id}/adjust`, body)).data,
  reverse: async (id, reason) => (await api.post(`/api/v1/admin/payments/${id}/reverse`, { reason })).data,
  setCredit: async (clientId, body) => (await api.put(`/api/v1/admin/client/${clientId}/credit`, body)).data,
  grantExtra: async (clientId, body) => (await api.post(`/api/v1/admin/client/${clientId}/credit-extra`, body)).data,
  revokeExtra: async (clientId, id, reason) => (await api.post(`/api/v1/admin/client/${clientId}/credit-extra/${id}/revoke`, { reason })).data,
  billingLog: async (params) => (await api.get('/api/v1/admin/bills/log', { params })).data,
  releaseHold: async (orderId, body) => (await api.post(`/api/v1/admin/orders/${orderId}/credit-release`, body)).data,
};

export default paymentService;
