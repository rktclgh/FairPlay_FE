import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import reservationService from "../../services/reservationService";
import type { ReservationResponseDto } from "../../services/reservationService";
import { eventAPI } from "../../services/event";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export default function Reservation(): JSX.Element {
    const { t } = useTranslation();
    const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // 카테고리 정보 캐시
    const eventCategoryCache = React.useRef(new Map<number, { mainCategory: string; subCategory: string }>());




    useEffect(() => {
        const loadReservationsWithCategories = async () => {
            try {
                setLoading(true);
                const reservations = await reservationService.getMyReservations();

                // 각 예약에 대해 카테고리 정보 추가 (캐시 활용)
                const reservationsWithCategories = await Promise.all(
                    reservations.map(async (reservation) => {
                        // 캐시된 카테고리 정보가 있으면 사용
                        if (eventCategoryCache.current.has(reservation.eventId)) {
                            const cached = eventCategoryCache.current.get(reservation.eventId)!;
                            return { ...reservation, ...cached };
                        }

                        try {
                            const eventDetail = await eventAPI.getEventDetail(reservation.eventId);
                            const categoryInfo = {
                                mainCategory: eventDetail.mainCategory,
                                subCategory: eventDetail.subCategory
                            };

                            // 캐시에 저장
                            eventCategoryCache.current.set(reservation.eventId, categoryInfo);

                            return { ...reservation, ...categoryInfo };
                        } catch (error) {
                            console.error(`이벤트 ${reservation.eventId} 카테고리 로드 실패:`, error);
                            return reservation;
                        }
                    })
                );

                setReservations(reservationsWithCategories);
            } catch (error) {
                console.error('예약 목록 로드 실패:', error);
                toast.error(t('mypage.reservation.loadReservationsError'));
            } finally {
                setLoading(false);
            }
        };

        loadReservationsWithCategories();
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
            <div className="bg-white w-full md:w-[1256px] min-h-screen relative">
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
                <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
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

                {/* 제목 - 웹화면에서 원래 위치로 복원, 모바일에서 맨 왼쪽으로 이동 */}
                <div className="md:absolute md:top-[137px] md:left-64 left-0 right-4 top-24 relative">
                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl md:text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        {t('mypage.reservation.title')}
                    </div>
                </div>

                {/* 콘텐츠 - 웹화면에서 원래 위치로 복원, 모바일에서 맨 왼쪽으로 이동 */}
                <div className="md:absolute md:top-[195px] md:left-64 md:right-0 left-0 right-4 top-32 relative">
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
                                    <div className="p-0 flex flex-col md:flex-row items-start gap-[31px] relative">
                                        <img
                                            className="w-full md:w-[158px] h-[190px] object-cover rounded"
                                            alt="Event"
                                            src={reservation.eventThumbnailUrl || "/images/NoImage.png"}
                                        />

                                        <div className="flex-1 w-full">
                                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-[15px]">
                                                <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                                                    {reservation.eventName}
                                                </h3>

                                                {/* 카테고리 정보 - 행사 타이틀 오른쪽에 배치 */}
                                                {reservation.mainCategory && (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded text-xs ${reservation.mainCategory === "박람회" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                                                            reservation.mainCategory === "공연" ? "bg-red-100 text-red-800 border border-red-200" :
                                                                reservation.mainCategory === "강연/세미나" ? "bg-green-100 text-green-800 border border-green-200" :
                                                                    reservation.mainCategory === "전시/행사" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                                                                        reservation.mainCategory === "축제" ? "bg-gray-100 text-gray-800 border border-gray-300" :
                                                                            "bg-gray-100 text-gray-700 border border-gray-200"
                                                            }`}>
                                                            {reservation.mainCategory}
                                                        </span>
                                                        {reservation.subCategory && (
                                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">
                                                                {reservation.subCategory}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-[15px] flex flex-col md:flex-row gap-4 md:gap-[245px]">
                                                <div>
                                                    <div className="w-20 [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
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

                                            <div className="flex flex-col md:flex-row gap-4 md:gap-[100px]">
                                                <div>
                                                    <div className="w-20 [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
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
                                                    <div className="w-20 [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
                                                        {t('mypage.reservation.paymentMethod')}
                                                    </div>
                                                    <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
                                                        {reservation.paymentMethod || (reservation.price === 0 ? t('mypage.reservation.free') : t('mypage.reservation.unpaid'))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="w-20 [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-[#666666] text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-[8px]">
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