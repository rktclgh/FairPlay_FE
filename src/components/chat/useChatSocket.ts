import { useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { isAuthenticated } from "../../utils/authGuard";

type ChatMessage = {
  chatMessageId: number;
  chatRoomId: number;
  senderId: number;
  content: string;
  sentAt: string;
  isRead: boolean;
};

export function useChatSocket(
  roomId: number,
  onMessage: (msg: ChatMessage) => void
) {
  const clientRef = useRef<Stomp.Client | null>(null);
  const isConnectedRef = useRef(false);
  const currentRoomIdRef = useRef<number | null>(null);
  const subscriptionRef = useRef<Stomp.Subscription | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3초
  const pendingMessages = useRef<string[]>([]); // 연결 전 대기 중인 메시지들

  // onMessage를 useCallback으로 메모이제이션
  const memoizedOnMessage = useCallback(onMessage, [onMessage]);

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

    // 인증되지 않은 사용자는 연결하지 않음
    if (!isAuthenticated()) {
      console.log("User not authenticated, skipping WebSocket connection");
      return;
    }

    // WebSocket 연결이 없으면 새로 생성
    if (!isConnectedRef.current || !clientRef.current?.connected) {
      console.log(`Opening WebSocket for room ${roomId}...`);
      isConnectedRef.current = true;

      // Native WebSocket을 먼저 시도, 실패시 SockJS fallback
      const token = localStorage.getItem("accessToken");
      let wsUrl =
        window.location.hostname === "localhost"
          ? `ws://localhost:8080/ws/chat`
          : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/chat`;

      if (token) {
        wsUrl += `?token=${token}`;
      }

      console.log(`WebSocket connecting to: ${wsUrl}`);

      // SockJS 직접 사용 (더 안정적)
      const sockjsUrl = window.location.hostname === "localhost"
        ? `${import.meta.env.VITE_BACKEND_BASE_URL}/ws/chat-sockjs`
        : `${window.location.protocol}//${window.location.host}/ws/chat-sockjs`;
      
      console.log(`SockJS connecting to: ${sockjsUrl}`);
      
      const sock = new SockJS(token ? `${sockjsUrl}?token=${token}` : sockjsUrl);
      const stomp = Stomp.over(sock);

      // 배포환경 최적화 설정
      stomp.heartbeat.outgoing = 25000; // 25초
      stomp.heartbeat.incoming = 25000; // 25초
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
          console.log(`Connected to WebSocket for room ${roomId}`);
          reconnectAttempts.current = 0; // 연결 성공 시 재연결 시도 횟수 초기화

          // 새로운 룸 구독
          if (!subscriptionRef.current) {
            subscriptionRef.current = stomp.subscribe(
              `/topic/chat.${roomId}`,
              (message) => {
                try {
                  const parsedMessage = JSON.parse(message.body);
                  console.log(
                    "메시지 수신:",
                    parsedMessage.content,
                    "from senderId:",
                    parsedMessage.senderId,
                    "roomId:",
                    parsedMessage.chatRoomId
                  );
                  memoizedOnMessage(parsedMessage);
                } catch (error) {
                  console.error("메시지 파싱 실패:", error, message.body);
                }
              }
            );
            console.log("Subscribed to topic:", `/topic/chat.${roomId}`);
          }

          // 대기 중인 메시지들을 전송
          const pending = [...pendingMessages.current];
          pendingMessages.current = [];
          pending.forEach(content => {
            console.log("대기 중이던 메시지 전송:", content);
            sendMessageInternal(content, stomp);
          });
        },
        (error) => {
          console.error("WebSocket connection failed:", error);
          isConnectedRef.current = false;

          // 인증 오류인지 확인 (401, 403 등)
          const isAuthError = error && (
            error.toString().includes('401') || 
            error.toString().includes('403') ||
            error.toString().includes('Unauthorized') ||
            error.toString().includes('Authentication')
          );

          // 인증 오류인 경우 재연결 시도하지 않음
          if (isAuthError) {
            console.warn("WebSocket 인증 실패: 재연결 중단");
            return;
          }

          // 사용자가 여전히 인증된 상태일 때만 재연결 시도
          if (!isAuthenticated()) {
            console.warn("사용자가 로그아웃됨: 재연결 중단");
            return;
          }

          // 재연결 시도
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            console.log(
              `WebSocket 재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts} (${reconnectDelay}ms 후)`
            );

            setTimeout(() => {
              // 재연결 전 다시 한번 인증 상태 확인
              if (isAuthenticated()) {
                isConnectedRef.current = false; // 재연결을 위해 상태 초기화
              }
            }, reconnectDelay);
          } else {
            console.error("WebSocket 최대 재연결 시도 횟수 초과");
          }
        }
      );
    } else if (clientRef.current?.connected && !subscriptionRef.current) {
      // 연결되어 있지만 구독이 없는 경우
      console.log(`Subscribing to room ${roomId} on existing connection`);
      subscriptionRef.current = clientRef.current.subscribe(
        `/topic/chat.${roomId}`,
        (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log(
              "메시지 수신:",
              parsedMessage.content,
              "from senderId:",
              parsedMessage.senderId,
              "roomId:",
              parsedMessage.chatRoomId
            );
            memoizedOnMessage(parsedMessage);
          } catch (error) {
            console.error("메시지 파싱 실패:", error, message.body);
          }
        }
      );
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

  // 내부 메시지 전송 함수
  const sendMessageInternal = useCallback((content: string, stomp: Stomp.Client) => {
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      let userId = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.sub;
        } catch (error) {
          console.error("토큰 파싱 실패:", error);
        }
      }

      const messagePayload = {
        chatRoomId: roomId,
        content: content.trim(),
        senderId: userId ? parseInt(userId) : 1,
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

  const send = useCallback(
    (content: string) => {
      if (!content.trim()) {
        console.warn("Cannot send empty message");
        return;
      }

      const stomp = clientRef.current;

      // WebSocket이 연결되어 있고 구독되어 있는 경우 즉시 전송
      if (stomp && stomp.connected && subscriptionRef.current) {
        console.log("WebSocket 연결 상태, 즉시 전송:", content.trim());
        sendMessageInternal(content.trim(), stomp);
      } else {
        // 연결되지 않은 경우 대기 큐에 추가
        console.log("WebSocket 연결 대기 중, 메시지 큐에 추가:", content.trim());
        pendingMessages.current.push(content.trim());
      }
    },
    [sendMessageInternal]
  );

  return { send };
}
