import React, { useState, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { FaHeart } from "react-icons/fa";
import api from "../../api/axios";

interface WishlistEvent {
    eventId: number;
    imageUrl: string;
    category: string;
    title: string;
    date: string;
    location: string;
    price: string;
}

export const MyPageFavorites = () => {
    const [events, setEvents] = useState<WishlistEvent[]>([]);

    // 위시리스트 불러오기
    const fetchWishlist = async () => {
        try {
            const res = await api.get<WishlistEvent[]>("/api/wishlist");
            setEvents(res.data);
        } catch (error) {
            console.error("위시리스트 불러오기 실패:", error);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    // 좋아요 토글
    const toggleLike = async (eventId: number) => {
        try {
            const isLiked = events.some(e => e.eventId === eventId);

            if (isLiked) {
                // 찜 취소
                await api.delete(`/api/wishlist/${eventId}`);
                setEvents(prev => prev.filter(e => e.eventId !== eventId));
            } else {
                // 찜 등록
                await api.post(`/api/wishlist`, null, { params: { eventId } });
                await fetchWishlist();
            }
        } catch (error) {
            console.error("위시리스트 토글 실패:", error);
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
                <TopNav />
                <div className="top-[137px] left-64 font-bold text-black text-2xl absolute leading-[54px]">
                    관심
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 행사 섹션 */}
                <div className="absolute top-[239px] left-64 right-0">
                    <div className="px-8">
                        {events.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-gray-500 text-lg mb-4">
                                    아직 관심 행사가 없습니다
                                </div>
                                <div className="text-gray-400 text-sm">
                                    홈화면이나 행사 목록에서 좋아요를 눌러 관심 행사를 추가해보세요
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-6">
                                {events.slice(0, 4).map((event) => (
                                    <div key={event.eventId} className="relative">
                                        <div className="relative">
                                            <img
                                                className="w-full h-64 object-cover rounded-[10px]"
                                                alt={event.title}
                                                src={event.imageUrl || "/images/NoImage.png"}
                                            />
                                            <FaHeart
                                                className={`absolute top-4 right-4 w-5 h-5 cursor-pointer ${
                                                    events.some(e => e.eventId === event.eventId)
                                                        ? "text-red-500"
                                                        : "text-white"
                                                } drop-shadow-lg`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleLike(event.eventId);
                                                }}
                                            />
                                        </div>
                                        <div className="mt-4 text-left">
                                            <span className="inline-block px-3 py-1 bg-blue-100 rounded text-xs text-blue-700 mb-2">
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
                        )}

                        {events.length > 0 && (
                            <div className="text-center mt-12">
                                <button className="px-4 py-2 rounded-[10px] text-sm border bg-white text-black border-gray-400 hover:bg-gray-50 font-semibold">
                                    전체보기
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute w-full h-[205px] bottom-0 bg-white border-t border-[#0000001f]">
                    <p className="absolute top-[62px] left-1/2 transform -translate-x-1/2 text-[#666666] text-base text-center">
                        간편하고 안전한 행사 관리 솔루션
                    </p>
                    <div className="absolute top-[118px] left-1/2 transform -translate-x-1/2 flex space-x-8 text-[#666666] text-sm">
                        <div>이용약관</div>
                        <div>개인정보처리방침</div>
                        <div>고객센터</div>
                        <div>회사소개</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
