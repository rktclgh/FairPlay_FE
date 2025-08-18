import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useChatSocket } from "./useChatSocket";
import { ArrowLeft, Send } from "lucide-react";
import UserOnlineStatus from "./UserOnlineStatus";

// 메시지 DTO 타입
type ChatMessageDto = {
    chatMessageId: number;
    chatRoomId: number;
    senderId: number;
    content: string;
    sentAt: string;
    isRead: boolean;
};

type Props = {
    roomId: number;
    onBack: () => void;
    eventTitle?: string;
    userName?: string;
    otherUserId?: number; // 상대방 userId 추가
    isAdminInquiry?: boolean; // FairPlay 운영자 문의 채팅방 여부
    isAiChat?: boolean; // AI 채팅방 여부
};

export default function ChatRoom({ roomId, onBack, eventTitle, userName, otherUserId, isAdminInquiry, isAiChat }: Props) {
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [input, setInput] = useState("");
    const [myUserId, setMyUserId] = useState<number>(0);
    const [myName, setMyName] = useState<string>("나");
    const [roomTitle, setRoomTitle] = useState<string>(
        isAiChat ? "AI 챗봇" : (isAdminInquiry ? "FairPlay 운영자 문의" : (userName || eventTitle || "채팅방"))
    );
    const [detectedOtherUserId, setDetectedOtherUserId] = useState<number | null>(null);
    const [isSending, setIsSending] = useState(false); // 전송 중 상태
    const [pendingMessage, setPendingMessage] = useState<string | null>(null); // 대기 중인 메시지
    const [lastAiMessageId, setLastAiMessageId] = useState<number | null>(null); // 마지막 AI 메시지 ID 추적
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true); // 더 많은 메시지가 있는지
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false); // 추가 메시지 로딩 중
    const [oldestMessageId, setOldestMessageId] = useState<number | null>(null); // 가장 오래된 메시지 ID
    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const getInitials = (name: string): string => {
        if (!name) return "U";
        const trimmed = name.trim();
        const firstWord = trimmed.split(/\s+/)[0] ?? trimmed;
        const firstChar = firstWord.charAt(0);
        return firstChar ? firstChar.toUpperCase() : "U";
    };

    useEffect(() => {
        // accessToken에서 userId 추출
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = parseInt(payload.sub);
                setMyUserId(userId);
                const nameFromToken = payload.name || payload.nickname || "나";
                setMyName(nameFromToken);
                console.log("ChatRoom 사용자 ID 설정:", userId);
            } catch (error) {
                console.error("토큰 파싱 실패:", error);
                setMyUserId(0);
            }
        }
    }, []);

    // 메시지 처리 함수를 useCallback으로 메모이제이션
    const handleMessage = useCallback((msg: ChatMessageDto) => {
        console.log("💬 메시지 수신:", { senderId: msg.senderId, content: msg.content.substring(0, 30) + "..." });
        
        setMessages(prev => {
            // 중복 메시지 방지 - chatMessageId와 senderId+content+sentAt로 중복 체크
            const isDuplicate = prev.some(existingMsg => 
                existingMsg.chatMessageId === msg.chatMessageId ||
                (existingMsg.senderId === msg.senderId && 
                 existingMsg.content === msg.content && 
                 Math.abs(new Date(existingMsg.sentAt).getTime() - new Date(msg.sentAt).getTime()) < 1000)
            );
            
            if (isDuplicate) {
                console.log("🔄 중복 메시지 무시:", msg.chatMessageId);
                return prev;
            }
            
            // 새 메시지가 수신되었으므로 자동 스크롤 활성화
            setShouldScrollToBottom(true);
            
            // 새 메시지 추가 후 시간순 정렬
            const newMessages = [...prev, msg];
            return newMessages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        });
        
        // AI 봇 메시지 감지 (ID: 999)
        if (isAiChat && msg.senderId === 999) {
            console.log("🤖 AI 봇 응답 도착! 전송 버튼 활성화 및 즉시 읽음 처리");
            setIsSending(false);
            setPendingMessage(null);
            setLastAiMessageId(msg.chatMessageId);
            
            // AI 메시지는 즉시 백엔드로 읽음 처리 요청
            setTimeout(() => markMessagesAsRead(), 100);
        }
    }, [isAiChat]);

    // 더 많은 메시지 로드 (버튼 클릭 시)
    const loadMoreMessages = useCallback(async () => {
        if (!hasMoreMessages || isLoadingMore || !oldestMessageId) {
            console.log('🙅 더 이상 로드할 메시지가 없거나 로딩 중:', { hasMoreMessages, isLoadingMore, oldestMessageId });
            return;
        }
        
        // 현재 스크롤 위치 저장 (새 메시지 추가 후 위치 복원용)
        const container = messagesContainerRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;
        const previousScrollTop = container?.scrollTop || 0;
        
        setIsLoadingMore(true);
        console.log(`🔄 추가 메시지 로드 시작 - lastMessageId: ${oldestMessageId}`);
        
        try {
            const response = await axios.get(`/api/chat/messages/cursor?chatRoomId=${roomId}&lastMessageId=${oldestMessageId}&size=20`, {
                headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
            });
            
            const data = response.data;
            const newMessages = data.messages || [];
            
            if (newMessages.length > 0) {
                const sortedNewMessages = newMessages.sort((a: ChatMessageDto, b: ChatMessageDto) => 
                    new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
                );
                
                // 이전 메시지들을 앞에 추가
                setMessages(prev => {
                    const combined = [...sortedNewMessages, ...prev];
                    // 중복 제거
                    const uniqueMessages = combined.filter((msg, index, arr) => 
                        arr.findIndex(m => m.chatMessageId === msg.chatMessageId) === index
                    );
                    return uniqueMessages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
                });
                
                // 다음 페이지를 위한 커서 업데이트 (백엔드에서 제공하는 nextCursor 사용)
                if (data.nextCursor) {
                    setOldestMessageId(data.nextCursor);
                } else if (sortedNewMessages.length > 0) {
                    // nextCursor가 없으면 가장 오래된 메시지 ID 사용
                    setOldestMessageId(sortedNewMessages[0].chatMessageId);
                }
                
                // 이전 메시지 로드 시에는 자동 스크롤 비활성화
                setShouldScrollToBottom(false);
                
                // 스크롤 위치 복원 (사용자의 현재 위치를 유지)
                setTimeout(() => {
                    if (container) {
                        const newScrollHeight = container.scrollHeight;
                        const scrollDiff = newScrollHeight - previousScrollHeight;
                        container.scrollTop = previousScrollTop + scrollDiff;
                        console.log(`📍 스크롤 위치 복원: ${previousScrollTop + scrollDiff}`);
                    }
                }, 50); // DOM 업데이트 대기
                
                console.log(`📨 추가 메시지 로드 완료: ${newMessages.length}개, 더보기 가능: ${data.hasNext}`);
                console.log('📨 로드된 메시지 ID 범위:', sortedNewMessages.length > 0 ? `${sortedNewMessages[0].chatMessageId} ~ ${sortedNewMessages[sortedNewMessages.length-1].chatMessageId}` : 'none');
                console.log('📨 다음 커서:', data.nextCursor);
            } else {
                console.log('📨 추가 메시지 없음');
            }
            
            // 다음 페이지 존재 여부 업데이트
            setHasMoreMessages(data.hasNext || false);
            
        } catch (error) {
            console.error('추가 메시지 로드 실패:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [roomId, hasMoreMessages, isLoadingMore, oldestMessageId]);

    // 이전 메시지 불러오기 버튼 클릭 핸들러
    const handleLoadMoreClick = useCallback(() => {
        console.log('🔄 이전 메시지 불러오기 버튼 클릭');
        loadMoreMessages();
    }, [loadMoreMessages]);
    
    // 새 메시지 수신 시에만 아래로 스크롤 (기존 메시지 로드 시에는 스크롤 안함)
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    const { send } = useChatSocket(roomId, handleMessage);

    // 최초 진입 시 기존 메시지 내역 조회
    useEffect(() => {
        // 페이징 API로 메시지 목록 가져오기 (최신 20개)
        axios.get(`/api/chat/messages/cursor?chatRoomId=${roomId}&size=20`, {
            headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
        }).then(res => {
            const data = res.data;
            const messageData = data.messages || [];
            
            // 메시지를 시간순으로 정렬 (오래된 것부터)
            const sortedMessages = messageData.sort((a: ChatMessageDto, b: ChatMessageDto) => 
                new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
            );
            setMessages(sortedMessages);
            
            // 페이징 상태 설정
            setHasMoreMessages(data.hasNext || false);
            if (sortedMessages.length > 0) {
                setOldestMessageId(sortedMessages[0].chatMessageId);
            }
            
            // 메시지에서 상대방 userId 추출 (내가 아닌 다른 발신자)
            if (messageData.length > 0 && myUserId) {
                const otherSender = messageData.find((msg: ChatMessageDto) => msg.senderId !== myUserId);
                if (otherSender && !detectedOtherUserId) {
                    setDetectedOtherUserId(otherSender.senderId);
                }
            }
            
            // 메시지를 불러온 후 읽음 처리
            markMessagesAsRead();
            
            // 초기 로드이므로 아래로 스크롤 활성화
            setShouldScrollToBottom(true);
            
            console.log(`📨 메시지 로드 완료: ${messageData.length}개, 더보기 가능: ${data.hasNext}`);
            console.log(`📨 가장 오래된 메시지 ID: ${sortedMessages.length > 0 ? sortedMessages[0].chatMessageId : 'none'}`);
        }).catch(err => {
            console.warn("메시지 목록 가져오기 실패:", err);
            setMessages([]);
        });

        // 채팅방 정보 가져오기 (제목 설정용)
        if (!eventTitle && !isAdminInquiry) {
            axios.get(`/api/chat/rooms`, {
                headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
            }).then(res => {
                const room = res.data.find((r: any) => r.chatRoomId === roomId);
                if (room && room.eventTitle) {
                    setRoomTitle(room.eventTitle);
                }
            }).catch(err => {
                console.warn("채팅방 정보 가져오기 실패:", err);
            });
        }
    }, [roomId, eventTitle, myUserId, isAdminInquiry]);

    // isAdminInquiry가 변경될 때 roomTitle 업데이트
    useEffect(() => {
        if (isAdminInquiry) {
            setRoomTitle("FairPlay 운영자 문의");
        }
    }, [isAdminInquiry]);

    // 메시지 읽음 처리
    const markMessagesAsRead = () => {
        // AI 채팅방도 백엔드로 읽음 처리 전송 (unreadCount 업데이트 위해)
        axios.patch(`/api/chat/messages/read?chatRoomId=${roomId}`, {}, {
            headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
        }).then(() => {
            // 성공 시 로컬 상태도 업데이트
            setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
        }).catch(err => {
            console.warn("메시지 읽음 처리 실패:", err);
        });
    };

    // 새 메시지 수신 시에만 아래로 스크롤 (이전 메시지 로드 시에는 스크롤 안함)
    useEffect(() => {
        if (shouldScrollToBottom) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, shouldScrollToBottom]);

    // AI 챗봇 최초 진입 시 읽음 처리
    useEffect(() => {
        if (isAiChat && messages.length > 0) {
            markMessagesAsRead();
        }
    }, [isAiChat]); // messages 의존성 제거

    const handleSend = () => {
        if (!input.trim() || isSending) {
            console.log("❌ 전송 차단:", { inputEmpty: !input.trim(), isSending });
            return;
        }
        
        const message = input.trim();
        setInput(""); // 먼저 입력 필드를 클리어
        
        // AI 채팅일 경우 전송 중 상태로 설정 (임시 메시지 추가 안함)
        if (isAiChat) {
            console.log("🚀 AI 메시지 전송 시작 - 버튼 비활성화!");
            setIsSending(true);
            setPendingMessage(message);
        }
        
        send(message);
        
        // 메시지 전송 후에는 아래로 스크롤되도록 설정
        setShouldScrollToBottom(true);
    };


    return (
        <div className="flex-1 flex flex-col h-full min-h-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-white flex-none">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-black">{roomTitle}</span>
                    {/* 상대방의 온라인 상태 표시 */}
                    {isAiChat ? (
                        <span className="text-xs text-green-600 font-medium ml-1">● 항상 온라인</span>
                    ) : (otherUserId || detectedOtherUserId) && (
                        <UserOnlineStatus 
                            userId={otherUserId || detectedOtherUserId!} 
                            showText={true}
                            className="ml-1"
                        />
                    )}
                </div>
            </div>
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-white min-h-0"
            >
                {/* 이전 메시지 불러오기 버튼 */}
                {hasMoreMessages && (
                    <div className="flex justify-center py-3 mb-2">
                        <button
                            onClick={handleLoadMoreClick}
                            disabled={isLoadingMore}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 transform ${
                                isLoadingMore 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 active:scale-95 shadow-sm border border-blue-200 hover:shadow-md'
                            }`}
                        >
                            {isLoadingMore ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                                    이전 메시지 로딩 중...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 transform transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    이전 메시지 불러오기
                                </>
                            )}
                        </button>
                    </div>
                )}
                {/* 채팅 메시지 목록 */}
                {messages.map(msg => {
                    const isMyMessage = msg.senderId === myUserId;
                    const otherName = userName || "운영자";
                    const initials = isMyMessage ? getInitials(myName) : getInitials(otherName);
                    const messageTime = new Date(msg.sentAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });

                    return (
                        <div key={`msg-${msg.chatMessageId}-${msg.sentAt}`} className={`mb-3 flex items-start ${isMyMessage ? "justify-end" : "justify-start"}`}>
                            {!isMyMessage && (
                                <div className="relative mr-2 mt-0.5 flex-shrink-0">
                                    <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-semibold ${
                                        isAiChat ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-gradient-to-br from-blue-600 to-indigo-600"
                                    }`}>
                                        {isAiChat ? "AI" : initials}
                                    </div>
                                    {/* 상대방 메시지의 온라인 상태 표시 */}
                                    {isAiChat ? (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    ) : (otherUserId || detectedOtherUserId) && (
                                        <div className="absolute -bottom-0.5 -right-0.5">
                                            <UserOnlineStatus userId={otherUserId || detectedOtherUserId!} />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className={`max-w-[70%] ${isMyMessage ? "text-right" : "text-left"}`}>
                                <div className={`px-3.5 py-2 rounded-2xl text-[13px] leading-5 inline-block align-top shadow-sm whitespace-pre-wrap ${isMyMessage ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-900 border border-neutral-200"
                                    }`}>
                                    {msg.content}
                                </div>
                                <div className={`text-[11px] text-gray-400 mt-1 ${isMyMessage ? "text-right" : "text-left"}`}>
                                    {messageTime}
                                </div>
                            </div>

                        </div>
                    );
                })}
                <div ref={bottomRef} />
                
                {/* 더 이상 메시지가 없을 때 표시 */}
                {!hasMoreMessages && messages.length > 20 && (
                    <div className="flex justify-center py-2 mb-2">
                        <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            🎉 첫 메시지입니다
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 p-3 border-t bg-white flex-none">
                <input
                    type="text"
                    className="flex-1 border border-neutral-200 rounded-full px-4 py-2.5 text-[13px] text-black bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="메시지 입력"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={isSending}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium shadow-sm transition ${
                        !input.trim() || isSending 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                            : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:brightness-105 active:scale-95"
                    }`}
                >
                    <Send className="w-4 h-4" />
                    {isSending ? "응답 중..." : "전송"}
                </button>
            </div>
        </div>
    );
}