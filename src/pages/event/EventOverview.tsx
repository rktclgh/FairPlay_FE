import {
    Calendar,
    ChevronDown,
    List,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { FaChevronDown } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi";
import { FaHeart } from "react-icons/fa";

export default function EventOverview() {
    const [selectedCategory, setSelectedCategory] = React.useState("all");
    const [selectedSubCategory, setSelectedSubCategory] = React.useState("카테고리");
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState("list"); // "list" or "calendar"
    const [selectedRegion, setSelectedRegion] = React.useState("모든지역");
    const [isRegionDropdownOpen, setIsRegionDropdownOpen] = React.useState(false);
    const [likedEvents, setLikedEvents] = React.useState<Set<number>>(() => {
        try {
            // localStorage에서 좋아요 상태 불러오기
            const saved = localStorage.getItem('likedEvents');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (error) {
            console.error('localStorage 읽기 오류:', error);
            return new Set();
        }
    });
    const [selectedDateRange, setSelectedDateRange] = React.useState(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        if (currentMonth === 12) {
            return `${currentYear}년 ${currentMonth}월 ~ ${nextYear}년 ${nextMonth}월`;
        } else {
            return `${currentYear}년 ${currentMonth}월 ~ ${nextMonth}월`;
        }
    });
    const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState(new Date(2025, 6, 1)); // 2025년 7월
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [endDate, setEndDate] = React.useState<Date | null>(null);
    const [selectedYear, setSelectedYear] = React.useState(2025);
    const [calendarYear, setCalendarYear] = React.useState(new Date().getFullYear());
    const [calendarMonth, setCalendarMonth] = React.useState(new Date().getMonth() + 1);
    const navigate = useNavigate();

    // 좋아요 토글 함수
    const toggleLike = (eventId: number) => {
        setLikedEvents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    };

    // 좋아요 상태가 변경될 때마다 localStorage에 저장
    React.useEffect(() => {
        try {
            localStorage.setItem('likedEvents', JSON.stringify(Array.from(likedEvents)));
        } catch (error) {
            console.error('localStorage 저장 오류:', error);
        }
    }, [likedEvents]);

    // 달력 네비게이션 함수들
    const handlePrevMonth = () => {
        if (calendarMonth === 1) {
            setCalendarYear(calendarYear - 1);
            setCalendarMonth(12);
        } else {
            setCalendarMonth(calendarMonth - 1);
        }

        // 캘린더형일 때 상단 날짜 범위도 동기화
        if (viewMode === "calendar") {
            const newYear = calendarMonth === 1 ? calendarYear - 1 : calendarYear;
            const newMonth = calendarMonth === 1 ? 12 : calendarMonth - 1;

            setSelectedDateRange(`${newYear}년 ${newMonth}월`);
        }
    };

    const handleNextMonth = () => {
        if (calendarMonth === 12) {
            setCalendarYear(calendarYear + 1);
            setCalendarMonth(1);
        } else {
            setCalendarMonth(calendarMonth + 1);
        }

        // 캘린더형일 때 상단 날짜 범위도 동기화
        if (viewMode === "calendar") {
            const newYear = calendarMonth === 12 ? calendarYear + 1 : calendarYear;
            const newMonth = calendarMonth === 12 ? 1 : calendarMonth + 1;

            setSelectedDateRange(`${newYear}년 ${newMonth}월`);
        }
    };

    // 카테고리별 색상 정의
    const categoryColors = {
        "박람회": "bg-blue-100 text-blue-800 border border-blue-200",
        "공연": "bg-red-100 text-red-800 border border-red-200",
        "강연/세미나": "bg-green-100 text-green-800 border border-green-200",
        "전시/행사": "bg-yellow-100 text-yellow-800 border border-yellow-200",
        "축제": "bg-gray-100 text-gray-800 border border-gray-300"
    };

    // Event data for mapping
    const categories = [
        { id: "all", name: "전체" },
        { id: "exhibition", name: "박람회" },
        { id: "performance", name: "공연" },
        { id: "seminar", name: "강연/세미나" },
        { id: "event", name: "전시/행사" },
        { id: "festival", name: "축제" },
    ];

    // 2차 카테고리 데이터
    const subCategories = {
        exhibition: [
            "취업/채용", "산업/기술", "유학/이민/해외 취업", "프랜차이즈/창업",
            "뷰티/패션", "식품/음료", "반려동물", "교육/도서", "IT/전자", "스포츠/레저"
        ],
        seminar: [
            "취업/진로", "창업/스타트업", "과학/기술", "자기계발/라이프스타일",
            "인문/문화/예술", "건강/의학"
        ],
        event: [
            "미술/디자인", "사진/영상", "공예/수공예", "패션/주얼리", "역사/문화",
            "체험 전시", "아동/가족", "행사/축제", "브랜드 프로모션"
        ],
        performance: [
            "콘서트", "연극/뮤지컬", "클래식/무용", "아동/가족"
        ],
        festival: [
            "음악 축제", "영화 축제", "문화 축제", "음식 축제", "전통 축제"
        ]
    };

    const events = [
        {
            id: 1,
            title: "2025 AI & 로봇 박람회",
            category: "박람회",
            date: "2025-08-15 ~ 2025-08-17",
            location: "코엑스 A홀",
            price: "15,000원 ~",
            image: "",
        },
        {
            id: 2,
            title: "서울 국제 도서전",
            category: "박람회",
            date: "2025-08-22 ~ 2025-08-25",
            location: "코엑스 B홀",
            price: "무료",
            image: "",
        },
        {
            id: 3,
            title: "BTS 월드투어 서울",
            category: "공연",
            date: "2025-08-28 ~ 2025-08-30",
            location: "올림픽공원",
            price: "120,000원 ~",
            image: "",
        },
        {
            id: 4,
            title: "블랙핑크 월드투어",
            category: "공연",
            date: "2025-09-01 ~ 2025-09-03",
            location: "고척스카이돔",
            price: "150,000원 ~",
            image: "",
        },
        {
            id: 5,
            title: "스타트업 투자 세미나",
            category: "강연/세미나",
            date: "2025-08-15",
            location: "강남구 컨벤션센터",
            price: "무료",
            image: "",
        },
        {
            id: 6,
            title: "AI 기술 컨퍼런스",
            category: "강연/세미나",
            date: "2025-09-10",
            location: "삼성동 코엑스",
            price: "80,000원 ~",
            image: "",
        },
        {
            id: 7,
            title: "현대미술 특별전",
            category: "전시/행사",
            date: "2025-09-05 ~ 2025-09-30",
            location: "국립현대미술관",
            price: "12,000원 ~",
            image: "",
        },
        {
            id: 8,
            title: "디자인 페어 서울",
            category: "전시/행사",
            date: "2025-09-10 ~ 2025-09-15",
            location: "예술의전당",
            price: "25,000원 ~",
            image: "",
        },
        {
            id: 9,
            title: "서울 국제 영화제",
            category: "축제",
            date: "2025-09-05 ~ 2025-09-15",
            location: "여의도 한강공원",
            price: "무료",
            image: "",
        },
        {
            id: 10,
            title: "서울 라이트 페스티벌",
            category: "축제",
            date: "2025-09-20 ~ 2025-09-25",
            location: "남산타워",
            price: "무료",
            image: "",
        },
    ];

    // 날짜 범위 필터링 함수
    const isEventInDateRange = (eventDate: string) => {
        if (!startDate || !endDate) return true; // 날짜 범위가 설정되지 않았으면 모든 이벤트 표시

        // 이벤트 날짜 파싱 (예: "2025-08-15 ~ 2025-08-17" 또는 "2025-08-15")
        const dateParts = eventDate.split(' ~ ');
        const eventStartDate = new Date(dateParts[0]);
        const eventEndDate = dateParts.length > 1 ? new Date(dateParts[1]) : eventStartDate;

        // 선택된 범위와 이벤트 날짜가 겹치는지 확인
        return eventStartDate <= endDate && eventEndDate >= startDate;
    };

    // 카테고리별 이벤트 필터링 함수
    const filteredEvents = events.filter(event => {
        // 카테고리 필터링
        const categoryMatch = selectedCategory === "all" ||
            event.category === categories.find(cat => cat.id === selectedCategory)?.name;

        // 날짜 범위 필터링 (리스트형에서만 적용)
        const dateMatch = viewMode === "list" ? isEventInDateRange(event.date) : true;

        return categoryMatch && dateMatch;
    });

    const footerLinks = [
        { name: "이용약관", href: "#" },
        { name: "개인정보처리방침", href: "#" },
        { name: "고객센터", href: "#" },
        { name: "회사소개", href: "#" },
    ];

    return (
        <div className="min-h-screen bg-white">
            <TopNav />

            <div className="flex justify-center w-full bg-white">
                <div className="w-full max-w-[1256px] relative">
                    {/* Category Navigation */}
                    <nav className="h-[40px] border-b border-neutral-200 relative mt-4" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '-1px' }}>
                        <ul className="flex items-center h-full">
                            {categories.map((category) => (
                                <li
                                    key={category.id}
                                    className="h-full flex items-center px-2.5 cursor-pointer"
                                    onClick={() => {
                                        setSelectedCategory(category.id);
                                        setSelectedSubCategory("카테고리"); // 상단 탭 변경 시 카테고리 초기화
                                    }}
                                >
                                    <span
                                        className={`
            relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
            ${selectedCategory === category.id ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]' : 'font-normal text-gray-600 hover:text-black'}
        `}
                                    >
                                        {category.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* View Toggle and Filters */}
                    <div className="flex justify-between items-center mt-[30px] px-7">
                        {/* 리스트형/캘린더형 탭 */}
                        <div className="flex bg-white rounded-full border border-gray-200 p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 focus:outline-none hover:outline-none focus:ring-0 border-0 ${viewMode === "list"
                                    ? "bg-black text-white"
                                    : "bg-white text-black hover:bg-gray-50"
                                    }`}
                                style={{ outline: 'none', border: 'none' }}
                            >
                                <List className="w-4 h-4" />
                                <span className="text-sm font-medium">리스트형</span>
                            </button>
                            <button
                                onClick={() => {
                                    setViewMode("calendar");
                                    // 캘린더형으로 전환할 때 상단 날짜 범위를 현재 캘린더 월로 동기화
                                    setSelectedDateRange(`${calendarYear}년 ${calendarMonth}월`);
                                }}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 focus:outline-none hover:outline-none focus:ring-0 border-0 ${viewMode === "calendar"
                                    ? "bg-black text-white"
                                    : "bg-white text-black hover:bg-gray-50"
                                    }`}
                                style={{ outline: 'none', border: 'none' }}
                            >
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">캘린더형</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* 달력 필터 */}
                            <div className="relative">
                                <button
                                    className="flex items-center space-x-2 focus:outline-none bg-transparent border-none p-0"
                                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                >
                                    <HiOutlineCalendar className="w-6 h-6 text-gray-600" />
                                    <span className="text-lg text-black">{selectedDateRange}</span>
                                    <FaChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* 날짜 선택 드롭다운 */}
                                {isDatePickerOpen && (
                                    <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                                        {/* 년도 선택 */}
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">년도 선택</h3>
                                            <div className="flex items-center justify-center space-x-4">
                                                <button
                                                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                                                    onClick={() => {
                                                        const newYear = selectedYear - 1;
                                                        if (newYear >= 2024) {
                                                            setSelectedYear(newYear);
                                                            // 년도만 변경하고 기존 선택된 날짜는 유지
                                                            // 범위 텍스트는 기존 선택된 날짜를 기반으로 업데이트
                                                            if (startDate && endDate) {
                                                                const startYear = startDate.getFullYear();
                                                                const startMonth = startDate.getMonth() + 1;
                                                                const endYear = endDate.getFullYear();
                                                                const endMonth = endDate.getMonth() + 1;

                                                                if (startYear === endYear && startMonth === endMonth) {
                                                                    setSelectedDateRange(`${startYear}년 ${startMonth}월`);
                                                                } else if (startYear === endYear) {
                                                                    setSelectedDateRange(`${startYear}년 ${startMonth}월 ~ ${endMonth}월`);
                                                                } else {
                                                                    setSelectedDateRange(`${startYear}년 ${startMonth}월 ~ ${endYear}년 ${endMonth}월`);
                                                                }
                                                            } else {
                                                                setSelectedDateRange(`${newYear}년 7월 ~ 8월`);
                                                            }
                                                        }
                                                    }}
                                                    disabled={selectedYear <= 2024}
                                                >
                                                    &lt;
                                                </button>
                                                <span className="text-lg font-medium text-black">{selectedYear}</span>
                                                <button
                                                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                                                    onClick={() => {
                                                        const newYear = selectedYear + 1;
                                                        if (newYear <= 2028) {
                                                            setSelectedYear(newYear);
                                                            // 년도만 변경하고 기존 선택된 날짜는 유지
                                                            // 범위 텍스트는 기존 선택된 날짜를 기반으로 업데이트
                                                            if (startDate && endDate) {
                                                                const startYear = startDate.getFullYear();
                                                                const startMonth = startDate.getMonth() + 1;
                                                                const endYear = endDate.getFullYear();
                                                                const endMonth = endDate.getMonth() + 1;

                                                                if (startYear === endYear && startMonth === endMonth) {
                                                                    setSelectedDateRange(`${startYear}년 ${startMonth}월`);
                                                                } else if (startYear === endYear) {
                                                                    setSelectedDateRange(`${startYear}년 ${startMonth}월 ~ ${endMonth}월`);
                                                                } else {
                                                                    setSelectedDateRange(`${startYear}년 ${startMonth}월 ~ ${endYear}년 ${endMonth}월`);
                                                                }
                                                            } else {
                                                                setSelectedDateRange(`${newYear}년 7월 ~ 8월`);
                                                            }
                                                        }
                                                    }}
                                                    disabled={selectedYear >= 2028}
                                                >
                                                    &gt;
                                                </button>
                                            </div>
                                        </div>

                                        {/* 월 선택 */}
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">월 선택</h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const monthDate = new Date(selectedYear, i, 1);
                                                    const isSelected = (startDate && startDate.getFullYear() === selectedYear && startDate.getMonth() === i) ||
                                                        (endDate && endDate.getFullYear() === selectedYear && endDate.getMonth() === i);
                                                    return (
                                                        <button
                                                            key={i}
                                                            className={`px-3 py-2 text-sm rounded ${isSelected
                                                                ? 'bg-black text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                            onClick={() => {
                                                                setCurrentMonth(monthDate);

                                                                // 월 선택 시 범위 설정
                                                                if (!startDate) {
                                                                    // 첫 번째 선택 (시작월)
                                                                    setStartDate(new Date(selectedYear, i, 1));
                                                                } else if (!endDate) {
                                                                    // 두 번째 선택 (종료월)
                                                                    const startYear = startDate.getFullYear();
                                                                    const startMonth = startDate.getMonth();
                                                                    const endYear = selectedYear;
                                                                    const endMonth = i;

                                                                    // 년도가 다르거나 같은 년도에서 종료월이 시작월보다 크거나 같은 경우
                                                                    if (endYear > startYear || (endYear === startYear && endMonth >= startMonth)) {
                                                                        setEndDate(new Date(endYear, endMonth, 1));

                                                                        // 범위 텍스트 업데이트
                                                                        const startMonthNum = startMonth + 1;
                                                                        const endMonthNum = endMonth + 1;
                                                                        if (startYear === endYear && startMonthNum === endMonthNum) {
                                                                            setSelectedDateRange(`${startYear}년 ${startMonthNum}월`);
                                                                        } else if (startYear === endYear) {
                                                                            setSelectedDateRange(`${startYear}년 ${startMonthNum}월 ~ ${endMonthNum}월`);
                                                                        } else {
                                                                            setSelectedDateRange(`${startYear}년 ${startMonthNum}월 ~ ${endYear}년 ${endMonthNum}월`);
                                                                        }
                                                                        setIsDatePickerOpen(false);
                                                                    } else {
                                                                        // 종료월이 시작월보다 이전인 경우 시작월로 재설정
                                                                        setStartDate(new Date(selectedYear, i, 1));
                                                                        setEndDate(null);
                                                                    }
                                                                } else {
                                                                    // 이미 범위가 설정된 경우 새로운 시작월로 설정
                                                                    setStartDate(new Date(selectedYear, i, 1));
                                                                    setEndDate(null);
                                                                }
                                                            }}
                                                        >
                                                            {i + 1}월
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* 선택된 범위 표시 */}
                                        <div className="mb-4 p-3 bg-gray-50 rounded">
                                            <div className="text-sm text-gray-600 mb-1">선택된 범위</div>
                                            <div className="text-sm font-medium">
                                                {startDate ? `${startDate.getFullYear()}년 ${startDate.getMonth() + 1}월 ${startDate.getDate()}일` : '시작일 미선택'} ~
                                                {endDate ? `${endDate.getFullYear()}년 ${endDate.getMonth() + 1}월 ${endDate.getDate()}일` : '종료일 미선택'}
                                            </div>
                                        </div>

                                        {/* 월 선택만 표시 */}
                                        <div className="mb-4">
                                            <div className="text-center">
                                                <span className="font-medium text-sm">
                                                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                                                </span>
                                            </div>
                                        </div>

                                        {/* 범위 초기화 버튼 */}
                                        <div className="flex justify-end">
                                            <button
                                                className="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                                                onClick={() => {
                                                    setStartDate(null);
                                                    setEndDate(null);
                                                    setSelectedYear(2025);
                                                    setSelectedDateRange("2025년 7월 ~ 8월");
                                                }}
                                            >
                                                초기화
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 카테고리 필터 */}
                            <div className="relative">
                                <button
                                    className="flex items-center justify-between w-40 px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                >
                                    <span className="text-sm truncate">{selectedSubCategory}</span>
                                    <FaChevronDown className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* 카테고리 드롭다운 메뉴 */}
                                {isCategoryDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                        {selectedCategory === "all" ? (
                                            // 전체 탭일 때: 모든 1차 카테고리와 2차 카테고리 표시
                                            Object.entries(subCategories).map(([categoryKey, subCats]) => (
                                                <div key={categoryKey}>
                                                    {/* 1차 카테고리 헤더 */}
                                                    <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                                                        {categoryKey === "exhibition" ? "박람회" :
                                                            categoryKey === "seminar" ? "강연/세미나" :
                                                                categoryKey === "event" ? "전시/행사" :
                                                                    categoryKey === "performance" ? "공연" :
                                                                        categoryKey === "festival" ? "축제" : categoryKey}
                                                    </div>
                                                    {/* 2차 카테고리들 */}
                                                    {subCats.map((subCat) => (
                                                        <button
                                                            key={subCat}
                                                            className={`w-full text-left px-3 py-1 text-xs hover:bg-gray-50 ${selectedSubCategory === subCat ? 'bg-gray-100 text-black' : 'text-gray-700'}`}
                                                            onClick={() => {
                                                                setSelectedSubCategory(subCat);
                                                                setIsCategoryDropdownOpen(false);
                                                            }}
                                                        >
                                                            {subCat}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))
                                        ) : (
                                            // 특정 탭일 때: 해당 탭의 2차 카테고리만 표시
                                            subCategories[selectedCategory as keyof typeof subCategories]?.map((subCat) => (
                                                <button
                                                    key={subCat}
                                                    className={`w-full text-left px-3 py-1 text-xs hover:bg-gray-50 ${selectedSubCategory === subCat ? 'bg-gray-100 text-black' : 'text-gray-700'}`}
                                                    onClick={() => {
                                                        setSelectedSubCategory(subCat);
                                                        setIsCategoryDropdownOpen(false);
                                                    }}
                                                >
                                                    {subCat}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 지역 필터 */}
                            <div className="relative">
                                <button
                                    className="flex items-center justify-between w-32 px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
                                    onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                                >
                                    <span className="text-sm truncate">{selectedRegion}</span>
                                    <FaChevronDown className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${isRegionDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* 드롭다운 메뉴 */}
                                {isRegionDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        {["모든지역", "서울", "경기", "인천", "강원", "부산", "경남", "대구", "경북", "대전", "충남", "충북", "광주", "전북", "전남", "제주", "울산", "해외"].map((region) => (
                                            <button
                                                key={region}
                                                className={`w-full text-left px-3 py-1 text-xs hover:bg-gray-50 ${selectedRegion === region ? 'bg-gray-100 text-black' : 'text-gray-700'}`}
                                                onClick={() => {
                                                    setSelectedRegion(region);
                                                    setIsRegionDropdownOpen(false);
                                                }}
                                            >
                                                {region}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Event Grid */}
                    {viewMode === "list" ? (
                        <div className="grid grid-cols-5 gap-6 mt-10 px-6">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="relative cursor-pointer" onClick={() => navigate(`/eventdetail/${event.id}`)}>
                                    <div className="relative">
                                        <img
                                            className="w-full h-64 object-cover rounded-[10px]"
                                            alt={event.title}
                                            src={event.image || "/images/NoImage.png"}
                                        />
                                        <FaHeart
                                            className={`absolute top-4 right-4 w-5 h-5 cursor-pointer ${likedEvents.has(event.id) ? 'text-red-500' : 'text-white'} drop-shadow-lg`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLike(event.id);
                                            }}
                                        />
                                    </div>
                                    <div className="mt-4 text-left">
                                        <span className={`inline-block px-3 py-1 rounded text-xs mb-2 ${categoryColors[event.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-700"}`}>
                                            {event.category}
                                        </span>
                                        <h3 className="font-bold text-xl text-black mb-2 truncate">{event.title}</h3>
                                        <div className="text-sm text-gray-600 mb-2">
                                            <div className="font-bold">{event.location}</div>
                                            <div>{event.date}</div>
                                        </div>
                                        <p className="font-bold text-lg text-[#ff6b35]">{event.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 px-6">
                            {/* 캘린더형 뷰 */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                {/* 헤더 */}
                                <div className="flex items-center justify-center mb-4">
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded"
                                        onClick={handlePrevMonth}
                                    >
                                        <ChevronDown className="w-4 h-4 rotate-90 text-gray-500" />
                                    </button>
                                    <h2 className="text-lg font-semibold text-gray-900 mx-4">{calendarYear}.{calendarMonth.toString().padStart(2, '0')}</h2>
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded"
                                        onClick={handleNextMonth}
                                    >
                                        <ChevronDown className="w-4 h-4 -rotate-90 text-gray-500" />
                                    </button>
                                </div>

                                {/* 요일 헤더 */}
                                <div className="grid grid-cols-7 mb-2">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                                        <div key={day} className={`text-center py-2 text-xs font-medium border-b-2 ${index === 0 ? 'text-red-500 border-red-500' : index === 6 ? 'text-blue-500 border-blue-500' : 'text-black border-gray-300'}`}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* 캘린더 그리드 */}
                                <div className="grid grid-cols-7">
                                    {/* 이전 달 날짜들 (회색) */}
                                    {(() => {
                                        const prevMonth = calendarMonth === 1 ? 12 : calendarMonth - 1;
                                        const prevYear = calendarMonth === 1 ? calendarYear - 1 : calendarYear;
                                        const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
                                        const firstDayOfMonth = new Date(calendarYear, calendarMonth - 1, 1).getDay();
                                        const daysFromPrevMonth = firstDayOfMonth;

                                        return Array.from({ length: daysFromPrevMonth }, (_, i) => {
                                            const day = daysInPrevMonth - daysFromPrevMonth + i + 1;
                                            return (
                                                <div key={`prev-${day}`} className="h-48 border-b border-r border-gray-100 p-1">
                                                    <div className="text-sm font-bold mb-1 text-gray-400">{day}</div>
                                                </div>
                                            );
                                        });
                                    })()}

                                    {/* 현재 달 날짜들 */}
                                    {(() => {
                                        const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();

                                        return Array.from({ length: daysInMonth }, (_, i) => {
                                            const day = i + 1;
                                            const dayEvents = filteredEvents.filter(event => {
                                                return event.date.includes(`${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                                            });

                                            // 현재 달의 요일 계산
                                            const firstDayOfMonth = new Date(calendarYear, calendarMonth - 1, 1).getDay();
                                            const dayOfWeek = (firstDayOfMonth + day - 1) % 7;
                                            const isSunday = dayOfWeek === 0; // 0=일요일
                                            const isSaturday = dayOfWeek === 6; // 6=토요일

                                            return (
                                                <div key={day} className="h-48 border-b border-r border-gray-100 p-1">
                                                    <div className={`text-sm font-bold mb-1 ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-900'}`}>{day}</div>
                                                    <div className="space-y-0.5">
                                                        {dayEvents.slice(0, 6).map((event, index) => (
                                                            <div
                                                                key={event.id}
                                                                className="text-xs flex items-center space-x-1"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/eventdetail/${event.id}`);
                                                                }}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${event.category === "박람회" ? "bg-blue-500" :
                                                                    event.category === "공연" ? "bg-red-500" :
                                                                        event.category === "강연/세미나" ? "bg-green-500" :
                                                                            event.category === "전시/행사" ? "bg-yellow-500" :
                                                                                event.category === "축제" ? "bg-gray-500" : "bg-gray-400"
                                                                    }`}></div>
                                                                <span className="truncate text-gray-700">{event.title}</span>
                                                            </div>
                                                        ))}
                                                        {dayEvents.length > 6 && (
                                                            <div className="text-xs text-gray-400">+{dayEvents.length - 6}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}

                                    {/* 다음 달 날짜들 (회색) */}
                                    {(() => {
                                        const nextMonth = calendarMonth === 12 ? 1 : calendarMonth + 1;
                                        const nextYear = calendarMonth === 12 ? calendarYear + 1 : calendarYear;
                                        const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
                                        const firstDayOfMonth = new Date(calendarYear, calendarMonth - 1, 1).getDay();
                                        const daysFromPrevMonth = firstDayOfMonth;
                                        const totalDaysShown = daysFromPrevMonth + daysInMonth;
                                        const remainingDays = 42 - totalDaysShown; // 6주 x 7일 = 42

                                        return Array.from({ length: remainingDays }, (_, i) => {
                                            const day = i + 1;
                                            return (
                                                <div key={`next-${day}`} className="h-48 border-b border-r border-gray-100 p-1">
                                                    <div className="text-sm font-bold mb-1 text-gray-400">{day}</div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <footer className="mt-[60px] pt-[60px] border-t border-[#0000001f] text-center">
                        <p className="text-base text-[#666666]">
                            간편하고 안전한 행사 관리 솔루션
                        </p>

                        <div className="flex justify-center gap-5 mt-10">
                            {footerLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-sm text-[#666666]"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
} 