import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import reservationService, { ReservationResponseDto } from "../../services/reservationService";

export default function Reservation(): JSX.Element {
    const { t } = useTranslation();
    const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);
    const [loading, setLoading] = useState(true);




    useEffect(() => {
        const loadReservations = async () => {
            try {
                setLoading(true);
                const data = await reservationService.getMyReservations();
                setReservations(data);
            } catch (error) {
                console.error('예약 목록 로드 실패:', error);
                toast.error(t('mypage.reservation.loadReservationsError'));
            } finally {
                setLoading(false);
            }
        };

        loadReservations();
    }, []);

    // 결제 상태에 따른 색상 결정
    const getPaymentStatusColor = (paymentStatus?: string) => {
        if (!paymentStatus) return 'bg-[#2196f3]'; // 결제 대기 (파란색)
        
        switch (paymentStatus) {
            case '결제 완료':
            case 'COMPLETED':
                return 'bg-[#4caf50]'; // 초록색
            case '결제 대기':
            case 'PENDING':
                return 'bg-[#2196f3]'; // 파란색
            case '결제 취소':
            case 'CANCELLED':
                return 'bg-[#9e9e9e]'; // 회색
            case '결제 실패':
            case 'FAILED':
                return 'bg-[#f44336]'; // 빨간색
            default:
                return 'bg-[#666666]'; // 기본 회색
        }
    };

    // 날짜 포맷팅
    const formatDate = (dateTimeStr: string | null) => {
        if (!dateTimeStr) return t('mypage.reservation.dateTbd');
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // 금액 포맷팅
    const formatAmount = (price: number, quantity: number) => {
        const total = price * quantity;
        return total === 0 ? t('mypage.reservation.free') : `${total.toLocaleString()}${t('mypage.reservation.won')}`;
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    {t('mypage.reservation.title')}
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                                    <TopNav />

                <div className="absolute top-[239px] left-64 right-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-lg">{t('mypage.reservation.loading')}</div>
                        </div>
                    ) : reservations.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">{t('mypage.reservation.noReservations')}</div>
                        </div>
                    ) : (
                        <div className="space-y-[30px]">
                            {reservations.map((reservation) => (
                                <div
                                    key={reservation.reservationId}
                                    className="border-none shadow-none bg-transparent"
                                >
                                    <div className="p-0 flex items-start gap-[31px] relative">
                                        <img
                                            className="w-[158px] h-[190px] object-cover rounded"
                                            alt="Event"
                                            src={reservation.eventThumbnailUrl || "/images/NoImage.png"}
                                        />

                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-[15px]">
                                                <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                                                    {reservation.eventName}
                                                </h3>
                                                {/* 부스 예약 버튼은 특정 조건에서만 표시 - 현재는 제거 */}
                                            </div>

                                            <div className="mb-[15px] flex gap-[100px]">
                                                <div>
                                                    <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
                                                        {t('mypage.reservation.bookingDate')}
                                                    </div>
                                                    <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                        {formatDate(reservation.createdAt)}
                                                    </div>
                                                </div>

                                                {/* 행사 정보 */}
                                                {reservation.scheduleDate && (
                                                    <div>
                                                        <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
                                                            {t('mypage.reservation.eventInfo')}
                                                        </div>
                                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base tracking-[0] leading-6">
                                                            <div>{formatDate(reservation.scheduleDate)}</div>
                                                            {reservation.startTime && reservation.endTime && (
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {reservation.startTime.slice(0, 5)} - {reservation.endTime.slice(0, 5)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-[100px]">
                                                <div>
                                                    <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
                                                        {t('mypage.reservation.paymentAmount')}
                                                    </div>
                                                    <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                        {formatAmount(reservation.price, reservation.quantity)}
                                                        {reservation.quantity > 1 && (
                                                            <span className="text-gray-500 ml-1">({reservation.quantity}매)</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
                                                        {t('mypage.reservation.paymentMethod')}
                                                    </div>
                                                    <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                        {reservation.paymentMethod || (reservation.price === 0 ? t('mypage.reservation.free') : t('mypage.reservation.unpaid'))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
                                                        {t('mypage.reservation.ticketInfo')}
                                                    </div>
                                                    <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                        {reservation.ticketName} (₩{reservation.ticketPrice.toLocaleString()})
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute top-0 right-0">
                                            <div
                                                className={`${getPaymentStatusColor(reservation.paymentStatus)} text-white border-none rounded h-[27px] px-1.5 flex items-center justify-center`}
                                            >
                                                <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-xs tracking-[0] leading-[18px]">
                                                    {reservation.paymentStatus || t('mypage.reservation.paymentPending')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 