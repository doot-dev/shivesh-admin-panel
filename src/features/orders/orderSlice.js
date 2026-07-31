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

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, ...data }, { rejectWithValue }) => {
    try {
      const res = await orderService.updateOrderStatus(orderId, data);
      if (res.bill) {
        toast.success(`Order updated — bill ${res.bill.billNo} generated`);
      } else if (res.billError) {
        toast.warning(res.billError);
      } else {
        toast.success('Order status updated');
      }
      return { orderId, ...data, bill: res.bill, billError: res.billError };
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update order status');
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

// TM details — the page refetches the order after each of these succeeds,
// so the thunks here only need to make the call and surface errors.
export const addTm = createAsyncThunk(
  'orders/addTm',
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const res = await orderService.addTm(orderId, data);
      toast.success('TM added');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add TM');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const updateTm = createAsyncThunk(
  'orders/updateTm',
  async ({ orderId, tmId, data }, { rejectWithValue }) => {
    try {
      const res = await orderService.updateTm(orderId, tmId, data);
      toast.success('TM updated');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update TM');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const deleteTm = createAsyncThunk(
  'orders/deleteTm',
  async ({ orderId, tmId }, { rejectWithValue }) => {
    try {
      await orderService.deleteTm(orderId, tmId);
      toast.success('TM removed');
      return tmId;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to remove TM');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Order vendors
export const addOrderVendor = createAsyncThunk(
  'orders/addOrderVendor',
  async (data, { rejectWithValue }) => {
    try {
      const res = await orderService.addOrderVendor(data);
      toast.success('Vendor added');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add vendor');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const updateOrderVendor = createAsyncThunk(
  'orders/updateOrderVendor',
  async (data, { rejectWithValue }) => {
    try {
      const res = await orderService.updateOrderVendor(data);
      toast.success('Vendor updated');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update vendor');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const deleteOrderVendor = createAsyncThunk(
  'orders/deleteOrderVendor',
  async ({ orderId, orderVendorId }, { rejectWithValue }) => {
    try {
      await orderService.deleteOrderVendor(orderId, orderVendorId);
      toast.success('Vendor removed');
      return orderVendorId;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to remove vendor');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// Order technicians
export const addOrderTechnician = createAsyncThunk(
  'orders/addOrderTechnician',
  async (data, { rejectWithValue }) => {
    try {
      const res = await orderService.addOrderTechnician(data);
      toast.success('Technician assigned');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to assign technician');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const updateOrderTechnician = createAsyncThunk(
  'orders/updateOrderTechnician',
  async (data, { rejectWithValue }) => {
    try {
      const res = await orderService.updateOrderTechnician(data);
      toast.success('Technician updated');
      return res.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update technician');
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

export const deleteOrderTechnician = createAsyncThunk(
  'orders/deleteOrderTechnician',
  async ({ orderId, orderTechnicianId }, { rejectWithValue }) => {
    try {
      await orderService.deleteOrderTechnician(orderId, orderTechnicianId);
      toast.success('Technician removed');
      return orderTechnicianId;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to remove technician');
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
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, bill, billError, ...data } = action.payload;
        if (state.currentOrder && state.currentOrder.orderId === orderId) {
          state.currentOrder = { ...state.currentOrder, ...data };
        }
        const idx = state.list.findIndex((o) => o.orderId === orderId);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...data };
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
