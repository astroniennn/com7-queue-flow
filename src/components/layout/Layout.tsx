
import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";

type LayoutProps = {
  children: React.ReactNode;
  userRole?: "customer" | "employee" | "admin";
};

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userRole: propUserRole 
}) => {
  const { user } = useAuth();
  
  // Use the role from auth context if available, otherwise use the prop
  const userRole = user?.role || propUserRole || "customer";

  return (
    <div className="flex h-screen bg-gray-50">
      {userRole !== "customer" && (
        <Sidebar userRole={userRole as "employee" | "admin"} />
      )}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
