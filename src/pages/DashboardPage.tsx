
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { QueueDashboard } from "@/components/employee/QueueDashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Users, LineChart } from "lucide-react";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || "employee";
  const isAdmin = userRole === "admin";
  
  return (
    <Layout userRole={userRole as "employee" | "admin"}>
      {isAdmin ? (
        <Tabs defaultValue="queue" className="w-full">
          <Card className="mb-4">
            <CardContent className="pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="queue" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>การจัดการคิว</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span>การวิเคราะห์</span>
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
          
          <TabsContent value="queue" className="mt-0">
            <QueueDashboard />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      ) : (
        <QueueDashboard />
      )}
    </Layout>
  );
};

export default DashboardPage;
