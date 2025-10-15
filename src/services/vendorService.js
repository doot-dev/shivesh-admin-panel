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
  getLocationbyVendorId: async (vendorId) => {
    try {
      const response = await api.get(
        `/api/v1/admin/vendor/${vendorId}/locations`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching vendor locations:", error);
      throw error;
    }
  },
  addLocation: async (locationData) => {
    try {
      const response = await api.post(
        "/api/v1/admin/vendor/locations",
        locationData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding location:", error);
      throw error;
    }
  },
  updateLocation: async (locationData) => {
    try {
      const response = await api.put(
        "/api/v1/admin/vendor/location",
        locationData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  },
  getLocationbyId: async (locationId) => {
    try {
      const response = await api.get(
        `/api/v1/admin/vendor/locations/${locationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
    }
  },
  deleteLocationbyId: async (locationId) => {
    try {
      const response = await api.delete(
        `/api/v1/admin/vendor/locations/${locationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  },
  addHandlers: async (handlerData) => {
    try {
      const response = await api.post(
        "/api/v1/admin/vendor/handlers",
        handlerData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding handlers:", error);
      throw error;
    }
  },
  updateHandlers: async (handlerData) => {
    try {
      const response = await api.put(
        "/api/v1/admin/vendor/handlers",
        handlerData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating handlers:", error);
      throw error;
    }
  },
  deleteHandlers: async (handlerId) => {
    try {
      const response = await api.delete(
        `/api/v1/admin/vendor/handlers/${handlerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting handlers:", error);
      throw error;
    }
  },
  getHandlersforLocation: async (locationId) => {
    try {
      const response = await api.get(
        `/api/v1/admin/vendor/handlers/${locationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching handlers for location:", error);
      throw error;
    }
  },
};
export default vendorService;
