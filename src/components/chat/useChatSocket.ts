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
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const initRef = useRef(false);

  // onMessage는 이미 ChatRoom에서 useCallback으로 메모이제이션됨

  useEffect(() => {
    // 초기화 체크 (React StrictMode 대응) - cleanup에서 false로 설정되는 것을 방지
    isMountedRef.current = true;
    if (!initRef.current) {
      initRef.current = true;
      console.log('🔄 useChatSocket 첫 초기화');
    } else {
      console.log('🔄 useChatSocket 재초기화 (StrictMode)');
    }
    
    // 룸 ID가 변경된 경우에만 처리
    if (currentRoomIdRef.current !== roomId) {
      console.log(`Room changed from ${currentRoomIdRef.current} to ${roomId}`);

      // 기존 구독 해제
      if (subscriptionRef.current) {
        console.log(`Unsubscribing from room ${currentRoomIdRef.current}`);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      currentRoomIdRef.current = roomId;
    } else if (subscriptionRef.current) {
      // 같은 룸이고 이미 구독 중이면 아무것도 하지 않음
      return () => {};
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

      // SockJS를 통한 WebSocket 연결
      const token = localStorage.getItem("accessToken");
      
      // 환경변수에서 백엔드 URL 가져오기 (포트 불일치 문제 해결)
      const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'https://fair-play.ink';
      const sockjsUrl = window.location.hostname === "localhost"
        ? `${backendUrl}/ws/chat-sockjs`
        : `${window.location.protocol}//${window.location.host}/ws/chat-sockjs`;
      
      console.log(`SockJS connecting to: ${sockjsUrl}`);
      
      const sock = new SockJS(token ? `${sockjsUrl}?token=${token}` : sockjsUrl);
      const stomp = Stomp.over(sock);

      // 배포환경 최적화 설정
      stomp.heartbeat.outgoing = 20000; // 20초 (더 짧게 설정하여 연결 안정성 확보)
      stomp.heartbeat.incoming = 20000; // 20초
      stomp.debug = () => {}; // 프로덕션에서는 debug 비활성화
      
      // 연결 타임아웃 설정
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      connectionTimeoutRef.current = setTimeout(() => {
        if (!stomp.connected && isMountedRef.current) {
          console.warn('WebSocket 연결 타임아웃 (10초)');
          if (stomp.ws) {
            stomp.ws.close();
          }
        }
      }, 10000); // 10초 타임아웃
      clientRef.current = stomp;

      // STOMP CONNECT 헤더에 토큰 추가
      const connectHeaders: any = {};
      if (token) {
        connectHeaders['Authorization'] = `Bearer ${token}`;
      }

      stomp.connect(
        connectHeaders,
        () => {
          if (!isMountedRef.current) return;
          
          console.log(`Connected to WebSocket for room ${roomId}`);
          reconnectAttempts.current = 0; // 연결 성공 시 재연결 시도 횟수 초기화
          isConnectedRef.current = true;
          
          // 연결 타임아웃 해제
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          
          // 하트비트 모니터링 시작
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
          }
          heartbeatIntervalRef.current = setInterval(() => {
            if (stomp && stomp.connected) {
              // 연결 상태 확인을 위한 ping
              try {
                stomp.send('/app/ping', {}, '');
              } catch (error) {
                console.warn('하트비트 ping 실패:', error);
              }
            }
          }, 30000); // 30초마다 ping

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
                  onMessage(parsedMessage);
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
          if (!isMountedRef.current) return;
          
          console.error("WebSocket connection failed:", error);
          isConnectedRef.current = false;
          
          // 연결 타임아웃 해제
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          
          // 하트비트 정리
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }

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
              if (isAuthenticated() && isMountedRef.current) {
                console.log(`실제 재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts}`);
                isConnectedRef.current = false; // 재연결을 위해 상태 초기화
                
                // 기존 연결 정리
                if (clientRef.current) {
                  try {
                    if (clientRef.current.connected) {
                      clientRef.current.disconnect(() => {
                        console.log('기존 연결 정리 완료, 재연결 시작');
                      });
                    }
                  } catch (e) {
                    console.warn('기존 연결 정리 중 오류:', e);
                  }
                  clientRef.current = null;
                }
                
                // 구독도 초기화
                subscriptionRef.current = null;
              }
            }, reconnectDelay);
          } else {
            console.error("WebSocket 최대 재연결 시도 횟수 초과");
          }
        }
      );
    } else if (clientRef.current?.connected && subscriptionRef.current) {
      // 이미 구독 중인 경우, 불필요한 재구독 방지
      console.log(`Already subscribed to room ${roomId}`);
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
            onMessage(parsedMessage);
          } catch (error) {
            console.error("메시지 파싱 실패:", error, message.body);
          }
        }
      );
      console.log("Subscribed to topic:", `/topic/chat.${roomId}`);
    }

    return () => {
      // 구독 해제만 (연결은 유지)
      if (subscriptionRef.current) {
        console.log(`Unsubscribing from room ${roomId}`);
        try {
          subscriptionRef.current.unsubscribe();
        } catch (error) {
          console.warn('구독 해제 중 오류:', error);
        }
        subscriptionRef.current = null;
      }
      
      // 타임아웃 정리
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      // 하트비트 정리
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [roomId, onMessage]);
  
  // 컴포넌트 언마운트 시 전체 정리
  useEffect(() => {
    return () => {
      console.log('useChatSocket cleanup 시작');
      
      // initRef를 false로 설정하여 재초기화 방지
      initRef.current = false;
      
      // 타임아웃 정리 먼저
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      // 구독 해제 (연결 종료 전에)
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        } catch (error) {
          console.warn('구독 해제 중 오류:', error);
        }
      }
      
      // React StrictMode 대응: 지연된 정리 시에도 재초기화를 고려
      setTimeout(() => {
        // 만약 이미 재초기화되었다면 정리하지 않음 (StrictMode 대응)
        if (initRef.current) {
          console.log('🛑 컴포넌트가 재초기화되어 정리 건너뜀');
          return;
        }
        
        console.log('🧹 useChatSocket 최종 정리 시작');
        isMountedRef.current = false;
        
        // 연결 완전 종료
        if (clientRef.current) {
          try {
            if (clientRef.current.connected) {
              clientRef.current.disconnect(() => {
                console.log('채팅 WebSocket 연결 종료');
              });
            }
          } catch (error) {
            console.warn('WebSocket 연결 종료 중 오류:', error);
          }
          clientRef.current = null;
        }
        
        // 모든 상태 초기화
        isConnectedRef.current = false;
        currentRoomIdRef.current = null;
        reconnectAttempts.current = 0;
        pendingMessages.current = [];
      }, 100); // 100ms 지연
    };
  }, []);

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

      // 강제로 mount 상태 확인 및 복구
      if (!isMountedRef.current && initRef.current) {
        console.log('⚠️ isMountedRef가 false이지만 컴포넌트는 활성 상태 - 복구 시도');
        isMountedRef.current = true;
      }
      
      console.log('📨 메시지 전송 시도:', {
        content: content.trim(),
        isMounted: isMountedRef.current,
        hasClient: !!stomp,
        isConnected: stomp?.connected,
        hasSubscription: !!subscriptionRef.current,
        initRef: initRef.current
      });

      // WebSocket이 연결되어 있고 구독되어 있는 경우 즉시 전송
      if (stomp && stomp.connected && subscriptionRef.current) {
        console.log("✅ WebSocket 연결 상태, 즉시 전송:", content.trim());
        sendMessageInternal(content.trim(), stomp);
      } else if (stomp && stomp.connected) {
        console.warn("⚠️ WebSocket 연결됨, 하지만 구독 안됨");
        sendMessageInternal(content.trim(), stomp);
      } else {
        // 연결되지 않은 경우 대기 큐에 추가 (최대 10개만 보관)
        if (pendingMessages.current.length < 10) {
          console.log("⏳ WebSocket 연결 대기 중, 메시지 큐에 추가:", content.trim());
          pendingMessages.current.push(content.trim());
        } else {
          console.warn('❌ 대기 메시지 큐 초과, 전송 실패:', content.trim());
        }
      }
    },
    [sendMessageInternal]
  );

  return { send };
}
