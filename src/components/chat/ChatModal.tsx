import { useState, useEffect } from "react";
import { MessageCircle, ChevronLeft } from "lucide-react";
import ChatRoomList from "./ChatRoomList";
import ChatRoom from "./ChatRoom";
import axios from "axios";
import { isAuthenticated } from "../../utils/authGuard";
import { AnimatePresence, motion } from "framer-motion";

type ChatRoomInfo = {
    roomId: number;
    eventTitle?: string;
    userName?: string;
    otherUserId?: number;
    isAdminInquiry?: boolean; // FairPlay 운영자 문의 채팅방 여부
    isAiChat?: boolean; // AI 채팅방 여부
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

    // 전체 관리자 문의하기 - 기존 채팅방 찾거나 생성
    const handleAdminInquiry = async () => {
        setLoading(true);
        try {
            // 먼저 기존 관리자 문의 채팅방이 있는지 확인
            const existingResponse = await axios.get('/api/chat/rooms', {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });

            const existingAdminRoom = existingResponse.data.find((room: any) =>
                room.targetType === 'ADMIN' && !room.closedAt
            );

            let roomData;
            if (existingAdminRoom) {
                // 기존 채팅방으로 연결
                roomData = {
                    chatRoomId: existingAdminRoom.chatRoomId,
                    eventTitle: existingAdminRoom.eventTitle
                };
                console.log('기존 관리자 문의 채팅방으로 연결:', roomData.chatRoomId);
            } else {
                // 새 채팅방 생성
                const response = await axios.post('/api/chat/admin-inquiry', {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                });
                roomData = response.data;
                console.log('새로운 관리자 문의 채팅방 생성:', roomData.chatRoomId);
            }

            setSelectedRoomId(roomData.chatRoomId);
            setSelectedRoomInfo({
                roomId: roomData.chatRoomId,
                eventTitle: roomData.eventTitle,
                userName: undefined,
                isAdminInquiry: true
            });
        } catch (error) {
            console.error('전체 관리자 문의 처리 실패:', error);
            alert('문의 채팅방 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // AI 채팅 문의하기 - 기존 채팅방 찾거나 생성
    const handleAiInquiry = async () => {
        setLoading(true);
        try {
            // 먼저 기존 AI 채팅방이 있는지 확인
            const existingResponse = await axios.get('/api/chat/rooms', {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });

            const existingAiRoom = existingResponse.data.find((room: any) =>
                room.targetType === 'AI' && !room.closedAt
            );

            let roomData;
            if (existingAiRoom) {
                // 기존 채팅방으로 연결
                roomData = {
                    chatRoomId: existingAiRoom.chatRoomId,
                    eventTitle: existingAiRoom.eventTitle
                };
                console.log('기존 AI 채팅방으로 연결:', roomData.chatRoomId);
            } else {
                // 새 채팅방 생성
                const response = await axios.post('/api/chat/ai-inquiry', {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                });
                roomData = response.data;
                console.log('새로운 AI 채팅방 생성:', roomData.chatRoomId);
            }

            setSelectedRoomId(roomData.chatRoomId);
            setSelectedRoomInfo({
                roomId: roomData.chatRoomId,
                eventTitle: roomData.eventTitle,
                userName: undefined,
                isAdminInquiry: false,
                isAiChat: true
            });
        } catch (error) {
            console.error('AI 채팅 처리 실패:', error);
            alert('AI 채팅방 연결에 실패했습니다.');
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
        <AnimatePresence>
            {open && (
                <>
                    {/* 배경 오버레이 */}
                    <motion.div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1001]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                    />

                    {/* 채팅 모달 */}
                    <motion.div
                        className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[80vh] max-h-[720px] min-h-[520px] bg-white border border-black/5 rounded-t-xl rounded-b-xl shadow-xl shadow-black/10 flex flex-col overflow-hidden z-[1002]"
                        initial={{
                            opacity: 0,
                            scale: 0.8,
                            y: 50,
                            x: 100
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            x: 0
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.8,
                            y: 50,
                            x: 100
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            duration: 0.4
                        }}
                    >
                        {/* 헤더 */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-4 rounded-t-xl min-h-[72px] flex items-center">
                            <div className="flex items-center gap-3 w-full">
                                {selectedRoomId !== null ? (
                                    <motion.button
                                        onClick={() => {
                                            setSelectedRoomId(null);
                                            setSelectedRoomInfo(null);
                                        }}
                                        className="inline-flex items-center justify-center p-1 text-white bg-white/20 rounded transition-colors focus:outline-none w-8 h-8"
                                        aria-label="뒤로"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
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
                                    </motion.button>
                                ) : null}
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        initial={{ rotate: -10 }}
                                        animate={{ rotate: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <h2 className="font-semibold text-lg text-white">문의/실시간 채팅</h2>
                                </div>
                            </div>
                        </div>

                        {/* 방 선택 전 → 방 목록 / 방 선택 → 채팅방 */}
                        <AnimatePresence mode="wait">
                            {selectedRoomId === null ? (
                                <motion.div
                                    key="room-list"
                                    className="flex flex-col flex-1 overflow-hidden"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* AI 챗봇 문의하기 */}
                                    <motion.div
                                        className="p-4 border-b hover:bg-blue-50 cursor-pointer transition-colors"
                                        onClick={handleAiInquiry}
                                        whileHover={{ backgroundColor: "#eff6ff" }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* AI 아이콘 */}
                                            <motion.div
                                                className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center"
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                <img
                                                    src="/images/ai-assistant-icon.svg"
                                                    alt="AI 챗봇"
                                                    className="w-6 h-6"
                                                />
                                            </motion.div>

                                            {/* 채팅 정보 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-blue-900">AI 챗봇</h3>
                                                    <span className="text-xs text-blue-500">24시간 상담</span>
                                                </div>
                                                <p className="text-sm text-blue-600 line-clamp-2">
                                                    {loading ? "연결중..." : "안녕하세요! FairPlay AI 챗봇입니다."}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* FairPlay 운영자 문의하기 */}
                                    <motion.div
                                        className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={handleAdminInquiry}
                                        whileHover={{ backgroundColor: "#f9fafb" }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* 원형 프로필 (로고) */}
                                            <motion.div
                                                className="w-10 h-10 rounded-full border-2 border-gray-200 flex-shrink-0 overflow-hidden"
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                <img
                                                    src="/images/FPlogo.png"
                                                    alt="FairPlay 로고"
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            </motion.div>

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
                                    </motion.div>
                                    <ChatRoomList onSelect={(roomId, eventTitle, userName, otherUserId, isAiChat) => {
                                        setSelectedRoomId(roomId);
                                        setSelectedRoomInfo({ roomId, eventTitle, userName, otherUserId, isAiChat });
                                    }} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="chat-room"
                                    className="flex flex-col flex-1 overflow-hidden"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
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
                                        isAiChat={selectedRoomInfo?.isAiChat}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
