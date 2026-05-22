import React, { useState, useEffect } from "react";
import { StaffHeader } from "./StaffHeader";  // adjust the import path

const StaffPage = () => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Example: get user details on mount
  useEffect(() => {
    const storedUser = {
      name: localStorage.getItem("username"),
      role: localStorage.getItem("role"),
      avatar: localStorage.getItem("avatar"),
    };
    setUser(storedUser);
  }, []);

  // 👇 Add your logout function here
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // optionally clear anything else
    window.location.href = "/login"; // or use navigate("/login") if using react-router
  };

  // menu toggle (example)
  const toggleMenu = () => {
    // logic for toggling sidebar/menu
  };

  return (
    <>
      <StaffHeader
        user={user}
        unreadCount={unreadCount}
        onMenuToggle={toggleMenu}
        onLogout={handleLogout}  /* ✅ pass logout function here */
      />
      {/* rest of your staff page content */}
    </>
  );
};

export default StaffPage;
