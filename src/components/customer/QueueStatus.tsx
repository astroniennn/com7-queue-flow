import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Clock, Users, Calendar, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type QueueStatusProps = {
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

export const QueueStatus: React.FC<QueueStatusProps> = ({ queueData }) => {
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState<number>(queueData.estimatedWaitTime * queueData.position);
  const [elapsedPercent, setElapsedPercent] = useState<number>(0);
  const [refreshedData, setRefreshedData] = useState(queueData);
  
  // Real-time updates
  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('queue')
          .select(`
            ticket_number,
            name,
            phone_number,
            registered_at,
            estimated_wait_time,
            status,
            service_types(name)
          `)
          .eq('ticket_number', queueData.ticketNumber)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Calculate position based on waiting tickets with lower numbers
          const { data: waitingBefore, error: countError } = await supabase
            .from('queue')
            .select('ticket_number', { count: 'exact' })
            .eq('status', 'waiting')
            .lt('ticket_number', data.ticket_number);
          
          if (countError) throw countError;
          
          const position = (waitingBefore?.length || 0) + 1;
          
          // Make sure to type cast the status to the allowed literal types
          const status = data.status as "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped";
          
          setRefreshedData({
            ticketNumber: data.ticket_number,
            name: data.name,
            phoneNumber: data.phone_number,
            serviceType: data.service_types.name,
            registeredAt: data.registered_at,
            estimatedWaitTime: data.estimated_wait_time,
            position: position,
            status: status
          });
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสถานะคิว:", error);
      }
    };

    fetchQueueStatus();
    
    // เปลี่ยนวิธีการตั้งค่า Realtime subscription แบบใหม่ที่ถูกต้อง
    const channel = supabase
      .channel(`queue_updates_${queueData.ticketNumber}`)
      .on(
        'postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'queue', 
          filter: `ticket_number=eq.${queueData.ticketNumber}`
        }, 
        (payload) => {
          console.log("ได้รับการอัพเดตข้อมูลคิวแบบเรียลไทม์:", payload);
          fetchQueueStatus();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueData.ticketNumber]);
  
  const statusInfo = getStatusInfo(refreshedData.status);
  const registrationTime = new Date(refreshedData.registeredAt).toLocaleTimeString();
  const registrationDate = new Date(refreshedData.registeredAt).toLocaleDateString();
  
  // For time calculation
  useEffect(() => {
    if (refreshedData.status !== "waiting") return;
    
    const totalWaitTime = refreshedData.estimatedWaitTime * refreshedData.position;
    setRemainingTime(totalWaitTime);
    
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [refreshedData.estimatedWaitTime, refreshedData.position, refreshedData.status]);
  
  // Calculate progress percentage
  useEffect(() => {
    const totalWaitTime = refreshedData.estimatedWaitTime * refreshedData.position;
    const elapsed = totalWaitTime - remainingTime;
    const percent = (elapsed / totalWaitTime) * 100;
    setElapsedPercent(Math.min(percent, 100));
  }, [remainingTime, refreshedData.estimatedWaitTime, refreshedData.position]);
  
  const handleCancel = async () => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ status: 'cancelled' })
        .eq('ticket_number', refreshedData.ticketNumber);
      
      if (error) throw error;
      
      toast.success("ยกเลิกคิวเรียบร้อยแล้ว");
      navigate("/");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการยกเลิกคิว:", error);
      toast.error("ไม่สามารถยกเลิกได้ กรุณาลองใหม่อีกครั้ง");
    }
  };
  
  const handleReschedule = () => {
    navigate("/", { state: { reschedule: true } });
  };

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
            <div className="font-bold text-xl">{refreshedData.ticketNumber}</div>
          </div>
          <div className="text-center px-4 py-2 bg-com7-light-gray rounded-lg flex-1 ml-2">
            <div className="text-sm text-gray-500">ตำแหน่งคิว</div>
            <div className="font-bold text-xl">{refreshedData.position}</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-com7-primary mr-2" />
            <div>
              <div className="text-sm text-gray-500">ชื่อ</div>
              <div className="font-medium">{refreshedData.name}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Info className="h-5 w-5 text-com7-primary mr-2" />
            <div>
              <div className="text-sm text-gray-500">บริการ</div>
              <div className="font-medium">{refreshedData.serviceType}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-com7-primary mr-2" />
            <div>
              <div className="text-sm text-gray-500">ลงทะเบียนเมื่อ</div>
              <div className="font-medium">{registrationDate} เวลา {registrationTime}</div>
            </div>
          </div>
          
          {refreshedData.status === "waiting" && (
            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-com7-primary mr-2" />
                <div>
                  <div className="text-sm text-gray-500">เวลารอโดยประมาณ</div>
                  <div className="font-medium">{remainingTime} นาที</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>ความคืบหน้า</span>
                  <span>{Math.round(elapsedPercent)}%</span>
                </div>
                <Progress value={elapsedPercent} className="h-2" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {refreshedData.status === "waiting" && (
        <CardFooter className="flex justify-between space-x-4">
          <Button
            variant="outline"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            onClick={handleCancel}
          >
            ยกเลิก
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-com7-primary text-com7-primary hover:bg-blue-50"
            onClick={handleReschedule}
          >
            เปลี่ยนเวลา
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
