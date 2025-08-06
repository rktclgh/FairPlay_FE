import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";
import QrTicket from "../../components/QrTicket";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventData {
    eventName: string;
    eventDate: string;
    venue: string;
    seatInfo: string;
    bookingDate: string;
    participantInfo: string | null;
    participantFormLink: string | null;
    isConcert: boolean;
    quantity?: number;
    amount?: string;
}

interface QrTicketData {
    eventName: string;
    eventDate: string;
    venue: string;
    seatInfo: string;
    ticketNumber: string;
    bookingDate: string;
    entryTime: string;
}

const defaultEventData: EventData[] = [
    {
        eventName: "웨딩박람회",
        eventDate: "2024년 8월 9일 (금) 19:00",
        venue: "고양종합운동장",
        seatInfo: "입장권",
        bookingDate: "2024년 7월 15일",
        participantInfo: "입력하기",
        participantFormLink: "https://forms.gle/example1",
        isConcert: false,
        quantity: 2,
    },
    {
        eventName: "POST MALONE LIVE CONCERT",
        eventDate: "2024년 8월 25일 (일) 18:00",
        venue: "고척스카이돔",
        seatInfo: "VIP석 5열 8번",
        bookingDate: "2024년 7월 20일",
        participantInfo: null,
        participantFormLink: null,
        isConcert: true,
    },
    {
        eventName: "스타트업 투자 세미나",
        eventDate: "2024년 8월 28일 (수) 14:00",
        venue: "강남구 컨벤션센터",
        seatInfo: "자유석",
        bookingDate: "2024년 8월 1일",
        participantInfo: "입력하기",
        participantFormLink: "https://forms.gle/example3",
        isConcert: true,
    },
];

export default function MyTickets(): JSX.Element {
    const navigate = useNavigate();
    const [isQrTicketOpen, setIsQrTicketOpen] = useState(false);
    const [selectedTicketData, setSelectedTicketData] = useState<QrTicketData | null>(null);
    const [eventData, setEventData] = useState<EventData[]>(defaultEventData);

    useEffect(() => {
        // localStorage에서 예매 내역 읽어오기
        const bookingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');

        // 박람회 예매를 MyTickets 형식으로 변환
        const convertedBookings: EventData[] = bookingHistory.map((booking: Record<string, any>) => ({
            eventName: booking.title,
            eventDate: "2025년 7월 26일 ~ 27일", // 박람회 날짜
            venue: "코엑스 Hall B", // 박람회 장소
            seatInfo: booking.selectedOption === "일반 입장권" ? "일반 입장권" :
                booking.selectedOption === "VIP 패키지" ? "VIP 패키지" :
                    booking.selectedOption === "학생 할인권" ? "학생 할인권" : "일반 입장권",
            bookingDate: booking.bookingDate,
            participantInfo: null,
            participantFormLink: null,
            isConcert: false,
            quantity: booking.quantity,
            amount: booking.amount,
        }));

        // 변환된 예매 내역과 기본 데이터 합치기
        const allEvents = [...convertedBookings, ...defaultEventData];
        setEventData(allEvents);
    }, []);

    const handleQrTicketOpen = (eventData: EventData) => {
        setSelectedTicketData({
            eventName: eventData.eventName,
            eventDate: eventData.eventDate,
            venue: eventData.venue,
            seatInfo: eventData.seatInfo,
            ticketNumber: `KPC-2024-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
            bookingDate: eventData.bookingDate,
            entryTime: "18:30 ~ 19:00",
        });
        setIsQrTicketOpen(true);
    };

    const handleQrTicketClose = () => {
        setIsQrTicketOpen(false);
        setSelectedTicketData(null);
    };

    const handleParticipantListOpen = (eventName: string) => {
        navigate(`/mypage/participant-list?eventName=${encodeURIComponent(eventName)}`);
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1565px] relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    내 티켓
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
                                                    {event.isConcert ? "좌석 정보" : "예매 옵션"}
                                                </div>
                                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                    {event.isConcert
                                                        ? (event.quantity && event.quantity > 1
                                                            ? `${event.seatInfo} 외 ${event.quantity - 1}석`
                                                            : event.seatInfo)
                                                        : `${event.seatInfo} ${event.quantity}매`
                                                    }
                                                </div>
                                            </div>



                                            {event.participantInfo && (
                                                <div className="pt-[-10px]">
                                                    <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-[8px]">
                                                        참여자 입력
                                                    </div>
                                                    <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6 tracking-[0] whitespace-nowrap">
                                                        {event.participantInfo ? (
                                                            <button
                                                                onClick={() => window.open(`/mypage/participant-form?eventName=${encodeURIComponent(event.eventName)}`, '_blank')}
                                                                className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer p-0 font-normal text-base focus:outline-none"
                                                            >
                                                                {event.participantInfo}
                                                            </button>
                                                        ) : (
                                                            "입력 완료"
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="absolute top-6 right-6 flex flex-col space-y-2">
                                        <button
                                            onClick={() => handleQrTicketOpen(event)}
                                            className="w-[140px] h-[56px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-0"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <QrCode className="w-4 h-4 text-white" />
                                                <span className="font-semibold text-white text-sm tracking-wide">
                                                    QR 티켓
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        </button>

                                        {event.participantInfo && (
                                            <button
                                                onClick={() => handleParticipantListOpen(event.eventName)}
                                                className="w-[140px] h-[40px] bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-0"
                                            >
                                                <span className="font-semibold text-white text-xs tracking-wide">
                                                    참여자 목록 확인
                                                </span>
                                                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <QrTicket
                isOpen={isQrTicketOpen}
                onClose={handleQrTicketClose}
                ticketData={selectedTicketData || undefined}
            />
        </div>
    );
} 