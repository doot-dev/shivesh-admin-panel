import api from "./api";
const vendorService = {
  getVendors: async () => {
    try {
      const response = await api.get("/api/v1/admin/vendor");
      return response.data;
    } catch (error) {
      console.error("Error fetching vendors:", error);
      throw error;
    }
  },
  getVendorById: async (id) => {
    try {
      const response = await api.get(`/api/v1/admin/vendor/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching vendor:", error);
      throw error;
    }
  },
  createVendor: async (vendorData) => {
    try {
      const response = await api.post("/api/v1/admin/vendor", vendorData);
      return response.data;
    } catch (error) {
      console.error("Error creating vendor:", error);
      throw error;
    }
  },
  updateVendor: async (vendorData) => {
    try {
      const response = await api.put(`/api/v1/admin/vendor`, vendorData);
      return response.data;
    } catch (error) {
      console.error("Error updating vendor:", error);
      throw error;
    }
  },
  deleteVendor: async (id) => {
    try {
      const response = await api.delete(`/api/v1/admin/vendor/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting vendor:", error);
      throw error;
    }
  },
};
export default vendorService;
