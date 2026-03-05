import api from "./api";

export const addUser = async (userData) => {
  const response = await api.post("/api/v1/admin/user", userData);
  console.log("API Response:", response);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/api/v1/admin/user/all?length=1000");
  console.log("Get Users Response:", response);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/api/v1/admin/user/?id=${userId}`);
  console.log("Get User By ID Response:", response);
  return response.data;
};

export const updateUsers = async (userData) => {
  const response = await api.put("/api/v1/admin/user", userData);
  console.log("Update Users Response:", response);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/v1/admin/user/?id=${userId}`);
  console.log("Delete User Response:", response);
  return response.data;
};

export const resetPassword = async (passwordData) => {
  const response = await api.put(
    "/api/v1/admin/user/reset-password",
    passwordData
  );
  console.log("Reset Password Response:", response);
  return response.data;
};
