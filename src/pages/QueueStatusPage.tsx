
import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QueueStatus } from "@/components/customer/QueueStatus";
import { Layout } from "@/components/layout/Layout";

const QueueStatusPage: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  
  // Use location state if available, otherwise create mock data based on URL param
  const queueData = location.state?.queueData || {
    ticketNumber: parseInt(params.ticketId || "10000"),
    name: "Guest Customer",
    phoneNumber: "Unknown",
    serviceType: "General Service",
    registeredAt: new Date().toISOString(),
    estimatedWaitTime: 15,
    position: 3,
    status: "waiting"
  };

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
