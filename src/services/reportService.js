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

  /** Phase 1B: one register (sales|documents|outstanding|challans|exceptions|audit|orders) as .xlsx. */
  exportRegister: async (register, params = {}) => {
    const response = await api.get(`${BASE}/export/${register}`, { params, responseType: 'blob' });
    return response.data;
  },

  /** Every register in one workbook for the CA. */
  exportCaPack: async (params = {}) => {
    const response = await api.get(`${BASE}/ca-pack`, { params, responseType: 'blob' });
    return response.data;
  },

  /** Every client's payment and order metrics (Reports tabs). */
  getAnalytics: async () => (await api.get(`${BASE}/analytics`)).data,

  /** One client's analysis + credit (client page Analysis tab). */
  getClientAnalytics: async (clientId) => (await api.get(`${BASE}/clients/${clientId}/analytics`)).data,

  /** Credit position for the banner on Add Order / order page (P1.15). */
  getClientCredit: async (clientId) => (await api.get(`${BASE}/clients/${clientId}/credit`)).data,
};

/** Save a blob response as a file. */
export const saveBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default reportService;
