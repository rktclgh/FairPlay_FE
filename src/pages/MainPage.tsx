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
import { useScrollToTop } from "../hooks/useScrollToTop";

// imports 밑에 위치
const ENABLE_NEW_PICKS = import.meta.env.VITE_ENABLE_NEW_PICKS === "true";

// HMR 테스트 주석 제거

// 카테고리 번역 함수
const translateCategory = (category: string, t: any): string => {
  const categoryMap: Record<string, string> = {
    "박람회": "categories.박람회",
    "공연": "categories.공연",
    "강연/세미나": "categories.강연/세미나",
    "전시/행사": "categories.전시/행사",
    "축제": "categories.축제"
  };

  return categoryMap[category] ? t(categoryMap[category]) : category;
};

// 카테고리별 색상 정의
const categoryColors = {
  "박람회": "bg-blue-100 text-blue-800 border border-blue-200",
  "공연": "bg-red-100 text-red-800 border border-red-200",
  "강연/세미나": "bg-green-100 text-green-800 border border-green-200",
  "전시/행사": "bg-yellow-100 text-yellow-800 border border-yellow-200",
  "축제": "bg-gray-100 text-gray-800 border border-gray-300"
};

// 이벤트 제목 선택 함수 (번역 여부에 따라 한글/영문 제목 선택)
const getEventTitle = (event: EventSummaryDto, i18n: any): string => {
  // 현재 언어가 영어이고 영문 제목이 있는 경우 영문 제목 사용
  if (i18n.language === 'en' && event.titleEng && event.titleEng.trim() !== '') {
    return event.titleEng;
  }
  // 그 외의 경우 한글 제목 사용
  return event.title;
};

// 유료광고 행사 인터페이스
interface PaidAdvertisement {
  id: number;
  eventId?: number | null;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number; // 노출 순서
}

// 제목 정규화 유틸 그대로 사용
const norm = (s: string) => (s || "").toLowerCase().replace(/[\s\-_/·・‧ㆍ]/g, "");

// URL에서 event id 뽑기: /eventdetail/123, /event/123, ?eventId=123, ?eid=123, ?id=123 모두 지원
const extractEventId = (url?: string | null): number | null => {
  if (!url) return null; // ← 이거 꼭 필요!

  try {
    // 절대/상대 URL 모두 OK
    const u = new URL(url, window.location.origin);
    // /eventdetail/123, /event/123 (뒤에 슬래시 있어도 OK)
    const m1 = u.pathname.match(/(?:\/eventdetail\/|\/event\/)(\d+)(?=\/|$)/i);
    if (m1) return Number(m1[1]);
    // ?eventId=123, ?event_id=123, ?eid=123, ?id=123
    const m2 = u.search.match(/[?&](?:eventId|event_id|eid|id)=(\d+)/i);
    return m2 ? Number(m2[1]) : null;
  } catch {
    // URL 파싱 실패 시 백업 정규식
    const m =
      url.match(/(?:\/eventdetail\/|\/event\/)(\d+)(?=\/|$)/i) ||
      url.match(/[?&](?:eventId|event_id|eid|id)=(\d+)/i);
    return m ? Number(m[1]) : null;
  }
};

// 제목으로 느슨하게 매칭(정확=우선, 포함=보조)
const findEventByTitle = (title: string, events: EventSummaryDto[]) => {
  const n = norm(title);
  const exact = events.find(e => norm(e.title) === n);
  if (exact) return exact;

  const candidates = events.filter(e => {
    const t = norm(e.title);
    return t.includes(n) || n.includes(t);
  });
  return candidates.length === 1 ? candidates[0] : null;
};

const gotoAdDetail = (
  ad: PaidAdvertisement,
  events: EventSummaryDto[],
  navigate: ReturnType<typeof useNavigate>
) => {
  // 0) (선택) 백엔드가 배너에 eventId를 내려줄 수 있다면 최우선 사용
  // if ((ad as any).eventId) return navigate(`/eventdetail/${(ad as any).eventId}`);
  if (ad.eventId) {
    navigate(`/eventdetail/${ad.eventId}`);
    return;
  }

  // 1) URL 안에서 id 추출
  const idFromUrl = extractEventId(ad.linkUrl);
  if (idFromUrl) {
    navigate(`/eventdetail/${idFromUrl}`);
    return;
  }

  // 2) 제목으로 매칭
  const byTitle = ad.title ? findEventByTitle(ad.title, events) : null;
  if (byTitle?.id) {
    navigate(`/eventdetail/${byTitle.id}`);
    return;
  }

  // 3) 마지막: 외부 URL 열지 말고 안내 (원하시면 eventoverview로 보내도 OK)
  alert("연결된 이벤트를 찾지 못했어요. 배너 링크를 /eventdetail/{id} 또는 ?eventId={id} 형식으로 저장해주세요.");
};


