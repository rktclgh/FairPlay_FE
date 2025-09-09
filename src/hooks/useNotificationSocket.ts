import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { useAuth } from "../context/AuthContext";

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
  const { isAuthenticated } = useAuth();
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

  // ================================= 중복 읽음 처리 방지 =================================
  const onNotificationRead = useCallback((notificationId: number) => {
    console.log('📩 백엔드에서 읽음 처리 응답:', notificationId);
    
    setNotifications(prev => {
      const notification = prev.find(n => n.notificationId === notificationId);
      if (!notification) {
        console.log('📩 해당 알림 없음:', notificationId);
        return prev;
      }
      
      if (notification.isRead) {
        console.log('📩 이미 읽음 처리된 알림 (스킵):', notificationId);
        return prev; // 이미 읽음 처리된 경우 상태 변경 없음
      }
      
      console.log('📩 백엔드 응답으로 읽음 상태 업데이트:', notificationId);
      const updated = prev.map(n => 
        n.notificationId === notificationId 
          ? { ...n, isRead: true }
          : n
      );
      updateUnreadCount(updated);
      return updated;
    });
  }, [updateUnreadCount]);
  // ===============================================================================

  const onNotificationDeleted = useCallback((notificationId: number) => {
    console.log("🗑️ 알림 삭제 완료:", notificationId);
    setNotifications(prev => {
      const updated = prev.filter(n => n.notificationId !== notificationId);
      updateUnreadCount(updated);
      return updated;
    });
  }, [updateUnreadCount]);

  const connect = useCallback(() => {
    if (isConnectedRef.current || !isAuthenticated) return;

    console.log("Connecting to notification WebSocket...");
    isConnectedRef.current = true;
    
    // HTTP-only 쿠키 사용으로 토큰 파라미터 불필요 (쿠키가 자동 전송됨)
    const sockjsUrl = window.location.hostname === "localhost"
      ? `${import.meta.env.VITE_BACKEND_BASE_URL}/ws/notifications-sockjs`
      : `${window.location.protocol}//${window.location.host}/ws/notifications-sockjs`;
    
    console.log(`SockJS connecting to: ${sockjsUrl} (using HTTP-only cookies)`);
    
    const sock = new SockJS(sockjsUrl);
    const stomp = Stomp.over(sock);

    stomp.heartbeat.outgoing = 25000;
    stomp.heartbeat.incoming = 25000;
    stomp.debug = () => {};
    clientRef.current = stomp;

    // HTTP-only 쿠키 사용으로 별도 인증 헤더 불필요
    const connectHeaders: any = {};

    stomp.connect(
      connectHeaders,
      () => {
        console.log("Connected to notification WebSocket");
        reconnectAttempts.current = 0;

        console.log("🔌 웹소켓 연결 성공, 구독 시작");
        
        // 기존 알림 목록 직접 요청 (REST API 호출) - HTTP-only 쿠키 사용
        const fetchExistingNotifications = async () => {
          try {
            if (!isAuthenticated) return;
            
            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/notifications`, {
              credentials: 'include', // HTTP-only 쿠키 포함
              headers: {
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

  // ================================= 낙관적 업데이트로 즉시 UI 반영 =================================
  const markAsRead = useCallback((notificationId: number) => {
    console.log('📖 알림 읽음 처리 시작:', notificationId);
    
    // 이미 읽은 알림이면 처리하지 않음
    const notification = notifications.find(n => n.notificationId === notificationId);
    if (!notification || notification.isRead) {
      console.log('📖 이미 읽은 알림이거나 존재하지 않음:', notificationId);
      return;
    }

    // 1. 즉시 UI 업데이트 (낙관적 업데이트)
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.notificationId === notificationId 
          ? { ...n, isRead: true }
          : n
      );
      updateUnreadCount(updated);
      console.log('📖 즉시 UI 업데이트 완료:', notificationId);
      return updated;
    });

    // 2. 백엔드 동기화
    const stomp = clientRef.current;
    if (stomp && stomp.connected) {
      console.log('📖 WebSocket으로 백엔드 동기화:', notificationId);
      stomp.send("/app/notifications/markRead", {}, JSON.stringify(notificationId));
    } else {
      console.warn('📖 WebSocket 연결 없음, 읽음 처리 스킵:', notificationId);
      // WebSocket이 끊어진 경우에도 UI는 이미 업데이트 되어 사용자 경험 향상
    }
  }, [notifications, updateUnreadCount]);
  // ===============================================================================================

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

    // 2. 백엔드로 soft delete 요청 - HTTP-only 쿠키 자동 사용
    console.log("🗑️ WebSocket으로 알림 삭제 요청:", notificationId);
    stomp.send("/app/notifications/delete", {}, JSON.stringify(notificationId));
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