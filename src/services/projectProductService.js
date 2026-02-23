import api from "./api";

const projectProductService = {
  getAllProjectProducts: async (projectId) => {
    try {
      const response = await api.get(
        `/api/v1/admin/project/${projectId}/product/list`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching project products:", error);
      throw error;
    }
  },
  createProjectProduct: async (productData) => {
    try {
      const response = await api.post(
        `/api/v1/admin/project/product/create`,
        productData,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating project product:", error);
      throw error;
    }
  },
  getProjectProductById: async (projectId, productId) => {
    try {
      const response = await api.get(
        `/api/v1/admin/project/${projectId}/product/${productId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching project product details:", error);
      throw error;
    }
  },
  updateProjectProduct: async (productData) => {
    try {
      const response = await api.put(
        `/api/v1/admin/project/product`,
        productData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating project product:", error);
      throw error;
    }
  },
  deleteProjectProduct: async (projectId, productId) => {
    try {
      const response = await api.delete(
        `/api/v1/admin/project/${projectId}/product/${productId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting project product:", error);
      throw error;
    }
  },
};

export default projectProductService;

// post request body example
//     {
//   "projectId": "PRJ-2026-0001",
//   "productName": "M20 Grade Concrete",
//   "productGrade": "M20",
//   "costPrice": 4500
// }
// put request body example
// {
//   "projectId": "PRJ-2026-0001",
//   "productId": "cmjv1ut9d0001lgfntpu817vq",
//   "productName": "M25 Grade Concrete",
//   "productGrade": "M25",
//   "costPrice": 5000
// }
