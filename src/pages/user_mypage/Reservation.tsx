import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";

const defaultReservationData = [
    {
        id: 1,
        title: "G-DRAGON 콘서트: WORLD TOUR",
        image: "/images/gd1.png",
        bookingDate: "2024년 7월 15일",
        amount: "250,000원",
        paymentMethod: "신용카드",
        status: "결제 완료",
        statusColor: "bg-[#4caf50]",
        quantity: 2,
    },
    {
        id: 2,
        title: "POST MALONE LIVE CONCERT",
        image: "/images/malone.jpg",
        bookingDate: "2024년 7월 20일",
        amount: "270,000원",
        paymentMethod: "카카오페이",
        status: "결제 완료",
        statusColor: "bg-[#4caf50]",
        quantity: 1,
    },
    {
        id: 3,
        title: "2024 AI & 로봇 박람회",
        image: "/images/NoImage.png",
        bookingDate: "2024년 8월 1일",
        amount: "0원",
        paymentMethod: "-",
        status: "예약 완료",
        statusColor: "bg-[#2196f3]",
        hasButton: true,
        quantity: 3,
    },
    {
        id: 4,
        title: "현대미술 특별전",
        image: "/images/NoImage.png",
        bookingDate: "2024년 7월 28일",
        amount: "24,000원",
        paymentMethod: "카카오페이",
        status: "결제 실패",
        statusColor: "bg-[#f44336]",
        quantity: 1,
    },
    {
        id: 5,
        title: "스타트업 투자 세미나",
        image: "/images/NoImage.png",
        bookingDate: "2024년 7월 28일",
        amount: "15,000원",
        paymentMethod: "신용카드",
        status: "취소 완료",
        statusColor: "bg-[#9e9e9e]",
        quantity: 2,
    },
];

export default function Reservation(): JSX.Element {
    const [reservationData, setReservationData] = useState(defaultReservationData);

    useEffect(() => {
        // localStorage에서 예매 내역 읽어오기
        const bookingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');

        // localStorage 데이터와 기본 데이터 합치기
        const allReservations = [...bookingHistory, ...defaultReservationData];
        setReservationData(allReservations);
    }, []);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1565px] relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    예약/결제 내역
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                                    <TopNav />

                <div className="absolute top-[239px] left-64 right-0">
                    <div className="space-y-[30px]">
                        {reservationData.map((reservation) => (
                            <div
                                key={reservation.id}
                                className="border-none shadow-none bg-transparent"
                            >
                                <div className="p-0 flex items-start gap-[31px] relative">
                                    <img
                                        className="w-[158px] h-[190px] object-cover rounded"
                                        alt="Event"
                                        src={reservation.image}
                                    />

                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-[15px]">
                                            <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                                                {reservation.title}
                                            </h3>
                                            {reservation.hasButton && (
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg border-2 border-blue-600 hover:border-blue-700 h-[32px] px-4 flex items-center justify-center shadow-md transition-colors duration-200">
                                                    <span className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-xs tracking-[0] leading-[18px]">
                                                        부스 예약 신청
                                                    </span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="mb-[15px]">
                                            <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
                                                예매일
                                            </div>
                                            <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                {reservation.bookingDate}
                                            </div>
                                        </div>

                                        <div className="flex gap-[100px]">
                                            <div>
                                                <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
                                                    결제 금액
                                                </div>
                                                <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                    {reservation.amount}
                                                    {(reservation.quantity || 1) > 1 && (
                                                        <span className="text-gray-500 ml-1">({reservation.quantity || 1}매)</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
                                                    결제 수단
                                                </div>
                                                <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                    {reservation.paymentMethod}
                                                </div>
                                            </div>
                                        </div>


                                    </div>

                                    <div className="absolute top-0 right-0">
                                        <div
                                            className={`${reservation.statusColor} text-white border-none rounded h-[27px] px-1.5 flex items-center justify-center`}
                                        >
                                            <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-xs tracking-[0] leading-[18px]">
                                                {reservation.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 