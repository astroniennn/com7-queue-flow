
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, AlertCircle } from "lucide-react";
import { getSettingsByCategory, getDefaultNotificationSettings } from "@/services/settingsService";

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
  const audioTestRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  
  // Check if audio is allowed and initialize audio context if needed
  useEffect(() => {
    const checkAudioPermission = async () => {
      try {
        // Create a silent audio context to unblock audio in browsers that require user interaction
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const audioContext = new AudioContext();
          
          if (audioContext.state === "suspended") {
            // Try to resume the audio context
            await audioContext.resume();
          }
          
          console.log("Audio context state:", audioContext.state);
          setIsAudioEnabled(audioContext.state === "running");
          
          // Create a test audio element and try to play it (will be silent)
          const testAudio = new Audio();
          testAudio.volume = 0.01; // Almost silent
          testAudio.src = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==";
          
          testAudio.oncanplaythrough = () => {
            const playPromise = testAudio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("Audio playback is allowed");
                  setIsAudioEnabled(true);
                })
                .catch(e => {
                  console.warn("Audio playback was prevented:", e);
                  setIsAudioEnabled(false);
                });
            }
          };
          
          audioTestRef.current = testAudio;
        }
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    };
    
    checkAudioPermission();
    
    // Cleanup
    return () => {
      if (audioTestRef.current) {
        audioTestRef.current.pause();
        audioTestRef.current = null;
      }
    };
  }, []);

  // Fetch notification sound settings
  useEffect(() => {
    const fetchNotificationSounds = async () => {
      try {
        // First try to get notification settings using getDefaultNotificationSettings
        const defaultSettings = await getDefaultNotificationSettings();
        console.log("Default notification settings:", defaultSettings);
        
        if (defaultSettings) {
          if (defaultSettings.almostSound) {
            console.log("Using custom almost sound:", defaultSettings.almostSound);
            setNotificationSoundUrl(defaultSettings.almostSound);
            // Pre-load sound
            preloadSound(defaultSettings.almostSound);
          }
          
          if (defaultSettings.servingSound) {
            console.log("Using custom serving sound:", defaultSettings.servingSound);
            setUrgentSoundUrl(defaultSettings.servingSound);
            // Pre-load sound
            preloadSound(defaultSettings.servingSound);
          }
        } else {
          // Fallback to fetching notification settings directly
          const notificationSettings = await getSettingsByCategory("notification");
          const defaultSounds = notificationSettings.find(setting => setting.key === "default_sounds");
          
          if (defaultSounds && defaultSounds.value) {
            let sounds;
            try {
              sounds = typeof defaultSounds.value === 'string' ? 
                        JSON.parse(defaultSounds.value) : 
                        defaultSounds.value;
                        
              if (sounds.almostSound) {
                console.log("Using custom almost sound (direct):", sounds.almostSound);
                setNotificationSoundUrl(sounds.almostSound);
                // Pre-load sound
                preloadSound(sounds.almostSound);
              }
              
              if (sounds.servingSound) {
                console.log("Using custom serving sound (direct):", sounds.servingSound);
                setUrgentSoundUrl(sounds.servingSound);
                // Pre-load sound
                preloadSound(sounds.servingSound);
              }
            } catch (parseError) {
              console.error("Error parsing notification sound settings:", parseError);
            }
          }
        }
        
        // Preload default sounds as fallback
        preloadSound("/notification.mp3");
        preloadSound("/urgent-notification.mp3");
      } catch (error) {
        console.error("Error fetching notification sound settings:", error);
      }
    };
    
    fetchNotificationSounds();
  }, []);

  // Preload sound function
  const preloadSound = (soundUrl: string) => {
    try {
      if (!audioCache[soundUrl]) {
        console.log("Preloading sound:", soundUrl);
        const audio = new Audio(soundUrl);
        
        // Add event listeners for debugging
        audio.addEventListener('canplaythrough', () => {
          console.log(`Sound loaded successfully: ${soundUrl}`);
        });
        
        audio.addEventListener('error', (e) => {
          console.error(`Error loading sound ${soundUrl}:`, e);
        });
        
        audio.load();
        audioCache[soundUrl] = audio;
      }
    } catch (error) {
      console.error("Error preloading sound:", error);
    }
  };

  // Play notification sound function with robust error handling
  const playNotificationSound = (soundUrl: string) => {
    console.log("Attempting to play sound:", soundUrl);
    
    if (!isAudioEnabled) {
      console.warn("Audio playback seems to be blocked by browser. Attempting to unblock...");
      // Try to unblock audio with a user interaction if possible
      if (audioTestRef.current) {
        const unblockPromise = audioTestRef.current.play();
        if (unblockPromise !== undefined) {
          unblockPromise
            .then(() => {
              console.log("Audio unblocked successfully");
              setIsAudioEnabled(true);
              // Now try to play the actual notification
              attemptSoundPlay(soundUrl);
            })
            .catch(e => {
              console.error("Could not unblock audio:", e);
            });
        }
      }
      return;
    }
    
    attemptSoundPlay(soundUrl);
  };
  
  // Helper function to attempt sound playback with multiple fallback options
  const attemptSoundPlay = (soundUrl: string) => {
    try {
      // Try to use cached audio object if available
      if (audioCache[soundUrl]) {
        console.log("Using cached audio object for:", soundUrl);
        const cachedAudio = audioCache[soundUrl];
        
        // Reset audio to beginning in case it was already played
        cachedAudio.currentTime = 0;
        cachedAudio.volume = 1.0;
        
        // Create play promise and handle it
        const playPromise = cachedAudio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log("Audio playback started successfully"))
            .catch(error => {
              console.error("Error playing cached audio:", error);
              // Fallback to creating a new Audio object
              fallbackPlaySound(soundUrl);
            });
        }
      } else {
        // Create new Audio object if not cached
        fallbackPlaySound(soundUrl);
      }
    } catch (error) {
      console.error("Error in playNotificationSound:", error);
      // Final fallback - try with default system sounds
      const defaultSound = soundUrl.includes("urgent") ? "/urgent-notification.mp3" : "/notification.mp3";
      console.log("Attempting to play default sound:", defaultSound);
      try {
        const audio = new Audio(defaultSound);
        audio.play().catch(e => console.error("Final fallback audio play error:", e));
      } catch (finalError) {
        console.error("Could not play any notification sound:", finalError);
      }
    }
  };
  
  // Fallback play function
  const fallbackPlaySound = (soundUrl: string) => {
    console.log("Creating new audio object for:", soundUrl);
    const audio = new Audio(soundUrl);
    audio.volume = 1.0;
    
    // Cache the audio object for future use
    audioCache[soundUrl] = audio;
    
    // Play the sound
    audio.play().catch(e => {
      console.error("Audio play error:", e);
      // Try one more time with a user interaction if needed
      document.addEventListener('click', function playOnClick() {
        console.log("Attempting to play on user interaction");
        audio.play().catch(err => console.error("Play on click failed:", err));
        document.removeEventListener('click', playOnClick);
      }, { once: true });
    });
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
  }, [ticketId, queueData, updateQueueData, notificationSoundUrl, urgentSoundUrl, isAudioEnabled]);
};
