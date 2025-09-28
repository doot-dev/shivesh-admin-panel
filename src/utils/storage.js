// Save token to localStorage
export const saveToken = (token) => {
  localStorage.setItem("access-token", token);
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem("access-token");
};

// Clear token from localStorage
export const clearToken = () => {
  localStorage.removeItem("access-token");
};

// Save user data
export const saveUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Get user data
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Clear user data
export const clearUser = () => {
  localStorage.removeItem("user");
};
