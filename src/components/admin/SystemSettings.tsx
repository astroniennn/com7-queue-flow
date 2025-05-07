
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { GeneralSettings } from "./settings/GeneralSettings";
import { QueueSettings } from "./settings/QueueSettings";
import { DisplaySettings } from "./settings/DisplaySettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { useToast } from "@/hooks/use-toast";

export const SystemSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ตั้งค่าระบบ</h1>
        <p className="text-gray-500">จัดการการตั้งค่าระบบการจองคิวและการให้บริการ</p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">ตั้งค่าทั่วไป</TabsTrigger>
          <TabsTrigger value="queue">ตั้งค่าคิว</TabsTrigger>
          <TabsTrigger value="display">ตั้งค่าการแสดงผล</TabsTrigger>
          <TabsTrigger value="notification">เสียงแจ้งเตือน</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <GeneralSettings />
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card className="p-6">
            <QueueSettings />
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card className="p-6">
            <DisplaySettings />
          </Card>
        </TabsContent>

        <TabsContent value="notification">
          <Card className="p-6">
            <NotificationSettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
