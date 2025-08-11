import React, { useState, useEffect } from "react";
import {
    Calendar,
    MapPin,
    RefreshCw,
    User,
    AlertCircle,
} from "lucide-react";
import {
    getQrTicketForMypage,
    reissueQrTicket
} from "../services/qrTicket"
import { QRCodeCanvas } from 'qrcode.react';
import type { QrTicketResponseDto } from "@/services/types/qrTicketType";

// 스크롤바 숨기기 CSS
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

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
    const [resData, setResData] = useState<QrTicketResponseDto>();

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

            const fetchQrTicket = async () => {
                // 임시 데이터
                const QrTicketRequestDto = {
                    attendeeId: null, // 테스트 위한 항목. 삭제 예정. 
                    eventId: 1,
                    ticketId: 1,
                    reservationId: 1
                };

                const res = await getQrTicketForMypage(QrTicketRequestDto);
                console.log(res.ticketNo + "가 발급됨");
                setCurrentTicketNumber(res.ticketNo);
                setQrCode(res.qrCode);
                setResData(res);
            };
            fetchQrTicket();
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-2 sm:p-4">
            <style>{scrollbarHideStyles}</style>
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm w-full max-h-[92vh] overflow-y-auto scrollbar-hide">
                {/* 헤더 */}
                <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 sm:p-4 md:p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 sm:top-3 md:top-4 sm:right-3 md:right-4 w-6 h-6 flex items-center justify-center bg-transparent hover:bg-white/20 transition-colors text-white font-bold text-lg focus:outline-none focus:ring-0"
                    >
                        ×
                    </button>

                    <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3 md:mb-4">
                        <div className="w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-3 h-3 sm:w-4 md:w-5 sm:h-4 md:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm sm:text-base md:text-lg font-bold leading-tight mb-1">{resData?.title}</h2>
                            <p className="text-xs sm:text-sm opacity-90">{resData?.viewingScheduleInfo.date} ({resData?.viewingScheduleInfo.dayOfWeek}) {resData?.viewingScheduleInfo.startTime}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{resData?.buildingName}</span>
                    </div>
                </div>

                {/* QR 코드 섹션 */}
                <div className="p-2 sm:p-3 md:p-4">
                    <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-2 sm:mb-3">
                        <div className="flex justify-center mb-2">
                            <div className="w-24 h-24 sm:w-28 md:w-36 sm:h-24 md:h-36 bg-white rounded-lg sm:rounded-xl flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 bg-gray-200 rounded-md sm:rounded-lg flex items-center justify-center">
                                        <QRCodeCanvas
                                            value={qrCode}
                                            size={124}
                                            fgColor={'#000'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="font-mono text-xs sm:text-sm text-gray-600 mb-2">{currentTicketNumber || data.ticketNumber}</p>
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>유효한 티켓</span>
                            </div>
                        </div>
                    </div>

                    {/* 좌석 정보 */}
                    <div className="bg-blue-50 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-2 sm:mb-3">
                        <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            <span className="text-xs sm:text-sm font-medium text-blue-900">좌석 정보</span>
                        </div>
                        <p className="text-sm sm:text-base md:text-lg font-bold text-blue-900 mt-1">{data.seatInfo}</p>
                    </div>

                    {/* 티켓 상세 정보 */}
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-2 sm:mb-3">
                        <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100">
                            <span className="text-xs sm:text-sm text-gray-600">예매일</span>
                            <span className="text-xs sm:text-sm font-medium">{resData?.reservationDate}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100">
                            <span className="text-xs sm:text-sm text-gray-600">관람 시간</span>
                            <span className="text-xs sm:text-sm font-medium">{resData?.viewingScheduleInfo.startTime}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 sm:py-2">
                            <span className="text-xs sm:text-sm text-gray-600">유효시간</span>
                            <span className={`text-xs sm:text-sm font-medium ${timeLeft <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    {/* 입장 안내 */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-2 sm:mb-3">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                            <AlertCircle className="w-3 h-3 sm:w-4 md:w-5 sm:h-4 md:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-xs sm:text-sm font-medium text-amber-800 mb-1">입장 안내</h4>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    공연 시작 30분 전부터 입장 가능하며, QR코드를 입구에서 스캔해주세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 새로고침 버튼 */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center space-x-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gray-100 rounded-md sm:rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-0"
                        >
                            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">새로고침</span>
                        </button>
                    </div>
                </div>

                {/* 하단 구분선 */}
                <div className="border-t border-gray-100 p-1 sm:p-2 text-center">
                    <p className="text-xs text-gray-500">이 티켓은 1회용입니다</p>
                </div>
            </div>
        </div>
    );
};

export default QrTicket; 