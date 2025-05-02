
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { useAuth } from "@/contexts/AuthContext";

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Layout userRole={user?.role as "employee" | "admin"}>
      <AnalyticsDashboard />
    </Layout>
  );
};

export default AnalyticsPage;
