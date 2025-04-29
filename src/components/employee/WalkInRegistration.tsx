
import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

// Mock service types for demonstration
const SERVICE_TYPES = [
  { id: 1, name: "Product Inquiry", estimatedTime: 10 },
  { id: 2, name: "Technical Support", estimatedTime: 15 },
  { id: 3, name: "Returns & Exchanges", estimatedTime: 20 },
  { id: 4, name: "Warranty Claims", estimatedTime: 25 },
  { id: 5, name: "Billing Issues", estimatedTime: 15 },
];

export const WalkInRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    serviceTypeId: "",
    notes: "",
    priority: "normal"
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, serviceTypeId: value }));
  };

  const handlePriorityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, priority: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.serviceTypeId) {
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
      
      toast.success(`Walk-in customer registered with ticket #${ticketNumber}`);
      
      // Clear form after successful submission
      setFormData({
        name: "",
        phoneNumber: "",
        serviceTypeId: "",
        notes: "",
        priority: "normal"
      });
      
    } catch (error) {
      toast.error("Failed to register walk-in customer. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Register Walk-in Customer</h2>
        <p className="text-gray-500">Add a customer who is physically present at your location</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter customer's name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter customer's phone number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select value={formData.serviceTypeId} onValueChange={handleServiceChange}>
                  <SelectTrigger id="serviceType" className="w-full">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter any special requirements or notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="bg-com7-primary hover:bg-com7-primary-dark"
                disabled={loading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {loading ? "Registering..." : "Register Customer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
