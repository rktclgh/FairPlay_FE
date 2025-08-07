import { useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export function useChatSocket(roomId: number, onMessage: (msg: any) => void) {
    const clientRef = useRef<Stomp.Client | null>(null);
    const isConnectedRef = useRef(false);
    const currentRoomIdRef = useRef<number | null>(null);
    const subscriptionRef = useRef<any>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3초

    // onMessage를 useCallback으로 메모이제이션
    const memoizedOnMessage = useCallback(onMessage, []);

    useEffect(() => {
        // 룸 ID가 변경되었거나 처음 연결하는 경우
        if (currentRoomIdRef.current !== roomId) {
            console.log(`Room changed from ${currentRoomIdRef.current} to ${roomId}`);

            // 기존 구독 해제
            if (subscriptionRef.current) {
                console.log("Unsubscribing from previous room");
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }

            currentRoomIdRef.current = roomId;
        }

        // WebSocket 연결이 없으면 새로 생성
        if (!isConnectedRef.current || !clientRef.current?.connected) {
            console.log(`Opening WebSocket for room ${roomId}...`);
            isConnectedRef.current = true;

            // 배포 환경에 따른 URL 결정
            const wsUrl = window.location.hostname === 'localhost' 
                ? "http://localhost:8080/ws/chat"
                : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/chat`;
            
            console.log(`WebSocket connecting to: ${wsUrl}`);
            
            const sock = new SockJS(wsUrl);
            const stomp = Stomp.over(sock);

            // 배포환경 최적화 설정
            stomp.heartbeat.outgoing = 25000; // 25초
            stomp.heartbeat.incoming = 25000; // 25초
            stomp.debug = null;
            clientRef.current = stomp;

            const token = localStorage.getItem("accessToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            stomp.connect(
                headers,
                () => {
                    console.log(`Connected to WebSocket for room ${roomId}`);

                    // 새로운 룸 구독
                    if (!subscriptionRef.current) {
                        subscriptionRef.current = stomp.subscribe(`/topic/chat.${roomId}`, (message) => {
                            try {
                                const parsedMessage = JSON.parse(message.body);
                                console.log("메시지 수신:", parsedMessage.content, "from senderId:", parsedMessage.senderId, "roomId:", parsedMessage.chatRoomId);
                                memoizedOnMessage(parsedMessage);
                            } catch (error) {
                                console.error("메시지 파싱 실패:", error, message.body);
                            }
                        });
                        console.log("Subscribed to topic:", `/topic/chat.${roomId}`);
                    }
                },
                (error) => {
                    console.error("WebSocket connection failed:", error);
                    isConnectedRef.current = false;
                    
                    // 재연결 시도
                    if (reconnectAttempts.current < maxReconnectAttempts) {
                        reconnectAttempts.current++;
                        console.log(`WebSocket 재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts} (${reconnectDelay}ms 후)`);
                        
                        setTimeout(() => {
                            isConnectedRef.current = false; // 재연결을 위해 상태 초기화
                        }, reconnectDelay);
                    } else {
                        console.error("WebSocket 최대 재연결 시도 횟수 초과");
                    }
                }
            );
        } else if (clientRef.current?.connected && !subscriptionRef.current) {
            // 연결되어 있지만 구독이 없는 경우
            console.log(`Subscribing to room ${roomId} on existing connection`);
            subscriptionRef.current = clientRef.current.subscribe(`/topic/chat.${roomId}`, (message) => {
                try {
                    const parsedMessage = JSON.parse(message.body);
                    console.log("메시지 수신:", parsedMessage.content, "from senderId:", parsedMessage.senderId, "roomId:", parsedMessage.chatRoomId);
                    memoizedOnMessage(parsedMessage);
                } catch (error) {
                    console.error("메시지 파싱 실패:", error, message.body);
                }
            });
            console.log("Subscribed to topic:", `/topic/chat.${roomId}`);
        }

        return () => {
            // 구독만 해제하고 연결은 유지
            if (subscriptionRef.current) {
                console.log(`Unsubscribing from room ${roomId}`);
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        };
    }, [roomId, memoizedOnMessage]);

    const send = useCallback((content: string) => {
        const stomp = clientRef.current;

        if (!stomp || !stomp.connected || !content.trim()) {
            console.warn("Cannot send message: not connected or empty content");
            return;
        }

        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            let userId = null;
            const token = localStorage.getItem("accessToken");
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.sub;
                } catch (error) {
                    console.error("토큰 파싱 실패:", error);
                }
            }

            const messagePayload = {
                chatRoomId: roomId,
                content: content.trim(),
                senderId: userId ? parseInt(userId) : 1
            };

            console.log("메시지 전송:", content.trim(), "from userId:", userId);

            stomp.send(
                "/app/chat.sendMessage",
                headers,
                JSON.stringify(messagePayload)
            );
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }, [roomId]);

    return { send };
}
