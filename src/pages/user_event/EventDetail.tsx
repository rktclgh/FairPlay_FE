import React, { useState, useEffect } from "react";
import {useParams, useNavigate, useLocation} from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { MapPin } from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { requireAuth } from "../../utils/authGuard";
import { VenueInfo } from "./VenueInfo";
import { CancelPolicy } from "./CancelPolicy";
import { Reviews } from "./Reviews";
import { Expectations } from "./Expectations";
import ExternalLink from "./ExternalLink";
import { eventAPI } from "../../services/event";
import type { EventDetailResponseDto } from "../../services/types/eventType";
import api from "../../api/axios";
import { openChatRoomGlobal } from "../../components/chat/ChatFloatingModal";
import type {
    ReviewResponseDto,
    ReviewDto,
    Page,
    PageableRequest,
    ReviewForEventResponseDto
} from "../../services/types/reviewType";
import {
    getReviewsByEvent
} from "../../services/review";
type WishlistResponseDto = { eventId: number };

import authManager from "../../utils/auth";
import { toast } from 'react-toastify';

// 회차 정보 인터페이스
interface EventSchedule {
    scheduleId: number;
    date: string; // LocalDate (YYYY-MM-DD)
    startTime: string; // LocalTime (HH:mm)
    endTime: string; // LocalTime (HH:mm)
    weekday: number; // 0 (일) ~ 6 (토)
    hasActiveTickets: boolean;
    soldTicketCount: number;
}

