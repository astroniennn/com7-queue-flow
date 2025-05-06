
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Users, 
  Settings, 
  BarChart4, 
  Clock, 
  UserPlus, 
  List,
  RefreshCw,
  LayoutDashboard,
  History 
} from "lucide-react";
import { TooltipProvider, Tooltip } from "@radix-ui/react-tooltip";

type SidebarProps = {
  userRole: "employee" | "admin";
};

type NavItem = {
  title: string;
  icon: React.ElementType;
  href: string;
  hash?: string;
  roles: Array<"employee" | "admin">;
};

const navItems: NavItem[] = [
  {
    title: "การจัดการคิว",
    icon: LayoutDashboard,
    href: "/dashboard",
    hash: "#queue",
    roles: ["employee", "admin"]
  }, 
  {
    title: "ให้บริการลูกค้า",
    icon: Users,
    href: "/dashboard",
    hash: "#service",
    roles: ["employee", "admin"]
  }, 
  {
    title: "ลงทะเบียนลูกค้าหน้าร้าน",
    icon: UserPlus,
    href: "/register-walkin",
    roles: ["employee", "admin"]
  }, 
  {
    title: "ประวัติคิว",
    icon: History,
    href: "/dashboard",
    hash: "#history",
    roles: ["employee", "admin"]
  }, 
  {
    title: "การวิเคราะห์",
    icon: BarChart4,
    href: "/dashboard",
    hash: "#analytics",
    roles: ["admin"]
  }, 
  {
    title: "จัดการบริการ",
    icon: Calendar,
    href: "/services",
    roles: ["admin"]
  }, 
  {
    title: "ตั้งค่าระบบ",
    icon: Settings,
    href: "/dashboard",
    hash: "#settings",
    roles: ["admin"]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  userRole
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  // Function to determine if the link is active based on the current path and hash
  const isPathActive = (path: string, hash?: string) => {
    if (hash) {
      return location.pathname === path && (location.hash === hash || (!location.hash && hash === '#queue'));
    }
    return location.pathname === path;
  };
  
  return (
    <div className={cn("bg-com7-primary-dark text-white transition-all duration-300 flex flex-col h-full", collapsed ? "w-16" : "w-64")}>
      <div className="p-4 flex items-center justify-between border-b border-blue-600">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
          {collapsed ? (
            <img 
              src="/lovable-uploads/bb7a1797-5dca-4065-a245-f85472a93bf9.png" 
              alt="Studio 7 Logo" 
              className="h-8" 
            />
          ) : (
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/bb7a1797-5dca-4065-a245-f85472a93bf9.png" 
                alt="Studio 7 Logo" 
                className="h-10" 
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold">Studio 7 westgate</span>
                <span className="text-xs font-light text-blue-200">
                  {userRole === "admin" ? "ระบบผู้ดูแล" : "ระบบพนักงาน"}
                </span>
              </div>
            </div>
          )}
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
            const fullHref = item.hash ? `${item.href}${item.hash}` : item.href;
            
            return <li key={fullHref}>
                  <NavLink 
                    to={fullHref} 
                    className={({isActive}) => cn(
                      "flex items-center py-2 px-4 transition duration-200", 
                      isPathActive(item.href, item.hash) ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800", 
                      collapsed && "justify-center"
                    )}
                  >
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
    </div>
  );
};
