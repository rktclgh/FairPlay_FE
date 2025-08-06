import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useChatSocket } from "./useChatSocket";

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
    const [roomTitle, setRoomTitle] = useState<string>(userName || eventTitle || "채팅방");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // accessToken에서 userId 추출
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = parseInt(payload.sub);
                setMyUserId(userId);
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
        <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-white">
                <button onClick={onBack} className="mr-2 text-xl font-bold text-black">&larr;</button>
                <span className="font-semibold text-black">{roomTitle}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
                {messages.map(msg => {
                    const isMyMessage = msg.senderId === myUserId;
                    const messageTime = new Date(msg.sentAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });

                    return (
                        <div key={`msg-${msg.chatMessageId}-${Date.now()}-${Math.random()}`} className={`mb-3 flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs ${isMyMessage ? "text-right" : "text-left"}`}>
                                <div className={`px-4 py-2 rounded-2xl text-sm inline-block ${
                                    isMyMessage 
                                        ? "bg-blue-500 text-white" 
                                        : "bg-blue-50 text-blue-900 border border-blue-200"
                                }`}>
                                    {msg.content}
                                </div>
                                <div className={`text-xs text-gray-500 mt-1 ${isMyMessage ? "text-right" : "text-left"}`}>
                                    {messageTime}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
            <div className="flex items-center gap-2 p-3 border-t bg-white">
                <input
                    type="text"
                    className="flex-1 border rounded-xl px-3 py-2 text-black bg-white"
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
                    className="bg-blue-500 text-white rounded-xl px-4 py-2 font-bold"
                >
                    전송
                </button>
            </div>
        </div>
    );
}
