import React, { useState, useEffect } from "react";
import FranchiseHeader from "../Layout/FranchiseHeader";
import { FranchiseSidebar } from "../Layout/FranchiseSidebar";
import DashboardContent from "../Dashboard/DashboardContent";
import StaffManagement from "../staff/StaffManagement";
import { NotificationPage } from "../Notifications/NotificationPage";
import StudentManagement from "../Student/StudentManagement";
import CourseManagement from "../course/CourseManagement";
import BatchManagement from "../Batches/BatchManagement";
import AttendanceSystem from "../AttendanceSystem/AttendanceSystem";
import ProgressReports from "../Progress and Reports/ProgressReports";
import EventsDashboard from "../Events&Workshop/EventsDashboard";
import FeedbackPage from "../Feedback/FeedbackPage";
import FranchiseProfile from "../Profile/FranchiseProfile";
import FranchiseSetting from "../Setting/FranchiseSetting";
import StudentAttendance from "../AttendanceSystem/Stud_Attendance";
import FranchiseLeaveManagement from "../Leave/FranchiseLeaveManagement";
import { Menu, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import InventoryStock from "../../Inventory/InventoryStock";

export default function FranchiseLayout({ user, onLogout, branch }) {
const [activePage, setActivePage] = useState("Dashboard");
const [mobileOpen, setMobileOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
const [collapsed, setCollapsed] = useState(false);
const [data, setData] = useState("");

const {
notifications,
unreadCount,
handleMarkRead,
handleMarkAllRead,
} = useNotifications();

useEffect(() => {
const handleResize = () => setIsMobile(window.innerWidth < 1024);
window.addEventListener("resize", handleResize);
return () => window.removeEventListener("resize", handleResize);
}, []);

const renderContent = () => {
switch (activePage) {
case "Dashboard":
return <DashboardContent />;
case "Staff Management":
return <StaffManagement />;
case "Student Management":
return <StudentManagement />;
case "Course Management":
return <CourseManagement />;
case "Batch Management":
return <BatchManagement user={user} />;
case "Inventory Stock":
return <InventoryStock scope="franchise" />;
case "Staff Attendance":
return <AttendanceSystem />;
case "Student Attendance":
return <StudentAttendance />;
case "Leave Management":
return <FranchiseLeaveManagement />;
case "Progress & Reports":
return <ProgressReports />;
case "Events & Workshops":
return <EventsDashboard />;
case "Feedback":
return <FeedbackPage />;
case "Notifications":
return ( <NotificationPage
         notifications={notifications}
         onMarkRead={handleMarkRead}
         onMarkAllRead={handleMarkAllRead}
       />
);
case "Settings":
return <FranchiseSetting />;
case "profile":
return <FranchiseProfile user={user} />;
default:
return <DashboardContent />;
}
};

return ( <div className="flex h-dvh flex-col overflow-hidden bg-gray-100">
{/* Header */}
<FranchiseHeader
email_user={user?.email}
onLogout={onLogout}
onNotificationsClick={() => setActivePage("Notifications")}
unreadCount={unreadCount}
onGoHome={() => setActivePage("Dashboard")}
onMenuToggle={() => setMobileOpen((prev) => !prev)}
sentDataToLayout={setData}
/>

  {/* Main Layout */}
  <div className="relative flex min-h-0 flex-1 overflow-hidden pt-16">
    {/* Sidebar */}
    <FranchiseSidebar
      activeItem={activePage}
      onItemClick={setActivePage}
      collapsed={!isMobile && collapsed}
      unreadCount={unreadCount}
      mobileOpen={mobileOpen}
      onClose={() => setMobileOpen(false)}
    />

    {/* Main Content */}
    <main
      className={`app-main transition-all duration-300 ${
        isMobile
          ? "ml-0"
          : collapsed
          ? "ml-16"
          : "ml-64" // ✅ Shifts content right based on sidebar width
      }`}
    >
      {/* Top Buttons */}
      <div className="mb-4 flex items-center gap-2">
        {/* Mobile Menu Button */}
        <button
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>

        {/* Desktop Collapse Button */}
        {!isMobile && (
          <button
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        )}
      </div>

      {/* Render Dynamic Page */}
      {renderContent()}
    </main>
  </div>
</div>

);
}
