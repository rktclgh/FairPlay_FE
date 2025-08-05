import React, { useState, useEffect } from "react";
import {
    Calendar,
    MapPin,
    RefreshCw,
    User,
    AlertCircle,
} from "lucide-react";

interface QrTicketProps {
    isOpen: boolean;
    onClose: () => void;
    ticketData?: {
        eventName: string;
        eventDate: string;
        venue: string;
        seatInfo: string;
        ticketNumber: string;
        bookingDate: string;
        entryTime: string;
    };
}

const QrTicket: React.FC<QrTicketProps> = ({ isOpen, onClose, ticketData }) => {
    const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
    const [qrCode, setQrCode] = useState(""); // QR 코드 상태
    const [currentTicketNumber, setCurrentTicketNumber] = useState(""); // 현재 티켓 번호

    const defaultTicketData = {
        eventName: "G-DRAGON 콘서트: WORLD TOUR",
        eventDate: "2024년 8월 9일 (금) 19:00",
        venue: "고양종합운동장",
        seatInfo: "A구역 12열 15번",
        ticketNumber: "KPC-2024-001234",
        bookingDate: "2024.11.28",
        entryTime: "18:30 ~ 19:00",
    };

    const data = ticketData || defaultTicketData;

    // 카운트다운 타이머
    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(300); // 모달이 닫힐 때 타이머 리셋
            setQrCode(""); // QR 코드 초기화
            setCurrentTicketNumber(""); // 티켓 번호 초기화
            return;
        }

        // 모달이 열릴 때 초기 QR 코드 생성
        if (isOpen && !qrCode) {
            setCurrentTicketNumber(data.ticketNumber);
            setQrCode(generateQRCode());
        }

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, qrCode]);

    // 티켓 번호 생성 함수
    const generateTicketNumber = () => {
        const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `KPC-2024-${randomNum}`;
    };

    // QR 코드 생성 함수
    const generateQRCode = () => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        return `${currentTicketNumber || data.ticketNumber}-${timestamp}-${randomString}`;
    };

    // 새로고침 함수
    const handleRefresh = () => {
        const newTicketNumber = generateTicketNumber();
        setCurrentTicketNumber(newTicketNumber);
        setQrCode(generateQRCode());
        setTimeLeft(300); // 타이머 리셋
    };

    // 시간을 MM:SS 형식으로 변환
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden">
                {/* 헤더 */}
                <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-transparent hover:bg-white/20 transition-colors text-white font-bold text-lg focus:outline-none focus:ring-0"
                    >
                        ×
                    </button>

                    <div className="flex items-start space-x-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold leading-tight mb-1">{data.eventName}</h2>
                            <p className="text-sm opacity-90">{data.eventDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{data.venue}</span>
                    </div>
                </div>

                {/* QR 코드 섹션 */}
                <div className="p-4">
                    <div className="bg-gray-50 rounded-2xl p-3 mb-3">
                        <div className="flex justify-center mb-2">
                            <div className="w-36 h-36 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                                        <span className="text-xs">{qrCode || "QR Code"}</span>
                                    </div>
                                    <p className="text-xs">스캔하여 입장</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="font-mono text-sm text-gray-600 mb-2">{currentTicketNumber || data.ticketNumber}</p>
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>유효한 티켓</span>
                            </div>
                        </div>
                    </div>

                    {/* 좌석 정보 */}
                    <div className="bg-blue-50 rounded-xl p-3 mb-3">
                        <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">좌석 정보</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900 mt-1">{data.seatInfo}</p>
                    </div>

                    {/* 티켓 상세 정보 */}
                    <div className="space-y-3 mb-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">예매일</span>
                            <span className="text-sm font-medium">{data.bookingDate}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">입장 시간</span>
                            <span className="text-sm font-medium">{data.entryTime}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-600">유효시간</span>
                            <span className={`text-sm font-medium ${timeLeft <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    {/* 입장 안내 */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-amber-800 mb-1">입장 안내</h4>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    공연 시작 30분 전부터 입장 가능하며, QR코드를 입구에서 스캔해주세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 새로고침 버튼 */}
                    <div className="mt-3 flex justify-center">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-0"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm">새로고침</span>
                        </button>
                    </div>
                </div>

                {/* 하단 구분선 */}
                <div className="border-t border-gray-100 p-2 text-center">
                    <p className="text-xs text-gray-500">이 티켓은 1회용입니다</p>
                </div>
            </div>
        </div>
    );
};

export default QrTicket; 