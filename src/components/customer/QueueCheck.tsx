
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
      let query = supabase
        .from('queue')
        .select(`
          ticket_number,
          name,
          phone_number,
          registered_at,
          estimated_wait_time,
          status,
          service_types(name)
        `);
      
      // Apply filter based on input
      if (ticketNumber) {
        query = query.eq('ticket_number', parseInt(ticketNumber));
      } else if (phoneNumber) {
        query = query.eq('phone_number', phoneNumber);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          toast.error("No queue record found with the provided information");
        } else {
          throw error;
        }
        return;
      }
      
      if (data) {
        // Calculate position based on waiting tickets with lower numbers
        const { data: waitingBefore, error: countError } = await supabase
          .from('queue')
          .select('ticket_number', { count: 'exact' })
          .eq('status', 'waiting')
          .lt('ticket_number', data.ticket_number);
        
        if (countError) throw countError;
        
        const position = (waitingBefore?.length || 0) + 1;
        
        // Navigate to status page with the found data
        navigate(`/queue-status/${data.ticket_number}`, {
          state: {
            queueData: {
              ticketNumber: data.ticket_number,
              name: data.name,
              phoneNumber: data.phone_number,
              serviceType: data.service_types.name,
              registeredAt: data.registered_at,
              estimatedWaitTime: data.estimated_wait_time,
              position: position,
              status: data.status
            }
          }
        });
      }
    } catch (error) {
      console.error("Queue check error:", error);
      toast.error("Failed to check queue status. Please try again.");
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
