
import React, { useState } from "react";
import { QueueStatusCard } from "./queue/QueueStatusCard";
import { QueueData } from "@/hooks/useQueueRealtime";
import { Button } from "@/components/ui/button";
import { Volume2, Volume, Info } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, 
  DialogClose
} from "@/components/ui/dialog";
import { getDefaultNotificationSettings } from "@/services/settingsService";

type QueueStatusProps = {
  queueData: QueueData;
  updateQueueData: (updatedData: QueueData) => void;
};

export const QueueStatus: React.FC<QueueStatusProps> = ({ queueData, updateQueueData }) => {
  const [isTestSoundDialogOpen, setIsTestSoundDialogOpen] = useState(false);
  const [isTestingSound, setIsTestingSound] = useState(false);
  
  // Function to test notification sounds
  const testSound = async () => {
    setIsTestingSound(true);
    try {
      const settings = await getDefaultNotificationSettings();
      const soundUrl = settings?.almostSound || "/notification.mp3";
      
      console.log("Playing test sound:", soundUrl);
      const audio = new Audio(soundUrl);
      
      audio.onended = () => {
        setIsTestingSound(false);
      };
      
      audio.onerror = (e) => {
        console.error("Error playing test sound:", e);
        setIsTestingSound(false);
      };
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio playback started successfully");
          })
          .catch(error => {
            console.error("Error playing test sound:", error);
            setIsTestingSound(false);
          });
      }
    } catch (error) {
      console.error("Failed to test sound:", error);
      setIsTestingSound(false);
    }
  };
  
  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 flex items-center"
            onClick={() => setIsTestSoundDialogOpen(true)}
          >
            <Info className="h-4 w-4 mr-1" />
            <span className="text-xs">การแจ้งเตือน</span>
          </Button>
        </div>
        <QueueStatusCard queueData={queueData} updateQueueData={updateQueueData} />
      </div>
      
      <Dialog open={isTestSoundDialogOpen} onOpenChange={setIsTestSoundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ทดสอบเสียงแจ้งเตือน</DialogTitle>
            <DialogDescription>
              ระบบจะส่งเสียงแจ้งเตือนเมื่อใกล้ถึงคิวของคุณและเมื่อถึงคิวของคุณ 
              กรุณาเปิดใช้งานเสียงบนอุปกรณ์ของคุณเพื่อให้ได้ยินเสียงแจ้งเตือน
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>คำแนะนำ:</strong> หากคุณไม่ได้ยินเสียงแจ้งเตือน โปรดตรวจสอบว่า:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-yellow-700 space-y-1">
                <li>เบราว์เซอร์ของคุณอนุญาตให้เล่นเสียงแจ้งเตือน</li>
                <li>อุปกรณ์ของคุณมีการเปิดเสียงและปรับระดับเสียงให้ดังพอ</li>
                <li>หากใช้มือถือ อย่าล็อกหน้าจอหรือปิดเบราว์เซอร์</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-center">
              <Button 
                onClick={testSound}
                disabled={isTestingSound}
                className="flex items-center"
              >
                {isTestingSound ? (
                  <>
                    <Volume2 className="animate-pulse h-4 w-4 mr-2" />
                    กำลังเล่นเสียง...
                  </>
                ) : (
                  <>
                    <Volume className="h-4 w-4 mr-2" />
                    ทดสอบเสียง
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">ปิด</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
