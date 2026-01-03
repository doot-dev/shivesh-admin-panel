import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import clientService from "../../services/clientService";
import { toast } from "react-toastify";

export const fetchClients = createAsyncThunk(
  "clients/getallClients",
  async () => {
    const response = await clientService.getClients();
    console.log("response of client", response);
    return response;
  }
);

export const fetchClientsById = createAsyncThunk(
  "clients/getClientById",
  async (clientId, { rejectWithValue }) => {
    try {
      const res = await clientService.getClientsById(clientId);
      console.log("response of client by Id", res);
      return res?.data ?? res;
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createClient = createAsyncThunk(
  "clients/createClient",
  async (clientPayload, { rejectWithValue }) => {
    try {
      const res = await clientService.createClient(clientPayload);
      toast.success(res?.message || "Client created successfully");
      return res?.data ?? res;
    } catch (error) {
      const responseData = error?.response?.data;

      // ✅ Field-level validation errors
      const fieldErrors = responseData?.errors?.errors;

      if (fieldErrors) {
        Object.values(fieldErrors).forEach((messages) => {
          if (Array.isArray(messages) && messages.length > 0) {
            toast.error(messages[0]); // show exact API message
          }
        });
      } 
      // ✅ Generic error fallback
      else {
        toast.error(
          responseData?.message || error.message || "Something went wrong"
        );
      }

      return rejectWithValue(responseData || error.message);
    }
  }
);


export const updateClient = createAsyncThunk(
  "clients/updateClient",
  async (clientPayload, { rejectWithValue }) => {
    try {
      console.log("Updating client with payload", clientPayload);
      const res = await clientService.updateClient(clientPayload);
      toast.success(res?.message || "Client updated successfully");
      return res?.data ?? res;
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadClientKycDocuments = createAsyncThunk(
  "clients/uploadClientKycDocuments",
  async ({ clientId, documents }, { rejectWithValue }) => {
    try {
      const res = await clientService.uploadKYCDocuments(clientId, documents);
      toast.success(res?.message || "KYC documents uploaded successfully");
      return res?.data ?? res;
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteClient = createAsyncThunk(
  "clients/deleteClient",
  async (clientId, { rejectWithValue }) => {
    try {
      const res = await clientService.deleteClient(clientId);
      toast.success(res?.message || "Client deleted successfully");
      console.log("Deleted client response", res);
      return res?.data ?? res;
    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const clientSlice = createSlice({
  name: "client",
  initialState: {
    list: [],
    currentClient: null,
    loading: false,
    error: null,
    kycUploading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.list = payload;
        } else if (Array.isArray(payload?.data)) {
          state.list = payload.data;
        } else {
          state.list = [];
        }
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        // If API returns the created client object, append it to list
        const createdClient = action.payload?.data ?? action.payload;
        if (createdClient) {
          state.list = Array.isArray(state.list)
            ? [...state.list, createdClient]
            : [createdClient];
        }
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchClientsById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentClient = null;
      })
      .addCase(fetchClientsById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClient = action.payload?.data ?? action.payload;
      })
      .addCase(fetchClientsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(uploadClientKycDocuments.pending, (state) => {
        state.kycUploading = true;
        state.error = null;
      })
      .addCase(uploadClientKycDocuments.fulfilled, (state, action) => {
        state.kycUploading = false;
        const updatedClient = action.payload?.data ?? action.payload;
        if (updatedClient) {
          state.currentClient = updatedClient;
        }
      })
      .addCase(uploadClientKycDocuments.rejected, (state, action) => {
        state.kycUploading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;

        const updatedClient = action.payload?.data ?? action.payload;
        if (!updatedClient) return;

        // Update client list
        if (Array.isArray(state.list)) {
          state.list = state.list.map((client) =>
            client._id === updatedClient._id ? updatedClient : client
          );
        }

        // Update current client if same
        if (state.currentClient?._id === updatedClient._id) {
          state.currentClient = updatedClient;
        }
      })

      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        const deletedClientId = action.meta.arg;
        state.list = state.list.filter(
          (client) => client._id !== deletedClientId
        );
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default clientSlice.reducer;
