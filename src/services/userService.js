import api from "./api";

export const addUser = async (userData) => {
  console.log("Sending userData:", userData);
  console.log("Type of userData:", typeof userData);
  console.log("JSON stringified userData:", JSON.stringify(userData));
  debugger;
  const response = await api.post("/api/v1/admin/user", userData);

  console.log("API Response:", response);
  return response.data;
};


export const getUsers = async () => {
    const response = await api.get("/api/v1/admin/user/all");
    console.log("Get Users Response:", response);
    return response.data;
}