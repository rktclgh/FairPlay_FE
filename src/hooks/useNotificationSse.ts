import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

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

/**
 * SSE (Server-Sent Events) 기반 실시간 알림 훅
 * HTTP-only 쿠키 기반 인증 사용 - 웹소켓 완전 대체
 */
export function useNotificationSse() {
  const { isAuthenticated, loading } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const updateUnreadCount = useCallback((notifications: Notification[]) => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, []);

  const onNewNotification = useCallback((notification: Notification) => {
    console.log("📨 SSE 새 알림 수신:", notification);
    setNotifications(prev => {
      // 중복 방지
      const exists = prev.some(n => n.notificationId === notification.notificationId);
      if (exists) {
        console.log("📨 중복 알림 무시:", notification.notificationId);
        return prev;
      }
      const updated = [notification, ...prev];
      updateUnreadCount(updated);
      return updated;
    });

    // 브라우저 알림 표시
    if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico"
      });
    }
  }, [updateUnreadCount]);

  const onNotificationRead = useCallback((notificationId: number) => {
    console.log('📩 SSE 읽음 처리 이벤트:', notificationId);
    setNotifications(prev => {
      const notification = prev.find(n => n.notificationId === notificationId);
      if (!notification || notification.isRead) {
        return prev;
      }
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
    console.log("🗑️ SSE 삭제 처리 이벤트:", notificationId);
    setNotifications(prev => {
      const updated = prev.filter(n => n.notificationId !== notificationId);
      updateUnreadCount(updated);
      return updated;
    });
  }, [updateUnreadCount]);

  const connect = useCallback(() => {
    // 🔒 인증 상태 확인 중이거나, 이미 연결되어 있거나, 인증되지 않은 경우 연결 중단
    if (loading || eventSourceRef.current || !isAuthenticated) {
      console.log("🚫 SSE 연결 조건 미충족:", { loading, hasConnection: !!eventSourceRef.current, isAuthenticated });
      return;
    }

    console.log("✅ SSE 연결 시작...");

    // SSE 엔드포인트 URL (HTTP-only 쿠키 자동 전송)
    const sseUrl = `${import.meta.env.VITE_BACKEND_BASE_URL}/api/notifications/stream`;

    // EventSource 생성 (자동으로 HTTP-only 쿠키 포함)
    const eventSource = new EventSource(sseUrl, {
      withCredentials: true  // HTTP-only 쿠키 자동 전송!
    });

    eventSourceRef.current = eventSource;

    // 연결 성공
    eventSource.addEventListener('connected', (event) => {
      console.log("✅ SSE 연결 성공:", event.data);
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    // 기존 알림 목록 수신
    eventSource.addEventListener('initial-notifications', (event) => {
      try {
        const existingNotifications: Notification[] = JSON.parse(event.data);
        console.log("📋 SSE 기존 알림 수신:", existingNotifications.length);
        setNotifications(existingNotifications);
        updateUnreadCount(existingNotifications);
      } catch (error) {
        console.error("기존 알림 파싱 실패:", error);
      }
    });

    // 새 알림 수신
    eventSource.addEventListener('notification', (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        onNewNotification(notification);
      } catch (error) {
        console.error("새 알림 파싱 실패:", error);
      }
    });

    // 브로드캐스트 알림 수신
    eventSource.addEventListener('broadcast', (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        console.log("📢 SSE 브로드캐스트 알림:", notification);
        onNewNotification(notification);
      } catch (error) {
        console.error("브로드캐스트 알림 파싱 실패:", error);
      }
    });

    // 읽음 처리 확인
    eventSource.addEventListener('notification-read', (event) => {
      try {
        const notificationId = JSON.parse(event.data);
        onNotificationRead(notificationId);
      } catch (error) {
        console.error("읽음 처리 파싱 실패:", error);
      }
    });

    // 삭제 처리 확인
    eventSource.addEventListener('notification-deleted', (event) => {
      try {
        const notificationId = JSON.parse(event.data);
        onNotificationDeleted(notificationId);
      } catch (error) {
        console.error("삭제 처리 파싱 실패:", error);
      }
    });

    // 에러 처리 및 자동 재연결
    eventSource.onerror = (error) => {
      console.error("❌ SSE 연결 에러:", error);
      setIsConnected(false);

      // EventSource는 자동으로 재연결 시도하지만,
      // 401 에러 등의 경우 수동으로 처리
      if (eventSource.readyState === EventSource.CLOSED) {
        eventSourceRef.current = null;

        // 재연결 시도 (인증 상태 확인 중이 아닐 때만)
        if (reconnectAttempts.current < maxReconnectAttempts && isAuthenticated && !loading) {
          reconnectAttempts.current++;
          console.log(`🔄 SSE 재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts}`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error("❌ SSE 재연결 포기 (최대 시도 횟수 초과)");
        }
      }
    };

  }, [loading, isAuthenticated, onNewNotification, onNotificationRead, onNotificationDeleted, updateUnreadCount]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log("🔌 SSE 연결 종료");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // 알림 읽음 처리 (REST API 호출)
  const markAsRead = useCallback(async (notificationId: number) => {
    console.log('📖 알림 읽음 처리:', notificationId);

    // 즉시 UI 업데이트 (낙관적 업데이트)
    setNotifications(prev => {
      const target = prev.find(n => n.notificationId === notificationId);
      if (!target || target.isRead) {
        return prev;
      }
      const updated = prev.map(n =>
        n.notificationId === notificationId
          ? { ...n, isRead: true }
          : n
      );
      updateUnreadCount(updated);
      return updated;
    });

    // 백엔드 동기화 (HTTP-only 쿠키 자동 전송)
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      // SSE로 읽음 확인 이벤트가 자동으로 전송됨
    } catch (error) {
      console.error("읽음 처리 실패:", error);
      // 실패 시 UI 롤백 (선택사항)
    }
  }, [updateUnreadCount]);

  // 알림 삭제 (REST API 호출)
  const deleteNotification = useCallback(async (notificationId: number) => {
    console.log("🗑️ 알림 삭제:", notificationId);

    // 즉시 UI에서 제거 (낙관적 업데이트)
    setNotifications(prev => {
      const updated = prev.filter(n => n.notificationId !== notificationId);
      updateUnreadCount(updated);
      return updated;
    });

    // 백엔드 동기화 (HTTP-only 쿠키 자동 전송)
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      // SSE로 삭제 확인 이벤트가 자동으로 전송됨
      return true;
    } catch (error) {
      console.error("삭제 실패:", error);
      return false;
    }
  }, [updateUnreadCount]);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 인증 상태 변경 시 연결/해제 (loading이 완료된 후에만)
  useEffect(() => {
    // 🔒 인증 상태 확인이 완료될 때까지 대기
    if (loading) {
      console.log("⏳ SSE: 인증 상태 확인 중... 연결 대기");
      return;
    }

    if (isAuthenticated) {
      console.log("✅ SSE: 인증됨 → 연결 시도");
      connect();
    } else {
      console.log("❌ SSE: 미인증 → 연결 해제");
      disconnect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

  return {
    notifications,
    unreadCount,
    connect,
    disconnect,
    markAsRead,
    deleteNotification,
    isConnected
  };
}
