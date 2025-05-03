
import React from "react";
import { Users, Info, Calendar } from "lucide-react";

type QueueInfoProps = {
  queueData: {
    name: string;
    serviceType: string;
    registeredAt: string;
  };
};

export const QueueInfo: React.FC<QueueInfoProps> = ({ queueData }) => {
  const registrationTime = new Date(queueData.registeredAt).toLocaleTimeString();
  const registrationDate = new Date(queueData.registeredAt).toLocaleDateString();

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Users className="h-5 w-5 text-com7-primary mr-2" />
        <div>
          <div className="text-sm text-gray-500">ชื่อ</div>
          <div className="font-medium">{queueData.name}</div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Info className="h-5 w-5 text-com7-primary mr-2" />
        <div>
          <div className="text-sm text-gray-500">บริการ</div>
          <div className="font-medium">{queueData.serviceType}</div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Calendar className="h-5 w-5 text-com7-primary mr-2" />
        <div>
          <div className="text-sm text-gray-500">ลงทะเบียนเมื่อ</div>
          <div className="font-medium">{registrationDate} เวลา {registrationTime}</div>
        </div>
      </div>
    </div>
  );
};
