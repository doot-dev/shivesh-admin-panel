import api from "./api";
const leadService = {
  getAllLeads: async () => {
    try {
      const response = await api.get("/api/v1/admin/leads");
      return response.data;
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  },
  getLeadsById: async (leadId) => {
    try {
      const response = await api.get(`/api/v1/admin/leads/by-id?${leadId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lead by ID:", error);
      throw error;
    }
  }
};
export default leadService;