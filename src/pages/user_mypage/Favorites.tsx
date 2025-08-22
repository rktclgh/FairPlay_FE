import React, { useState, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { FaHeart } from "react-icons/fa";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { eventAPI } from "../../services/event";

interface WishlistEvent {
  eventId: number;
  eventTitle: string;
  categoryName: string;
  location: string;
  placeName?: string; // 행사 장소명 추가
  startDate: string;
  endDate: string;
  thumbnailUrl: string;
  addedAt?: string; // 찜한 날짜 추가
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("ko-KR").replace(/\s/g, "");
const fmtRange = (s: string, e: string) => `${fmtDate(s)} ~ ${fmtDate(e)}`;


export const MyPageFavorites = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<WishlistEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get<WishlistEvent[]>("/api/wishlist", {
        withCredentials: true,
      });

      // 각 위시리스트 이벤트에 대해 상세 정보를 가져와서 placeName 추가
      const eventsWithDetails = await Promise.all(
        (res.data || []).map(async (event) => {
          try {
            // 이벤트 상세 정보에서 placeName 가져오기
            const eventDetail = await eventAPI.getEventDetail(event.eventId);
            return {
              ...event,
              placeName: eventDetail.placeName,
              addedAt: event.addedAt || new Date().toISOString()
            };
          } catch (error) {
            console.error(`이벤트 ${event.eventId} 상세 정보 로드 실패:`, error);
            // 상세 정보를 가져올 수 없는 경우 기존 데이터 사용
            return {
              ...event,
              addedAt: event.addedAt || new Date().toISOString()
            };
          }
        })
      );

      // 최근에 추가된 순으로 정렬
      const sortedEvents = eventsWithDetails.sort((a, b) =>
        new Date(a.addedAt!).getTime() - new Date(b.addedAt!).getTime()
      );

      setEvents(sortedEvents);
    } catch (e) {
      console.error(t('mypage.favorites.loadError'), e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // 처음 로딩
  useEffect(() => {
    fetchWishlist();
  }, []);

  // 찜 취소
  const removeWishlist = async (eventId: number) => {
    try {
      await api.delete(`/api/wishlist/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
    } catch (e) {
      console.error(t('mypage.favorites.removeError'), e);
    }
  };

  // 전체보기 토글
  const toggleShowAll = () => {
    setShowAllEvents(!showAllEvents);
  };

  // 표시할 이벤트 수 결정
  const displayEvents = showAllEvents ? events : events.slice(0, 4);

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-full md:w-[1256px] min-h-screen relative">
        {/* 제목 - 웹화면에서 원래 위치로 유지, 모바일에서 맨 왼쪽으로 이동 */}
        <div className="md:absolute md:top-[137px] md:left-64 left-0 right-4 top-24 relative md:static">
          <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl md:text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
            {t('mypage.favorites.title')}
          </div>
        </div>

        {/* 모바일 햄버거 버튼 - 상단바 좌측 아래에 위치 */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden fixed top-20 left-4 z-50 p-3 bg-transparent"
        >
          {isMobileSidebarOpen ? (
            <HiOutlineX className="w-6 h-6 text-gray-600" />
          ) : (
            <HiOutlineMenu className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* 모바일 사이드바 오버레이 */}
        {isMobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* 모바일 사이드바 */}
        <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
          <div className="p-4">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2"
            >
              <HiOutlineX className="w-6 h-6 text-gray-600" />
            </button>
            <AttendeeSideNav className="!relative !top-0 !left-0" />
          </div>
        </div>

        {/* 데스크톱 사이드바 - 웹화면에서 절대적으로 고정 */}
        <div className="hidden md:block">
          <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
        </div>

        <TopNav />

        {/* 행사 섹션 - 웹화면에서 원래 위치로 유지, 모바일에서 맨 왼쪽으로 이동 */}
        <div className="md:absolute md:top-[239px] md:left-64 md:right-0 left-0 right-4 top-32 relative">
          <div className="px-4 md:px-8">
            {loading ? (
              <div className="text-center py-20 text-gray-500">{t('mypage.favorites.loading')}</div>
            ) : events.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-500 text-lg mb-4">{t('mypage.favorites.empty')}</div>
                <div className="text-gray-400 text-sm">
                  {t('mypage.favorites.emptyDescription')}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {displayEvents.map((event) => (
                    <div key={event.eventId} className="relative group">
                      <div className="relative">
                        <img
                          className="w-full h-48 md:h-64 object-cover rounded-[10px] cursor-pointer transition-transform duration-500 ease-out group-hover:scale-105"
                          alt={event.eventTitle}
                          src={event.thumbnailUrl || "/images/NoImage.png"}
                          onClick={() => window.location.href = `/eventdetail/${event.eventId}`}
                        />
                        <div className="absolute inset-0 rounded-[10px] bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <FaHeart
                          className="absolute top-4 right-4 w-5 h-5 cursor-pointer text-red-500 drop-shadow-lg z-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeWishlist(event.eventId);
                          }}
                          title={t('mypage.favorites.removeFromWishlist')}
                        />
                      </div>

                      <div className="mt-4 text-left">
                        <span className="inline-block px-3 py-1 bg-blue-100 rounded text-xs text-blue-700 mb-2 font-['Roboto']">
                          {event.categoryName}
                        </span>
                        <h3
                          className="text-base md:text-lg font-extrabold text-black mb-2 truncate font-['Roboto']"
                          style={{ fontWeight: 800 }}
                        >
                          <Link
                            to={`/eventdetail/${event.eventId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block no-underline text-black visited:text-black hover:underline hover:text-black font-['Roboto']"
                            style={{ fontWeight: 800 }}
                          >
                            {event.eventTitle}
                          </Link>
                        </h3>

                        <div className="text-sm text-gray-600 mb-2 font-['Roboto']">
                          <div className="font-bold">{event.placeName || event.location}</div>
                          <div>{fmtRange(event.startDate, event.endDate)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 전체보기 버튼 */}
                {events.length > 4 && (
                  <div className="text-center mt-8 md:mt-12">
                    <button
                      onClick={toggleShowAll}
                      className="px-6 py-3 rounded-[10px] text-sm border bg-white text-black border-gray-400 hover:bg-gray-50 font-semibold transition-colors"
                    >
                      {showAllEvents ? '간단보기' : `전체보기 (${events.length}개)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};