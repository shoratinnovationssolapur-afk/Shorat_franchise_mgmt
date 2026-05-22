import React, { useEffect, useState } from "react";
import StaffSidebar from "./StaffSidebarClean";
import { StaffHeader } from "./StaffHeader";

// Import all Staff pages (you can adjust according to your folder structure)
import StaffAttendance from "../Attendance/StaffAttendance";
import StaffLeaveManagement from "../Leave/StaffLeaveManagement";
import StaffSettings from "../Settings/StaffSettings";
import { Menu, X } from "lucide-react";
import { NotificationPage } from "../../Admin/Notifications/NotificationPage";
import { useNotifications } from "@/hooks/useNotifications";
import { getApi } from "@/utils/api";
import { registerStaffPushNotifications } from "@/utils/pushNotifications";

export const StaffLayout = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState("Dashboard"); // default matches sidebar label
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    handleMarkRead,
    handleMarkAllRead,
  } = useNotifications();

  useEffect(() => {
    registerStaffPushNotifications(getApi()).catch((error) => {
      console.error("Error registering push notifications:", error.response?.data || error.message);
    });
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case "Attendance":
        return <StaffAttendance />;
      case "Leave Management":
        return <StaffLeaveManagement />;
      case "Settings":
        return <StaffSettings />;
      case "Notifications":
        return (
          <NotificationPage
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />
        );
      case "Dashboard":
      default:
        // Show Attendance on Dashboard per requirement
        return <StaffAttendance />;
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-100">
      {/* Header */}
      <StaffHeader
        user={user}
        unreadCount={unreadCount}
        onMenuToggle={() => setMobileOpen((prev) => !prev)}
        onBellClick={() => setActivePage("Notifications")}
        onLogout={onLogout}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <StaffSidebar
          activeItem={activePage}
          onItemClick={(label) => {
            setActivePage(label);
            // close mobile drawer after navigation
            if (mobileOpen) setMobileOpen(false);
          }}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          unreadCount={unreadCount}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Main content */}
        <main className="app-main relative">
          {/* Floating Hamburger / X button */}
          <div className="mb-4">
            <button
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              onClick={() =>
                window.innerWidth < 1024
                  ? setMobileOpen((prev) => !prev)
                  : setCollapsed((prev) => !prev)
              }
            >
              {window.innerWidth < 1024 ? (
                mobileOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )
              ) : collapsed ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          {renderContent()}
        </main>
      </div>
      </div>
    
  );
};

export default StaffLayout;
