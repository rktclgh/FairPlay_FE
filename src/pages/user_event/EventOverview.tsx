import {
    Calendar,
    ChevronDown,
    List,
    Map as MapIcon,
} from "lucide-react";
import React from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { TopNav } from "../../components/TopNav";
import { FaChevronDown } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi";
import { FaHeart } from "react-icons/fa";
import { eventAPI } from "../../services/event"
import type { EventSummaryDto } from "../../services/types/eventType";
import { getEventStatusText, getEventStatusStyle, calculateEventStatus } from "../../utils/eventStatus";
import api from "../../api/axios";
import type { WishlistResponseDto } from "../../services/types/wishlist";
import { loadKakaoMap } from "../../lib/loadKakaoMap";
import EventMapPin from "../../components/EventMapPin";
import { useTheme } from "../../context/ThemeContext";

const authHeaders = () => {
    const t = localStorage.getItem("accessToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
};

const isAuthed = () => !!localStorage.getItem("accessToken");

// 캘린더 api 데이터 함수
type CalendarGroupedDto = { date: string; titles: string[] };

const fetchCalendarGrouped = (year: number, month: number) =>
    api.get<CalendarGroupedDto[]>("/api/calendar/events/grouped", {
        params: { year, month },
        headers: authHeaders(),
    });

export default function EventOverview() {
    const { isDark } = useTheme();
    const { t, i18n } = useTranslation();
    const [events, setEvents] = React.useState<EventSummaryDto[]>([]);
    const [filteredEvents, setFilteredEvents] = React.useState<EventSummaryDto[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState("all");
    const [selectedSubCategory, setSelectedSubCategory] = React.useState("All Categories");
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState("list"); // "list", "calendar", or "map"
    const [selectedRegion, setSelectedRegion] = React.useState("All Regions");
    const [isRegionDropdownOpen, setIsRegionDropdownOpen] = React.useState(false);
    const [selectedStatus, setSelectedStatus] = React.useState("All");
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = React.useState(false);

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
    const [pending, setPending] = React.useState<Set<number>>(new Set());

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

    // 캘린더 현재 연/월
    const [calendarYear, setCalendarYear] = React.useState(new Date().getFullYear());
    const [calendarMonth, setCalendarMonth] = React.useState(new Date().getMonth() + 1);
    const navigate = useNavigate();

    // 지도 관련 상태
    const [map, setMap] = React.useState<any>(null);
    const [selectedEvent, setSelectedEvent] = React.useState<EventSummaryDto | null>(null);
    const mapRef = React.useRef<HTMLDivElement>(null);
    const markersRef = React.useRef<any[]>([]);

    const location = useLocation();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';


    // 좋아요 토글 함수
    const toggleWish = async (eventId: number) => {
        // 인증 확인
        if (!isAuthed()) {
            alert(t('eventOverview.loginRequired'));
            navigate("/login", { state: { from: location.pathname } }); // 로그인 후 돌아올 수 있게
            return;
        }

        const wasLiked = likedEvents.has(eventId);

        // 낙관적 업데이트
        setLikedEvents(prev => {
            const next = new Set(prev);
            if (wasLiked) {
                next.delete(eventId);
            } else {
                next.add(eventId);
            }
            return next;
        });

        try {
            if (wasLiked) {
                // 찜 취소
                await api.delete(`/api/wishlist/${eventId}`, { headers: authHeaders() });
            } else {
                // 찜 등록 (@RequestParam Long eventId)
                await api.post(`/api/wishlist`, null, {
                    params: { eventId },
                    headers: authHeaders(),
                });
            }
        } catch (e) {
            console.error("찜 토글 실패:", e);
            // 실패 시 롤백
            setLikedEvents(prev => {
                const next = new Set(prev);
                if (wasLiked) {
                    next.add(eventId);
                } else {
                    next.delete(eventId);
                }
                return next;
            });

        }
    };


    // 초기 위시리스트 로드 
    React.useEffect(() => {
        if (!isAuthed()) return;

        (async () => {
            try {
                const { data } = await api.get<WishlistResponseDto[]>("/api/wishlist", {
                    headers: authHeaders(),
                });
                const s = new Set<number>();
                (data ?? []).forEach(w => s.add(w.eventId));
                setLikedEvents(s);
            } catch (e) {
                console.error("위시리스트 로드 실패:", e);
            }
        })();
    }, []);

    // 캘린더 데이터 상태
    const [calendarData, setCalendarData] = React.useState<Map<string, string[]>>(new Map());
    const [calendarLoading, setCalendarLoading] = React.useState(false);
    const [calendarError, setCalendarError] = React.useState<string | null>(null);


    // 캘린더 데이터 fetch (뷰/월 변경 시)
    React.useEffect(() => {
        //  비로그인: API 호출하지 않음
        if (!isAuthed()) {
            setCalendarLoading(false);
            setCalendarError(null);
            setCalendarData(new Map());
            return;
        }
        (async () => {
            setCalendarLoading(true);
            setCalendarError(null);
            try {
                const { data } = await fetchCalendarGrouped(calendarYear, calendarMonth);
                const map = new Map<string, string[]>();
                data.forEach((d) => map.set(d.date, d.titles));
                setCalendarData(map);
            } catch (e: unknown) {
                const st = axios.isAxiosError(e) ? e.response?.status : undefined;
                if (st !== 401 && st !== 403) {
                    console.error(e);
                    setCalendarError(
                        e instanceof Error ? e.message : "캘린더 데이터를 불러오지 못했어요."
                    );
                }
            } finally {
                setCalendarLoading(false);
            }
        })();
    }, [viewMode, calendarYear, calendarMonth]);

    // 헬퍼
    const formatDate = React.useCallback((date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }, []);

    const daysInMonth = React.useMemo(() => {
        return new Date(calendarYear, calendarMonth, 0).getDate(); // month: 1~12
    }, [calendarYear, calendarMonth]);

    const firstWeekdayOffset = React.useMemo(() => {
        return new Date(calendarYear, calendarMonth - 1, 1).getDay(); // 0=일 ~ 6=토
    }, [calendarYear, calendarMonth]);

    const keyOf = React.useCallback((y: number, m: number, d: number) => {
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }, []);

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

    const mapSubCategoryToId = (name: string): number | undefined => {
        const map: Record<string, number> = {
            // group_id 1
            "취업/채용": 101,
            "산업/기술": 102,
            "유학/이민/해외취업": 103,
            "프랜차이즈/창업": 104,
            "뷰티/패션": 105,
            "식품/음료": 106,
            "반려동물": 107,
            "교육/도서": 108,
            "IT/전자": 109,
            "스포츠/레저": 110,
            "기타(박람회)": 111,

            // group_id 2
            "취업/진로": 201,
            "창업/스타트업": 202,
            "과학/기술": 203,
            "자기계발/라이프스타일": 204,
            "인문/문화/예술": 205,
            "건강/의학": 206,
            "기타(세미나)": 207,

            // group_id 3
            "미술/디자인": 301,
            "사진/영상": 302,
            "공예/수공예": 303,
            "패션/주얼리": 304,
            "역사/문화": 305,
            "체험 전시": 306,
            "아동/가족": 307,
            "행사/축제": 308,
            "브랜드 프로모션": 309,
            "기타(전시/행사)": 310,

            // group_id 4
            "콘서트": 401,
            "연극/뮤지컬": 402,
            "클래식/무용": 403,
            "아동/가족(공연)": 404,
            "기타(공연)": 405,

            // group_id 5
            "음악 축제": 501,
            "영화 축제": 502,
            "문화 축제": 503,
            "음식 축제": 504,
            "전통 축제": 505,
            "지역 축제": 506,
            "기타(축제)": 507,
        };
        return map[name];
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
        { id: "all", name: t('eventOverview.allCategories') },
        { id: "박람회", name: t('categories.박람회') },
        { id: "공연", name: t('categories.공연') },
        { id: "강연/세미나", name: t('categories.강연/세미나') },
        { id: "전시/행사", name: t('categories.전시/행사') },
        { id: "축제", name: t('categories.축제') },
    ];

    // 2차 카테고리 데이터
    const subCategories = {
        "박람회": [
            "취업/채용", "산업/기술", "유학/이민/해외취업", "프랜차이즈/창업",
            "뷰티/패션", "식품/음료", "반려동물", "교육/도서", "IT/전자", "스포츠/레저", "기타(박람회)"
        ],
        "강연/세미나": [
            "취업/진로", "창업/스타트업", "과학/기술", "자기계발/라이프스타일",
            "인문/문화/예술", "건강/의학", "기타(세미나)"
        ],
        "전시/행사": [
            "미술/디자인", "사진/영상", "공예/수공예", "패션/주얼리", "역사/문화",
            "체험 전시", "아동/가족", "행사/축제", "브랜드 프로모션", "기타(전시/행사)"
        ],
        "공연": [
            "콘서트", "연극/뮤지컬", "클래식/무용", "아동/가족(공연)", "기타(공연)"
        ],
        "축제": [
            "음악 축제", "영화 축제", "문화 축제", "음식 축제", "전통 축제", "지역 축제", "기타(축제)"
        ]
    };

    const fetchEvents = async () => {
        console.log('🔍 Fetching events with filters:', {
            selectedCategory,
            selectedSubCategory,
            selectedRegion,
            selectedStatus,
            startDate,
            endDate
        });
        try {
            const params: {
                mainCategoryId?: number;
                subCategoryId?: number;
                regionName?: string;
                fromDate?: string;
                toDate?: string;
                page?: number;
                size?: number;
                includeHidden?: boolean;
            } = {
                page: 0,
                size: 50,
                includeHidden: false,
            };

            if (selectedCategory !== "all") {
                params.mainCategoryId = mapMainCategoryToId(selectedCategory);
            }

            if (selectedSubCategory !== "All Categories" && selectedSubCategory !== t('eventOverview.allCategories')) {
                params.subCategoryId = mapSubCategoryToId(selectedSubCategory);
            }

            if (selectedRegion !== "All Regions" && selectedRegion !== t('eventOverview.allRegions')) {
                params.regionName = selectedRegion;
            }

            if (startDate) {
                params.fromDate = formatDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
            }
            if (endDate) {
                params.toDate = formatDate(new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0));
            }

            console.log('📡 API request params:', params);
            const res = await eventAPI.getEventList(params);
            console.log('✅ API response:', res);
            setEvents(res.events ?? []);
        } catch (error) {
            console.error('❌ Failed to fetch events:', error);
            console.error(t('eventOverview.loadEventsFailed'), error);
        }
    };

    // 초기 데이터 로드 및 필터 변경 시 재로드
    React.useEffect(() => {
        console.log('🔄 Filter dependency changed, fetching events...');
        fetchEvents();
    }, [selectedCategory, selectedSubCategory, selectedRegion, startDate, endDate]);

    // 컴포넌트 마운트 시 초기 데이터 로드
    React.useEffect(() => {
        console.log('🎆 Component mounted, loading initial data...');
        fetchEvents();
    }, []);

    // events가 변경될 때 필터링 다시 적용
    React.useEffect(() => {
        console.log('🗂 Applying client-side filters to', events.length, 'events');
        console.log('🗂 Selected status for filtering:', selectedStatus);
        let filtered = events;

        // 상태 필터링 적용
        if (selectedStatus !== "All" && selectedStatus !== t('eventOverview.allStatuses')) {
            const statusCode = selectedStatus === t('eventOverview.upcoming') ? "UPCOMING"
                : selectedStatus === t('eventOverview.ongoing') ? "ONGOING"
                    : selectedStatus === t('eventOverview.ended') ? "ENDED"
                        : "";
            if (statusCode) {
                filtered = filtered.filter(event => calculateEventStatus(event.startDate, event.endDate) === statusCode);
            }
        }

        // 검색어 필터링 적용
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(event => (
                event.title.toLowerCase().includes(query) ||
                event.mainCategory.toLowerCase().includes(query) ||
                event.location.toLowerCase().includes(query) ||
                event.region.toLowerCase().includes(query)
            ));
        }

        console.log('✅ Filtered events result:', filtered.length, 'events');
        setFilteredEvents(filtered);
    }, [events, selectedStatus, searchQuery]);

    const isEventInDateRange = (eventStart: string, eventEnd: string) => {
        if (!startDate || !endDate) return true;
        const start = new Date(eventStart);
        const end = new Date(eventEnd);
        return start <= endDate && end >= startDate;
    };

    // MD PICK 우선 노출 인식: 로컬스토리지에서 오늘 날짜의 ID/제목을 모두 읽는다
    // [백엔드 연동 필요]
    // - 오늘 노출할 MD PICK 이벤트 ID 목록을 API로 전달받아 사용하세요.
    // - 현재는 로컬스토리지 키 'mdpick:YYYY-MM-DD'에서 읽도록 남겨두었습니다. API 적용 시 이 함수들을 대체하세요.
    const getMdPickIdsForToday = () => {
        const todayKey = `mdpick:${new Date().toISOString().split('T')[0]}`;
        try {
            const raw = localStorage.getItem(todayKey);
            if (raw) {
                const arr = JSON.parse(raw) as number[];
                if (Array.isArray(arr)) return new Set(arr.slice(0, 2));
            }
        } catch (_) { }
        return new Set<number>();
    };
    // [백엔드 연동 필요]
    // - 임시 보조: 제목 기반 매칭용 키입니다. 백엔드가 ID를 제공하면 제거해도 됩니다.
    const getMdPickTitlesForToday = () => {
        const todayKey = `mdpick_titles:${new Date().toISOString().split('T')[0]}`;
        try {
            const raw = localStorage.getItem(todayKey);
            if (raw) {
                const arr = JSON.parse(raw) as string[];
                if (Array.isArray(arr)) return new Set(arr.slice(0, 2));
            }
        } catch (_) { }
        return new Set<string>();
    };
    const normalize = (s: string) => (s || '').toLowerCase().replace(/[\s\-_/·・‧ㆍ]/g, '');

    const mdPickIds = getMdPickIdsForToday();
    const mdPickTitles = getMdPickTitlesForToday();
    const mdPickTitleNorms = new Set(Array.from(mdPickTitles).map(normalize));

    // [백엔드 연동 필요]
    // - API에서 받은 MD PICK 세트를 기준으로 판단하도록 바꾸세요.
    const isEventMdPick = (e: EventSummaryDto) => {
        if (mdPickIds.has(e.id)) return true;
        if (mdPickTitleNorms.size > 0) {
            const nt = normalize(e.title);
            for (const t of mdPickTitleNorms) {
                if (nt.includes(t)) return true;
            }
        }
        return false;
    };

    const hasMdPickInCurrentList = filteredEvents.some(e => isEventMdPick(e));
    const displayEvents = hasMdPickInCurrentList
        ? [...filteredEvents].sort((a, b) => {
            const aPick = isEventMdPick(a) ? 1 : 0;
            const bPick = isEventMdPick(b) ? 1 : 0;
            return bPick - aPick;
        })
        : filteredEvents;

    // 지도 초기화 함수
    const initializeMap = React.useCallback(() => {
        if (!mapRef.current || !window.kakao || !window.kakao.maps) return;

        const mapOption = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심좌표
            level: 8,
            mapTypeId: window.kakao.maps.MapTypeId.ROADMAP
        };

        const mapInstance = new window.kakao.maps.Map(mapRef.current, mapOption);
        setMap(mapInstance);

        // 지도 타입 컨트롤 추가
        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        mapInstance.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

        // 줌 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl();
        mapInstance.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        return mapInstance;
    }, []);

    // 호버 카드 상태 (다중 이벤트 지원)
    const [hoveredEvents, setHoveredEvents] = React.useState<EventSummaryDto[]>([]);
    const [hoverCardPosition, setHoverCardPosition] = React.useState<{ x: number; y: number } | null>(null);
    const [currentEventIndex, setCurrentEventIndex] = React.useState(0);


    // 동일 위치 이벤트 그룹화 함수 (location 기준)
    const groupEventsByLocation = React.useCallback((events: EventSummaryDto[]) => {
        const groups: { [key: string]: EventSummaryDto[] } = {};

        events.forEach((event) => {
            // Ensure latitude and longitude are valid for grouping
            if (event.latitude == null || event.longitude == null || isNaN(event.latitude) || isNaN(event.longitude)) {
                console.warn("Skipping event in groupEventsByLocation due to invalid coordinates for grouping:", event.title, event.eventCode, event.latitude, event.longitude);
                return;
            }

            // Create a unique key based on latitude and longitude
            const geoKey = `${event.latitude},${event.longitude}`;

            if (!groups[geoKey]) {
                groups[geoKey] = [];
            }
            groups[geoKey].push(event);
        });

        console.log("Grouped Events by GeoKey:", Object.values(groups));
        return Object.values(groups);
    }, []);


    // 마커 생성 함수
    const createMarkers = React.useCallback((mapInstance: any, events: EventSummaryDto[]) => {
        // Kakao Map API 확인
        if (!window.kakao || !window.kakao.maps) {
            console.error('Kakao Map API not loaded');
            return;
        }

        // 기존 마커 제거
        markersRef.current.forEach(overlay => {
            if (overlay && overlay.setMap) {
                overlay.setMap(null);
            }
        });

        const newOverlays: any[] = [];
        const bounds = new window.kakao.maps.LatLngBounds();

        if (events.length === 0) {
            markersRef.current = [];
            return;
        }

        // 이모지 색상 변경을 위한 hue rotation
        const getHueRotation = (category: string) => {
            switch (category) {
                case "박람회": return 210; // blue
                case "공연": return 0; // red (default)
                case "강연/세미나": return 120; // green
                case "전시/행사": return 45; // yellow
                case "축제": return 270; // purple
                default: return 0;
            }
        };

        // 이벤트들을 위치별로 그룹화
        const eventGroups = groupEventsByLocation(events);

        eventGroups.forEach((eventGroup) => {
            const primaryEvent = eventGroup[0]; // 그룹의 대표 이벤트

            // 위도/경도가 유효한 경우에만 마커 생성
            if (primaryEvent.latitude && primaryEvent.longitude && !isNaN(primaryEvent.latitude) && !isNaN(primaryEvent.longitude)) {
                console.log("Creating marker for event:", primaryEvent.title, primaryEvent.location, primaryEvent.latitude, primaryEvent.longitude);
                const coords = new window.kakao.maps.LatLng(primaryEvent.latitude, primaryEvent.longitude);

                // 커스텀 오버레이만 사용 (기본 마커는 생성하지 않음)
                const overlayContent = document.createElement('div');
                overlayContent.className = 'map-pin-overlay';
                // 다중 이벤트인 경우 표시 스타일 변경
                if (eventGroup.length > 1) {
                    overlayContent.style.cssText = `
                        position: relative;
                        width: 60px;
                        height: 60px;
                        cursor: pointer;
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 32px;
                        line-height: 1;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        filter: hue-rotate(${getHueRotation(primaryEvent.mainCategory)}deg) drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                        transition: all 0.3s ease;
                        pointer-events: auto;
                    `;

                    // 다중 이벤트인 경우 숫자 표시
                    overlayContent.innerHTML = `
                        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                            📍
                            <div style="
                                position: absolute;
                                top: -8px;
                                right: -8px;
                                background: #ff4444;
                                color: white;
                                border-radius: 50%;
                                width: 20px;
                                height: 20px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 12px;
                                font-weight: bold;
                                z-index: 1001;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            ">${eventGroup.length}</div>
                        </div>
                    `;
                } else {
                    overlayContent.style.cssText = `
                        position: relative;
                        width: 50px;
                        height: 50px;
                        cursor: pointer;
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 36px;
                        line-height: 1;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        filter: hue-rotate(${getHueRotation(primaryEvent.mainCategory)}deg) drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                        transition: all 0.3s ease;
                        pointer-events: auto;
                    `;
                    overlayContent.innerHTML = '📍';
                }

                overlayContent.setAttribute('data-event-id', primaryEvent.id.toString());
                overlayContent.setAttribute('data-marker', 'true');
                overlayContent.classList.add('map-pin-overlay', 'kakao-map-pin');

                const customOverlay = new window.kakao.maps.CustomOverlay({
                    content: overlayContent,
                    position: coords,
                    yAnchor: 1,
                    zIndex: 1000
                });

                customOverlay.setMap(mapInstance);
                newOverlays.push(customOverlay);
                bounds.extend(coords);

                // 호버 이벤트 핸들러들 (카드 위치 고정)
                const handleMouseEnter = (e: MouseEvent) => {
                    // 마커 애니메이션
                    overlayContent.style.transform = 'scale(1.2) translateY(-5px)';
                    overlayContent.style.filter = `hue-rotate(${getHueRotation(primaryEvent.mainCategory)}deg) drop-shadow(0 4px 8px rgba(0,0,0,0.5))`;

                    // 호버 카드 표시 (다중 이벤트 지원)
                    setHoveredEvents(eventGroup);
                    setCurrentEventIndex(0); // 첫 번째 이벤트부터 시작

                    // 카드 위치를 마커 기준으로 고정 - 개선된 좌표 변환 사용
                    const mapContainer = mapRef.current;
                    if (mapContainer && mapInstance) {
                        const rect = mapContainer.getBoundingClientRect();
                        const cardWidth = eventGroup.length > 1 ? 400 : 250;
                        const cardHeight = eventGroup.length > 1 ? 380 : 350;
                        const markerOffset = 70;

                        // 카카오맵 API를 사용한 좌표 변환
                        const projection = mapInstance.getProjection();
                        const containerPoint = projection.pointFromCoords(coords);

                        // 기본 위치 계산
                        let x = containerPoint.x - cardWidth / 2;
                        let y = containerPoint.y - cardHeight - markerOffset;

                        // 화면 경계 체크 및 조정
                        const padding = 10;

                        if (x < padding) {
                            x = padding;
                        } else if (x + cardWidth > rect.width - padding) {
                            x = rect.width - cardWidth - padding;
                        }

                        // 상하 위치 결정 로직
                        if (y + cardHeight > rect.height - padding) {
                            // 카드가 화면 아래로 벗어나는 경우 - 우선 처리
                            const belowMarkerY = containerPoint.y + 50;
                            if (belowMarkerY + cardHeight <= rect.height - padding) {
                                // 마커 아래쪽에 표시 가능
                                y = belowMarkerY;
                            } else {
                                // 마커 아래쪽에도 공간이 없으면 화면에 맞춰 위치 조정
                                y = rect.height - cardHeight - padding;
                            }
                        } else if (y < padding) {
                            // 카드가 화면 위로 벗어나는 경우
                            y = containerPoint.y + 50; // 마커 아래쪽에 표시
                        }

                        // 최종 안전장치 - 카드가 화면을 벗어나지 않도록 보장
                        x = Math.max(padding, Math.min(x, rect.width - cardWidth - padding));
                        y = Math.max(padding, Math.min(y, rect.height - cardHeight - padding));

                        // 위치 설정
                        setHoverCardPosition({ x, y });
                    }
                };

                const handleMouseLeave = () => {
                    // 마커 원래 상태로 복원
                    overlayContent.style.transform = 'scale(1) translateY(0)';
                    overlayContent.style.filter = `hue-rotate(${getHueRotation(primaryEvent.mainCategory)}deg) drop-shadow(0 2px 4px rgba(0,0,0,0.3))`;

                    // 핀에서 마우스가 나가도 카드는 유지 - 카드 클릭을 위해
                    // 카드는 지도 빈 공간 클릭 시에만 사라짐
                };

                const handleClick = () => {
                    if (eventGroup.length === 1) {
                        navigate(`/eventdetail/${eventGroup[0].id}`);
                    } else {
                        // 다중 이벤트인 경우 현재 표시 중인 이벤트의 상세로 이동
                        navigate(`/eventdetail/${eventGroup[currentEventIndex]?.id || eventGroup[0].id}`);
                    }
                };

                // 이벤트 리스너 추가 (마우스 움직임 이벤트 제거)
                overlayContent.addEventListener('mouseenter', handleMouseEnter);
                overlayContent.addEventListener('mouseleave', handleMouseLeave);
                overlayContent.addEventListener('click', handleClick);
            } else {
                console.warn("Skipping event due to invalid coordinates:", primaryEvent.title, primaryEvent.eventCode, primaryEvent.location, primaryEvent.latitude, primaryEvent.longitude);
            }
        });

        markersRef.current = newOverlays;

        // 최초 로드시에만 지도 범위 조정 (호버시 자동 주맄 방지)
        if (newOverlays.length > 0 && markersRef.current.length === 0) {
            mapInstance.setBounds(bounds);
        }
    }, [navigate]);

    // 지도 뷰 활성화 시 지도 초기화
    React.useEffect(() => {
        if (viewMode === "map") {
            loadKakaoMap(() => {
                const mapInstance = initializeMap();
                if (mapInstance && filteredEvents.length > 0) {
                    // 약간의 지연을 두고 마커 생성 (지도가 완전히 로드된 후)
                    setTimeout(() => {
                        createMarkers(mapInstance, filteredEvents);
                    }, 100);
                }
            });
        }
    }, [viewMode, initializeMap]);

    // 필터링된 이벤트가 변경될 때 마커 업데이트
    React.useEffect(() => {
        if (viewMode === "map" && map) {
            createMarkers(map, filteredEvents);
        }
    }, [filteredEvents, map, viewMode, createMarkers]);

    // 마커 호버 카드 위치 동기화 (지도 이동/줌 시) - 개선된 버전
    React.useEffect(() => {
        if (!map || hoveredEvents.length === 0) return;

        let animationFrame: number;
        const updateCardPosition = () => {
            // 애니메이션 프레임을 사용해 부드러운 업데이트
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            animationFrame = requestAnimationFrame(() => {
                if (hoveredEvents.length === 0 || !map || !mapRef.current) return;

                const currentEvent = hoveredEvents[0]; // 대표 이벤트 사용

                // 지도 좌표를 화면 좌표로 변환
                const coords = new window.kakao.maps.LatLng(currentEvent.latitude, currentEvent.longitude);
                const projection = map.getProjection();
                const containerPoint = projection.pointFromCoords(coords);

                const mapContainer = mapRef.current;
                if (mapContainer) {
                    const rect = mapContainer.getBoundingClientRect();
                    const cardWidth = hoveredEvents.length > 1 ? 400 : 250;
                    const cardHeight = hoveredEvents.length > 1 ? 380 : 350;
                    const markerOffset = 70; // 마커 위쪽에 카드를 표시하기 위한 오프셋

                    // 기본 위치 계산 (마커 중심 기준)
                    let x = containerPoint.x - cardWidth / 2;
                    let y = containerPoint.y - cardHeight - markerOffset;

                    // 화면 경계 체크 및 조정
                    const padding = 10;

                    // 좌우 경계 체크
                    if (x < padding) {
                        x = padding;
                    } else if (x + cardWidth > rect.width - padding) {
                        x = rect.width - cardWidth - padding;
                    }

                    // 상하 위치 결정 로직
                    if (y + cardHeight > rect.height - padding) {
                        // 카드가 화면 아래로 벗어나는 경우 - 우선 처리
                        const belowMarkerY = containerPoint.y + 50;
                        if (belowMarkerY + cardHeight <= rect.height - padding) {
                            // 마커 아래쪽에 표시 가능
                            y = belowMarkerY;
                        } else {
                            // 마커 아래쪽에도 공간이 없으면 화면에 맞춰 위치 조정
                            y = rect.height - cardHeight - padding;
                        }
                    } else if (y < padding) {
                        // 카드가 화면 위로 벗어나는 경우
                        y = containerPoint.y + 50; // 마커 아래쪽에 표시
                    }

                    // 최종 안전장치 - 카드가 화면을 벗어나지 않도록 보장
                    x = Math.max(padding, Math.min(x, rect.width - cardWidth - padding));
                    y = Math.max(padding, Math.min(y, rect.height - cardHeight - padding));

                    // 위치 설정
                    setHoverCardPosition({ x, y });
                }
            });
        };

        // 지도 이벤트 리스너 등록 - 디바운스 적용
        let debounceTimer: NodeJS.Timeout;
        const debouncedUpdate = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(updateCardPosition, 16); // ~60fps
        };

        window.kakao.maps.event.addListener(map, 'zoom_changed', debouncedUpdate);
        window.kakao.maps.event.addListener(map, 'center_changed', debouncedUpdate);

        // 초기 위치 설정
        updateCardPosition();

        // 클린업
        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            clearTimeout(debounceTimer);
            window.kakao.maps.event.removeListener(map, 'zoom_changed', debouncedUpdate);
            window.kakao.maps.event.removeListener(map, 'center_changed', debouncedUpdate);
        };
    }, [map, hoveredEvents, mapRef]);

    // 지도 클릭 이벤트 추가 - 빈 공간 클릭 시 카드 숨기기 (드래그 방해하지 않도록 수정)
    React.useEffect(() => {
        if (!map || viewMode !== 'map') return;

        let isDragging = false;
        let startPos = { x: 0, y: 0 };

        const handleMouseDown = (e: any) => {
            startPos = { x: e.clientX, y: e.clientY };
            isDragging = false;
        };

        const handleMouseMove = (e: any) => {
            if (startPos.x !== 0 && startPos.y !== 0) {
                const deltaX = Math.abs(e.clientX - startPos.x);
                const deltaY = Math.abs(e.clientY - startPos.y);

                // 일정 거리 이상 움직이면 드래그로 판단
                if (deltaX > 5 || deltaY > 5) {
                    isDragging = true;
                }
            }
        };

        const handleMouseUp = (e: any) => {
            // 드래그가 아닌 클릭인 경우에만 카드 숨기기
            if (!isDragging) {
                const clickedElement = e.target;

                // 마커나 카드 영역을 클릭했는지 확인
                const isMarker = clickedElement.closest('.map-pin-overlay') ||
                    clickedElement.closest('.kakao-map-pin') ||
                    clickedElement.closest('[data-marker]') ||
                    clickedElement.closest('.customoverlay');

                const isCard = clickedElement.closest('.hover-card-container') ||
                    clickedElement.closest('.hover-card');

                // 지도 빈 공간을 클릭한 경우에만 카드 숨기기
                if (!isMarker && !isCard) {
                    setHoveredEvents([]);
                    setCurrentEventIndex(0);
                    setHoverCardPosition(null);
                }
            }

            // 상태 초기화
            startPos = { x: 0, y: 0 };
            isDragging = false;
        };

        // 지도 컨테이너에 이벤트 리스너 등록
        const mapContainer = mapRef.current;
        if (mapContainer) {
            mapContainer.addEventListener('mousedown', handleMouseDown);
            mapContainer.addEventListener('mousemove', handleMouseMove);
            mapContainer.addEventListener('mouseup', handleMouseUp);

            return () => {
                mapContainer.removeEventListener('mousedown', handleMouseDown);
                mapContainer.removeEventListener('mousemove', handleMouseMove);
                mapContainer.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [map, viewMode, mapRef]);

    // 렌더 하단에서 공용 Footer 적용
    return (
        <div className="min-h-screen bg-white">
            <TopNav />

            <div className="flex justify-center w-full bg-white pt-6 pb-16 md:pt-0 md:pb-0">
                <div className="w-full max-w-[1256px] relative">
                    {/* Category Navigation */}
                    <nav className="h-[40px] border-b border-neutral-200 relative mt-2 md:mt-4 md:overflow-visible overflow-x-auto scrollbar-hide" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '-1px' }}>
                        <ul className="flex items-center h-full md:px-0 px-0 md:min-w-0 min-w-max">
                            {categories.map((category) => (
                                <li
                                    key={category.id}
                                    className="h-full flex items-center px-2.5 cursor-pointer"
                                    onClick={() => {
                                        setSelectedCategory(category.id);
                                        setSelectedSubCategory(t('eventOverview.allCategories')); // 상단 탭 변경 시 카테고리 초기화
                                    }}
                                >
                                    <span
                                        className={`
            relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
            ${selectedCategory === category.id
                                                ? (isDark ? 'font-bold text-white after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-white content-[""]' : 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]')
                                                : (isDark ? 'font-normal text-gray-300 hover:text-white' : 'font-normal text-gray-600 hover:text-black')}
        `}
                                    >
                                        {category.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* View Toggle and Filters */}
                    <div className="flex justify-between items-center mt-4 md:mt-[30px] px-4 md:px-7">
                        {/* 리스트형/캘린더형/지도형 탭 - 모바일에서 숨김 */}
                        <div className={`hidden md:flex rounded-full p-1 shadow-sm theme-transition ${isDark ? 'border border-gray-700 bg-transparent' : 'bg-white border border-gray-200'}`}>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full theme-transition focus:outline-none hover:outline-none focus:ring-0 border-0 ${viewMode === "list"
                                    ? (isDark ? 'dm-light' : 'bg-black text-white')
                                    : (isDark ? 'text-white hover:bg-white/10' : 'bg-white text-black hover:bg-gray-50')
                                    }`}
                                style={{ outline: 'none', border: 'none' }}
                            >
                                <List className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('eventOverview.viewModes.list')}형</span>
                            </button>
                            <button
                                onClick={() => {
                                    setViewMode("calendar");
                                    // 캘린더형으로 전환할 때 상단 날짜 범위를 현재 캘린더 월로 동기화
                                    setSelectedDateRange(`${calendarYear}년 ${calendarMonth}월`);
                                }}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full theme-transition focus:outline-none hover:outline-none focus:ring-0 border-0 ${viewMode === "calendar"
                                    ? (isDark ? 'dm-light' : 'bg-black text-white')
                                    : (isDark ? 'text-white hover:bg-white/10' : 'bg-white text-black hover:bg-gray-50')
                                    }`}
                                style={{ outline: 'none', border: 'none' }}
                            >
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('eventOverview.viewModes.calendar')}형</span>
                            </button>
                            <button
                                onClick={() => setViewMode("map")}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full theme-transition focus:outline-none hover:outline-none focus:ring-0 border-0 ${viewMode === "map"
                                    ? (isDark ? 'dm-light' : 'bg-black text-white')
                                    : (isDark ? 'text-white hover:bg-white/10' : 'bg-white text-black hover:bg-gray-50')
                                    }`}
                                style={{ outline: 'none', border: 'none' }}
                            >
                                <MapIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('eventOverview.viewModes.map')}형</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* 달력 필터 - 모바일에서 숨김 */}
                            <div className="relative hidden md:block">
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
                                    <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                                        {/* 년도 선택 */}
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('eventOverview.selectYear')}</h3>
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
                                                            // 년도만 변경하고 기존 선택된 날짜를 기반으로 업데이트
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
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('eventOverview.selectMonth')}</h3>
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
                                            <div className="text-sm text-gray-600 mb-1">{t('eventOverview.selectedRange')}</div>
                                            <div className="text-sm font-medium">
                                                {startDate ? `${startDate.getFullYear()}년 ${startDate.getMonth() + 1}월 ${startDate.getDate()}일` : t('eventOverview.startDateNotSelected')} ~
                                                {endDate ? `${endDate.getFullYear()}년 ${endDate.getMonth() + 1}월 ${endDate.getDate()}일` : t('eventOverview.endDateNotSelected')}
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
                                    className="flex items-center justify-between w-40 px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                >
                                    <span className="text-xs md:text-sm truncate">{selectedSubCategory}</span>
                                    <FaChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-gray-600 transition-transform flex-shrink-0 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* 카테고리 드롭다운 메뉴 */}
                                {isCategoryDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                        {selectedCategory === "all" ? (
                                            // 전체 탭일 때: 모든 1차 카테고리와 2차 카테고리 표시
                                            Object.entries(subCategories).map(([categoryKey, subCats]) => (
                                                <div key={categoryKey}>
                                                    {/* 1차 카테고리 헤더 */}
                                                    <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                                                        {categoryKey}
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
                                    className="flex items-center justify-between w-32 px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
                                    onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                                >
                                    <span className="text-xs md:text-sm truncate">{selectedRegion}</span>
                                    <FaChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-gray-600 transition-transform flex-shrink-0 ${isRegionDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* 드롭다운 메뉴 */}
                                {isRegionDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        {Object.keys(t('eventOverview.regions', { returnObjects: true })).map((regionKey) => {
                                            const region = t(`eventOverview.regions.${regionKey}`);
                                            return (
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
                                        );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 상태 필터 - 모바일에서 숨김 */}
                            <div className="relative hidden md:block">
                                <button
                                    className="flex items-center justify-between w-28 px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                >
                                    <span className="text-xs md:text-sm truncate">{selectedStatus}</span>
                                    <FaChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-gray-600 transition-transform flex-shrink-0 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* 드롭다운 메뉴 */}
                                {isStatusDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        {[
                                            t('eventOverview.allStatuses'),
                                            t('eventOverview.upcoming'),
                                            t('eventOverview.ongoing'),
                                            t('eventOverview.ended')
                                        ].map((status) => (
                                            <button
                                                key={status}
                                                className={`w-full text-left px-3 py-1 text-xs hover:bg-gray-50 ${selectedStatus === status ? 'bg-gray-100 text-black' : 'text-gray-700'}`}
                                                onClick={() => {
                                                    setSelectedStatus(status);
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 검색 결과 표시 */}
                    {searchQuery && (
                        <div className="mt-6 md:px-6 px-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="font-medium">검색 결과:</span>
                                <span className="text-blue-600 font-semibold">"{searchQuery}"</span>
                                <span className="text-gray-500">({displayEvents.length}개)</span>
                            </div>
                        </div>
                    )}

                    {/* Event Grid */}
                    {viewMode === "list" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10 px-4 md:px-6">
                            {displayEvents.length > 0 ? (
                                displayEvents.map((event) => (
                                    <div key={event.id} className="relative cursor-pointer" onClick={() => navigate(`/eventdetail/${event.id}`)}>
                                        <div className="relative group">
                                            {/* MD PICK 스티커 */}
                                            {hasMdPickInCurrentList && isEventMdPick(event) && (
                                                <div className="absolute top-2 left-2 z-10">
                                                    <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full border border-gray-200 shadow">
                                                        <img src="/images/fav.png" alt="MD PICK" className="w-4 h-4" />
                                                        <span className="text-[11px] font-extrabold text-blue-600 tracking-tight">MD PICK</span>
                                                    </div>
                                                </div>
                                            )}
                                            <img
                                                className="w-full aspect-poster-4-5 object-cover rounded-[10px] transition-transform duration-500 ease-out group-hover:scale-105"
                                                alt={event.title}
                                                src={event.thumbnailUrl || "/images/NoImage.png"}
                                            />
                                            <div className="absolute inset-0 rounded-[10px] bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                            <FaHeart
                                                className={`absolute top-4 right-4 w-5 h-5 cursor-pointer z-30 ${likedEvents.has(event.id) ? 'text-red-500' : 'text-white'} drop-shadow-lg`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleWish(event.id);
                                                }}
                                            />


                                        </div>
                                        <div className="mt-4 text-left">
                                            <span className={`inline-block px-3 py-1 rounded text-xs mb-2 ${categoryColors[event.mainCategory as keyof typeof categoryColors] || "bg-gray-100 text-gray-700"}`}>
                                                {event.mainCategory}
                                            </span>
                                            <h3 className="font-bold text-lg md:text-xl text-black mb-2 truncate">{event.title}</h3>
                                            <div className="text-xs md:text-sm text-gray-600 mb-2">
                                                <div className="font-bold">{event.location}</div>
                                                <div>
                                                    {event.startDate === event.endDate
                                                        ? new Date(event.startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '')
                                                        : `${new Date(event.startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '')} ~ ${new Date(event.endDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '')}`
                                                    }
                                                </div>
                                            </div>
                                            <p className="font-bold text-base md:text-lg text-[#ff6b35]">
                                                {event.minPrice == null
                                                    ? t('eventOverview.noPriceInfo')
                                                    : event.minPrice === 0
                                                        ? t('eventOverview.free')
                                                        : `${event.minPrice.toLocaleString()}원 ~`}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 md:col-span-4 text-center py-20">
                                    <div className="text-gray-500">
                                        {searchQuery ? (
                                            <>
                                                <p className="text-lg font-medium mb-2">{t('eventOverview.noSearchResults')}</p>
                                                <p className="text-sm">{t('eventOverview.noResultsFor', { query: searchQuery })}</p>
                                                <p className="text-sm text-gray-400 mt-1">{t('eventOverview.tryDifferentSearch')}</p>
                                            </>
                                        ) : (
                                            <p className="text-lg">{t('eventOverview.noEvents')}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === "calendar" && (
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
                                                const eventDate = new Date(event.startDate);
                                                return eventDate.getFullYear() === calendarYear &&
                                                    eventDate.getMonth() === calendarMonth - 1 &&
                                                    eventDate.getDate() === day;
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
                                                        {dayEvents.slice(0, 6).map((event) => (
                                                            <div
                                                                key={event.id}
                                                                className="text-xs flex items-center space-x-1"

                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/eventdetail/${event.id}`);
                                                                }}

                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${event.mainCategory === "박람회" ? "bg-blue-500" :
                                                                    event.mainCategory === "공연" ? "bg-red-500" :
                                                                        event.mainCategory === "강연/세미나" ? "bg-green-500" :
                                                                            event.mainCategory === "전시/행사" ? "bg-yellow-500" :
                                                                                event.mainCategory === "축제" ? "bg-gray-500" : "bg-gray-400"
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

                    {viewMode === "map" && (
                        <div className="mt-10 px-6">
                            {/* 지도형 뷰 */}
                            <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
                                {/* 지도 컨테이너 */}
                                <div
                                    ref={mapRef}
                                    className="w-full h-full"
                                />

                                {/* 범례 (카테고리별 색상 안내) */}
                                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border p-3 z-10">
                                    <div className="text-sm font-medium text-gray-700 mb-2">{t('eventOverview.categories')}</div>
                                    <div className="space-y-1">
                                        {[
                                            { category: "박람회", color: "#3B82F6" },
                                            { category: "공연", color: "#EF4444" },
                                            { category: "강연/세미나", color: "#10B981" },
                                            { category: "전시/행사", color: "#F59E0B" },
                                            { category: "축제", color: "#8B5CF6" }
                                        ].map(({ category, color }) => (
                                            <div key={category} className="flex items-center space-x-2">
                                                <div
                                                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span className="text-xs text-gray-600">{category}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 호버 카드 (3장 카드 슬라이드 지원) */}
                                {hoveredEvents.length > 0 && hoverCardPosition && (
                                    <div
                                        className="hover-card-container hover-card absolute z-50"
                                        style={{
                                            left: `${hoverCardPosition.x - (hoveredEvents.length > 1 ? 60 : 0)}px`, // 3장 카드를 위한 중앙 정렬
                                            top: `${hoverCardPosition.y}px`,
                                            width: hoveredEvents.length > 1 ? '400px' : '280px', // 3장 카드를 위한 넓은 컨테이너
                                            height: hoveredEvents.length > 1 ? '380px' : '350px',
                                            pointerEvents: 'auto',
                                            position: 'absolute'
                                        }}
                                        onMouseEnter={() => {
                                            // 카드에 마우스가 들어오면 카드 유지
                                            // 아무것도 하지 않음 - 카드가 계속 표시됨
                                        }}
                                        onMouseLeave={() => {
                                            // 카드에서 마우스가 나가도 카드는 유지 - 지도 빈 공간 클릭 시에만 사라짐
                                            // 아무것도 하지 않음
                                        }}
                                    >
                                        {hoveredEvents.length === 1 ? (
                                            // 단일 카드 레이아웃 (기존)
                                            <div
                                                className="bg-white rounded-xl shadow-2xl border overflow-hidden transform transition-all duration-200 h-full relative select-none"
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    animation: 'fadeInUp 0.2s ease-out'
                                                }}
                                            >
                                                {/* 단일 카드 내용 */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-90"></div>
                                                <div className="absolute top-3 left-3 z-20">
                                                    <span className="inline-block px-2 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white border-opacity-30">
                                                        {hoveredEvents[0]?.mainCategory}
                                                    </span>
                                                </div>

                                                <div className="relative z-10 h-full">
                                                    {/* 썸네일 영역 */}
                                                    <div className="relative h-full overflow-hidden">
                                                        <img
                                                            src={hoveredEvents[0]?.thumbnailUrl || "/images/NoImage.png"}
                                                            alt={hoveredEvents[0]?.title}
                                                            className="w-full h-full object-cover opacity-80"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                                    </div>

                                                    {/* 카드 콘텐츠 */}
                                                    <div className="absolute bottom-0 left-0 right-0 py-3 px-4 text-white bg-black bg-opacity-70">
                                                        <h3 className="text-base font-bold mb-2 line-clamp-2 text-white">
                                                            {hoveredEvents[0]?.title}
                                                        </h3>

                                                        <div className="space-y-1 mb-3">
                                                            <div className="flex items-center text-sm text-white text-opacity-90">
                                                                <MapIcon className="w-3 h-3 mr-2 flex-shrink-0" />
                                                                <span className="truncate">{hoveredEvents[0]?.location}</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-white text-opacity-90">
                                                                <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                                                                <span className="text-xs">
                                                                    {hoveredEvents[0]?.startDate === hoveredEvents[0]?.endDate
                                                                        ? new Date(hoveredEvents[0]?.startDate!).toLocaleDateString('ko-KR', {
                                                                            year: 'numeric', month: '2-digit', day: '2-digit'
                                                                        }).replace(/\s/g, '')
                                                                        : `${new Date(hoveredEvents[0]?.startDate!).toLocaleDateString('ko-KR', {
                                                                            year: 'numeric', month: '2-digit', day: '2-digit'
                                                                        }).replace(/\s/g, '')} ~ ${new Date(hoveredEvents[0]?.endDate!).toLocaleDateString('ko-KR', {
                                                                            year: 'numeric', month: '2-digit', day: '2-digit'
                                                                        }).replace(/\s/g, '')}`
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="text-sm font-bold text-yellow-200">
                                                                {hoveredEvents[0]?.minPrice == null
                                                                    ? t('eventOverview.noPriceInfo')
                                                                    : hoveredEvents[0]?.minPrice === 0
                                                                        ? t('eventOverview.free')
                                                                        : `${hoveredEvents[0]?.minPrice!.toLocaleString()}원 ~`}
                                                            </div>
                                                            <button
                                                                onClick={() => navigate(`/eventdetail/${hoveredEvents[0]?.id}`)}
                                                                className="px-3 py-1.5 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all text-xs font-medium border border-white border-opacity-30 hover:border-opacity-50"
                                                            >
                                                                상세보기
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // 3장 카드 레이아웃 (다중 이벤트)
                                            <div className="relative w-full h-full select-none">
                                                {/* 3장 카드 컨테이너 */}
                                                <div className="flex items-center justify-center w-full h-full relative">
                                                    {/* 3개 카드 렌더링 */}
                                                    {[-1, 0, 1].map((offset) => {
                                                        const eventIndex = (currentEventIndex + offset + hoveredEvents.length) % hoveredEvents.length;
                                                        const event = hoveredEvents[eventIndex];
                                                        const isCenter = offset === 0;

                                                        return (
                                                            <div
                                                                key={`${event.id}-${offset}`}
                                                                className="absolute bg-white rounded-xl shadow-2xl border overflow-hidden transform"
                                                                style={{
                                                                    width: isCenter ? '280px' : '240px',
                                                                    height: isCenter ? '350px' : '300px',
                                                                    left: `${50 + (offset * 30)}%`,
                                                                    transform: `translateX(-50%) ${!isCenter ? 'scale(0.85)' : 'scale(1)'}`,
                                                                    zIndex: isCenter ? 20 : 10,
                                                                    filter: !isCenter ? 'blur(2px)' : 'none',
                                                                    opacity: isCenter ? 1 : 0.6,
                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                                    pointerEvents: isCenter ? 'auto' : 'none',
                                                                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                                                    willChange: 'transform, filter, opacity'
                                                                }}
                                                                onClick={() => {
                                                                    if (isCenter) {
                                                                        navigate(`/eventdetail/${event.id}`);
                                                                    }
                                                                }}
                                                            >
                                                                {/* 카드 배경 그라데이션 오버레이 */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-90"></div>

                                                                {/* 카테고리 배지 */}
                                                                <div className="absolute top-3 left-3 z-20">
                                                                    <span className="inline-block px-2 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white border-opacity-30">
                                                                        {event.mainCategory}
                                                                    </span>
                                                                </div>

                                                                <div className="relative z-10 h-full">
                                                                    {/* 썸네일 영역 */}
                                                                    <div className="relative h-full overflow-hidden">
                                                                        <img
                                                                            src={event.thumbnailUrl || "/images/NoImage.png"}
                                                                            alt={event.title}
                                                                            className="w-full h-full object-cover opacity-80"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                                                    </div>

                                                                    {/* 카드 콘텐츠 (메인 카드에서만 표시) */}
                                                                    {isCenter && (
                                                                        <div className="absolute bottom-0 left-0 right-0 py-3 px-4 text-white bg-black bg-opacity-70">
                                                                            <h3 className="text-base font-bold mb-2 line-clamp-2 text-white">
                                                                                {event.title}
                                                                            </h3>

                                                                            <div className="space-y-1 mb-3">
                                                                                <div className="flex items-center text-sm text-white text-opacity-90">
                                                                                    <MapIcon className="w-3 h-3 mr-2 flex-shrink-0" />
                                                                                    <span className="truncate">{event.location}</span>
                                                                                </div>
                                                                                <div className="flex items-center text-sm text-white text-opacity-90">
                                                                                    <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                                                                                    <span className="text-xs">
                                                                                        {event.startDate === event.endDate
                                                                                            ? new Date(event.startDate).toLocaleDateString('ko-KR', {
                                                                                                year: 'numeric', month: '2-digit', day: '2-digit'
                                                                                            }).replace(/\s/g, '')
                                                                                            : `${new Date(event.startDate).toLocaleDateString('ko-KR', {
                                                                                                year: 'numeric', month: '2-digit', day: '2-digit'
                                                                                            }).replace(/\s/g, '')} ~ ${new Date(event.endDate).toLocaleDateString('ko-KR', {
                                                                                                year: 'numeric', month: '2-digit', day: '2-digit'
                                                                                            }).replace(/\s/g, '')}`
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center justify-between">
                                                                                <div className="text-sm font-bold text-yellow-200">
                                                                                    {event.minPrice == null
                                                                                        ? t('eventOverview.noPriceInfo')
                                                                                        : event.minPrice === 0
                                                                                            ? t('eventOverview.free')
                                                                                            : `${event.minPrice.toLocaleString()}원 ~`}
                                                                                </div>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        navigate(`/eventdetail/${event.id}`);
                                                                                    }}
                                                                                    className="px-3 py-1.5 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all text-xs font-medium border border-white border-opacity-30 hover:border-opacity-50"
                                                                                >
                                                                                    상세보기
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* 페이지 인디케이터와 카운터 */}
                                                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30">
                                                    <div className="flex items-center space-x-2 bg-black bg-opacity-40 backdrop-blur-sm rounded-full px-4 py-2">
                                                        <div className="flex space-x-1">
                                                            {hoveredEvents.map((_, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentEventIndex
                                                                        ? 'bg-white scale-125'
                                                                        : 'bg-white bg-opacity-50 hover:bg-opacity-80'
                                                                        }`}
                                                                    onClick={() => setCurrentEventIndex(index)}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="w-px h-4 bg-white bg-opacity-30"></div>
                                                        <span className="text-xs text-white font-medium">
                                                            {currentEventIndex + 1}/{hoveredEvents.length}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* 좌우 네비게이션 버튼 */}
                                                <button
                                                    onClick={() => setCurrentEventIndex(prev =>
                                                        prev > 0 ? prev - 1 : hoveredEvents.length - 1
                                                    )}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-black bg-opacity-50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-70 hover:scale-110 transition-all duration-200 border border-white border-opacity-20"
                                                >
                                                    {/* 왼쪽 화살표 */}
                                                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" className="text-white">
                                                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setCurrentEventIndex(prev =>
                                                        prev < hoveredEvents.length - 1 ? prev + 1 : 0
                                                    )}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-black bg-opacity-50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-70 hover:scale-110 transition-all duration-200 border border-white border-opacity-20"
                                                >
                                                    {/* 오른쪽 화살표 */}
                                                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" className="text-white">
                                                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 로딩 상태 */}
                                {filteredEvents.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
                                        <div className="text-center">
                                            <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">표시할 행사가 없습니다</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}


                </div>
            </div>
        </div>
    );
} 