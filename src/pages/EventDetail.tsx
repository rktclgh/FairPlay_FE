import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import { MapPin } from "lucide-react";

const EventDetail = (): JSX.Element => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState<any>(null);
    const [loading, setLoading] = useState(true);



    // 임시 이벤트 데이터 (실제로는 API에서 가져올 예정)
    const mockEventData = {
        id: "1",
        title: "포스트 말론 2025 내한 공연",
        subtitle: "POST MALONE LIVE in SEOUL 2025",
        venue: "고척스카이돔",
        ageRating: "청소년관람불가",
        schedule: "2025.08.25 - 2025.08.27 20:00",
        introduction: "전 세계가 주목한 슈퍼스타와 서울에서 만나는 기회!",
        description: [
            "포스트 말론(Post Malone)이 드디어 한국을 찾습니다. 그래미 어워드 후보에 10번 노미네이트되며 전 세계적으로 사랑받는 아티스트의 라이브 무대를 고척스카이돔에서 만나보세요.",
            "히트곡 'Circles', 'Sunflower', 'Rockstar' 등 수많은 명곡들을 라이브로 들을 수 있는 특별한 기회입니다. 포스트 말론만의 독특한 음악 스타일과 카리스마 넘치는 퍼포먼스를 직접 경험해보세요.",
        ],
        notices: [
            "본 공연은 청소년관람불가 등급입니다.",
            "공연 시작 후 입장이 제한될 수 있습니다.",
            "카메라, 캠코더 등 촬영장비 반입 금지",
            "음식물 반입 금지 (생수 제외)",
        ],
        pricingTiers: [
            { tier: "VIP석 (스탠딩 or 중앙 1층)", price: "250,000원" },
            { tier: "R석 (1층 좌석)", price: "200,000원" },
            { tier: "S석 (2층 중앙)", price: "160,000원" },
            { tier: "A석 (2~3층 측면)", price: "120,000원" },
            { tier: "B석 (고층 뒷줄)", price: "100,000원" },
        ],
        seatAvailability: [
            { type: "VIP석", status: "매진" },
            { type: "R석", status: "매진" },
            { type: "S석", status: "매진" },
            { type: "A석", status: "매진" },
            { type: "B석", status: "18 석" },
        ],
        image: "/images/malone.jpg"
    };

    // 이벤트 데이터 로드 (실제로는 API 호출)
    useEffect(() => {
        const loadEventData = async () => {
            try {
                setLoading(true);
                // 실제로는 API 호출: const data = await eventApi.getEventById(eventId);
                // 지금은 임시 데이터 사용
                setTimeout(() => {
                    setEventData(mockEventData);
                    setLoading(false);
                }, 500);
            } catch (error) {
                console.error('이벤트 데이터 로드 실패:', error);
                setLoading(false);
            }
        };

        if (eventId) {
            loadEventData();
        }
    }, [eventId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-xl">로딩 중...</div>
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-xl">이벤트를 찾을 수 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <TopNav />



            {/* Event Content */}
            <section className="px-6 pt-10">
                {/* Event Header */}
                <div className="flex gap-8">
                    <div className="relative">
                        <img
                            src={eventData.image}
                            alt={eventData.title}
                            className="w-[438px] h-[526px] object-cover"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="text-left">
                            <h1 className="text-[32px] font-semibold leading-tight">
                                {eventData.title}
                            </h1>
                            <p className="text-[#00000099] text-xl mt-1">
                                {eventData.subtitle}
                            </p>
                        </div>

                        <hr className="h-[3px] my-6 bg-black" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-32">
                                <div className="flex items-center">
                                    <span className="text-base text-[#00000099] font-semibold w-20">장소</span>
                                    <span className="text-base inline-block">
                                        {eventData.venue}
                                    </span>
                                    <MapPin className="w-3 h-3 ml-1" />
                                </div>
                                <div className="flex items-center">
                                    <span className="text-base text-[#00000099] font-semibold w-20">관람등급</span>
                                    <span className="text-base text-[#ff0000]">
                                        {eventData.ageRating}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <span className="text-base text-[#00000099] font-semibold w-20">일정</span>
                                <span className="text-base">{eventData.schedule}</span>
                            </div>

                            <hr className="my-2 bg-gray-300" />

                            <div className="flex items-start">
                                <span className="text-base text-[#00000099] font-semibold w-20">행사 소개</span>
                                <span className="text-base">{eventData.introduction}</span>
                            </div>

                            <div className="flex items-start">
                                <span className="text-base text-[#00000099] font-semibold w-20">가격</span>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <div className="space-y-1">
                                        {eventData.pricingTiers.map((tier: any, index: number) => (
                                            <p key={index} className="text-base">
                                                {tier.tier}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="space-y-1 font-semibold">
                                        {eventData.pricingTiers.map((tier: any, index: number) => (
                                            <p key={index} className="text-base">
                                                {tier.price}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date and Time Selection */}
                <div className="mt-16 mb-8 border border-gray-200 rounded-lg">
                    <div className="p-0 flex">
                        {/* Date Selection */}
                        <div className="flex-1 p-6 border-r">
                            <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                                날짜 선택
                            </h3>
                            <div className="text-center mb-4">2025년 8월</div>
                            <div className="text-center text-sm text-gray-600">
                                날짜 선택 기능 (구현 예정)
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="flex-1 p-6">
                            <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                                시간 선택
                            </h3>
                            <select className="w-[217px] h-11 font-semibold border border-gray-300 rounded px-3">
                                <option value="20:00">오후 8시 00분</option>
                            </select>
                        </div>

                        {/* Seat Availability */}
                        <div className="w-[361px] bg-[#e7eaff] rounded-r-[10px]">
                            <div className="p-6">
                                <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                                    예매 가능한 좌석
                                </h3>
                                <div className="space-y-4">
                                    {eventData.seatAvailability.map((seat: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center"
                                        >
                                            <span className="text-base font-semibold text-[#00000080]">
                                                {seat.type}
                                            </span>
                                            <span className="text-base font-semibold text-right">
                                                {seat.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Book Button */}
                <div className="flex justify-center mb-12">
                    <button className="bg-[#ef6156] hover:bg-[#d85147] text-white w-[196px] h-[38px] rounded-lg">
                        예매하기
                    </button>
                </div>

                {/* Event Details Tabs */}
                <div className="mb-12">
                    <div className="border-b">
                        <div className="flex gap-6">
                            <button className="border-b-[3px] border-black font-bold h-[54px] px-0">
                                상세정보
                            </button>
                            <button className="opacity-70 h-[54px] px-0">
                                장소정보
                            </button>
                            <button className="opacity-70 h-[54px] px-0">
                                예매/취소안내
                            </button>
                            <button className="opacity-70 h-[54px] px-0">
                                관람평
                            </button>
                            <button className="opacity-70 h-[54px] px-0">
                                기대평
                            </button>
                        </div>
                    </div>

                    <div className="pt-6">
                        <h3 className="text-lg font-semibold text-[#212121] mb-4">
                            공연 소개
                        </h3>
                        <p className="text-base mb-4">{eventData.introduction}</p>

                        {eventData.description.map((paragraph: string, index: number) => (
                            <p key={index} className="text-base mb-6">
                                {paragraph}
                            </p>
                        ))}

                        <div className="bg-[#e7eaff] rounded-lg mt-8 p-4">
                            <h4 className="text-base font-semibold text-[#212121] mb-4">
                                주요 안내사항
                            </h4>
                            <ul className="space-y-2">
                                {eventData.notices.map((notice: string, index: number) => (
                                    <li key={index} className="text-sm">
                                        • {notice}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
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

export default EventDetail; 