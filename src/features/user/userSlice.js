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
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await getUsers();
  return response;
});

export const createUser = createAsyncThunk("users/create", async (userres, {rejectWithValue}) => {
  try{
    const res = await addUser(userres);
    return res;
  }catch(err) {
    return rejectWithValue(err.response?.res || err.message)
  }
})

export const fetchUserById = createAsyncThunk("users/fetchById", async (userId, {rejectWithValue}) => {
  try{
    const res = await getUserById(userId);
    return res;
  }catch(err) {
    return rejectWithValue(err.response?.res || err.message)
  }
})

export const editUser = createAsyncThunk("user/edit", async (userres, {rejectWithValue}) => {
  try{
    const res = await updateUsers(userres);
    return res;
  }catch(err){
    return rejectWithValue(err.response?.res || err.message)
  }
});

export const removeUser = createAsyncThunk("user/delete", async (userId, {rejectWithValue}) => {
  try{
    const res = await deleteUser(userId);
    return res;
  }catch(err) {
    return rejectWithValue(err.response?.res || err.message)
  }
});
export const changePassword = createAsyncThunk("users/resetPassword", async (passwordres, { rejectWithValue }) => {
  try {
    const res = await resetPassword(passwordres);
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.res || err.message);
  }
});

// Slice
const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],

    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
       .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
    
       .addCase(createUser.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

       .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
     
       .addCase(editUser.fulfilled, (state, action) => {
        const index = state.list.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
  .addCase(removeUser.fulfilled, (state, action) => {
        state.list = state.list.filter(u => u.id !== action.meta.arg);
      });
  },
});

export default userSlice.reducer;
