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
};

type NotificationContextType = {
  notifications: AppNotification[];
  addNotification: (n: {
    title: string;
    message: string;
    type: "price" | "weather" | "system";
  }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  unreadCount: number;
};

/* =======================
   CONTEXT
======================= */

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

  /* =======================
     LOAD ON APP START
  ======================= */
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id) // ✅ SECURITY FILTER
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  };

  /* =======================
     REALTIME LISTENER
  ======================= */
  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new as AppNotification,
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* =======================
     ADD NOTIFICATION
     (WITH DUPLICATE CHECK)
  ======================= */
  const addNotification = async ({
    title,
    message,
    type,
  }: {
    title: string;
    message: string;
    type: "price" | "weather" | "system";
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 🚫 DUPLICATE PREVENTION (last 6 hours)
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", type)
      .ilike("title", `%${title}%`)
      .gte(
        "created_at",
        new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      )
      .limit(1);

    if (existing && existing.length > 0) return;

    // ✅ INSERT
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title,
        message,
        type,
      })
      .select()
      .single();

    if (!error && data) {
      setNotifications((prev) => [data, ...prev]);
    }
  };

  /* =======================
     MARK SINGLE AS READ
  ======================= */
  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
  };

  /* =======================
     MARK ALL AS READ
  ======================= */
  const markAllAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
  };

  /* =======================
     UNREAD COUNT
  ======================= */
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
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
