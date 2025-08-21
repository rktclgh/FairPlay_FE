import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { eventApi } from "../../services/api";
import authManager from "../../utils/auth";
import paymentService from "../../services/paymentService";
import ticketReservationService from "../../services/ticketReservationService";
import { saveAttendeeAndShareTicket } from "../../services/attendee";
import type { ShareTicketSaveRequestDto } from "../../services/types/attendeeType";
import NewLoader from "../../components/NewLoader";
import { useScrollToTop } from "../../hooks/useScrollToTop";

// 이벤트 회차 정보
interface EventSchedule {
    scheduleId: number;
    date: string; // LocalDate
    startTime: string; // LocalTime
    endTime: string; // LocalTime
    weekday: number; // 0 (일) ~ 6 (토)
    hasActiveTickets: boolean;
    soldTicketCount: number;
}

// 회차별 티켓 정보 (백엔드 ScheduleTicketResponseDto에 맞춤)
interface TicketReservationOption {
    ticketId: number;
    name: string;
    price: number;
    maxPurchase?: number; // 1인 최대 구매 수량
    saleQuantity: number; // 판매 가능 수량
    salesStartAt?: string; // LocalDateTime
    salesEndAt?: string; // LocalDateTime
    visible: boolean;
}

// 이벤트 상세 정보 (예매 페이지에서 실제 사용되는 필드만)
interface EventDetail {
    titleKr: string;
    address?: string;
    placeName?: string;
    startDate: string;
    endDate: string;
    thumbnailUrl?: string;
}

// 티켓 예약자 정보
interface TicketReservationForm {
    selectedOption: string;
    quantity: number;
    buyer_name: string;
    buyer_phone: string;
    buyer_email: string;
    buyer_id: number;
    paymentMethod: string;
}

