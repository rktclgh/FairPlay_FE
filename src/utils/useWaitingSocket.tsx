
import { useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";


export function useWaitingSocket(userId: number, onMessage: (msg: string) => void) {
    const clientRef = useRef<Stomp.Client | null>(null);
    const subscriptionsRef = useRef<Stomp.Subscription[]>([]);
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

    // 이미 연결된 상태라면 중복 연결 방지
    if (clientRef.current && clientRef.current.connected) {
        console.log("이미 웹소켓이 연결되어 있습니다. 중복 연결을 방지합니다.");
        return;
    }

    const sock = new SockJS(`${import.meta.env.VITE_BACKEND_BASE_URL}/ws/waiting-sockjs`);
    const stomp = Stomp.over(sock);

    stomp.debug = () => {}; // 로그 끔
    clientRef.current = stomp;

    stomp.connect(
          {},
      () => {
            console.log("🔌 웨이팅 웹소켓 연결 성공, 구독 시작");

            const subWaiting = stomp.subscribe(
            `/topic/waiting/${userId}`,
            (message) => {
                handleMessage(message.body);
            }
            );
        
            subscriptionsRef.current = [subWaiting];
      },
      (err) => {
        console.error("웨이팅 socket error:", err);
      }
    );

    return () => {
      // 두 구독 모두 해제
      subscriptionsRef.current.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch (e) {
          console.warn("구독 해제 중 오류:", e);
        }
      });
      subscriptionsRef.current = [];
      
      if (clientRef.current?.connected) {
        clientRef.current.disconnect(() => {
          console.log("🔌 QR 웹소켓 연결 해제");
        });
      }
      clientRef.current = null;
    };
  }, [userId, handleMessage]); // onMessage 제거, handleMessage 사용
}