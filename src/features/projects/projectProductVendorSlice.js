import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectProductVendorService from "../../services/projectProductVendorService";

/* =====================================
   ASYNC THUNKS
===================================== */

// Get all vendors for a product
export const fetchProjectProductVendors = createAsyncThunk(
  "projectProductVendor/fetchAll",
  async ({ projectId, productId }, thunkAPI) => {
    try {
      return await projectProductVendorService.getAllProjectProductVendors(
        projectId,
        productId,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch vendors",
      );
    }
  },
);

// Create vendor
export const createProjectProductVendor = createAsyncThunk(
  "projectProductVendor/create",
  async (vendorData, thunkAPI) => {
    try {
      return await projectProductVendorService.createProjectProductVendor(
        vendorData,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to create vendor",
      );
    }
  },
);

// Update vendor
export const updateProjectProductVendor = createAsyncThunk(
  "projectProductVendor/update",
  async (vendorData, thunkAPI) => {
    try {
      return await projectProductVendorService.updateProjectProductVendor(
        vendorData,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to update vendor",
      );
    }
  },
);

// Delete vendor
export const deleteProjectProductVendor = createAsyncThunk(
  "projectProductVendor/delete",
  async ({ projectId, productId, vendorId }, thunkAPI) => {
    try {
      return await projectProductVendorService.deleteProjectProductVendor(
        projectId,
        productId,
        vendorId,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to delete vendor",
      );
    }
  },
);

/* =====================================
   SLICE
===================================== */

const initialState = {
  list: [],
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
};

const projectProductVendorSlice = createSlice({
  name: "projectProductVendor",
  initialState,
  reducers: {
    clearVendorState: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      /* ================= FETCH ================= */

      .addCase(fetchProjectProductVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectProductVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.data || action.payload || [];
      })
      .addCase(fetchProjectProductVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= CREATE ================= */

      .addCase(createProjectProductVendor.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createProjectProductVendor.fulfilled, (state, action) => {
        state.createLoading = false;

        const newVendor = action.payload?.data || action.payload;
        if (newVendor) {
          state.list.unshift(newVendor);
        }
      })
      .addCase(createProjectProductVendor.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      /* ================= UPDATE ================= */

      .addCase(updateProjectProductVendor.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateProjectProductVendor.fulfilled, (state, action) => {
        state.updateLoading = false;

        const updatedVendor = action.payload?.data || action.payload;

        const index = state.list.findIndex(
          (item) => item.vendorId === updatedVendor.vendorId,
        );

        if (index !== -1) {
          state.list[index] = updatedVendor;
        }
      })
      .addCase(updateProjectProductVendor.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      /* ================= DELETE ================= */

      .addCase(deleteProjectProductVendor.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteProjectProductVendor.fulfilled, (state, action) => {
        state.deleteLoading = false;

        const { vendorId } = action.meta.arg;

        state.list = state.list.filter((item) => item.vendorId !== vendorId);
      })
      .addCase(deleteProjectProductVendor.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVendorState } = projectProductVendorSlice.actions;

export default projectProductVendorSlice.reducer;
