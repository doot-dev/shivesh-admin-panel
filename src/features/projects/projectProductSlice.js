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
      return await projectProductService.getAllProjectProducts(projectId);
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
  list: [],
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

      /* ================= FETCH ALL ================= */

      .addCase(fetchProjectProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.data || action.payload || [];
      })
      .addCase(fetchProjectProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH BY ID ================= */

      .addCase(fetchProjectProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload?.data || action.payload || null;
      })
      .addCase(fetchProjectProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= CREATE ================= */

      .addCase(createProjectProduct.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createProjectProduct.fulfilled, (state, action) => {
        state.createLoading = false;

        const newProduct = action.payload?.data || action.payload;
        if (newProduct) {
          state.list.unshift(newProduct);
        }
      })
      .addCase(createProjectProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      /* ================= UPDATE ================= */

      .addCase(updateProjectProduct.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateProjectProduct.fulfilled, (state, action) => {
        state.updateLoading = false;

        const updatedProduct = action.payload?.data || action.payload;

        const index = state.list.findIndex(
          (item) => item.productId === updatedProduct.productId,
        );

        if (index !== -1) {
          state.list[index] = updatedProduct;
        }
      })
      .addCase(updateProjectProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      /* ================= DELETE ================= */

      .addCase(deleteProjectProduct.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteProjectProduct.fulfilled, (state, action) => {
        state.deleteLoading = false;

        const { productId } = action.meta.arg;

        state.list = state.list.filter((item) => item.productId !== productId);
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
