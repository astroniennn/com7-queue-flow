
// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.2";

interface PushSubscription {
  ticket_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  subscription_data: any;
}

interface NotificationPayload {
  ticketId: string;
  status: "almost" | "serving" | "completed";
  title?: string;
  body?: string;
}

// Define the structure for sending web push notifications
interface WebPushConfig {
  subscription: any;
  payload: {
    title: string;
    body: string;
    data?: any;
  };
  options?: {
    vapidDetails: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
    TTL?: number;
    urgency?: string;
  };
}

// Helper function to send a web push notification
async function sendNotification(config: WebPushConfig): Promise<Response> {
  try {
    const response = await fetch("https://web-push-api.deno.dev/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    
    console.log("Web push response status:", response.status);
    const responseData = await response.json();
    
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

serve(async (req) => {
  // Get environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
  const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:example@example.com";
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  // Handle the actual request
  if (req.method === "POST") {
    try {
      const { ticketId, status, title, body } = await req.json() as NotificationPayload;
      
      if (!ticketId || !status) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }), 
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // Get the subscription from the database
      const { data: subscriptions, error: fetchError } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("ticket_id", ticketId);
      
      if (fetchError) {
        console.error("Error fetching subscription:", fetchError);
        return new Response(
          JSON.stringify({ error: "Error fetching subscription", details: fetchError }), 
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      
      if (!subscriptions || subscriptions.length === 0) {
        return new Response(
          JSON.stringify({ message: "No subscription found for this ticket" }), 
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // Determine notification content based on status
      let notificationTitle = title || "คิวของคุณ";
      let notificationBody = body || "มีการอัปเดตสถานะคิวของคุณ";
      
      switch (status) {
        case "almost":
          notificationTitle = title || "ใกล้ถึงคิวของคุณแล้ว";
          notificationBody = body || "กรุณามาที่พื้นที่รอเรียกคิว";
          break;
        case "serving":
          notificationTitle = title || "ถึงคิวของคุณแล้ว!";
          notificationBody = body || "กรุณามาที่เคาน์เตอร์บริการทันที";
          break;
        case "completed":
          notificationTitle = title || "บริการเสร็จสิ้นแล้ว";
          notificationBody = body || "ขอบคุณที่ใช้บริการ";
          break;
      }
      
      // Send notification to each subscription
      const results = await Promise.all(
        subscriptions.map(async (sub: PushSubscription) => {
          const subscription = sub.subscription_data;
          
          // Check if the subscription is valid
          if (!subscription || !subscription.endpoint) {
            console.error("Invalid subscription:", subscription);
            return { error: "Invalid subscription", status: "failed" };
          }
          
          console.log("Sending push notification to:", subscription.endpoint);
          
          const pushConfig: WebPushConfig = {
            subscription,
            payload: {
              title: notificationTitle,
              body: notificationBody,
              data: {
                url: `/queue-status/${ticketId}`,
                status,
                ticketId,
              }
            },
            options: {
              vapidDetails: {
                subject: vapidSubject,
                publicKey: vapidPublicKey,
                privateKey: vapidPrivateKey,
              },
              TTL: 60 * 60, // 1 hour
              urgency: status === "serving" ? "high" : "normal",
            },
          };
          
          try {
            const pushResponse = await sendNotification(pushConfig);
            const responseData = await pushResponse.json();
            return { endpoint: subscription.endpoint, status: "sent", response: responseData };
          } catch (error) {
            console.error("Error sending push notification:", error);
            return { endpoint: subscription.endpoint, status: "failed", error: error.message };
          }
        })
      );
      
      return new Response(
        JSON.stringify({ message: "Notifications processed", results }), 
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  
  // Return method not allowed for other methods
  return new Response(
    JSON.stringify({ error: "Method not allowed" }), 
    { status: 405, headers: { "Content-Type": "application/json" } }
  );
});
