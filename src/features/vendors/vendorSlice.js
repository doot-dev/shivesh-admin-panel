import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import vendorService from "../../services/vendorService";

/* ===========================================================
   Async Thunks
   =========================================================== */

// 🔹 Fetch All Vendors
export const fetchVendors = createAsyncThunk(
  "vendor/fetchVendors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendorService.getVendors();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch vendors"
      );
    }
  }
);

// 🔹 Fetch Vendor By ID
export const fetchVendorById = createAsyncThunk(
  "vendor/fetchVendorById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await vendorService.getVendorById(id);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch vendor"
      );
    }
  }
);

// 🔹 Create Vendor
export const createVendor = createAsyncThunk(
  "vendor/createVendor",
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await vendorService.createVendor(vendorData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create vendor"
      );
    }
  }
);

// 🔹 Update Vendor
export const updateVendor = createAsyncThunk(
  "vendor/updateVendor",
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await vendorService.updateVendor(vendorData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update vendor"
      );
    }
  }
);

// 🔹 Delete Vendor
export const deleteVendor = createAsyncThunk(
  "vendor/deleteVendor",
  async (id, { rejectWithValue }) => {
    try {
      await vendorService.deleteVendor(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete vendor"
      );
    }
  }
);

/* ===========================================================
   Initial State
   =========================================================== */

const initialState = {
  list: [],
  currentVendor: null,
  loading: false,
  error: null,
};

/* ===========================================================
   Slice
   =========================================================== */

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    clearCurrentVendor: (state) => {
      state.currentVendor = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------------- Fetch All ---------------- */
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------------- Fetch By ID ---------------- */
      .addCase(fetchVendorById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVendor = action.payload;
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------------- Create ---------------- */
      .addCase(createVendor.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      /* ---------------- Update ---------------- */
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (v) => v.id === action.payload.id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      /* ---------------- Delete ---------------- */
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (v) => v.id !== action.payload
        );
      });
  },
});

export const { clearCurrentVendor } = vendorSlice.actions;

export default vendorSlice.reducer;