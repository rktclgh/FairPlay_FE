import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import ChatRoomList from "./ChatRoomList";
import ChatRoom from "./ChatRoom";
import axios from "axios";

type ChatRoomInfo = {
    roomId: number;
    eventTitle?: string;
    userName?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    selectedRoomId: number | null;
    setSelectedRoomId: (roomId: number | null) => void;
};

/**
 * 모달(팝업)로 떠 있는 채팅창의 메인입니다.
 * - 방목록 → 채팅방(메시지)로 뷰 전환
 */
export default function ChatModal({
                                      open,
                                      onClose,
                                      selectedRoomId,
                                      setSelectedRoomId,
                                  }: Props) {
    const [selectedRoomInfo, setSelectedRoomInfo] = useState<ChatRoomInfo | null>(null);
    const [hasOnlineAdmin, setHasOnlineAdmin] = useState(false);
    const [loading, setLoading] = useState(false);

    // 관리자 온라인 상태 확인
    const checkAdminStatus = async () => {
        try {
            const response = await axios.get('/api/chat/presence/admin-status', {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            setHasOnlineAdmin(response.data.hasOnlineAdmin);
        } catch (error) {
            console.error('관리자 상태 확인 실패:', error);
            setHasOnlineAdmin(false);
        }
    };

    // 전체 관리자 문의하기
    const handleAdminInquiry = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/chat/admin-inquiry', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            
            const roomData = response.data;
            setSelectedRoomId(roomData.chatRoomId);
            setSelectedRoomInfo({
                roomId: roomData.chatRoomId,
                eventTitle: roomData.eventTitle,
                userName: undefined
            });
        } catch (error) {
            console.error('전체 관리자 문의 생성 실패:', error);
            alert('문의 채팅방 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 모달이 열릴 때마다 관리자 상태 확인
    useEffect(() => {
        if (open) {
            checkAdminStatus();
            // 10초마다 관리자 상태 갱신
            const interval = setInterval(checkAdminStatus, 10000);
            return () => clearInterval(interval);
        }
    }, [open]);
    return (
        <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/20 z-40" />
                <Dialog.Content
                    className="fixed bottom-24 right-8 w-[380px] max-w-full h-[580px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-in"
                >
                    <Dialog.Title asChild>
                        <div className="flex items-center justify-between p-4 border-b bg-white">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-lg text-black">문의/실시간 채팅</h2>
                                {hasOnlineAdmin && (
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-green-600 font-medium">관리자 접속중</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={onClose} className="text-xl font-bold text-black">×</button>
                        </div>
                    </Dialog.Title>
                    <Dialog.Description className="sr-only">
                        실시간 채팅을 통해 문의사항을 해결하세요.
                    </Dialog.Description>
                    {/* 방 선택 전 → 방 목록 / 방 선택 → 채팅방 */}
                    {selectedRoomId === null ? (
                        <div className="flex flex-col h-full">
                            {/* FairPlay 운영자 문의 버튼 */}
                            <div className="p-4 border-b bg-gray-50">
                                <button
                                    onClick={handleAdminInquiry}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            연결중...
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                {hasOnlineAdmin && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                                                <span>💬 FairPlay 운영자에게 문의하기</span>
                                            </div>
                                        </>
                                    )}
                                </button>
                                {hasOnlineAdmin && (
                                    <p className="text-xs text-green-600 text-center mt-1">
                                        ✅ 관리자가 온라인 상태입니다. 빠른 답변을 받을 수 있어요!
                                    </p>
                                )}
                            </div>
                            <ChatRoomList onSelect={(roomId, eventTitle, userName) => {
                                setSelectedRoomId(roomId);
                                setSelectedRoomInfo({ roomId, eventTitle, userName });
                            }} />
                        </div>
                    ) : (
                        <ChatRoom
                            roomId={selectedRoomId}
                            onBack={() => {
                                setSelectedRoomId(null);
                                setSelectedRoomInfo(null);
                            }}
                            eventTitle={selectedRoomInfo?.eventTitle}
                            userName={selectedRoomInfo?.userName}
                        />
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
