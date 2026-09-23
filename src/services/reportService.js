import api from './api';

const BASE = '/api/v1/admin/reports';

const reportService = {
  /**
   * Client credit-risk report — who is not clearing their dues, and how risky
   * each client is. Every figure is computed server-side from the Bill table,
   * so nothing here can drift out of date.
   *
   * Params: `riskLevel` (LOW|MEDIUM|HIGH|CRITICAL), `q` (company/owner/id),
   * `onlyOutstanding` ("true" to hide clients who owe nothing).
   */
  getCreditRisk: async (params = {}) => {
    const response = await api.get(`${BASE}/credit-risk`, { params });
    return response.data;
  },

  /** Every unpaid bill for one client, oldest first. */
  getClientOutstandingBills: async (clientId) => {
    const response = await api.get(`${BASE}/credit-risk/${clientId}/bills`);
    return response.data;
  },
};

export default reportService;