//  백엔드 배너 응답형 (BannerResponseDto 가정)
type BannerResp = {
  id: number;
  eventId?: number | null;
  title?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  priority?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  statusCode?: string | null;        // "ACTIVE"
  bannerTypeCode?: string | null;    // "HERO"
  smallImageUrl?: string | null;
};

// 서버 응답 (FixedTopDto 가정: eventId 필수)
type SearchTopDto = {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  priority: number;
  startDate: string; // ISO
  endDate: string;   // ISO
  eventId: number;   // ★ 스티커/이동용 핵심
};

// ★ NEW 픽 응답 (백엔드 /api/banner/new-picks)
type NewPickDto = {
  id: number;         // = eventId
  title: string;
  image: string | null;
  date: string | null;
  location: string | null;
  category: string | null;
  createdAt: string;   // ISO string "2025-08-20T13:25:30"
  isNew?: boolean;
};


const NEW_DAYS = 3;

const getCreated = (o: NewPickDto) =>
  (o.createdAt ?? o.created_at ?? "") as string;

//const getEventId = (o: NewPickDto) =>
//Number.isFinite(o.id) ? o.id :
// Number.isFinite(o.eventId as number) ? (o.eventId as number) : NaN;

const fetchNewPicks = async (size = 20): Promise<NewPickDto[]> => {
  try {
    const { data } = await api.get<NewPickDto[] | NewPickDto>("/api/banners/new-picks", {
      params: { size },
    });
    const list = Array.isArray(data) ? data : data ? [data] : [];
    if (!list.length) return [];

    const today = dayjs();
    const isNew = (created: string) => created && today.diff(dayjs(created), "day") < NEW_DAYS;

    return list.map(item => {
      const created = getCreated(item) || "";
      const eid =
        Number.isFinite(item.id) ? item.id
          : Number.isFinite((item as any).eventId) ? (item as any).eventId
            : NaN;
      return {
        ...item,
        id: Number.isFinite(eid) ? eid : NaN,
        createdAt: created || undefined,
        isNew: created ? isNew(created) : false,
      } as NewPickDto & { isNew?: boolean };
    });
  } catch (e) {
    console.warn("[NEW-PICKS] request failed:", e);
    return [];
  }
};




const fetchSearchTopToday = async (): Promise<SearchTopDto[]> => {
  // 오늘 날짜 기준 (백엔드는 date null이면 today 처리하지만 명시적으로 줘도 OK)
  const today = dayjs().format("YYYY-MM-DD");
  const { data } = await api.get<SearchTopDto[]>("/api/banner/search-top", {
    params: { date: today },
  });
  return Array.isArray(data) ? data : [];
};



