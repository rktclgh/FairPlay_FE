import { useEffect, useState } from "react";
import ChatModal from "./ChatModal";
import ChatFloatingButton from "./ChatFloatingButton";

// 전역 채팅방 오픈 함수 (외부에서 사용)
let openChatRoom: ((roomId: number) => void) | null = null;
export function openChatRoomGlobal(roomId: number) {
    if (openChatRoom) openChatRoom(roomId);
}

export default function ChatFloatingModal() {
    const [open, setOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

    useEffect(() => {
        openChatRoom = (roomId: number) => {
            setOpen(true);
            setSelectedRoomId(roomId);
        };
        return () => { openChatRoom = null; };
    }, []);

    return (
        <>
            <ChatFloatingButton onClick={() => setOpen(true)} />
            <ChatModal
                open={open}
                onClose={() => setOpen(false)}
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
            />
        </>
    );
}
