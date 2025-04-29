import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
type ServiceType = {
  id: string;
  name: string;
  estimated_time: number;
};
export const QueueRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    serviceTypeId: ""
  });
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('service_types').select('*').order('name');
        if (error) throw error;
        setServiceTypes(data || []);
      } catch (error) {
        console.error("Error fetching service types:", error);
        toast.error("ไม่สามารถโหลดประเภทบริการได้");
      }
    };
    fetchServiceTypes();
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleServiceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypeId: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneNumber || !formData.serviceTypeId) {
      toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    setLoading(true);
    try {
      // Get selected service type for estimated time
      const selectedService = serviceTypes.find(s => s.id === formData.serviceTypeId);
      if (!selectedService) {
        throw new Error("ไม่พบประเภทบริการที่เลือก");
      }

      // Insert new queue entry
      const {
        data,
        error
      } = await supabase.from('queue').insert({
        name: formData.name,
        phone_number: formData.phoneNumber,
        service_type_id: formData.serviceTypeId,
        estimated_wait_time: selectedService.estimated_time,
        status: 'waiting'
      }).select('*, service_types(name)').single();
      if (error) throw error;

      // Navigate to status page
      navigate(`/queue-status/${data.ticket_number}`, {
        state: {
          queueData: {
            ticketNumber: data.ticket_number,
            name: data.name,
            phoneNumber: data.phone_number,
            serviceType: data.service_types.name,
            registeredAt: data.registered_at,
            estimatedWaitTime: data.estimated_wait_time,
            position: 1,
            // This is a simplification - would need queue position algorithm in real app
            status: data.status
          }
        }
      });
      toast.success("ลงทะเบียนคิวสำเร็จ!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("ลงทะเบียนล้มเหลว กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };
  return <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-green-600">จองคิว</CardTitle>
        <CardDescription className="text-center">
          กรอกข้อมูลของคุณเพื่อจองคิว
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input id="name" name="name" placeholder="กรอกชื่อ-นามสกุลของคุณ" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
            <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="กรอกเบอร์โทรศัพท์ของคุณ" value={formData.phoneNumber} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">บริการที่ต้องการ</Label>
            <Select value={formData.serviceTypeId} onValueChange={handleServiceChange}>
              <SelectTrigger id="serviceType" className="w-full">
                <SelectValue placeholder="เลือกประเภทบริการ" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(service => <SelectItem key={service.id} value={service.id}>
                    {service.name} (~{service.estimated_time} นาที)
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <CardFooter className="px-0 pt-4">
            <Button type="submit" className="w-full bg-com7-primary hover:bg-com7-primary-dark transition-colors" disabled={loading}>
              {loading ? "กำลังดำเนินการ..." : "จองคิว"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>;
};