import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { MapPin } from "lucide-react";
import { VenueInfo } from "./VenueInfo";
import { CancelPolicy } from "./CancelPolicy";
import { Reviews } from "./Reviews";
import { Expectations } from "./Expectations";
import ExternalLink from "./ExternalLink";

const EventDetail = (): JSX.Element => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentCalendarYear, setCurrentCalendarYear] = useState<number>(2025);
    const [currentCalendarMonth, setCurrentCalendarMonth] = useState<number>(8);
    const [selectedDate, setSelectedDate] = useState<number | null>(25); // 첫 번째 날짜로 초기 설정
    const [activeTab, setActiveTab] = useState<string>("detail");
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [isExternalBookingOpen, setIsExternalBookingOpen] = useState(false);

    // 이벤트 데이터 로드 시 달력 초기화
    useEffect(() => {
        if (eventData) {
            const eventDates = parseEventDates(eventData.schedule);
            if (eventDates) {
                setCurrentCalendarYear(eventDates.startYear);
                setCurrentCalendarMonth(eventDates.startMonth);
            }
        }
    }, [eventData]);

    // 날짜 파싱 함수
    const parseEventDates = (schedule: string) => {
        // "2025.08.25 - 2025.08.27 20:00" 형식에서 날짜 추출
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

    // 임시 이벤트 데이터 (실제로는 API에서 가져올 예정)
    const mockEventData = {
        id: "1",
        title: "포스트 말론 2025 내한 공연",
        subtitle: "POST MALONE LIVE in SEOUL 2025",
        venue: "고척스카이돔",
        ageRating: "청소년관람불가",
        schedule: "2025.08.25 - 2025.08.27 20:00",
        introduction: "전 세계가 주목한 슈퍼스타와 서울에서 만나는 기회!",
        description: [
            "포스트 말론(Post Malone)이 드디어 한국을 찾습니다. 그래미 어워드 후보에 10번 노미네이트되며 전 세계적으로 사랑받는 아티스트의 라이브 무대를 고척스카이돔에서 만나보세요.",
            "히트곡 'Circles', 'Sunflower', 'Rockstar' 등 수많은 명곡들을 라이브로 들을 수 있는 특별한 기회입니다. 포스트 말론만의 독특한 음악 스타일과 카리스마 넘치는 퍼포먼스를 직접 경험해보세요.",
        ],
        notices: [
            "본 공연은 청소년관람불가 등급입니다.",
            "공연 시작 후 입장이 제한될 수 있습니다.",
            "카메라, 캠코더 등 촬영장비 반입 금지",
            "음식물 반입 금지 (생수 제외)",
        ],
        pricingTiers: [
            { tier: "VIP석 (스탠딩 or 중앙 1층)", price: "250,000원" },
            { tier: "R석 (1층 좌석)", price: "200,000원" },
            { tier: "S석 (2층 중앙)", price: "160,000원" },
            { tier: "A석 (2~3층 측면)", price: "120,000원" },
            { tier: "B석 (고층 뒷줄)", price: "100,000원" },
        ],
        seatAvailability: [
            { type: "VIP석", status: "매진" },
            { type: "R석", status: "매진" },
            { type: "S석", status: "매진" },
            { type: "A석", status: "매진" },
            { type: "B석", status: "18 석" },
        ],
        schedules: [
            {
                round: 1,
                date: "2025.08.25 (월)",
                time: "오후 8시 00분",
                availableSeats: 156
            },
            {
                round: 2,
                date: "2025.08.26 (화)",
                time: "오후 8시 00분",
                availableSeats: 89
            },
            {
                round: 3,
                date: "2025.08.27 (수)",
                time: "오후 8시 00분",
                availableSeats: 234
            }
        ],
        image: "/images/malone.jpg",
        bookingInfo: {
            qrTicketInfo: [
                "• 예매(결제) 완료 즉시, [마이페이지 > 나의 예매/QR]에서 QR 티켓을 확인하실 수 있습니다.",
                "• QR 티켓은 문자 또는 이메일로도 발송되며, 행사 당일 입장 시 해당 QR 코드를 제시해 주세요.",
                "• 티켓 출력 없이 스마트폰만으로 입장 가능합니다."
            ],
            entryMethod: [
                "• 행사 당일, 입장 게이트에서 QR 코드를 스캔하여 입장하실 수 있습니다.",
                "• 원활한 입장을 위해 공연 시작 30분 전까지 도착해주시기 바랍니다.",
                "• 네트워크 상황에 따라 QR 코드 로딩이 지연될 수 있으니, 미리 티켓을 캡처 또는 저장해두시는 것을 권장합니다."
            ],
            cancellationFees: [
                "• 예매 후 7일 이내: 무료 취소",
                "• 예매 후 8일~공연 10일 전: 티켓금액의 10%",
                "• 공연 9일 전~7일 전: 티켓금액의 20%",
                "• 공연 6일 전~3일 전: 티켓금액의 30%",
                "• 공연 2일 전~당일: 취소 불가"
            ],
            refundMethod: [
                "• 온라인 취소: 예매 사이트에서 직접 취소",
                "• 전화 취소: 예매처 고객센터 연락",
                "• 환불 기간: 취소 신청 후 3~5 영업일"
            ],
            importantNotices: [
                "• 티켓 분실 시 재발급이 불가능하니 주의하시기 바랍니다.",
                "• 공연 일정 및 출연진은 주최측 사정에 의해 변경될 수 있습니다."
            ]
        }
    };

    // 이벤트 데이터 로드 (실제로는 API 호출)
    useEffect(() => {
        const loadEventData = async () => {
            try {
                setLoading(true);
                // 실제로는 API 호출: const data = await eventApi.getEventById(eventId);
                // 지금은 임시 데이터 사용
                setTimeout(() => {
                    setEventData(mockEventData);
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
                            src={eventData.image}
                            alt={eventData.title}
                            className="w-[438px] h-[526px] object-cover"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="text-left">
                            <h1 className="text-[32px] font-semibold leading-tight">
                                {eventData.title}
                            </h1>
                            <p className="text-[#00000099] text-xl mt-1">
                                {eventData.subtitle}
                            </p>
                        </div>

                        <hr className="h-[3px] my-6 bg-black" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-32">
                                <div className="flex items-center">
                                    <span className="text-base text-[#00000099] font-semibold w-20">장소</span>
                                    <span className="text-base inline-block">
                                        {eventData.venue}
                                    </span>
                                    <MapPin className="w-3 h-3 ml-1" />
                                </div>
                                <div className="flex items-center">
                                    <span className="text-base text-[#00000099] font-semibold w-20">관람등급</span>
                                    <span className="text-base text-[#ff0000]">
                                        {eventData.ageRating}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <span className="text-base text-[#00000099] font-semibold w-20">일정</span>
                                <span className="text-base">{eventData.schedule}</span>
                            </div>

                            <hr className="my-2 bg-gray-300" />

                            <div className="flex items-start">
                                <span className="text-base text-[#00000099] font-semibold w-20">행사 소개</span>
                                <span className="text-base">{eventData.introduction}</span>
                            </div>

                            <div className="flex items-start">
                                <span className="text-base text-[#00000099] font-semibold w-20">가격</span>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <div className="space-y-1">
                                        {eventData.pricingTiers.map((tier: any, index: number) => (
                                            <p key={index} className="text-base">
                                                {tier.tier}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="space-y-1 font-semibold">
                                        {eventData.pricingTiers.map((tier: any, index: number) => (
                                            <p key={index} className="text-base">
                                                {tier.price}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date and Time Selection */}
                <div className="mt-16 mb-8 border border-gray-200 rounded-lg">
                    <div className="p-0 flex">
                        {/* Date Selection */}
                        <div className="flex-1 p-6 border-r">
                            <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                                날짜 선택
                            </h3>
                            {eventData && (() => {
                                const eventDates = parseEventDates(eventData.schedule);
                                if (eventDates) {
                                    const calendar = generateCalendar(currentCalendarYear, currentCalendarMonth);

                                    // 이벤트 날짜들 생성 (시작일부터 종료일까지)
                                    const eventDays: number[] = [];
                                    const startDate = new Date(eventDates.startYear, eventDates.startMonth - 1, eventDates.startDay);
                                    const endDate = new Date(eventDates.endYear, eventDates.endMonth - 1, eventDates.endDay);

                                    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                                        // 현재 표시되는 월의 날짜만 추가
                                        if (d.getFullYear() === currentCalendarYear && d.getMonth() === currentCalendarMonth - 1) {
                                            eventDays.push(d.getDate());
                                        }
                                    }

                                    return (
                                        <div>
                                            <div className="flex items-center justify-center mb-4">
                                                <button
                                                    onClick={handlePrevMonth}
                                                    className="p-1 hover:bg-gray-100 rounded mr-2"
                                                >
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <span className="text-center">
                                                    {currentCalendarYear}년 {currentCalendarMonth}월
                                                </span>
                                                <button
                                                    onClick={handleNextMonth}
                                                    className="p-1 hover:bg-gray-100 rounded ml-2"
                                                >
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-7 gap-1 mb-2">
                                                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                                                    <div key={day} className={`text-center text-xs font-medium py-1 ${day === "일" ? "text-red-500" :
                                                        day === "토" ? "text-blue-500" :
                                                            "text-gray-600"
                                                        }`}>
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7 gap-1">
                                                {calendar.map((date, index) => {
                                                    // 현재 날짜의 요일 계산
                                                    const currentDate = new Date(currentCalendarYear, currentCalendarMonth - 1, date.day);
                                                    const dayOfWeek = currentDate.getDay(); // 0=일요일, 6=토요일
                                                    const isEventDay = eventDays.includes(date.day);
                                                    const isSelected = selectedDate === date.day;

                                                    let textColor = "text-gray-400"; // 기본 회색
                                                    let fontWeight = "font-normal";
                                                    let bgColor = "";

                                                    if (date.isCurrentMonth && isEventDay) {
                                                        // 행사일인 경우 요일에 따라 색상 결정
                                                        fontWeight = "font-bold";
                                                        if (isSelected) {
                                                            // 선택된 날짜
                                                            textColor = "text-white";
                                                            bgColor = "bg-black rounded-full";
                                                        } else {
                                                            // 선택되지 않은 행사일
                                                            if (dayOfWeek === 0) { // 일요일
                                                                textColor = "text-red-500";
                                                            } else if (dayOfWeek === 6) { // 토요일
                                                                textColor = "text-blue-500";
                                                            } else { // 평일
                                                                textColor = "text-gray-900";
                                                            }
                                                        }
                                                    } else if (date.isCurrentMonth && !isEventDay) {
                                                        // 행사가 아닌 현재 월 날짜
                                                        textColor = "text-gray-400";
                                                        fontWeight = "font-normal";
                                                    }

                                                    return (
                                                        <div
                                                            key={index}
                                                            onClick={() => {
                                                                if (date.isCurrentMonth && isEventDay) {
                                                                    setSelectedDate(date.day);
                                                                    setSelectedSchedule(null); // 날짜 변경 시 선택된 회차 초기화
                                                                }
                                                            }}
                                                            className={`text-center text-xs py-1 cursor-pointer hover:bg-gray-100 ${textColor} ${fontWeight} ${bgColor}`}
                                                        >
                                                            {date.day}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="text-center text-sm text-gray-600">
                                        날짜 정보를 불러올 수 없습니다.
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Time Selection */}
                        <div className="flex-1 p-6">
                            <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                                시간 선택
                            </h3>
                            <div className="space-y-3">
                                {eventData.schedules?.filter((schedule: any) => {
                                    // 선택된 날짜와 일치하는 회차만 필터링
                                    const scheduleDate = schedule.date.split(' ')[0]; // "2025.08.25" 부분만 추출
                                    const selectedDateStr = `${currentCalendarYear}.${String(currentCalendarMonth).padStart(2, '0')}.${String(selectedDate).padStart(2, '0')}`;
                                    return scheduleDate === selectedDateStr;
                                }).map((schedule: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedSchedule === schedule
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setSelectedSchedule(schedule)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-600">
                                                {index + 1}회차
                                            </span>
                                            <span className="text-base font-semibold text-[#212121]">
                                                {schedule.time}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Seat Availability */}
                        <div className="w-[361px] bg-[#e7eaff] rounded-r-[10px]">
                            <div className="p-6">
                                <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                                    예매 가능한 좌석
                                </h3>
                                <div className="space-y-4">
                                    {selectedSchedule ? (
                                        // 선택된 회차가 있을 때 해당 회차의 좌석 정보 표시
                                        <div className="space-y-3">
                                            {eventData.seatAvailability.map((seat: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span className="text-base font-semibold text-[#00000080]">
                                                        {seat.type}
                                                    </span>
                                                    <span className="text-base font-semibold text-right">
                                                        {seat.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // 선택된 회차가 없을 때 안내 메시지
                                        <div className="text-center text-gray-500 py-8">
                                            시간을 선택해주세요
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Book Button */}
                <div className="flex justify-center mb-12">
                    <button
                        onClick={() => setIsExternalBookingOpen(true)}
                        disabled={!selectedDate || !selectedSchedule}
                        className={`w-[196px] h-[38px] rounded-[10px] font-bold flex items-center justify-center transition-colors ${selectedDate && selectedSchedule
                            ? 'bg-[#ef6156] hover:bg-[#d85147] text-white cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        예매하기
                    </button>
                </div>

                {/* Event Details Tabs */}
                <div className="mb-12">
                    <nav className="h-[40px] border-b border-neutral-200 relative" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '-1px' }}>
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
                                    공연 소개
                                </h3>
                                <p className="text-base mb-4">{eventData.introduction}</p>

                                {eventData.description.map((paragraph: string, index: number) => (
                                    <p key={index} className="text-base mb-6">
                                        {paragraph}
                                    </p>
                                ))}

                                <div className="bg-[#e7eaff] rounded-lg mt-8 p-4">
                                    <h4 className="text-base font-semibold text-[#212121] mb-4">
                                        주요 안내사항
                                    </h4>
                                    <ul className="space-y-2">
                                        {eventData.notices.map((notice: string, index: number) => (
                                            <li key={index} className="text-sm">
                                                • {notice}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}

                        {activeTab === "location" && (
                            <VenueInfo />
                        )}

                        {activeTab === "booking" && (
                            <CancelPolicy bookingInfo={eventData.bookingInfo} />
                        )}

                        {activeTab === "review" && (
                            <Reviews />
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
            />
        </div>
    );
};

export default EventDetail; 