export const TicketReservation = () => {
    useScrollToTop();
    // eventId
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // URL 파라미터에서 scheduleId 가져오기
    const scheduleIdParam = searchParams.get('scheduleId');
    const scheduleId = scheduleIdParam ? parseInt(scheduleIdParam) : null;
    const success = searchParams.get('success');
    
    // 모바일 결제 완료 후 리다이렉트 파라미터
    const impUid = searchParams.get('imp_uid');
    const merchantUid = searchParams.get('merchant_uid');
    const impSuccess = searchParams.get('imp_success');

    const [eventData, setEventData] = useState<EventDetail | null>(null);
    const [availableTickets, setAvailableTickets] = useState<TicketReservationOption[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState<EventSchedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0); // 0: 티켓 선택, 1: 예매자 정보, 2: 예매 확인

    // 중복 클릭 방지를 위한 상태
    const [isProcessing, setIsProcessing] = useState(
        // PG사 결제 완료 시 즉시 로딩 상태로 시작
        impSuccess === 'true' && impUid && merchantUid
    );
    const [paymentAttempts, setPaymentAttempts] = useState(0);
    const [lastAttemptTime, setLastAttemptTime] = useState(0);
    const [paymentStep, setPaymentStep] = useState(
        // PG사 결제 완료 시 즉시 메시지 표시
        impSuccess === 'true' && impUid && merchantUid ? '박람회를 지배하는 중...' : ''
    ); // 결제 단계 표시
    const [paymentSuccess, setPaymentSuccess] = useState(false); // 결제 성공 상태

    const [ticketReservationForm, setTicketReservationForm] = useState<TicketReservationForm>({
        selectedOption: "",
        quantity: 1,
        buyer_name: "",
        buyer_phone: "",
        buyer_email: "",
        buyer_id: "",
        paymentMethod: "card"
    });

    // 사용 가능한 티켓 옵션을 백엔드에서 가져온 데이터로 사용
    const ticketReservationOptions = availableTickets;

    useEffect(() => {
        // 모바일 결제 완료 후 리다이렉트 처리
        if (impSuccess === 'true' && impUid && merchantUid) {
            console.log('모바일 결제 완료 감지:', { impUid, merchantUid });
            // 상태는 이미 useState 초기값에서 설정됨
            handleMobilePaymentSuccess(impUid, merchantUid);
        } else if (impSuccess === 'false') {
            // 결제 취소 또는 실패 시 URL 파라미터만 정리
            console.log('모바일 결제 취소/실패 감지');
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('imp_uid');
            newUrl.searchParams.delete('merchant_uid');
            newUrl.searchParams.delete('imp_success');
            window.history.replaceState({}, '', newUrl);
        } else if (success === 'true') {
            // 기존 success=true 파라미터 처리 (호환성)
            toast.success('결제가 성공적으로 완료되었습니다!');
            // URL에서 success 파라미터 제거
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('success');
            window.history.replaceState({}, '', newUrl);
        }
        
        // 사용자 정보 로드
        const loadUserInfo = async () => {
            try {
                const userData = await eventApi.getUserInfo();

                // 예매자 정보를 사용자 정보로 자동 설정
                setTicketReservationForm(prev => ({
                    ...prev,
                    buyer_name: userData.name || "",
                    buyer_phone: userData.phone || "",
                    buyer_email: userData.email || "",
                    buyer_id: userData.userId || ""
                }));
            } catch {
                console.error("사용자 정보 로드 실패");
                toast.error("로그인이 필요합니다.");
                navigate("/login");
                return;
            }
        };

        // 이벤트 데이터 로드 (상단 행사 정보 출력, 회차 정보 출력, 회차별 티켓 정보)
        const loadEventData = async () => {
            try {
                // URL에 scheduleId가 없으면 에러
                if (!scheduleId) {
                    throw new Error('회차 ID가 없습니다. 이벤트 상세 페이지에서 회차를 선택해주세요.');
                }

                // 1. 이벤트 상세 정보 조회
                const eventResponse = await authManager.authenticatedFetch(`/api/events/${eventId}/details`);

                if (!eventResponse.ok) {
                    throw new Error(`이벤트 정보 조회 실패: ${eventResponse.status}`);
                }

                const eventDetail = await eventResponse.json();
                console.log('이벤트 상세 정보:', eventDetail);

                setEventData({
                    titleKr: eventDetail.titleKr,
                    address: eventDetail.address,
                    placeName: eventDetail.placeName,
                    startDate: eventDetail.startDate,
                    endDate: eventDetail.endDate,
                    thumbnailUrl: eventDetail.thumbnailUrl
                });

                // 2. 선택된 회차의 상세 정보 조회
                const scheduleResponse = await authManager.authenticatedFetch(`/api/events/${eventId}/schedule/${scheduleId}`);

                if (!scheduleResponse.ok) {
                    throw new Error(`회차 상세 정보 조회 실패: ${scheduleResponse.status}`);
                }

                const scheduleDetail = await scheduleResponse.json();
                console.log('회차 상세 정보:', scheduleDetail);

                // 회차 정보 설정
                setSelectedSchedule({
                    scheduleId: scheduleDetail.scheduleId,
                    date: scheduleDetail.date,
                    startTime: scheduleDetail.startTime,
                    endTime: scheduleDetail.endTime,
                    weekday: scheduleDetail.weekday,
                    hasActiveTickets: scheduleDetail.hasActiveTickets || false,
                    soldTicketCount: scheduleDetail.soldTicketCount || 0
                });

                // 3. 회차별 티켓 조회
                loadScheduleTickets(scheduleId);

            } catch (error) {
                console.error('이벤트/회차 정보 조회 실패:', error);
                toast.error(error instanceof Error ? error.message : '이벤트 정보를 불러올 수 없습니다.');

                // 에러 발생 시 이벤트 상세 페이지로 돌아가기
                setTimeout(() => {
                    navigate(`/eventdetail/${eventId}`);
                }, 2000);
            }
        };

        // 데이터 초기화
        const initializeData = async () => {
            await loadUserInfo(); //사용자 정보 조회
            await loadEventData(); //이벤트 정보 조회
            setLoading(false);
        };

        initializeData();
    }, [eventId, scheduleId, navigate, impSuccess, impUid, merchantUid, success]);

    // 회차별 티켓 로드 함수
    const loadScheduleTickets = async (scheduleId: number) => {
        try {
            const response = await authManager.authenticatedFetch(`/api/events/${eventId}/schedule/${scheduleId}/tickets`);

            if (!response.ok) {
                throw new Error(`회차별 티켓 조회 실패: ${response.status}`);
            }

            const ticketList = await response.json();
            console.log('회차별 티켓 목록:', ticketList);

            // 회차별 티켓 정보
            const formattedTickets = ticketList.map((ticket: any) => ({
                ticketId: ticket.ticketId,
                name: ticket.name,
                price: ticket.price || 0,
                maxPurchase: ticket.maxPurchase, // 1인 최대 구매 수량 추가
                saleQuantity: ticket.saleQuantity || 0,
                remainingStock: ticket.remainingStock || 0,
                salesStartAt: ticket.salesStartAt,
                salesEndAt: ticket.salesEndAt,
                visible: ticket.visible !== false // 기본값 true
            }));

            // 판매 활성화된 티켓만 필터링
            const visibleTickets = formattedTickets.filter(ticket => ticket.visible);
            setAvailableTickets(visibleTickets);

        } catch (error) {
            console.error('회차별 티켓 로드 실패:', error);
            toast.error('티켓 정보를 불러올 수 없습니다.');
            setAvailableTickets([]);
        }
    };

    // 선택된 티켓 가져오기
    const getSelectedTicket = () => {
        return ticketReservationOptions.find(option => option.ticketId.toString() === ticketReservationForm.selectedOption);
    };

    // 최대 구매 가능 수량 계산
    const getMaxQuantity = (ticket: TicketReservationOption | undefined) => {
        if (!ticket) return 1;

        // 1인 최대 구매 수량이 설정되어 있으면 해당 수량과 재고 중 작은 값
        if (ticket.maxPurchase && ticket.maxPurchase > 0) {
            return Math.min(ticket.maxPurchase, ticket.saleQuantity);
        }
        // 1인 최대 구매 수량이 설정되어 있지 않으면 무조건 1장만
        return Math.min(1, ticket.saleQuantity);
    };

    // 수량 제한 안내 텍스트
    const getQuantityLimitText = (ticket: TicketReservationOption | undefined) => {
        if (!ticket) return "";

        if (ticket.maxPurchase && ticket.maxPurchase > 0) {
            const effectiveMax = Math.min(ticket.maxPurchase, ticket.saleQuantity);
            if (effectiveMax === ticket.maxPurchase) {
                return `1인 최대 ${ticket.maxPurchase}매까지 구매 가능`;
            } else {
                return `재고 부족으로 최대 ${effectiveMax}매까지 구매 가능 (1인 제한: ${ticket.maxPurchase}매)`;
            }
        }
        // 1인 제한이 설정되지 않은 경우
        return `1인 최대 구매 수량이 1매로 제한되어 있습니다`;
    };

    // 티켓 선택 핸들러
    const handleOptionSelect = (ticketId: number) => {
        setTicketReservationForm(prev => ({ ...prev, selectedOption: ticketId.toString() }));
    };

    // 수량 선택
    const handleQuantityChange = (newQuantity: number) => {
        const selectedTicket = getSelectedTicket();
        const maxQuantity = getMaxQuantity(selectedTicket);

        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setTicketReservationForm(prev => ({ ...prev, quantity: newQuantity }));
        }
    };

    const handleInputChange = (field: keyof TicketReservationForm, value: string | number) => {
        setTicketReservationForm(prev => ({ ...prev, [field]: value }));
    };

    const calculateTotal = () => {
        const selectedOption = getSelectedTicket();
        return selectedOption ? selectedOption.price * ticketReservationForm.quantity : 0;
    };

    const validateStep0 = () => {
        return ticketReservationForm.selectedOption !== "" && ticketReservationForm.quantity > 0;
    };

    const validateStep1 = () => {
        return ticketReservationForm.buyer_name.trim() !== "" &&
            ticketReservationForm.buyer_phone.trim() !== "" &&
            ticketReservationForm.buyer_email.trim() !== "";
    };

    const handleNextStep = () => {
        if (currentStep === 0 && validateStep0()) {
            setCurrentStep(1);
        } else if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // 결제 서비스 초기화
    useEffect(() => {
        paymentService.initialize().catch(error => {
            console.error('결제 서비스 초기화 실패:', error);
            toast.error('결제 시스템 초기화에 실패했습니다.');
        });

        return () => {
            paymentService.cleanup();
        };
    }, []);

    // 결제 처리 중 페이지 이탈 방지
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isProcessing) {
                event.preventDefault();
                event.returnValue = '결제가 진행 중입니다. 정말 페이지를 떠나시겠습니까?';
                return '결제가 진행 중입니다. 정말 페이지를 떠나시겠습니까?';
            }
        };

        if (isProcessing) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isProcessing]);


    // 모바일 결제 성공 후 처리 함수
    const handleMobilePaymentSuccess = async (impUid: string, merchantUid: string) => {
        // 재미있는 메시지들
        const funMessages = [
            '박람회를 지배하는 중...',
            '공연을 나의 것으로 만드는 중...',
            '축제의 주인공이 되는 중...',
            '티켓을 황금으로 변환하는 중...',
            '최고의 자리를 예약하는 중...'
        ];
        
        let messageIndex = 0;
        setPaymentSuccess(false);
        setPaymentStep(funMessages[messageIndex]);
        
        // 메시지 로테이션 인터벌
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % funMessages.length;
            setPaymentStep(funMessages[messageIndex]);
        }, 1500);
        
        try {
            console.log('모바일 결제 완료 처리 시작:', { impUid, merchantUid });
            
            // 1. 결제 완료 처리 API 호출
            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/payments/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    merchantUid: merchantUid,
                    impUid: impUid
                })
            });
            
            if (!response.ok) {
                throw new Error(`결제 완료 처리 실패: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('결제 완료 처리 성공:', result);
            
            // 메시지 로테이션 중지
            clearInterval(messageInterval);
            setPaymentStep('티켓 발급 완료!');
            setPaymentSuccess(true);
            
            // PC와 동일하게 2.5초 후 이동 (토스트 알림 제거)
            setTimeout(() => {
                navigate('/mypage/reservation');
            }, 2500);
            
            // URL 정리
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('imp_uid');
            newUrl.searchParams.delete('merchant_uid');
            newUrl.searchParams.delete('imp_success');
            window.history.replaceState({}, '', newUrl);
            
        } catch (error) {
            console.error('모바일 결제 완료 처리 오류:', error);
            // 메시지 로테이션 중지
            clearInterval(messageInterval);
            setPaymentStep('결제 실패');
            
            // PC와 동일한 상세 에러 메시지 처리
            let errorMessage = '결제 완료 처리 중 오류가 발생했습니다.';
            if (error instanceof Error) {
                if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            toast.error(errorMessage);
            
            // PC와 동일하게 3초 후 상태 초기화
            setTimeout(() => {
                setPaymentStep('');
                setPaymentSuccess(false);
            }, 3000);
        } finally {
            // 메시지 로테이션 정리 (에러가 발생하더라도 인터벌 정리)
            clearInterval(messageInterval);
            // PC와 동일한 상태 초기화
            setIsProcessing(false);
        }
    };
    
    // 중복 클릭 방지 및 결제 처리 함수
    const handlePayment = async () => {
        const now = Date.now();

        // 1. 중복 클릭 방지 - 이미 처리 중인 경우
        if (isProcessing) {
            toast.warning('결제가 진행 중입니다. 잠시만 기다려주세요.');
            return;
        }

        // 2. 연속 시도 제한 - 5초 내 3회 제한
        if (now - lastAttemptTime < 5000) {
            if (paymentAttempts >= 3) {
                toast.error('너무 많은 결제 시도가 발생했습니다. 5초 후 다시 시도해주세요.');
                return;
            }
        } else {
            // 5초가 지났으면 시도 횟수 초기화
            setPaymentAttempts(0);
        }

        const selectedTicket = getSelectedTicket();
        console.log('선택된 티켓 : ', selectedTicket);

        if (!selectedTicket) {
            toast.error('티켓을 선택해주세요.');
            return;
        }

        const totalAmount = calculateTotal();
        const paymentTargetType = "RESERVATION";

        // 3. 결제 처리 시작 - 상태 업데이트
        setIsProcessing(true);
        setPaymentSuccess(false);
        setPaymentAttempts(prev => prev + 1);
        setLastAttemptTime(now);
        setPaymentStep('결제 준비 중...');

        // 처리 시작 알림 제거 (시각적 UI로 대체)

        try {
            setPaymentStep('결제 정보 준비 중...');
            
            // 예약 데이터 준비
            const reservationData = {
                scheduleId: scheduleId,
                ticketId: selectedTicket.ticketId,
                quantity: ticketReservationForm.quantity,
                totalAmount: totalAmount,
                buyer_name: ticketReservationForm.buyer_name,
                buyer_phone: ticketReservationForm.buyer_phone,
                buyer_email: ticketReservationForm.buyer_email,
                paymentMethod: ticketReservationForm.paymentMethod
            };

            setPaymentStep('결제 처리 중...');
            
            // 결제 처리 (결제 → 예약 생성 → target_id 업데이트)
            const result = await paymentService.processPayment(
                eventData.titleKr,
                ticketReservationForm.buyer_id,
                ticketReservationForm.buyer_name,
                parseInt(eventId),
                paymentTargetType,
                ticketReservationForm.quantity,
                selectedTicket.price,
                totalAmount,
                reservationData
            );

            setPaymentStep('티켓 발급 중...');
            
            // 참석자 저장 및 펼 생성
            const shareTicketData: ShareTicketSaveRequestDto = {
                reservationId: result.targetId,
                totalAllowed: ticketReservationForm.quantity
            }
            await saveAttendeeAndShareTicket(shareTicketData);

            console.log('결제 및 예약 성공:', result);
            
            setPaymentStep('결제 완료!');
            setPaymentSuccess(true);
            
            // 결제 성공 후 사용자가 결과를 확인할 시간 제공
            setTimeout(() => {
                navigate("/mypage/reservation");
            }, 2500);

        } catch (error) {
            console.error('결제 처리 중 오류:', error);
            setPaymentStep('결제 실패');
            
            // 더 상세한 에러 메시지 제공
            let errorMessage = '결제 중 오류가 발생했습니다.';
            if (error instanceof Error) {
                if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
                } else if (error.message.includes('재고')) {
                    errorMessage = '티켓 재고가 부족합니다. 다른 수량을 선택해주세요.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            toast.error(errorMessage);
            
            // 에러 발생 시 3초 후 상태 초기화
            setTimeout(() => {
                setPaymentStep('');
                setPaymentSuccess(false);
            }, 3000);
        } finally {
            // 4. 결제 처리 완료 - 상태 초기화
            setIsProcessing(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopNav />
                <div className="flex items-center justify-center h-64">
                    <NewLoader />
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
                        onClick={() => {
                            // 브라우저 히스토리로 뒤로가기 (더 자연스러운 이동)
                            if (window.history.length > 1) {
                                window.history.back();
                            } else {
                                // 히스토리가 없으면 직접 이동 후 강제 새로고침
                                navigate(`/eventdetail/${eventId}`);
                                setTimeout(() => window.location.reload(), 100);
                            }
                        }}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <FaArrowLeft className="mr-2" />
                        이벤트 상세로 돌아가기
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {eventData?.titleKr} 예매
                    </h1>

                    <div className="flex items-center space-x-6 text-gray-600">
                        <div className="flex items-center">
                            <FaCalendarAlt className="mr-2" />
                            {eventData && `${eventData.startDate} ~ ${eventData.endDate}`}
                        </div>
                        <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2" />
                            {eventData?.placeName || eventData?.address}
                        </div>
                    </div>
                </div>

                {/* 선택된 회차 정보 표시 */}
                {selectedSchedule && (
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <h3 className="text-base font-medium text-gray-900">선택된 회차</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4 text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-medium">{selectedSchedule.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 진행 단계 표시 */}
                <div className="mb-8">
                    <style>
                        {`
                        @keyframes pulse-blue {
                            0%, 100% { 
                                background-color: rgb(37, 99, 235);
                                opacity: 1; 
                            }
                            50% { 
                                background-color: rgb(96, 165, 250);
                                opacity: 0.8; 
                            }
                        }
                        .animate-pulse-blue {
                            animation: pulse-blue 1.5s ease-in-out infinite;
                        }
                        `}
                    </style>
                    <div className="flex items-center justify-between">
                        {[0, 1, 2].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${currentStep === step
                                    ? 'animate-pulse-blue'  // 현재 단계: 깜박이는 파란색
                                    : currentStep > step
                                        ? 'bg-blue-600'  // 완료된 단계: 파란색
                                        : 'bg-gray-200 text-gray-600'  // 미진행 단계: 회색
                                    }`}>
                                    {step + 1}
                                </div>
                                {step < 2 && (
                                    <div className={`w-24 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                        <span className={currentStep === 0 ? 'text-blue-600 font-medium animate-pulse' : currentStep > 0 ? 'text-blue-600' : 'text-gray-600'}>
                            티켓 선택
                        </span>
                        <span className={currentStep === 1 ? 'text-blue-600 font-medium animate-pulse' : currentStep > 1 ? 'text-blue-600' : 'text-gray-600'}>
                            예매자 정보
                        </span>
                        <span className={currentStep === 2 ? 'text-blue-600 font-medium animate-pulse' : 'text-gray-600'}>
                            예매 확인
                        </span>
                    </div>
                </div>

                {/* 단계별 컨텐츠 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {currentStep === 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">티켓 선택</h2>
                            <div className="space-y-4">
                                {ticketReservationOptions.map((option) => (
                                    <div
                                        key={option.ticketId}
                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${ticketReservationForm.selectedOption === option.ticketId.toString()
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => handleOptionSelect(option.ticketId)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{option.name}</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {option.price === 0 ? '무료' : `${option.price.toLocaleString()}원`}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    재고: {option.saleQuantity}개
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {ticketReservationOptions.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        판매 가능한 티켓이 없습니다.
                                    </div>
                                )}
                            </div>

                            {ticketReservationForm.selectedOption && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-gray-900 mb-3">수량 선택</h3>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleQuantityChange(ticketReservationForm.quantity - 1)}
                                            disabled={ticketReservationForm.quantity <= 1}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <span className="text-lg font-medium w-12 text-center">
                                            {ticketReservationForm.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(ticketReservationForm.quantity + 1)}
                                            disabled={ticketReservationForm.quantity >= getMaxQuantity(getSelectedTicket())}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {getQuantityLimitText(getSelectedTicket())}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">예매자 정보</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        예매자명 *
                                    </label>
                                    <input
                                        type="text"
                                        value={ticketReservationForm.buyer_name}
                                        onChange={(e) => handleInputChange('buyer_name', e.target.value)}
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
                                        value={ticketReservationForm.buyer_phone}
                                        onChange={(e) => handleInputChange('buyer_phone', e.target.value)}
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
                                        value={ticketReservationForm.buyer_email}
                                        onChange={(e) => handleInputChange('buyer_email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="이메일을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        결제 방법 *
                                    </label>
                                    <select
                                        value={ticketReservationForm.paymentMethod}
                                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="card">신용카드</option>
                                        {/*<option value="trans">계좌이체</option>
                                        <option value="kakaopay">카카오페이</option>*/}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">실제 결제는 다음 단계에서 진행됩니다</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">예매 확인</h2>
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">예매 정보</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">이벤트:</span>
                                            <span className="font-medium">{eventData?.titleKr}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">회차:</span>
                                            <span className="font-medium">
                                                {selectedSchedule?.date} {selectedSchedule?.startTime} - {selectedSchedule?.endTime}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">예매 옵션:</span>
                                            <span className="font-medium">{getSelectedTicket()?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">수량:</span>
                                            <span className="font-medium">{ticketReservationForm.quantity}매</span>
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
                                            <span className="font-medium">{ticketReservationForm.buyer_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">연락처:</span>
                                            <span className="font-medium">{ticketReservationForm.buyer_phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">이메일:</span>
                                            <span className="font-medium">{ticketReservationForm.buyer_email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 결제 진행 상황 표시 */}
                    {(isProcessing || paymentSuccess) && (
                        <>
                            {/* 블러 오버레이 */}
                            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
                                <div className="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full shadow-2xl">
                                    <div className="text-center">
                                        {!paymentSuccess ? (
                                            <>
                                                {/* 로딩 애니메이션 */}
                                                <div className="mb-6">
                                                    <div className="relative">
                                                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="animate-pulse h-8 w-8 bg-blue-600 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* 메인 메시지 */}
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    티켓이 발급중입니다!
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    잠시만 기다려주세요!
                                                </p>
                                                
                                                {/* 진행 상태 */}
                                                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                                    <div className="text-sm font-medium text-blue-800">
                                                        {paymentStep}
                                                    </div>
                                                </div>
                                                
                                                {/* 주의사항 */}
                                                <div className="text-xs text-gray-500">
                                                    페이지를 닫지 마세요
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* 성공 아이콘 */}
                                                <div className="mb-6">
                                                    <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                {/* 성공 메시지 */}
                                                <h3 className="text-xl font-bold text-green-800 mb-2">
                                                    티켓 발급 완료!
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    결제가 성공적으로 완료되었습니다
                                                </p>
                                                
                                                {/* 리다이렉션 안내 */}
                                                <div className="bg-green-50 rounded-lg p-3">
                                                    <div className="text-sm text-green-700">
                                                        잠시 후 예약 내역으로 이동합니다...
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 버튼 */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handlePrevStep}
                            disabled={currentStep === 0 || isProcessing}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                            이전
                        </button>

                        {currentStep < 2 ? (
                            <button
                                onClick={handleNextStep}
                                disabled={
                                    (currentStep === 0 && !validateStep0()) ||
                                    (currentStep === 1 && !validateStep1()) ||
                                    isProcessing
                                }
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 border-0 outline-none focus:outline-none"
                            >
                                다음
                            </button>
                        ) : (
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className={`px-6 py-2 rounded-md transition-colors duration-200 font-medium border-0 outline-none focus:outline-none ${
                                    paymentSuccess 
                                        ? 'bg-green-600 text-white cursor-not-allowed' 
                                        : isProcessing 
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {paymentSuccess ? '결제 완료' : isProcessing ? '결제 중...' : '결제하기'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};