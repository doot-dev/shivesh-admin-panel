import api from "./api";
const leadService = {
  getAllLeads: async () => {
    try {
      const response = await api.get("/api/v1/admin/leads?length=1000");
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
  },
  updateActivityLog: async(leadId, logData) => {
    try{
      const response = await api.put(`/api/v1/admin/leads/log?leadId=${leadId}`, logData);
      return response.data;
    }catch(error) {
      console.error("Error while adding new lead", error);
      throw error;
    }
  } ,
  deleteLead: async(leadId) => {
    try{
      const response = await api.delete(`/api/v1/admin/leads?leadId=${leadId}`);
      return response.data;
    }catch(error) {
      console.error("Error while delete lead", error);
      throw error;
    }
  }

};
export default leadService;