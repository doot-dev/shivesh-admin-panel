import { createSlice } from "@reduxjs/toolkit";
import { login } from "./authThunks";
import { saveToken, clearToken } from "../../utils/storage";
import { decrypt, encrypt } from "../../utils/security";
import { localStorageKeys } from "../../constant/constant";

const getPersistedUser = () => {
  try {
    const encrypted = localStorage.getItem(localStorageKeys.userData);
    if (!encrypted) return null;
    return JSON.parse(decrypt(encrypted));
  } catch {
    return null;
  }
};

const initialState = {
  user: getPersistedUser(),
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      clearToken();
        localStorage.removeItem(localStorageKeys.userData);

    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.token = action.payload.data.token;
        saveToken(action.payload.data.token);
        localStorage.setItem(
          localStorageKeys.userData,
          encrypt(JSON.stringify(action.payload.data))
        );

        saveToken(action.payload.data.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
