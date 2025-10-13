import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addUser,
  getUsers,
  getUserById,
  updateUsers,
  deleteUser,
  resetPassword,
} from "../../services/userService";

// Async Thunks (for API calls)
export const fetchUsers = createAsyncThunk("user/fetchUsers", async () => {
  const response = await getUsers();
  return response;
});

export const createUser = createAsyncThunk("user/createUser", async (userData) => {
  const response = await addUser(userData);
  return response;
});

export const editUser = createAsyncThunk("user/editUser", async (userData) => {
  const response = await updateUsers(userData);
  return response;
});

export const removeUser = createAsyncThunk("user/removeUser", async (userId) => {
  const response = await deleteUser(userId);
  return response;
});

// Slice
const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add User
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      // Update User
      .addCase(editUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete User
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.meta.arg);
      });
  },
});

export default userSlice.reducer;
