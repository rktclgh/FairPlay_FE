import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { isAuthenticated } from "../utils/authGuard";

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
    console.log("📨 onNewNotification 호출됨:", notification);
    setNotifications(prev => {
      console.log("📨 이전 알림 목록:", prev.length);
      // 중복 방지: 같은 ID의 알림이 이미 있는지 확인
      const exists = prev.some(n => n.notificationId === notification.notificationId);
      if (exists) {
        console.log("📨 중복 알림 무시:", notification.notificationId);
        return prev;
      }
      const updated = [notification, ...prev];
      console.log("📨 새 알림 추가 후 목록:", updated.length);
      updateUnreadCount(updated);
      return updated;
    });
    
    // 브라우저 알림 표시 (iOS Safari 호환)
    if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
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

  const onNotificationDeleted = useCallback((notificationId: number) => {
    console.log("🗑️ 알림 삭제 완료:", notificationId);
    setNotifications(prev => {
      const updated = prev.filter(n => n.notificationId !== notificationId);
      updateUnreadCount(updated);
      return updated;
    });
  }, [updateUnreadCount]);

  const connect = useCallback(() => {
    if (isConnectedRef.current || !isAuthenticated()) return;

    console.log("Connecting to notification WebSocket...");
    isConnectedRef.current = true;

    const token = localStorage.getItem("accessToken");
    
    // SockJS fallback 엔드포인트 사용
    const sockjsUrl = window.location.hostname === "localhost"
      ? `${import.meta.env.VITE_BACKEND_BASE_URL}/ws/notifications-sockjs`
      : `${window.location.protocol}//${window.location.host}/ws/notifications-sockjs`;
    
    console.log(`SockJS connecting to: ${sockjsUrl}`);
    
    const sock = new SockJS(token ? `${sockjsUrl}?token=${token}` : sockjsUrl);
    const stomp = Stomp.over(sock);

    stomp.heartbeat.outgoing = 25000;
    stomp.heartbeat.incoming = 25000;
    stomp.debug = () => {};
    clientRef.current = stomp;

    // STOMP CONNECT 헤더에 토큰 추가
    const connectHeaders: any = {};
    if (token) {
      connectHeaders['Authorization'] = `Bearer ${token}`;
    }

    stomp.connect(
      connectHeaders,
      () => {
        console.log("Connected to notification WebSocket");
        reconnectAttempts.current = 0;

        console.log("🔌 웹소켓 연결 성공, 구독 시작");
        
        // 기존 알림 목록 직접 요청 (REST API 호출)
        const fetchExistingNotifications = async () => {
          try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;
            
            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/notifications`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const existingNotifications = await response.json();
              console.log("🔄 REST API로 기존 알림 목록 로드:", existingNotifications.length);
              console.log("🔄 기존 알림 데이터:", existingNotifications);
              setNotifications(existingNotifications);
              updateUnreadCount(existingNotifications);
            } else {
              console.log("📋 기존 알림 없음 또는 로드 실패");
              setNotifications([]);
              updateUnreadCount([]);
            }
          } catch (error) {
            console.error("기존 알림 로드 실패:", error);
            setNotifications([]);
            updateUnreadCount([]);
          }
        };
        
        // 기존 알림 로드
        fetchExistingNotifications();

        // 잠시 후 개인 알림 구독 (기존 알림 로드 후)
        setTimeout(() => {
          // 개인 알림 구독
          subscriptionRef.current = stomp.subscribe(
            "/user/topic/notifications",
            (message) => {
              try {
                const notification = JSON.parse(message.body);
                console.log("📨 새 개인 알림 수신:", notification);
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
                console.log("📢 브로드캐스트 알림 수신:", notification);
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
                console.log("✅ 알림 읽음 처리:", notificationId);
                onNotificationRead(notificationId);
              } catch (error) {
                console.error("읽음 처리 파싱 실패:", error);
              }
            }
          );

          // 삭제 처리 알림 구독
          const deleteSubscriptionRef = stomp.subscribe(
            "/user/topic/notifications/deleted",
            (message) => {
              try {
                const notificationId = JSON.parse(message.body);
                console.log("🗑️ 알림 삭제 처리:", notificationId);
                onNotificationDeleted(notificationId);
              } catch (error) {
                console.error("삭제 처리 파싱 실패:", error);
              }
            }
          );
          
          console.log("🔔 실시간 알림 구독 완료");
        }, 100);
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
  }, [onNewNotification, onNotificationRead, onNotificationDeleted, updateUnreadCount]);

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

  const deleteNotification = useCallback((notificationId: number) => {
    const stomp = clientRef.current;
    if (!stomp || !stomp.connected) {
      console.warn("WebSocket 연결되지 않음 - 삭제 불가");
      return false;
    }

    // 1. 즉시 UI에서 제거 (아이폰 스타일)
    console.log("🗑️ 즉시 로컬에서 알림 제거:", notificationId);
    setNotifications(prev => {
      const updated = prev.filter(n => n.notificationId !== notificationId);
      updateUnreadCount(updated);
      return updated;
    });

    // 2. 백엔드로 soft delete 요청
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log("🗑️ WebSocket으로 알림 삭제 요청:", notificationId);
    stomp.send("/app/notifications/delete", headers, JSON.stringify(notificationId));
    return true;
  }, [updateUnreadCount]);

  // 브라우저 알림 권한 요청 (iOS Safari 호환)
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    connect,
    disconnect,
    markAsRead,
    deleteNotification,
    isConnected: isConnectedRef.current
  };
}