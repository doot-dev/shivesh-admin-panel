import api from "./api";

export const loginUser = async (credentials) => {
  const response = await api.post("/api/v1/admin/auth", credentials);
  return response.data;
};
