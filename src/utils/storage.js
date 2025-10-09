import { localStorageKeys } from "../constant/constant";

// Save token to localStorage
export const saveToken = (token) => {
  localStorage.setItem(localStorageKeys.accessToken, token);
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem(localStorageKeys.accessToken);
};

// Clear token from localStorage
export const clearToken = () => {
  localStorage.removeItem(localStorageKeys.accessToken);
};

// Save user data
export const saveUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Get user data
export const getUser = () => {
  const user = localStorage.getItem("user");
  console.log("User data", user)
  return user ? JSON.parse(user) : null;
};

// Clear user data
export const clearUser = () => {
  localStorage.removeItem("user");
};
