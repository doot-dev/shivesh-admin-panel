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
      console.log("Project Id", projectId)
      const response = await projectProductService.getAllProjectProducts(projectId);
      console.log("proj prod :", response)
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
      return await projectProductService.updateProjectProduct(productData);
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
        state.prodList =
          action.payload?.data || action.payload || [];
      })
      .addCase(fetchProjectProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createProjectProduct.fulfilled, (state, action) => {
        const newProduct =
          action.payload?.data || action.payload;

        if (newProduct) {
          state.prodList.unshift(newProduct);
        }
      })

      .addCase(updateProjectProduct.fulfilled, (state, action) => {
        const updatedProduct =
          action.payload?.data || action.payload;

        const index = state.prodList.findIndex(
          (item) => item.productId === updatedProduct.productId
        );

        if (index !== -1) {
          state.prodList[index] = updatedProduct;
        }
      })

      .addCase(deleteProjectProduct.fulfilled, (state, action) => {
        const { productId } = action.meta.arg;

        state.prodList = state.prodList.filter(
          (item) => item.productId !== productId
        );
      });
  },
});

export const { clearCurrentProduct, clearProjectProductState } =
  projectProductSlice.actions;

export default projectProductSlice.reducer;
