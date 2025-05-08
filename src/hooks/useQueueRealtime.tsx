
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, AlertCircle } from "lucide-react";
import { getSettingsByCategory } from "@/services/settingsService";

// Define interface for Supabase realtime payload
interface SupabaseRealtimePayload {
  eventType: string;
  new: {
    status: "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped";
    ticket_number: number;
    [key: string]: any;
  };
  old: {
    status: "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped";
    ticket_number: number;
    [key: string]: any;
  };
  [key: string]: any;
}

// Interface for queue data
export interface QueueData {
  ticketNumber: number;
  name: string;
  phoneNumber: string;
  serviceType: string;
  registeredAt: string;
  estimatedWaitTime: number;
  position: number;
  status: "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped";
}

// Create a pre-loaded audio object cache
const audioCache: {[key: string]: HTMLAudioElement} = {};

export const useQueueRealtime = (
  ticketId: string | undefined,
  queueData: QueueData | undefined,
  updateQueueData: (data: QueueData) => void
) => {
  const [notificationSoundUrl, setNotificationSoundUrl] = useState<string>("/notification.mp3");
  const [urgentSoundUrl, setUrgentSoundUrl] = useState<string>("/urgent-notification.mp3");

  // Fetch notification sound settings
  useEffect(() => {
    const fetchNotificationSounds = async () => {
      try {
        // Fetch default notification sounds from system settings
        const notificationSettings = await getSettingsByCategory("notification");
        const defaultSounds = notificationSettings.find(setting => setting.key === "default_sounds");
        
        if (defaultSounds && defaultSounds.value) {
          let sounds;
          try {
            sounds = typeof defaultSounds.value === 'string' ? 
                      JSON.parse(defaultSounds.value) : 
                      defaultSounds.value;
                      
            if (sounds.almostSound) {
              console.log("Using custom almost sound:", sounds.almostSound);
              setNotificationSoundUrl(sounds.almostSound);
              // Pre-load sound
              if (!audioCache[sounds.almostSound]) {
                const audio = new Audio(sounds.almostSound);
                audio.load();
                audioCache[sounds.almostSound] = audio;
              }
            }
            
            if (sounds.servingSound) {
              console.log("Using custom serving sound:", sounds.servingSound);
              setUrgentSoundUrl(sounds.servingSound);
              // Pre-load sound
              if (!audioCache[sounds.servingSound]) {
                const audio = new Audio(sounds.servingSound);
                audio.load();
                audioCache[sounds.servingSound] = audio;
              }
            }
          } catch (parseError) {
            console.error("Error parsing notification sound settings:", parseError);
          }
        }
      } catch (error) {
        console.error("Error fetching notification sound settings:", error);
      }
    };
    
    fetchNotificationSounds();
  }, []);

  const playNotificationSound = (soundUrl: string) => {
    console.log("Attempting to play sound:", soundUrl);
    
    try {
      // Try to use cached audio object if available
      if (audioCache[soundUrl]) {
        console.log("Using cached audio object");
        const cachedAudio = audioCache[soundUrl];
        
        // Reset audio to beginning in case it was already played
        cachedAudio.currentTime = 0;
        
        // Create play promise and handle it
        const playPromise = cachedAudio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log("Audio playback started successfully"))
            .catch(error => {
              console.error("Error playing audio:", error);
              // Fallback to creating a new Audio object
              const newAudio = new Audio(soundUrl);
              newAudio.play().catch(e => console.log("Fallback audio play error:", e));
            });
        }
      } else {
        // Create new Audio object if not cached
        console.log("Creating new audio object");
        const audio = new Audio(soundUrl);
        
        // Cache the audio object for future use
        audioCache[soundUrl] = audio;
        
        // Play the sound
        audio.play().catch(e => console.log("Audio play error:", e));
      }
    } catch (error) {
      console.error("Error in playNotificationSound:", error);
    }
  };

  useEffect(() => {
    if (!queueData || !ticketId) return;
    
    const ticketNumber = parseInt(ticketId);
    if (isNaN(ticketNumber)) {
      console.error("Invalid ticket ID for subscription:", ticketId);
      return;
    }
    
    console.log("Setting up realtime subscription for ticket:", ticketNumber);
    
    // First, enable replication for the queue table
    const setupReplication = async () => {
      try {
        // Fix Type Error: We need to explicitly cast the parameter and the function itself
        const rpcFunction = 'alter_table_replica_identity_full';
        await (supabase.rpc as any)(rpcFunction, { table_name: 'queue' });
        console.log("Replication identity set successfully");
      } catch (error) {
        console.log("Replication setup error (can be ignored if already set):", error);
      }
    };
    
    setupReplication();
    
    // Setup direct channel for this specific ticket
    const specificTicketChannel = supabase
      .channel(`specific_ticket_${ticketNumber}`)
      // Fix Type Error: Use the correct type for the 'on' method
      .on(
        'postgres_changes' as any, // Type assertion to bypass type checking
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'queue',
          filter: `ticket_number=eq.${ticketNumber}`
        },
        (payload: SupabaseRealtimePayload) => {
          console.log("Queue update received:", payload);
          
          // Get the updated status from the payload
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            const newStatus = payload.new.status as "waiting" | "almost" | "serving" | "completed" | "cancelled" | "skipped";
            
            // Show notifications based on status change
            if (newStatus === 'almost') {
              toast(
                <div className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-semibold">ใกล้ถึงคิวของคุณแล้ว</div>
                    <div className="text-sm">กรุณามาที่พื้นที่รอเรียกคิว</div>
                  </div>
                </div>,
                { duration: 10000 }
              );
              // Play notification sound
              playNotificationSound(notificationSoundUrl);
            } else if (newStatus === 'serving') {
              toast(
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-semibold">ถึงคิวของคุณแล้ว!</div>
                    <div className="text-sm">กรุณามาที่เคาน์เตอร์บริการทันที</div>
                  </div>
                </div>,
                { duration: 0 } // Won't auto-dismiss
              );
              // Play urgent notification sound
              playNotificationSound(urgentSoundUrl);
            }
            
            // Update the queueData with the new status
            updateQueueData({
              ...queueData,
              status: newStatus
            });
            
            // Fetch updated position if needed
            if (newStatus === 'waiting') {
              const fetchUpdatedPosition = async () => {
                try {
                  const { data: waitingBefore, error } = await supabase
                    .from('queue')
                    .select('ticket_number', { count: 'exact' })
                    .eq('status', 'waiting')
                    .lt('ticket_number', ticketNumber);
                  
                  if (!error) {
                    const position = (waitingBefore?.length || 0) + 1;
                    updateQueueData({
                      ...queueData,
                      status: newStatus,
                      position: position
                    });
                  }
                } catch (error) {
                  console.error("Error fetching updated position:", error);
                }
              };
              fetchUpdatedPosition();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
    
    return () => {
      console.log("Removing channel subscription");
      supabase.removeChannel(specificTicketChannel);
    };
  }, [ticketId, queueData, updateQueueData, notificationSoundUrl, urgentSoundUrl]);
};
