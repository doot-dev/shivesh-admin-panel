import axios from "axios";
import { localStorageKeys } from "../constant/constant";

const api = axios.create({
  // VITE_API_URL points a dev build at a local backend; production uses the server.
  baseURL: import.meta.env.VITE_API_URL || "http://31.97.206.154:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(localStorageKeys.accessToken);
    if (token) {
      config.headers.authorization = token; // Use lowercase 'authorization' and just the token value
    }

    // Let the browser set the multipart boundary for file uploads —
    // a hand-set application/json here breaks upload endpoints ("No file uploaded").
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Log the actual request being sent
    console.log("Request config:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      dataType: typeof config.data,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // console.log('Response received:', response);
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    // W37: an order past its update window comes back 409 ORDER_LOCKED. Users
    // with orders.approve may override with a reason — ask once, retry once.
    const res = error.response;
    const cfg = error.config;
    if (res?.status === 409 && res.data?.code === "ORDER_LOCKED" && cfg && !cfg._lockRetried) {
      const reason = window.prompt(`${res.data.message}\n\nTo change it anyway (admin / approver only), give a reason:`);
      if (reason?.trim()) {
        cfg._lockRetried = true;
        if (typeof FormData !== "undefined" && cfg.data instanceof FormData) cfg.data.append("overrideReason", reason.trim());
        else cfg.data = JSON.stringify({ ...(cfg.data ? JSON.parse(cfg.data) : {}), overrideReason: reason.trim() });
        return api.request(cfg);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
