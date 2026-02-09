import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

/* =======================
   TYPES
======================= */

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: "price" | "weather" | "system";
  created_at: string;
  read: boolean;
  user_id?: string;
};

type NotificationContextType = {
  notifications: AppNotification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  unreadCount: number;
  sendNotification: (
    title: string,
    message: string,
    type: "price" | "weather" | "system"
  ) => Promise<void>;
};

const NotificationContext =
  createContext<NotificationContextType | null>(null);

/* =======================
   PROVIDER
======================= */

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  /* =======================
     LOAD USER + INITIAL DATA
  ======================= */
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Fetch notifications failed", error);
        return;
      }

      if (data) setNotifications(data);
    };

    init();
  }, []);

  /* =======================
     REALTIME LISTENER (SAFE)
  ======================= */
  useEffect(() => {
    if (!userId) return; // 🔐 IMPORTANT GUARD

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === payload.new.id)) return prev;
              return [payload.new as AppNotification, ...prev];
            });
          }

          if (payload.eventType === "DELETE") {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            );
          }

          if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id
                  ? (payload.new as AppNotification)
                  : n
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  /* =======================
     SEND NOTIFICATION (RLS SAFE)
  ======================= */
  const sendNotification = async (
    title: string,
    message: string,
    type: "price" | "weather" | "system"
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id, // 🔐 MUST MATCH auth.uid()
        title,
        message,
        type,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Send notification failed", error);
      return;
    }

    if (data) {
      setNotifications((prev) => [data as AppNotification, ...prev]);
    }
  };

  /* =======================
     DELETE (RLS SAFE)
  ======================= */
  const deleteNotification = async (id: string) => {
    if (!userId) return;

    // optimistic UI
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Delete failed", error);

      // rollback
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data) setNotifications(data);
    }
  };

  /* =======================
     READ
  ======================= */
  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", userId);
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        unreadCount,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/* =======================
   HOOK
======================= */

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }
  return ctx;
};
