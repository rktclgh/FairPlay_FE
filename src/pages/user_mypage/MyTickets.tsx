import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";
import QrTicket from "../../components/QrTicket";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import reservationService, { ReservationResponseDto } from "../../services/reservationService";

interface QrTicketData {
    eventName: string;
    eventDate: string;
    venue: string;
    seatInfo: string;
    ticketNumber: string;
    bookingDate: string;
    entryTime: string;
}

export default function MyTickets(): JSX.Element {
    const navigate = useNavigate();
    const [isQrTicketOpen, setIsQrTicketOpen] = useState(false);
    const [selectedTicketData, setSelectedTicketData] = useState<QrTicketData | null>(null);
    const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMyReservations = async () => {
            try {
                setLoading(true);
                const data = await reservationService.getMyReservations();
                setReservations(data);
            } catch (error) {
                console.error('예약 목록 로드 실패:', error);
                toast.error('예약 목록을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadMyReservations();
    }, []);

    const handleQrTicketOpen = (reservation: ReservationResponseDto) => {
        // 날짜 포맷팅: YYYY-MM-DD를 한국어 형식으로 변환
        const formatDate = (dateStr: string | null) => {
            if (!dateStr) return "날짜 미정";
            const date = new Date(dateStr);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        // 시간 포맷팅: HH:MM:SS를 HH:MM으로 변환
        const formatTime = (timeStr: string | null) => {
            if (!timeStr) return "시간 미정";
            return timeStr.substring(0, 5); // HH:MM:SS -> HH:MM
        };

        const formatDateTime = (dateTimeStr: string | null) => {
            if (!dateTimeStr) return "날짜 미정";
            return formatDate(dateTimeStr.split('T')[0]);
        };

        const eventDate = `${formatDate(reservation.scheduleDate)} ${formatTime(reservation.startTime)} - ${formatTime(reservation.endTime)}`;

        setSelectedTicketData({
            eventName: reservation.eventName || "행사명 미정",
            eventDate: eventDate,
            venue: "행사장", // TODO: 실제 장소 정보가 필요하면 Event 엔티티에서 가져와야 함
            seatInfo: reservation.ticketName || "티켓 정보 없음",
            ticketNumber: `TKT-${reservation.reservationId?.toString().padStart(6, '0') || '000000'}`,
            bookingDate: formatDateTime(reservation.createdAt),
            entryTime: `${formatTime(reservation.startTime)} ~ ${formatTime(reservation.endTime)}`,
        });
        setIsQrTicketOpen(true);
    };

    const handleQrTicketClose = () => {
        setIsQrTicketOpen(false);
        setSelectedTicketData(null);
    };

    const handleParticipantListOpen = (reservation: ReservationResponseDto) => {
        navigate(`/mypage/participant-list`, {
            state: {
                reservationId: reservation.reservationId,
                eventName: reservation.eventName
            }
        });
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    내 티켓
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                <TopNav />

                <div className="absolute top-[239px] left-64 right-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-lg">로딩 중...</div>
                        </div>
                    ) : reservations.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">예약 내역이 없습니다.</div>
                        </div>
                    ) : (
                        <div className="space-y-[47px]">
                            {reservations.map((reservation, index) => {
                                console.log('reservation:', reservation);
                                // 날짜 포맷팅 함수들
                                const formatDate = (dateStr: string | null) => {
                                    if (!dateStr) return "날짜 미정";
                                    const date = new Date(dateStr);
                                    return date.toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    });
                                };

                                const formatTime = (timeStr: string | null) => {
                                    if (!timeStr) return "시간 미정";
                                    return timeStr.substring(0, 5); // HH:MM:SS -> HH:MM
                                };

                                const formatDateTime = (dateTimeStr: string | null) => {
                                    if (!dateTimeStr) return "날짜 미정";
                                    return formatDate(dateTimeStr.split('T')[0]);
                                };

                                const eventDate = `${formatDate(reservation.scheduleDate)} ${formatTime(reservation.startTime)} - ${formatTime(reservation.endTime)}`;
                                const bookingDate = formatDateTime(reservation.createdAt);

                                return (
                                    <div
                                        key={reservation.reservationId}
                                        className="w-[921px] h-[240px] bg-white rounded-[10px] border border-solid border-[#0000001f] shadow-[0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_2px_8px_#0000001a] relative"
                                    >
                                        <div className="p-6 relative h-full flex items-center">
                                            <div className="grid grid-cols-2 gap-[40px] w-full">
                                                <div className="space-y-[15px] pt-[20px] pb-[20px]">
                                                    <div className="pt-[10px]">
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                            행사명
                                                        </div>
                                                        <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                                                            {reservation.eventName}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                            예약 상태
                                                        </div>
                                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6 tracking-[0] whitespace-nowrap">
                                                            {reservation.reservationStatus}
                                                        </div>
                                                    </div>

                                                    <div className="pt-[-10px]">
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                            예매일
                                                        </div>
                                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6 tracking-[0] whitespace-nowrap">
                                                            {bookingDate}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-[15px] pt-[20px] pb-[20px]">
                                                    <div className="pt-[10px]">
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                            행사 일시
                                                        </div>
                                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6 tracking-[0] whitespace-nowrap">
                                                            {eventDate}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                            티켓 정보
                                                        </div>
                                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                            {reservation.ticketName} {reservation.quantity}매 (₩{reservation.ticketPrice.toLocaleString()})
                                                        </div>
                                                    </div>

                                                    {reservation.quantity >= 2 && (
                                                        <div className="pt-[-10px]">
                                                            <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                                참여자 입력
                                                            </div>
                                                            <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6 tracking-[0] whitespace-nowrap">
                                                                <button
                                                                    onClick={() => window.open(`/mypage/participant-form?eventName=${encodeURIComponent(reservation.eventName)}`, '_blank')}
                                                                    className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer p-0 font-normal text-base focus:outline-none"
                                                                >
                                                                    참여자 정보 입력
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                    </div>

                                            <div className="absolute top-6 right-6 flex flex-col space-y-2">
                                                <button
                                                    onClick={() => handleQrTicketOpen(reservation)}
                                                    className="w-[140px] h-[56px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-0"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <QrCode className="w-4 h-4 text-white" />
                                                        <span className="font-semibold text-white text-sm tracking-wide">
                                                            QR 티켓
                                                        </span>
                                                    </div>
                                                    <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                </button>

                                                {reservation.quantity >= 2 && (
                                                    <button
                                                        onClick={() => handleParticipantListOpen(reservation)}
                                                        className="w-[140px] h-[40px] bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-0"
                                                    >
                                                        <span className="font-semibold text-white text-xs tracking-wide">
                                                            참여자 목록 확인
                                                        </span>
                                                        <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <QrTicket
                isOpen={isQrTicketOpen}
                onClose={handleQrTicketClose}
                ticketData={selectedTicketData || undefined}
            />
        </div>
    );
} 