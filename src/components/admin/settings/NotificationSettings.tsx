
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getNotificationSounds, uploadNotificationSound, deleteNotificationSound, setDefaultNotificationSound, NotificationSound } from "@/services/settingsService";
import { Trash2, Upload, Play, Pause, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sounds, setSounds] = useState<NotificationSound[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSounds = async () => {
    try {
      setLoading(true);
      const data = await getNotificationSounds();
      setSounds(data);
    } catch (error) {
      console.error("Error loading notification sounds:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดเสียงแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSounds();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check if file is an audio file
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "ไม่รองรับไฟล์ประเภทนี้",
        description: "กรุณาอัพโหลดไฟล์เสียงเท่านั้น (MP3, WAV)",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploading(true);
      const newSound = await uploadNotificationSound(file);
      setSounds(prevSounds => [newSound, ...prevSounds]);
      
      toast({
        title: "อัพโหลดสำเร็จ",
        description: `เพิ่มเสียงแจ้งเตือน ${file.name} เรียบร้อยแล้ว`
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error uploading sound:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSound = async (sound: NotificationSound) => {
    if (!sound.id) return;
    
    try {
      setLoading(true);
      
      // Stop playing if this sound is currently playing
      if (currentlyPlaying === sound.id) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setCurrentlyPlaying(null);
      }
      
      await deleteNotificationSound(sound.id, sound.file_path);
      setSounds(prevSounds => prevSounds.filter(s => s.id !== sound.id));
      
      toast({
        title: "ลบเสียงแจ้งเตือนสำเร็จ",
        description: `ลบเสียงแจ้งเตือน ${sound.name} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error("Error deleting sound:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบเสียงแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (sound: NotificationSound) => {
    if (!sound.id) return;
    
    try {
      setLoading(true);
      await setDefaultNotificationSound(sound.id);
      
      // Update local state
      setSounds(prevSounds => prevSounds.map(s => ({
        ...s,
        is_default: s.id === sound.id
      })));
      
      toast({
        title: "ตั้งค่าสำเร็จ",
        description: `ตั้งเสียง ${sound.name} เป็นเสียงแจ้งเตือนหลัก`
      });
    } catch (error) {
      console.error("Error setting default sound:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตั้งค่าเสียงแจ้งเตือนหลักได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlaySound = (sound: NotificationSound) => {
    if (currentlyPlaying === sound.id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentlyPlaying(null);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = sound.file_path;
        audioRef.current.play().catch(e => {
          console.error("Error playing audio:", e);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถเล่นเสียงแจ้งเตือนได้",
            variant: "destructive"
          });
        });
        setCurrentlyPlaying(sound.id);
      }
    }
  };

  // Handle audio ended event
  useEffect(() => {
    const handleAudioEnded = () => {
      setCurrentlyPlaying(null);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleAudioEnded);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleAudioEnded);
      }
    };
  }, [audioRef.current]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">เสียงแจ้งเตือน</h2>
      
      <div className="mb-8">
        <p className="text-gray-500 mb-4">
          อัพโหลดไฟล์เสียงเพื่อใช้เป็นเสียงแจ้งเตือนในระบบ รองรับไฟล์นามสกุล MP3 และ WAV
        </p>
        
        <div className="flex items-center gap-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-md"
          />
          <Button disabled={uploading} variant="outline">
            {uploading ? "กำลังอัพโหลด..." : "อัพโหลด"}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">รายการเสียงแจ้งเตือน</h3>
        
        {loading ? (
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        ) : sounds.length === 0 ? (
          <p className="text-gray-500">ไม่พบเสียงแจ้งเตือนในระบบ</p>
        ) : (
          <div className="space-y-2">
            {sounds.map((sound) => (
              <div 
                key={sound.id} 
                className={`flex items-center justify-between p-3 rounded-md border ${sound.is_default ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => togglePlaySound(sound)}
                  >
                    {currentlyPlaying === sound.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <p className="font-medium">{sound.name}</p>
                    {sound.is_default && (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <Check className="h-3 w-3" /> เสียงหลัก
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!sound.is_default && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(sound)}
                      disabled={loading}
                    >
                      ตั้งเป็นเสียงหลัก
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>ยืนยันการลบเสียงแจ้งเตือน</DialogTitle>
                      </DialogHeader>
                      <p className="py-4">คุณต้องการลบเสียงแจ้งเตือน "{sound.name}" ใช่หรือไม่?</p>
                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button variant="outline">
                            ยกเลิก
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDeleteSound(sound)}
                          >
                            ลบเสียง
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Hidden audio element for playing sounds */}
      <audio ref={audioRef} />
    </div>
  );
};
