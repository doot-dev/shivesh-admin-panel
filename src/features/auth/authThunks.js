import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "../../services/authService";

export const login = createAsyncThunk("auth/login", async (credentials) => {
  const response = await loginUser(credentials);
  console.log("Login response:", response);
  return response;
});
