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
      const response = await api.get(`/api/v1/admin/leads/by-id?leadId=${leadId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lead by ID:", error);
      throw error;
    }
  },
  addNewLead:  async (leadData) => {
    try{
      const response = await api.post(`/api/v1/admin/leads`, leadData);
      return response.data
    }catch(error) {
      console.error("Error while adding new lead", error);
      throw error;
    }
  } 
};
export default leadService;