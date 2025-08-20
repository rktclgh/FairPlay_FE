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
import { ParticipatingBooths } from "./ParticipatingBooths";
import ExternalLink from "./ExternalLink";
import { eventAPI } from "../../services/event";
import type { EventDetailResponseDto } from "../../services/types/eventType";
import { getEventStatusText, getEventStatusStyle } from "../../utils/eventStatus";
import api from "../../api/axios";
import { openChatRoomGlobal } from "../../components/chat/ChatFloatingModal";
import type {
    PageableRequest,
    ReviewForEventResponseDto
} from "../../services/types/reviewType";
import {
    getReviewsByEvent
} from "../../services/review";
type WishlistResponseDto = { eventId: number };

import authManager from "../../utils/auth";
import { toast } from 'react-toastify';
import NewLoader from "../../components/NewLoader";

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
    const [ticketPrices, setTicketPrices] = useState<{ name: string, price: number }[]>([]); // 티켓 가격 목록
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

    // 페이지 로드 시 스크롤을 맨 위로 이동
    React.useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, []); // 컴포넌트 마운트 시 한 번만 실행

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

    // 이벤트 데이터 로드 (실제로는 API 호출)
    useEffect(() => {
        const loadEventData = async () => {
            try {
                setLoading(true);
                // 이벤트 상세 정보 로드
                const data = await eventAPI.getEventDetail(Number(eventId));

                const params: PageableRequest = {
                    page: currentPage,
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
            const response = await api.get(`/api/events/${eventId}/schedule`);

            const scheduleList = response.data;
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

            const response = await api.get(`/api/events/${eventId}/tickets`);
            const ticketList = response.data;
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

        // 전체행사현황에서 해당 날짜로 자동 스크롤
        setTimeout(() => {
            const selectedDateElement = document.querySelector(`[data-date="${date}"]`);
            if (selectedDateElement) {
                const container = selectedDateElement.closest('.max-h-60');
                if (container) {
                    selectedDateElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }
        }, 100);
    };

    // 회차 선택 핸들러
    const handleScheduleSelect = (scheduleId: number) => {
        setSelectedScheduleId(scheduleId);

        // 선택된 날짜가 있으면 해당 날짜로 자동 스크롤
        if (selectedDate) {
            setTimeout(() => {
                const selectedDateElement = document.querySelector(`[data-date="${selectedDate}"]`);
                if (selectedDateElement) {
                    const container = selectedDateElement.closest('.max-h-60');
                    if (container) {
                        selectedDateElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });
                    }
                }
            }, 100);
        }
    };

    // 선택된 회차 정보 가져오기
    const getSelectedSchedule = () => {
        return availableSchedules.find(schedule => schedule.scheduleId === selectedScheduleId);
    };

    // 현재 날짜(오늘) 가져오기
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 날짜가 오늘 이후인지 확인 (오늘 포함)
    const isDateInFuture = (date: string) => {
        const todayString = getTodayDateString();
        return date >= todayString;
    };

    // 특정 날짜의 예매 가능 여부 확인
    const isDateBookable = (date: string) => {
        // 오늘 이전 날짜는 예매 불가
        if (!isDateInFuture(date)) {
            return false;
        }

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
                <NewLoader />
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
        <div className="min-h-screen bg-white pb-8 md:pb-0">
            <TopNav />

            {/* Event Content */}
            <section className="pt-6 md:pt-10 px-4 md:px-0">
                {/* Event Header */}
                <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
                    <div className="relative w-full lg:w-auto">
                        <img
                            src={eventData.thumbnailUrl}
                            alt={eventData.titleKr}
                            className="w-full max-w-[438px] h-auto max-h-[526px] object-cover mx-auto lg:mx-0"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="text-left">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                <h1 className="text-2xl md:text-[32px] font-semibold leading-tight">
                                    {eventData.titleKr}
                                </h1>
                                {eventData.eventStatusCode && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventStatusStyle(eventData.eventStatusCode)}`}>
                                        {getEventStatusText(eventData.eventStatusCode)}
                                    </span>
                                )}
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
                            <p className="text-    [#00000099] text-xl mt-1">
                                {eventData.titleEng}
                            </p>
                            {/* 카테고리 정보 */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 text-sm font-medium rounded border ${eventData.mainCategory === "박람회" ? "bg-blue-100 text-blue-800 border-blue-200" :
                                    eventData.mainCategory === "공연" ? "bg-red-100 text-red-800 border-red-200" :
                                        eventData.mainCategory === "강연/세미나" ? "bg-green-100 text-green-800 border-green-200" :
                                            eventData.mainCategory === "전시/행사" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                                eventData.mainCategory === "축제" ? "bg-gray-100 text-gray-800 border-gray-300" :
                                                    "bg-gray-100 text-gray-700 border-gray-200"
                                    }`}>
                                    {eventData.mainCategory}
                                </span>
                                {eventData.subCategory && (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded border border-gray-200">
                                        {eventData.subCategory}
                                    </span>
                                )}
                            </div>
                        </div>

                        <hr className="h-[3px] my-6 bg-black" />

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-32">
                                <div className="flex items-center gap-4">
                                    <span className="text-base text-[#00000099] font-semibold w-20 flex-shrink-0">장소</span>
                                    <span className="text-base inline-block break-words">
                                        {eventData.placeName}
                                    </span>
                                    <MapPin className="w-3 h-3 ml-1 flex-shrink-0" />
                                </div>
                                {/*<div className="flex items-center">*/}
                                {/*    <span className="text-base text-[#00000099] font-semibold w-20">관람등급</span>*/}
                                {/*    <span className="text-base text-[#ff0000]">*/}
                                {/*        {eventData.ageRating}*/}
                                {/*    </span>*/}
                                {/*</div>*/}
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-base text-[#00000099] font-semibold w-20 flex-shrink-0">일정</span>
                                <span className="text-base break-words">{eventData.startDate} ~ {eventData.endDate}</span>
                            </div>

                            <hr className="my-2 bg-gray-300" />

                            <div className="flex items-start gap-4">
                                <span className="text-base text-[#00000099] font-semibold w-20 flex-shrink-0">소개</span>
                                <div className="flex-1 text-base break-words" dangerouslySetInnerHTML={{ __html: eventData.bio }} />
                            </div>

                            <div className="flex flex-col lg:flex-row items-start gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <span className="text-base text-[#00000099] font-semibold w-20 flex-shrink-0">가격</span>
                                    <div className="flex-1">
                                        {ticketPrices.length > 0 ? (
                                            <div className="space-y-2">
                                                {ticketPrices.map((ticket, index) => (
                                                    <div key={index} className="flex items-center gap-4">
                                                        <span className="text-base min-w-[60px]">{ticket.name}</span>
                                                        <span className="text-base font-semibold">
                                                            {ticket.price === 0 ? '무료' : `${ticket.price.toLocaleString()}원`}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-base">
                                                티켓이 등록되지 않았습니다
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleInquiry}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md shadow-sm transition-colors text-sm w-full lg:w-auto lg:ml-4"
                                >
                                    담당자에게 문의하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date and Time Selection */}
                <div className="mt-16 mb-8 border border-gray-200 rounded-lg">
                    <div className="p-4 md:p-6">
                        <h3 className="text-lg md:text-[20.3px] font-semibold text-[#212121] mb-4 md:mb-6">
                            날짜 및 회차 선택
                        </h3>

                        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                            {/* 좌측: 달력 - 모바일에서는 전체 너비, 데스크톱에서는 30% */}
                            <div className="w-full lg:w-[30%]">
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
                                            className="p-2 hover:bg-gray-200 rounded text-xs"
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
                                            className="p-2 hover:bg-gray-200 rounded text-xs"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                </div>

                                {/* 요일 헤더 */}
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                    {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                                        <div key={day} className={`p-1 text-xs font-medium text-center ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
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
                                        const isPastDate = isEventDate && !isDateInFuture(day.dateString);

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => (isEventDate && !isPastDate) ? handleDateSelect(day.dateString) : null}
                                                disabled={!isEventDate || !isCurrentMonth || isPastDate}
                                                className={`p-2 md:p-1.5 text-xs rounded transition-colors relative h-10 md:h-8 ${!isCurrentMonth
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : isPastDate
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
                                                    <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isPastDate
                                                        ? 'bg-gray-400'
                                                        : isBookable
                                                            ? 'bg-green-600'
                                                            : 'bg-pink-600'
                                                        }`}></div>
                                                )}
                                                {isPastDate && isEventDate && isCurrentMonth && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-4 h-0.5 bg-gray-400 rotate-45 absolute"></div>
                                                        <div className="w-4 h-0.5 bg-gray-400 -rotate-45 absolute"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 중앙: 회차 목록 - 모바일에서는 전체 너비, 데스크톱에서는 40% */}
                            <div className="w-full lg:w-[40%]">
                                <h4 className="text-base font-medium text-gray-900 mb-4">
                                    회차 선택 {selectedDate && `(${selectedDate})`}
                                </h4>

                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {availableSchedules.length > 0 ? (
                                        availableSchedules.map((schedule) => (
                                            <div
                                                key={schedule.scheduleId}
                                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedScheduleId === schedule.scheduleId
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setSelectedScheduleId(schedule.scheduleId)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-[#212121]">
                                                        {schedule.startTime} - {schedule.endTime}
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

                            {/* 우측: 예매 가능 여부 정보 - 모바일에서는 전체 너비, 데스크톱에서는 30% */}
                            <div className="w-full lg:w-[30%]">
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
                                                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                                                <span>지난 날짜</span>
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
                                        <div
                                            className="max-h-60 overflow-y-auto custom-scrollbar"
                                        >
                                            {eventDates.map((date) => {
                                                const isBookable = isDateBookable(date);
                                                const isSelected = selectedDate === date;
                                                const isPastDate = !isDateInFuture(date);
                                                const dateObj = new Date(date + 'T00:00:00');
                                                const dayName = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];

                                                // 선택된 날짜의 경우 해당 회차 정보 가져오기
                                                const schedulesForDate = isSelected ? availableSchedules : [];

                                                return (
                                                    <div
                                                        key={date}
                                                        data-date={date}
                                                        className={`flex items-center justify-between p-3 ${isPastDate
                                                            ? 'cursor-not-allowed opacity-60 border-b'
                                                            : isSelected
                                                                ? 'cursor-pointer bg-blue-50 border-2 border-blue-500 rounded'
                                                                : 'cursor-pointer hover:bg-gray-50 border-b'
                                                            } ${!isPastDate && !isSelected ? 'last:border-b-0' : ''}`}
                                                        onClick={() => !isPastDate ? handleDateSelect(date) : null}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded ${isPastDate
                                                                ? 'bg-gray-300'
                                                                : isSelected
                                                                    ? 'bg-blue-600'
                                                                    : isBookable
                                                                        ? 'bg-green-100 border border-green-300'
                                                                        : 'bg-pink-100 border border-pink-300'
                                                                }`}></div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center">
                                                                    <span className={`text-sm font-medium ${isPastDate ? 'text-gray-400' : ''}`}>
                                                                        {date}
                                                                    </span>
                                                                    <span className={`text-xs ml-2 ${isPastDate ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        ({dayName})
                                                                    </span>
                                                                    {isPastDate && (
                                                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-2">
                                                                            지난 날짜
                                                                        </span>
                                                                    )}
                                                                </div>


                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isPastDate ? (
                                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                                                    예매 불가
                                                                </span>
                                                            ) : isBookable ? (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                                    예매가능
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                                                    예매불가
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
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
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
                <div className="flex justify-center mb-8 md:mb-12 px-4 md:px-0">
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
                        className={`w-full max-w-[196px] h-[38px] rounded-[10px] font-bold flex items-center justify-center transition-colors ${eventData.mainCategory === "공연" || selectedScheduleId
                            ? 'bg-[#ef6156] hover:bg-[#d85147] text-white cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        예매하기
                    </button>
                </div>

                {/* Event Details Tabs */}
                <div className="mb-12">
                    <nav className="h-[40px] border-b border-neutral-200 relative overflow-x-auto scrollbar-hide"
                        style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '-1px' }}>
                        <ul className="flex items-center h-full pl-0 min-w-max">
                            {[
                                { id: "detail", name: "상세정보" },
                                { id: "location", name: "장소정보" },
                                { id: "booking", name: "예매/취소안내" },
                                { id: "review", name: "관람평" },
                                { id: "expectation", name: "기대평" },
                                ...(eventData.mainCategory !== "공연" ? [{ id: "booths", name: "참가부스" }] : [])
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

                    <div className="pt-4 md:pt-6 px-4 md:px-6">
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

                        {activeTab === "booths" && (
                            <div data-tab-content="booths">
                                <ParticipatingBooths eventId={eventId} />
                            </div>
                        )}
                    </div>
                </div>
            </section>



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