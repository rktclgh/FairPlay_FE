import React, { useState, useEffect } from "react";
import dayjs from 'dayjs';
import api from "../api/axios";
import {
    FaHeart,
    FaMapMarkerAlt
} from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi";
import { TopNav } from "../components/TopNav";
import { useTheme } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { requireAuth, isAuthenticated } from "../utils/authGuard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import { eventAPI } from "../services/event"
import type {
    EventSummaryDto
} from "../services/types/eventType";
import { useTranslation } from 'react-i18next';
import "swiper/css/effect-coverflow";
import type { HotPick } from "../services/event";
import NewLoader from "../components/NewLoader";


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

    const [showBirthdayModal, setShowBirthdayModal] = useState(false);
    const [gender, setGender] = useState<string>("")
    const today = new Date();

    const [currentCalendarYear, setCurrentCalendarYear] = useState<number>(today.getFullYear());
    const [currentCalendarMonth, setCurrentCalendarMonth] = useState<number>(today.getMonth() + 1);
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // 날짜 문자열로 변경

    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const isDateInFuture = (date: string) => {
        const todayString = getTodayDateString();
        return date >= todayString;
    };
    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

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

    const handleSubmit = async () => {
        if (!selectedDate) {
            alert(t('main.selectBirthday'));
            return;
        }
        const formatted = selectedDate;
        try {
            await api.post("/api/users/mypage/edit", { birthday: formatted, gender });
            alert(t('main.birthdaySaveSuccess'));
            setShowBirthdayModal(false); // 모달 닫기
        } catch (error) {
            console.error(error);
            alert(t('main.birthdaySaveFailed'));
        }
    };

    // 예: 로그인 시 생년월일 정보가 없으면 모달 표시
    useEffect(() => {
        if (!isAuthenticated()) {
            return;
        }

        const checkBirthday = async () => {
            try {
                const res = await api.get("/api/users/mypage");
                if (!res.data.birthday) {
                    setShowBirthdayModal(true);
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkBirthday();
    }, []);


    const { isDark } = useTheme();
    const { t } = useTranslation();

    const [events, setEvents] = useState<EventSummaryDto[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("전체");
    const [loading, setLoading] = useState(true);


    const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set());
    const navigate = useNavigate();

    // const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

    const authHeaders = () => {
        const token = localStorage.getItem("accessToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const toggleWish = async (eventId: number) => {
        // 인증 확인
        if (!requireAuth(navigate, t('wishlist.requireAuth'))) {
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
                    params: { eventId },            // ★ body 말고 params!
                    headers: authHeaders(),
                });
            }
        } catch (e) {
            console.error(t('wishlist.toggleFailed'), e);
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
            // 필요하면 안내
            // alert("로그인이 필요하거나 권한이 부족합니다.");
        }
    };

    const mapMainCategoryToId = (name: string): number | undefined => {
        // 번역된 카테고리와 한국어 카테고리 모두 지원
        switch (name) {
            case t('categories.exhibition'):
            case "박람회":
                return 1;
            case t('categories.lecture'):
            case "강연/세미나":
                return 2;
            case t('categories.event'):
            case "전시/행사":
                return 3;
            case t('categories.performance'):
            case "공연":
                return 4;
            case t('categories.festival'):
            case "축제":
                return 5;
            default:
                return undefined;
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
                includeHidden: boolean;
                page?: number;
                size?: number;
            } = {
                page: 0,
                size: 20,
            };

            params.includeHidden = false;

            if (selectedCategory !== t('categories.all') && selectedCategory !== "전체") {
                params.mainCategoryId = mapMainCategoryToId(selectedCategory);
            }

            const response = await eventAPI.getEventList(params);
            setEvents(response.events ?? []);
        } catch (error) {
            console.error(t('wishlist.loadFailed'), error);
            // 오류 발생 시 빈 배열로 설정하여 UI가 깨지지 않도록 함
            setEvents([]);
        }
    };

    useEffect(() => {
        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };

    // 번역된 카테고리 배열 생성
    const getTranslatedCategories = () => [
        { key: "전체", label: t('categories.all') },
        { key: "박람회", label: t('categories.exhibition') },
        { key: "공연", label: t('categories.performance') },
        { key: "강연/세미나", label: t('categories.lecture') },
        { key: "전시/행사", label: t('categories.event') },
        { key: "축제", label: t('categories.festival') }
    ];


    // 유료광고 행사 상태
    const [paidAdvertisements, setPaidAdvertisements] = useState<PaidAdvertisement[]>([]);

    // 유료광고 행사 데이터 로드 (백엔드 연동 전까지 임시 데이터 사용)
    const loadPaidAdvertisements = async () => {
        try {
            // TODO: 백엔드 연동 후 실제 API 호출로 교체
            // const ads = await eventApi.getPaidAdvertisements();

            // 임시 데이터 (백엔드 연동 전까지 사용)
            // 실제 행사 ID로 매핑 (events 배열에서 제목으로 찾기)
            const tempAds: PaidAdvertisement[] = [
                {
                    id: 19, // G-DRAGON 행사 ID
                    title: "G-DRAGON 2025 WORLD TOUR IN JAPAN",
                    imageUrl: "/images/gd1.png",
                    thumbnailUrl: "/images/gd2.png",
                    linkUrl: "/event/19",
                    startDate: "2025-05-25",
                    endDate: "2025-05-25",
                    isActive: true,
                    priority: 1
                },
                {
                    id: 20, // YE LIVE IN KOREA 행사 ID
                    title: "YE LIVE IN KOREA",
                    imageUrl: "/images/YE3.png",
                    thumbnailUrl: "/images/YE3.png",
                    linkUrl: "/event/20",
                    startDate: "2025-06-15",
                    endDate: "2025-06-15",
                    isActive: true,
                    priority: 2
                },
                {
                    id: 21, // Post Malone Concert 행사 ID
                    title: "Post Malone Concert",
                    imageUrl: "/images/malone1.jpg",
                    thumbnailUrl: "/images/malone.jpg",
                    linkUrl: "/event/21",
                    startDate: "2025-07-20",
                    endDate: "2025-07-20",
                    isActive: true,
                    priority: 3
                },
                {
                    id: 22, // THE ROSE 행사 ID
                    title: "THE ROSE 2025 LIVE IN SEOUL",
                    imageUrl: "/images/therose2.png",
                    thumbnailUrl: "/images/therose1.png",
                    linkUrl: "/event/22",
                    startDate: "2025-08-10",
                    endDate: "2025-08-10",
                    isActive: true,
                    priority: 4
                },
                {
                    id: 23, // eaJ 행사 ID
                    title: "eaJ LIVE IN SEOUL",
                    imageUrl: "/images/eaj2.jpg",
                    thumbnailUrl: "/images/eaj1.jpg",
                    linkUrl: "/event/23",
                    startDate: "2025-09-05",
                    endDate: "2025-09-05",
                    isActive: true,
                    priority: 5
                },
                {
                    id: 24, // 사이버 보안 컨퍼런스 행사 ID
                    title: "사이버 보안 컨퍼런스 2025",
                    imageUrl: "/images/cyber2.png",
                    thumbnailUrl: "/images/cyber.png",
                    linkUrl: "/event/24",
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

    useEffect(() => {
        (async () => {
            // 로그인한 사용자만 위시리스트 로드
            if (!isAuthenticated()) {
                return;
            }

            try {
                const res = await api.get("/api/wishlist", { headers: authHeaders() });
                const s = new Set<number>();
                type WishlistItem = { eventId: number };
                (res.data as WishlistItem[] | undefined)?.forEach((w) => s.add(w.eventId));
                setLikedEvents(s);
            } catch (e: unknown) {
                console.error("위시리스트 로드 실패:", e);
            }
        })();
    }, []);


    // 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const eventsData = await eventAPI.getEventList({ size: 15, includeHidden: false });
                setEvents(eventsData.events);

                // 유료광고 데이터 로드
                await loadPaidAdvertisements();

                // HOT PICKS 백엔드 연동
                try {
                    const hot = await eventAPI.getHotPicks({ size: 10 });
                    setHotPicks(hot); // 매핑 없이 바로
                } catch (e) {
                    console.error("HOT PICKS 로드 실패:", e);
                }
            } catch (error) {
                console.error("데이터 로드 실패:", error);
                setEvents([]);
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


    // Hot Picks는 Swiper로 전환하여 수동 인덱스 제어 제거

    // Hot Picks 상태 (백엔드 연결 후 실제 예매 데이터로 교체 예정)
    const [hotPicks, setHotPicks] = useState<HotPick[]>([]);
    const [activeHotPickIndex, setActiveHotPickIndex] = useState<number>(0);

    // 임시 Hot Picks 데이터 (백엔드 연결 전까지 사용)
    // 실제 행사 ID로 매핑 (events 배열에서 제목으로 찾기)
    const tempHotPicks: HotPick[] = [
        {
            id: 19, // G-DRAGON 행사 ID
            title: "G-DRAGON 2025 WORLD TOUR IN JAPAN",
            date: "2025.05.25",
            location: "KYOCERA DOME OSAKA",
            category: "공연",
            image: "/images/gd2.png",
        },
        {
            id: 20, // YE LIVE IN KOREA 행사 ID
            title: "YE LIVE IN KOREA",
            date: "2025.06.15",
            location: "인천문학경기장",
            category: "공연",
            image: "/images/YE3.png",
        },
        {
            id: 25, // 명원 세계 차 박람회 행사 ID
            title: "2025 명원 세계 차 박람회",
            date: "2025-09-11 ~ 2025-09-14",
            location: "코엑스 B2홀",
            category: "박람회",
            image: "/images/tea.png",
        },
        {
            id: 24, // 사이버 보안 컨퍼런스 행사 ID
            title: "사이버 보안 컨퍼런스 2025",
            date: "2025-09-10 ~ 2025-09-12",
            location: "코엑스 D홀",
            category: "강연/세미나",
            image: "/images/cyber.png",
        },
        {
            id: 22, // THE ROSE 행사 ID
            title: "THE ROSE 2025 LIVE IN SEOUL",
            date: "2025.09.20",
            location: "KSPO DOME",
            category: "공연",
            image: "/images/therose1.png",
        },
        {
            id: 23, // eaJ 행사 ID
            title: "eaJ LIVE IN SEOUL",
            date: "2025.09.25",
            location: "YES24 라이브홀",
            category: "공연",
            image: "/images/eaj1.jpg",
        },
        {
            id: 26, // 한가위 명절선물전 행사 ID
            title: "2025 한가위 명절선물전",
            date: "2025-08-25 ~ 2025-08-28",
            location: "COEX 컨벤션홀",
            category: "전시/행사",
            image: "/images/coex.png",
        },
        {
            id: 27, // 케이펫페어 서울 행사 ID
            title: "2025 케이펫페어 서울",
            date: "2025-08-13 ~ 2025-08-16",
            location: "킨텍스 제1전시장",
            category: "박람회",
            image: "/images/pet.jpg",
        },
        {
            id: 28, // JOYURI FAN-CON 행사 ID
            title: "2025 JOYURI FAN-CON",
            date: "추후 공개",
            location: "추후 공개",
            category: "공연",
            image: "/images/joyuri.jpg",
        },
        {
            id: 29, // IU HEREH WORLD TOUR CONCERT 행사 ID
            title: "IU HEREH WORLD TOUR CONCERT",
            date: "추후 공개",
            location: "추후 공개",
            category: "공연",
            image: "/images/iu.jpg",
        },
    ];

    // Hot Picks 데이터 (백엔드 연결 후 hotPicks로 교체)
    const allHotPicks = hotPicks.length > 0 ? hotPicks : tempHotPicks;

    const todayKey = dayjs().format("YYYY-MM-DD");

    const getMdPickIdsForToday = (): Set<number> => {
        try {
            if (typeof window === "undefined") return new Set<number>(); // SSR 대비(필요시)
            const raw = localStorage.getItem(`mdpick:${todayKey}`);
            const arr = raw ? JSON.parse(raw) : null;
            return Array.isArray(arr)
                ? new Set<number>(
                    arr.slice(0, 2)
                        .map((v: unknown) => Number(v))
                        .filter((n) => Number.isFinite(n))
                )
                : new Set<number>();
        } catch {
            return new Set<number>();
        }
    };

    // MD PICK 우선 노출 인식: 로컬스토리지에서 오늘 날짜의 ID/제목을 모두 읽는다
    // [백엔드 연동 필요]
    // - 오늘 노출할 MD PICK 이벤트 ID 목록을 API로 전달받아 사용하세요.
    // - 현재는 로컬스토리지 키 'mdpick:YYYY-MM-DD'에서 읽도록 남겨두었습니다. API 적용 시 이 함수들을 대체하세요.


    // [백엔드 연동 필요]
    // - 임시 보조: 제목 기반 매칭용 키입니다. 백엔드가 ID를 제공하면 제거해도 됩니다.
    const getMdPickTitlesForToday = (): Set<string> => {
        try {
            if (typeof window === "undefined") return new Set<string>(); // SSR 대비(필요시)
            const raw = localStorage.getItem(`mdpick_titles:${todayKey}`);
            const arr = raw ? JSON.parse(raw) : null;
            return Array.isArray(arr)
                ? new Set<string>(arr.slice(0, 2).map((v: unknown) => String(v)))
                : new Set<string>();
        } catch {
            return new Set<string>();
        }
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

    const hasMdPickInCurrentList = events.some(e => isEventMdPick(e));
    const displayEvents = hasMdPickInCurrentList
        ? [...events].sort((a, b) => {
            const aPick = isEventMdPick(a) ? 1 : 0;
            const bPick = isEventMdPick(b) ? 1 : 0;
            return bPick - aPick;
        })
        : events;

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? '' : 'bg-white'} flex items-center justify-center theme-transition`}>
                <NewLoader />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? '' : 'bg-white'} theme-transition`}>
            <TopNav />

            {isAuthenticated() && showBirthdayModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
                    <div className="bg-white p-6 rounded shadow-lg w-96 z-[9999]">

                        <h2 className="text-lg font-bold mb-4">{t('main.personalInfo')}</h2>


                        {/* 달력 */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {/* 년도 선택 드롭다운 */}
                                <select
                                    value={currentCalendarYear}
                                    onChange={(e) => setCurrentCalendarYear(Number(e.target.value))}
                                    className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {Array.from({ length: 100 }, (_, i) => today.getFullYear() - 80 + i).map(year => (
                                        <option key={year} value={year}>
                                            {year}{t('main.year')}
                                        </option>
                                    ))}
                                </select>
                                {/* 월 선택 드롭다운 */}
                                <select
                                    value={currentCalendarMonth}
                                    onChange={(e) => setCurrentCalendarMonth(Number(e.target.value))}
                                    className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <option key={month} value={month}>
                                            {month}{t('main.month')}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                                    title={t('main.previousMonth')}
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
                                    title={t('main.nextMonth')}
                                >
                                    ▶
                                </button>
                            </div>
                        </div>

                        {/* 요일 헤더 */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {[t('main.sun'), t('main.mon'), t('main.tue'), t('main.wed'), t('main.thu'), t('main.fri'), t('main.sat')].map((day, index) => (
                                <div key={day} className={`p-1 text-xs font-medium text-center ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                                    }`}>
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {generateCalendarDays().map((day, index) => {
                                const isSelected = selectedDate === day.dateString;
                                const isPast = !isDateInFuture(day.dateString);
                                const isPastDate = !isDateInFuture(day.dateString);

                                return (
                                    <button
                                        key={index}
                                        onClick={() => (isPastDate) ? handleDateSelect(day.dateString) : null}
                                        className={`p-1.5 text-xs rounded transition-colors relative h-8 ${isPast
                                            ? isSelected
                                                ? 'bg-blue-600 text-white'       // 선택된 날짜 스타일
                                                : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer' // 과거 날짜 스타일
                                            : 'text-gray-400 cursor-not-allowed' // 비활성 날짜
                                            }`}
                                    >
                                        {day.date}

                                        {isSelected && (
                                            <div className="absolute inset-0 bg-blue-600 rounded opacity-50"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* 성별 선택 */}
                        <label className="block mb-2">{t('main.gender')}</label>
                        <div className="flex gap-4 mb-4">
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="MALE"
                                    checked={gender === "MALE"}
                                    onChange={(e) => setGender(e.target.value)}
                                /> {t('main.male')}
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="FEMALE"
                                    checked={gender === "FEMALE"}
                                    onChange={(e) => setGender(e.target.value)}
                                /> {t('main.female')}
                            </label>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                        >
                            {t('common.save')}
                        </button>

                        {/* 모달 닫기 버튼 */}
                        <button
                            onClick={() => setShowBirthdayModal(false)}
                            className="mt-2 text-sm text-gray-500 hover:underline"
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </div>
            )}


            {/* 히어로 섹션 */}
            <div className={`relative w-full aspect-square sm:h-[400px] md:h-[600px] ${isDark ? '' : 'bg-gray-100'} theme-transition`}>
                <Swiper
                    modules={[Autoplay, EffectFade]}
                    effect="fade"
                    autoplay={{ delay: 4000 }}
                    loop={true}
                    className="w-full h-full"
                    onSwiper={(swiper) => {
                        // Swiper 인스턴스를 저장
                        (window as unknown as Window).heroSwiper = swiper;
                    }}
                >
                    {paidAdvertisements.map((ad) => (
                        <SwiperSlide key={ad.id}>
                            <div
                                className="w-full h-full cursor-pointer"
                                onClick={() => navigate(`/eventdetail/${ad.id}`)}
                            >
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.log('히어로 이미지 로드 실패:', e);
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* 하단 작은 포스터들 */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-3 pb-8 z-10">
                    {paidAdvertisements.map((ad, index) => (
                        <div
                            key={ad.id}
                            className="w-12 h-16 md:w-16 md:h-20 cursor-pointer transition-all duration-300 hover:scale-110 opacity-60 hover:opacity-100"
                            onMouseEnter={() => {
                                const swiper = (window as unknown as Window & { heroSwiper?: any }).heroSwiper;
                                if (swiper) {
                                    // loop 모드에서는 slideToLoop를 사용해야 원본 인덱스와 정확히 매칭됩니다.
                                    swiper.slideToLoop(index);
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

            {/* 핫픽스 섹션 (3D 커버플로우) */}
            <div className="py-8 md:py-16 theme-surface theme-transition">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{t('main.hotPicks')}</h2>
                    </div>

                    <Swiper
                        modules={[Navigation, Autoplay, EffectCoverflow]}
                        navigation
                        effect="coverflow"
                        coverflowEffect={{
                            rotate: 0,
                            stretch: -30,
                            depth: 220,
                            modifier: 1,
                            slideShadows: false
                        }}
                        slidesPerView="auto"
                        centeredSlides={true}
                        loop={true}
                        spaceBetween={0}
                        watchSlidesProgress={true}
                        speed={900}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        className="w-full hotpick-swiper"
                        onSwiper={(swiper) => {
                            setActiveHotPickIndex(swiper.realIndex % allHotPicks.length);
                        }}
                        onSlideChange={(swiper) => {
                            setActiveHotPickIndex(swiper.realIndex % allHotPicks.length);
                        }}
                    >
                        {allHotPicks.map((item, index) => (
                            <SwiperSlide key={item.id} className="hotpick-slide">
                                <div
                                    className="group relative w-full rounded-[10px] overflow-hidden cursor-pointer"
                                    onClick={() => navigate(`/eventdetail/${item.id}`)}
                                >
                                    <img
                                        src={item.image}
                                        alt={`Hot Pick ${index + 1}`}
                                        className="w-full aspect-poster-4-5 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/FPlogo.png'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* 중앙 캡션 (블루스퀘어 스타일) */}
                    <div className="mt-4 md:mt-6 text-center px-4">
                        <div key={activeHotPickIndex} className={`text-xl md:text-[28px] font-extrabold leading-tight truncate anim-fadeInUp ${isDark ? 'text-white' : 'text-black'}`}>
                            {allHotPicks[activeHotPickIndex]?.title}
                        </div>
                        <div key={`meta-${activeHotPickIndex}`} className="mt-2 space-y-1 anim-fadeInUp">
                            <div className={`text-xs md:text-sm flex items-center justify-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                <HiOutlineCalendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="truncate">
                                    {(allHotPicks[activeHotPickIndex]?.date || "").replaceAll('.', '-').replace(' ~ ', ' - ')}
                                </span>
                            </div>
                            <div className={`text-xs md:text-sm flex items-center justify-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                <FaMapMarkerAlt className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="truncate">
                                    {allHotPicks[activeHotPickIndex]?.location}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 행사 섹션 */}
            <div className="py-8 md:py-16 theme-surface theme-transition">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{t('main.events')}</h2>
                    </div>

                    {/* 필터 버튼들 */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex md:flex-wrap overflow-x-auto md:overflow-visible whitespace-nowrap no-scrollbar gap-2 md:gap-4 -mx-4 px-4">
                            {getTranslatedCategories().map((category, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleCategoryChange(category.key)}
                                    className={`shrink-0 inline-flex px-3 py-3 md:px-4 md:py-2 rounded-full text-xs md:text-sm border theme-transition whitespace-nowrap ${selectedCategory === category.key
                                        ? (isDark
                                            ? 'dm-light font-bold border-gray-300'
                                            : 'bg-black text-white font-bold border-gray-800')
                                        : (isDark
                                            ? 'bg-black text-white border-gray-600 hover:bg-gray-800 font-semibold'
                                            : 'bg-white text-black border-gray-400 hover:bg-gray-50 font-semibold')
                                        }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 행사 카드들 */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {displayEvents.map((event) => (
                            <div key={event.id} className="relative">
                                <Link to={`/eventdetail/${event.id}`}>
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
                                            src={event.thumbnailUrl}
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

                                        <span className={`${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'} inline-block px-3 py-1 rounded text-xs mb-2`}>
                                            {event.mainCategory}
                                        </span>
                                        <h3 className={`font-bold text-lg md:text-xl mb-2 truncate ${isDark ? 'text-white' : 'text-black'}`}>{event.title}</h3>
                                        <div className={`text-xs md:text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            <div className="font-bold">{event.location}</div>
                                            <div>{dayjs(event.startDate).format('YYYY.MM.DD')} ~ {dayjs(event.endDate).format('YYYY.MM.DD')}</div>
                                        </div>
                                        <p className="font-bold text-base md:text-lg text-[#ff6b35]">{event.minPrice == null
                                            ? t('main.noPriceInfo')
                                            : event.minPrice === 0
                                                ? t('main.free')
                                                : `${event.minPrice.toLocaleString()}${t('main.won')}`}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* 전체보기 버튼 */}
                    <div className="text-center mt-8 md:mt-12">
                        <Link to="/eventoverview">
                            <button className={`px-4 py-2 rounded-[10px] text-sm border font-semibold ${isDark ? 'bg-black text-white border-gray-600 hover:bg-gray-800' : 'bg-white text-black border-gray-400 hover:bg-gray-50'}`}>
                                {t('mypage.favorites.viewAll')}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>


        </div>
    );
}; 