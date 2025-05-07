
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
  store_name: z.string().min(1, { message: "กรุณาระบุชื่อร้าน" }),
  welcome_message: z.string()
});

export const GeneralSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      store_name: "",
      welcome_message: ""
    }
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettingsByCategory("general");
      
      // Convert the data array to a key-value object
      const settings = data.reduce((acc, item) => {
        // Parse JSON strings, but ensure we handle all possible types
        const parsedValue = typeof item.value === 'string' 
          ? JSON.parse(item.value) 
          : item.value;
          
        acc[item.key] = parsedValue;
        return acc;
      }, {} as Record<string, any>);
      
      form.reset({
        store_name: settings.store_name || "",
        welcome_message: settings.welcome_message || ""
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
      
      // Update each setting individually
      await updateSetting("general", "store_name", JSON.stringify(values.store_name));
      await updateSetting("general", "welcome_message", JSON.stringify(values.welcome_message));
      
      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        description: "การตั้งค่าทั่วไปถูกบันทึกเรียบร้อยแล้ว"
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
      <h2 className="text-2xl font-bold mb-6">ตั้งค่าทั่วไป</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="store_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อร้าน</FormLabel>
                <FormControl>
                  <Input placeholder="ระบุชื่อร้าน" {...field} />
                </FormControl>
                <FormDescription>
                  ชื่อร้านจะแสดงบนหน้าจอหลักและหน้าจอการจองคิว
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="welcome_message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ข้อความต้อนรับ</FormLabel>
                <FormControl>
                  <Textarea placeholder="ระบุข้อความต้อนรับ" {...field} />
                </FormControl>
                <FormDescription>
                  ข้อความต้อนรับจะแสดงบนหน้าจอหลัก
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
