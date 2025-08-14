import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
    const [selectedDate, setSelectedDate] = useState<number | null>(26); // 첫 번째 날짜로 초기 설정
    const [activeTab, setActiveTab] = useState<string>("detail");
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
                // 실제로는 API 호출: const data = await eventApi.getEventById(eventId);
                // 지금은 임시 데이터 사용
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
            } catch (error) {
                console.error('이벤트 데이터 로드 실패:', error);
                setLoading(false);
            }
        };

        if (eventId) {
            loadEventData();
        }
    }, [eventId]);

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
                                <div className="grid grid-cols-2 gap-x-4">
                                    {/* TODO: 티켓 및 회차 연결 */}
                                    <p>티켓 및 회차 연결</p>
                                    {/*<div className="space-y-1">*/}
                                    {/*    {eventData.pricingTiers.map((tier: any, index: number) => (*/}
                                    {/*        <p key={index} className="text-base">*/}
                                    {/*            {tier.tier}*/}
                                    {/*        </p>*/}
                                    {/*    ))}*/}
                                    {/*</div>*/}
                                    {/*<div className="space-y-1 font-semibold">*/}
                                    {/*    {eventData.pricingTiers.map((tier: any, index: number) => (*/}
                                    {/*        <p key={index} className="text-base">*/}
                                    {/*            {tier.price}*/}
                                    {/*        </p>*/}
                                    {/*    ))}*/}
                                    {/*</div>*/}
                                </div>
                                <button
                                    onClick={handleInquiry}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md shadow-sm transition-colors text-sm"
                                >
                                    담당자에게 문의하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date and Time Selection */}
                <div className="mt-16 mb-8 border border-gray-200 rounded-lg">
                    <div className="p-0 flex">
                        <div className="flex-1 p-6">
                            <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                                날짜 선택
                            </h3>
                            <p>회차 연결</p>
                            {/*    <div className="space-y-3">*/}
                            {/*        {eventData.schedules?.filter((schedule: any) => {*/}
                            {/*            // 선택된 날짜와 일치하는 회차만 필터링*/}
                            {/*            const scheduleDate = schedule.date.split(' ')[0]; // "2025.07.26" 부분만 추출*/}
                            {/*            const selectedDateStr = `${currentCalendarYear}.${String(currentCalendarMonth).padStart(2, '0')}.${String(selectedDate).padStart(2, '0')}`;*/}
                            {/*            return scheduleDate === selectedDateStr;*/}
                            {/*        }).map((schedule: any, index: number) => (*/}
                            {/*            <div*/}
                            {/*                key={index}*/}
                            {/*                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedSchedule === schedule*/}
                            {/*                    ? 'border-blue-500 bg-blue-50'*/}
                            {/*                    : 'border-gray-200 hover:bg-gray-50'*/}
                            {/*                    }`}*/}
                            {/*                onClick={() => setSelectedSchedule(schedule)}*/}
                            {/*            >*/}
                            {/*                <div className="flex items-center gap-3">*/}
                            {/*                    <span className="text-sm font-medium text-gray-600">*/}
                            {/*                        {index + 1}회차*/}
                            {/*                    </span>*/}
                            {/*                    <span className="text-base font-semibold text-[#212121]">*/}
                            {/*                        {schedule.time}*/}
                            {/*                    </span>*/}
                            {/*                </div>*/}
                            {/*            </div>*/}
                            {/*        ))}*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            {/*/!* Seat Availability *!/*/}
                            {/*<div className="w-[361px] bg-[#e7eaff] rounded-r-[10px]">*/}
                            {/*    <div className="p-6">*/}
                            {/*        <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">*/}
                            {/*            예매 가능한 좌석*/}
                            {/*        </h3>*/}
                            {/*        <div className="space-y-4">*/}
                            {/*            {selectedSchedule ? (*/}
                            {/*                // 선택된 회차가 있을 때 해당 회차의 좌석 정보 표시*/}
                            {/*                <div className="space-y-3">*/}
                            {/*                    {eventData.seatAvailability.map((seat: any, index: number) => (*/}
                            {/*                        <div*/}
                            {/*                            key={index}*/}
                            {/*                            className="flex justify-between items-center"*/}
                            {/*                        >*/}
                            {/*                            <span className="text-base font-semibold text-[#00000080]">*/}
                            {/*                                {seat.type}*/}
                            {/*                            </span>*/}
                            {/*                            <span className="text-base font-semibold text-right">*/}
                            {/*                                {seat.status}*/}
                            {/*                            </span>*/}
                            {/*                        </div>*/}
                            {/*                    ))}*/}
                            {/*                </div>*/}
                            {/*            ) : (*/}
                            {/*                // 선택된 회차가 없을 때 안내 메시지*/}
                            {/*                <div className="text-center text-gray-500 py-8">*/}
                            {/*                    시간을 선택해주세요*/}
                            {/*                </div>*/}
                            {/*            )}*/}
                            {/*        </div>*/}
                        </div>
                    </div>
                </div>

                {/* Book Button */}
                <div className="flex justify-center mb-12">
                    <button
                        onClick={() => {
                            if (eventData.mainCategory !== "공연") {
                                // 콘서트가 아닌 경우 BookingPage로 이동
                                navigate(`/booking/${eventId}`);
                            } else {
                                // 공연의 경우 외부 예매 링크 모달
                                setIsExternalBookingOpen(true);
                            }
                        }}
                    // disabled={!selectedDate || !selectedSchedule}
                    // className={`w-[196px] h-[38px] rounded-[10px] font-bold flex items-center justify-center transition-colors ${selectedDate && selectedSchedule
                    //     ? 'bg-[#ef6156] hover:bg-[#d85147] text-white cursor-pointer'
                    //     : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    //     }`}
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