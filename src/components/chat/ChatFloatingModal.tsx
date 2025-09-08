import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatModal from "./ChatModal";
import ChatFloatingButton from "./ChatFloatingButton";
import { useAuth } from "../../context/AuthContext";
import { requireAuth } from "../../utils/authGuard";

// 전역 채팅방 오픈 함수 (외부에서 사용)
let openChatRoom: ((roomId: number) => void) | null = null;
export function openChatRoomGlobal(roomId: number) {
    if (openChatRoom) openChatRoom(roomId);
}

export default function ChatFloatingModal() {
    const [open, setOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        openChatRoom = (roomId: number) => {
            if (!requireAuth(isAuthenticated, navigate, '채팅')) {
                return;
            }
            setOpen(true);
            setSelectedRoomId(roomId);
        };
        return () => { openChatRoom = null; };
    }, [navigate, isAuthenticated]);

    const handleChatOpen = () => {
        if (!requireAuth(isAuthenticated, navigate, '채팅')) {
            return;
        }
        setOpen(!open);
    };

    return (
        <>
            <ChatFloatingButton 
                onClick={handleChatOpen} 
                isOpen={open}
            />
            <ChatModal
                open={open}
                onClose={() => setOpen(false)}
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
            />
        </>
    );
}
