
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QueueStatus } from "@/components/customer/QueueStatus";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle, Bell } from "lucide-react";

// Define proper types for Supabase realtime payload
interface SupabaseRealtimePayload {
  eventType: string;
  new: {
    status: "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped";
    ticket_number: number;
    [key: string]: any;
  };
  old: {
    status: "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped";
    ticket_number: number;
    [key: string]: any;
  };
  [key: string]: any;
}

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

  // Update queue data function to be passed to QueueStatus component
  const updateQueueData = (updatedData: any) => {
    console.log("Updating queue data with:", updatedData);
    setQueueData(updatedData);
  };

  // Set up real-time subscription for queue updates
  useEffect(() => {
    if (!queueData || !params.ticketId) return;
    
    const ticketId = parseInt(params.ticketId);
    if (isNaN(ticketId)) {
      console.error("Invalid ticket ID for subscription:", params.ticketId);
      return;
    }
    
    console.log("Setting up realtime subscription for ticket:", ticketId);
    
    // First, enable replication for the queue table
    const setupReplication = async () => {
      try {
        await supabase.rpc('alter_table_replica_identity_full', { table_name: 'queue' });
        console.log("Replication identity set successfully");
      } catch (error) {
        console.log("Replication setup error (can be ignored if already set):", error);
      }
    };
    
    setupReplication();
    
    // Setup direct channel for this specific ticket
    const specificTicketChannel = supabase
      .channel(`specific_ticket_${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'queue',
          filter: `ticket_number=eq.${ticketId}`
        },
        (payload: SupabaseRealtimePayload) => {
          console.log("Queue update received:", payload);
          
          // Get the updated status from the payload
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            const newStatus = payload.new.status as "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped";
            
            // Show notifications based on status change
            if (newStatus === 'almost') {
              toast(
                <div className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-semibold">ใกล้ถึงคิวของคุณแล้ว</div>
                    <div className="text-sm">กรุณามาที่พื้นที่รอเรียกคิว</div>
                  </div>
                </div>,
                { duration: 10000 }
              );
              // Play notification sound
              const audio = new Audio('/notification.mp3');
              audio.play().catch(e => console.log("Audio play error:", e));
            } else if (newStatus === 'serving') {
              toast(
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-semibold">ถึงคิวของคุณแล้ว!</div>
                    <div className="text-sm">กรุณามาที่เคาน์เตอร์บริการทันที</div>
                  </div>
                </div>,
                { duration: 0 } // Won't auto-dismiss
              );
              // Play urgent notification sound
              const audio = new Audio('/urgent-notification.mp3');
              audio.play().catch(e => console.log("Audio play error:", e));
            }
            
            // Update the queueData with the new status
            updateQueueData({
              ...queueData,
              status: newStatus
            });
            
            // Fetch updated position if needed
            if (newStatus === 'waiting') {
              const fetchUpdatedPosition = async () => {
                try {
                  const { data: waitingBefore, error } = await supabase
                    .from('queue')
                    .select('ticket_number', { count: 'exact' })
                    .eq('status', 'waiting')
                    .lt('ticket_number', ticketId);
                  
                  if (!error) {
                    const position = (waitingBefore?.length || 0) + 1;
                    updateQueueData({
                      ...queueData,
                      status: newStatus,
                      position: position
                    });
                  }
                } catch (error) {
                  console.error("Error fetching updated position:", error);
                }
              };
              fetchUpdatedPosition();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
    
    return () => {
      console.log("Removing channel subscription");
      supabase.removeChannel(specificTicketChannel);
    };
  }, [params.ticketId, queueData]);

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
            
            <QueueStatus queueData={queueData} updateQueueData={updateQueueData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QueueStatusPage;
