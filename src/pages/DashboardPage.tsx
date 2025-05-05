
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { QueueDashboard } from "@/components/employee/QueueDashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Users, LineChart, History, Settings as SettingsIcon } from "lucide-react";

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
  const isAdmin = userRole === "admin";
  const [activeTab, setActiveTab] = useState("queue");
  
  return (
    <Layout userRole={userRole as "employee" | "admin"}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>การจัดการคิว</span>
              </TabsTrigger>
              <TabsTrigger value="service" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>ให้บริการลูกค้า</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>ประวัติคิว</span>
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    <span>การวิเคราะห์</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    <span>ตั้งค่าระบบ</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </CardContent>
        </Card>
        
        <TabsContent value="queue" className="mt-0">
          <QueueDashboard />
        </TabsContent>
        
        <TabsContent value="service" className="mt-0">
          <CustomerServiceDashboard />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <QueueHistoryDashboard />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
          <AnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <SystemSettingsDashboard />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default DashboardPage;
