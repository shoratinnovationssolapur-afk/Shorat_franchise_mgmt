import axios from "axios";
import { API_BASE_URL } from "./apiBase";

let apiInstance;

export const getApi = () => {
  if (apiInstance) return apiInstance;

  const instance = axios.create({
    baseURL: `${API_BASE_URL}/`,
    headers: { "Content-Type": "application/json" },
  });

  // Request: attach token
  instance.interceptors.request.use((config) => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config || {};
      const status = error?.response?.status;

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
      }

      return Promise.reject(error);
    }
  );

  apiInstance = instance;
  return instance;
};
