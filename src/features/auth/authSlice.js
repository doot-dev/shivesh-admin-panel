import { createSlice } from "@reduxjs/toolkit";
import { login, refreshSession } from "./authThunks";
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

const persistUser = (user) => {
  localStorage.setItem(localStorageKeys.userData, encrypt(JSON.stringify(user)));
};

const initialState = {
  user: getPersistedUser(),
  token: null,
  loading: false,
  error: null,
  // `sessionChecked` gates the whole app: until /me answers we don't know the
  // real permissions, so the router shows a loader rather than briefly flashing
  // menus the user may no longer be allowed to see.
  sessionChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.sessionChecked = true;
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
        state.sessionChecked = true;
        saveToken(action.payload.data.token);
        persistUser(action.payload.data);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Boot-time permission refresh.
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.sessionChecked = true;
        // Merge rather than replace: /me does not return the token, and the
        // persisted copy is the only place it lives between page loads.
        state.user = { ...(state.user ?? {}), ...action.payload };
        persistUser(state.user);
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.sessionChecked = true;
        // Only a genuine auth failure ends the session. A network blip or a
        // 500 must NOT log the user out — they would lose their work every
        // time the server hiccuped.
        if (action.payload === 401 || action.payload === 403) {
          state.user = null;
          state.token = null;
          clearToken();
          localStorage.removeItem(localStorageKeys.userData);
        }
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
