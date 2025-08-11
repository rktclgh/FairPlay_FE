import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MessageCircle, ChevronLeft } from "lucide-react";
import ChatRoomList from "./ChatRoomList";
import ChatRoom from "./ChatRoom";
import axios from "axios";
import { isAuthenticated } from "../../utils/authGuard";

type ChatRoomInfo = {
    roomId: number;
    eventTitle?: string;
    userName?: string;
    otherUserId?: number;
    isAdminInquiry?: boolean; // FairPlay 운영자 문의 채팅방 여부
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
        if (!isAuthenticated()) {
            setHasOnlineAdmin(false);
            return;
        }
        
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
                userName: undefined,
                isAdminInquiry: true
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
                <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1001]" />
                <Dialog.Content
                    className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[80vh] max-h-[720px] min-h-[520px] bg-white border border-black/5 rounded-t-xl rounded-b-xl shadow-xl shadow-black/10 flex flex-col min-h-0 z-[1002] animate-in chat-modal-content"
                >
                                         <Dialog.Title asChild>
                                                      <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-4 rounded-t-xl min-h-[72px] flex items-center">
                                 <div className="flex items-center gap-3 w-full">
                                     {selectedRoomId !== null ? (
                                         <button
                                             onClick={() => {
                                                 setSelectedRoomId(null);
                                                 setSelectedRoomInfo(null);
                                             }}
                                             className="inline-flex items-center justify-center p-1 text-white bg-white/20 rounded transition-colors focus:outline-none w-8 h-8"
                                             aria-label="뒤로"
                                         >
                                             <svg 
                                                 width="24" 
                                                 height="24" 
                                                 viewBox="0 0 24 24" 
                                                 fill="none" 
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="text-white"
                                             >
                                                 <path 
                                                     d="M15 18L9 12L15 6" 
                                                     stroke="currentColor" 
                                                     strokeWidth="2" 
                                                     strokeLinecap="round" 
                                                     strokeLinejoin="round"
                                                 />
                                             </svg>
                                         </button>
                                     ) : null}
                                     <div className="flex items-center gap-3">
                                         <MessageCircle className="w-6 h-6 text-white" />
                                         <h2 className="font-semibold text-lg text-white">문의/실시간 채팅</h2>
                                     </div>
                                 </div>
                             </div>
                     </Dialog.Title>
                    <Dialog.Description className="sr-only">
                        실시간 채팅을 통해 문의사항을 해결하세요.
                    </Dialog.Description>
                    {/* 방 선택 전 → 방 목록 / 방 선택 → 채팅방 */}
                    {selectedRoomId === null ? (
                        <div className="flex flex-col h-full min-h-0">
                            {/* FairPlay 운영자 문의하기 */}
                            <div className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleAdminInquiry}>
                                <div className="flex items-start gap-3">
                                    {/* 원형 프로필 (로고) */}
                                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex-shrink-0 overflow-hidden">
                                        <img 
                                            src="/images/FPlogo.png" 
                                            alt="FairPlay 로고" 
                                            className="w-full h-full object-contain p-1"
                                        />
                                    </div>
                                    
                                    {/* 채팅 정보 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900">FairPlay 채팅 상담센터</h3>
                                            <span className="text-xs text-gray-500">방금 전</span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {loading ? "연결중..." : "안녕하세요! FairPlay 상담센터입니다."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <ChatRoomList onSelect={(roomId, eventTitle, userName, otherUserId) => {
                                setSelectedRoomId(roomId);
                                setSelectedRoomInfo({ roomId, eventTitle, userName, otherUserId });
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
                            otherUserId={selectedRoomInfo?.otherUserId}
                            isAdminInquiry={selectedRoomInfo?.isAdminInquiry}
                        />
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
