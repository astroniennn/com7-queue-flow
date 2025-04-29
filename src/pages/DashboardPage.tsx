
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { QueueDashboard } from "@/components/employee/QueueDashboard";

const DashboardPage: React.FC = () => {
  return (
    <Layout userRole="employee">
      <QueueDashboard />
    </Layout>
  );
};

export default DashboardPage;
