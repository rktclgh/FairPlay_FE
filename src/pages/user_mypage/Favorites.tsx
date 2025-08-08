import React, { useState, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { FaHeart } from "react-icons/fa";

interface Event {
    id: number;
    image: string;
    category: string;
    title: string;
    date: string;
    location: string;
    price: string;
}

export const MyPageFavorites = () => {
    // 상태들
    const [events, setEvents] = useState<Event[]>([]);
    const [likedEvents, setLikedEvents] = useState<Set<number>>(() => {
        try {
            // localStorage에서 좋아요 상태 불러오기
            const saved = localStorage.getItem('likedEvents');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (error) {
            console.error('localStorage 읽기 오류:', error);
            return new Set();
        }
    });

    // 홈화면에서 가져온 데이터
    const mockEvents: Event[] = [
        {
            id: 1,
            image: "/images/gd1.png",
            category: "콘서트",
            title: "G-DRAGON 콘서트: w···",
            date: "2025-08-09",
            location: "고양종합운동장",
            price: "15,000원 ~",
        },
        {
            id: 2,
            image: "/images/gd2.png",
            category: "콘서트",
            title: "POST MALONE LIVE ···",
            date: "2025-08-25 ~ 2025-08-27",
            location: "고척스카이돔",
            price: "35,000원 ~",
        },
        {
            id: 3,
            image: "/images/NoImage.png",
            category: "세미나",
            title: "스타트업 투자 세미나",
            date: "2025-08-28",
            location: "강남구 컨벤션센터",
            price: "무료",
        },
        {
            id: 4,
            image: "/images/NoImage.png",
            category: "전시회",
            title: "현대미술 특별전",
            date: "2025-09-01 ~ 2025-09-30",
            location: "국립현대미술관",
            price: "12,000원 ~",
        },
        {
            id: 5,
            image: "/images/NoImage.png",
            category: "축제",
            title: "서울 국제 영화제",
            date: "2025-10-01 ~ 2025-10-10",
            location: "강남구",
            price: "20,000원 ~",
        },
    ];

    useEffect(() => {
        // 좋아요를 누른 행사만 필터링
        const likedEventsList = mockEvents.filter(event => likedEvents.has(event.id));
        setEvents(likedEventsList);
    }, [likedEvents]);

    // 좋아요 상태가 변경될 때마다 localStorage에 저장
    useEffect(() => {
        try {
            localStorage.setItem('likedEvents', JSON.stringify(Array.from(likedEvents)));
        } catch (error) {
            console.error('localStorage 저장 오류:', error);
        }
    }, [likedEvents]);



    // 좋아요 토글 함수
    const toggleLike = (eventId: number) => {
        setLikedEvents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
            <TopNav />
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    관심
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                                    

                {/* 행사 섹션 - 홈화면에서 가져온 부분 */}
                <div className="absolute top-[239px] left-64 right-0">
                    <div className="px-8">
                        {/* 행사 카드들 */}
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
                                                    toggleLike(event.id);
                                                }}
                                            />
                                        </div>
                                        <div className="mt-4 text-left">
                                            <span className="inline-block px-3 py-1 bg-blue-100 rounded text-xs text-blue-700 mb-2">
                                                {event.category}
                                            </span>
                                            <h3 className="font-bold text-xl text-black mb-2 truncate">{event.title}</h3>
                                            <div className="text-sm text-gray-600 mb-2">
                                                <div className="font-bold">올림픽공원</div>
                                                <div>{event.date}</div>
                                            </div>
                                            <p className="font-bold text-lg text-[#ff6b35]">{event.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 전체보기 버튼 */}
                        {events.length > 0 && (
                            <div className="text-center mt-12">
                                <button className="px-4 py-2 rounded-[10px] text-sm border bg-white text-black border-gray-400 hover:bg-gray-50 font-semibold">
                                    전체보기
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute w-full h-[205px] bottom-0 bg-white border-t [border-top-style:solid] border-[#0000001f]">
                    <p className="absolute top-[62px] left-1/2 transform -translate-x-1/2 [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-base text-center leading-6 tracking-[0] whitespace-nowrap">
                        간편하고 안전한 행사 관리 솔루션
                    </p>

                    <div className="absolute top-[118px] left-1/2 transform -translate-x-1/2 flex space-x-8">
                        <div className="[font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                            이용약관
                        </div>

                        <div className="[font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                            개인정보처리방침
                        </div>

                        <div className="[font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                            고객센터
                        </div>

                        <div className="[font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                            회사소개
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 