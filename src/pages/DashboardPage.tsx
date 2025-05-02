
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { QueueDashboard } from "@/components/employee/QueueDashboard";
import { useAuth } from "@/contexts/AuthContext";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || "employee";
  
  return (
    <Layout userRole={userRole as "employee" | "admin"}>
      <QueueDashboard />
    </Layout>
  );
};

export default DashboardPage;
