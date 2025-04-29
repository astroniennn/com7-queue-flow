
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QueueStatus } from "@/components/customer/QueueStatus";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
          toast.error("Queue record not found");
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
          status: data.status
        });
      } catch (error) {
        console.error("Error fetching queue data:", error);
        toast.error("Failed to load queue information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQueueData();
  }, [location.state, params.ticketId, navigate]);

  if (loading) {
    return (
      <Layout userRole="customer">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 -mt-16 -mb-6 py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-md mx-auto flex flex-col items-center justify-center pt-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-com7-primary"></div>
              <p className="mt-4 text-gray-600">Loading queue information...</p>
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
              <div className="text-xl font-semibold text-red-500 mb-4">Queue information not found</div>
              <p className="text-gray-600 mb-6">We couldn't find the requested queue ticket. It may have been cancelled or expired.</p>
              <Button onClick={() => navigate("/")}>Return to Home</Button>
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
                Back to Home
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
