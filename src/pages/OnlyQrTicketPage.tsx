import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Calendar,
    MapPin,
    RefreshCw,
    User,
    AlertCircle,
    Check,
    Ban
} from "lucide-react";

import {
    getQrTicketForLink,
    reissueQrTicketByGuest
} from "../services/qrTicket"

import { QRCodeCanvas } from 'qrcode.react';
import type {
    QrTicketReissueGuestRequestDto,
    QrTicketGuestResponseDto,
    QrTicketResponseDto
} from "../services/types/qrTicketType";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQrTicketSocket } from "../utils/useQrTicketSocket";


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

// 비회원 QR 티켓 조회 페이지
export const OnlyQrTicketPage = () => {
    const [searchParam] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParam.get("token");
    const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
    const [qrTicketId, setQrTicketId] = useState(0);
    const [qrCode, setQrCode] = useState(""); // QR 코드 상태
    const [manualCode, setManualCode] = useState(""); // 수동 코드 상태
    const [resData, setResData] = useState<QrTicketGuestResponseDto | null>(null);
    const [isTicketUsed, setIsTicketUsed] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [updateIds, setUpdateIds] = useState({
        reservationId: 0,
        qrTicketId: 0
    });

    // 웹소켓 메시지 핸들러를 useCallback으로 메모이제이션
    const handleWebSocketMessage = useCallback((msg: string) => {
        setSuccessMessage(msg);
        // 입장 완료 상태로 변경
        setIsTicketUsed(true);
        // 타이머 멈추기
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    // ✅ 웹소켓 구독 (qrTicketId가 유효할 때만)
    useQrTicketSocket(qrTicketId > 0 ? qrTicketId : 0, handleWebSocketMessage);

    // QR 코드와 수동 코드 초기화 + 모달 오픈 시 타이머 시작
    useEffect(() => {
        if (!resData) return;

        // 타이머 시작
        setTimeLeft(300); // 5분 초기화
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current); // 0이 되면 멈춤
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

       return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };// 컴포넌트 언마운트 시 타이머 정리
    }, [resData, qrCode]);

    
    useEffect(() => {
        const getMyTicketInfo = async () => {
            try {
                if (!token) {
                    alert("토큰이 존재하지 않습니다.");
                    return;
                }
                const data = await getQrTicketForLink(token);
                setResData(data);
                setQrCode(data.qrCode);
                setManualCode(data.manualCode);
                setQrTicketId(data.qrTicketId);
                console.log(data);
            } catch (error: any) {
                if (error.response) {  
                    const { message } = error.response.data;
                    navigate(`/qr-ticket/participant/error`, {
                        state: {
                            title: "죄송합니다",
                            message: message,
                    }
                });
                } else if (error.request) {
                    navigate(`/qr-ticket/participant/error`, {
                        state: {
                            title: "죄송합니다",
                            message: "서버 응답이 없습니다. 잠시 후 다시 시도해주세요.",
                    }
                });
                } else {
                    navigate(`/qr-ticket/participant/error`, {
                        state: {
                            title: "죄송합니다",
                            message: "알 수 없는 오류가 발생했습니다.",
                    }
                });
                }
            }
        };
        getMyTicketInfo();
    }, []);

    // 새로고침 함수
    const handleRefresh = async () => {
        if (!token) {
            alert("잘못된 링크입니다.");
            return; 
        }

        const data: QrTicketReissueGuestRequestDto = {
            qrUrlToken: token
        }

        const res = await reissueQrTicketByGuest(data);
        setQrCode(res.qrCode);
        setManualCode(res.manualCode);
        setIsTicketUsed(false);
        setTimeLeft(300); // 타이머 리셋
    };

    // 시간을 MM:SS 형식으로 변환
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };


    return (
        <div>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-2 sm:p-4">
            <style>{scrollbarHideStyles}</style>
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm w-full max-h-[92vh] overflow-y-auto scrollbar-hide">
                {/* 헤더 */}
                <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 sm:p-4 md:p-6">
                    <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3 md:mb-4">
                        <div className="w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-3 h-3 sm:w-4 md:w-5 sm:h-4 md:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm sm:text-base md:text-lg font-bold leading-tight mb-1">{resData?.title}</h2>
                            <p className="text-xs sm:text-sm opacity-90">{resData?.viewingScheduleInfo.date}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{resData?.buildingName ?? resData?.address}</span>
                    </div>
                </div>

                {/* QR 코드 섹션 */}
                <div className="p-2 sm:p-3 md:p-4">
                    {isTicketUsed && (
                        <div className="text-center mb-4 p-2 bg-green-100 text-green-800 font-semibold rounded-lg">
                                ✅ {successMessage}
                        </div>
                    )}
                    {timeLeft === 0 && (
                        <div className="text-center mb-4 p-2 rounded-lg font-semibold 
                                        bg-red-100 text-red-800">
                            ⛔ 티켓 유효기간이 만료되었습니다.
                        </div>
                    )}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-2 sm:mb-3">
                        <div className="flex justify-center mb-2">
                            <div className="w-24 h-24 sm:w-28 md:w-36 sm:h-24 md:h-36 bg-white rounded-lg sm:rounded-xl flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 bg-gray-200 rounded-md sm:rounded-lg flex items-center justify-center">
                                        {timeLeft === 0 ? (
                                            <Ban size={120} color="#ff0000" strokeWidth={2.25} />
                                        ): isTicketUsed ? (
                                            <Check size={120} color="#613cf4ff" strokeWidth={2.25} />
                                        ) : (
                                            <QRCodeCanvas value={qrCode} size={120} fgColor={'#000'} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            {!isTicketUsed && (
                                <p className="text-xs sm:text-sm font-mono text-gray-600 mb-2">{manualCode}</p>
                            )}
                            <p className="font-mono text-xs sm:text-sm text-gray-600 mb-2">TicketNo.{resData?.ticketNo}</p>
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
                        <p className="text-sm sm:text-base md:text-lg font-bold text-blue-900 mt-1">{resData?.seatInfo}</p>
                    </div>

                    {/* 티켓 상세 정보 */}
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-2 sm:mb-3">
                        <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100">
                            <span className="text-xs sm:text-sm text-gray-600">예매일</span>
                            <span className="text-xs sm:text-sm font-medium">{resData?.reservationDate}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100">
                            <span className="text-xs sm:text-sm text-gray-600">관람 시간</span>
                                <span className="text-xs sm:text-sm font-medium">{resData?.viewingScheduleInfo.date} ({resData?.viewingScheduleInfo.dayOfWeek}) {resData?.viewingScheduleInfo.startTime}</span>
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
        </div>
    );
}
