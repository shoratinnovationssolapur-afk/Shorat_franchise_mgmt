import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

// Create the context
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Base API URL from .env
  const API_BASE = import.meta.env.VITE_API_URL + "/api"; // Make sure your backend URL is correct

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/notifications/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotifications(response.data);
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        console.error("Network error: Cannot reach backend", error);
      } else {
        console.error("Error fetching notifications:", error.response?.data || error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [authToken, API_BASE]);

  // Mark a single notification as read
  const handleMarkRead = async (id) => {
    if (!authToken) return console.error("Auth token missing");

    try {
      await axios.post(
        `${API_BASE}/notifications/${id}/mark_read/`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        console.error("Network error: Cannot reach backend", error);
      } else {
        console.error("Error marking notification as read:", error.response?.data || error.message);
      }
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (!authToken) return console.error("Auth token missing");

    try {
      await axios.post(
        `${API_BASE}/notifications/mark_all_read/`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        console.error("Network error: Cannot reach backend", error);
      } else {
        console.error("Error marking all notifications as read:", error.response?.data || error.message);
      }
    }
  };

  // Fetch notifications on mount and every 60s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        fetchNotifications,
        handleMarkRead,
        handleMarkAllRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
