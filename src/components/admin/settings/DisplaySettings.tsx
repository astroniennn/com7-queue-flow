
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getSettingsByCategory, updateSetting } from "@/services/settingsService";

const formSchema = z.object({
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, {
    message: "กรุณาระบุสีในรูปแบบ HEX เช่น #1e40af",
  }),
  secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, {
    message: "กรุณาระบุสีในรูปแบบ HEX เช่น #3b82f6",
  }),
  promotional_message: z.string()
});

export const DisplaySettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primary_color: "#1e40af",
      secondary_color: "#3b82f6",
      promotional_message: ""
    }
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettingsByCategory("display");
      
      // Convert the data array to a key-value object
      const settings = data.reduce((acc, item) => {
        acc[item.key] = JSON.parse(item.value);
        return acc;
      }, {} as Record<string, any>);
      
      const colors = settings.colors || { primary: "#1e40af", secondary: "#3b82f6" };
      
      form.reset({
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        promotional_message: settings.promotional_message || ""
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
      
      // Update colors as a combined object
      const colors = {
        primary: values.primary_color,
        secondary: values.secondary_color
      };
      await updateSetting("display", "colors", JSON.stringify(colors));
      
      // Update promotional message
      await updateSetting("display", "promotional_message", JSON.stringify(values.promotional_message));
      
      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        description: "การตั้งค่าการแสดงผลถูกบันทึกเรียบร้อยแล้ว"
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
      <h2 className="text-2xl font-bold mb-6">ตั้งค่าการแสดงผล</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="primary_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สีหลัก</FormLabel>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: field.value }}
                    />
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="secondary_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สีรอง</FormLabel>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: field.value }}
                    />
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="promotional_message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ข้อความประชาสัมพันธ์</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="ระบุข้อความประชาสัมพันธ์หรือโปรโมชัน" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  ข้อความนี้จะแสดงบนหน้าจอสำหรับลูกค้า
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
