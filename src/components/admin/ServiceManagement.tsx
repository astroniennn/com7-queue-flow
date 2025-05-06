
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Type representing a service from Supabase
type Service = {
  id: string;
  name: string;
  estimated_time: number;
  created_at: string;
};

// Schema for form validation
const serviceSchema = z.object({
  name: z.string().min(2, { message: "ชื่อบริการต้องมีความยาวอย่างน้อย 2 ตัวอักษร" }),
  estimated_time: z.coerce.number().min(1, { message: "เวลาประมาณการต้องมากกว่า 0 นาที" }),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export const ServiceManagement: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch all services
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order("name");
      
      if (error) {
        toast.error("ไม่สามารถโหลดข้อมูลบริการได้");
        throw error;
      }
      
      return data as Service[];
    },
  });

  // Set up form for adding new services
  const addForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      estimated_time: 15,
    },
  });

  // Set up form for editing services
  const editForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      estimated_time: 15,
    },
  });

  // Handle service creation
  const handleCreateService = async (values: ServiceFormValues) => {
    try {
      const { data, error } = await supabase
        .from("service_types")
        .insert([
          { 
            name: values.name,
            estimated_time: values.estimated_time,
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("เพิ่มบริการสำเร็จแล้ว");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มบริการ");
    }
  };

  // Handle service update
  const handleUpdateService = async (values: ServiceFormValues) => {
    if (!selectedService) return;
    
    try {
      const { error } = await supabase
        .from("service_types")
        .update({ 
          name: values.name,
          estimated_time: values.estimated_time,
        })
        .eq("id", selectedService.id);
      
      if (error) throw error;
      
      toast.success("อัปเดตบริการสำเร็จแล้ว");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsEditDialogOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตบริการ");
    }
  };

  // Handle service deletion
  const handleDeleteService = async () => {
    if (!selectedService) return;
    
    try {
      // Check if the service is in use in the queue table
      const { data: usageData, error: usageError } = await supabase
        .from("queue")
        .select("id")
        .eq("service_type_id", selectedService.id)
        .limit(1);
        
      if (usageError) throw usageError;
      
      if (usageData && usageData.length > 0) {
        toast.error("ไม่สามารถลบบริการได้เนื่องจากมีการใช้งานในคิว");
        setIsDeleteDialogOpen(false);
        setSelectedService(null);
        return;
      }
      
      // Proceed with deletion if service is not in use
      const { error } = await supabase
        .from("service_types")
        .delete()
        .eq("id", selectedService.id);
      
      if (error) throw error;
      
      toast.success("ลบบริการสำเร็จแล้ว");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("เกิดข้อผิดพลาดในการลบบริการ");
    }
  };

  // Open edit dialog and populate form
  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    editForm.reset({
      name: service.name,
      estimated_time: service.estimated_time,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">จัดการบริการ</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มบริการใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มบริการใหม่</DialogTitle>
                <DialogDescription>
                  กรอกรายละเอียดเพื่อเพิ่มบริการใหม่ในระบบ
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleCreateService)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อบริการ</FormLabel>
                        <FormControl>
                          <Input placeholder="ระบุชื่อบริการ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="estimated_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เวลาประมาณการ (นาที)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>ระยะเวลาโดยประมาณในการให้บริการ</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                    <Button type="submit">บันทึก</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">กำลังโหลดข้อมูล...</div>
          ) : services && services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อบริการ</TableHead>
                  <TableHead>เวลาประมาณการ (นาที)</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {service.estimated_time} นาที
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(service.created_at).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(service)}
                        className="mr-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">แก้ไข</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(service)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">ลบ</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">ยังไม่มีบริการในระบบ</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มบริการแรก
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขบริการ</DialogTitle>
            <DialogDescription>
              แก้ไขรายละเอียดของบริการ
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateService)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อบริการ</FormLabel>
                    <FormControl>
                      <Input placeholder="ระบุชื่อบริการ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="estimated_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เวลาประมาณการ (นาที)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>ระยะเวลาโดยประมาณในการให้บริการ</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit">บันทึก</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบบริการ</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบบริการ "{selectedService?.name}"? 
              การกระทำนี้ไม่สามารถเปลี่ยนแปลงได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteService}>
              ลบบริการ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
