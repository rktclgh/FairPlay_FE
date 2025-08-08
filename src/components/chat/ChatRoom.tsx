import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useChatSocket } from "./useChatSocket";
import { ArrowLeft, Send } from "lucide-react";

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
};

export default function ChatRoom({ roomId, onBack, eventTitle, userName }: Props) {
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [input, setInput] = useState("");
    const [myUserId, setMyUserId] = useState<number>(0);
    const [myName, setMyName] = useState<string>("나");
    const [roomTitle, setRoomTitle] = useState<string>(userName || eventTitle || "채팅방");
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

    const { send } = useChatSocket(roomId, (msg: ChatMessageDto) => {
        setMessages(prev => [...prev, msg]);
    });

    // 최초 진입 시 기존 메시지 내역 조회
    useEffect(() => {
        // 메시지 목록 가져오기
        axios.get(`/api/chat/messages?chatRoomId=${roomId}`, {
            headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
        }).then(res => {
            setMessages(res.data);
            // 메시지를 불러온 후 읽음 처리
            markMessagesAsRead();
        });

        // 채팅방 정보 가져오기 (제목 설정용)
        if (!eventTitle) {
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
    }, [roomId, eventTitle]);

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
        if (!input.trim()) return;
        const message = input.trim();
        setInput(""); // 먼저 입력 필드를 클리어
        send(message);
    };


    return (
        <div className="flex-1 flex flex-col h-full min-h-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-white flex-none">
                <button
                    onClick={onBack}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black transition"
                    aria-label="뒤로"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-black">{roomTitle}</span>
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
                        <div key={`msg-${msg.chatMessageId}-${Date.now()}-${Math.random()}`} className={`mb-3 flex items-start ${isMyMessage ? "justify-end" : "justify-start"}`}>
                            {!isMyMessage && (
                                <div className="mr-2 mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-semibold">
                                    {initials}
                                </div>
                            )}
                            <div className={`max-w-[70%] ${isMyMessage ? "text-right" : "text-left"}`}>
                                <div className={`px-3.5 py-2 rounded-2xl text-[13px] leading-5 inline-block align-top shadow-sm ${isMyMessage ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-900 border border-neutral-200"
                                    }`}>
                                    {msg.content}
                                </div>
                                <div className={`text-[11px] text-gray-400 mt-1 ${isMyMessage ? "text-right" : "text-left"}`}>
                                    {messageTime}
                                </div>
                            </div>
                            {isMyMessage && (
                                <div className="ml-2 mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-semibold">
                                    {initials}
                                </div>
                            )}
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
                />
                <button
                    onClick={handleSend}
                    className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full px-4 py-2.5 text-[13px] font-medium shadow-sm hover:brightness-105 active:scale-95 transition"
                >
                    <Send className="w-4 h-4" />
                    전송
                </button>
            </div>
        </div>
    );
}
