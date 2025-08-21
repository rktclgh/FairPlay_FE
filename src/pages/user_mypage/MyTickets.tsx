import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useWaitingSocket } from "../../utils/useWaitingSocket";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { createReservation, getAvailableExperiences } from "../../services/boothExperienceService";
import { getBooths,  getUserRecentlyEventWaitingCount,  getBoothDetails } from "../../api/boothApi";
import type { BoothExperienceReservationRequest, BoothExperienceFilters, BoothExperience, BoothExperienceReservation } from "../../services/types/boothExperienceType";
import type { BoothSummary } from '../../types/booth';

export default function MyTickets(): JSX.Element {
    const navigate = useNavigate();
    const { t } = useTranslation();

    //======= QR 티켓 ======= //
    const [isQrTicketOpen, setIsQrTicketOpen] = useState(false);
    const [qrTicketId, setQrTicketId] = useState(0);
    const [selectedTicketData, setSelectedTicketData] = useState<QrTicketData | null>(null);
    const [canUseQrTicket, setCanUseQrTicketList] = useState<boolean[]>([]);
    const [updateIds, setUpdateIds] = useState({
        reservationId: 0,
        qrTicketId: 0
    });
    const [successMessage, setSuccessMessage] = useState("");

    //======= 예약 내역 ======= //
    const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);

    //======= 참석자 폼 링크 ======= //
    const [formLinks, setFormLinks] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);

    // 모바일 팜플렛 모달 상태
    const [isPamphletModalOpen, setIsPamphletModalOpen] = useState(false);
    const [selectedEventForPamphlet, setSelectedEventForPamphlet] = useState<ReservationResponseDto | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    //======= 웨이팅 순서 ======= //
    const [waitingCount, setWaitingCount] = useState(0);
    const [savedExperience, setSavedExperience] = useState<BoothExperienceReservation | null>();
    const [waitingMessage, setWaitingMessage] = useState("");

    //======= 조회중인 사용자 ID ======= //
    const [userId, setUserId] = useState(0);
    const [savedEventId, setSavedEventId] = useState(0);

    //======= 부스 정보 ======= //    
    const [isBoothDetailModalOpen, setIsBoothDetailModalOpen] = useState(false); // 부스 상세정보 모달 상태
    const [experiences, setExperiences] = useState<BoothExperience[] | null>(null); // 부스 요약 목록
    const [booths, setBooths] = useState<BoothSummary[] | null>(null); // 부스 목록
    const [selectedBooth, setSelectedBooth] = useState<any | null>(null); // 부스 상세정보
    const [selectedExperience, setSelectedExperience] = useState<BoothExperience | null>(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // 모바일 사이드바 상태
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // // ✅  웨이팅 메세지 설정
    const handleWebSocketMessage = useCallback((msg: string) => {
        const data = JSON.parse(msg);
        console.log(data.waitingCount)
        setWaitingCount(parseInt(data.waitingCount));
        setWaitingMessage(data.statusMessage);
    }, []);

    // 카테고리 정보 캐시
    const eventCategoryCache = React.useRef(new Map<number, { mainCategory: string; subCategory: string }>());

    // ✅ 여기서 웹소켓 구독 시작
    useQrTicketSocket(qrTicketId, (msg) => {
        console.log("qrTicketId:" + qrTicketId);
        setSuccessMessage(msg);   // 메시지를 state에 저장
    });

    // ✅ 부스 웨이팅 웹소켓 - 주석처리 (더미 데이터 사용)
    useWaitingSocket(userId > 0 ? userId : 0, handleWebSocketMessage);

    //======= 예약 내역 조회 ======= // 
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

                const sortedReservations = [...reservationsWithCategories].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setReservations(sortedReservations);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                // QR 티켓 사용 가능 여부: 관람일자 1일 전부터 행사 날까지 버튼 활성화
                const canUseList = sortedReservations.map((reservation: ReservationResponseDto) => {
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

    //======= QR 티켓 창 열기 ======= //    
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

    //======= QR 티켓 창 닫기 ======= //
    const handleQrTicketClose = () => {
        setIsQrTicketOpen(false);
        setSelectedTicketData(null);
        setSuccessMessage("");
    };

    //======= 모바일 팜플렛 열기 ======= //
    const handlePamphletOpen = async (eventId: number) => {
        console.log('handlePamphletOpen 호출됨, eventId:', eventId);
        const token = localStorage.getItem('accessToken');
        if (token && userId === 0) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const savedUserId = Number(payload.sub);
            setUserId(savedUserId);
        }

        try {
            const boothsData = await getBooths(eventId); // 부스 요약 목록
            console.log('getBooths 응답:', boothsData);
            const waitingData = await getUserRecentlyEventWaitingCount(eventId); // 웨이팅 API 주석처리

            // 현재 이벤트 정보를 찾아서 selectedEventForPamphlet에 설정
            const currentEvent = reservations.find(r => r.eventId === eventId);

            setSavedEventId(eventId);
            setSelectedEventForPamphlet(currentEvent || null);
            setWaitingCount(waitingData.waitingCount); // 웨이팅 번호에 대해 초기값 설정
            setWaitingMessage(waitingData.message);
            console.log("waitingCount:",waitingData.waitingCount,"message:",waitingData.message)
            setBooths(boothsData);
            setIsPamphletModalOpen(true);
        } catch (error) {
            console.error('부스 데이터 로드 실패:', error);
            toast.error('부스 정보를 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 팜플렛 모달 닫기
    const handlePamphletClose = () => {
        setIsPamphletModalOpen(false);
        setSelectedEventForPamphlet(null);
        // setWaitingCount(0); // 웨이팅 카운트 초기화 주석처리 - 더미 데이터 사용
        setSearchTerm("");
        setSavedEventId(0);
        setBooths(null);
        setSelectedBooth(null);
        setIsWaiting(false);
        setAgreeToTerms(false);
        setSelectedExperience(null);
    };

    const handleBoothDetailOpen = async (boothId: number) => {
        if (!savedEventId) return;

        try {
            console.log('부스 상세정보 로드 시작 - eventId:', savedEventId, 'boothId:', boothId);
            const boothDetails = await getBoothDetails(savedEventId, boothId);
            console.log('부스 상세정보 응답:', boothDetails);
            const filters: BoothExperienceFilters = {
                boothName: boothDetails.boothTitle || undefined,
                isAvailable: false,
                eventId: savedEventId,
                sortBy: 'startTime',
                sortDirection: 'asc'
            };

            const boothExperiences = await getAvailableExperiences(filters);

            setSelectedBooth(boothDetails);
            setExperiences(boothExperiences);
            // setWaitingCount(boothDetails.waitingCount || 0); // 웨이팅 정보 주석처리 - 더미 데이터 사용
            setIsBoothDetailModalOpen(true);
        } catch (error) {
            console.error('부스 상세정보 로드 실패:', error);
            toast.error('부스 정보를 불러오는 중 오류가 발생했습니다.');
        }
    };

    const handleBoothDetailClose = () => {
        setIsBoothDetailModalOpen(false);
        setSelectedBooth(null);
        setIsWaiting(false);
        setAgreeToTerms(false);
        setSelectedExperience(null);
    };

    const handleSelectExperience = (exp: BoothExperience) => {
        setSelectedExperience(exp);
    };

    const handleBackToPamphlet = () => {
        setIsBoothDetailModalOpen(false);
        setSelectedBooth(null);
        setIsWaiting(false);
        setAgreeToTerms(false);
    };

    const handleWaitingRegistration = async () => {  // 웨이팅 등록 함수
        if (!agreeToTerms) {
            alert("약관에 동의해주세요.");
            return;
        }
        if (!selectedExperience) {
            alert("체험을 선택해주세요.");
            return;
        }
        setIsWaiting(true);
        const requestData: BoothExperienceReservationRequest = {
            notes: "부스 웨이팅"
        };


        try {
            const res = await createReservation(selectedExperience.experienceId, userId, requestData);
            setSavedExperience(res);
            // 실제 대기 등록 로직은 여기에 구현
            alert("대기 등록이 완료되었습니다.");
            handleBoothDetailClose();
        } catch (error) {
            alert(error.response.data);
        }
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

    // HTML 태그를 제거하는 유틸리티 함수 (줄바꿈 유지)
    const stripHtmlTags = (html: string) => {
        if (!html) return '';

        // HTML 태그를 줄바꿈으로 변환하면서 제거
        const cleanText = html
            .replace(/<br\s*\/?>/gi, '\n')     // <br>, <br/> → 줄바꿈
            .replace(/<\/p>/gi, '\n')          // </p> → 줄바꿈
            .replace(/<p[^>]*>/gi, '')         // <p> 태그 제거 (줄바꿈은 </p>에서 처리)
            .replace(/<div[^>]*>/gi, '\n')     // <div> → 줄바꿈
            .replace(/<\/div>/gi, '')          // </div> 제거
            .replace(/<[^>]*>/g, '')           // 나머지 HTML 태그 제거
            .replace(/&nbsp;/g, ' ')           // &nbsp; → 공백
            .replace(/&amp;/g, '&')            // &amp; → &
            .replace(/&lt;/g, '<')             // &lt; → <
            .replace(/&gt;/g, '>')             // &gt; → >
            .replace(/&quot;/g, '"')           // &quot; → "
            .replace(/\n\s*\n/g, '\n')         // 연속된 빈 줄 → 단일 줄바꿈
            .trim();

        return cleanText;
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

                {/* 제목 - 웹화면에서 원래 위치로 유지, 모바일에서 맨 왼쪽으로 이동 */}
                <div className="md:absolute md:top-[137px] md:left-64 left-0 right-4 top-24 relative md:static">
                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl md:text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        {t('mypage.tickets.title')}
                    </div>
                </div>

                {/* 콘텐츠 - 웹화면에서 원래 위치로 유지, 모바일에서 맨 왼쪽으로 이동 */}
                <div className="md:absolute md:top-[239px] md:left-64 md:right-0 left-0 right-4 top-32 relative md:static">
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
                                        className="w-full h-auto bg-white rounded-[10px] border border-solid border-[#0000001f] shadow-[0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_2px_8px_#0000001a] relative"
                                    >
                                        <div className="p-4 md:p-6 relative flex flex-col md:flex-row md:items-start">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-[40px] w-full mb-4 md:mb-0">
                                                <div className="space-y-3 md:space-y-[15px] pt-2 md:pt-[20px] pb-2 md:pb-[20px]">
                                                    <div className="pt-1 md:pt-[10px]">
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-2 md:mb-[8px]">
                                                            {t('mypage.tickets.eventName')}
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                                            <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base md:text-lg tracking-[0] leading-[27px] break-words min-w-0 flex-1">
                                                                {reservation.eventName}
                                                            </div>

                                                            {/* 카테고리 정보 - 행사 타이틀 아래에 배치 */}
                                                            {reservation.mainCategory && (
                                                                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                                                    <span className={`px-3 py-1 rounded text-xs whitespace-nowrap ${reservation.mainCategory === "박람회" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                                                                        reservation.mainCategory === "공연" ? "bg-red-100 text-red-800 border border-red-200" :
                                                                            reservation.mainCategory === "강연/세미나" ? "bg-green-100 text-green-800 border border-green-200" :
                                                                                reservation.mainCategory === "전시/행사" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                                                                                    reservation.mainCategory === "축제" ? "bg-gray-100 text-gray-800 border border-gray-300" :
                                                                                        "bg-gray-100 text-gray-700 border border-gray-200"
                                                                        }`}>
                                                                        {reservation.mainCategory}
                                                                    </span>
                                                                    {reservation.subCategory && (
                                                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200 whitespace-nowrap">
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

                                            <div className="flex flex-col space-y-3 md:space-y-4 mt-4 md:mt-0 md:absolute md:top-[55px] md:right-6">
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

                                                {/* 모바일 팜플렛 버튼 - 공연, 강연/세미나 제외 카테고리인 경우에만 표시 */}
                                                {reservation.mainCategory !== "공연" && reservation.mainCategory !== "강연/세미나" && (
                                                    <div className="w-full md:w-[140px] h-[48px] md:h-[50px] overflow-hidden rounded-xl relative z-20">
                                                        <button
                                                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                console.log('모바일 팜플렛 버튼 클릭:', reservation.eventId);
                                                                handlePamphletOpen(reservation.eventId);
                                                            }}
                                                            className="relative z-20 w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-0"
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
            {isPamphletModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full h-[95vh] flex flex-col overflow-hidden">
                        {/* 모달 헤더 */}
                        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedEventForPamphlet?.eventName || '모바일 팜플렛'}</h2>
                                    <p className="text-gray-300 text-sm mt-1">부스 정보 및 체험 현황</p>
                                </div>
                                <button
                                    onClick={handlePamphletClose}
                                    className="w-14 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-0 bg-transparent"
                                >
                                    <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* 모달 콘텐츠 */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-8 scrollbar-hide">
                            {/* 나의 실시간 순서 - 세련된 디자인 */}
                            <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 p-5 rounded-3xl border border-emerald-200/50 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-pulse"></div>
                                            <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-ping opacity-75"></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-800 font-semibold text-sm">나의 실시간 순서</span>
                                            <span className="text-gray-500 text-xs">현재 대기열</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                           {waitingCount <=0 || !waitingCount ? (
                                                <span className="text-gray-600 font-medium text-sm">{waitingMessage}</span>
                                                ) : (
                                                <>
                                                    <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                                    {waitingCount}
                                                    </span>
                                                    <span className="text-gray-600 font-medium text-sm ml-1">번째</span>
                                                </>
                                                )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                // 새로고침 로직 추가
                                                console.log('실시간 순서 새로고침');
                                            }}
                                            className="p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md group"
                                        >
                                            <RefreshCw className="w-4 h-4 text-gray-600 group-hover:text-emerald-600 transition-colors duration-200" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 부스 상세정보가 열려있지 않을 때만 부스 목록 표시 */}
                            {!isBoothDetailModalOpen && (
                                <>
                                    {/* 세련된 검색창 */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative bg-white rounded-2xl border border-gray-200/60 shadow-sm group-focus-within:shadow-lg group-focus-within:border-gray-300 transition-all duration-300">
                                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-gray-600 transition-colors duration-200" />
                                            <input
                                                type="text"
                                                placeholder="Search"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-2xl focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    {/* 부스 카드 그리드 */}
                                    <div className="grid grid-cols-2 gap-4 min-h-[300px]">
                                        {booths?.filter(booth => (booth.boothTitle || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((booth, index) => {
                                                console.log('부스 데이터:', booth);
                                                const id = booth.boothId || booth.id || index;
                                                return (
                                                    <div key={id} className="group cursor-pointer" onClick={() => {
                                                        console.log('부스 클릭 - boothId:', booth.boothId, 'id:', booth.id, 'index:', index);
                                                        const validId = booth.boothId || booth.id;
                                                        if (validId && typeof validId === 'number') {
                                                            handleBoothDetailOpen(validId);
                                                        } else {
                                                            console.error('유효하지 않은 boothId:', booth);
                                                            toast.error('부스 정보가 올바르지 않습니다.');
                                                        }
                                                    }}>
                                                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                                            <img
                                                                src={booth.boothBannerUrl || '/placeholder-image.jpg'}
                                                                alt={booth.boothTitle || '부스'}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/placeholder-image.jpg';
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-800 text-center group-hover:text-gray-900 transition-colors">
                                                            {booth.boothTitle || '제목 없음'}
                                                        </p>
                                                    </div>
                                                );
                                            })}
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
                                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <span className="font-medium">뒤로가기</span>
                                        </button>
                                    </div>

                                    {/* 선택된 부스 카드 */}
                                    <div className="text-center">
                                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-lg">
                                            <img
                                                src={selectedBooth.boothBannerUrl}
                                                alt={selectedBooth.boothTitle}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">{selectedBooth.boothTitle}</p>
                                    </div>

                                    {/* 부스 설명 */}
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">부스 소개</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedBooth.boothDescription
                                                ? stripHtmlTags(selectedBooth.boothDescription)
                                                : '부스 설명이 없습니다.'}
                                        </p>
                                    </div>

                                    {/* 부스 담당자 정보 */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">부스 담당자</h4>
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-white font-bold text-xl">
                                                    {(selectedBooth.managerName || 'N').charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-lg">{selectedBooth.managerName || '담당자 미등록'}</p>
                                                <p className="text-gray-600 text-sm">{selectedBooth.contactEmail || '이메일 미등록'}</p>
                                                <p className="text-gray-600 text-sm">{selectedBooth.contactNumber || '연락처 미등록'}</p>
                                            </div>
                                        </div>

                                        {/* 외부 링크 */}
                                        {((selectedBooth.boothExternalLinks && selectedBooth.boothExternalLinks.length > 0) ||
                                            (selectedBooth.externalLinks && selectedBooth.externalLinks.length > 0)) && (
                                                <div className="border-t border-gray-300 pt-4 mt-4">
                                                    <h5 className="font-medium text-gray-900 mb-3 text-base">관련 링크</h5>
                                                    <div className="space-y-3">
                                                        {(selectedBooth.boothExternalLinks || selectedBooth.externalLinks || [])
                                                            .filter(link => link && (link.url || link.link))
                                                            .map((link, index) => {
                                                                const linkUrl = link.url || link.link;
                                                                const linkText = link.displayText || link.text || linkUrl;
                                                                const fullUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;

                                                                return (
                                                                    <a
                                                                        key={index}
                                                                        href={fullUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 text-sm transition-colors break-all p-3 rounded-lg hover:bg-white/50"
                                                                    >
                                                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                        <span className="font-medium">{linkText}</span>
                                                                    </a>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                    </div>

                                    {/* 실시간 웨이팅 현황 */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">실시간 웨이팅 현황</h4>
                                        <p className="text-gray-600 text-sm mb-5">체험별 현재 대기열을 확인하세요.</p>

                                        <div className="space-y-3">
                                            {experiences && experiences.length > 0 ? (
                                                experiences.map((exp, idx) => {
                                                    const isSelected = selectedExperience?.experienceId === exp.experienceId;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`
                                                flex items-center justify-between p-4 rounded-xl shadow-sm cursor-pointer transition-all duration-200
                                                ${isSelected ? 'border-2 border-gray-800 shadow-lg bg-white' : 'border border-gray-200 bg-white hover:bg-gray-50'}
                                            `}
                                                            onClick={() => handleSelectExperience(exp)}
                                                        >
                                                            {/* 체험 이름 */}
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900">{exp.title}</span>
                                                                <span className="text-sm text-gray-500">{exp.description || '설명 없음'}</span>
                                                            </div>

                                                            {/* 대기 인원 */}
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-gray-900 font-bold text-xl">
                                                                    {exp.waitingCount ?? 0}명
                                                                </span>
                                                                <span className="text-sm text-gray-500">대기</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-gray-500 text-sm text-center py-4">
                                                    등록된 체험이 없습니다.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 약관 동의 */}
                                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                        <input
                                            type="checkbox"
                                            id="agreeTerms"
                                            checked={agreeToTerms}
                                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-gray-800 bg-white border-gray-300 rounded focus:ring-gray-800 focus:ring-2"
                                        />
                                        <label htmlFor="agreeTerms" className="text-sm text-gray-700 leading-relaxed">
                                            반복적, 악의적으로 대기 취소를 하지 않겠습니다.
                                        </label>
                                    </div>

                                    {/* 대기 등록 버튼 */}
                                    <div className="mt-6">
                                        <button
                                            onClick={() => { handleWaitingRegistration() }}
                                            disabled={!agreeToTerms || !selectedExperience}
                                            className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 ${agreeToTerms && selectedExperience
                                                ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-black hover:from-black hover:via-gray-900 hover:to-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                                                : 'bg-gray-400 cursor-not-allowed opacity-60'
                                                }`}
                                        >
                                            대기 등록
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
} 