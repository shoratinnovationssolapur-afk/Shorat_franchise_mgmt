import {
  Building2,
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  Calendar,
  FileText,
  Star,
  Bell,
  Home,
  X,
  ClipboardCheck,
  CalendarCheck,
  Settings,
  User,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

export const AdminSidebar = ({
  collapsed = false,
  mobileOpen,
  onClose,
}) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "dashboard" },
    { icon: Bell, label: "Notifications", path: "notifications" },
    { icon: Building2, label: "Franchise Management", path: "franchise" },
    { icon: CreditCard, label: "Payments & Billing", path: "payments" },
    { icon: Users, label: "Staff Management", path: "staff" },
    { icon: Users, label: "Student Management", path: "student" },
    { icon: BookOpen, label: "Course Management", path: "course" },
    { icon: BookOpen, label: "Batch Management", path: "batch" },
    { icon: Package, label: "Inventory Stock", path: "inventory" },
    { icon: ClipboardCheck, label: "Staff Attendance", path: "attendance" },
    { icon: ClipboardCheck, label: "Student Attendance", path: "stud_attendance" },
    { icon: CalendarCheck, label: "Leave Management", path: "leave" },
    { icon: FileText, label: "Reports & Analytics", path: "reports" },
    { icon: Calendar, label: "Events & Workshops", path: "events" },
    { icon: Settings, label: "Settings", path: "settings" },
  ];

  const MenuItem = ({ item }) => (
    <NavLink
      to={`/admin/${item.path}`}
      className={({ isActive }) =>
        cn(
          "mb-1 flex w-full items-center justify-start rounded-md px-3 py-2 text-sm transition",
          collapsed ? "px-2" : "px-3",
          isActive
            ? "bg-[#f0000b] text-white shadow-md"
            : "hover:text-red-600 hover:bg-gray-100"
        )
      }
      onClick={onClose} // close on mobile
    >
      <item.icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
      {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
    </NavLink>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-full w-64 shrink-0 overflow-y-auto bg-card border-r border-border shadow-soft md:block">
        <div className="space-y-1 p-4">
          {menuItems.map((item, i) => (
            <MenuItem key={i} item={item} />
          ))}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden flex transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Sidebar panel */}
        <div
          className={cn(
            "relative h-full w-[min(18rem,85vw)] transform overflow-y-auto bg-card p-4 shadow-lg transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="mt-10 space-y-1">
            {menuItems.map((item, i) => (
              <MenuItem key={i} item={item} />
            ))}
          </div>
        </div>

        {/* Overlay */}
        <div
          className="flex-1 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={onClose}
        ></div>
      </div>
    </>
  );
};
