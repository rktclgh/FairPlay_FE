import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import ChatRoomList from "./ChatRoomList";
import ChatRoom from "./ChatRoom";

/**
 * 모달(팝업)로 떠 있는 채팅창의 메인입니다.
 * - 방목록 → 채팅방(메시지)로 뷰 전환
 */
export default function ChatModal({
                                      open,
                                      onClose,
                                  }: {
    open: boolean;
    onClose: () => void;
}) {
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

    return (
        <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/20 z-40" />
                <Dialog.Content
                    className="fixed bottom-24 right-8 w-[380px] max-w-full h-[580px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-in"
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="font-bold text-lg">문의/실시간 채팅</h2>
                        <button onClick={onClose} className="text-xl font-bold">×</button>
                    </div>
                    {/* 방 선택 전 → 방 목록 / 방 선택 → 채팅방 */}
                    {selectedRoomId === null ? (
                        <ChatRoomList onSelect={setSelectedRoomId} />
                    ) : (
                        <ChatRoom roomId={selectedRoomId} onBack={() => setSelectedRoomId(null)} />
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
