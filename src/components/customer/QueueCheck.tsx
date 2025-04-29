
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export const QueueCheck: React.FC = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber && !ticketNumber) {
      toast.error("Please enter either your phone number or ticket number");
      return;
    }

    setLoading(true);

    try {
      // In a real application, this would be an API call to check the queue status
      // Simulating API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response for demonstration
      if (phoneNumber || ticketNumber) {
        // Generate mock data for demonstration
        const mockTicketNumber = ticketNumber || Math.floor(10000 + Math.random() * 90000);
        
        navigate(`/queue-status/${mockTicketNumber}`, {
          state: {
            queueData: {
              ticketNumber: parseInt(mockTicketNumber.toString()),
              name: "John Doe",  // In a real app, this would come from the backend
              phoneNumber: phoneNumber || "123-456-7890",
              serviceType: "Technical Support",
              registeredAt: new Date().toISOString(),
              estimatedWaitTime: 15,
              position: 3,
              status: "waiting"
            }
          }
        });
      } else {
        toast.error("No queue record found with the provided information");
      }
    } catch (error) {
      toast.error("Failed to check queue status. Please try again.");
      console.error("Queue check error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-com7-primary">Check Your Queue Status</CardTitle>
        <CardDescription className="text-center">
          Enter your phone number or ticket number to check your current position
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheckQueue} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="Enter phone number used for registration"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticketNumber">Ticket Number</Label>
            <Input
              id="ticketNumber"
              placeholder="Enter your ticket number"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
            />
          </div>

          <CardFooter className="px-0 pt-4">
            <Button
              type="submit"
              className="w-full bg-com7-primary hover:bg-com7-primary-dark flex items-center justify-center"
              disabled={loading}
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Checking..." : "Check Status"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};
