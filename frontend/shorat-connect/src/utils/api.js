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

  // Response: auto-refresh on 401 once
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config || {};
      const status = error?.response?.status;

      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // queue requests while refreshing
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              originalRequest._retry = true;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) throw new Error("No refresh token available");

          const refreshRes = await axios.post(
            `${API_BASE_URL}/token/refresh/`,
            { refresh: refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );
          const newAccess = refreshRes?.data?.access;
          if (!newAccess) throw new Error("No access token in refresh response");

          // persist and update header
          localStorage.setItem("access_token", newAccess);
          instance.defaults.headers["Authorization"] = `Bearer ${newAccess}`;
          processQueue(null, newAccess);

          // retry original
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
          return instance(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          // optional: logout cleanup
          // localStorage.removeItem("access_token");
          // localStorage.removeItem("refresh_token");
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  apiInstance = instance;
  return instance;
};
