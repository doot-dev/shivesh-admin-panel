import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "../../services/authService";
import { localStorageKeys } from "../../constant/constant";
import { encrypt } from "../../utils/security";

export const login = createAsyncThunk("auth/login", async (credentials) => {
  const response = await loginUser(credentials);
  const userData = response.data;
  const data = {
    name: userData.name,
    userName: userData.userName,
    employeeId: userData.employeeId,
    role: userData.role,
    id: userData.id,
  };
  localStorage.setItem(
    localStorageKeys.userData,
    encrypt(JSON.stringify(data))
  );

  console.log("Login response:", response);
  return response;
});
