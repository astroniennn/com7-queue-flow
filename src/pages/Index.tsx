
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueueRegistration } from "@/components/customer/QueueRegistration";
import { QueueCheck } from "@/components/customer/QueueCheck";

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("join-queue");
  
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container px-4 py-12 mx-auto">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/bb7a1797-5dca-4065-a245-f85472a93bf9.png" 
              alt="Studio 7 Logo" 
              className="h-32 mb-4" 
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ยินดีต้อนรับสู่ <span className="text-green-600">Studio7 Central PlazaWestgate</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">ลงทะเบียนคิวออนไลน์และเราจะแจ้งเตือนเมื่อถึงคิวของคุณ</p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join-queue">จองคิว</TabsTrigger>
              <TabsTrigger value="check-status">ตรวจสอบสถานะ</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="join-queue" className="mt-0">
                <QueueRegistration />
              </TabsContent>
              <TabsContent value="check-status" className="mt-0">
                <QueueCheck />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-com7-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">ประหยัดเวลา</h3>
              <p className="text-gray-600 text-sm">
                จองคิวจากระยะไกลและมาถึงพอดีเมื่อถึงเวลารับบริการ
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-com7-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">อัปเดตแบบเรียลไทม์</h3>
              <p className="text-gray-600 text-sm">
                รับการแจ้งเตือนเกี่ยวกับสถานะคิวและเวลารอโดยประมาณของคุณ
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-com7-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">ปลอดภัยและเป็นส่วนตัว</h3>
              <p className="text-gray-600 text-sm">
                ข้อมูลของคุณจะถูกเก็บไว้อย่างปลอดภัยและใช้เฉพาะสำหรับการจัดการคิวเท่านั้น
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white py-8 border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">© 2025 Kitti Nipidchayanun สงวนลิขสิทธิ์</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">เกี่ยวกับเรา</Button>
              <Button variant="ghost" size="sm">ความเป็นส่วนตัว</Button>
              <Button variant="ghost" size="sm">เงื่อนไขการใช้งาน</Button>
              <Button variant="ghost" size="sm">ติดต่อเรา</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;
