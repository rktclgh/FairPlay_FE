import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

// 채팅방 DTO 타입 정의 (API 응답 형태와 동일하게!)
type ChatRoomDto = {
    chatRoomId: number;
    eventId: number | null;
    userId: number;
    targetType: string;
    targetId: number;
    createdAt: string;
    closedAt: string | null;
    eventTitle?: string;
    userName?: string;
    unreadCount?: number;
};

type Props = {
    onSelect: (roomId: number, eventTitle?: string, userName?: string) => void;
};

export default function ChatRoomList({ onSelect }: Props) {
    const [rooms, setRooms] = useState<ChatRoomDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastMessageTimes, setLastMessageTimes] = useState<Record<number, string>>({});
    const clientRef = useRef<Stomp.Client | null>(null);

    const fetchRooms = useCallback(async () => {
            try {
                // 백엔드에서 사용자 역할에 따라 적절한 채팅방 목록을 모두 반환
                // (복잡한 프론트엔드 역할 체크 로직 제거, 백엔드에서 처리)
                const response = await axios.get(`/api/chat/rooms`, {
                    headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
                });

                const allRooms = response.data;
                console.log("백엔드에서 반환된 채팅방 수:", allRooms.length);

                // 각 채팅방의 최신 메시지 시간을 가져와서 저장
                const messageTimesPromises = allRooms.map(async (room: ChatRoomDto) => {
                    try {
                        const messagesResponse = await axios.get(`/api/chat/messages?chatRoomId=${room.chatRoomId}`, {
                            headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
                        });
                        const messages = messagesResponse.data;
                        return {
                            roomId: room.chatRoomId,
                            lastMessageTime: messages.length > 0 ? messages[messages.length - 1].sentAt : room.createdAt
                        };
                    } catch (error) {
                        return {
                            roomId: room.chatRoomId,
                            lastMessageTime: room.createdAt
                        };
                    }
                });

                const messageTimes = await Promise.all(messageTimesPromises);
                const messageTimesMap: Record<number, string> = {};
                messageTimes.forEach(({ roomId, lastMessageTime }) => {
                    messageTimesMap[roomId] = lastMessageTime;
                });

                setLastMessageTimes(messageTimesMap);
                setRooms(allRooms);
            } catch (error) {
                console.error("채팅방 조회 실패:", error);
                setRooms([]);
            } finally {
                setLoading(false);
            }
    }, []);

    useEffect(() => {
        fetchRooms();

        // WebSocket 연결로 실시간 업데이트
        const sock = new SockJS("/ws/chat");
        const stomp = Stomp.over(sock);
        stomp.debug = null;
        clientRef.current = stomp;

        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        stomp.connect(
            headers,
            () => {
                console.log("채팅방 목록 WebSocket 연결됨");

                // 채팅방 목록 업데이트 알림 구독
                stomp.subscribe("/topic/chat-room-list", () => {
                    console.log("채팅방 목록 업데이트 알림 수신 - 새로고침");
                    fetchRooms();
                });
            },
            (error) => {
                console.error("WebSocket 연결 실패:", error);
            }
        );


        return () => {
            if (clientRef.current?.connected) {
                clientRef.current.disconnect(() => {
                    console.log("채팅방 목록 WebSocket 연결 해제");
                });
            }
        };
    }, [fetchRooms]);

    if (loading) return <div className="flex-1 flex items-center justify-center bg-white text-black">로딩중...</div>;
    if (!rooms.length) return <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white">문의 내역이 없습니다.</div>;

    // 읽지 않은 메시지가 있는 채팅방을 위로, 그 다음 최신 메시지 시간순으로 정렬
    const sortedRooms = [...rooms].sort((a, b) => {
        // 1. 읽지 않은 메시지가 있는 것을 우선
        if ((a.unreadCount || 0) > 0 && (b.unreadCount || 0) === 0) return -1;
        if ((a.unreadCount || 0) === 0 && (b.unreadCount || 0) > 0) return 1;

        // 2. 최신 메시지 시간으로 정렬 (lastMessageTimes가 있으면 사용, 없으면 createdAt 사용)
        const aTime = lastMessageTimes[a.chatRoomId] || a.createdAt;
        const bTime = lastMessageTimes[b.chatRoomId] || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return (
        <div className="flex-1 overflow-y-auto bg-white">
            {sortedRooms.map(room => (
                <div
                    key={room.chatRoomId}
                    className="flex items-center w-full px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors bg-white"
                    onClick={() => onSelect(room.chatRoomId, room.eventTitle, room.userName)}
                >
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {room.userName ? room.userName.charAt(0) : 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 truncate">
                                {room.userName || room.eventTitle || "문의"}
                            </span>
                            <div className="flex items-center gap-2">
                                {(room.unreadCount || 0) > 0 && (
                                    <div className="bg-red-500 text-white rounded-full min-w-5 h-5 flex items-center justify-center text-xs font-bold px-1">
                                        {room.unreadCount}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 truncate">
                                {room.eventTitle || (room.eventId ? `행사 문의 (${room.eventId})` : "운영자 문의")}
                            </span>
                            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                {new Date(room.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

