import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useChatSocket } from "./useChatSocket";

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
};

export default function ChatRoom({ roomId, onBack }: Props) {
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [input, setInput] = useState("");
    const myUserId = Number(localStorage.getItem("userId"));
    const bottomRef = useRef<HTMLDivElement>(null);

    const { send } = useChatSocket(roomId, (msg: ChatMessageDto) => {
        setMessages(prev => [...prev, msg]);
    });

    useEffect(() => {
        axios.get(`/api/chat/messages?chatRoomId=${roomId}`, {
            headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
        }).then(res => setMessages(res.data));
    }, [roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        send(input.trim());
        setInput("");
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-neutral-50">
                <button onClick={onBack} className="mr-2 text-xl font-bold">&larr;</button>
                <span className="font-semibold">채팅방</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map(msg => (
                    <div key={msg.chatMessageId} className={`mb-2 flex ${msg.senderId === myUserId ? "justify-end" : "justify-start"}`}>
                        <div className={`px-3 py-2 rounded-xl max-w-xs text-sm ${msg.senderId === myUserId ? "bg-blue-500 text-white" : "bg-neutral-200 text-black"}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <div className="flex items-center gap-2 p-3 border-t bg-white">
                <input
                    type="text"
                    className="flex-1 border rounded-xl px-3 py-2"
                    placeholder="메시지 입력"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => (e.key === "Enter" ? handleSend() : undefined)}
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
