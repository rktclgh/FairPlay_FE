import React, { useState, useEffect } from "react";
import dayjs from 'dayjs';
import {
    FaChevronLeft,
    FaChevronRight,
    FaChevronDown,
    FaHeart
} from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi";
import { TopNav } from "../components/TopNav";
import { eventApi } from "../services/api";
import type { Event, HotPick } from "../services/api";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { eventAPI } from "../services/event"
import type {
    EventSummaryDto
} from "../services/types/eventType";

// 유료광고 행사 인터페이스
interface PaidAdvertisement {
    id: number;
    title: string;
    imageUrl: string;
    thumbnailUrl: string;
    linkUrl: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    priority: number; // 노출 순서
}

export const Main: React.FC = () => {

    const [events, setEvents] = useState<EventSummaryDto[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("전체");
    const [loading, setLoading] = useState(true);

    const [selectedRegion, setSelectedRegion] = useState<string>("모든지역");
    const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState<string>("2025년 7월 ~ 8월");
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 6, 1)); // 2025년 7월
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set());
    const [hotPicksSlideIndex, setHotPicksSlideIndex] = useState(0);

    const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

    const mapMainCategoryToId = (name: string): number | undefined => {
        switch (name) {
            case "박람회": return 1;
            case "강연/세미나": return 2;
            case "전시/행사": return 3;
            case "공연": return 4;
            case "축제": return 5;
            default: return undefined;
        }
    };

    const fetchEvents = async () => {
        try {
            const params: {
                mainCategoryId?: number;
                subCategoryId?: number;
                regionName?: string;
                fromDate?: string;
                toDate?: string;
                page?: number;
                size?: number;
            } = {
                page: 0,
                size: 20,
            };

            if (selectedCategory !== "전체") {
                params.mainCategoryId = mapMainCategoryToId(selectedCategory);
            }

            if (selectedRegion !== "모든지역") {
                params.regionName = selectedRegion;
            }

            if (startDate) {
                params.fromDate = formatDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
            }
            if (endDate) {
                params.toDate = formatDate(new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0));
            }

            const response = await eventAPI.getEventList(params);
            setEvents(response.events ?? []);
        } catch (error) {
            console.error("행사 필터링 실패:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [selectedCategory, selectedRegion, startDate, endDate]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };


    // 유료광고 행사 상태
    const [paidAdvertisements, setPaidAdvertisements] = useState<PaidAdvertisement[]>([]);

    // 유료광고 행사 데이터 로드 (백엔드 연동 전까지 임시 데이터 사용)
    const loadPaidAdvertisements = async () => {
        try {
            // TODO: 백엔드 연동 후 실제 API 호출로 교체
            // const ads = await eventApi.getPaidAdvertisements();

            // 임시 데이터 (백엔드 연동 전까지 사용)
            const tempAds: PaidAdvertisement[] = [
                {
                    id: 1,
                    title: "G-DRAGON 2025 WORLD TOUR IN JAPAN",
                    imageUrl: "/images/gd1.png",
                    thumbnailUrl: "/images/gd2.png",
                    linkUrl: "/event/1",
                    startDate: "2025-05-25",
                    endDate: "2025-05-25",
                    isActive: true,
                    priority: 1
                },
                {
                    id: 2,
                    title: "YE LIVE IN KOREA",
                    imageUrl: "/images/YE3.png",
                    thumbnailUrl: "/images/YE3.png",
                    linkUrl: "/event/2",
                    startDate: "2025-06-15",
                    endDate: "2025-06-15",
                    isActive: true,
                    priority: 2
                },
                {
                    id: 3,
                    title: "Post Malone Concert",
                    imageUrl: "/images/malone1.jpg",
                    thumbnailUrl: "/images/malone.jpg",
                    linkUrl: "/event/3",
                    startDate: "2025-07-20",
                    endDate: "2025-07-20",
                    isActive: true,
                    priority: 3
                },
                {
                    id: 4,
                    title: "Event 4",
                    imageUrl: "/images/NoImage.png",
                    thumbnailUrl: "/images/NoImage.png",
                    linkUrl: "/event/4",
                    startDate: "2025-08-10",
                    endDate: "2025-08-10",
                    isActive: true,
                    priority: 4
                },
                {
                    id: 5,
                    title: "Event 5",
                    imageUrl: "/images/NoImage.png",
                    thumbnailUrl: "/images/NoImage.png",
                    linkUrl: "/event/5",
                    startDate: "2025-09-05",
                    endDate: "2025-09-05",
                    isActive: true,
                    priority: 5
                },
                {
                    id: 6,
                    title: "Event 6",
                    imageUrl: "/images/NoImage.png",
                    thumbnailUrl: "/images/NoImage.png",
                    linkUrl: "/event/6",
                    startDate: "2025-10-15",
                    endDate: "2025-10-15",
                    isActive: true,
                    priority: 6
                }
            ];

            // 활성화된 광고만 필터링하고 우선순위 순으로 정렬
            const activeAds = tempAds
                .filter(ad => ad.isActive)
                .sort((a, b) => a.priority - b.priority);

            setPaidAdvertisements(activeAds);
        } catch (error) {
            console.error('유료광고 데이터 로드 실패:', error);
        }
    };

    // 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const eventsData = await eventAPI.getEventList();
                setEvents(eventsData.events);

                // 유료광고 데이터 로드
                await loadPaidAdvertisements();

                // TODO: 백엔드 연결 후 Hot Picks 데이터 로드
                // const hotPicksData = await eventApi.getHotPicks();
                // setHotPicks(hotPicksData);
            } catch (error) {
                console.error('데이터 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // 카테고리 필터링
    // const handleCategoryChange = async (category: string) => {
    //     setSelectedCategory(category);
    //     try {
    //         const filteredEvents = await eventApi.getEvents(category);
    //         setEvents(filteredEvents);
    //     } catch (error) {
    //         console.error('카테고리 필터링 실패:', error);
    //     }
    // };



    // Hot Picks 슬라이드 함수들
    const handleHotPicksPrev = () => {
        setHotPicksSlideIndex(prev => Math.max(0, prev - 1));
    };

    const handleHotPicksNext = () => {
        setHotPicksSlideIndex(prev => Math.min(5, prev + 1)); // 최대 5 (10개 이벤트, 5개씩 표시)
    };

    // Hot Picks 상태 (백엔드 연결 후 실제 예매 데이터로 교체 예정)
    const [hotPicks, setHotPicks] = useState<HotPick[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars

    // 임시 Hot Picks 데이터 (백엔드 연결 전까지 사용)
    const tempHotPicks: HotPick[] = [
        {
            id: 1,
            title: "G-DRAGON 2025 WORLD TOUR IN JAPAN",
            date: "2025.05.25",
            location: "KYOCERA DOME OSAKA",
            category: "공연",
            image: "/images/gd2.png",
        },
        {
            id: 2,
            title: "YE LIVE IN KOREA",
            date: "2025.06.15",
            location: "인천문학경기장",
            category: "공연",
            image: "/images/YE1.png",
        },
        {
            id: 3,
            title: "2025 AI & 로봇 박람회",
            date: "2025-08-15 ~ 2025-08-17",
            location: "코엑스 A홀",
            category: "박람회",
            image: "/images/NoImage.png",
        },
        {
            id: 4,
            title: "현대미술 특별전",
            date: "2025-09-05 ~ 2025-09-30",
            location: "국립현대미술관",
            category: "전시/행사",
            image: "/images/NoImage.png",
        },
        {
            id: 5,
            title: "서울 국제 도서전",
            date: "2025-08-22 ~ 2025-08-25",
            location: "코엑스 B홀",
            category: "박람회",
            image: "/images/NoImage.png",
        },
        {
            id: 6,
            title: "블랙핑크 월드투어",
            date: "2025-09-01 ~ 2025-09-03",
            location: "고척스카이돔",
            category: "공연",
            image: "/images/NoImage.png",
        },
        {
            id: 7,
            title: "스타트업 투자 세미나",
            date: "2025-08-15",
            location: "강남구 컨벤션센터",
            category: "강연/세미나",
            image: "/images/NoImage.png",
        },
        {
            id: 8,
            title: "디자인 페어 서울",
            date: "2025-09-10 ~ 2025-09-15",
            location: "예술의전당",
            category: "전시/행사",
            image: "/images/NoImage.png",
        },
        {
            id: 9,
            title: "서울 국제 영화제",
            date: "2025-09-05 ~ 2025-09-15",
            location: "여의도 한강공원",
            category: "축제",
            image: "/images/NoImage.png",
        },
        {
            id: 10,
            title: "서울 라이트 페스티벌",
            date: "2025-09-20 ~ 2025-09-25",
            location: "남산타워",
            category: "축제",
            image: "/images/NoImage.png",
        },
    ];

    // Hot Picks 데이터 (백엔드 연결 후 hotPicks로 교체)
    const allHotPicks = hotPicks.length > 0 ? hotPicks : tempHotPicks;

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-xl">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <TopNav />

            {/* 히어로 섹션 */}
            <div className="relative w-full h-[600px] bg-gray-100">
                <Swiper
                    modules={[Autoplay, EffectFade]}
                    effect="fade"
                    autoplay={{ delay: 4000 }}
                    loop={true}
                    className="w-full h-full"
                    onSwiper={(swiper) => {
                        // Swiper 인스턴스를 저장
                        (window as any).heroSwiper = swiper;
                    }}
                >
                    {paidAdvertisements.map((ad, index) => (
                        <SwiperSlide key={ad.id}>
                            <img
                                src={ad.imageUrl}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    console.log('히어로 이미지 로드 실패:', e);
                                }}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* 하단 작은 포스터들 */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-3 pb-8 z-10">
                    {paidAdvertisements.map((ad, index) => (
                        <div
                            key={ad.id}
                            className="w-16 h-20 cursor-pointer transition-all duration-300 hover:scale-110 opacity-60 hover:opacity-100"
                            onMouseEnter={() => {
                                const swiper = (window as any).heroSwiper;
                                if (swiper) {
                                    swiper.slideTo(index);
                                }
                            }}
                        >
                            <img
                                className="w-full h-full object-cover rounded-[10px] shadow-lg"
                                alt={`Paid Ad ${ad.id}`}
                                src={ad.thumbnailUrl}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Hot Picks 섹션 */}
            <div className="bg-[#f7fafc] py-16">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-black">Hot Picks</h2>
                        <div className="flex space-x-2">
                            <button
                                className={`w-12 h-12 border border-neutral-200 rounded hover:bg-gray-50 flex items-center justify-center ${hotPicksSlideIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleHotPicksPrev}
                                disabled={hotPicksSlideIndex === 0}
                            >
                                <FaChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                className={`w-12 h-12 border border-neutral-200 rounded hover:bg-gray-50 flex items-center justify-center ${hotPicksSlideIndex === 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleHotPicksNext}
                                disabled={hotPicksSlideIndex === 5}
                            >
                                <FaChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden">
                        <div
                            className="flex gap-6 transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${hotPicksSlideIndex * 20}%)` }}
                        >
                            {allHotPicks.map((item, index) => (
                                <div key={item.id} className="relative flex-shrink-0" style={{ width: 'calc(20% - 24px)' }}>
                                    <img
                                        className="w-full h-64 object-cover rounded-[10px]"
                                        alt={`Hot Pick ${index + 1}`}
                                        src={item.image}
                                    />
                                    <div className="mt-4 text-left">
                                        <span className="inline-block px-3 py-1 bg-blue-100 rounded text-xs text-blue-700 mb-2">
                                            {item.category}
                                        </span>
                                        <h3 className="font-bold text-xl text-black mb-2 truncate">{item.title}</h3>
                                        <div className="text-sm text-gray-600 mb-2">
                                            <div className="font-bold">{item.location}</div>
                                            <div>{item.date}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 행사 섹션 */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-black">행사</h2>
                        <div className="flex items-center space-x-4">
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

                    {/* 필터 버튼들 */}
                    <div className="flex space-x-4 mb-8">
                        {["전체", "박람회", "공연", "강연/세미나", "전시/행사", "축제"].map((filter, index) => (
                            <button
                                key={index}
                                onClick={() => handleCategoryChange(filter)}
                                className={`px-4 py-2 rounded-full text-sm border ${selectedCategory === filter
                                    ? "bg-black text-white font-bold"
                                    : "bg-white text-black border-gray-400 hover:bg-gray-50 font-semibold"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* 행사 카드들 */}
                    <div className="grid grid-cols-5 gap-6">
                        {events.slice(0, 5).map((event) => (
                            <div key={event.id} className="relative">
                                <div className="relative">
                                    <img
                                        className="w-full h-64 object-cover rounded-[10px]"
                                        alt={event.title}
                                        src={event.thumbnailUrl}
                                    />
                                    <FaHeart
                                        className={`absolute top-4 right-4 w-5 h-5 cursor-pointer ${likedEvents.has(event.eventId) ? 'text-red-500' : 'text-white'} drop-shadow-lg`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLikedEvents(prev => {
                                                const newSet = new Set(prev);
                                                if (newSet.has(event.id)) {
                                                    newSet.delete(event.id);
                                                } else {
                                                    newSet.add(event.id);
                                                }
                                                return newSet;
                                            });
                                        }}
                                    />
                                </div>
                                <div className="mt-4 text-left">
                                    <span className="inline-block px-3 py-1 bg-blue-100 rounded text-xs text-blue-700 mb-2">
                                        {event.mainCategory}
                                    </span>
                                    <h3 className="font-bold text-xl text-black mb-2 truncate">{event.title}</h3>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <div className="font-bold">{event.location}</div>
                                        <div>{dayjs(event.startDate).format('YYYY.MM.DD')} ~ {dayjs(event.endDate).format('YYYY.MM.DD')}</div>
                                    </div>
                                    <p className="font-bold text-lg text-[#ff6b35]">{event.minPrice}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 전체보기 버튼 */}
                    <div className="text-center mt-12">
                        <Link to="/eventoverview">
                            <button className="px-4 py-2 rounded-[10px] text-sm border bg-white text-black border-gray-400 hover:bg-gray-50 font-semibold">
                                전체보기
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 푸터 */}
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
        </div>
    );
}; 