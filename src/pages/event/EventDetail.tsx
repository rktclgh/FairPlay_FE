import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { MapPin } from "lucide-react";
import { VenueInfo } from "./VenueInfo";
import { CancelPolicy } from "./CancelPolicy";
import { Reviews } from "./Reviews";
import { Expectations } from "./Expectations";
import ExternalLink from "./ExternalLink";
import { eventAPI }  from "../../services/event";
import type {EventDetailResponseDto} from "../../services/types/eventType";

const EventDetail = (): JSX.Element => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState<EventDetailResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("detail");
    const [isExternalBookingOpen, setIsExternalBookingOpen] = useState(false);

    // 이벤트 데이터 로드 (실제로는 API 호출)
    useEffect(() => {
        const loadEventData = async () => {
            try {
                setLoading(true);
                // 실제로는 API 호출: const data = await eventApi.getEventById(eventId);
                // 지금은 임시 데이터 사용
                const data = await eventAPI.getEventDetail(Number(eventId));
                setTimeout(() => {
                    setEventData(data);
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
            <section className="pt-10">
                {/* Event Header */}
                <div className="flex gap-8">
                    <div className="relative">
                        <img
                            src={eventData.thumbnailUrl}
                            alt={eventData.titleKr}
                            className="w-[438px] h-[526px] object-cover"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="text-left">
                            <h1 className="text-[32px] font-semibold leading-tight">
                                {eventData.titleKr}
                            </h1>
                            <p className="text-[#00000099] text-xl mt-1">
                                {eventData.titleEng}
                            </p>
                        </div>

                        <hr className="h-[3px] my-6 bg-black" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-32">
                                <div className="flex items-center">
                                    <span className="text-base text-[#00000099] font-semibold w-20">장소</span>
                                    <span className="text-base inline-block">
                                        {eventData.placeName}
                                    </span>
                                    <MapPin className="w-3 h-3 ml-1" />
                                </div>
                                {/*<div className="flex items-center">*/}
                                {/*    <span className="text-base text-[#00000099] font-semibold w-20">관람등급</span>*/}
                                {/*    <span className="text-base text-[#ff0000]">*/}
                                {/*        {eventData.ageRating}*/}
                                {/*    </span>*/}
                                {/*</div>*/}
                            </div>

                            <div className="flex items-center">
                                <span className="text-base text-[#00000099] font-semibold w-20">일정</span>
                                <span className="text-base">{eventData.startDate} ~ {eventData.endDate}</span>
                            </div>

                            <hr className="my-2 bg-gray-300" />

                            <div className="flex items-start">
                                <span className="text-base text-[#00000099] font-semibold w-20">행사 소개</span>
                                <span className="text-base">{eventData.bio}</span>
                            </div>

                            <div className="flex items-start">
                                <span className="text-base text-[#00000099] font-semibold w-20">가격</span>
                                <div className="grid grid-cols-2 gap-x-4">
                                    {/* 백엔드에서 가격 정보가 별도로 제공되지 않으므로, 필요시 추가 개발 필요 */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date and Time Selection (스케줄 관련 UI는 백엔드 데이터에 따라 추후 구현) */}
                <div className="mt-16 mb-8 border border-gray-200 rounded-lg">
                    <div className="p-0 flex">
                        <div className="flex-1 p-6">
                            <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                                날짜 및 시간 선택
                            </h3>
                            <div className="text-center text-gray-500 py-8">
                                스케줄 정보는 백엔드 데이터에 따라 추후 구현 예정입니다.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Book Button */}
                <div className="flex justify-center mb-12">
                    <button
                        onClick={() => setIsExternalBookingOpen(true)}
                        disabled={!eventData.officialUrl && (!eventData.externalLinks || eventData.externalLinks.length === 0)}
                        className={`w-[196px] h-[38px] rounded-[10px] font-bold flex items-center justify-center transition-colors ${
                            (eventData.officialUrl || (eventData.externalLinks && eventData.externalLinks.length > 0))
                                ? 'bg-[#ef6156] hover:bg-[#d85147] text-white cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        예매하기
                    </button>
                </div>

                {/* Event Details Tabs */}
                <div className="mb-12">
                    <nav className="h-[40px] border-b border-neutral-200 relative" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '-1px' }}>
                        <ul className="flex items-center h-full pl-0">
                            {[
                                { id: "detail", name: "상세정보" },
                                { id: "location", name: "장소정보" },
                                { id: "booking", name: "예매/취소안내" },
                                { id: "review", name: "관람평" },
                                { id: "expectation", name: "기대평" }
                            ].map((tab) => (
                                <li
                                    key={tab.id}
                                    className="h-full flex items-center px-2.5 cursor-pointer"
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span
                                        className={`
                                            relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
                                            ${activeTab === tab.id ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]' : 'font-normal text-gray-600 hover:text-black'}
                                        `}
                                    >
                                        {tab.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="pt-6 px-6">
                        {activeTab === "detail" && (
                            <div className="prose max-w-none">
                                <h3 className="text-lg font-semibold text-[#212121] mb-4">
                                    행사 상세 정보
                                </h3>
                                <div
                                    dangerouslySetInnerHTML={{ __html: eventData.content.replace(/\n/g, '<br />') }}
                                    className="text-base mb-6"
                                />

                                <div className="bg-[#e7eaff] rounded-lg mt-8 p-4">
                                    <h4 className="text-base font-semibold text-[#212121] mb-4">
                                        정책 및 안내사항
                                    </h4>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: eventData.policy.replace(/\n/g, '<br />') }}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "location" && (
                            <VenueInfo
                                placename={eventData.placeName}
                                address={eventData.address}
                                latitude={eventData.latitude}
                                longitude={eventData.longitude}
                                placeUrl={eventData.placeUrl}
                                locationDetail={eventData.locationDetail}
                            />
                        )}

                        {activeTab === "booking" && (
                            <CancelPolicy bookingInfo={eventData.bookingInfo} />
                        )}

                        {activeTab === "review" && (
                            <Reviews />
                        )}

                        {activeTab === "expectation" && (
                            <Expectations />
                        )}
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

            {/* External Booking Modal */}
            <ExternalLink
                isOpen={isExternalBookingOpen}
                onClose={() => setIsExternalBookingOpen(false)}
                officialUrl={eventData.officialUrl}
                externalLinks={eventData.externalLinks}
            />
        </div>
    );
};

export default EventDetail; 