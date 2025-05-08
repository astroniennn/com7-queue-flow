
import React, { useState } from "react";
import { QueueStatusCard } from "./queue/QueueStatusCard";
import { QueueData } from "@/hooks/useQueueRealtime";
import { Button } from "@/components/ui/button";
import { Volume2, Volume, Info, Bell, BellOff } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, 
  DialogClose
} from "@/components/ui/dialog";
import { getDefaultNotificationSettings } from "@/services/settingsService";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type QueueStatusProps = {
  queueData: QueueData;
  updateQueueData: (updatedData: QueueData) => void;
};

export const QueueStatus: React.FC<QueueStatusProps> = ({ queueData, updateQueueData }) => {
  const [isTestSoundDialogOpen, setIsTestSoundDialogOpen] = useState(false);
  const [isTestingSound, setIsTestingSound] = useState(false);
  
  const ticketId = queueData?.ticketNumber?.toString();
  const { 
    isSupported, 
    isSubscribed, 
    isRegistering,
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = usePushNotifications(ticketId);
  
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
  
  // Handle toggle of push notifications
  const handlePushNotificationsToggle = async () => {
    if (isSubscribed) {
      await unsubscribeFromNotifications();
    } else {
      await subscribeToNotifications();
    }
  };
  
  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            variant={isSubscribed ? "default" : "outline"}
            size="sm" 
            className={`flex items-center ${isSubscribed ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={handlePushNotificationsToggle}
            disabled={!isSupported || isRegistering}
          >
            {isRegistering ? (
              <span className="flex items-center">
                <Bell className="h-4 w-4 mr-2 animate-pulse" />
                กำลังตั้งค่า...
              </span>
            ) : isSubscribed ? (
              <span className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                เปิดแจ้งเตือนแล้ว
              </span>
            ) : (
              <span className="flex items-center">
                <BellOff className="h-4 w-4 mr-2" />
                เปิดการแจ้งเตือนเมื่อออกจากเว็บ
              </span>
            )}
          </Button>
          
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
            
            <Separator className="my-4" />
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">การแจ้งเตือนแบบพุช (เมื่อออกจากเว็บ)</h4>
              <p className="text-sm text-gray-600 mb-4">
                เปิดใช้งานการแจ้งเตือนแบบพุชเพื่อรับแจ้งเตือนเมื่อถึงคิวของคุณแม้ว่าคุณจะปิดเว็บไซต์หรือแอปไปแล้ว
              </p>
              
              {!isSupported && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>ข้อจำกัด:</strong> เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือนแบบพุช (บน iOS Safari มีข้อจำกัดในการแจ้งเตือนแบบพุช)
                  </p>
                </div>
              )}
              
              <Button 
                variant={isSubscribed ? "default" : "outline"}
                className={`w-full ${isSubscribed ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={handlePushNotificationsToggle}
                disabled={!isSupported || isRegistering}
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center">
                    <Bell className="h-4 w-4 mr-2 animate-pulse" />
                    กำลังตั้งค่า...
                  </span>
                ) : isSubscribed ? (
                  <span className="flex items-center justify-center">
                    <Bell className="h-4 w-4 mr-2" />
                    ปิดการแจ้งเตือนแบบพุช
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <BellOff className="h-4 w-4 mr-2" />
                    เปิดการแจ้งเตือนแบบพุช
                  </span>
                )}
              </Button>
            </div>
            
            <Separator className="my-4" />
            
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
