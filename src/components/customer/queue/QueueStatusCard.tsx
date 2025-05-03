
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QueueInfo } from "./QueueInfo";
import { QueueProgress } from "./QueueProgress";
import { QueueActions } from "./QueueActions";

type QueueStatusCardProps = {
  queueData: {
    ticketNumber: number;
    name: string;
    phoneNumber: string;
    serviceType: string;
    registeredAt: string;
    estimatedWaitTime: number;
    position: number;
    status: "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped";
  };
  updateQueueData: (updatedData: any) => void;
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "waiting":
      return {
        title: "รอคิว",
        description: "คุณกำลังรอคิวอยู่ กรุณารอจนกว่าจะถึงคิวของคุณ",
        color: "bg-amber-500"
      };
    case "almost":
      return {
        title: "ใกล้ถึงคิวของคุณแล้ว",
        description: "กรุณามาที่พื้นที่รอ เราจะเรียกคุณในไม่ช้า",
        color: "bg-blue-500"
      };
    case "serving":
      return {
        title: "กำลังให้บริการ",
        description: "กรุณามาที่เคาน์เตอร์บริการทันที",
        color: "bg-com7-primary"
      };
    case "completed":
      return {
        title: "บริการเสร็จสิ้น",
        description: "ขอบคุณที่มาใช้บริการ",
        color: "bg-green-500"
      };
    case "cancelled":
      return {
        title: "ยกเลิกแล้ว",
        description: "คิวของคุณถูกยกเลิกแล้ว",
        color: "bg-red-500"
      };
    case "skipped":
      return {
        title: "ข้ามคิว",
        description: "คิวของคุณถูกข้าม กรุณาติดต่อพนักงาน",
        color: "bg-purple-500"
      };
    default:
      return {
        title: "สถานะไม่ทราบ",
        description: "กรุณาติดต่อพนักงานเพื่อขอความช่วยเหลือ",
        color: "bg-gray-500"
      };
  }
};

export const QueueStatusCard: React.FC<QueueStatusCardProps> = ({ queueData, updateQueueData }) => {
  const statusInfo = getStatusInfo(queueData.status);
  
  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader className={`${statusInfo.color} text-white rounded-t-lg`}>
        <CardTitle className="text-center text-2xl font-bold">
          {statusInfo.title}
        </CardTitle>
        <CardDescription className="text-center text-white/90">
          {statusInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-center px-4 py-2 bg-com7-light-gray rounded-lg flex-1 mr-2">
            <div className="text-sm text-gray-500">คิวหมายเลข</div>
            <div className="font-bold text-xl">{queueData.ticketNumber}</div>
          </div>
          <div className="text-center px-4 py-2 bg-com7-light-gray rounded-lg flex-1 ml-2">
            <div className="text-sm text-gray-500">ตำแหน่งคิว</div>
            <div className="font-bold text-xl">{queueData.position}</div>
          </div>
        </div>
        
        <QueueInfo queueData={queueData} />
        
        {queueData.status === "waiting" && (
          <QueueProgress 
            estimatedWaitTime={queueData.estimatedWaitTime} 
            position={queueData.position} 
          />
        )}
      </CardContent>
      
      {queueData.status === "waiting" && (
        <CardFooter className="flex justify-between space-x-4">
          <QueueActions 
            queueData={queueData}
            updateQueueData={updateQueueData}
          />
        </CardFooter>
      )}
    </Card>
  );
};
