
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { WalkInRegistration } from "@/components/employee/WalkInRegistration";

const WalkInPage: React.FC = () => {
  return (
    <Layout userRole="employee">
      <WalkInRegistration />
    </Layout>
  );
};

export default WalkInPage;
