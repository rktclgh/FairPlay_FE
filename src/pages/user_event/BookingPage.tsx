import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { eventApi } from "../../services/api";

interface BookingOption {
    id: string;
    name: string;
    price: number;
    description: string;
    available: boolean;
}

interface BookingForm {
    selectedOption: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    paymentMethod: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

export const BookingPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [eventData, setEventData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingForm, setBookingForm] = useState<BookingForm>({
        selectedOption: "",
        quantity: 1,
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        paymentMethod: "card",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
    });

    // 박람회 예매 옵션
    const bookingOptions: BookingOption[] = [
        {
            id: "general",
            name: "일반 입장권",
            price: 0,
            description: "박람회 전체 관람 가능",
            available: true,
        },
        {
            id: "vip",
            name: "VIP 패키지",
            price: 50000,
            description: "특별 전시관 + 기념품 + 음료 제공",
            available: true,
        },
        {
            id: "student",
            name: "학생 할인권",
            price: 0,
            description: "학생증 소지자만 구매 가능",
            available: true,
        },
    ];

    useEffect(() => {
        // 사용자 정보 로드
        const loadUserInfo = async () => {
            try {
                const userData = await eventApi.getUserInfo();

                // 예매자 정보를 사용자 정보로 자동 설정
                setBookingForm(prev => ({
                    ...prev,
                    customerName: userData.name || "",
                    customerPhone: userData.phone || "",
                    customerEmail: userData.email || "",
                }));
            } catch {
                console.error("사용자 정보 로드 실패");
                toast.error("로그인이 필요합니다.");
                navigate("/login");
                return;
            }
        };

        // 이벤트 데이터 로드 (실제로는 API에서 가져올 것)
        const loadEventData = () => {
            // 웨딩 박람회 데이터
            if (eventId === "2") {
                setEventData({
                    id: "2",
                    title: "웨덱스 웨딩박람회 in COEX",
                    date: "2025-07-26 ~ 2025-07-27",
                    location: "코엑스 Hall B",
                    price: "무료",
                    image: "/images/wedding.png",
                    description: "국내 최대 규모의 웨딩 박람회",
                });
            } else {
                // 기본 박람회 데이터
                setEventData({
                    id: eventId,
                    title: "박람회",
                    date: "2025-08-15 ~ 2025-08-17",
                    location: "코엑스 A홀",
                    price: "무료",
                    image: "/images/NoImage.png",
                    description: "박람회 설명",
                });
            }
        };

        const initializeData = async () => {
            await loadUserInfo();
            loadEventData();
            setLoading(false);
        };

        initializeData();
    }, [eventId, navigate]);

