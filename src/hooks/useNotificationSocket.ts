import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export type Notification = {
  notificationId: number;
  typeCode: string;
  methodCode: string;
  title: string;
  message: string;
  url?: string;
  isRead: boolean;
  createdAt: string;
};

export function useNotificationSocket() {
  const clientRef = useRef<Stomp.Client | null>(null);
  const isConnectedRef = useRef(false);
  const subscriptionRef = useRef<Stomp.Subscription | null>(null);
  const broadcastSubscriptionRef = useRef<Stomp.Subscription | null>(null);
  const readSubscriptionRef = useRef<Stomp.Subscription | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = useCallback((notifications: Notification[]) => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, []);

  const onNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      const updated = [notification, ...prev];
      updateUnreadCount(updated);
      return updated;
    });
    
    // 브라우저 알림 표시
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico"
      });
    }
  }, [updateUnreadCount]);

  const onNotificationRead = useCallback((notificationId: number) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.notificationId === notificationId 
          ? { ...n, isRead: true }
          : n
      );
      updateUnreadCount(updated);
      return updated;
    });
  }, [updateUnreadCount]);

  const connect = useCallback(() => {
    if (isConnectedRef.current || !localStorage.getItem("accessToken")) return;

    console.log("Connecting to notification WebSocket...");
    isConnectedRef.current = true;

    const wsUrl =
      window.location.hostname === "localhost"
        ? `${import.meta.env.VITE_BACKEND_BASE_URL}/ws/notifications`
        : `${window.location.protocol}//${window.location.host}/ws/notifications`;

    const sock = new SockJS(wsUrl);
    const stomp = Stomp.over(sock);

    stomp.heartbeat.outgoing = 25000;
    stomp.heartbeat.incoming = 25000;
    stomp.debug = () => {};
    clientRef.current = stomp;

    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    stomp.connect(
      headers,
      () => {
        console.log("Connected to notification WebSocket");
        reconnectAttempts.current = 0;

        // 개인 알림 구독
        subscriptionRef.current = stomp.subscribe(
          "/user/topic/notifications",
          (message) => {
            try {
              const notification = JSON.parse(message.body);
              console.log("새 알림 수신:", notification.title);
              onNewNotification(notification);
            } catch (error) {
              console.error("알림 파싱 실패:", error);
            }
          }
        );

        // 브로드캐스트 알림 구독
        broadcastSubscriptionRef.current = stomp.subscribe(
          "/topic/notifications/broadcast",
          (message) => {
            try {
              const notification = JSON.parse(message.body);
              console.log("브로드캐스트 알림 수신:", notification.title);
              onNewNotification(notification);
            } catch (error) {
              console.error("브로드캐스트 알림 파싱 실패:", error);
            }
          }
        );

        // 읽음 처리 알림 구독
        readSubscriptionRef.current = stomp.subscribe(
          "/user/topic/notifications/read",
          (message) => {
            try {
              const notificationId = JSON.parse(message.body);
              console.log("알림 읽음 처리:", notificationId);
              onNotificationRead(notificationId);
            } catch (error) {
              console.error("읽음 처리 파싱 실패:", error);
            }
          }
        );

        // 구독 시 기존 알림 목록 요청
        stomp.subscribe("/topic/notifications", (message) => {
          try {
            const existingNotifications = JSON.parse(message.body);
            if (Array.isArray(existingNotifications)) {
              console.log("기존 알림 목록 로드:", existingNotifications.length);
              setNotifications(existingNotifications);
              updateUnreadCount(existingNotifications);
            }
          } catch (error) {
            console.error("기존 알림 로드 실패:", error);
          }
        });
      },
      (error) => {
        console.error("Notification WebSocket connection failed:", error);
        isConnectedRef.current = false;

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(
            `알림 웹소켓 재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts}`
          );
          setTimeout(() => {
            isConnectedRef.current = false;
            connect();
          }, reconnectDelay);
        }
      }
    );
  }, [onNewNotification, onNotificationRead, updateUnreadCount]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (broadcastSubscriptionRef.current) {
      broadcastSubscriptionRef.current.unsubscribe();
      broadcastSubscriptionRef.current = null;
    }
    if (readSubscriptionRef.current) {
      readSubscriptionRef.current.unsubscribe();
      readSubscriptionRef.current = null;
    }
    if (clientRef.current?.connected) {
      clientRef.current.disconnect(() => {
        console.log("Notification WebSocket disconnected");
      });
    }
    isConnectedRef.current = false;
  }, []);

  const markAsRead = useCallback((notificationId: number) => {
    const stomp = clientRef.current;
    if (!stomp || !stomp.connected) return;

    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    stomp.send("/app/notifications/markRead", headers, JSON.stringify(notificationId));
  }, []);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    connect,
    disconnect,
    markAsRead,
    isConnected: isConnectedRef.current
  };
}