const authHeaders = () => {
    const t = localStorage.getItem("accessToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
};

const isAuthed = () => !!localStorage.getItem("accessToken");

const EventDetail = (): JSX.Element => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState<EventDetailResponseDto | null>(null);
    const [loading, setLoading] = useState(true);

    const [currentCalendarYear, setCurrentCalendarYear] = useState<number>(2025);
    const [currentCalendarMonth, setCurrentCalendarMonth] = useState<number>(7);
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // 날짜 문자열로 변경
    const [activeTab, setActiveTab] = useState<string>("detail");
    const [eventDates, setEventDates] = useState<string[]>([]); // 이벤트 날짜 목록
    const [availableSchedules, setAvailableSchedules] = useState<EventSchedule[]>([]); // 선택된 날짜의 회차 목록
    const [allSchedules, setAllSchedules] = useState<EventSchedule[]>([]); // 전체 회차 목록
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null); // 선택된 회차 ID
    const [ticketPrices, setTicketPrices] = useState<{name: string, price: number}[]>([]); // 티켓 가격 목록
    const [isExternalBookingOpen, setIsExternalBookingOpen] = useState(false);
    const [reviews, setReviews] = useState<ReviewForEventResponseDto | null>(null)
    const [currentPage, setCurrentPage] = useState(0);

    // 담당자 채팅 오픈 함수
    const handleInquiry = async () => {
        try {
            // 이벤트 담당자 채팅방 생성/조회 (API가 자동으로 담당자 찾아서 채팅방 생성)
            const response = await api.post("/api/chat/event-inquiry", {
                eventId: Number(eventId)
            });
            const chatRoomId = response.data.chatRoomId;

            // 채팅방 강제 오픈
            openChatRoomGlobal(chatRoomId);
        } catch (e) {
            console.error("담당자 채팅방 생성 실패:", e);
            // 에러 토스트 자동
        }
    };

    const location = useLocation();

    // 관심(위시) 상태
    const [isLiked, setIsLiked] = useState(false);
    const [pending, setPending] = useState(false);

    const id = Number(eventId); // 컴포넌트 내부에서 계산

    // 초기 위시 상태 로드
    React.useEffect(() => {
        if (!isAuthed()) return;

        (async () => {
            try {
                const { data } = await api.get<WishlistResponseDto[]>("/api/wishlist", {
                    headers: authHeaders(),
                });
                const s = new Set<number>();
                (data ?? []).forEach(w => s.add(w.eventId));
                setIsLiked((data ?? []).some((w) => w.eventId === id));
            } catch (e) {
                console.error("위시리스트 로드 실패:", e);
            }
        })();
    }, []);

    // 관심 토글
    const toggleLike = async () => {
        if (!id || pending) return;

        if (!isAuthed()) {
            alert("로그인 후 이용할 수 있습니다.");
            navigate("/login", { state: { from: location.pathname } }); // 필요하면 search도 붙이려면 `${location.pathname}${location.search}`
            return;
        }
        setPending(true);


        const was = isLiked;
        setIsLiked(!was); // 낙관적 업데이트

        try {
            if (was) {
                await api.delete(`/api/wishlist/${id}`, { headers: authHeaders() });
            } else {
                await api.post(`/api/wishlist`, null, {
                    params: { eventId: id },
                    headers: authHeaders(),
                });
            }
        } catch (e) {
            setIsLiked(was); // 실패 롤백
            console.error("상세 찜 토글 실패:", e);
        } finally {
            setPending(false);
        }
    };

    // 이벤트 데이터 로드 시 달력 초기화
    // useEffect(() => {
    //     if (eventData) {
    //         const eventDates = parseEventDates(eventData.schedule);
    //         if (eventDates) {
    //             setCurrentCalendarYear(eventDates.startYear);
    //             setCurrentCalendarMonth(eventDates.startMonth);
    //         }
    //     }
    // }, [eventData]);

    // 날짜 파싱 함수


    const parseEventDates = (schedule: string) => {
        // "2025.07.26 - 2025.07.27 11:00" 형식에서 날짜 추출
        const dateMatches = schedule.match(/(\d{4})\.(\d{2})\.(\d{2})/g);
        if (dateMatches && dateMatches.length >= 2) {
            const startDate = dateMatches[0].split('.').map(Number);
            const endDate = dateMatches[1].split('.').map(Number);

            return {
                startYear: startDate[0],
                startMonth: startDate[1],
                startDay: startDate[2],
                endYear: endDate[0],
                endMonth: endDate[1],
                endDay: endDate[2]
            };
        }
        return null;
    };

    // 달력 네비게이션 함수들
    const handlePrevMonth = () => {
        if (currentCalendarMonth === 1) {
            setCurrentCalendarYear(currentCalendarYear - 1);
            setCurrentCalendarMonth(12);
        } else {
            setCurrentCalendarMonth(currentCalendarMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentCalendarMonth === 12) {
            setCurrentCalendarYear(currentCalendarYear + 1);
            setCurrentCalendarMonth(1);
        } else {
            setCurrentCalendarMonth(currentCalendarMonth + 1);
        }
    };

    // 달력 생성 함수
    const generateCalendar = (year: number, month: number) => {
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const calendar = [];

        // 이전 달의 마지막 날짜들
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

        for (let i = firstDay - 1; i >= 0; i--) {
            calendar.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                isEventDay: false
            });
        }

        // 현재 달의 날짜들
        for (let day = 1; day <= daysInMonth; day++) {
            calendar.push({
                day,
                isCurrentMonth: true,
                isEventDay: false
            });
        }

        // 다음 달의 날짜들 (6주 완성)
        const remainingDays = 42 - calendar.length;
        for (let day = 1; day <= remainingDays; day++) {
            calendar.push({
                day,
                isCurrentMonth: false,
                isEventDay: false
            });
        }

        return calendar;
    };

    // 이벤트 데이터 (ID에 따라 다른 데이터 반환)
    // const getEventData = (eventId: string) => {
    //     if (eventId === "1") {
    //         // 포스트 말론 공연 데이터
    //         return {
    //             id: "1",
    //             title: "포스트 말론 2025 내한 공연",
    //             subtitle: "POST MALONE LIVE in SEOUL 2025",
    //             venue: "고척스카이돔",
    //             ageRating: "청소년관람불가",
    //             schedule: "2025.08.25 - 2025.08.27 20:00",
    //             introduction: "전 세계가 주목한 슈퍼스타와 서울에서 만나는 기회!",
    //             description: [
    //                 "포스트 말론(Post Malone)이 드디어 한국을 찾습니다. 그래미 어워드 후보에 10번 노미네이트되며 전 세계적으로 사랑받는 아티스트의 라이브 무대를 고척스카이돔에서 만나보세요.",
    //                 "히트곡 'Circles', 'Sunflower', 'Rockstar' 등 수많은 명곡들을 라이브로 들을 수 있는 특별한 기회입니다. 포스트 말론만의 독특한 음악 스타일과 카리스마 넘치는 퍼포먼스를 직접 경험해보세요.",
    //             ],
    //             notices: [
    //                 "본 공연은 청소년관람불가 등급입니다.",
    //                 "공연 시작 후 입장이 제한될 수 있습니다.",
    //                 "카메라, 캠코더 등 촬영장비 반입 금지",
    //                 "음식물 반입 금지 (생수 제외)",
    //             ],
    //             pricingTiers: [
    //                 { tier: "VIP석 (스탠딩 or 중앙 1층)", price: "250,000원" },
    //                 { tier: "R석 (1층 좌석)", price: "200,000원" },
    //                 { tier: "S석 (2층 중앙)", price: "160,000원" },
    //                 { tier: "A석 (2~3층 측면)", price: "120,000원" },
    //                 { tier: "B석 (고층 뒷줄)", price: "100,000원" },
    //             ],
    //             seatAvailability: [
    //                 { type: "VIP석", status: "매진" },
    //                 { type: "R석", status: "매진" },
    //                 { type: "S석", status: "매진" },
    //                 { type: "A석", status: "매진" },
    //                 { type: "B석", status: "18 석" },
    //             ],
    //             schedules: [
    //                 {
    //                     round: 1,
    //                     date: "2025.08.25 (월)",
    //                     time: "오후 8시 00분",
    //                     availableSeats: 156
    //                 },
    //                 {
    //                     round: 2,
    //                     date: "2025.08.26 (화)",
    //                     time: "오후 8시 00분",
    //                     availableSeats: 89
    //                 },
    //                 {
    //                     round: 3,
    //                     date: "2025.08.27 (수)",
    //                     time: "오후 8시 00분",
    //                     availableSeats: 234
    //                 }
    //             ],
    //             image: "/images/malone.jpg",
    //             bookingInfo: {
    //                 qrTicketInfo: [
    //                     "• 예매(결제) 완료 즉시, [마이페이지 > 나의 예매/QR]에서 QR 티켓을 확인하실 수 있습니다.",
    //                     "• QR 티켓은 문자 또는 이메일로도 발송되며, 행사 당일 입장 시 해당 QR 코드를 제시해 주세요.",
    //                     "• 티켓 출력 없이 스마트폰만으로 입장 가능합니다."
    //                 ],
    //                 entryMethod: [
    //                     "• 행사 당일, 입장 게이트에서 QR 코드를 스캔하여 입장하실 수 있습니다.",
    //                     "• 원활한 입장을 위해 공연 시작 30분 전까지 도착해주시기 바랍니다.",
    //                     "• 네트워크 상황에 따라 QR 코드 로딩이 지연될 수 있으니, 미리 티켓을 캡처 또는 저장해두시는 것을 권장합니다."
    //                 ],
    //                 cancellationFees: [
    //                     "• 예매 후 7일 이내: 무료 취소",
    //                     "• 예매 후 8일~공연 10일 전: 티켓금액의 10%",
    //                     "• 공연 9일 전~7일 전: 티켓금액의 20%",
    //                     "• 공연 6일 전~3일 전: 티켓금액의 30%",
    //                     "• 공연 2일 전~당일: 취소 불가"
    //                 ],
    //                 refundMethod: [
    //                     "• 온라인 취소: 예매 사이트에서 직접 취소",
    //                     "• 전화 취소: 예매처 고객센터 연락",
    //                     "• 환불 기간: 취소 신청 후 3~5 영업일"
    //                 ],
    //                 importantNotices: [
    //                     "• 티켓 분실 시 재발급이 불가능하니 주의하시기 바랍니다.",
    //                     "• 공연 일정 및 출연진은 주최측 사정에 의해 변경될 수 있습니다."
    //                 ]
    //             }
    //         };
    //     } else if (eventId === "2") {
    //         // 웨딩박람회 데이터
    //         return {
    //             id: "2",
    //             title: "웨덱스 웨딩박람회 in COEX",
    //             subtitle: "WEDEX Wedding Fair in COEX",
    //             venue: "코엑스 Hall B",
    //             ageRating: "전체 관람가",
    //             schedule: "2025.07.26 - 2025.07.27 11:00",
    //             introduction: "대한민국 대표 웨딩박람회!",
    //             description: [
    //                 "예비 신혼부부를 위한 국내 최대 규모의 웨딩박람회가 코엑스에서 개최됩니다.",
    //                 "예식장, 스튜디오, 드레스, 메이크업, 허니문, 한복, 예물 등 국내외 100여 개 웨딩 관련 브랜드를 한자리에서 만나보세요.",
    //                 "현장 계약 시 다양한 경품 이벤트와 혜택이 제공됩니다.",
    //                 "올인원 웨딩 준비의 시작, 웨덱스에서 함께하세요."
    //             ],
    //             notices: [
    //                 "본 박람회는 사전 예약자에 한해 무료 입장이 가능합니다.",
    //                 "사전 등록 시 입장권과 웨딩 키트가 제공됩니다.",
    //                 "일부 부스는 상담 예약이 필요할 수 있습니다.",
    //                 "음식물 반입은 제한됩니다 (유아식 제외)"
    //             ],
    //             pricingTiers: [
    //                 { tier: "일반 입장", price: "무료" },
    //                 { tier: "사전 등록", price: "무료" },
    //                 { tier: "VIP 패키지", price: "50,000원" },
    //                 { tier: "컨설팅 패키지", price: "100,000원" }
    //             ],
    //             seatAvailability: [
    //                 { type: "일반 입장", status: "예약 가능" },
    //                 { type: "사전 등록", status: "예약 가능" },
    //                 { type: "VIP 패키지", status: "예약 가능" },
    //                 { type: "컨설팅 패키지", status: "예약 가능" }
    //             ],
    //             schedules: [
    //                 {
    //                     round: 1,
    //                     date: "2025.07.26 (토)",
    //                     time: "오전 11시 00분",
    //                     availableSeats: 500
    //                 },
    //                 {
    //                     round: 2,
    //                     date: "2025.07.26 (토)",
    //                     time: "오후 1시 00분",
    //                     availableSeats: 500
    //                 },
    //                 {
    //                     round: 3,
    //                     date: "2025.07.26 (토)",
    //                     time: "오후 3시 00분",
    //                     availableSeats: 500
    //                 },
    //                 {
    //                     round: 4,
    //                     date: "2025.07.26 (토)",
    //                     time: "오후 5시 00분",
    //                     availableSeats: 500
    //                 },
    //                 {
    //                     round: 5,
    //                     date: "2025.07.27 (일)",
    //                     time: "오전 11시 00분",
    //                     availableSeats: 500
    //                 },
    //                 {
    //                     round: 6,
    //                     date: "2025.07.27 (일)",
    //                     time: "오후 1시 00분",
    //                     availableSeats: 500
    //                 },
    //                 {
    //                     round: 7,
    //                     date: "2025.07.27 (일)",
    //                     time: "오후 3시 00분",
    //                     availableSeats: 500
    //                 },
    //                 {
    //                     round: 8,
    //                     date: "2025.07.27 (일)",
    //                     time: "오후 5시 00분",
    //                     availableSeats: 500
    //                 }
    //             ],
    //             image: "/images/wedding.png",
    //             bookingInfo: {
    //                 qrTicketInfo: [
    //                     "• 사전 등록 완료 즉시, [마이페이지 > 나의 예매/QR]에서 QR 티켓을 확인하실 수 있습니다.",
    //                     "• QR 티켓은 문자 또는 이메일로도 발송되며, 박람회 당일 입장 시 해당 QR 코드를 제시해 주세요.",
    //                     "• 티켓 출력 없이 스마트폰만으로 입장 가능합니다."
    //                 ],
    //                 entryMethod: [
    //                     "• 박람회 당일, 입장 게이트에서 QR 코드를 스캔하여 입장하실 수 있습니다.",
    //                     "• 원활한 입장을 위해 박람회 시작 30분 전까지 도착해주시기 바랍니다.",
    //                     "• 네트워크 상황에 따라 QR 코드 로딩이 지연될 수 있으니, 미리 티켓을 캡처 또는 저장해두시는 것을 권장합니다."
    //                 ],
    //                 cancellationFees: [
    //                     "• 사전 등록 후 7일 이내: 무료 취소",
    //                     "• 사전 등록 후 8일~박람회 10일 전: 등록비의 10%",
    //                     "• 박람회 9일 전~7일 전: 등록비의 20%",
    //                     "• 박람회 6일 전~3일 전: 등록비의 30%",
    //                     "• 박람회 2일 전~당일: 취소 불가"
    //                 ],
    //                 refundMethod: [
    //                     "• 온라인 취소: 예매 사이트에서 직접 취소",
    //                     "• 전화 취소: 예매처 고객센터 연락",
    //                     "• 환불 기간: 취소 신청 후 3~5 영업일"
    //                 ],
    //                 importantNotices: [
    //                     "• QR 티켓 분실 시 재발급이 불가능하니 주의하시기 바랍니다.",
    //                     "• 박람회 일정 및 참가업체는 주최측 사정에 의해 변경될 수 있습니다.",
    //                     "• 사전 등록 시 제공되는 웨딩 키트는 현장에서 수령하실 수 있습니다."
    //                 ]
    //             }
    //         };
    //     }
    //
    //     // 기본 데이터 (기존 웨딩박람회 데이터)
    //     return {
    //         id: "2",
    //         title: "웨덱스 웨딩박람회 in COEX",
    //         subtitle: "WEDEX Wedding Fair in COEX",
    //         venue: "코엑스 Hall B",
    //         ageRating: "전체 관람가",
    //         schedule: "2025.07.26 - 2025.07.27 11:00",
    //         introduction: "대한민국 대표 웨딩박람회!",
    //         description: [
    //             "예비 신혼부부를 위한 국내 최대 규모의 웨딩박람회가 코엑스에서 개최됩니다.",
    //             "예식장, 스튜디오, 드레스, 메이크업, 허니문, 한복, 예물 등 국내외 100여 개 웨딩 관련 브랜드를 한자리에서 만나보세요.",
    //             "현장 계약 시 다양한 경품 이벤트와 혜택이 제공됩니다.",
    //             "올인원 웨딩 준비의 시작, 웨덱스에서 함께하세요."
    //         ],
    //         notices: [
    //             "본 박람회는 사전 예약자에 한해 무료 입장이 가능합니다.",
    //             "사전 등록 시 입장권과 웨딩 키트가 제공됩니다.",
    //             "일부 부스는 상담 예약이 필요할 수 있습니다.",
    //             "음식물 반입은 제한됩니다 (유아식 제외)"
    //         ],
    //         pricingTiers: [
    //             { tier: "일반 입장", price: "무료" },
    //             { tier: "사전 등록", price: "무료" },
    //             { tier: "VIP 패키지", price: "50,000원" },
    //             { tier: "컨설팅 패키지", price: "100,000원" }
    //         ],
    //         seatAvailability: [
    //             { type: "일반 입장", status: "예약 가능" },
    //             { type: "사전 등록", status: "예약 가능" },
    //             { type: "VIP 패키지", status: "예약 가능" },
    //             { type: "컨설팅 패키지", status: "예약 가능" }
    //         ],
    //         schedules: [
    //             {
    //                 round: 1,
    //                 date: "2025.07.26 (토)",
    //                 time: "오전 11시 00분",
    //                 availableSeats: 500
    //             },
    //             {
    //                 round: 2,
    //                 date: "2025.07.26 (토)",
    //                 time: "오후 1시 00분",
    //                 availableSeats: 500
    //             },
    //             {
    //                 round: 3,
    //                 date: "2025.07.26 (토)",
    //                 time: "오후 3시 00분",
    //                 availableSeats: 500
    //             },
    //             {
    //                 round: 4,
    //                 date: "2025.07.26 (토)",
    //                 time: "오후 5시 00분",
    //                 availableSeats: 500
    //             },
    //             {
    //                 round: 5,
    //                 date: "2025.07.27 (일)",
    //                 time: "오전 11시 00분",
    //                 availableSeats: 500
    //             },
    //             {
    //                 round: 6,
    //                 date: "2025.07.27 (일)",
    //                 time: "오후 1시 00분",
    //                 availableSeats: 500
    //             },
    //             {
    //                 round: 7,
    //                 date: "2025.07.27 (일)",
    //                 time: "오후 3시 00분",
    //                 availableSeats: 500
    //             },
    //             {
    //                 round: 8,
    //                 date: "2025.07.27 (일)",
    //                 time: "오후 5시 00분",
    //                 availableSeats: 500
    //             }
    //         ],
    //         image: "/images/wedding.png",
    //         bookingInfo: {
    //             qrTicketInfo: [
    //                 "• 사전 등록 완료 즉시, [마이페이지 > 나의 예매/QR]에서 QR 티켓을 확인하실 수 있습니다.",
    //                 "• QR 티켓은 문자 또는 이메일로도 발송되며, 박람회 당일 입장 시 해당 QR 코드를 제시해 주세요.",
    //                 "• 티켓 출력 없이 스마트폰만으로 입장 가능합니다."
    //             ],
    //             entryMethod: [
    //                 "• 박람회 당일, 입장 게이트에서 QR 코드를 스캔하여 입장하실 수 있습니다.",
    //                 "• 원활한 입장을 위해 박람회 시작 30분 전까지 도착해주시기 바랍니다.",
    //                 "• 네트워크 상황에 따라 QR 코드 로딩이 지연될 수 있으니, 미리 티켓을 캡처 또는 저장해두시는 것을 권장합니다."
    //             ],
    //             cancellationFees: [
    //                 "• 사전 등록 후 7일 이내: 무료 취소",
    //                 "• 사전 등록 후 8일~박람회 10일 전: 등록비의 10%",
    //                 "• 박람회 9일 전~7일 전: 등록비의 20%",
    //                 "• 박람회 6일 전~3일 전: 등록비의 30%",
    //                 "• 박람회 2일 전~당일: 취소 불가"
    //             ],
    //             refundMethod: [
    //                 "• 온라인 취소: 예매 사이트에서 직접 취소",
    //                 "• 전화 취소: 예매처 고객센터 연락",
    //                 "• 환불 기간: 취소 신청 후 3~5 영업일"
    //             ],
    //             importantNotices: [
    //                 "• QR 티켓 분실 시 재발급이 불가능하니 주의하시기 바랍니다.",
    //                 "• 박람회 일정 및 참가업체는 주최측 사정에 의해 변경될 수 있습니다.",
    //                 "• 사전 등록 시 제공되는 웨딩 키트는 현장에서 수령하실 수 있습니다."
    //             ]
    //         }
    //     };
    // };

    // 이벤트 데이터 로드 (실제로는 API 호출)
    useEffect(() => {
        const loadEventData = async () => {
            try {
                setLoading(true);
                // 이벤트 상세 정보 로드
                const data = await eventAPI.getEventDetail(Number(eventId));

                const params: PageableRequest = {
                    page: 0,
                    size: 10,
                    sort: 'createdAt,desc'
                }

                const reviewData = await getReviewsByEvent(Number(eventId), params);
                setTimeout(() => {
                    setEventData(data);
                    setReviews(reviewData);
                    setLoading(false);
                }, 500);

                // 이벤트 날짜 범위에서 날짜 목록 생성
                if (data.startDate && data.endDate) {
                    const startDate = new Date(data.startDate);
                    const endDate = new Date(data.endDate);
                    const dateList: string[] = [];

                    const currentDate = new Date(startDate);
                    while (currentDate <= endDate) {
                        dateList.push(currentDate.toISOString().split('T')[0]); // YYYY-MM-DD 형식
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                    setEventDates(dateList);

                    // 달력을 이벤트 시작 월로 설정
                    setCurrentCalendarYear(startDate.getFullYear());
                    setCurrentCalendarMonth(startDate.getMonth() + 1); // getMonth()는 0부터 시작하므로 +1

                    // 전체 회차 데이터 로드
                    await loadAllSchedules();

                    // 티켓 가격 정보 로드
                    await loadTicketPrices();

                    // 첫 번째 날짜를 기본 선택
                    if (dateList.length > 0) {
                        setSelectedDate(dateList[0]);
                        // loadSchedulesForDate 대신 전체 데이터에서 필터링
                        filterSchedulesForDate(dateList[0]);
                    }
                }


            } catch (error) {
                console.error('이벤트 데이터 로드 실패:', error);
                setLoading(false);
            }
        };

        if (eventId) {
            loadEventData();
        }
    }, [eventId]);

    // 전체 회차 데이터 로드 함수
    const loadAllSchedules = async () => {
        try {
            console.log('전체 회차 조회 시도...');
            const response = await authManager.authenticatedFetch(`/api/events/${eventId}/schedule`);

            if (!response.ok) {
                if (response.status === 403) {
                    console.warn('회차 조회 권한이 없습니다. 목업 데이터를 사용합니다.');
                    // 권한이 없을 때 전체 날짜에 대한 목업 데이터 생성
                    const mockAllSchedules = generateMockSchedulesForAllDates();
                    setAllSchedules(mockAllSchedules);
                    return;
                }
                throw new Error(`회차 목록 조회 실패: ${response.status}`);
            }

            const scheduleList = await response.json();
            console.log('API로부터 받은 전체 회차 목록:', scheduleList);

            // 전체 회차 데이터 포맷팅
            const formattedSchedules = scheduleList.map((schedule: any) => ({
                scheduleId: schedule.scheduleId,
                date: schedule.date,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                weekday: schedule.weekday,
                hasActiveTickets: schedule.hasActiveTickets || false,
                soldTicketCount: schedule.soldTicketCount || 0
            }));

            setAllSchedules(formattedSchedules);
            console.log('전체 회차 데이터 저장 완료:', formattedSchedules);

        } catch (error) {
            console.error('전체 회차 로드 실패:', error);
            // 에러 발생 시에도 목업 데이터로 폴백
            const mockAllSchedules = generateMockSchedulesForAllDates();
            setAllSchedules(mockAllSchedules);
            console.log('목업 전체 회차 데이터 사용:', mockAllSchedules);
        }
    };

    // 선택된 날짜의 회차만 필터링하는 함수
    const filterSchedulesForDate = (date: string) => {
        const dateSchedules = allSchedules.filter(schedule => schedule.date === date);
        setAvailableSchedules(dateSchedules);

        // 첫 번째 회차를 기본 선택
        if (dateSchedules.length > 0) {
            setSelectedScheduleId(dateSchedules[0].scheduleId);
        } else {
            setSelectedScheduleId(null);
        }

        console.log(`${date} 날짜의 회차:`, dateSchedules);
    };

    // 목업 회차 데이터 생성 함수 (단일 날짜)
    const generateMockSchedules = (date: string) => {
        const schedules = [];
        const times = [
            { start: '14:00', end: '16:00' },
            { start: '19:00', end: '21:00' }
        ];

        times.forEach((time, index) => {
            schedules.push({
                scheduleId: index + 1,
                date: date,
                startTime: time.start,
                endTime: time.end,
                weekday: new Date(date + 'T00:00:00').getDay(),
                hasActiveTickets: true,
                soldTicketCount: Math.floor(Math.random() * 50)
            });
        });

        return schedules;
    };

    // 전체 날짜에 대한 목업 회차 데이터 생성 함수
    const generateMockSchedulesForAllDates = () => {
        const allSchedules: EventSchedule[] = [];
        let scheduleIdCounter = 1;

        eventDates.forEach(date => {
            const times = [
                { start: '14:00', end: '16:00' },
                { start: '19:00', end: '21:00' }
            ];

            // 날짜에 따라 회차 수와 예매 가능 여부 결정
            const dateHash = date.split('-').reduce((sum, part) => sum + parseInt(part), 0);
            const hasSchedules = dateHash % 4 !== 0; // 75% 확률로 회차 존재

            if (hasSchedules) {
                times.forEach((time, index) => {
                    const hasActiveTickets = (dateHash + index) % 3 !== 0; // 약 66% 확률로 예매 가능
                    allSchedules.push({
                        scheduleId: scheduleIdCounter++,
                        date: date,
                        startTime: time.start,
                        endTime: time.end,
                        weekday: new Date(date + 'T00:00:00').getDay(),
                        hasActiveTickets: hasActiveTickets,
                        soldTicketCount: Math.floor(Math.random() * 50)
                    });
                });
            }
        });

        return allSchedules;
    };

    // 티켓 가격 정보 로드 함수
    const loadTicketPrices = async () => {
        try {
            console.log('이벤트 티켓 정보 조회 시도...', { eventId });

            // 이벤트에 등록된 티켓 목록 조회 (Ticket 테이블 + event_ticket 테이블)
            // TicketController의 @GetMapping 엔드포인트 사용
            const response = await authManager.authenticatedFetch(`/api/events/${eventId}/tickets`);

            if (!response.ok) {
                console.error('티켓 조회 API 응답 실패:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });

                if (response.status === 403) {
                    console.warn('티켓 조회 권한이 없습니다.');
                    setTicketPrices([]); // 빈 배열로 설정하여 등록되지 않음 메시지 표시
                    return;
                }
                if (response.status === 404) {
                    console.log('해당 이벤트에 등록된 티켓이 없습니다.');
                    setTicketPrices([]); // 빈 배열로 설정
                    return;
                }

                // 에러 응답 내용 확인
                try {
                    const errorText = await response.text();
                    console.error('에러 응답 내용:', errorText);
                } catch (e) {
                    console.error('에러 응답 읽기 실패:', e);
                }

                throw new Error(`티켓 조회 실패: ${response.status} ${response.statusText}`);
            }

            const ticketList = await response.json();
            console.log('API로부터 받은 이벤트 티켓 목록:', ticketList);

            if (!ticketList || ticketList.length === 0) {
                console.log('조회된 티켓이 없습니다.');
                setTicketPrices([]); // 빈 배열로 설정
                return;
            }

            // 티켓 가격 목록 생성
            const priceList = ticketList.map((ticket: any) => {
                console.log('개별 티켓 데이터:', ticket);
                return {
                    name: ticket.name || ticket.ticketName || ticket.title || '이름 없음',
                    price: ticket.price || 0
                };
            }).sort((a, b) => b.price - a.price); // 가격 높은 순으로 정렬

            setTicketPrices(priceList);
            console.log('이벤트 티켓 가격 목록:', priceList);

        } catch (error) {
            console.error('티켓 가격 로드 실패:', error);
            console.error('에러 상세 정보:', {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
                eventId
            });
            // 에러 발생 시에도 빈 배열로 설정 (목업 데이터 사용하지 않음)
            setTicketPrices([]);
        }
    };

    // 달력 날짜 생성 함수
    const generateCalendarDays = () => {
        const year = currentCalendarYear;
        const month = currentCalendarMonth;

        // 해당 월의 첫째 날과 마지막 날
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);

        // 첫째 날의 요일 (0: 일요일, 6: 토요일)
        const firstDayOfWeek = firstDay.getDay();

        // 마지막 날의 날짜
        const lastDate = lastDay.getDate();

        // 이전 달의 마지막 날들
        const prevMonth = new Date(year, month - 2, 0);
        const prevLastDate = prevMonth.getDate();

        const days = [];

        // 이전 달의 날짜들 (회색으로 표시)
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const date = prevLastDate - i;
            const dateString = `${year}-${String(month - 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            days.push({
                date,
                dateString,
                isCurrentMonth: false
            });
        }

        // 현재 달의 날짜들
        for (let date = 1; date <= lastDate; date++) {
            const dateString = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            days.push({
                date,
                dateString,
                isCurrentMonth: true
            });
        }

        // 다음 달의 날짜들 (달력을 6주로 맞추기 위해)
        const remainingDays = 42 - days.length; // 6주 * 7일 = 42일
        for (let date = 1; date <= remainingDays; date++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            days.push({
                date,
                dateString,
                isCurrentMonth: false
            });
        }

        return days;
    };

    // 날짜 선택 핸들러
    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setSelectedScheduleId(null); // 기존 회차 선택 초기화
        filterSchedulesForDate(date);
    };

    // 회차 선택 핸들러
    const handleScheduleSelect = (scheduleId: number) => {
        setSelectedScheduleId(scheduleId);
    };

    // 선택된 회차 정보 가져오기
    const getSelectedSchedule = () => {
        return availableSchedules.find(schedule => schedule.scheduleId === selectedScheduleId);
    };

    // 특정 날짜의 예매 가능 여부 확인
    const isDateBookable = (date: string) => {
        // 전체 회차 데이터에서 해당 날짜의 회차들을 찾아서 예매 가능 여부 확인
        const dateSchedules = allSchedules.filter(schedule => schedule.date === date);

        // 회차가 없으면 예매 불가능
        if (dateSchedules.length === 0) {
            return false;
        }

        // 하나라도 예매 가능한 회차가 있으면 예매 가능
        return dateSchedules.some(schedule => schedule.hasActiveTickets);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-xl">로딩 중...</div>
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-xl">이벤트를 찾을 수 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <TopNav />

            {/* Event Content */}
            <section className="pt-10">
                {/* Event Header */}
                <div className="flex gap-8">
                    <div className="relative">
                        <img
                            src={eventData.thumbnailUrl}
                            alt={eventData.titleKr}
                            className="w-[438px] h-[526px] object-cover"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="text-left">
                            <div className="flex items-center gap-4">
                                <h1 className="text-[32px] font-semibold leading-tight">
                                    {eventData.titleKr}
                                </h1>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleLike();
                                    }}
                                    disabled={pending}
                                    aria-pressed={isLiked}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 focus:outline-none
              ${isLiked ? "bg-[#EF6156] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
              ${pending ? "opacity-70 cursor-wait" : ""}`}
                                    style={{ outline: "none", border: "none" }}
                                >
                                    <FaHeart className={`w-4 h-4 ${isLiked ? "text-white" : "text-gray-600"}`} />
                                    <span className="font-bold text-sm">{isLiked ? "관심" : "관심"}</span>
                                </button>

                            </div>
                            <p className="text-[#00000099] text-xl mt-1">
                                {eventData.titleEng}
                            </p>
                        </div>

                        <hr className="h-[3px] my-6 bg-black" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-32">
                                <div className="flex items-center">
                                    <span className="text-base text-[#00000099] font-semibold w-20">장소</span>
                                    <span className="text-base inline-block">
                                        {eventData.placeName}
                                    </span>
                                    <MapPin className="w-3 h-3 ml-1" />
                                </div>
                                {/*<div className="flex items-center">*/}
                                {/*    <span className="text-base text-[#00000099] font-semibold w-20">관람등급</span>*/}
                                {/*    <span className="text-base text-[#ff0000]">*/}
                                {/*        {eventData.ageRating}*/}
                                {/*    </span>*/}
                                {/*</div>*/}
                            </div>

                            <div className="flex items-center">
                                <span className="text-base text-[#00000099] font-semibold w-20">일정</span>
                                <span className="text-base">{eventData.startDate} ~ {eventData.endDate}</span>
                            </div>

                            <hr className="my-2 bg-gray-300" />

                            <div className="flex items-start">
                                <span className="text-base text-[#00000099] font-semibold w-20">행사 소개</span>
                                <div className="text-base" dangerouslySetInnerHTML={{ __html: eventData.bio }} />
                            </div>

                            <div className="flex items-start">
                                <span className="text-base text-[#00000099] font-semibold w-20">가격</span>
                                <div className="flex-1">
                                    {ticketPrices.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div className="space-y-1">
                                                {ticketPrices.map((ticket, index) => (
                                                    <p key={index} className="text-base">
                                                        {ticket.name}
                                                    </p>
                                                ))}
                                            </div>
                                            <div className="space-y-1 font-semibold">
                                                {ticketPrices.map((ticket, index) => (
                                                    <p key={index} className="text-base">
                                                        {ticket.price === 0 ? '무료' : `${ticket.price.toLocaleString()}원`}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-base">
                                            티켓이 등록되지 않았습니다
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleInquiry}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md shadow-sm transition-colors text-sm ml-4"
                                >
                                    담당자에게 문의하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date and Time Selection */}
                <div className="mt-16 mb-8 border border-gray-200 rounded-lg">
                    <div className="p-6">
                        <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                            날짜 및 회차 선택
                        </h3>

                        <div className="flex gap-6">
                            {/* 좌측: 달력 - 30% */}
                            <div className="w-[30%]">
                                <h4 className="text-base font-medium text-gray-900 mb-4">날짜 선택</h4>

                                {/* 달력 헤더 */}
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-medium text-gray-900">
                                        {currentCalendarYear}년 {currentCalendarMonth}월
                                    </h5>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => {
                                                if (currentCalendarMonth === 1) {
                                                    setCurrentCalendarMonth(12);
                                                    setCurrentCalendarYear(currentCalendarYear - 1);
                                                } else {
                                                    setCurrentCalendarMonth(currentCalendarMonth - 1);
                                                }
                                            }}
                                            className="p-1 hover:bg-gray-200 rounded text-xs"
                                        >
                                            ◀
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (currentCalendarMonth === 12) {
                                                    setCurrentCalendarMonth(1);
                                                    setCurrentCalendarYear(currentCalendarYear + 1);
                                                } else {
                                                    setCurrentCalendarMonth(currentCalendarMonth + 1);
                                                }
                                            }}
                                            className="p-1 hover:bg-gray-200 rounded text-xs"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                </div>

                                {/* 요일 헤더 */}
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                    {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                                        <div key={day} className={`p-1 text-xs font-medium text-center ${
                                            index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                                        }`}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* 달력 날짜 그리드 */}
                                <div className="grid grid-cols-7 gap-1">
                                    {generateCalendarDays().map((day, index) => {
                                        const isEventDate = eventDates.includes(day.dateString);
                                        const isSelected = selectedDate === day.dateString;
                                        const isCurrentMonth = day.isCurrentMonth;
                                        const isBookable = isEventDate && isDateBookable(day.dateString);

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => isEventDate ? handleDateSelect(day.dateString) : null}
                                                disabled={!isEventDate || !isCurrentMonth}
                                                className={`p-1.5 text-xs rounded transition-colors relative h-8 ${
                                                    !isCurrentMonth 
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : isSelected && isEventDate
                                                            ? 'bg-blue-600 text-white'
                                                            : isEventDate && isBookable
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                                                                : isEventDate && !isBookable
                                                                    ? 'bg-pink-100 text-pink-800 hover:bg-pink-200 cursor-pointer'
                                                                    : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {day.date}
                                                {isEventDate && isCurrentMonth && (
                                                    <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                                                        isBookable ? 'bg-green-600' : 'bg-pink-600'
                                                    }`}></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 중앙: 회차 목록 - 40% */}
                            <div className="w-[40%]">
                                <h4 className="text-base font-medium text-gray-900 mb-4">
                                    회차 선택 {selectedDate && `(${selectedDate})`}
                                </h4>

                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {availableSchedules.length > 0 ? (
                                        availableSchedules.map((schedule) => (
                                            <div
                                                key={schedule.scheduleId}
                                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    selectedScheduleId === schedule.scheduleId
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                                onClick={() => setSelectedScheduleId(schedule.scheduleId)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-[#212121]">
                                                        {schedule.startTime} - {schedule.endTime}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        판매: {schedule.soldTicketCount}매
                                                    </span>
                                                </div>
                                                <div>
                                                    {schedule.hasActiveTickets ? (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                            예매가능
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                            매진
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                            {selectedDate ? (
                                                <div>
                                                    <p className="text-sm mb-1">회차가 없습니다</p>
                                                    <p className="text-xs text-gray-400">다른 날짜를 선택해주세요</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm mb-1">날짜를 선택해주세요</p>
                                                    <p className="text-xs text-gray-400">달력에서 날짜를 클릭하세요</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 우측: 예매 가능 여부 정보 - 30% */}
                            <div className="w-[30%]">
                                <h4 className="text-base font-medium text-gray-900 mb-4">행사 일별 예매 현황</h4>

                                <div className="space-y-3">
                                    {/* 범례 */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <h5 className="text-sm font-medium text-gray-900 mb-2">상태 표시</h5>
                                        <div className="flex flex-wrap gap-4 text-xs">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-green-100 rounded border border-green-300"></div>
                                                <span>예매 가능</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-pink-100 rounded border border-pink-300"></div>
                                                <span>예매 불가능</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                                <span>선택된 날짜</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 행사 일별 예매 현황 목록 */}
                                    <div className="bg-white border rounded-lg">
                                        <div className="p-3 border-b bg-gray-50">
                                            <h5 className="text-sm font-medium text-gray-900">전체 행사일 현황</h5>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {eventDates.map((date) => {
                                                const isBookable = isDateBookable(date);
                                                const isSelected = selectedDate === date;
                                                const dateObj = new Date(date + 'T00:00:00');
                                                const dayName = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];

                                                return (
                                                    <div
                                                        key={date}
                                                        className={`flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                                                            isSelected ? 'bg-blue-50' : ''
                                                        }`}
                                                        onClick={() => handleDateSelect(date)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded ${
                                                                isSelected 
                                                                    ? 'bg-blue-600' 
                                                                    : isBookable 
                                                                        ? 'bg-green-100 border border-green-300' 
                                                                        : 'bg-pink-100 border border-pink-300'
                                                            }`}></div>
                                                            <div>
                                                                <span className="text-sm font-medium">{date}</span>
                                                                <span className="text-xs text-gray-500 ml-2">({dayName})</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isBookable ? (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                                    예매가능
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                                                    예매불가
                                                                </span>
                                                            )}
                                                            {isSelected && (
                                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                                    선택됨
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 요약 정보 */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div>
                                                <div className="text-lg font-bold text-gray-900">{eventDates.length}</div>
                                                <div className="text-xs text-gray-600">총 행사일</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-green-600">
                                                    {eventDates.filter(date => isDateBookable(date)).length}
                                                </div>
                                                <div className="text-xs text-gray-600">예매가능일</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-pink-600">
                                                    {eventDates.filter(date => !isDateBookable(date)).length}
                                                </div>
                                                <div className="text-xs text-gray-600">예매불가일</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Book Button */}
                <div className="flex justify-center mb-12">
                    <button
                        onClick={() => {
                            if (eventData.mainCategory !== "공연") {
                                // 회차가 선택되지 않았으면 경고
                                if (!selectedScheduleId) {
                                    toast.error('회차를 선택해주세요.');
                                    return;
                                }
                                // 티켓 예매 페이지로 scheduleId와 함께 이동
                                navigate(`/ticket-reservation/${eventId}?scheduleId=${selectedScheduleId}`);
                            } else {
                                // 공연의 경우 외부 예매 링크 모달
                                setIsExternalBookingOpen(true);
                            }
                        }}
                        disabled={eventData.mainCategory !== "공연" && !selectedScheduleId}
                        className={`w-[196px] h-[38px] rounded-[10px] font-bold flex items-center justify-center transition-colors ${
                            eventData.mainCategory === "공연" || selectedScheduleId
                                ? 'bg-[#ef6156] hover:bg-[#d85147] text-white cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        예매하기
                    </button>
                </div>

                {/* Event Details Tabs */}
                <div className="mb-12">
                    <nav className="h-[40px] border-b border-neutral-200 relative"
                        style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '-1px' }}>
                        <ul className="flex items-center h-full pl-0">
                            {[
                                { id: "detail", name: "상세정보" },
                                { id: "location", name: "장소정보" },
                                { id: "booking", name: "예매/취소안내" },
                                { id: "review", name: "관람평" },
                                { id: "expectation", name: "기대평" }
                            ].map((tab) => (
                                <li
                                    key={tab.id}
                                    className="h-full flex items-center px-2.5 cursor-pointer"
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span
                                        className={`
                                            relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
                                            ${activeTab === tab.id ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]' : 'font-normal text-gray-600 hover:text-black'}
                                        `}
                                    >
                                        {tab.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="pt-6 px-6">
                        {activeTab === "detail" && (
                            <>
                                <h3 className="text-lg font-semibold text-[#212121] mb-4">
                                    {eventData.mainCategory === "공연" ? "공연 소개" : "행사 소개"}
                                </h3>
                                <div className="text-base mb-4" dangerouslySetInnerHTML={{ __html: eventData.bio }} />

                                {eventData.content && (
                                    <div className="text-base mb-6"
                                        dangerouslySetInnerHTML={{ __html: eventData.content }} />
                                )}

                                {/*<div className="bg-[#e7eaff] rounded-lg mt-8 p-4">*/}
                                {/*    <h4 className="text-base font-semibold text-[#212121] mb-4">*/}
                                {/*        주요 안내사항*/}
                                {/*    </h4>*/}
                                {/*<ul className="space-y-2">*/}
                                {/*    {eventData.policy.map((notice: string, index: number) => (*/}
                                {/*        <li key={index} className="text-sm">*/}
                                {/*            • {notice}*/}
                                {/*        </li>*/}
                                {/*    ))}*/}
                                {/*</ul>*/}
                                {/*</div>*/}
                            </>
                        )}

                        {activeTab === "location" && (
                            <VenueInfo
                                placename={eventData.placeName}
                                address={eventData.address}
                                latitude={eventData.latitude}
                                longitude={eventData.longitude}
                                placeUrl={eventData.placeUrl}
                                locationDetail={eventData.locationDetail}
                            />
                        )}

                        {activeTab === "booking" && (
                            <>
                                {eventData.policy && (
                                    <div className="text-base mb-6"
                                        dangerouslySetInnerHTML={{ __html: eventData.policy }} />
                                )}
                            </>
                        )}

                        {activeTab === "review" && (
                            <Reviews
                                data={reviews}
                                currentPage={currentPage}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        )}

                        {activeTab === "expectation" && (
                            <Expectations />
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-7xl mx-auto px-8 text-center">
                    <p className="text-gray-600 mb-8">
                        간편하고 안전한 행사 관리 솔루션
                    </p>
                    <div className="flex justify-center space-x-8">
                        <a href="#" className="text-gray-600 hover:text-black text-sm">이용약관</a>
                        <a href="#" className="text-gray-600 hover:text-black text-sm">개인정보처리방침</a>
                        <a href="#" className="text-gray-600 hover:text-black text-sm">고객센터</a>
                        <a href="#" className="text-gray-600 hover:text-black text-sm">회사소개</a>
                    </div>
                </div>
            </footer>

            {/* External Booking Modal */}
            <ExternalLink
                isOpen={isExternalBookingOpen}
                onClose={() => setIsExternalBookingOpen(false)}
                title={eventData.titleKr}
                externalLinks={eventData.externalLinks}
            />
        </div>
    );
};

export default EventDetail;