import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Users, Settings, BarChart4, Clock, UserPlus, List } from "lucide-react";
type SidebarProps = {
  userRole: "employee" | "admin";
};
type NavItem = {
  title: string;
  icon: React.ElementType;
  href: string;
  roles: Array<"employee" | "admin">;
};
const navItems: NavItem[] = [{
  title: "แดชบอร์ดคิว",
  icon: List,
  href: "/dashboard",
  roles: ["employee", "admin"]
}, {
  title: "ให้บริการลูกค้า",
  icon: Users,
  href: "/serve",
  roles: ["employee", "admin"]
}, {
  title: "ลงทะเบียนลูกค้าหน้าร้าน",
  icon: UserPlus,
  href: "/register-walkin",
  roles: ["employee", "admin"]
}, {
  title: "ประวัติคิว",
  icon: Clock,
  href: "/history",
  roles: ["employee", "admin"]
}, {
  title: "การวิเคราะห์",
  icon: BarChart4,
  href: "/analytics",
  roles: ["admin"]
}, {
  title: "จัดการบริการ",
  icon: Calendar,
  href: "/services",
  roles: ["admin"]
}, {
  title: "ตั้งค่าระบบ",
  icon: Settings,
  href: "/settings",
  roles: ["admin"]
}];
export const Sidebar: React.FC<SidebarProps> = ({
  userRole
}) => {
  const [collapsed, setCollapsed] = useState(false);
  return <div className={cn("bg-com7-primary-dark text-white transition-all duration-300 flex flex-col h-full", collapsed ? "w-16" : "w-64")}>
      <div className="p-4 flex items-center justify-between border-b border-blue-600">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
          {collapsed ? <span className="text-2xl font-bold">C7</span> : <div className="flex flex-col">
              <span className="text-xl font-bold">Studio 7 westgate</span>
              <span className="text-xs font-light text-blue-200">
                {userRole === "admin" ? "ระบบผู้ดูแล" : "ระบบพนักงาน"}
              </span>
            </div>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className={collapsed ? "hidden" : "text-white hover:text-blue-200"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {collapsed ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />}
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map(item => {
          if (!item.roles.includes(userRole)) return null;
          return <li key={item.href}>
                <NavLink to={item.href} className={({
              isActive
            }) => cn("flex items-center py-2 px-4 transition duration-200", isActive ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800", collapsed && "justify-center")}>
                  <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </li>;
        })}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-600 flex items-center">
        {collapsed ? <button onClick={() => setCollapsed(!collapsed)} className="mx-auto text-blue-100 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            </svg>
          </button> : <div className="w-full text-xs text-blue-200">
            <p>© 2025 Kitti Nipidchayanun</p>
            <p>v1.0.0</p>
          </div>}
      </div>
    </div>;
};