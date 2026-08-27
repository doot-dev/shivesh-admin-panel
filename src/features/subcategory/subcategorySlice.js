import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import subcategoryService from "../../services/subcategoryService";
import { toast } from "react-toastify";

/**
 * Sub-category master state. Also feeds the sub-category dropdown on project
 * products, which copies the selected NAME (not the id) onto the project
 * product — so consumers should read `subcategoryList[].name`.
 */
export const fetchSubcategories = createAsyncThunk(
    "subcategories/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await subcategoryService.getAllSubcategories();
            return res;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createSubcategory = createAsyncThunk(
    "subcategories/create",
    async (subcategoryData, { rejectWithValue }) => {
        try {
            const res = await subcategoryService.createSubcategory(subcategoryData);
            toast.success(res?.message || "Sub-category created successfully");
            return res;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create sub-category");
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateSubcategory = createAsyncThunk(
    "subcategories/update",
    async (subcategoryData, { rejectWithValue }) => {
        try {
            const res = await subcategoryService.updateSubcategory(subcategoryData);
            toast.success(res?.message || "Sub-category updated successfully");
            return res;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update sub-category");
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteSubcategory = createAsyncThunk(
    "subcategories/delete",
    async (subcategoryId, { rejectWithValue }) => {
        try {
            const res = await subcategoryService.deleteSubcategory(subcategoryId);
            toast.success(res?.message || "Sub-category deleted successfully");
            return res;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete sub-category");
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const subcategorySlice = createSlice({
    name: "subcategories",
    initialState: {
        subcategoryList: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubcategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubcategories.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload?.data || action.payload || [];
                state.subcategoryList = Array.isArray(data) ? data : [];
            })
            .addCase(fetchSubcategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default subcategorySlice.reducer;
