
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getSettingsByCategory, updateSetting } from "@/services/settingsService";

const formSchema = z.object({
  opening_hours_start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "กรุณาระบุเวลาในรูปแบบ HH:MM",
  }),
  opening_hours_end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "กรุณาระบุเวลาในรูปแบบ HH:MM",
  }),
  max_queue_size: z.coerce.number().int().positive(),
  average_service_time: z.coerce.number().int().positive(),
});

export const QueueSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opening_hours_start: "10:00",
      opening_hours_end: "21:00",
      max_queue_size: 50,
      average_service_time: 15
    }
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettingsByCategory("queue");
      
      // Convert the data array to a key-value object
      const settings = data.reduce((acc, item) => {
        // Parse JSON strings, but ensure we handle all possible types
        const parsedValue = typeof item.value === 'string' 
          ? JSON.parse(item.value) 
          : item.value;
          
        acc[item.key] = parsedValue;
        return acc;
      }, {} as Record<string, any>);
      
      const openingHours = settings.opening_hours || { start: "10:00", end: "21:00" };
      
      form.reset({
        opening_hours_start: openingHours.start,
        opening_hours_end: openingHours.end,
        max_queue_size: Number(settings.max_queue_size || 50),
        average_service_time: Number(settings.average_service_time || 15)
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // Update opening hours as a combined object
      const openingHours = {
        start: values.opening_hours_start,
        end: values.opening_hours_end
      };
      await updateSetting("queue", "opening_hours", JSON.stringify(openingHours));
      
      // Update other settings
      await updateSetting("queue", "max_queue_size", String(values.max_queue_size));
      await updateSetting("queue", "average_service_time", String(values.average_service_time));
      
      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        description: "การตั้งค่าคิวถูกบันทึกเรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">ตั้งค่าคิว</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="opening_hours_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เวลาเปิดทำการ</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="opening_hours_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เวลาปิดทำการ</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="max_queue_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จำนวนคิวสูงสุดต่อวัน</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription>
                  จำนวนคิวสูงสุดที่สามารถรับได้ต่อวัน
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="average_service_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เวลาให้บริการเฉลี่ย (นาที)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription>
                  เวลาเฉลี่ยในการให้บริการลูกค้าแต่ละคน
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
