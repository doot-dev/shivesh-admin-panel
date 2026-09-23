import api from "./api";


export const loginUser = async (credentials) => {
  const response = await api.post("/api/v1/admin/auth", credentials);
  return response.data;
};

/**
 * Re-reads the signed-in user and their CURRENT permissions from the server.
 *
 * The panel calls this on every boot. Permissions live in localStorage between
 * page loads, so without this an admin who had a role revoked would keep the
 * old menus until their 30-day token expired.
 */
export const fetchMe = async () => {
  const response = await api.get("/api/v1/admin/auth/me");
  return response.data;
};
