import api from "./api";

/**
 * Sub-category master API. Sub-categories are standalone here — project
 * products copy the NAME by value rather than referencing an id, so these
 * endpoints only ever manage the master list itself.
 */
const subcategoryService = {
  // Get all sub-categories (length=1000 to fill dropdowns in one call)
  getAllSubcategories: async () => {
    try {
      const response = await api.get(`/api/v1/admin/subcategory?length=1000`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      throw error;
    }
  },

  // Get sub-category by ID
  getSubcategoryById: async (id) => {
    try {
      const response = await api.get(`/api/v1/admin/subcategory/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sub-category:", error);
      throw error;
    }
  },

  // Create new sub-category
  createSubcategory: async (subcategoryData) => {
    try {
      const response = await api.post(
        "/api/v1/admin/subcategory",
        subcategoryData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating sub-category:", error);
      throw error;
    }
  },

  // Update sub-category
  updateSubcategory: async (subcategoryData) => {
    try {
      const response = await api.put(
        `/api/v1/admin/subcategory`,
        subcategoryData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating sub-category:", error);
      throw error;
    }
  },

  // Delete sub-category (soft delete on the server)
  deleteSubcategory: async (id) => {
    try {
      const response = await api.delete(`/api/v1/admin/subcategory/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting sub-category:", error);
      throw error;
    }
  },

  // Toggle active/inactive
  toggleSubcategoryStatus: async (id) => {
    try {
      const response = await api.patch(
        `/api/v1/admin/subcategory/${id}/toggle-status`
      );
      return response.data;
    } catch (error) {
      console.error("Error toggling sub-category status:", error);
      throw error;
    }
  },
};

export default subcategoryService;
