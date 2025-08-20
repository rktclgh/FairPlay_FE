import React, { useState, useEffect, useRef } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";
import QrTicket from "../../components/QrTicket";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import reservationService, { ReservationResponseDto } from "../../services/reservationService";
import type {
    QrTicketRequestDto,
    QrTicketData
} from "../../services/types/qrTicketType";
import {
    getQrTicketForMypage,
} from "../../services/qrTicket"
import { getFormLink } from "../../services/attendee";
import { useQrTicketSocket } from "../../utils/useQrTicketSocket";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export default function MyTickets(): JSX.Element {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isQrTicketOpen, setIsQrTicketOpen] = useState(false);
    const [qrTicketId, setQrTicketId] = useState(0);
    const [selectedTicketData, setSelectedTicketData] = useState<QrTicketData | null>(null);
    const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);
    const [formLinks, setFormLinks] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [canUseQrTicket, setCanUseQrTicketList] = useState<boolean[]>([]);
    const [updateIds, setUpdateIds] = useState({
        reservationId: 0,
        qrTicketId: 0
    });
    const [successMessage, setSuccessMessage] = useState("");

    // 모바일 사이드바 상태
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // ✅ 여기서 웹소켓 구독 시작
    useQrTicketSocket(qrTicketId, (msg) => {
        console.log("qrTicketId:" + qrTicketId);
        setSuccessMessage(msg);   // 메시지를 state에 저장
    });

    useEffect(() => {
        const loadMyReservations = async () => {
            try {
                setLoading(true);
                const data = await reservationService.getMyReservations();
                setReservations(data);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                // QR 티켓 사용 가능 여부: 관람일자 1일 전부터 행사 날까지 버튼 활성화
                const canUseList = data.map((reservation: ReservationResponseDto) => {
                    if (!reservation.scheduleDate || !reservation.startTime) return false;
                    const eventDate = new Date(reservation.scheduleDate); // 행사일
                    eventDate.setHours(0, 0, 0, 0);
                    return today <= eventDate;
                });
                setCanUseQrTicketList(canUseList); // 배열 상태로 관리
            } catch (error) {
                console.error(t('mypage.tickets.loadReservationsFailed'), error);
                toast.error(t('mypage.tickets.loadReservationsError'));
            } finally {
                setLoading(false);
            }
        };
        loadMyReservations();
    }, [t]);

    const handleQrTicketOpen = async (reservation: ReservationResponseDto) => {
        try {

            if (!reservation.scheduleDate || !reservation.startTime) {
                throw new Error("예약 정보가 올바르지 않습니다.");
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const scheduleDateObj = new Date(reservation.scheduleDate);
            scheduleDateObj.setHours(0, 0, 0, 0);

            if (reservation.scheduleDate && scheduleDateObj.getTime() !== today.getTime()) {
                alert("QR티켓은 당일에만 조회할 수 있습니다.");
                return;
            }
            const eventDate = `${formatDate(reservation.scheduleDate ?? null)} ${formatTime(reservation.startTime ?? null)} - ${formatTime(reservation.endTime ?? null)}`;

            const qrTicketRequestDto: QrTicketRequestDto = {
                attendeeId: null,
                eventId: reservation.eventId,
                ticketId: reservation.ticketId,
                reservationId: reservation.reservationId
            };


            // QR 티켓 정보 호출
            const res = await getQrTicketForMypage(qrTicketRequestDto);
            // 선택한 티켓 정보
            setSelectedTicketData({
                eventName: reservation.eventName || t('mypage.tickets.eventNameTbd'),
                eventDate: eventDate,
                venue: res.buildingName ?? res.address,
                seatInfo: reservation.ticketName || t('mypage.tickets.noTicketInfo'),
                ticketNumber: res.ticketNo,
                bookingDate: formatDateTime(reservation.createdAt),
                entryTime: `${formatTime(reservation.startTime ?? null)} ~ ${formatTime(reservation.endTime ?? null)}`,
                qrCode: res.qrCode,
                manualCode: res.manualCode
            });
            setUpdateIds({
                reservationId: reservation.reservationId,
                qrTicketId: res.qrTicketId
            });
            setIsQrTicketOpen(true);
            setQrTicketId(res.qrTicketId);
        } catch (error) {
            if (error.response) {
                const { message } = error.response.data;
                alert(message);
            } else if (error.request) {
                // 요청은 됐지만 응답 없음
                console.error(t('errors.noResponse'), error.request);
                alert(t('errors.noResponse'));
            } else {
                // 기타 오류
                console.error(t('errors.unknown'), error.message);
                alert(t('errors.unknown'));
            }

        }
    };

    const handleQrTicketClose = () => {
        setIsQrTicketOpen(false);
        setSelectedTicketData(null);
    };

    const handleParticipantListOpen = (reservation: ReservationResponseDto, bookingDate: string) => {
        console.log("handleParticipantListOpen:" + reservation.createdAt)
        navigate(`/mypage/participant-list`, {
            state: {
                eventName: reservation.eventName,
                reservationId: reservation.reservationId,
                reservationDate: bookingDate,
                scheduleDate: reservation.scheduleDate,
                startTime: reservation.startTime
            }
        });
    };

    const handleShowFormLink = async (reservationId: number) => {

        const reservation = reservations.find(r => r.reservationId === reservationId);
        if (!reservation) {
            alert("예약 정보를 찾을 수 없습니다.");
            return;
        }

        const today = new Date();
        const eventDateTime = new Date(`${reservation.scheduleDate}T${reservation.startTime}`);


        if (eventDateTime.getTime() < today.getTime()) {
            toast.error("입력 기한은 행사 시작 전 까지입니다.");
            return;
        }

        if (formLinks[reservationId]) {
            await navigator.clipboard.writeText(formLinks[reservationId]);
            toast.success(t('mypage.tickets.linkCopySuccess'));
            return;
        }
        try {
            const res = await getFormLink(reservationId);
            const link = `${import.meta.env.VITE_FRONTEND_BASE_URL}/participant-form?token=${res.token}`;

            setFormLinks(prev => ({ ...prev, [reservationId]: link }));

            await navigator.clipboard.writeText(link);
            toast.success(t('mypage.tickets.linkCopySuccess'));
        } catch (error) {
            toast.error(t('mypage.tickets.linkError'));
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return t('mypage.tickets.dateTbd');
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // 시간 포맷팅: HH:MM:SS를 HH:MM으로 변환
    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return t('mypage.tickets.timeTbd');
        return timeStr.substring(0, 5); // HH:MM:SS -> HH:MM
    };

    // "2025년 8월 16일"
    const formatDateTime = (dateTimeStr: string | null) => {
        if (!dateTimeStr) return t('mypage.tickets.dateTbd');
        return formatDate(dateTimeStr.split('T')[0]);
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-full md:w-[1256px] min-h-screen relative">
                {/* 모바일 햄버거 버튼 - 상단바 좌측 아래에 위치 */}
                <button
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="md:hidden fixed top-20 left-4 z-50 p-3 bg-transparent"
                >
                    {isMobileSidebarOpen ? (
                        <HiOutlineX className="w-6 h-6 text-gray-600" />
                    ) : (
                        <HiOutlineMenu className="w-6 h-6 text-gray-600" />
                    )}
                </button>

                {/* 모바일 사이드바 오버레이 */}
                {isMobileSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* 모바일 사이드바 */}
                <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                    <div className="p-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2"
                        >
                            <HiOutlineX className="w-6 h-6 text-gray-600" />
                        </button>
                        <AttendeeSideNav className="!relative !top-0 !left-0" />
                    </div>
                </div>

                {/* 데스크톱 사이드바 - 웹화면에서 절대적으로 고정 */}
                <div className="hidden md:block">
                    <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                </div>

                <TopNav />

                {/* 제목 - 웹화면에서 원래 위치로 유지 */}
                <div className="md:absolute md:top-[137px] md:left-64 left-4 right-4 top-24 relative md:static">
                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl md:text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        {t('mypage.tickets.title')}
                    </div>
                </div>

                {/* 콘텐츠 - 웹화면에서 원래 위치로 유지 */}
                <div className="md:absolute md:top-[239px] md:left-64 md:right-0 left-4 right-4 top-32 relative md:static">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-lg">{t('mypage.tickets.loading')}</div>
                        </div>
                    ) : reservations.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">{t('mypage.tickets.noReservations')}</div>
                        </div>
                    ) : (
                        <div className="space-y-[47px] w-full md:w-[921px]">
                            {reservations.map((reservation, index) => {
                                console.log('reservation:', reservation);

                                const eventDate = `${formatDate(reservation.scheduleDate ?? null)} ${formatTime(reservation.startTime ?? null)} - ${formatTime(reservation.endTime ?? null)}`;
                                const bookingDate = formatDateTime(reservation.createdAt);

                                return (
                                    <div
                                        key={reservation.reservationId}
                                        className="w-full h-auto md:h-[240px] bg-white rounded-[10px] border border-solid border-[#0000001f] shadow-[0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_2px_8px_#0000001a] relative"
                                    >
                                        <div className="p-4 md:p-6 relative h-full flex flex-col md:flex-row md:items-center">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-[40px] w-full mb-4 md:mb-0">
                                                <div className="space-y-3 md:space-y-[15px] pt-2 md:pt-[20px] pb-2 md:pb-[20px]">
                                                    <div className="pt-1 md:pt-[10px]">
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-2 md:mb-[8px]">
                                                            {t('mypage.tickets.eventName')}
                                                        </div>
                                                        <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base md:text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                                                            {reservation.eventName}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-2 md:mb-[8px]">
                                                            {t('mypage.tickets.reservationStatus')}
                                                        </div>
                                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-sm md:text-base leading-6 tracking-[0] whitespace-nowrap">
                                                            {reservation.reservationStatus}
                                                        </div>
                                                    </div>

                                                    <div className="pt-0 md:pt-[-10px]">
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-2 md:mb-[8px]">
                                                            {t('mypage.tickets.bookingDate')}
                                                        </div>
                                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-sm md:text-base leading-6 tracking-[0] whitespace-nowrap">
                                                            {bookingDate}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 md:space-y-[15px] pt-2 md:pt-[20px] pb-2 md:pb-[20px]">
                                                    <div className="pt-1 md:pt-[10px]">
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-2 md:mb-[8px]">
                                                            {t('mypage.tickets.eventDateTime')}
                                                        </div>
                                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-sm md:text-base leading-6 tracking-[0] whitespace-nowrap">
                                                            {eventDate}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-2 md:mb-[8px]">
                                                            {t('mypage.tickets.ticketInfo')}
                                                        </div>
                                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-sm md:text-base tracking-[0] leading-6 whitespace-nowrap">
                                                            {reservation.ticketName} {reservation.quantity}{t('mypage.tickets.ticketCount')} (₩{reservation.ticketPrice.toLocaleString()})
                                                        </div>
                                                    </div>

                                                    {reservation.quantity >= 2 && (
                                                        <div className="pt-0 md:pt-[-10px]">
                                                            <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-2 md:mb-[8px]">
                                                                {t('mypage.tickets.participantInput')}
                                                            </div>
                                                            <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-sm md:text-base leading-6 tracking-[0] whitespace-nowrap">
                                                                <button
                                                                    onClick={() => handleShowFormLink(reservation.reservationId)}
                                                                    className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer p-0 font-normal text-sm md:text-base focus:outline-none"
                                                                >
                                                                    {t('mypage.tickets.participantInputTitle')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col space-y-2 md:absolute md:top-6 md:right-6">
                                                <button
                                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                    onClick={(e) => { (e.currentTarget as HTMLButtonElement).blur(); e.stopPropagation(); handleQrTicketOpen(reservation); }}
                                                    disabled={!canUseQrTicket[index]} // ❗️여기서 QR 티켓 사용 가능 여부 제어
                                                    className={`relative z-10 w-full md:w-[140px] h-[48px] md:h-[56px] rounded-xl border-0 shadow-lg transition-all duration-200 flex items-center justify-center group focus:outline-none focus:ring-0
                                                        ${canUseQrTicket[index]
                                                            ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl cursor-pointer"
                                                            : "bg-gray-400 opacity-60 cursor-not-allowed"
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <QrCode className="w-4 h-4 text-white" />
                                                        <span className="font-semibold text-white text-sm tracking-wide">
                                                            {t('mypage.tickets.qrTicket')}
                                                        </span>
                                                    </div>

                                                    {/* hover 효과는 활성 상태일 때만 */}
                                                    {canUseQrTicket[index] && (
                                                        <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                    )}
                                                </button>

                                                {reservation.quantity >= 2 && (
                                                    <button
                                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        onClick={(e) => { (e.currentTarget as HTMLButtonElement).blur(); e.stopPropagation(); handleParticipantListOpen(reservation, reservation.createdAt); }}
                                                        className="w-full md:w-[140px] h-[40px] bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-0"
                                                    >
                                                        <span className="font-semibold text-white text-xs tracking-wide">
                                                            {t('mypage.tickets.participantList')}
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
                ticketData={selectedTicketData}
                updateIds={updateIds}
                message={successMessage}
            />
        </div>
    );
} 