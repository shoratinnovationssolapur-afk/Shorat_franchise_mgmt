import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./Header";
import { AdminSidebar } from "../Layout/AdminSidebar";
import { DashboardContent } from "../Dashboard/DashboardContent";
import FranchiseManagement from "../Franchise/FranchiseManagement";
import StaffManagement from "../staff/StaffManagement";
import { NotificationPage } from "../Notifications/NotificationPage";
import StudentManagement from "../Student/StudentManagement";
import CourseManagement from "../course/CourseManagement";
import BatchManagement from "../Batches/BatchManagement";
import AttendanceSystem from "../AttendanceSystem/AttendanceSystem";
import ReportAnalysis from "../Report and Analysis/ReportAnalysis";
import EventsWorkshop from "../Events&Workshop/EventsWorkshop";
import AdminProfile from "../Profile/AdminProfile";
import AdminSetting from "../Setting/AdminSetting";
import PaymentBilling from "../Payment&Billing/PaymentBilling";
import StudentAttendanceList from "../AttendanceSystem/StudentAttendance";
import AdminLeaveManagement from "../Leave/AdminLeaveManagement";
import { useNotifications } from "@/hooks/useNotifications";
import InventoryStock from "../../Inventory/InventoryStock";

export default function AdminLayout({ onLogout, user }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    handleMarkRead,
    handleMarkAllRead,
  } = useNotifications();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-100">
      <div className="fixed left-0 right-0 top-0 z-50">
        <Header
          onNotificationsClick={() => navigate("/admin/notifications")}
          unreadCount={unreadCount}
          onGoHome={() => navigate("/admin/dashboard")}
          onLogout={onLogout}
          email_user={user?.email}
          onMenuToggle={() => setMobileOpen(true)}
        />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden pt-16">
        <AdminSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          unreadCount={unreadCount}
        />

        <main className="app-main">
          <Routes>
            <Route path="dashboard" element={<DashboardContent />} />
            <Route path="settings" element={<AdminSetting />} />
            <Route path="franchise" element={<FranchiseManagement />} />
            <Route path="course" element={<CourseManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="student" element={<StudentManagement />} />
            <Route path="payments" element={<PaymentBilling />} />
            <Route path="batch" element={<BatchManagement />} />
            <Route path="inventory" element={<InventoryStock scope="admin" />} />
            <Route path="attendance" element={<AttendanceSystem />} />
            <Route path="reports" element={<ReportAnalysis />} />
            <Route path="events" element={<EventsWorkshop />} />
            <Route path="stud_attendance" element={<StudentAttendanceList />} />
            <Route path="leave" element={<AdminLeaveManagement />} />
            <Route
              path="notifications"
              element={
                <NotificationPage
                  notifications={notifications}
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead}
                />
              }
            />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
