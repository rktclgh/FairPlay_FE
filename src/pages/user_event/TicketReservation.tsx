import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaUser, FaCreditCard } from "react-icons/fa";
import { eventApi } from "../../services/api";
import authManager from "../../utils/auth";
import paymentService from "../../services/paymentService";
import NewLoader from "../../components/NewLoader";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import { useAuth } from "../../context/AuthContext";

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
    
    // ================================= 생년월일 검증용 추가 =================================
    const { user } = useAuth();
    // ====================================================================================

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

    // PG사 중간 페이지 감지 및 리다이렉션 (전역 감지)
    useEffect(() => {
        const handlePGRedirect = () => {
            const currentUrl = window.location.href;
            const pgUrls = [
                'service.iamport.kr',
                'm_uplus_payments',
                'authenticated',
                'lgdacom',
                'lguplus',
                'inicis',
                'kcp',
                'toss'
            ];

            // PG사 URL 감지
            const isPGPage = pgUrls.some(pgUrl => currentUrl.includes(pgUrl));

            if (isPGPage) {
                console.log('PG사 중간 페이지 감지:', currentUrl);

                // 모든 방법으로 결제 정보 추출 시도
                const urlParams = new URLSearchParams(window.location.search);
                const impUid = urlParams.get('imp_uid') ||
                    urlParams.get('IMP_UID') ||
                    localStorage.getItem('pending_imp_uid');

                const merchantUid = urlParams.get('merchant_uid') ||
                    urlParams.get('LGD_OID') ||
                    localStorage.getItem('pending_merchant_uid');

                const savedEventId = localStorage.getItem('pending_event_id') || eventId;
                const savedScheduleId = localStorage.getItem('pending_schedule_id') || scheduleId;

                console.log('추출된 결제 정보:', {
                    impUid, merchantUid, savedEventId, savedScheduleId,
                    currentUrl, urlParams: Object.fromEntries(urlParams)
                });

                // 일정 시간 후 강제 리다이렉션 (결제 정보가 없어도)
                const forceRedirect = () => {
                    if (savedEventId && savedScheduleId) {
                        const redirectUrl = `/ticketreservation/${savedEventId}/${savedScheduleId}?imp_success=pending&force_redirect=true`;
                        console.log('강제 리다이렉션:', redirectUrl);
                        window.location.href = redirectUrl;
                    }
                };

                if (impUid && merchantUid && savedEventId && savedScheduleId) {
                    // 결제 완료 처리 페이지로 리다이렉션
                    const redirectUrl = `/ticketreservation/${savedEventId}/${savedScheduleId}?imp_success=true&imp_uid=${impUid}&merchant_uid=${merchantUid}`;
                    console.log('PG사 중간 페이지에서 결제 완료 페이지로 리다이렉션:', redirectUrl);
                    window.location.href = redirectUrl;
                } else {
                    // 3초 후 강제 리다이렉션
                    console.log('결제 정보 부족, 3초 후 강제 리다이렉션');
                    setTimeout(forceRedirect, 3000);
                }
            }
        };

        // 즉시 체크
        handlePGRedirect();

        // 주기적 체크 (1초마다)
        const intervalId = setInterval(handlePGRedirect, 1000);

        // URL 변경 감지
        const handleUrlChange = () => {
            setTimeout(handlePGRedirect, 100);
        };

        window.addEventListener('popstate', handleUrlChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, [eventId, scheduleId]);

    useEffect(() => {
        // 모바일 결제 완료 후 리다이렉트 처리
        if (impSuccess === 'true' && impUid && merchantUid) {
            console.log('모바일 결제 완료 감지:', { impUid, merchantUid });
            // 상태는 이미 useState 초기값에서 설정됨
            handleMobilePaymentSuccess(impUid, merchantUid);
        } else if (impSuccess === 'pending' || searchParams.get('force_redirect') === 'true') {
            // 강제 리다이렉션된 경우 결제 상태 확인
            console.log('강제 리다이렉션 감지, 결제 상태 확인 중...');
            setIsProcessing(true);
            setPaymentStep('결제 상태 확인 중...');

            // 저장된 정보로 결제 상태 확인 시도
            const savedMerchantUid = localStorage.getItem('pending_merchant_uid');
            if (savedMerchantUid) {
                // TODO: 결제 상태 확인 API 호출
                toast.info('결제 상태를 확인 중입니다...');
                setTimeout(() => {
                    setIsProcessing(false);
                    setPaymentStep('');
                }, 5000);
            }
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
            const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL || window.location.origin;
            const completeResponse = await fetch(`${backendUrl}/api/payments/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
                },
                body: JSON.stringify({
                    merchantUid: merchantUid,
                    impUid: impUid
                })
            });

            if (!completeResponse.ok) {
                throw new Error(`결제 완료 처리 실패: ${completeResponse.status}`);
            }

            const completeResult = await completeResponse.json();
            console.log('결제 완료 처리 성공:', completeResult);

            // 2. 저장된 폼 데이터로 예약 생성 (PC와 동일한 로직)
            const savedFormData = JSON.parse(localStorage.getItem('ticketReservationForm') || '{}');
            const savedSelectedTicket = JSON.parse(localStorage.getItem('selectedTicket') || '{}');

            if (savedFormData && savedSelectedTicket) {
                console.log('저장된 예약 정보로 예약 생성:', { savedFormData, savedSelectedTicket });

                const reservationData = {
                    scheduleId: scheduleId,
                    ticketId: savedSelectedTicket.ticketId,
                    quantity: savedFormData.quantity,
                    totalAmount: savedSelectedTicket.price * savedFormData.quantity,
                    buyer_name: savedFormData.buyer_name,
                    buyer_phone: savedFormData.buyer_phone,
                    buyer_email: savedFormData.buyer_email,
                    paymentMethod: savedFormData.paymentMethod || 'card'
                };

                // 예약은 결제 완료 시 자동으로 생성됨 (PaymentService에서 처리)
                console.log('모바일 결제 완료:', completeResult);
            }

            // 결제 성공 시 localStorage 정리
            localStorage.removeItem('pending_imp_uid');
            localStorage.removeItem('pending_merchant_uid');
            localStorage.removeItem('pending_event_id');
            localStorage.removeItem('pending_schedule_id');

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

            // 모바일 결제 실패 시 백엔드 락도 해제
            try {
                await authManager.authenticatedFetch('/api/payments/status/clear', {
                    method: 'POST'
                });
                console.log('백엔드 결제 락 해제 완료');
            } catch (clearError) {
                console.warn('백엔드 결제 락 해제 실패:', clearError);
            }

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
        // ================================= 생년월일 검증 로직 =================================
        // 사용자 정보 재조회로 최신 생년월일 정보 확인
        try {
            const response = await authManager.authenticatedFetch('/api/users/mypage');
            if (response.ok) {
                const userData = await response.json();
                if (!userData.birthday) {
                    toast.error('티켓 예약을 위해 생년월일 정보가 필요합니다.\n마이페이지에서 생년월일을 입력해 주세요.', {
                        autoClose: 5000,
                    });
                    // 마이페이지로 리다이렉트
                    setTimeout(() => {
                        navigate('/mypage');
                    }, 2000);
                    return;
                }
            }
        } catch (error) {
            console.error('사용자 정보 확인 실패:', error);
            toast.error('사용자 정보를 확인할 수 없습니다. 다시 시도해 주세요.');
            return;
        }
        // =================================================================================
        
        const now = Date.now();

        // 1. 중복 클릭 방지 - 이미 처리 중인 경우
        if (isProcessing) {
            console.log('중복 결제 시도 차단 - 이미 처리 중');
            toast.warning('결제가 진행 중입니다. 잠시만 기다려주세요.');
            return;
        }

        // 1-1. 백엔드에서 결제 진행 상태 확인
        try {
            const statusResponse = await authManager.authenticatedFetch('/api/payments/status');
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                if (statusData.inProgress) {
                    console.log('백엔드에서 결제 진행 중 감지');
                    toast.warning('이미 진행 중인 결제가 있습니다. 잠시 후 다시 시도해주세요.');
                    return;
                }
            }
        } catch (error) {
            console.warn('결제 상태 확인 실패, 계속 진행:', error);
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

            // PG사 중간 페이지 감지를 위한 정보 저장 (최소화)
            const tempMerchantUid = `TICKET_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem('pending_merchant_uid', tempMerchantUid);
            localStorage.setItem('pending_event_id', eventId);
            localStorage.setItem('pending_schedule_id', scheduleId);

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

            console.log('결제 및 예약 성공:', result);

            // 결제 성공 시 localStorage 정리
            localStorage.removeItem('pending_imp_uid');
            localStorage.removeItem('pending_merchant_uid');
            localStorage.removeItem('pending_event_id');
            localStorage.removeItem('pending_schedule_id');

            setPaymentStep('결제 완료!');
            setPaymentSuccess(true);

            // 결제 성공 후 사용자가 결과를 확인할 시간 제공
            setTimeout(() => {
                navigate("/mypage/reservation");
            }, 2500);

        } catch (error) {
            console.error('결제 처리 중 오류:', error);
            setPaymentStep('결제 실패');

            // 결제 실패 시 백엔드 락도 해제
            try {
                await authManager.authenticatedFetch('/api/payments/status/clear', {
                    method: 'POST'
                });
                console.log('백엔드 결제 락 해제 완료');
            } catch (clearError) {
                console.warn('백엔드 결제 락 해제 실패:', clearError);
            }

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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <TopNav />
                <div className="flex items-center justify-center h-64">
                    <NewLoader />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <TopNav />

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* 헤더 */}
                <div className="mb-8 md:mb-12 animate-fade-in">
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
                        className="group flex items-center text-slate-600 hover:text-slate-800 mb-4 md:mb-6 transition-all duration-300 hover:translate-x-[-4px]"
                    >
                        <FaArrowLeft className="mr-2 md:mr-3 text-base md:text-lg group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium text-sm md:text-base">이벤트 상세로 돌아가기</span>
                    </button>

                    <div className="text-center mb-6 md:mb-8">
                        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            {eventData?.titleKr} 예매
                        </h1>

                        <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8 text-slate-600">
                            <div className="flex items-center group">
                                <FaCalendarAlt className="mr-2 md:mr-3 text-base md:text-lg group-hover:text-blue-600 transition-colors duration-300" />
                                <span className="font-medium text-sm md:text-base">{eventData && `${eventData.startDate} ~ ${eventData.endDate}`}</span>
                            </div>
                            <div className="flex items-center group">
                                <FaMapMarkerAlt className="mr-2 md:mr-3 text-base md:text-lg group-hover:text-blue-600 transition-colors duration-300" />
                                <span className="font-medium text-sm md:text-base">{eventData?.placeName || eventData?.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 선택된 회차 정보 표시 */}
                {selectedSchedule && (
                    <div className="mb-8 md:mb-10 animate-slide-up">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 md:p-8">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-2 md:w-3 h-2 md:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                                <h3 className="text-base md:text-lg font-semibold text-slate-900">선택된 회차</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                                    <div className="w-8 md:w-10 h-8 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FaCalendarAlt className="text-blue-600 text-sm md:text-base" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-slate-600">날짜</p>
                                        <p className="font-semibold text-slate-900 text-sm md:text-base">{selectedSchedule.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                    <div className="w-8 md:w-10 h-8 md:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <FaCalendarAlt className="text-purple-600 text-sm md:text-base" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-slate-600">시간</p>
                                        <p className="font-semibold text-slate-900 text-sm md:text-base">{selectedSchedule.startTime} - {selectedSchedule.endTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 진행 단계 표시 */}
                <div className="mb-8 md:mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-center">
                        {[0, 1, 2].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`relative w-8 md:w-12 h-8 md:h-12 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-all duration-500 ${currentStep === step
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg shadow-blue-500/30'
                                    : currentStep > step
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {step + 1}
                                    {currentStep === step && (
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-ping opacity-75"></div>
                                    )}
                                </div>
                                {step < 2 && (
                                    <div className={`w-16 md:w-32 h-1 mx-2 md:mx-4 transition-all duration-500 ${currentStep > step
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                        : 'bg-slate-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col md:flex-row justify-center mt-4 md:mt-6 space-y-2 md:space-y-0 md:space-x-24">
                        <span className={`text-xs md:text-sm font-medium transition-all duration-300 text-center ${currentStep === 0
                            ? 'text-blue-600 scale-110'
                            : currentStep > 0
                                ? 'text-green-600'
                                : 'text-slate-500'
                            }`}>
                            <FaTicketAlt className="inline mr-1 md:mr-2" />
                            티켓 선택
                        </span>
                        <span className={`text-xs md:text-sm font-medium transition-all duration-300 text-center ${currentStep === 1
                            ? 'text-blue-600 scale-110'
                            : currentStep > 1
                                ? 'text-green-600'
                                : 'text-slate-500'
                            }`}>
                            <FaUser className="inline mr-1 md:mr-2" />
                            예매자 정보
                        </span>
                        <span className={`text-xs md:text-sm font-medium transition-all duration-300 text-center ${currentStep === 2
                            ? 'text-blue-600 scale-110'
                            : 'text-slate-500'
                            }`}>
                            <FaCreditCard className="inline mr-1 md:mr-2" />
                            예매 확인
                        </span>
                    </div>
                </div>

                {/* 단계별 컨텐츠 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 md:p-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    {currentStep === 0 && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl md:text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2 md:gap-3">
                                <FaTicketAlt className="text-blue-600 text-lg md:text-xl" />
                                티켓 선택
                            </h2>
                            <div className="space-y-3">
                                {ticketReservationOptions.map((option, index) => (
                                    <div
                                        key={option.ticketId}
                                        className={`border-2 rounded-xl p-3 md:p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${ticketReservationForm.selectedOption === option.ticketId.toString()
                                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        onClick={() => handleOptionSelect(option.ticketId)}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                                <h3 className="text-base md:text-lg font-semibold text-slate-900">{option.name}</h3>
                                                <span className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    재고: {option.saleQuantity}개
                                                </span>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <span className="text-lg md:text-xl font-bold text-slate-900">
                                                    {option.price === 0 ? '무료' : `${option.price.toLocaleString()}원`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {ticketReservationOptions.length === 0 && (
                                    <div className="text-center py-6 md:py-8 text-slate-500">
                                        <FaTicketAlt className="text-2xl md:text-3xl mx-auto mb-2 md:mb-3 text-slate-300" />
                                        <span className="text-sm md:text-base">판매 가능한 티켓이 없습니다.</span>
                                    </div>
                                )}
                            </div>

                            {ticketReservationForm.selectedOption && (
                                <div className="mt-6 animate-fade-in">
                                    <h3 className="font-semibold text-slate-900 mb-3 text-base md:text-lg">수량 선택</h3>
                                    <div className="flex items-center justify-center space-x-4 md:space-x-6">
                                        <button
                                            onClick={() => handleQuantityChange(ticketReservationForm.quantity - 1)}
                                            disabled={ticketReservationForm.quantity <= 1}
                                            className="w-10 md:w-12 h-10 md:h-12 rounded-full border-2 border-slate-300 flex items-center justify-center disabled:opacity-50 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 disabled:hover:border-slate-300 disabled:hover:bg-white"
                                        >
                                            <span className="text-lg md:text-xl font-bold text-slate-600">-</span>
                                        </button>
                                        <span className="text-2xl md:text-3xl font-bold text-slate-900 w-12 md:w-16 text-center">
                                            {ticketReservationForm.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(ticketReservationForm.quantity + 1)}
                                            disabled={ticketReservationForm.quantity >= getMaxQuantity(getSelectedTicket())}
                                            className="w-10 md:w-12 h-10 md:h-12 rounded-full border-2 border-slate-300 flex items-center justify-center disabled:opacity-50 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 disabled:hover:border-slate-300 disabled:hover:bg-white"
                                        >
                                            <span className="text-xl font-bold text-slate-600">+</span>
                                        </button>
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-600 mt-3 text-center">
                                        {getQuantityLimitText(getSelectedTicket())}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-slate-900 flex items-center gap-2 md:gap-3">
                                <FaUser className="text-blue-600 text-lg md:text-xl" />
                                예매자 정보
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 md:mb-3">
                                        예매자명 *
                                    </label>
                                    <input
                                        type="text"
                                        value={ticketReservationForm.buyer_name}
                                        onChange={(e) => handleInputChange('buyer_name', e.target.value)}
                                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-300 text-sm md:text-base"
                                        placeholder="예매자명을 입력하세요"
                                        disabled
                                    />
                                    <p className="text-xs text-slate-500 mt-1 md:mt-2">로그인된 사용자 정보가 자동으로 입력됩니다</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 md:mb-3">
                                        연락처 *
                                    </label>
                                    <input
                                        type="tel"
                                        value={ticketReservationForm.buyer_phone}
                                        onChange={(e) => handleInputChange('buyer_phone', e.target.value)}
                                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                        placeholder="010-0000-0000"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 md:mb-3">
                                        이메일 *
                                    </label>
                                    <input
                                        type="email"
                                        value={ticketReservationForm.buyer_email}
                                        onChange={(e) => handleInputChange('buyer_email', e.target.value)}
                                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                        placeholder="이메일을 입력하세요"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 md:mb-3">
                                        결제 방법 *
                                    </label>
                                    <select
                                        value={ticketReservationForm.paymentMethod}
                                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                        className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                    >
                                        <option value="card">신용카드</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1 md:mt-2">실제 결제는 다음 단계에서 진행됩니다</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-slate-900 flex items-center gap-2 md:gap-3">
                                <FaCreditCard className="text-blue-600 text-lg md:text-xl" />
                                예매 확인
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 md:p-6">
                                    <h3 className="font-semibold text-slate-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                                        <FaTicketAlt className="text-blue-600" />
                                        예매 정보
                                    </h3>
                                    <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-slate-600 font-medium">이벤트:</span>
                                            <span className="font-semibold text-slate-900 text-right">{eventData?.titleKr}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-slate-600 font-medium">회차:</span>
                                            <span className="font-semibold text-slate-900 text-right">
                                                {selectedSchedule?.date} {selectedSchedule?.startTime} - {selectedSchedule?.endTime}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-slate-600 font-medium">예매 옵션:</span>
                                            <span className="font-semibold text-slate-900 text-right">{getSelectedTicket()?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-slate-600 font-medium">수량:</span>
                                            <span className="font-semibold text-slate-900 text-right">{ticketReservationForm.quantity}매</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-slate-600 font-medium">총 금액:</span>
                                            <span className="text-lg md:text-2xl font-bold text-blue-600 text-right">
                                                {calculateTotal().toLocaleString()}원
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-6">
                                    <h3 className="font-semibold text-slate-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                                        <FaUser className="text-green-600" />
                                        예매자 정보
                                    </h3>
                                    <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                                        <div className="flex justify-between items-center py-2 border-b border-green-100">
                                            <span className="text-slate-600 font-medium">이름:</span>
                                            <span className="font-semibold text-slate-900 text-right">{ticketReservationForm.buyer_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-green-100">
                                            <span className="text-slate-600 font-medium">연락처:</span>
                                            <span className="font-semibold text-slate-900 text-right">{ticketReservationForm.buyer_phone}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-slate-600 font-medium">이메일:</span>
                                            <span className="font-semibold text-slate-900 text-right">{ticketReservationForm.buyer_email}</span>
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
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
                                <div className="bg-white rounded-3xl p-10 mx-4 max-w-md w-full shadow-2xl border border-white/20 animate-scale-in">
                                    <div className="text-center">
                                        {!paymentSuccess ? (
                                            <>
                                                {/* 로딩 애니메이션 */}
                                                <div className="mb-8">
                                                    <div className="relative">
                                                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="animate-pulse h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 메인 메시지 */}
                                                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                                    티켓이 발급중입니다!
                                                </h3>
                                                <p className="text-slate-600 mb-6">
                                                    잠시만 기다려주세요!
                                                </p>

                                                {/* 진행 상태 */}
                                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
                                                    <div className="text-sm font-semibold text-blue-800">
                                                        {paymentStep}
                                                    </div>
                                                </div>

                                                {/* 주의사항 */}
                                                <div className="text-xs text-slate-500">
                                                    페이지를 닫지 마세요
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* 성공 아이콘 */}
                                                <div className="mb-8">
                                                    <div className="h-20 w-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                                        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* 성공 메시지 */}
                                                <h3 className="text-2xl font-bold text-green-800 mb-3">
                                                    티켓 발급 완료!
                                                </h3>
                                                <p className="text-slate-600 mb-6">
                                                    결제가 성공적으로 완료되었습니다
                                                </p>

                                                {/* 리다이렉션 안내 */}
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
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
                    <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-0 mt-8 md:mt-10">
                        <button
                            onClick={handlePrevStep}
                            disabled={currentStep === 0 || isProcessing}
                            className="group px-6 md:px-8 py-2 md:py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 text-sm md:text-base order-2 md:order-1"
                        >
                            <span className="group-hover:translate-x-[-2px] transition-transform duration-300 inline-block">이전</span>
                        </button>

                        {currentStep < 2 ? (
                            <button
                                onClick={handleNextStep}
                                disabled={
                                    (currentStep === 0 && !validateStep0()) ||
                                    (currentStep === 1 && !validateStep1()) ||
                                    isProcessing
                                }
                                className="group px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-purple-500 shadow-lg hover:shadow-xl transform hover:scale-105 border-0 outline-none focus:outline-none text-sm md:text-base order-1 md:order-2"
                            >
                                <span className="group-hover:translate-x-[2px] transition-transform duration-300 inline-block">다음</span>
                            </button>
                        ) : (
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className={`group px-6 md:px-8 py-2 md:py-3 rounded-xl transition-all duration-300 font-semibold border-0 outline-none focus:outline-none transform hover:scale-105 text-sm md:text-base order-1 md:order-2 ${paymentSuccess
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-not-allowed shadow-lg'
                                    : isProcessing
                                        ? 'bg-slate-400 text-white cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {paymentSuccess ? '결제 완료' : isProcessing ? '결제 중...' : '결제하기'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 커스텀 CSS 애니메이션 */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out forwards;
                }
                
                .animate-scale-in {
                    animation: scale-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};