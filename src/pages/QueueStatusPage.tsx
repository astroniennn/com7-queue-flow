
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QueueStatus } from "@/components/customer/QueueStatus";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle, Bell } from "lucide-react";

const QueueStatusPage: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState(location.state?.queueData);
  
  // If there's no location state, fetch the queue data from Supabase
  useEffect(() => {
    const fetchQueueData = async () => {
      if (location.state?.queueData) {
        setLoading(false);
        return;
      }
      
      try {
        const ticketId = params.ticketId;
        
        if (!ticketId) {
          navigate("/");
          return;
        }
        
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
          .eq('ticket_number', parseInt(ticketId))
          .single();
        
        if (error) {
          toast.error("ไม่พบข้อมูลคิวที่ค้นหา");
          setTimeout(() => navigate("/"), 3000);
          return;
        }
        
        // Calculate position based on waiting tickets with lower numbers
        const { data: waitingBefore, error: countError } = await supabase
          .from('queue')
          .select('ticket_number', { count: 'exact' })
          .eq('status', 'waiting')
          .lt('ticket_number', data.ticket_number);
        
        if (countError) throw countError;
        
        const position = (waitingBefore?.length || 0) + 1;
        
        setQueueData({
          ticketNumber: data.ticket_number,
          name: data.name,
          phoneNumber: data.phone_number,
          serviceType: data.service_types.name,
          registeredAt: data.registered_at,
          estimatedWaitTime: data.estimated_wait_time,
          position: position,
          status: data.status as "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped"
        });
      } catch (error) {
        console.error("Error fetching queue data:", error);
        toast.error("ไม่สามารถโหลดข้อมูลคิวได้");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQueueData();
  }, [location.state, params.ticketId, navigate]);

  // Set up real-time subscription for queue updates
  useEffect(() => {
    if (!queueData || !params.ticketId) return;
    
    // Set up real-time subscription for this specific ticket
    const channel = supabase
      .channel(`queue_updates_${params.ticketId}`)
      .on(
        'postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'queue',
          filter: `ticket_number=eq.${params.ticketId}` 
        }, 
        (payload) => {
          console.log("Queue status updated:", payload);
          // Show notification based on status change
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            if (payload.new.status === 'almost') {
              toast(
                <div className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-semibold">ใกล้ถึงคิวของคุณแล้ว</div>
                    <div className="text-sm">กรุณามาที่พื้นที่รอเรียกคิว</div>
                  </div>
                </div>,
                {
                  duration: 10000,
                }
              );
              // Play notification sound
              const audio = new Audio('/notification.mp3');
              audio.play().catch(e => console.log("Audio play error:", e));
            } else if (payload.new.status === 'serving') {
              toast(
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-semibold">ถึงคิวของคุณแล้ว!</div>
                    <div className="text-sm">กรุณามาที่เคาน์เตอร์บริการทันที</div>
                  </div>
                </div>,
                {
                  duration: 0, // Won't auto-dismiss
                }
              );
              // Play urgent notification sound
              const audio = new Audio('/urgent-notification.mp3');
              audio.play().catch(e => console.log("Audio play error:", e));
            }
          }
          
          // Refresh the queue data
          const ticketId = parseInt(params.ticketId);
          if (isNaN(ticketId)) return;
          
          // Update data without full page refresh
          const fetchUpdatedData = async () => {
            try {
              const { data: updatedData, error } = await supabase
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
                .eq('ticket_number', ticketId)
                .single();
              
              if (error) throw error;
              
              // Calculate position based on waiting tickets with lower numbers
              const { data: waitingBefore, error: countError } = await supabase
                .from('queue')
                .select('ticket_number', { count: 'exact' })
                .eq('status', 'waiting')
                .lt('ticket_number', updatedData.ticket_number);
              
              if (countError) throw countError;
              
              const position = (waitingBefore?.length || 0) + 1;
              
              setQueueData({
                ticketNumber: updatedData.ticket_number,
                name: updatedData.name,
                phoneNumber: updatedData.phone_number,
                serviceType: updatedData.service_types.name,
                registeredAt: updatedData.registered_at,
                estimatedWaitTime: updatedData.estimated_wait_time,
                position: position,
                status: updatedData.status as "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped"
              });
            } catch (error) {
              console.error("Error fetching updated queue data:", error);
            }
          };
          
          fetchUpdatedData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueData, params.ticketId]);

  if (loading) {
    return (
      <Layout userRole="customer">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 -mt-16 -mb-6 py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-md mx-auto flex flex-col items-center justify-center pt-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-com7-primary"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลคิว...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!queueData) {
    return (
      <Layout userRole="customer">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 -mt-16 -mb-6 py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-md mx-auto flex flex-col items-center justify-center pt-20">
              <div className="text-xl font-semibold text-red-500 mb-4">ไม่พบข้อมูลคิว</div>
              <p className="text-gray-600 mb-6">เราไม่พบคิวที่คุณต้องการ คิวอาจถูกยกเลิกหรือหมดอายุแล้ว</p>
              <Button onClick={() => navigate("/")}>กลับไปยังหน้าหลัก</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="customer">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 -mt-16 -mb-6 py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปยังหน้าหลัก
              </Button>
            </div>
            
            <QueueStatus queueData={queueData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QueueStatusPage;
