import api from './api';

const BASE = '/api/v1/admin/notifications';

/**
 * Admin notification feed — powers the navbar bell.
 *
 * Notifications are raised server-side by notifyAdmins() whenever an order is
 * created, an order's status changes, or a client / field technician comments
 * on an order. The feed is SHARED by all admins (every row is addressed to the
 * single 'admin' target), so marking one read marks it read for everyone.
 */
const notificationService = {
  /** Newest first. Params: `page`, `limit`, `unreadOnly` ("true"). */
  list: async (params = {}) => {
    const response = await api.get(BASE, { params });
    return response.data;
  },

  markRead: async (id) => {
    const response = await api.put(`${BASE}/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.put(`${BASE}/read-all`);
    return response.data;
  },
};

export default notificationService;
