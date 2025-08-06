import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export function useChatSocket(roomId: number, onMessage: (msg: any) => void) {
    const clientRef = useRef<Stomp.Client | null>(null);

    useEffect(() => {
        // 백엔드 ws/chat 엔드포인트로 연결
        const sock = new SockJS("/ws/chat");
        const stomp = Stomp.over(sock);
        clientRef.current = stomp;

        stomp.connect(
            { Authorization: "Bearer " + localStorage.getItem("accessToken") },
            () => {
                // 채팅방 구독
                stomp.subscribe(`/topic/chat.${roomId}`, msg => {
                    onMessage(JSON.parse(msg.body));
                });
            }
        );

        return () => {
            stomp.disconnect();
        };
    }, [roomId, onMessage]);

    return {
        send: (content: string) => {
            clientRef.current?.send(
                "/app/chat.sendMessage",
                { userId: localStorage.getItem("userId") }, // 서버에서 @Header("userId")로 받을 수 있게
                JSON.stringify({ chatRoomId: roomId, content })
            );
        }
    };
}
