import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../api/axios";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import UserOnlineStatus from "./UserOnlineStatus";
import { useAuth } from "../../context/AuthContext";

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
    onSelect: (roomId: number, eventTitle?: string, userName?: string, otherUserId?: number, isAiChat?: boolean) => void;
};

export default function ChatRoomList({ onSelect }: Props) {
    const { isAuthenticated } = useAuth();
    const [rooms, setRooms] = useState<ChatRoomDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastMessageTimes, setLastMessageTimes] = useState<Record<number, string>>({});
    const clientRef = useRef<Stomp.Client | null>(null);

    console.log('📝 ChatRoomList isAuthenticated:', isAuthenticated);

    const fetchRooms = useCallback(async () => {
        if (!isAuthenticated) {
            console.log('📝 ChatRoomList fetchRooms: 인증되지 않음');
            setLoading(false);
            return;
        }

        try {
            // 백엔드에서 사용자 역할에 따라 적절한 채팅방 목록을 모두 반환
            // (복잡한 프론트엔드 역할 체크 로직 제거, 백엔드에서 처리)
            const response = await api.get(`/api/chat/rooms`);

            const allRooms = response.data;
            console.log("백엔드에서 반환된 채팅방 수:", allRooms.length);

            // AI 챗봇만 리스트에서 제외 (ADMIN 타입은 관리자가 볼 수 있어야 함)
            const filteredRooms = allRooms.filter((room: ChatRoomDto) => 
                room.targetType !== 'AI'
            );
            console.log("필터링 후 채팅방 수:", filteredRooms.length);

            // 채팅방 생성 시간을 기본으로 사용 (메시지 조회하지 않음)
            const messageTimesMap: Record<number, string> = {};
            filteredRooms.forEach((room: ChatRoomDto) => {
                messageTimesMap[room.chatRoomId] = room.createdAt;
            });
            setLastMessageTimes(messageTimesMap);
            setRooms(filteredRooms);
        } catch (error) {
            console.error("채팅방 조회 실패:", error);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            console.log('📝 ChatRoomList useEffect: 인증되지 않음');
            setLoading(false);
            return;
        }

        fetchRooms();

        // WebSocket 연결로 실시간 업데이트 (SockJS fallback 엔드포인트 사용)
        // HTTP-only 쿠키 방식에서는 쿠키가 자동으로 포함됨
        const sockjsUrl = window.location.hostname === 'localhost'
            ? `${import.meta.env.VITE_BACKEND_BASE_URL}/ws/chat-sockjs`
            : `${window.location.protocol}//${window.location.host}/ws/chat-sockjs`;
        const sock = new SockJS(sockjsUrl, [], { withCredentials: true });
        const stomp = Stomp.over(sock);
        stomp.debug = () => { };
        clientRef.current = stomp;

        const headers = {};

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
    }, [fetchRooms, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 bg-white">
                <p className="text-center">로그인이 필요한 서비스입니다.</p>
                <p className="text-sm text-gray-400 mt-2">채팅 기능을 사용하려면 로그인해 주세요.</p>
            </div>
        );
    }
    
    if (loading) return <div className="flex-1 flex items-center justify-center bg-white text-neutral-500">로딩중...</div>;
    if (!rooms.length) return (
        <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 bg-white">
            문의 내역이 없습니다.
        </div>
    );

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

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const trimmed = name.trim();
        const firstWord = trimmed.split(/\s+/)[0] ?? trimmed;
        const firstChar = firstWord.charAt(0);
        return firstChar ? firstChar.toUpperCase() : 'U';
    };

    return (
        <div className="flex-1 overflow-y-auto bg-white">
            {sortedRooms.map(room => (
                <div
                    key={room.chatRoomId}
                    className="group flex items-center w-full px-4 py-3 border-b hover:bg-neutral-50 cursor-pointer transition-colors bg-white"
                    onClick={() => onSelect(room.chatRoomId, room.eventTitle, room.userName, room.userId, room.targetType === 'AI')}
                >
                    <div className="relative mr-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
                            room.targetType === 'AI' 
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                                : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                        }`}>
                            {room.targetType === 'AI' ? 'AI' : getInitials(room.userName)}
                        </div>
                        {/* 온라인 상태 표시 */}
                        <div className="absolute -bottom-0.5 -right-0.5">
                            {room.targetType === 'AI' ? (
                                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            ) : (
                                <UserOnlineStatus userId={room.userId} />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-neutral-900 truncate">
                                {room.targetType === 'AI' ? 'AI 챗봇' : (room.userName || room.eventTitle || "문의")}
                            </span>
                            <div className="flex items-center gap-2">
                                {(room.unreadCount || 0) > 0 && (
                                    <div className="bg-red-500 text-white rounded-full min-w-5 h-5 flex items-center justify-center text-xs font-semibold px-1 shadow-sm">
                                        {room.unreadCount}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600 truncate">
                                {room.targetType === 'AI' ? '24시간 상담 가능' : (room.eventTitle || (room.eventId ? `행사 문의 (${room.eventId})` : "운영자 문의"))}
                            </span>
                            <span className="text-xs text-neutral-400 ml-2 whitespace-nowrap">
                                {new Date(room.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

