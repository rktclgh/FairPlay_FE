import React, { useState, useEffect } from "react";
import {
    FaChevronLeft,
    FaChevronRight,
    FaChevronDown,
    FaHeart
} from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi";
import { TopNav } from "./TopNav";
import { eventApi } from "../services/api";
import type { Event, HotPick, HeroPoster } from "../services/api";

export const Main: React.FC = () => {
    const [hotPicks, setHotPicks] = useState<HotPick[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [heroPosters, setHeroPosters] = useState<HeroPoster[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("전체");
    const [loading, setLoading] = useState(true);
    const [activeHeroIndex, setActiveHeroIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<string>("모든지역");
    const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState<string>("2025년 7월 ~ 8월");
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 6, 1)); // 2025년 7월
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set());


    // 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [hotPicksData, eventsData, heroPostersData] = await Promise.all([
                    eventApi.getHotPicks(),
                    eventApi.getEvents(),
                    eventApi.getHeroPosters()
                ]);

                setHotPicks(hotPicksData);
                setEvents(eventsData);
                setHeroPosters(heroPostersData);
                // 첫 번째 포스터를 기본으로 설정
                setActiveHeroIndex(0);
            } catch (error) {
                console.error('데이터 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // 카테고리 필터링
    const handleCategoryChange = async (category: string) => {
        setSelectedCategory(category);
        try {
            const filteredEvents = await eventApi.getEvents(category);
            setEvents(filteredEvents);
        } catch (error) {
            console.error('카테고리 필터링 실패:', error);
        }
    };

    // 마우스가 벗어날 때 - 현재 활성화된 이미지 유지
    const handleHeroLeave = () => {
        setHoveredIndex(null);
    };

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
                {/* 메인 히어로 이미지 - 전체 화면 */}
                <div className="absolute inset-0">
                    <img
                        src={heroPosters[activeHeroIndex]?.horizontalImage || "/images/gd1.png"}
                        alt="Hero Image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            console.log('히어로 이미지 로드 실패:', e);
                        }}
                    />
                </div>

                {/* 하단 작은 포스터들 (세로형) - 더 많은 포스터들 */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-3 pb-8">
                    {/* 첫 번째 포스터 - gd2 이미지, 호버 시 gd1 */}
                    <div
                        className={`w-20 h-28 cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredIndex === 0 ? 'opacity-100' : 'opacity-60'}`}
                        onMouseEnter={() => {
                            setActiveHeroIndex(0);
                            setHoveredIndex(0);
                        }}
                        onMouseLeave={handleHeroLeave}
                    >
                        <img
                            className={`w-full h-full object-cover rounded-[10px] shadow-lg ${hoveredIndex === 0 ? 'ring-2 ring-white' : ''}`}
                            alt="G-DRAGON Poster 1"
                            src="/images/gd2.png"
                        />
                    </div>

                    {/* 두 번째 포스터 - YE1 이미지, 호버 시 YE1 */}
                    <div
                        className={`w-20 h-28 cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredIndex === 1 ? 'opacity-100' : 'opacity-60'}`}
                        onMouseEnter={() => {
                            setActiveHeroIndex(2);
                            setHoveredIndex(1);
                        }}
                        onMouseLeave={handleHeroLeave}
                    >
                        <img
                            className={`w-full h-full object-cover rounded-[10px] shadow-lg ${hoveredIndex === 1 ? 'ring-2 ring-white' : ''}`}
                            alt="YE1 Poster"
                            src="/images/YE1.png"
                        />
                    </div>

                    {/* 세 번째 포스터 - NoImage, 호버 시 NoImage */}
                    <div
                        className={`w-20 h-28 cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredIndex === 2 ? 'opacity-100' : 'opacity-60'}`}
                        onMouseEnter={() => {
                            setActiveHeroIndex(3);
                            setHoveredIndex(2);
                        }}
                        onMouseLeave={handleHeroLeave}
                    >
                        <img
                            className={`w-full h-full object-cover rounded-[10px] shadow-lg ${hoveredIndex === 2 ? 'ring-2 ring-white' : ''}`}
                            alt="NoImage Poster 1"
                            src="/images/NoImage.png"
                        />
                    </div>

                    {/* 네 번째 포스터 - NoImage, 호버 시 NoImage */}
                    <div
                        className={`w-20 h-28 cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredIndex === 3 ? 'opacity-100' : 'opacity-60'}`}
                        onMouseEnter={() => {
                            setActiveHeroIndex(4);
                            setHoveredIndex(3);
                        }}
                        onMouseLeave={handleHeroLeave}
                    >
                        <img
                            className={`w-full h-full object-cover rounded-[10px] shadow-lg ${hoveredIndex === 3 ? 'ring-2 ring-white' : ''}`}
                            alt="NoImage Poster 2"
                            src="/images/NoImage.png"
                        />
                    </div>

                    {/* 다섯 번째 포스터 - NoImage, 호버 시 NoImage */}
                    <div
                        className={`w-20 h-28 cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredIndex === 4 ? 'opacity-100' : 'opacity-60'}`}
                        onMouseEnter={() => {
                            setActiveHeroIndex(5);
                            setHoveredIndex(4);
                        }}
                        onMouseLeave={handleHeroLeave}
                    >
                        <img
                            className={`w-full h-full object-cover rounded-[10px] shadow-lg ${hoveredIndex === 4 ? 'ring-2 ring-white' : ''}`}
                            alt="NoImage Poster 3"
                            src="/images/NoImage.png"
                        />
                    </div>

                    {/* 여섯 번째 포스터 - NoImage, 호버 시 NoImage */}
                    <div
                        className={`w-20 h-28 cursor-pointer transition-all duration-300 hover:scale-110 ${hoveredIndex === 5 ? 'opacity-100' : 'opacity-60'}`}
                        onMouseEnter={() => {
                            setActiveHeroIndex(6);
                            setHoveredIndex(5);
                        }}
                        onMouseLeave={handleHeroLeave}
                    >
                        <img
                            className={`w-full h-full object-cover rounded-[10px] shadow-lg ${hoveredIndex === 5 ? 'ring-2 ring-white' : ''}`}
                            alt="NoImage Poster 4"
                            src="/images/NoImage.png"
                        />
                    </div>
                </div>
            </div>

            {/* Hot Picks 섹션 */}
            <div className="bg-[#f7fafc] py-16">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-black">Hot Picks</h2>
                        <div className="flex space-x-2">
                            <button className="w-12 h-12 border border-neutral-200 rounded hover:bg-gray-50 flex items-center justify-center">
                                <FaChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="w-12 h-12 border border-neutral-200 rounded hover:bg-gray-50 flex items-center justify-center">
                                <FaChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-6">
                        {hotPicks.map((item, index) => (
                            <div key={item.id} className="relative">
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
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <span>{item.date}</span>
                                        <span className="mx-2">•</span>
                                        <span>올림픽공원</span>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                                        {/* 월 선택 */}
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">월 선택</h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const monthDate = new Date(2025, i, 1);
                                                    const isSelected = (startDate && startDate.getMonth() === i) ||
                                                        (endDate && endDate.getMonth() === i);
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
                                                                    setStartDate(new Date(2025, i, 1));
                                                                } else if (!endDate) {
                                                                    // 두 번째 선택 (종료월)
                                                                    if (i >= startDate.getMonth()) {
                                                                        setEndDate(new Date(2025, i, 1));

                                                                        // 범위 텍스트 업데이트
                                                                        const startMonth = startDate.getMonth() + 1;
                                                                        const endMonth = i + 1;
                                                                        if (startMonth === endMonth) {
                                                                            setSelectedDateRange(`2025년 ${startMonth}월`);
                                                                        } else {
                                                                            setSelectedDateRange(`2025년 ${startMonth}월 ~ ${endMonth}월`);
                                                                        }
                                                                        setIsDatePickerOpen(false);
                                                                    } else {
                                                                        // 종료월이 시작월보다 이전인 경우 시작월로 재설정
                                                                        setStartDate(new Date(2025, i, 1));
                                                                        setEndDate(null);
                                                                    }
                                                                } else {
                                                                    // 이미 범위가 설정된 경우 새로운 시작월로 설정
                                                                    setStartDate(new Date(2025, i, 1));
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
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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
                                        src={event.image}
                                    />
                                    <FaHeart
                                        className={`absolute top-4 right-4 w-5 h-5 cursor-pointer ${likedEvents.has(event.id) ? 'text-red-500' : 'text-white'} drop-shadow-lg`}
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
                                        {event.category}
                                    </span>
                                    <h3 className="font-bold text-xl text-black mb-2 truncate">{event.title}</h3>
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <span>{event.date}</span>
                                        <span className="mx-2">•</span>
                                        <span>올림픽공원</span>
                                    </div>
                                    <p className="font-bold text-lg text-[#ff6b35]">{event.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 전체보기 버튼 */}
                    <div className="text-center mt-12">
                        <button className="px-4 py-2 rounded-[10px] text-sm border bg-white text-black border-gray-400 hover:bg-gray-50 font-semibold">
                            전체보기
                        </button>
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