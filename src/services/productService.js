import api from './api';

const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await api.get('/api/v1/admin/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/api/v1/admin/product/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/api/v1/admin/product', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/api/v1/admin/product/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/api/v1/admin/product/?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Toggle product status
  toggleProductStatus: async (id) => {
    try {
      const response = await api.patch(`/api/v1/admin/product/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling product status:', error);
      throw error;
    }
  }
};

export default productService;