import React, { useState, useEffect, useRef } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";
import QrTicket from "../../components/QrTicket";
import { QrCode, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import reservationService from "../../services/reservationService";
import type { ReservationResponseDto } from "../../services/reservationService";
import type {
    QrTicketRequestDto,
    QrTicketData
} from "../../services/types/qrTicketType";
import { eventAPI } from "../../services/event";
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

    // 모바일 팜플렛 모달 상태
    const [isPamphletModalOpen, setIsPamphletModalOpen] = useState(false);
    const [selectedEventForPamphlet, setSelectedEventForPamphlet] = useState<ReservationResponseDto | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [myOrderNumber, setMyOrderNumber] = useState(15); // 임시 데이터

    // 부스 상세정보 모달 상태
    const [isBoothDetailModalOpen, setIsBoothDetailModalOpen] = useState(false);
    const [selectedBooth, setSelectedBooth] = useState<{ id: number; name: string; image: string; description: string; manager: { name: string; email: string; phone: string }; waitingCount: number } | null>(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // 모바일 사이드바 상태
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // 카테고리 정보 캐시
    const eventCategoryCache = React.useRef(new Map<number, { mainCategory: string; subCategory: string }>());

    // ✅ 여기서 웹소켓 구독 시작
    useQrTicketSocket(qrTicketId, (msg) => {
        console.log("qrTicketId:" + qrTicketId);
        setSuccessMessage(msg);   // 메시지를 state에 저장
    });

    useEffect(() => {
        const loadMyReservationsWithCategories = async () => {
            try {
                setLoading(true);
                const reservations = await reservationService.getMyReservations();

                // 각 예약에 대해 카테고리 정보 추가 (캐시 활용)
                const reservationsWithCategories = await Promise.all(
                    reservations.map(async (reservation) => {
                        // 캐시된 카테고리 정보가 있으면 사용
                        if (eventCategoryCache.current.has(reservation.eventId)) {
                            const cached = eventCategoryCache.current.get(reservation.eventId)!;
                            return { ...reservation, ...cached };
                        }

                        try {
                            const eventDetail = await eventAPI.getEventDetail(reservation.eventId);
                            const categoryInfo = {
                                mainCategory: eventDetail.mainCategory,
                                subCategory: eventDetail.subCategory
                            };

                            // 캐시에 저장
                            eventCategoryCache.current.set(reservation.eventId, categoryInfo);

                            return { ...reservation, ...categoryInfo };
                        } catch (error) {
                            console.error(`이벤트 ${reservation.eventId} 카테고리 로드 실패:`, error);
                            return reservation;
                        }
                    })
                );

                setReservations(reservationsWithCategories);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                // QR 티켓 사용 가능 여부: 관람일자 1일 전부터 행사 날까지 버튼 활성화
                const canUseList = reservationsWithCategories.map((reservation: ReservationResponseDto) => {
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
        loadMyReservationsWithCategories();
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

    const handlePamphletOpen = (reservation: ReservationResponseDto) => {
        setSelectedEventForPamphlet(reservation);
        setIsPamphletModalOpen(true);
    };

    const handlePamphletClose = () => {
        setIsPamphletModalOpen(false);
        setSelectedEventForPamphlet(null);
        setSearchTerm("");
    };

    const handleRefreshOrder = () => {
        // 웨이팅 순서 새로고침 - 순서가 줄어들거나 동일하게 유지
        setMyOrderNumber(prevOrder => {
            // 70% 확률로 순서가 줄어들고, 30% 확률로 동일하게 유지
            const shouldDecrease = Math.random() < 0.7;
            if (shouldDecrease && prevOrder > 1) {
                // 1~3칸 정도 줄어들 수 있음
                const decreaseAmount = Math.floor(Math.random() * 3) + 1;
                return Math.max(1, prevOrder - decreaseAmount);
            } else {
                // 동일하게 유지
                return prevOrder;
            }
        });
    };

    const handleBoothDetailOpen = (booth: { id: number; name: string; image: string; description: string; manager: { name: string; email: string; phone: string }; waitingCount: number }) => {
        setSelectedBooth(booth);
        setIsBoothDetailModalOpen(true);
    };

    const handleBoothDetailClose = () => {
        setIsBoothDetailModalOpen(false);
        setSelectedBooth(null);
        setIsWaiting(false);
        setAgreeToTerms(false);
    };

    const handleBackToPamphlet = () => {
        setIsBoothDetailModalOpen(false);
        setSelectedBooth(null);
        setIsWaiting(false);
        setAgreeToTerms(false);
    };

    const handleWaitingRegistration = () => {
        if (!agreeToTerms) {
            alert("약관에 동의해주세요.");
            return;
        }
        setIsWaiting(true);
        // 실제 대기 등록 로직은 여기에 구현
        alert("대기 등록이 완료되었습니다.");
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
                                                        <div className="flex items-center gap-2">
                                                            <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base md:text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                                                                {reservation.eventName}
                                                            </div>

                                                            {/* 카테고리 정보 - 행사 타이틀 오른쪽에 배치 */}
                                                            {reservation.mainCategory && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-3 py-1 rounded text-xs ${reservation.mainCategory === "박람회" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                                                                        reservation.mainCategory === "공연" ? "bg-red-100 text-red-800 border border-red-200" :
                                                                            reservation.mainCategory === "강연/세미나" ? "bg-green-100 text-green-800 border border-green-200" :
                                                                                reservation.mainCategory === "전시/행사" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                                                                                    reservation.mainCategory === "축제" ? "bg-gray-100 text-gray-800 border border-gray-300" :
                                                                                        "bg-gray-100 text-gray-700 border border-gray-200"
                                                                        }`}>
                                                                        {reservation.mainCategory}
                                                                    </span>
                                                                    {reservation.subCategory && (
                                                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">
                                                                            {reservation.subCategory}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
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

                                            <div className="flex flex-col space-y-3 md:space-y-4 mt-4 md:mt-0 md:absolute md:top-6 md:right-6">
                                                {/* QR 티켓 버튼 */}
                                                <div className="w-full md:w-[140px] h-[48px] md:h-[50px] overflow-hidden rounded-xl relative z-10">
                                                    <button
                                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleQrTicketOpen(reservation);
                                                        }}
                                                        disabled={!canUseQrTicket[index]}
                                                        className={`relative z-10 w-full h-full rounded-xl border-0 shadow-lg transition-all duration-200 flex items-center justify-center group focus:outline-none focus:ring-0
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
                                                </div>

                                                {/* 참여자 목록 확인 버튼 */}
                                                {reservation.quantity >= 2 && (
                                                    <div className="w-full md:w-[140px] h-[48px] md:h-[50px] overflow-hidden rounded-xl relative z-10">
                                                        <button
                                                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleParticipantListOpen(reservation, reservation.createdAt);
                                                            }}
                                                            className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-0"
                                                        >
                                                            <span className="font-semibold text-white text-xs tracking-wide">
                                                                {t('mypage.tickets.participantList')}
                                                            </span>
                                                            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                        </button>
                                                    </div>
                                                )}

                                                {/* 모바일 팜플렛 버튼 - 박람회 카테고리인 경우에만 표시 */}
                                                {reservation.mainCategory === "박람회" && (
                                                    <div className="w-full md:w-[140px] h-[48px] md:h-[50px] overflow-hidden rounded-xl relative z-10">
                                                        <button
                                                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handlePamphletOpen(reservation);
                                                            }}
                                                            className="w-full h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-0"
                                                            style={{ pointerEvents: 'auto' }}
                                                        >
                                                            <span className="font-semibold text-white text-xs tracking-wide">
                                                                모바일 팜플렛
                                                            </span>
                                                            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                        </button>
                                                    </div>
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

            {/* 모바일 팜플렛 모달 */}
            {isPamphletModalOpen && selectedEventForPamphlet && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm w-full h-[92vh] overflow-y-auto scrollbar-hide">
                        {/* 모달 헤더 */}
                        <div className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
                            <h2 className="text-xl font-bold">{selectedEventForPamphlet.eventName}</h2>
                            <button
                                onClick={handlePamphletClose}
                                className="absolute top-2 right-2 sm:top-3 md:top-4 sm:right-3 md:right-4 w-6 h-6 flex items-center justify-center bg-transparent hover:bg-white/20 transition-colors text-white font-bold text-lg focus:outline-none focus:ring-0"
                            >
                                ×
                            </button>
                        </div>

                        {/* 모달 콘텐츠 */}
                        <div className="p-6 space-y-6">
                            {/* 나의 실시간 순서 */}
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-700 font-medium">나의 실시간 순서:</span>
                                    <span className="text-2xl font-bold text-orange-600">{myOrderNumber}번째</span>
                                </div>
                                <button
                                    onClick={handleRefreshOrder}
                                    className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                                    title="새로고침"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>

                            {/* 부스 상세정보가 열려있지 않을 때만 부스 목록 표시 */}
                            {!isBoothDetailModalOpen && (
                                <>
                                    {/* 검색창 */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* 부스 카드 그리드 */}
                                    <div className="grid grid-cols-2 gap-4 min-h-[300px]">
                                        {/* 임시 부스 데이터 */}
                                        {[
                                            {
                                                id: 1,
                                                name: "삼성전자",
                                                image: "/images/NoImage.png",
                                                description: "최신 스마트폰과 가전제품을 체험해보세요",
                                                manager: { name: "김사장", email: "example@example.com", phone: "010-1234-1234" },
                                                waitingCount: 5
                                            },
                                            {
                                                id: 2,
                                                name: "LG전자",
                                                image: "/images/NoImage.png",
                                                description: "OLED TV와 가전제품의 혁신을 만나보세요",
                                                manager: { name: "이과장", email: "lg@example.com", phone: "010-2345-2345" },
                                                waitingCount: 3
                                            },
                                            {
                                                id: 3,
                                                name: "현대자동차",
                                                image: "/images/NoImage.png",
                                                description: "미래형 자율주행 기술을 체험해보세요",
                                                manager: { name: "박대리", email: "hyundai@example.com", phone: "010-3456-3456" },
                                                waitingCount: 8
                                            },
                                            {
                                                id: 4,
                                                name: "기아자동차",
                                                image: "/images/NoImage.png",
                                                description: "친환경 전기차의 미래를 경험해보세요",
                                                manager: { name: "최사원", email: "kia@example.com", phone: "010-4567-4567" },
                                                waitingCount: 2
                                            },
                                            {
                                                id: 5,
                                                name: "SK하이닉스",
                                                image: "/images/NoImage.png",
                                                description: "반도체 기술의 핵심을 알아보세요",
                                                manager: { name: "정팀장", email: "sk@example.com", phone: "010-5678-5678" },
                                                waitingCount: 12
                                            },
                                            {
                                                id: 6,
                                                name: "포스코",
                                                image: "/images/NoImage.png",
                                                description: "철강 산업의 첨단 기술을 체험해보세요",
                                                manager: { name: "한부장", email: "posco@example.com", phone: "010-6789-6789" },
                                                waitingCount: 0
                                            },
                                            {
                                                id: 7,
                                                name: "KT",
                                                image: "/images/NoImage.png",
                                                description: "5G 통신 기술의 미래를 경험해보세요",
                                                manager: { name: "윤차장", email: "kt@example.com", phone: "010-7890-7890" },
                                                waitingCount: 6
                                            },
                                            {
                                                id: 8,
                                                name: "SK텔레콤",
                                                image: "/images/NoImage.png",
                                                description: "AI와 IoT 기술의 융합을 체험해보세요",
                                                manager: { name: "임대표", email: "skt@example.com", phone: "010-8901-8901" },
                                                waitingCount: 4
                                            }
                                        ]
                                            .filter(booth => booth.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(booth => (
                                                <div key={booth.id} className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => handleBoothDetailOpen(booth)}>
                                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                                                        <img
                                                            src={booth.image}
                                                            alt={booth.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-800">{booth.name}</p>
                                                </div>
                                            ))}
                                    </div>
                                </>
                            )}

                            {/* 부스 상세정보가 열려있을 때 부스 상세정보 표시 */}
                            {isBoothDetailModalOpen && selectedBooth && (
                                <>
                                    {/* 뒤로가기 버튼 */}
                                    <div className="flex justify-start">
                                        <button
                                            onClick={handleBackToPamphlet}
                                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <span>뒤로가기</span>
                                        </button>
                                    </div>

                                    {/* 선택된 부스 카드 */}
                                    <div className="text-center">
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                                            <img
                                                src={selectedBooth.image}
                                                alt={selectedBooth.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-sm font-medium text-gray-800">{selectedBooth.name}</p>
                                    </div>

                                    {/* 부스 설명 */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-700 mb-2">부스 소개</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">{selectedBooth.description}</p>
                                    </div>

                                    {/* 부스 담당자 정보 */}
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-700 mb-3">부스 담당자</h4>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">{selectedBooth.manager.name.charAt(0)}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-blue-800">{selectedBooth.manager.name}</p>
                                                <p className="text-blue-600 text-sm">{selectedBooth.manager.email}</p>
                                                <p className="text-blue-600 text-sm">{selectedBooth.manager.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 실시간 웨이팅 현황 */}
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-orange-700 mb-2">실시간 웨이팅 현황</h4>
                                        <p className="text-orange-600 text-sm mb-2">실시간 대기 현황입니다.</p>
                                        {selectedBooth.waitingCount > 0 ? (
                                            <p className="text-orange-800 font-medium">현재 대기열: {selectedBooth.waitingCount}명</p>
                                        ) : (
                                            <p className="text-orange-800 font-medium">현재 대기가 없습니다.</p>
                                        )}
                                    </div>

                                    {/* 약관 동의 */}
                                    <div className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            id="agreeTerms"
                                            checked={agreeToTerms}
                                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                        />
                                        <label htmlFor="agreeTerms" className="text-sm text-gray-700 leading-relaxed">
                                            반복적, 악의적으로 대기 취소를 하지 않겠습니다.
                                        </label>
                                    </div>

                                    {/* 대기 등록 버튼 */}
                                    <button
                                        onClick={handleWaitingRegistration}
                                        disabled={!agreeToTerms || isWaiting}
                                        className={`w-full py-3 px-4 rounded-[10px] font-semibold text-white transition-all duration-200 ${agreeToTerms && !isWaiting
                                            ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl'
                                            : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isWaiting ? '대기 등록 완료' : '대기 등록'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
} 