export const Main: React.FC = () => {
  useScrollToTop();
  // NEW 뱃지용 상태
  const [newEventIds, setNewEventIds] = useState<Set<number>>(new Set());
  const [newAdded, setNewAdded] = useState<number[]>([]);
  const [newRemoved, setNewRemoved] = useState<number[]>([]);
  const [showNewDeltaBanner, setShowNewDeltaBanner] = useState(false);

  // 오늘 키 (일자별 스냅샷 저장)
  const newTodayKey = `newpick:${dayjs().format("YYYY-MM-DD")}`;

  const readNewSnapshot = (): Set<number> => {
    try {
      const raw = localStorage.getItem(newTodayKey);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set<number>(
        (Array.isArray(arr) ? arr : []).map((v: unknown) => Number(v)).filter(Number.isFinite)
      );
    } catch {
      return new Set<number>();
    }
  };

  const writeNewSnapshot = (ids: Set<number>) => {
    localStorage.setItem(newTodayKey, JSON.stringify(Array.from(ids)));
  };

  // NEW 여부 체크
  const isEventNew = (e: EventSummaryDto) => newEventIds.has(e.id);

  const [mdPickEventIds, setMdPickEventIds] = useState<Set<number>>(new Set());

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
  const { t, i18n } = useTranslation();

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


  const fetchHeroBanners = async (): Promise<BannerResp[]> => {
    const tries = [
      { url: "/api/banners/hero/active" },
      { url: "/api/banners", params: { type: "HERO", status: "ACTIVE" } },
    ] as const;

    for (const { url, params } of tries) {
      try {
        const { data } = await api.get<BannerResp[] | BannerResp>(url, { params });
        const list = Array.isArray(data) ? data : data ? [data] : [];
        if (list.length) return list;
      } catch (err: any) {
        console.warn("[HERO] request fail:", url, err?.response?.status, err?.response?.data);
      }
    }
    return [];
  };

  const parseYMD = (s?: string | null) => {
    if (!s) return null;
    return dayjs(s.slice(0, 10).replace(/[./]/g, "-"));
  };
  const isTodayInRange = (start?: string | null, end?: string | null) => {
    const today = dayjs().startOf("day");
    const s = parseYMD(start);
    const e = parseYMD(end)?.endOf("day");
    return (!s || !s.isAfter(today)) && (!e || !e.isBefore(today));
  };

  const asUpper = (v?: string | null) => (v ?? "").toString().trim().toUpperCase();

  const loadHeroAdvertisements = async () => {
    try {
      const raw = await fetchHeroBanners();
      console.log("[HERO] raw count:", raw.length, raw);

      const filtered = raw.filter(r => {
        const type = asUpper((r as any).bannerTypeCode ?? (r as any).bannerType);
        const status = asUpper((r as any).statusCode ?? (r as any).status);
        const okType = ["HERO", "MAIN", "HERO_MAIN"].includes(type || "HERO");
        const okStatus = ["ACTIVE", "APPROVED", "PUBLISHED"].includes(status || "ACTIVE");
        return okType && okStatus && isTodayInRange(r.startDate, r.endDate);
      });

      console.log("[HERO] filtered count:", filtered.length, filtered);

      if (!filtered.length) {
        // 폴백: HotPick
        const hot = await eventAPI.getHotPicks({ size: 6 });
        setPaidAdvertisements((hot || []).map((h, i) => ({
          id: h.id, eventId: h.id, title: h.title, imageUrl: h.image, thumbnailUrl: h.image,
          linkUrl: `/eventdetail/${h.id}`, startDate: "", endDate: "",
          isActive: true, priority: i + 1,
        })));
        return;
      }

      const get = (o: any, ...keys: string[]) => {
        for (const k of keys) if (o && o[k] != null) return o[k];
        return undefined;
      };
      setPaidAdvertisements(
        filtered
          .map(r => {
            const eid = get(r, "eventId", "event_id") ?? null;
            const img = get(r, "imageUrl", "image_url") ?? "/images/FPlogo.png";
            const rawLink = get(r, "linkUrl", "link_url") ?? "";
            return {
              id: get(r, "id"),
              eventId: eid,
              title: get(r, "title") ?? "",
              imageUrl: img,
              thumbnailUrl: get(r, "smallImageUrl", "smallImageUrl") ?? img,
              // ★ eventId가 있으면 상세로 바로 가는 내부 링크를 만들어 둠
              linkUrl: rawLink || (eid ? `/eventdetail/${eid}` : ""),
              startDate: get(r, "startDate", "start_date") ?? "",
              endDate: get(r, "endDate", "end_date") ?? "",
              isActive: true,
              priority: get(r, "priority") ?? 999,
            } as PaidAdvertisement;
          })
          .sort((a, b) => a.priority - b.priority)
      );
    } catch (e) {
      console.error("HERO 배너 로드 실패:", e);
      setPaidAdvertisements([]);
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
  /* useEffect(() => {
       const loadData = async () => {
           try {
               setLoading(true);
const eventsData = await eventAPI.getEventList({ size: 60, includeHidden: false });
setEvents(eventsData?.events ?? []);


               // 유료광고 데이터 로드
               //await loadPaidAdvertisements();
await loadHeroAdvertisements();
const searchTop = await fetchSearchTopToday(); // ★ 추가
setMdPickEventIds(new Set(searchTop.map(s => Number(s.eventId)).filter(Number.isFinite)));

               // HOT PICKS 코드는 활성 useEffect로 이동됨
           } catch (error) {
               console.error("데이터 로드 실패:", error);
               setEvents([]);
           } finally {
               setLoading(false);
           }
       };
       loadData();
   }, []);
*/


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1) 오늘 검색 상단 불러오기
        const searchTop = await fetchSearchTopToday();
        const mdIds = new Set<number>();

        for (const s of searchTop) {
          const n = Number(s.eventId);
          if (Number.isFinite(n) && n > 0) mdIds.add(n);

          const fromUrl = extractEventId(s.linkUrl || "");
          if (fromUrl) mdIds.add(fromUrl);
        }

        // NEW 픽 불러오기 ★ 별도 try/catch 로 분리
        if (ENABLE_NEW_PICKS) {
          try {
            const newPicks = await fetchNewPicks(20);
            const currNewSet = new Set<number>(
              newPicks.map(p => p.id).filter(n => Number.isFinite(n) && n > 0)
            );
            const prevNewSet = readNewSnapshot();
            const added: number[] = [];
            const removed: number[] = [];

            currNewSet.forEach(id => { if (!prevNewSet.has(id)) added.push(id); });
            prevNewSet.forEach(id => { if (!currNewSet.has(id)) removed.push(id); });

            setNewEventIds(currNewSet);
            setNewAdded(added);
            setNewRemoved(removed);
            writeNewSnapshot(currNewSet);

            if (added.length || removed.length) {
              setShowNewDeltaBanner(true);
              setTimeout(() => setShowNewDeltaBanner(false), 3500);
            }
          } catch (err: any) {
            if (err?.response?.status === 403) {
              console.warn("[NEW-PICKS] 403: 인증/권한 이슈. NEW 배지는 숨김 처리.");
            } else {
              console.warn("[NEW-PICKS] 로드 실패:", err);
            }
            setNewEventIds(new Set());
            setNewAdded([]);
            setNewRemoved([]);
            setShowNewDeltaBanner(false);
          }
        }
        // 2) 기본 리스트
        const eventsData = await eventAPI.getEventList({ size: 30, includeHidden: false });
        let baseEvents = eventsData?.events ?? [];

        // 제목으로도 보강
        for (const s of searchTop) {
          const m = findEventByTitle(s.title, baseEvents);
          if (m?.id) mdIds.add(m.id);
        }

        // ★ 최종 업데이트
        setMdPickEventIds(new Set(mdIds));

        // 3) 메인 리스트에 없는 MD PICK id 구하기
        const missingIds = [...mdIds].filter(id => !baseEvents.some(e => e.id === id));

        // 4) 누락된 것 개별 조회해서 합치기
        if (missingIds.length) {
          const extras: EventSummaryDto[] = [];
          for (const id of missingIds) {
            try {
              const d = await eventAPI.getEventDetail(id);
              extras.push({
                id: d.id,
                title: d.title,
                thumbnailUrl: d.thumbnailUrl,
                startDate: d.startDate,
                endDate: d.endDate,
                location: d.location,
                mainCategory: d.mainCategory,
                minPrice: d.minPrice,
              } as EventSummaryDto);
            } catch (e) {
              console.warn("MD PICK 개별 조회 실패:", id, e);
            }
          }
          const merged = [...extras, ...baseEvents].filter(
            (e, i, arr) => arr.findIndex(x => x.id === e.id) === i
          );
          setEvents(merged);
        } else {
          setEvents(baseEvents);
        }

        // 6) 나머지 섹션 그대로
        await loadHeroAdvertisements();

        // HOT PICKS - 실제 이벤트 데이터 사용
        try {
          console.log("[HOT PICKS] 로딩 시작...");

          // 1. 먼저 백엔드 핫픽 API 시도
          const hot = await eventAPI.getHotPicks({ size: 10 });
          console.log("[HOT PICKS] 백엔드 API 응답:", hot);

          if (hot && hot.length > 0) {
            setHotPicks(hot);
            console.log("[HOT PICKS] 백엔드 데이터 사용, 개수:", hot.length);
          } else {
            // 2. 백엔드 데이터가 없으면 실제 이벤트에서 핫픽 생성
            console.log("[HOT PICKS] 실제 이벤트 데이터로 핫픽 생성");

            // 현재 진행 중이거나 예정된 이벤트 중 상위 10개 선택
            const hotPickCandidates = baseEvents
              .filter(event => event.eventStatusCode === 'ONGOING' || event.eventStatusCode === 'UPCOMING')
              .slice(0, 10)
              .map(event => ({
                id: event.id,
                title: event.title,
                date: `${event.startDate}${event.endDate !== event.startDate ? ` ~ ${event.endDate}` : ''}`,
                location: event.location,
                category: event.mainCategory,
                image: event.thumbnailUrl || '/images/FPlogo.png'
              }));

            setHotPicks(hotPickCandidates);
            console.log("[HOT PICKS] 실제 데이터로 핫픽 생성 완료, 개수:", hotPickCandidates.length);
          }
        } catch (e) {
          console.error("HOT PICKS 로드 실패:", e);
          // 에러 시에도 실제 이벤트 데이터로 폴백
          const fallbackHotPicks = baseEvents
            .slice(0, 3)
            .map(event => ({
              id: event.id,
              title: event.title,
              date: `${event.startDate}${event.endDate !== event.startDate ? ` ~ ${event.endDate}` : ''}`,
              location: event.location,
              category: event.mainCategory,
              image: event.thumbnailUrl || '/images/FPlogo.png'
            }));
          setHotPicks(fallbackHotPicks);
          console.log("[HOT PICKS] 에러 시 폴백 데이터 사용, 개수:", fallbackHotPicks.length);
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


  // Hot Picks 상태 (백엔드 연결 후 실제 예매 데이터로 교체 예정)
  const [hotPicks, setHotPicks] = useState<HotPick[]>([]);
  const [activeHotPickIndex, setActiveHotPickIndex] = useState<number>(0);

  useEffect(() => {
    const keys = paidAdvertisements.map((ad, i) => `hero-${ad.id ?? 'na'}-${i}`);
    const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dup.length) console.warn('[HERO DUP KEYS]', dup, keys);
  }, [paidAdvertisements]);

  useEffect(() => {
    const keys = hotPicks.map((it, i) => `hot-${it.id ?? 'na'}-${i}`);
    const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dup.length) console.warn('[HOT DUP KEYS]', dup, keys);
  }, [hotPicks]);

  const todayKey = dayjs().format("YYYY-MM-DD");

  function getMdPickIdsForToday(): Set<number> {
    try {
      if (typeof window === "undefined") return new Set<number>();
      const raw = localStorage.getItem(`mdpick:${todayKey}`);
      const arr = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(arr)) return new Set<number>();
      return new Set<number>(
        arr
          .slice(0, 2)
          .map((v: unknown) => Number(v))
          .filter((n) => Number.isFinite(n))
      );
    } catch {
      return new Set<number>();
    }
  }

  function getMdPickTitlesForToday(): Set<string> {
    try {
      if (typeof window === "undefined") return new Set<string>();
      const raw = localStorage.getItem(`mdpick_titles:${todayKey}`);
      const arr = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(arr)) return new Set<string>();
      return new Set<string>(arr.slice(0, 2).map((v: unknown) => String(v)));
    } catch {
      return new Set<string>();
    }
  }
  const normalize = (s: string) => (s || '').toLowerCase().replace(/[\s\-_/·・‧ㆍ]/g, '');

  const mdPickIds = getMdPickIdsForToday();
  const mdPickTitles = getMdPickTitlesForToday();
  const mdPickTitleNorms = new Set(Array.from(mdPickTitles).map(normalize));


  const isEventMdPick = (e: EventSummaryDto) => mdPickEventIds.has(e.id);
  const hasMdPickInCurrentList = events.some(e => mdPickEventIds.has(e.id));

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
  const heroLoop = paidAdvertisements.length >= 2;
  const hasHero = paidAdvertisements.length > 0;
  const hasHot = hotPicks.length > 0;
  const hotLoop = hotPicks.length >= 3;
  return (
    <div className={`min-h-screen ${isDark ? '' : 'bg-white'} theme-transition`}>
      <TopNav />

      {isAuthenticated() && showBirthdayModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
          <div className="bg-white p-6 rounded shadow-lg w-96 z-[9999]">

            <h2 className="text-lg font-bold mb-4 font-['Roboto']">{t('main.personalInfo')}</h2>


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
              {generateCalendarDays().map((day) => {
                const isSelected = selectedDate === day.dateString;
                const isPast = !isDateInFuture(day.dateString);
                const isPastDate = !isDateInFuture(day.dateString);

                return (
                  <button
                    key={`${day.dateString}-${day.isCurrentMonth ? 'cur' : 'adj'}`}
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
              className="bg-blue-500 text-white px-4 py-2 rounded w-full font-['Roboto']"
            >
              {t('common.save')}
            </button>

            {/* 모달 닫기 버튼 */}
            <button
              onClick={() => setShowBirthdayModal(false)}
              className="mt-2 text-sm text-gray-500 hover:underline font-['Roboto']"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* NEW 변화 토스트 */}
      {showNewDeltaBanner && (newAdded.length || newRemoved.length) ? (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
          <div className="rounded-[10px] border border-gray-200 bg-white/90 backdrop-blur px-4 py-3 shadow flex items-center gap-3">
            <img src="/images/new-badge.png" alt="NEW" className="w-5 h-5" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <div className="text-sm font-semibold text-gray-800 font-['Roboto']">
              {newAdded.length > 0 && <span className="mr-3">NEW <span className="text-blue-600">{newAdded.length}</span>개 추가</span>}
              {newRemoved.length > 0 && <span className="mr-3">NEW <span className="text-rose-600">{newRemoved.length}</span>개 종료</span>}
              <span className="text-gray-500">최신 등록 기준으로 표시됩니다.</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* 히어로 섹션 */}
      {hasHero && (
        <div className={`relative w-full aspect-square sm:h-[400px] md:h-[600px] ${isDark ? '' : 'bg-gray-100'} theme-transition`}>
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={heroLoop ? { delay: 4000 } : false}
            loop={heroLoop}
            className="w-full h-full"
            onSwiper={(swiper) => { (window as any).heroSwiper = swiper; }}
          >

            {paidAdvertisements.map((ad, index) => (
              <SwiperSlide key={`hero-${ad.id ?? 'na'}-${index}`}>
                <div className="w-full h-full cursor-pointer" onClick={() => gotoAdDetail(ad, events, navigate)}>
                  <img
                    src={ad.imageUrl || '/images/FPlogo.png'}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/FPlogo.png'; }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 썸네일 바: 2장 이상일 때만 */}
          {heroLoop && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-3 pb-8 z-10">
              {paidAdvertisements.map((ad, index) => {
                // 행사 썸네일이 있으면 사용, 없으면 기본 이미지
                const thumbnailSrc = ad.thumbnailUrl || ad.imageUrl || '/images/FPlogo.png';
                
                return (
                  <div key={`hero-thumb-${ad.id ?? 'na'}-${index}`}
                    className="w-12 h-16 md:w-16 md:h-20 cursor-pointer transition-all duration-300 hover:scale-110 opacity-60 hover:opacity-100"
                    onMouseEnter={() => {
                      if (heroLoop && (window as any).heroSwiper) {
                        (window as any).heroSwiper.slideToLoop(index);
                      }
                    }}
                  >
                    <img className="w-full h-full object-cover rounded-[10px] shadow-lg"
                      src={thumbnailSrc}
                      alt={`Event Thumbnail ${ad.id}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 핫픽스 섹션 (3D 커버플로우) - 데이터 있을 때만 */}
      {hasHot && (
        <div className="py-8 md:py-16 theme-surface theme-transition">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h2 className={`text-2xl md:text-3xl font-bold font-['Roboto'] ${isDark ? 'text-white' : 'text-black'}`}>
                {t('main.hotPicks')}
              </h2>
            </div>

            <Swiper
              modules={[Navigation, Autoplay, EffectCoverflow]}
              navigation
              effect="coverflow"
              coverflowEffect={{ rotate: 0, stretch: -30, depth: 220, modifier: 1, slideShadows: false }}
              slidesPerView="auto"
              centeredSlides
              loop={hotLoop}
              autoplay={hotLoop ? { delay: 3500, disableOnInteraction: false } : false}
              spaceBetween={0}
              watchSlidesProgress
              speed={900}
              className="w-full hotpick-swiper"
              onSwiper={(swiper) => setActiveHotPickIndex(hotLoop ? swiper.realIndex % hotPicks.length : swiper.activeIndex)}
              onSlideChange={(swiper) => setActiveHotPickIndex(hotLoop ? swiper.realIndex % hotPicks.length : swiper.activeIndex)}
            >
              {hotPicks.map((item, index) => (
                <SwiperSlide key={`hot-${item.id ?? 'na'}-${index}`} className="hotpick-slide">
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

            {/* 중앙 캡션 */}
            <div className="mt-4 md:mt-6 text-center px-4">
              <div key={activeHotPickIndex} className={`text-xl md:text-[28px] font-bold leading-tight truncate anim-fadeInUp font-['Roboto'] ${isDark ? 'text-white' : 'text-black'}`}>
                {hotPicks[activeHotPickIndex]?.title}
              </div>
              <div key={`meta-${activeHotPickIndex}`} className="mt-2 space-y-1 anim-fadeInUp">
                <div className={`text-xs md:text-sm flex items-center justify-center gap-2 font-['Roboto'] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <HiOutlineCalendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {(hotPicks[activeHotPickIndex]?.date || "").replaceAll('.', '-').replace(' ~ ', ' - ')}
                  </span>
                </div>
                <div className={`text-xs md:text-sm flex items-center justify-center gap-2 font-['Roboto'] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaMapMarkerAlt className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {hotPicks[activeHotPickIndex]?.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 행사 섹션 */}
      <div className="py-8 md:py-16 theme-surface theme-transition">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold font-['Roboto'] ${isDark ? 'text-white' : 'text-black'}`}>{t('main.events')}</h2>
          </div>

          {/* 필터 버튼들 */}
          <div className="mb-6 md:mb-8">
            <div className="flex md:flex-wrap overflow-x-auto md:overflow-visible whitespace-nowrap no-scrollbar gap-2 md:gap-4 -mx-4 px-4">
              {getTranslatedCategories().map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  className={`shrink-0 inline-flex px-3 py-3 md:px-4 md:py-2 rounded-full text-xs md:text-sm border theme-transition whitespace-nowrap font-['Roboto'] ${selectedCategory === category.key
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
            {displayEvents.map((event, index) => (
              <div key={`ev-${event?.id ?? 'na'}-${index}`} className="relative">
                <Link to={`/eventdetail/${event.id}`}>
                  <div className="relative group">
                    {/* NEW 스티커 */}
                    {isEventNew(event) && (
                      <div className={`absolute top-2 left-2 z-10 ${isEventMdPick(event) ? 'translate-y-[34px]' : ''}`}>
                        <div className="inline-flex items-center gap-1.5 bg-yellow-50/95 backdrop-blur px-2.5 py-1 rounded-full border border-yellow-200 shadow">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          <span className="text-[11px] font-extrabold text-yellow-700 tracking-tight">NEW</span>
                        </div>
                      </div>
                    )}

                    {/* MD PICK 스티커 */}
                    {isEventMdPick(event) && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full border border-gray-200 shadow">
                          <img src="/images/fav.png" alt="MD PICK" className="w-4 h-4" />
                          <span className="text-[11px] font-extrabold text-blue-600 tracking-tight">MD PICK</span>
                        </div>
                      </div>
                    )}

                    <img
                      className="w-full aspect-poster-4-5 object-cover rounded-[10px] transition-transform duration-500 ease-out group-hover:scale-105"
                      alt={getEventTitle(event, i18n)}
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

                    <span className={`inline-block px-3 py-1 rounded text-xs mb-2 font-['Roboto'] ${categoryColors[event.mainCategory as keyof typeof categoryColors] || "bg-gray-100 text-gray-700"}`}>
                      {translateCategory(event.mainCategory, t)}
                    </span>
                    <h3 className={`font-bold text-lg md:text-xl mb-2 truncate font-['Roboto'] ${isDark ? 'text-white' : 'text-black'}`}>{getEventTitle(event, i18n)}</h3>
                    <div className={`text-xs md:text-sm mb-2 font-['Roboto'] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="font-bold">{event.location}</div>
                      <div>{dayjs(event.startDate).format('YYYY.MM.DD')} ~ {dayjs(event.endDate).format('YYYY.MM.DD')}</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* 전체보기 버튼 */}
          <div className="text-center mt-8 md:mt-12">
            <Link to="/eventoverview">
              <button className={`px-4 py-2 rounded-[10px] text-sm border font-semibold font-['Roboto'] ${isDark ? 'bg-black text-white border-gray-600 hover:bg-gray-800' : 'bg-white text-black border-gray-400 hover:bg-gray-50'}`}>
                {t('mypage.favorites.viewAll')}
              </button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}; 