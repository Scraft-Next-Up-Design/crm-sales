import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "./use-toast";
import { useLeadNotificationQuery } from "@/lib/store/services/leadsApi";
import { useGetActiveWorkspaceQuery } from "@/lib/store/services/workspace";

interface LeadNotification {
  id: string;
  created_at: string;
  lead_id: string;
  action_type: string;
  user_id: string;
  workspace_id: string;
  details: any;
  read: boolean;
}

export default function useLeadNotifications() {
  const [notifications, setNotifications] = useState<LeadNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const { data: activeWorkspace } = useGetActiveWorkspaceQuery();
  const workspaceId = activeWorkspace?.data?.id;
  
  // Get current user ID from Supabase auth
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

 
  const { data, refetch } = useLeadNotificationQuery({
    workspaceId: workspaceId,
  }, {
    skip: !workspaceId,
    pollingInterval: 30000, 
  });

  // Update state when data changes
  useEffect(() => {
    if (data?.data) {
      setNotifications(data.data);
      setUnreadCount(data.data.filter((n: LeadNotification) => !n.read).length);
    }
  }, [data]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!workspaceId || !userId) return;

    console.log("Subscribing to Supabase notifications for workspace:", workspaceId);

    const channel = supabase
      .channel(`workspace-notifications-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log("Received new notification:", payload);
          const newNotification = payload.new as LeadNotification;
          
          // Add notification to the state and show toast
          setNotifications((prev) => [newNotification, ...prev]);
          
          // Only increment unread count if it's for the current user
          if (newNotification.user_id === userId) {
            setUnreadCount((prev) => prev + 1);
          }
          
          showNotificationToast(newNotification);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log("Notification updated:", payload);
          const updatedNotification = payload.new as LeadNotification;
          
          setNotifications((prev) => 
            prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
          );
          
          // Update unread count if read status changed
          if (updatedNotification.read && updatedNotification.user_id === userId) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Unsubscribing from Supabase notifications");
      supabase.removeChannel(channel);
    };
  }, [workspaceId, userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }

      setNotifications((prev) => 
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!workspaceId || !userId) return;
    
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .eq("read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return;
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      
      // Refresh the data
      refetch();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const showNotificationToast = (notification: LeadNotification) => {
    let title = "New Notification";
    let message = "";
    
    switch (notification.action_type) {
      case "created":
        title = "New Lead Created";
        message = `Lead created: ${notification.details?.lead_name || "Unnamed lead"}`;
        break;
      case "bulk_created":
        title = "Leads Imported";
        message = `${notification.details?.count || "Multiple"} new leads were imported`;
        break;
      case "updated":
        title = "Lead Updated";
        message = `Lead updated: ${notification.details?.lead_name || ""}`;
        break;
      case "notes_updated":
        title = "Notes Updated";
        message = `Notes updated for a lead`;
        break;
      case "assigned":
        title = "Lead Assigned";
        message = `Lead assigned: ${notification.details?.lead_name || ""}`;
        break;
      case "leads_deleted":
        title = "Leads Deleted";
        message = `${notification.details?.lead_count || "Multiple"} leads were deleted`;
        break;
      case "data_updated":
        title = "Lead Data Updated";
        message = `Data updated for ${notification.details?.lead_name || "a lead"}`;
        break;
      default:
        title = "Lead Activity";
        message = "There was activity on a lead";
    }

    toast({
      title: title,
      description: message,
      duration: 5000,
    });
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetchNotifications: refetch,
  };
}