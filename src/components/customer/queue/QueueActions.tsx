
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type QueueActionsProps = {
  queueData: {
    ticketNumber: number;
    status: string;
  };
  updateQueueData: (updatedData: any) => void;
};

export const QueueActions: React.FC<QueueActionsProps> = ({ queueData, updateQueueData }) => {
  const navigate = useNavigate();

  const handleCancel = async () => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ status: 'cancelled' })
        .eq('ticket_number', queueData.ticketNumber);
      
      if (error) throw error;
      
      // Update local queue data
      updateQueueData({
        ...queueData,
        status: 'cancelled'
      });
      
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
    <>
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
    </>
  );
};
