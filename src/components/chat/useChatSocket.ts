import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

// 반드시 프록시 설정에 의해 /ws/chat → 8080/ws/chat 으로 리디렉션됨
export function useChatSocket(roomId: number, onMessage: (msg: any) => void) {
    const clientRef = useRef<Stomp.Client | null>(null);

    useEffect(() => {
        let isUnmounted = false;
        const sock = new SockJS("/ws/chat");
        const stomp = Stomp.over(sock);

        clientRef.current = stomp;

        let connected = false;

        // connect
        stomp.connect(
            { Authorization: "Bearer " + localStorage.getItem("accessToken") },
            () => {
                if (isUnmounted) {
                    // 만약 이미 언마운트 상태면 즉시 disconnect
                    stomp.disconnect();
                    return;
                }
                connected = true;
                stomp.subscribe(`/topic/chat.${roomId}`, msg => {
                    try {
                        onMessage(JSON.parse(msg.body));
                    } catch (e) {
                        // parse 실패시 무시
                    }
                });
            },
            (error) => {
                // 연결 에러
                // 필요시 toast, alert 등으로 사용자 알림 가능
                // console.error("WebSocket 연결 실패:", error);
            }
        );

        return () => {
            isUnmounted = true;
            // 연결 완료 후에만 disconnect
            if (stomp && stomp.connected) {
                stomp.disconnect();
            } else {
                // 연결 중일 때는 SockJS를 바로 닫아서 자원 정리
                sock.close();
            }
        };
    }, [roomId, onMessage]);

    return {
        send: (content: string) => {
            const stomp = clientRef.current;
            if (
                stomp &&
                stomp.connected &&
                content.trim() !== ""
            ) {
                stomp.send(
                    "/app/chat.sendMessage",
                    { Authorization: "Bearer " + localStorage.getItem("accessToken") },
                    JSON.stringify({ chatRoomId: roomId, content })
                );
            }
            // 연결되지 않은 상태에서는 무시 (실행 X)
        }
    };
}
