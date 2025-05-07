
import { supabase } from "@/integrations/supabase/client";

export type SystemSettingCategory = "general" | "queue" | "display" | "notification";

export interface SystemSetting {
  id?: string;
  category: SystemSettingCategory;
  key: string;
  value: any;
  updated_at?: string;
}

export interface NotificationSound {
  id?: string;
  name: string;
  file_path: string;
  created_at?: string;
  is_default?: boolean;
}

// Get settings by category
export const getSettingsByCategory = async (category: SystemSettingCategory) => {
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .eq("category", category);

  if (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }

  return data;
};

// Update a setting
export const updateSetting = async (category: SystemSettingCategory, key: string, value: any) => {
  // Convert value to JSON string if it's not already a string
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  const { data, error } = await supabase
    .from("system_settings")
    .update({ value: stringValue, updated_at: new Date().toISOString() })
    .eq("category", category)
    .eq("key", key)
    .select();

  if (error) {
    console.error("Error updating setting:", error);
    throw error;
  }

  return data;
};

// Get all notification sounds
export const getNotificationSounds = async () => {
  const { data, error } = await supabase
    .from("notification_sounds")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notification sounds:", error);
    throw error;
  }

  return data;
};

// Upload a notification sound file
export const uploadNotificationSound = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;

  console.log("Attempting to upload file to storage bucket:", filePath);
  
  // Upload file to storage
  const { error: uploadError, data: uploadData } = await supabase.storage
    .from("notification-sounds")
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw uploadError;
  }

  console.log("File uploaded successfully:", uploadData);

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from("notification-sounds")
    .getPublicUrl(filePath);

  console.log("Public URL generated:", publicUrl);

  // Add record to notification_sounds table
  const { data, error } = await supabase
    .from("notification_sounds")
    .insert({
      name: file.name,
      file_path: publicUrl
    })
    .select();

  if (error) {
    console.error("Error adding notification sound record:", error);
    throw error;
  }

  console.log("Notification sound record added:", data);
  return data[0];
};

// Delete a notification sound
export const deleteNotificationSound = async (id: string, filePath: string) => {
  // Extract the filename from the URL
  const fileName = filePath.split("/").pop();

  if (fileName) {
    console.log("Attempting to delete file from storage:", fileName);
    
    // Delete file from storage
    const { error: deleteFileError } = await supabase.storage
      .from("notification-sounds")
      .remove([fileName]);

    if (deleteFileError) {
      console.error("Error deleting file:", deleteFileError);
      throw deleteFileError;
    }
    
    console.log("File deleted successfully");
  }

  console.log("Attempting to delete record from database, id:", id);
  
  // Delete record from notification_sounds table
  const { error } = await supabase
    .from("notification_sounds")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting notification sound record:", error);
    throw error;
  }
  
  console.log("Record deleted successfully");
  return true;
};

// Set a notification sound as default
export const setDefaultNotificationSound = async (id: string) => {
  console.log("Setting default notification sound, id:", id);
  
  // First, unset any existing default
  const { error: resetError } = await supabase
    .from("notification_sounds")
    .update({ is_default: false })
    .eq("is_default", true);

  if (resetError) {
    console.error("Error resetting default notification sound:", resetError);
    throw resetError;
  }

  // Then set the new default
  const { data, error } = await supabase
    .from("notification_sounds")
    .update({ is_default: true })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error setting default notification sound:", error);
    throw error;
  }

  console.log("Default notification sound set successfully:", data);
  return data[0];
};
