import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import billService from '../../services/billService';

export const fetchBills = createAsyncThunk(
  'bills/fetchBills',
  async (params, { rejectWithValue }) => {
    try {
      return await billService.getBills(params);
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const fetchBillByNo = createAsyncThunk(
  'bills/fetchBillByNo',
  async (billNo, { rejectWithValue }) => {
    try {
      const res = await billService.getBill(billNo);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const createBill = createAsyncThunk(
  'bills/createBill',
  async (data, { rejectWithValue }) => {
    try {
      const res = await billService.createBill(data);
      toast.success('Bill generated');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to generate bill');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const updateBill = createAsyncThunk(
  'bills/updateBill',
  async (data, { rejectWithValue }) => {
    try {
      const res = await billService.updateBill(data);
      toast.success('Bill updated');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update bill');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const updateBillStatus = createAsyncThunk(
  'bills/updateBillStatus',
  async (data, { rejectWithValue }) => {
    try {
      const res = await billService.updateBillStatus(data);
      toast.success('Bill status updated');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update bill status');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const deleteBill = createAsyncThunk(
  'bills/deleteBill',
  async (billNo, { rejectWithValue }) => {
    try {
      await billService.deleteBill(billNo);
      toast.success('Bill deleted');
      return billNo;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete bill');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const uploadBillDocument = createAsyncThunk(
  'bills/uploadBillDocument',
  async ({ billNo, file }, { rejectWithValue }) => {
    try {
      const res = await billService.uploadDocument(billNo, file);
      toast.success('Document uploaded');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.error || 'Failed to upload document');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const uploadTmChallan = createAsyncThunk(
  'bills/uploadTmChallan',
  async ({ billNo, tmId, file }, { rejectWithValue }) => {
    try {
      const res = await billService.uploadChallan(billNo, tmId, file);
      toast.success('Challan uploaded');
      return { tmId, ...res.data };
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.error || 'Failed to upload challan');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const setTmApproval = createAsyncThunk(
  'bills/setTmApproval',
  async ({ billNo, tmId, data }, { rejectWithValue }) => {
    try {
      const res = await billService.setTmApproval(billNo, tmId, data);
      toast.success(data.approvalStatus === 'REJECTED' ? 'TM rejected' : 'TM accepted');
      return { tmId, ...res.data };
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update TM approval');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

const patchTm = (state, tmId, patch) => {
  if (!state.currentBill?.tmDetails) return;
  state.currentBill.tmDetails = state.currentBill.tmDetails.map((tm) =>
    tm.id === tmId ? { ...tm, ...patch } : tm
  );
};

const billSlice = createSlice({
  name: 'bills',
  initialState: {
    list: [],
    total: 0,
    currentBill: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentBill: (state) => {
      state.currentBill = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBillByNo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillByNo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload;
      })
      .addCase(fetchBillByNo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        if (state.currentBill) state.currentBill = { ...state.currentBill, ...action.payload };
      })
      .addCase(updateBillStatus.fulfilled, (state, action) => {
        if (state.currentBill) state.currentBill = { ...state.currentBill, ...action.payload };
        const idx = state.list.findIndex((b) => b.billNo === action.payload.billNo);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(uploadBillDocument.fulfilled, (state, action) => {
        if (state.currentBill) state.currentBill = { ...state.currentBill, ...action.payload };
      })
      .addCase(uploadTmChallan.fulfilled, (state, action) => {
        const { tmId, ...patch } = action.payload;
        patchTm(state, tmId, patch);
      })
      .addCase(setTmApproval.fulfilled, (state, action) => {
        const { tmId, ...patch } = action.payload;
        patchTm(state, tmId, patch);
      });
  },
});

export const { clearCurrentBill } = billSlice.actions;
export default billSlice.reducer;
