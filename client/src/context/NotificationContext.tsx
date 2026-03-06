import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";

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
  ADVICE_REQUEST: "advice_request",
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
  metadata?: Record<string, any>;
};

type NotificationContextType = {
  notifications: AppNotification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  unreadCount: number;
  refetchNotifications: () => Promise<void>;
  sendNotification: (
    title: string,
    message: string,
    type: NotificationType,
  ) => Promise<void>;
  sendNotificationToUser: (
    targetUserId: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: Record<string, any>,
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
  const [authToken, setAuthToken] = useState<string | null>(null);

  // 🔥 Dynamic API URL
  const API_URL = Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_BASE || "http://10.0.2.2:8000"
    : "http://localhost:8000";

  /* =======================
     HELPER: fetch with auth
  ======================= */
  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token;
    if (!token) {
      console.error("❌ No auth token for API call");
      return null;
    }
    try {
      const resp = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
      return resp;
    } catch (e) {
      console.error(`❌ API fetch failed: ${path}`, e);
      return null;
    }
  };

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

      // Fetch via server API (bypasses RLS)
      const resp = await apiFetch("/api/v1/notifications/my");
      if (resp && resp.ok) {
        const data = await resp.json();
        setNotifications(data as AppNotification[]);
      } else {
        console.error("❌ Fetch notifications failed", resp?.status);
      }
    };

    init();
  }, []);

  /* =======================
     REFETCH NOTIFICATIONS
  ======================= */
  const refetchNotifications = async () => {
    if (!userId) return;

    const resp = await apiFetch("/api/v1/notifications/my");
    if (resp && resp.ok) {
      const data = await resp.json();
      setNotifications(data as AppNotification[]);
    } else {
      console.error("❌ Refetch notifications failed", resp?.status);
    }
  };

  /* =======================
     REFETCH WHEN USER CHANGES
  ======================= */
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    refetchNotifications();
  }, [userId]);
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
     SEND NOTIFICATION TO SPECIFIC USER
  ======================= */
  const sendNotificationToUser = async (
    targetUserId: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: Record<string, any>,
  ) => {
    if (!isNotificationType(type)) {
      console.error(
        `❌ sendNotificationToUser: invalid type "${type}". ` +
        `Allowed: ${[...VALID_NOTIFICATION_TYPES].join(", ")}`,
      );
      return;
    }

    const insertData: any = {
      user_id: targetUserId,
      title,
      message,
      type,
      read: false,
    };

    // Only include metadata if provided (column may not exist yet)
    if (metadata) {
      insertData.metadata = metadata;
    }

    const { error } = await supabase
      .from("notifications")
      .insert(insertData);

    if (error) {
      console.error("❌ Send notification to user failed", error);
      return;
    }

    console.log(`✅ Notification sent to user ${targetUserId}`);
  };

  /* =======================
     DELETE
  ======================= */
  const deleteNotification = async (id: string) => {
    if (!userId) return;

    setNotifications((prev) => prev.filter((n) => n.id !== id));

    const resp = await apiFetch(`/api/v1/notifications/${id}`, { method: "DELETE" });

    if (!resp || !resp.ok) {
      console.error("❌ Delete failed", resp?.status);
      // Refetch to restore correct state
      refetchNotifications();
    }
  };

  /* =======================
     MARK READ
  ======================= */
  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    await apiFetch(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    await apiFetch("/api/v1/notifications/read-all", { method: "PATCH" });
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
        refetchNotifications,
        sendNotification,
        sendNotificationToUser,
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
