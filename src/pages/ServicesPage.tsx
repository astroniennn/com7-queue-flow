
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { ServiceManagement } from "@/components/admin/ServiceManagement";

const ServicesPage: React.FC = () => {
  return (
    <Layout userRole="admin">
      <ServiceManagement />
    </Layout>
  );
};

export default ServicesPage;
