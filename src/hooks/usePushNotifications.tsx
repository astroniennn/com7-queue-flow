
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Convert a base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// VAPID public key - this should be generated and stored securely
// For this demo we'll use a placeholder key
const VAPID_PUBLIC_KEY = 'BFIoCB2YlG8Rjzr2O_jXNYYvzD-YEjxvD3weP9UfABf9PKsb4SifHJng-FxJ2tH1rdRb2_gxMPxIhr093IUfOmY';

export const usePushNotifications = (ticketId?: string) => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        // Check permission status
        const permission = Notification.permission;
        setIsSubscribed(permission === 'granted');
        
        // If permission is granted, get the subscription
        if (permission === 'granted') {
          try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();
            setSubscription(existingSubscription);
            setIsSubscribed(!!existingSubscription);
          } catch (error) {
            console.error('Error checking subscription:', error);
          }
        }
      }
    };
    
    checkSupport();
  }, []);
  
  // Register the service worker
  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service worker registered:', registration);
        return registration;
      }
      throw new Error('Service workers are not supported');
    } catch (error) {
      console.error('Error registering service worker:', error);
      throw error;
    }
  };
  
  // Subscribe to push notifications
  const subscribeToNotifications = async () => {
    setIsRegistering(true);
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
      
      // Register service worker if not already registered
      let serviceWorkerRegistration;
      try {
        serviceWorkerRegistration = await navigator.serviceWorker.ready;
      } catch (error) {
        serviceWorkerRegistration = await registerServiceWorker();
      }
      
      // Get push subscription
      const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        // Already subscribed
        setSubscription(existingSubscription);
        setIsSubscribed(true);
        await saveSubscription(existingSubscription, ticketId);
        return existingSubscription;
      }
      
      // Create new subscription
      const newSubscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      // Save the subscription to our backend
      await saveSubscription(newSubscription, ticketId);
      
      setSubscription(newSubscription);
      setIsSubscribed(true);
      
      toast.success("การแจ้งเตือนแบบพุชได้ถูกเปิดใช้งานแล้ว");
      
      return newSubscription;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error(`ไม่สามารถเปิดการแจ้งเตือนได้: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    } finally {
      setIsRegistering(false);
    }
  };
  
  // Unsubscribe from push notifications
  const unsubscribeFromNotifications = async () => {
    try {
      if (!subscription) return false;
      
      // Unsubscribe from push service
      await subscription.unsubscribe();
      
      // Delete subscription from our backend
      if (ticketId) {
        // Using direct database call instead of RPC to avoid TypeScript issues
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('ticket_id', ticketId);
        
        if (error) {
          console.error('Error deleting subscription from database:', error);
          throw error;
        }
      }
      
      setSubscription(null);
      setIsSubscribed(false);
      
      toast.success("การแจ้งเตือนแบบพุชได้ถูกปิดการใช้งานแล้ว");
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast.error(`ไม่สามารถยกเลิกการแจ้งเตือนได้: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };
  
  // Save subscription to our backend
  const saveSubscription = async (subscription: PushSubscription, ticketId?: string) => {
    if (!ticketId) return;
    
    try {
      // Convert subscription to JSON to store in database
      const subscriptionJSON = subscription.toJSON();
      
      // Using direct database upsert instead of RPC to avoid TypeScript issues
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          ticket_id: ticketId,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJSON.keys?.p256dh || '',
          auth: subscriptionJSON.keys?.auth || '',
          subscription_data: subscriptionJSON as any // Cast to any to satisfy Json type
        }, {
          onConflict: 'ticket_id'
        });
      
      if (error) {
        console.error('Error saving subscription to database:', error);
        throw error;
      }
      
      console.log('Subscription saved successfully');
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  };
  
  return {
    isSupported,
    isSubscribed,
    subscription,
    isRegistering,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
};
