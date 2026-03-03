import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectProductService from "../../services/projectProductService";

/* ===============================
   ASYNC THUNKS
================================= */

// Get all products of a project
export const fetchProjectProducts = createAsyncThunk(
  "projectProduct/fetchAll",
  async (projectId, thunkAPI) => {
    try {
      console.log("Project Id", projectId);
      const response =
        await projectProductService.getAllProjectProducts(projectId);
      console.log("proj prod :", response);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch products",
      );
    }
  },
);

// Get single product details
export const fetchProjectProductById = createAsyncThunk(
  "projectProduct/fetchById",
  async ({ projectId, productId }, thunkAPI) => {
    try {
      return await projectProductService.getProjectProductById(
        projectId,
        productId,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch product details",
      );
    }
  },
);

// Create product
export const createProjectProduct = createAsyncThunk(
  "projectProduct/create",
  async (productData, thunkAPI) => {
    try {
      return await projectProductService.createProjectProduct(productData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to create product",
      );
    }
  },
);

// Update product
export const updateProjectProduct = createAsyncThunk(
  "projectProduct/update",
  async (productData, thunkAPI) => {
    try {
      console.log("Product Data", productData);
      const response =
        await projectProductService.updateProjectProduct(productData);

      console.log("Updated Product Response", response);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to update product",
      );
    }
  },
);

// Delete product
export const deleteProjectProduct = createAsyncThunk(
  "projectProduct/delete",
  async ({ projectId, productId }, thunkAPI) => {
    try {
      return await projectProductService.deleteProjectProduct(
        projectId,
        productId,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to delete product",
      );
    }
  },
);

/* ===============================
   SLICE
================================= */

const initialState = {
  prodList: [],
  currentProduct: null,

  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  error: null,
};

const projectProductSlice = createSlice({
  name: "projectProduct",
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearProjectProductState: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchProjectProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.prodList = action.payload?.data || action.payload || [];
      })
      .addCase(fetchProjectProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProjectProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload?.data || action.payload || null;
      })
      .addCase(fetchProjectProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createProjectProduct.fulfilled, (state, action) => {
        const newProduct = action.payload?.data || action.payload;

        if (newProduct) {
          state.prodList.unshift(newProduct);
        }
      })

      .addCase(updateProjectProduct.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProjectProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload?.data || action.payload;

        const index = state.prodList.findIndex(
          (item) => item.id === updatedProduct.id,
        );

        if (index !== -1) {
          state.prodList[index] = updatedProduct;
        }

        state.currentProduct = updatedProduct;
        state.updateLoading = false;
      })
      .addCase(updateProjectProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteProjectProduct.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteProjectProduct.fulfilled, (state, action) => {
        const { productId } = action.meta.arg;

        state.prodList = state.prodList.filter((item) => item.id !== productId);
        state.deleteLoading = false;
      })
      .addCase(deleteProjectProduct.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProduct, clearProjectProductState } =
  projectProductSlice.actions;

export default projectProductSlice.reducer;
