import {
    Calendar,
    ChevronDown,
    List,
    Map as MapIcon,
} from "lucide-react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { TopNav } from "../../components/TopNav";
import { FaChevronDown } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi";
import { FaHeart } from "react-icons/fa";
import { eventAPI } from "../../services/event"
import type { EventSummaryDto } from "../../services/types/eventType";
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
    const [events, setEvents] = React.useState<EventSummaryDto[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState("all");
    const [selectedSubCategory, setSelectedSubCategory] = React.useState("카테고리");
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState("list"); // "list", "calendar", or "map"
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

    // 좋아요 토글 함수
    const toggleWish = async (eventId: number) => {
        // 인증 확인
        if (!isAuthed()) {
            alert("로그인 후 이용할 수 있습니다.");
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
        { id: "all", name: "전체" },
        { id: "박람회", name: "박람회" },
        { id: "공연", name: "공연" },
        { id: "강연/세미나", name: "강연/세미나" },
        { id: "전시/행사", name: "전시/행사" },
        { id: "축제", name: "축제" },
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
                size: 50,
            };

            if (selectedCategory !== "all") {
                params.mainCategoryId = mapMainCategoryToId(selectedCategory);
            }

            if (selectedSubCategory !== "카테고리") {
                params.subCategoryId = mapSubCategoryToId(selectedSubCategory);
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

            const res = await eventAPI.getEventList(params);
            setEvents(res.events ?? []);
        } catch (error) {
            console.error("행사 불러오기 실패", error);
        }
    };

    React.useEffect(() => {
        fetchEvents();
    }, [selectedCategory, selectedSubCategory, selectedRegion, startDate, endDate]);

    const isEventInDateRange = (eventStart: string, eventEnd: string) => {
        if (!startDate || !endDate) return true;
        const start = new Date(eventStart);
        const end = new Date(eventEnd);
        return start <= endDate && end >= startDate;
    };

    const filteredEvents = events.filter((event) => {
        return isEventInDateRange(event.startDate, event.endDate);
    });

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

    // 호버 카드 상태
    const [hoveredEvent, setHoveredEvent] = React.useState<EventSummaryDto | null>(null);
    const [hoverCardPosition, setHoverCardPosition] = React.useState<{ x: number; y: number } | null>(null);

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

        events.forEach((event) => {
            // 위도/경도가 유효한 경우에만 마커 생성
            if (event.latitude && event.longitude && !isNaN(event.latitude) && !isNaN(event.longitude)) {
                const coords = new window.kakao.maps.LatLng(event.latitude, event.longitude);

                // 커스텀 오버레이만 사용 (기본 마커는 생성하지 않음)
                const overlayContent = document.createElement('div');
                overlayContent.className = 'map-pin-overlay';
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
                    filter: hue-rotate(${getHueRotation(event.mainCategory)}deg) drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                    transition: all 0.3s ease;
                    pointer-events: auto;
                `;
                overlayContent.innerHTML = '📍';
                overlayContent.setAttribute('data-event-id', event.id.toString());

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
                    overlayContent.style.filter = `hue-rotate(${getHueRotation(event.mainCategory)}deg) drop-shadow(0 4px 8px rgba(0,0,0,0.5))`;

                    // 호버 카드 표시
                    setHoveredEvent(event);

                    // 카드 위치를 마커 기준으로 고정 (지도 좌표계 사용)
                    const mapContainer = mapRef.current;
                    if (mapContainer && mapInstance) {
                        const rect = mapContainer.getBoundingClientRect();
                        const cardWidth = 250;
                        const cardHeight = 350;

                        // 지도에서 마커의 화면 좌표 계산
                        const projection = mapInstance.getProjection();
                        const markerPoint = projection.pointFromCoords(coords);

                        // 마커 중심을 기준으로 카드 위치 설정 (고정)
                        let x = markerPoint.x - cardWidth / 2;
                        let y = markerPoint.y - cardHeight - 60; // 마커 위쪽에 카드

                        // 화면 경계 체크
                        if (x < 10) {
                            x = 10;
                        } else if (x + cardWidth > rect.width - 10) {
                            x = rect.width - cardWidth - 10;
                        }

                        if (y < 10) {
                            y = markerPoint.y + 40; // 마커 아래쪽에 표시
                        }

                        setHoverCardPosition({ x, y });
                    }
                };

                const handleMouseLeave = () => {
                    // 마커 원래 상태로 복원
                    overlayContent.style.transform = 'scale(1) translateY(0)';
                    overlayContent.style.filter = `hue-rotate(${getHueRotation(event.mainCategory)}deg) drop-shadow(0 2px 4px rgba(0,0,0,0.3))`;

                    // 호버 카드 즈시 숨기기 (지연 시간 최소화)
                    setTimeout(() => {
                        setHoveredEvent(null);
                        setHoverCardPosition(null);
                    }, 50);
                };

                const handleClick = () => {
                    navigate(`/eventdetail/${event.id}`);
                };

                // 이벤트 리스너 추가 (마우스 움직임 이벤트 제거)
                overlayContent.addEventListener('mouseenter', handleMouseEnter);
                overlayContent.addEventListener('mouseleave', handleMouseLeave);
                overlayContent.addEventListener('click', handleClick);
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

    // 마커 호버 카드 위치 동기화 (지도 이동/줌 시)
    React.useEffect(() => {
        if (!map || !hoveredEvent) return;

        const updateCardPosition = () => {
            if (!hoveredEvent || !map) return; // Double check in case state changed during async call

            const projection = map.getProjection();
            const coords = new window.kakao.maps.LatLng(hoveredEvent.latitude, hoveredEvent.longitude);
            const markerPoint = projection.pointFromCoords(coords);

            const mapContainer = mapRef.current;
            if (mapContainer) {
                const rect = mapContainer.getBoundingClientRect();
                const cardWidth = 320;
                const cardHeight = 320;

                let x = markerPoint.x - cardWidth / 2;
                let y = markerPoint.y - cardHeight - 60;

                // 화면 경계 체크 (same as in handleMouseEnter)
                if (x < 10) {
                    x = 10;
                } else if (x + cardWidth > rect.width - 10) {
                    x = rect.width - cardWidth - 10;
                }

                if (y < 10) {
                    y = markerPoint.y + 40;
                }

                setHoverCardPosition({ x, y });
            }
        };

        // Add listeners
        window.kakao.maps.event.addListener(map, 'zoom_changed', updateCardPosition);
        window.kakao.maps.event.addListener(map, 'center_changed', updateCardPosition);

        // Initial update in case map was already moved before hover
        updateCardPosition();

        // Cleanup listeners
        return () => {
            window.kakao.maps.event.removeListener(map, 'zoom_changed', updateCardPosition);
            window.kakao.maps.event.removeListener(map, 'center_changed', updateCardPosition);
        };
    }, [map, hoveredEvent, mapRef]);

    // 렌더 하단에서 공용 Footer 적용
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
                    <div className="flex justify-between items-center mt-[30px] px-7">
                        {/* 리스트형/캘린더형/지도형 탭 */}
                        <div className={`flex rounded-full p-1 shadow-sm theme-transition ${isDark ? 'border border-gray-700 bg-transparent' : 'bg-white border border-gray-200'}`}>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full theme-transition focus:outline-none hover:outline-none focus:ring-0 border-0 ${viewMode === "list"
                                    ? (isDark ? 'dm-light' : 'bg-black text-white')
                                    : (isDark ? 'text-white hover:bg-white/10' : 'bg-white text-black hover:bg-gray-50')
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
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full theme-transition focus:outline-none hover:outline-none focus:ring-0 border-0 ${viewMode === "calendar"
                                    ? (isDark ? 'dm-light' : 'bg-black text-white')
                                    : (isDark ? 'text-white hover:bg-white/10' : 'bg-white text-black hover:bg-gray-50')
                                    }`}
                                style={{ outline: 'none', border: 'none' }}
                            >
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">캘린더형</span>
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
                                <span className="text-sm font-medium">지도형</span>
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
                    {viewMode === "list" && (
                        <div className="grid grid-cols-4 gap-6 mt-10 px-6">
                            {displayEvents.map((event) => (
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
                                            className={`absolute top-4 right-4 w-5 h-5 cursor-pointer z-10 ${likedEvents.has(event.id) ? 'text-red-500' : 'text-white'} drop-shadow-lg`}
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
                                        <h3 className="font-bold text-xl text-black mb-2 truncate">{event.title}</h3>
                                        <div className="text-sm text-gray-600 mb-2">
                                            <div className="font-bold">{event.location}</div>
                                            <div>
                                                {event.startDate === event.endDate
                                                    ? new Date(event.startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '')
                                                    : `${new Date(event.startDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '')} ~ ${new Date(event.endDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '')}`
                                                }
                                            </div>
                                        </div>
                                        <p className="font-bold text-lg text-[#ff6b35]">
                                            {event.minPrice == null
                                                ? "가격 정보 없음"
                                                : event.minPrice === 0
                                                    ? "무료"
                                                    : `${event.minPrice.toLocaleString()}원 ~`}
                                        </p>
                                    </div>
                                </div>
                            ))}
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
                                    <div className="text-sm font-medium text-gray-700 mb-2">카테고리</div>
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

                                {/* 호버 카드 */}
                                {hoveredEvent && hoverCardPosition && (
                                    <div
                                        className="absolute z-50"
                                        style={{
                                            left: `${hoverCardPosition.x}px`,
                                            top: `${hoverCardPosition.y}px`,
                                            width: '250px',
                                            height: '320px',
                                            pointerEvents: 'auto',
                                            position: 'absolute'
                                        }}
                                        onMouseLeave={() => {
                                            // 카드에서 마우스가 나가면 즉시 카드 숨기기
                                            setHoveredEvent(null);
                                            setHoverCardPosition(null);
                                        }}
                                    >
                                        <div
                                            className="bg-white rounded-xl shadow-2xl border overflow-hidden transform transition-all duration-200 h-full"
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                animation: 'fadeInUp 0.2s ease-out'
                                            }}
                                        >
                                            {/* 카드 배경 그라데이션 오버레이 */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-90"></div>

                                            {/* 카테고리 배지 */}
                                            <div className="absolute top-3 left-3 z-20">
                                                <span className="inline-block px-2 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white border-opacity-30">
                                                    {hoveredEvent.mainCategory}
                                                </span>
                                            </div>

                                            <div className="relative z-10 h-full">
                                                {/* 썸네일 영역 */}
                                                <div className="relative h-full overflow-hidden">
                                                    <img
                                                        src={hoveredEvent.thumbnailUrl || "/images/NoImage.png"}
                                                        alt={hoveredEvent.title}
                                                        className="w-full h-full object-cover opacity-80"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                                </div>

                                                {/* 카드 콘텐츠 */}
                                                <div className="absolute bottom-0 left-0 right-0 py-3 px-4 text-white bg-black bg-opacity-70">
                                                    <h3 className="text-base font-bold mb-2 line-clamp-2 text-white">
                                                        {hoveredEvent.title}
                                                    </h3>

                                                    <div className="space-y-1 mb-3">
                                                        <div className="flex items-center text-sm text-white text-opacity-90">
                                                            <MapIcon className="w-3 h-3 mr-2 flex-shrink-0" />
                                                            <span className="truncate">{hoveredEvent.location}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-white text-opacity-90">
                                                            <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                                                            <span className="text-xs">
                                                                {hoveredEvent.startDate === hoveredEvent.endDate
                                                                    ? new Date(hoveredEvent.startDate).toLocaleDateString('ko-KR', {
                                                                        year: 'numeric', month: '2-digit', day: '2-digit'
                                                                    }).replace(/\s/g, '')
                                                                    : `${new Date(hoveredEvent.startDate).toLocaleDateString('ko-KR', {
                                                                        year: 'numeric', month: '2-digit', day: '2-digit'
                                                                    }).replace(/\s/g, '')} ~ ${new Date(hoveredEvent.endDate).toLocaleDateString('ko-KR', {
                                                                        year: 'numeric', month: '2-digit', day: '2-digit'
                                                                    }).replace(/\s/g, '')}`
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm font-bold text-yellow-200">
                                                            {hoveredEvent.minPrice == null
                                                                ? "가격 정보 없음"
                                                                : hoveredEvent.minPrice === 0
                                                                    ? "무료"
                                                                    : `${hoveredEvent.minPrice.toLocaleString()}원 ~`}
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/eventdetail/${hoveredEvent.id}`)}
                                                            className="px-3 py-1.5 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all text-xs font-medium border border-white border-opacity-30 hover:border-opacity-50"
                                                        >
                                                            상세보기
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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