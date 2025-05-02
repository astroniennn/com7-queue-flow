
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, User } from "lucide-react";

type HeaderProps = {
  userRole?: "customer" | "employee" | "admin";
};

export const Header: React.FC<HeaderProps> = ({ userRole = "customer" }) => {
  const navigate = useNavigate();

  const getHeaderTitle = () => {
    switch (userRole) {
      case "employee":
        return "ระบบจัดการคิว";
      case "admin":
        return "แผงควบคุมผู้ดูแลระบบ";
      default:
        return "ยินดีต้อนรับสู่ Studio 7 QUEUE";
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-4">
        {userRole === "customer" && (
          <img 
            src="/lovable-uploads/bb7a1797-5dca-4065-a245-f85472a93bf9.png" 
            alt="Studio 7 Logo" 
            className="h-8 mr-2" 
          />
        )}
        <h1 className="text-xl font-semibold text-gray-800">{getHeaderTitle()}</h1>
      </div>

      <div className="flex items-center space-x-3">
        {userRole !== "customer" ? (
          <>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="h-6 border-l border-gray-300 mx-2"></div>
            <div className="flex items-center space-x-2">
              <div className="bg-com7-primary rounded-full p-1">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium hidden md:inline-block">
                {userRole === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"}
              </span>
            </div>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLoginClick}
          >
            เข้าสู่ระบบสำหรับพนักงาน
          </Button>
        )}
      </div>
    </header>
  );
};
