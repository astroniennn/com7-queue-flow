
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { QueueDashboard } from "@/components/employee/QueueDashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

// Placeholder components for the tabs that aren't yet implemented
const CustomerServiceDashboard = () => (
  <div className="p-6 bg-white rounded-md shadow">
    <h2 className="text-2xl font-bold mb-4">ให้บริการลูกค้า</h2>
    <p className="text-gray-500">ระบบให้บริการลูกค้าอยู่ระหว่างการพัฒนา พร้อมให้บริการเร็วๆ นี้</p>
  </div>
);

const QueueHistoryDashboard = () => (
  <div className="p-6 bg-white rounded-md shadow">
    <h2 className="text-2xl font-bold mb-4">ประวัติคิว</h2>
    <p className="text-gray-500">ระบบประวัติคิวอยู่ระหว่างการพัฒนา พร้อมให้บริการเร็วๆ นี้</p>
  </div>
);

const SystemSettingsDashboard = () => (
  <div className="p-6 bg-white rounded-md shadow">
    <h2 className="text-2xl font-bold mb-4">ตั้งค่าระบบ</h2>
    <p className="text-gray-500">ระบบตั้งค่าอยู่ระหว่างการพัฒนา พร้อมให้บริการเร็วๆ นี้</p>
  </div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || "employee";
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the hash part from the URL or default to 'queue'
  const currentTab = location.hash.slice(1) || 'queue';
  
  // Render the appropriate dashboard based on the hash
  const renderDashboard = () => {
    switch (currentTab) {
      case 'service':
        return <CustomerServiceDashboard />;
      case 'history':
        return <QueueHistoryDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'settings':
        return <SystemSettingsDashboard />;
      case 'queue':
      default:
        return <QueueDashboard />;
    }
  };
  
  return (
    <Layout userRole={userRole as "employee" | "admin"}>
      <div className="w-full">
        {renderDashboard()}
      </div>
    </Layout>
  );
};

export default DashboardPage;
