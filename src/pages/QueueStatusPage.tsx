
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QueueStatus } from "@/components/customer/QueueStatus";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueueLoader } from "@/components/customer/queue/QueueLoader";
import { QueueNotFound } from "@/components/customer/queue/QueueNotFound";
import { useQueueRealtime, QueueData } from "@/hooks/useQueueRealtime";

const QueueStatusPage: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState<QueueData | undefined>(location.state?.queueData);
  
  // Initialize audio context on page load or user interaction
  useEffect(() => {
    const initAudio = () => {
      try {
        // Try to initialize audio context on page load
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const audioContext = new AudioContext();
          console.log("Audio context created with state:", audioContext.state);
          
          // If suspended (common in Safari/iOS), we'll need user interaction
          if (audioContext.state === "suspended") {
            console.log("Audio context suspended, waiting for user interaction");
            
            // Listen for user interaction to resume audio context
            const resumeAudio = () => {
              audioContext.resume().then(() => {
                console.log("Audio context resumed:", audioContext.state);
              }).catch(err => {
                console.error("Failed to resume audio context:", err);
              });
            };
            
            // Add listeners for common user interactions
            document.addEventListener('click', resumeAudio, { once: true });
            document.addEventListener('touchstart', resumeAudio, { once: true });
            document.addEventListener('keydown', resumeAudio, { once: true });
          }
        }
      } catch (error) {
        console.error("Error initializing audio context:", error);
      }
    };
    
    initAudio();
  }, []);
  
  // Fetch queue data if not available in location state
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
  const updateQueueData = (updatedData: QueueData) => {
    console.log("Updating queue data with:", updatedData);
    setQueueData(updatedData);
  };

  // Set up real-time subscription for queue updates using custom hook
  useQueueRealtime(params.ticketId, queueData, updateQueueData);

  if (loading) {
    return (
      <Layout userRole="customer">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 -mt-16 -mb-6 py-16 px-4">
          <div className="container mx-auto">
            <QueueLoader />
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
            <QueueNotFound />
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
