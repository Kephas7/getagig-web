"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getAuthToken } from "@/lib/cookies";
import { toast } from "@/lib/toast";
import { usePathname } from "next/navigation";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  clearUnread: () => void;
  notifCount: number;
  clearNotifCount: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  unreadCount: 0,
  clearUnread: () => {},
  notifCount: 0,
  clearNotifCount: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  const clearUnread = useCallback(() => setUnreadCount(0), []);
  const clearNotifCount = useCallback(() => setNotifCount(0), []);

  const userId = user?._id || (user as any)?.id || null;

  // ── Load initial unread counts from the backend ───────────────────────────
  useEffect(() => {
    // Wait until auth is done loading and we have a real user
    if (authLoading || !user || !userId) return;

    const loadInitialCounts = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        const API_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

        // Use fetch directly to avoid any axiosInstance quirks (e.g. base URL env issues)
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) {
          console.warn("Notifications fetch failed:", res.status);
          return;
        }

        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          const notifications: any[] = data.data;

          const msgUnread = notifications.filter(
            (n) => n.type === "new_message" && !n.isRead
          ).length;

          const generalUnread = notifications.filter(
            (n) => n.type !== "new_message" && !n.isRead
          ).length;

          if (!pathname?.startsWith("/messages")) {
            setUnreadCount(msgUnread);
          }
          if (!pathname?.startsWith("/notifications")) {
            setNotifCount(generalUnread);
          }
        }
      } catch (err) {
        console.warn("Could not load initial notification counts:", err);
      }
    };

    loadInitialCounts();
  }, [user, authLoading]); // Re-run when auth state resolves

  // ── Socket connection ─────────────────────────────────────────────────────
  useEffect(() => {
    let socketInstance: Socket | null = null;

    const connectSocket = async () => {
      const token = await getAuthToken();
      if (!token || !user) {
        if (socketInstance) {
          socketInstance.disconnect();
          setSocket(null);
          setIsConnected(false);
        }
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

      socketInstance = io(API_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        setIsConnected(true);
        socketInstance?.emit("joinPersonalRoom", userId);
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      // New real-time message → bump message badge if not viewing that chat
      socketInstance.on("newMessage", (message: any) => {
        const isViewingConversation = pathname?.startsWith(
          `/messages/${message.conversationId}`
        );
        if (!isViewingConversation) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      // New general notification → bump notif badge + show toast
      socketInstance.on("receiveNotification", (notif: any) => {
        if (notif?.type === "new_message") {
          if (!pathname?.startsWith("/messages")) {
            setUnreadCount((prev) => prev + 1);
          }
          toast.info(`💬 ${notif.title}`);
        } else {
          if (!pathname?.startsWith("/notifications")) {
            setNotifCount((prev) => prev + 1);
          }
          if (notif?.type === "application_accepted") {
            toast.success(`🎉 ${notif.title}: ${notif.content}`);
          } else if (notif?.type === "application_rejected") {
            toast.error(`❌ ${notif.title}`);
          } else if (notif?.type === "new_application") {
            toast.info(`📋 ${notif.title}`);
          } else if (notif?.type) {
            toast.info(notif.title || "You have a new notification.");
          }
        }
      });

      setSocket(socketInstance);
    };

    connectSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  // Auto-clear counts when visiting the relevant pages
  useEffect(() => {
    if (pathname?.startsWith("/messages")) {
      setUnreadCount(0);
    }
    if (pathname?.startsWith("/notifications")) {
      setNotifCount(0);
    }
  }, [pathname]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        unreadCount,
        clearUnread,
        notifCount,
        clearNotifCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
