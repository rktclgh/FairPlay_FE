import { useEffect, useState } from "react";
import axios from "axios";

// 채팅방 DTO 타입 정의 (API 응답 형태와 동일하게!)
type ChatRoomDto = {
    chatRoomId: number;
    eventId: number | null;
    userId: number;
    targetType: string;
    targetId: number;
    createdAt: string;
    closedAt: string | null;
};

type Props = {
    onSelect: (roomId: number) => void;
};

export default function ChatRoomList({ onSelect }: Props) {
    const [rooms, setRooms] = useState<ChatRoomDto[]>([]);
    const [loading, setLoading] = useState(true);

    // 실제 사용 시, 로그인 유저 정보에서 받아와야 함!
    const myUserId = Number(localStorage.getItem("userId"));

    useEffect(() => {
        // 내 채팅방(문의내역) 가져오기
        axios
            .get(`/api/chat/rooms?userId=${myUserId}`, {
                headers: { Authorization: "Bearer " + localStorage.getItem("accessToken") }
            })
            .then(res => setRooms(res.data))
            .finally(() => setLoading(false));
    }, [myUserId]);

    if (loading) return <div className="flex-1 flex items-center justify-center">로딩중...</div>;
    if (!rooms.length) return <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">문의 내역이 없습니다.</div>;

    return (
        <div className="flex-1 overflow-y-auto">
            {rooms.map(room => (
                <button
                    key={room.chatRoomId}
                    className="flex items-center gap-2 w-full px-4 py-3 border-b hover:bg-neutral-50 transition"
                    onClick={() => onSelect(room.chatRoomId)}
                >
                    {/* 초록불(온라인) 표시 */}
                    <OnlineDot targetType={room.targetType} targetId={room.targetId} />
                    <div className="flex flex-col items-start">
            <span className="font-medium">
              {room.eventId ? `행사 문의 (${room.eventId})` : "운영자 문의"}
            </span>
                        <span className="text-xs text-neutral-400">{room.createdAt?.slice(0, 16).replace("T", " ")}</span>
                    </div>
                </button>
            ))}
        </div>
    );
}

// --- 실시간 온라인 표시 (초록불)
function OnlineDot({ targetType, targetId }: { targetType: string; targetId: number }) {
    const [online, setOnline] = useState(false);

    useEffect(() => {
        let cancelled = false;
        // REST로 현재 온라인 상태 확인
        axios.get("/api/chat/presence", {
            params: { isManager: targetType !== "SUPER_ADMIN" ? true : false, userId: targetId }
        }).then(res => {
            if (!cancelled) setOnline(res.data === true);
        });
        // 5초마다 상태 갱신 (ping)
        const interval = setInterval(() => {
            axios.get("/api/chat/presence", {
                params: { isManager: targetType !== "SUPER_ADMIN" ? true : false, userId: targetId }
            }).then(res => {
                if (!cancelled) setOnline(res.data === true);
            });
        }, 5000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [targetType, targetId]);

    return (
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${online ? "bg-green-500" : "bg-gray-300"}`} />
    );
}
