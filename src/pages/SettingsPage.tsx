
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { SystemSettings } from "@/components/admin/SystemSettings";

const SettingsPage: React.FC = () => {
  return (
    <Layout userRole="admin">
      <SystemSettings />
    </Layout>
  );
};

export default SettingsPage;
