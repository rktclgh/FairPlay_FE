
import { useEffect, useRef, useCallback } from "react";

export function useWaitingSocket(userId: number, onMessage: (msg: string) => void) {
    const eventSourceRef = useRef<EventSource | null>(null);
    const onMessageRef = useRef(onMessage);
    
    // onMessage 콜백을 ref에 저장하여 최신 버전 유지
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const handleMessage = useCallback((msg: string) => {
        onMessageRef.current(msg);
    }, []);

  useEffect(() => {
    if (!userId) return;

    if (eventSourceRef.current) {
        console.log("이미 웨이팅 SSE가 연결되어 있습니다. 중복 연결을 방지합니다.");
        return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;
    const eventSource = new EventSource(`${backendUrl}/api/booth-experiences/waiting/stream`, {
      withCredentials: true,
    });
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("waiting-connected", () => {
      console.log("🔌 웨이팅 SSE 연결 성공");
    });

    eventSource.addEventListener("waiting-status", (event) => {
      handleMessage(event.data);
    });

    eventSource.onerror = (error) => {
      console.error("웨이팅 SSE error:", error);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        console.log("🔌 웨이팅 SSE 연결 해제");
      }
      eventSourceRef.current = null;
    };
  }, [userId, handleMessage]); // onMessage 제거, handleMessage 사용
}
