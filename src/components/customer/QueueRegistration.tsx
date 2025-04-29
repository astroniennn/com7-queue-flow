
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Mock service types for demonstration
const SERVICE_TYPES = [
  { id: 1, name: "Product Inquiry", estimatedTime: 10 },
  { id: 2, name: "Technical Support", estimatedTime: 15 },
  { id: 3, name: "Returns & Exchanges", estimatedTime: 20 },
  { id: 4, name: "Warranty Claims", estimatedTime: 25 },
  { id: 5, name: "Billing Issues", estimatedTime: 15 },
];

export const QueueRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    serviceTypeId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, serviceTypeId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phoneNumber || !formData.serviceTypeId) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      // In a real application, this would be an API call
      // Simulating API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a random ticket number for demo purposes
      const ticketNumber = Math.floor(10000 + Math.random() * 90000);
      
      // Mock registration success and navigate to status page
      navigate(`/queue-status/${ticketNumber}`, {
        state: {
          queueData: {
            ticketNumber,
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            serviceType: SERVICE_TYPES.find(s => s.id.toString() === formData.serviceTypeId)?.name,
            registeredAt: new Date().toISOString(),
            estimatedWaitTime: SERVICE_TYPES.find(s => s.id.toString() === formData.serviceTypeId)?.estimatedTime || 15,
            position: Math.floor(1 + Math.random() * 5), // Random position for demo
            status: "waiting"
          }
        }
      });

      toast.success("Queue registration successful!");
    } catch (error) {
      toast.error("Failed to register. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-com7-primary">Join the Queue</CardTitle>
        <CardDescription className="text-center">
          Enter your information to secure your place in line
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Needed</Label>
            <Select value={formData.serviceTypeId} onValueChange={handleServiceChange}>
              <SelectTrigger id="serviceType" className="w-full">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} (~{service.estimatedTime} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <CardFooter className="px-0 pt-4">
            <Button
              type="submit"
              className="w-full bg-com7-primary hover:bg-com7-primary-dark transition-colors"
              disabled={loading}
            >
              {loading ? "Processing..." : "Get in Queue"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};
