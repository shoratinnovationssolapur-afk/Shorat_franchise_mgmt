import {
Users,
GraduationCap,
BookOpen,
Calendar,
ClipboardCheck,
CalendarCheck,
TrendingUp,
Home,
X,
Settings,
Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const FranchiseSidebar = ({
activeItem,
onItemClick,
collapsed = false,
unreadCount = 0,
mobileOpen,
onClose,
}) => {
const menuItems = [
{ icon: Home, label: "Dashboard" },
{ icon: Users, label: "Staff Management" },
{ icon: GraduationCap, label: "Student Management" },
{ icon: BookOpen, label: "Course Management" },
{ icon: Calendar, label: "Batch Management" },
{ icon: Package, label: "Inventory Stock" },
{ icon: ClipboardCheck, label: "Staff Attendance" },
{ icon: ClipboardCheck, label: "Student Attendance" },
{ icon: CalendarCheck, label: "Leave Management" },
{ icon: TrendingUp, label: "Progress & Reports" },
{ icon: Calendar, label: "Events & Workshops" },
{ icon: Settings, label: "Settings" },
];

const MenuItem = ({ item }) => (
<Button
variant={activeItem === item.label ? "default" : "ghost"}
className={cn(
"w-full justify-start mb-1 relative group hover:text-red-600 text-sm",
collapsed ? "px-2" : "px-4",
activeItem === item.label &&
"bg-[#f0000b] hover:bg-[#fd3535] text-white shadow-md"
)}
onClick={() => onItemClick(item.label)}
>
<item.icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
{!collapsed && ( <span className="flex-1 text-left truncate">{item.label}</span>
)} </Button>
);

return (
<>
{/* Desktop Sidebar */}
<aside
className={cn(
"hidden md:flex flex-col bg-white border-r border-gray-200 fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 shadow-md transition-all duration-300",
collapsed ? "w-16" : "w-64"
)}
> <div className="p-4 overflow-y-auto flex-1"> <div className="space-y-1">
{menuItems.map((item, i) => ( <MenuItem key={i} item={item} />
))} </div> </div> </aside>

  {/* Mobile Sidebar */}
  {mobileOpen && (
    <div className="fixed inset-0 z-50 md:hidden flex">
      <div className="relative h-full w-[min(18rem,85vw)] overflow-y-auto bg-white shadow-lg">
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
      <div
        className="flex-1 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
    </div>
  )}
</>

);
};
