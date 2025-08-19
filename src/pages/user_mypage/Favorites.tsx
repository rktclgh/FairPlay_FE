import React, { useState, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { FaHeart } from "react-icons/fa";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


interface WishlistEvent {
  eventId: number;
  eventTitle: string;
  categoryName: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  thumbnailUrl: string;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("ko-KR").replace(/\s/g, "");
const fmtRange = (s: string, e: string) => `${fmtDate(s)} ~ ${fmtDate(e)}`;
const fmtPrice = (p: number, t: any) => {
  if (p === 0) return t('mypage.favorites.free');
  const currentLang = t('language.korean') === '한국어' ? 'ko' : 'en';
  if (currentLang === 'ko') {
    return `${p.toLocaleString("ko-KR")}원 ~`;
  } else {
    return `$${Math.round(p / 1000)} ~`;
  }
};

export const MyPageFavorites = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<WishlistEvent[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get<WishlistEvent[]>("/api/wishlist", {
        withCredentials: true,
      });
      setEvents(res.data || []);
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



  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1256px] min-h-[1407px] relative">
        <TopNav />
        <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
          {t('mypage.favorites.title')}
        </div>

        <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />

        {/* 행사 섹션 */}
        <div className="absolute top-[239px] left-64 right-0">
          <div className="px-8">
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
              <div className="grid grid-cols-4 gap-6">
                {events.slice(0, 4).map((event) => (
                  <div key={event.eventId} className="relative">
                    <div className="relative">
                      <img
                        className="w-full h-64 object-cover rounded-[10px]"
                        alt={event.eventTitle}
                        src={event.thumbnailUrl || "/images/NoImage.png"}
                      />
                      <FaHeart
                        className="absolute top-4 right-4 w-5 h-5 cursor-pointer text-red-500 drop-shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWishlist(event.eventId);
                        }}
                        title={t('mypage.favorites.removeFromWishlist')}
                      />
                    </div>

                    <div className="mt-4 text-left">
                      <span className="inline-block px-3 py-1 bg-blue-100 rounded text-xs text-blue-700 mb-2">
                        {event.categoryName}
                      </span>
                      <h3
                        className="text-lg font-extrabold text-black mb-2 truncate"
                        style={{ fontWeight: 800 }}
                      >
                        <Link
                          to={`/eventdetail/${event.eventId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block no-underline text-black visited:text-black hover:underline hover:text-black"
                          style={{ fontWeight: 800 }}
                        >
                          {event.eventTitle}
                        </Link>
                      </h3>



                      <div className="text-sm text-gray-600 mb-2">
                        <div className="font-bold">{event.location}</div>
                        <div>{fmtRange(event.startDate, event.endDate)}</div>
                      </div>
                      <p className="font-bold text-lg text-[#ff6b35]">
                        {fmtPrice(event.price, t)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 전체보기 버튼 */}
            {events.length > 0 && (
              <div className="text-center mt-12">
                <button className="px-4 py-2 rounded-[10px] text-sm border bg-white text-black border-gray-400 hover:bg-gray-50 font-semibold">
                  {t('mypage.favorites.viewAll')}
                </button>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};