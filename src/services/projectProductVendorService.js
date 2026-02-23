import api from "./api";

const projectProductVendorService = {
  getAllProjectProductVendors: async (projectId, productId) => {
    try {
      const response = await api.get(
        `/api/v1/admin/project/${projectId}/product/${productId}/vendor/list`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching project product vendors:", error);
      throw error;
    }
  },
  createProjectProductVendor: async (vendorData) => {
    try {
      const response = await api.post(
        `/api/v1/admin/project/product/vendor/create`,
        vendorData,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating project product vendor:", error);
      throw error;
    }
  },
  updateProjectProductVendor: async (vendorData) => {
    try {
      const response = await api.put(
        `/api/v1/admin/project/product/vendor`,
        vendorData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating project product vendor:", error);
      throw error;
    }
  },
  deleteProjectProductVendor: async (projectId, productId, vendorId) => {
    try {
      const response = await api.delete(
        `/api/v1/admin/project/${projectId}/product/${productId}/vendor/${vendorId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting project product vendor:", error);
      throw error;
    }
  },
};

export default projectProductVendorService;

// post request body example
// {
//   "projectId": "PRJ-2026-0001",
//   "productId": "cmjv1ut9d0001lgfntpu817vq",
//   "vendorId": 1,
//   "customPrice": 4200,
//   "priority": "HIGH"
// }

// put request body example
// {
//   "projectId": "PRJ-2026-0001",
//   "productId": "cmjv1ut9d0001lgfntpu817vq",
//   "vendorId": 1,
//   "customPrice": 4200,
//   "priority": "HIGH"
// }
