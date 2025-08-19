import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";


export function useQrTicketSocket(qrTicketId: number, onMessage: (msg: string) => void) {
    const clientRef = useRef<Stomp.Client | null>(null);
    const subscriptionsRef = useRef<Stomp.Subscription[]>([]);

  useEffect(() => {
    if (!qrTicketId) return;

    const sock = new SockJS(`${import.meta.env.VITE_BACKEND_BASE_URL}/ws/qr-sockjs`);
    const stomp = Stomp.over(sock);

    stomp.debug = () => {}; // 로그 끔
    clientRef.current = stomp;


      stomp.connect(
          {},
      () => {
            console.log("Connected QR socket");
            console.log("🔌 QR 웹소켓 연결 성공, 구독 시작");

            const subCheckIn = stomp.subscribe(
            `/topic/check-in/${qrTicketId}`,
            (message) => {
                onMessage(message.body);
            }
            );

            const subCheckOut = stomp.subscribe(
            `/topic/check-out/${qrTicketId}`,
            (message) => {
                onMessage(message.body);
            }
            );

            subscriptionsRef.current = [subCheckIn, subCheckOut];
      },
      (err) => {
        console.error("QR socket error:", err);
      }
    );

    return () => {
      // 두 구독 모두 해제
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];
      clientRef.current?.disconnect(() => console.log("QR socket disconnected"));
    };
  }, [qrTicketId, onMessage]);
}