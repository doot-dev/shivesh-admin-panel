import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      return await orderService.getOrders(params);
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await orderService.getOrder(orderId);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (data, { rejectWithValue }) => {
    try {
      const res = await orderService.createOrder(data);
      toast.success('Order created successfully');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create order');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, ...data }, { rejectWithValue }) => {
    try {
      const res = await orderService.updateOrder(orderId, data);
      toast.success('Order updated successfully');
      return { orderId, ...res.data };
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update order');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await orderService.deleteOrder(orderId);
      toast.success('Order deleted successfully');
      return orderId;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete order');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const addOrderComment = createAsyncThunk(
  'orders/addComment',
  async ({ orderId, message }, { rejectWithValue }) => {
    try {
      const res = await orderService.addComment(orderId, message);
      return res.data;
    } catch (e) {
      toast.error('Failed to add comment');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const fetchFieldTechs = createAsyncThunk(
  'orders/fetchFieldTechs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await orderService.getFieldTechs();
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    total: 0,
    currentOrder: null,
    fieldTechs: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrder.fulfilled, (state) => {
        // Re-fetch handled by page
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        if (state.currentOrder && state.currentOrder.orderId === action.payload.orderId) {
          state.currentOrder = { ...state.currentOrder, ...action.payload };
        }
        const idx = state.list.findIndex((o) => o.orderId === action.payload.orderId);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.list = state.list.filter((o) => o.orderId !== action.payload);
      })
      .addCase(addOrderComment.fulfilled, (state, action) => {
        if (state.currentOrder && action.payload) {
          state.currentOrder = {
            ...state.currentOrder,
            comments: [...(state.currentOrder.comments || []), action.payload],
          };
        }
      })
      .addCase(fetchFieldTechs.fulfilled, (state, action) => {
        state.fieldTechs = action.payload || [];
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
