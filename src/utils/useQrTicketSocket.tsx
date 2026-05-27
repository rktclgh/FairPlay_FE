import { useEffect, useRef, useCallback } from "react";

export function useQrTicketSocket(qrTicketId: number, onMessage: (msg: string) => void) {
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
    if (!qrTicketId) return;

    if (eventSourceRef.current) {
        console.log("이미 QR SSE가 연결되어 있습니다. 중복 연결을 방지합니다.");
        return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;
    const eventSource = new EventSource(`${backendUrl}/api/qr-tickets/${qrTicketId}/stream`, {
      withCredentials: true,
    });
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("qr-ticket-connected", () => {
      console.log("🔌 QR SSE 연결 성공");
    });

    eventSource.addEventListener("qr-ticket-status", (event) => {
      handleMessage((event as MessageEvent).data);
    });

    eventSource.onerror = (error) => {
      console.error("QR SSE error:", error);
    };

    return () => {
      eventSource.close();
      console.log("🔌 QR SSE 연결 해제");
      eventSourceRef.current = null;
    };
  }, [qrTicketId, handleMessage]); // onMessage 제거, handleMessage 사용
}
