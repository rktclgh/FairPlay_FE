import { useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { useAuth } from "../../context/AuthContext";

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
  onMessage: (msg: ChatMessage) => void,
  options: { isAiChat?: boolean } = {}
) {
  const { isAuthenticated } = useAuth();
  const isAiChat = Boolean(options.isAiChat);
  const clientRef = useRef<Stomp.Client | null>(null);
  const isConnectedRef = useRef(false);
  const currentRoomIdRef = useRef<number | null>(null);
  const subscriptionRef = useRef<Stomp.Subscription | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const pendingMessages = useRef<string[]>([]);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const initRef = useRef(false);

  useEffect(() => {
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
      return () => {};
    }

    // 인증 상태 체크 및 연결
    const initializeConnection = async () => {
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping WebSocket connection");
        return;
      }

      // WebSocket 연결이 없으면 새로 생성
      if (!isConnectedRef.current || !clientRef.current?.connected) {
        console.log(`Opening WebSocket for room ${roomId}...`);
        isConnectedRef.current = true;

        const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;
        const sockjsUrl = window.location.hostname === "localhost"
          ? `${backendUrl}/ws/chat-sockjs`
          : `${window.location.protocol}//${window.location.host}/ws/chat-sockjs`;
        
        console.log(`SockJS connecting to: ${sockjsUrl}`);
        
        const sock = new SockJS(sockjsUrl, [], {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling']
        });
        const stomp = Stomp.over(sock);

        stomp.heartbeat.outgoing = 20000;
        stomp.heartbeat.incoming = 20000;
        stomp.debug = () => {};
        
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
        }, 10000);
        clientRef.current = stomp;

        const connectHeaders: Record<string, string> = {};

        stomp.connect(
          connectHeaders,
          () => {
            if (!isMountedRef.current) return;
            
            console.log(`Connected to WebSocket for room ${roomId}`);
            reconnectAttempts.current = 0;
            isConnectedRef.current = true;
            
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
              connectionTimeoutRef.current = null;
            }
            
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current);
            }
            heartbeatIntervalRef.current = setInterval(() => {
              if (stomp && stomp.connected) {
                try {
                  stomp.send('/app/ping', {}, '');
                } catch (error) {
                  console.warn('하트비트 ping 실패:', error);
                }
              }
            }, 30000);

            if (!subscriptionRef.current) {
              const topic = isAiChat ? `/topic/ai-chat.${roomId}` : `/topic/chat.${roomId}`;
              subscriptionRef.current = stomp.subscribe(
                topic,
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
              console.log("Subscribed to topic:", topic);
            }

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
            
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
              connectionTimeoutRef.current = null;
            }
            
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current);
              heartbeatIntervalRef.current = null;
            }

            const isAuthError = error && (
              error.toString().includes('401') || 
              error.toString().includes('403') ||
              error.toString().includes('Unauthorized') ||
              error.toString().includes('Authentication')
            );

            if (isAuthError) {
              console.warn("WebSocket 인증 실패: 재연결 중단");
              return;
            }

            if (reconnectAttempts.current < maxReconnectAttempts) {
              reconnectAttempts.current++;
              console.log(
                `WebSocket 재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts} (${reconnectDelay}ms 후)`
              );

              setTimeout(() => {
                if (isAuthenticated && isMountedRef.current) {
                  console.log(`실제 재연결 시도 ${reconnectAttempts.current}/${maxReconnectAttempts}`);
                  isConnectedRef.current = false;
                  
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
                  
                  subscriptionRef.current = null;
                  initializeConnection();
                }
              }, reconnectDelay);
            } else {
              console.error("WebSocket 최대 재연결 시도 횟수 초과");
            }
          }
        );
      } else if (clientRef.current?.connected && subscriptionRef.current) {
        console.log(`Already subscribed to room ${roomId}`);
      } else if (clientRef.current?.connected && !subscriptionRef.current) {
        console.log(`Subscribing to room ${roomId} on existing connection`);
        subscriptionRef.current = clientRef.current.subscribe(
          isAiChat ? `/topic/ai-chat.${roomId}` : `/topic/chat.${roomId}`,
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
        console.log("Subscribed to topic:", isAiChat ? `/topic/ai-chat.${roomId}` : `/topic/chat.${roomId}`);
      }
    };

    initializeConnection();

    return () => {
      if (subscriptionRef.current) {
        console.log(`Unsubscribing from room ${roomId}`);
        try {
          subscriptionRef.current.unsubscribe();
        } catch (error) {
          console.warn('구독 해제 중 오류:', error);
        }
        subscriptionRef.current = null;
      }
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [roomId, onMessage, isAuthenticated, isAiChat]);
  
  useEffect(() => {
    return () => {
      console.log('useChatSocket cleanup 시작');
      
      initRef.current = false;
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        } catch (error) {
          console.warn('구독 해제 중 오류:', error);
        }
      }
      
      setTimeout(() => {
        if (initRef.current) {
          console.log('🛑 컴포넌트가 재초기화되어 정리 건너뜀');
          return;
        }
        
        console.log('🧹 useChatSocket 최종 정리 시작');
        isMountedRef.current = false;
        
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
        
        isConnectedRef.current = false;
        currentRoomIdRef.current = null;
        reconnectAttempts.current = 0;
        pendingMessages.current = [];
      }, 100);
    };
  }, []);

  const sendMessageInternal = useCallback(async (content: string, stomp: Stomp.Client) => {
    try {
      let userId = null;
      try {
        const response = await fetch('/api/events/user/role', {
          credentials: 'include',
          headers: { 'X-Silent-Auth': 'true' }
        });
        if (response.ok) {
          const userData = await response.json();
          userId = userData.userId;
        }
      } catch (error) {
        console.error("사용자 ID 조회 실패:", error);
      }

      const messagePayload = {
        chatRoomId: roomId,
        content: content.trim(),
        senderId: userId || 1,
        ...(isAiChat ? { provider: 'HERMES' } : {}),
      };

      console.log("메시지 전송:", content.trim(), "from userId:", userId);

      stomp.send(
        isAiChat ? "/app/ai-chat.sendMessage" : "/app/chat.sendMessage",
        {},
        JSON.stringify(messagePayload)
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [roomId, isAiChat]);

  const send = useCallback(
    (content: string) => {
      if (!content.trim()) {
        console.warn("Cannot send empty message");
        return;
      }

      const stomp = clientRef.current;

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

      if (stomp && stomp.connected && subscriptionRef.current) {
        console.log("✅ WebSocket 연결 상태, 즉시 전송:", content.trim());
        sendMessageInternal(content.trim(), stomp);
      } else if (stomp && stomp.connected) {
        console.warn("⚠️ WebSocket 연결됨, 하지만 구독 안됨");
        sendMessageInternal(content.trim(), stomp);
      } else {
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
