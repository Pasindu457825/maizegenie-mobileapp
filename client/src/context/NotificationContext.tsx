import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../services/api";

/* =======================
   TYPES
======================= */

/**
 * Single source of truth for notification types.
 * - The `as const` assertion makes each value a literal type,
 *   not just `string`, giving full autocomplete and exhaustive checks.
 * - Adding a new type here automatically widens NotificationType everywhere.
 * - Remember to keep the DB constraint / ENUM in sync (see migration).
 */
export const NOTIFICATION_TYPE = {
  PRICE: "price",
  WEATHER: "weather",
  SYSTEM: "system",
  OFFER: "offer",
  MESSAGE: "message",
  MARKETPLACE: "marketplace",
} as const;

/** Derives the union type from the object — no duplication. */
export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

/** Runtime set for validating values coming from the DB or API. */
export const VALID_NOTIFICATION_TYPES = new Set<string>(
  Object.values(NOTIFICATION_TYPE),
);

/** Type guard — narrows an unknown string to NotificationType. */
export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === "string" && VALID_NOTIFICATION_TYPES.has(value);
}

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
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
    type: NotificationType,
  ) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

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
  const [token, setToken] = useState<string | null>(null);

  /* =======================
     LISTEN FOR AUTH CHANGES & LOAD INITIAL DATA
  ======================= */
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Get current user from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // User is not logged in, clear everything
        if (mounted) {
          setUserId(null);
          setToken(null);
          setNotifications([]);
        }
        return;
      }

      // Get the token for API requests
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.warn("⚠️ No access token available");
        return;
      }

      if (mounted) {
        setUserId(user.id);
        setToken(session.access_token);
      }

      // Fetch notifications from authenticated server endpoint
      await fetchNotificationsFromServer(session.access_token);
    };

    initAuth();

    // Listen for auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔐 Auth state changed: ${event}`);

      if (event === "SIGNED_OUT" || !session) {
        // User logged out - clear everything
        if (mounted) {
          setUserId(null);
          setToken(null);
          setNotifications([]);
        }
      } else if (event === "SIGNED_IN" && session?.user) {
        // User signed in - load their notifications
        if (mounted) {
          setUserId(session.user.id);
          setToken(session.access_token);
        }
        await fetchNotificationsFromServer(session.access_token);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /* =======================
     FETCH FROM SERVER WITH AUTH
  ======================= */
  const fetchNotificationsFromServer = async (accessToken: string) => {
    if (!accessToken) return;

    try {
      const response = await axios.get(`${API_BASE}/api/notifications/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data?.notifications) {
        setNotifications(response.data.notifications as AppNotification[]);
      }
    } catch (error: any) {
      const errorDetail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      
      console.error(
        "❌ Failed to fetch notifications from server:",
        {
          status: error.response?.status,
          detail: errorDetail,
          fullError: error.response?.data,
        }
      );
      // Don't clear notifications on fetch error - keep stale data
    }
  };

  /* =======================
     REALTIME LISTENER
  ======================= */
  useEffect(() => {
    if (!userId) return;

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
              prev.filter((n) => n.id !== payload.old.id),
            );
          }

          if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? (payload.new as AppNotification) : n,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  /* =======================
     SEND NOTIFICATION
  ======================= */
  const sendNotification = async (
    title: string,
    message: string,
    type: NotificationType,
  ) => {
    // Runtime guard: catches any value that slipped past TypeScript,
    // e.g. a raw string from an API response or a future refactor mistake,
    // before it reaches Supabase and triggers a constraint violation.
    if (!isNotificationType(type)) {
      console.error(
        `❌ sendNotification: invalid type "${type}". ` +
          `Allowed: ${[...VALID_NOTIFICATION_TYPES].join(", ")}`,
      );
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
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
     DELETE
  ======================= */
  const deleteNotification = async (id: string) => {
    if (!token) return;

    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      await axios.delete(`${API_BASE}/api/notifications/delete`, {
        data: { notification_id: id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      const errorDetail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      
      console.error("❌ Delete failed:", {
        status: error.response?.status,
        detail: errorDetail,
        id,
      });

      // Reload notifications on error
      if (token) {
        await fetchNotificationsFromServer(token);
      }
    }
  };

  /* =======================
     MARK READ
  ======================= */
  const markAsRead = async (id: string) => {
    if (!token) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    try {
      await axios.post(
        `${API_BASE}/api/notifications/mark-as-read`,
        { notification_id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error: any) {
      const errorDetail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      
      console.error("❌ Mark as read failed:", {
        status: error.response?.status,
        detail: errorDetail,
        id,
      });
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await axios.post(
        `${API_BASE}/api/notifications/mark-all-as-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error: any) {
      const errorDetail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      
      console.error("❌ Mark all as read failed:", {
        status: error.response?.status,
        detail: errorDetail,
      });
    }
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
      "useNotifications must be used inside NotificationProvider",
    );
  }
  return ctx;
};