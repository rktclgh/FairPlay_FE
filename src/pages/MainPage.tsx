import React, { useState, useEffect } from "react";
import dayjs from 'dayjs';
import api from "../api/axios";
import {
    FaChevronLeft,
    FaChevronRight,
    FaHeart
} from "react-icons/fa";
import { TopNav } from "../components/TopNav";
import { Link, useNavigate } from "react-router-dom";
import { requireAuth, isAuthenticated } from "../utils/authGuard";
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

// Hot Pick 인터페이스
interface HotPick {
    id: number;
    title: string;
    date: string;
    location: string;
    category: string;
    image: string;
}

export const Main: React.FC = () => {

    const [events, setEvents] = useState<EventSummaryDto[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("전체");
    const [loading, setLoading] = useState(true);


    const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set());
    const [hotPicksSlideIndex, setHotPicksSlideIndex] = useState(0);
    const navigate = useNavigate();

    const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

    const authHeaders = () => {
  const t = localStorage.getItem("accessToken");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const toggleWish = async (eventId: number) => {
  // 인증 확인
  if (!requireAuth(navigate, '관심 등록')) {
    return;
  }

  const wasLiked = likedEvents.has(eventId);

  // 낙관적 업데이트
  setLikedEvents(prev => {
    const next = new Set(prev);
    wasLiked ? next.delete(eventId) : next.add(eventId);
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
    console.error("찜 토글 실패:", e);
    // 실패 시 롤백
    setLikedEvents(prev => {
      const next = new Set(prev);
      wasLiked ? next.add(eventId) : next.delete(eventId);
      return next;
    });
    // 필요하면 안내
    // alert("로그인이 필요하거나 권한이 부족합니다.");
  }
};

    const mapMainCategoryToId = (name: string): number | undefined => {
        switch (name) {
            case "박람회":
                return 1;
            case "강연/세미나":
                return 2;
            case "전시/행사":
                return 3;
            case "공연":
                return 4;
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
                page?: number;
                size?: number;
            } = {
                page: 0,
                size: 20,
            };

            if (selectedCategory !== "전체") {
                params.mainCategoryId = mapMainCategoryToId(selectedCategory);
            }



            const response = await eventAPI.getEventList(params);
            setEvents(response.events ?? []);
        } catch (error) {
            console.error("행사 필터링 실패:", error);
            // 오류 발생 시 빈 배열로 설정하여 UI가 깨지지 않도록 함
            setEvents([]);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [selectedCategory]);

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

    useEffect(() => {
  (async () => {
    // 로그인한 사용자만 위시리스트 로드
    if (!isAuthenticated()) {
      return;
    }
    
    try {
      const res = await api.get("/api/wishlist", { headers: authHeaders() });
      const s = new Set<number>();
      (res.data || []).forEach((w: any) => s.add(w.eventId)); // 응답 구조: {eventId,...}
      setLikedEvents(s);
    } catch (e) {
      console.error("위시리스트 로드 실패:", e);
    }
  })();
}, []);


    // 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const eventsData = await eventAPI.getEventList({ size: 15 });
                setEvents(eventsData.events);

                // 유료광고 데이터 로드
                await loadPaidAdvertisements();

                // TODO: 백엔드 연결 후 Hot Picks 데이터 로드
                // const hotPicksData = await eventApi.getHotPicks();
                // setHotPicks(hotPicksData);
            } catch (error) {
                console.error('데이터 로드 실패:', error);
                // 오류 발생 시 빈 상태로 설정하여 UI가 깨지지 않도록 함
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
                                <div key={item.id} className="relative flex-shrink-0"
                                    style={{ width: 'calc(20% - 24px)' }}>
                                    <img
                                        className="w-full h-64 object-cover rounded-[10px]"
                                        alt={`Hot Pick ${index + 1}`}
                                        src={item.image}
                                    />
                                    <div className="mt-4 text-left">
                                        <span
                                            className="inline-block px-3 py-1 bg-blue-100 rounded text-xs text-blue-700 mb-2">
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
                        {events.map((event) => (
                            <div key={event.id} className="relative">
                                <Link to={`/eventdetail/${event.id}`}>
                                    <div className="relative">
                                        <img
                                            className="w-full h-64 object-cover rounded-[10px]"
                                            alt={event.title}
                                            src={event.thumbnailUrl}
                                        />
                                        <FaHeart
                                            className={`absolute top-4 right-4 w-5 h-5 cursor-pointer ${likedEvents.has(event.id) ? 'text-red-500' : 'text-white'} drop-shadow-lg`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleWish(event.id);
                                            }}
                                        />

                                    </div>
                                    <div className="mt-4 text-left">

                                        <span
                                            className="inline-block px-3 py-1 bg-blue-100 rounded text-xs text-blue-700 mb-2">
                                            {event.mainCategory}
                                        </span>
                                        <h3 className="font-bold text-xl text-black mb-2 truncate">{event.title}</h3>
                                        <div className="text-sm text-gray-600 mb-2">
                                            <div className="font-bold">{event.location}</div>
                                            <div>{dayjs(event.startDate).format('YYYY.MM.DD')} ~ {dayjs(event.endDate).format('YYYY.MM.DD')}</div>
                                        </div>
                                        <p className="font-bold text-lg text-[#ff6b35]">{event.minPrice}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* 전체보기 버튼 */
                    }
                    <div className="text-center mt-12">
                        <Link to="/eventoverview">
                            <button
                                className="px-4 py-2 rounded-[10px] text-sm border bg-white text-black border-gray-400 hover:bg-gray-50 font-semibold">
                                전체보기
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 푸터 */
            }
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
    )
        ;
}; 