    const handleOptionSelect = (optionId: string) => {
        setBookingForm(prev => ({ ...prev, selectedOption: optionId }));
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= 10) {
            setBookingForm(prev => ({ ...prev, quantity: newQuantity }));
        }
    };

    const handleInputChange = (field: keyof BookingForm, value: string | number) => {
        setBookingForm(prev => ({ ...prev, [field]: value }));
    };

    const getSelectedOption = () => {
        return bookingOptions.find(option => option.id === bookingForm.selectedOption);
    };

    const calculateTotal = () => {
        const selectedOption = getSelectedOption();
        return selectedOption ? selectedOption.price * bookingForm.quantity : 0;
    };

    const validateStep1 = () => {
        return bookingForm.selectedOption !== "" && bookingForm.quantity > 0;
    };

    const validateStep2 = () => {
        return bookingForm.customerName.trim() !== "" &&
            bookingForm.customerPhone.trim() !== "" &&
            bookingForm.customerEmail.trim() !== "";
    };

    const validateStep3 = () => {
        if (bookingForm.paymentMethod === "card") {
            return bookingForm.cardNumber.length >= 16 &&
                bookingForm.expiryDate.length === 5 &&
                bookingForm.cvv.length === 3;
        }
        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
        } else if (currentStep === 3 && validateStep3()) {
            setCurrentStep(4);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmitBooking = async () => {
        try {
            // 실제로는 API 호출
            console.log("예매 정보:", bookingForm);

            // 예매 내역을 localStorage에 저장
            const bookingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
            const newBooking = {
                id: Date.now(), // 고유 ID 생성
                title: eventData?.title,
                image: eventData?.image,
                bookingDate: new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                amount: calculateTotal() === 0 ? "0원" : `${calculateTotal().toLocaleString()}원`,
                paymentMethod: bookingForm.paymentMethod === "card" ? "신용카드" : "계좌이체",
                status: "예약 완료",
                statusColor: "bg-[#2196f3]",
                hasButton: false,
                selectedOption: getSelectedOption()?.name,
                quantity: bookingForm.quantity,
                customerName: bookingForm.customerName,
                customerPhone: bookingForm.customerPhone,
                customerEmail: bookingForm.customerEmail,
            };

            // 새 예매를 맨 앞에 추가
            bookingHistory.unshift(newBooking);
            localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory));

            // 성공 메시지
            toast.success("예매가 완료되었습니다!");
            navigate("/mypage/reservation");
        } catch {
            toast.error("예매 중 오류가 발생했습니다.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopNav />
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">로딩 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TopNav />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/event/${eventId}`)}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <FaArrowLeft className="mr-2" />
                        이벤트 상세로 돌아가기
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {eventData?.title} 예매
                    </h1>

                    <div className="flex items-center space-x-6 text-gray-600">
                        <div className="flex items-center">
                            <FaCalendarAlt className="mr-2" />
                            {eventData?.date}
                        </div>
                        <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2" />
                            {eventData?.location}
                        </div>
                    </div>
                </div>

                {/* 진행 단계 표시 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step}
                                </div>
                                {step < 4 && (
                                    <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>예매 옵션</span>
                        <span>예매자 정보</span>
                        <span>결제 정보</span>
                        <span>예매 확인</span>
                    </div>
                </div>

                {/* 단계별 컨텐츠 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">예매 옵션 선택</h2>
                            <div className="space-y-4">
                                {bookingOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${bookingForm.selectedOption === option.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => handleOptionSelect(option.id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{option.name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {option.price === 0 ? '무료' : `${option.price.toLocaleString()}원`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {bookingForm.selectedOption && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-gray-900 mb-3">수량 선택</h3>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleQuantityChange(bookingForm.quantity - 1)}
                                            disabled={bookingForm.quantity <= 1}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <span className="text-lg font-medium w-12 text-center">
                                            {bookingForm.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(bookingForm.quantity + 1)}
                                            disabled={bookingForm.quantity >= 10}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">최대 10매까지 구매 가능</p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">예매자 정보</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        예매자명 *
                                    </label>
                                    <input
                                        type="text"
                                        value={bookingForm.customerName}
                                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                                        placeholder="예매자명을 입력하세요"
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500 mt-1">로그인된 사용자 정보가 자동으로 입력됩니다</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        연락처 *
                                    </label>
                                    <input
                                        type="tel"
                                        value={bookingForm.customerPhone}
                                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="010-0000-0000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        이메일 *
                                    </label>
                                    <input
                                        type="email"
                                        value={bookingForm.customerEmail}
                                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="이메일을 입력하세요"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">결제 정보</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        결제 방법
                                    </label>
                                    <select
                                        value={bookingForm.paymentMethod}
                                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="card">신용카드</option>
                                        <option value="bank">계좌이체</option>
                                    </select>
                                </div>

                                {bookingForm.paymentMethod === "card" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                카드번호 *
                                            </label>
                                            <input
                                                type="text"
                                                value={bookingForm.cardNumber}
                                                onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={16}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    만료일 *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bookingForm.expiryDate}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                        if (value.length >= 2) {
                                                            handleInputChange('expiryDate', value.slice(0, 2) + '/' + value.slice(2));
                                                        } else {
                                                            handleInputChange('expiryDate', value);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    CVV *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bookingForm.cvv}
                                                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="123"
                                                    maxLength={3}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">예매 확인</h2>
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">예매 정보</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">이벤트:</span>
                                            <span className="font-medium">{eventData?.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">예매 옵션:</span>
                                            <span className="font-medium">{getSelectedOption()?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">수량:</span>
                                            <span className="font-medium">{bookingForm.quantity}매</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">총 금액:</span>
                                            <span className="font-medium text-lg text-blue-600">
                                                {calculateTotal().toLocaleString()}원
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">예매자 정보</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">이름:</span>
                                            <span className="font-medium">{bookingForm.customerName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">연락처:</span>
                                            <span className="font-medium">{bookingForm.customerPhone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">이메일:</span>
                                            <span className="font-medium">{bookingForm.customerEmail}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 버튼 */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handlePrevStep}
                            disabled={currentStep === 1}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            이전
                        </button>

                        {currentStep < 4 ? (
                            <button
                                onClick={handleNextStep}
                                disabled={
                                    (currentStep === 1 && !validateStep1()) ||
                                    (currentStep === 2 && !validateStep2()) ||
                                    (currentStep === 3 && !validateStep3())
                                }
                                className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                다음
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmitBooking}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                예매 완료
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 