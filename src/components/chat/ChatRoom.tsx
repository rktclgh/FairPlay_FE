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
    const bottomRef = useRef<HTMLDivElement>(null);

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
            // 중복 메시지 방지
            if (prev.some(existingMsg => existingMsg.chatMessageId === msg.chatMessageId)) {
                return prev;
            }
            // 새 메시지 추가 후 시간순 정렬
            const newMessages = [...prev, msg];
            return newMessages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        });
        
        // AI 봇 메시지 감지 (ID: 999)
        if (isAiChat && msg.senderId === 999) {
            console.log("🤖 AI 봇 응답 도착! 전송 버튼 활성화");
            setIsSending(false);
            setPendingMessage(null);
            setLastAiMessageId(msg.chatMessageId);
        }
    }, [isAiChat]);

    const { send } = useChatSocket(roomId, handleMessage);

    // 최초 진입 시 기존 메시지 내역 조회
    useEffect(() => {
        // 메시지 목록 가져오기
        axios.get(`/api/chat/messages?chatRoomId=${roomId}`, {
            headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
        }).then(res => {
            const messageData = res.data || [];
            // 메시지를 시간순으로 정렬 (오래된 것부터)
            const sortedMessages = messageData.sort((a: ChatMessageDto, b: ChatMessageDto) => 
                new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
            );
            setMessages(sortedMessages);
            
            // 메시지에서 상대방 userId 추출 (내가 아닌 다른 발신자)
            if (messageData.length > 0 && myUserId) {
                const otherSender = messageData.find((msg: ChatMessageDto) => msg.senderId !== myUserId);
                if (otherSender && !detectedOtherUserId) {
                    setDetectedOtherUserId(otherSender.senderId);
                }
            }
            
            // 메시지를 불러온 후 읽음 처리
            markMessagesAsRead();
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
        axios.patch(`/api/chat/messages/read?chatRoomId=${roomId}`, {}, {
            headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
        }).catch(err => {
            console.warn("메시지 읽음 처리 실패:", err);
        });
    };

    // 스크롤 자동 아래로 내림
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || isSending) {
            console.log("❌ 전송 차단:", { inputEmpty: !input.trim(), isSending });
            return;
        }
        
        const message = input.trim();
        setInput(""); // 먼저 입력 필드를 클리어
        
        // AI 채팅일 경우 전송 중 상태로 설정
        if (isAiChat) {
            console.log("🚀 AI 메시지 전송 시작 - 버튼 비활성화!");
            setIsSending(true);
            setPendingMessage(message);
            
            // 사용자 메시지를 즉시 표시 (임시 ID 사용)
            const tempMessage: ChatMessageDto = {
                chatMessageId: Date.now(), // 임시 ID
                chatRoomId: roomId,
                senderId: myUserId,
                content: message,
                sentAt: new Date().toISOString(),
                isRead: true
            };
            
            setMessages(prev => [...prev, tempMessage]);
        }
        
        send(message);
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
            <div className="flex-1 overflow-y-auto p-4 bg-white min-h-0">
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