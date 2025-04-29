
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
  { id: 1, name: "สอบถามสินค้า", estimatedTime: 10 },
  { id: 2, name: "สนับสนุนด้านเทคนิค", estimatedTime: 15 },
  { id: 3, name: "คืนสินค้าและเปลี่ยนสินค้า", estimatedTime: 20 },
  { id: 4, name: "การเคลมประกัน", estimatedTime: 25 },
  { id: 5, name: "ปัญหาด้านการเรียกเก็บเงิน", estimatedTime: 15 },
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
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);

    try {
      // In a real application, this would be an API call
      // Simulating API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a random ticket number for demo purposes
      const ticketNumber = Math.floor(10000 + Math.random() * 90000);
      
      toast.success(`ลงทะเบียนลูกค้าหน้าร้านเรียบร้อยแล้ว คิวหมายเลข #${ticketNumber}`);
      
      // Clear form after successful submission
      setFormData({
        name: "",
        phoneNumber: "",
        serviceTypeId: "",
        notes: "",
        priority: "normal"
      });
      
    } catch (error) {
      toast.error("ไม่สามารถลงทะเบียนลูกค้าหน้าร้านได้ กรุณาลองอีกครั้ง");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">ลงทะเบียนลูกค้าหน้าร้าน</h2>
        <p className="text-gray-500">เพิ่มลูกค้าที่มาที่ร้านโดยตรง</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อลูกค้า</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="กรอกชื่อลูกค้า"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์ (ไม่บังคับ)</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="กรอกเบอร์โทรศัพท์ของลูกค้า"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">ประเภทบริการ</Label>
                <Select value={formData.serviceTypeId} onValueChange={handleServiceChange}>
                  <SelectTrigger id="serviceType" className="w-full">
                    <SelectValue placeholder="เลือกประเภทบริการ" />
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
                <Label htmlFor="priority">ความสำคัญ</Label>
                <Select value={formData.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder="เลือกความสำคัญ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">ต่ำ</SelectItem>
                    <SelectItem value="normal">ปกติ</SelectItem>
                    <SelectItem value="high">สูง</SelectItem>
                    <SelectItem value="urgent">เร่งด่วน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">หมายเหตุเพิ่มเติม</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="กรอกรายละเอียดเพิ่มเติมหรือความต้องการพิเศษ"
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
                {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียนลูกค้า"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
