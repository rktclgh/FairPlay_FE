import React from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";

const eventData = [
    {
        eventName: "G-DRAGON 콘서트: WORLD TOUR",
        eventDate: "2024년 8월 9일 (금) 19:00",
        venue: "고양종합운동장",
        seatInfo: "A구역 12열 15번",
        bookingDate: "2024년 7월 15일",
        participantInfo: "입력하기",
        participantFormLink: "https://forms.google.com/example1",
    },
    {
        eventName: "POST MALONE LIVE CONCERT",
        eventDate: "2024년 8월 25일 (일) 18:00",
        venue: "고척스카이돔",
        seatInfo: "VIP석 5열 8번",
        bookingDate: "2024년 7월 20일",
        participantInfo: null,
        participantFormLink: null,
    },
    {
        eventName: "스타트업 투자 세미나",
        eventDate: "2024년 8월 28일 (수) 14:00",
        venue: "강남구 컨벤션센터",
        seatInfo: "자유석",
        bookingDate: "2024년 8월 1일",
        participantInfo: "폼링크",
        participantFormLink: "https://forms.google.com/example3",
    },
];

export default function MyTickets(): JSX.Element {
    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1565px] relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    나의 예약/QR
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                <TopNav className="!absolute !left-0 !top-0" />

                <div className="absolute top-[239px] left-64 right-0">
                    <div className="space-y-[47px]">
                        {eventData.map((event, index) => (
                            <div
                                key={index}
                                className="w-[921px] h-[240px] bg-white rounded-[10px] border border-solid border-[#0000001f] shadow-[0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_2px_8px_#0000001a] relative"
                            >
                                <div className="p-6 relative h-full flex items-center">
                                    <div className="grid grid-cols-2 gap-[40px] w-full">
                                        <div className="space-y-[15px] pt-[20px] pb-[20px]">
                                            <div className="pt-[10px]">
                                                <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                    행사명
                                                </div>
                                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                                                    {event.eventName}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                    장소
                                                </div>
                                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6 tracking-[0] whitespace-nowrap">
                                                    {event.venue}
                                                </div>
                                            </div>

                                            <div className="pt-[-10px]">
                                                <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                    예매일
                                                </div>
                                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6 tracking-[0] whitespace-nowrap">
                                                    {event.bookingDate}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-[15px] pt-[20px] pb-[20px]">
                                            <div className="pt-[10px]">
                                                <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                    행사 일시
                                                </div>
                                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6 tracking-[0] whitespace-nowrap">
                                                    {event.eventDate}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                    좌석 정보
                                                </div>
                                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                    {event.seatInfo}
                                                </div>
                                            </div>

                                            {event.participantInfo && (
                                                <div className="pt-[-10px]">
                                                    <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                        참여자 입력
                                                    </div>
                                                    <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6 tracking-[0] whitespace-nowrap">
                                                        {event.participantFormLink ? (
                                                            <a
                                                                href={event.participantFormLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 underline"
                                                            >
                                                                {event.participantInfo}
                                                            </a>
                                                        ) : (
                                                            event.participantInfo
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button className="absolute top-6 right-6 w-[119px] h-[54px] bg-[#f7fafc] rounded-lg border border-solid border-[#0000001f] hover:bg-[#f7fafc] flex items-center justify-center">
                                        <span className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                                            QR 코드
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 