
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

const AnalyticsPage: React.FC = () => {
  return (
    <Layout userRole="admin">
      <AnalyticsDashboard />
    </Layout>
  );
};

export default AnalyticsPage;
