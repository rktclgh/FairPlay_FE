// 아임포트 결제 서비스
import authManager from "../utils/auth";
import ticketReservationService from "./ticketReservationService";

// 아임포트 타입 선언
declare global {
    interface Window {
        IMP?: {
            init: (code: string) => void;
            request_pay: (
                param: {
                    pg: string;
                    pay_method: string;
                    merchant_uid: string;
                    name: string;
                    amount: number;
                    buyer_email?: string;
                    buyer_name: string;
                    m_redirect_url?: string;
                    popup?: boolean;
                },
                cb: (rsp: IamportResponse) => void
            ) => void;
        };
    }
}

// 결제 요청 인터페이스
export interface PaymentRequest {
    pg: string; // 결제대행사 (예: 'uplus', 'html5_inicis')
    pay_method: string; // 결제 방법 ('card', 'trans', 'vbank')
    merchant_uid: string; // 가맹점 주문번호
    name: string; // 주문명
    amount: number; // 결제금액
    buyer_email?: string; // 구매자 이메일
    buyer_name: string; // 구매자 이름
    m_redirect_url?: string; // 모바일 결제 완료 후 리다이렉트 URL
    popup?: boolean; // 팝업 창 사용 여부 (false: 리다이렉트 방식)
}

// 결제 완료 요청 인터페이스
export interface PaymentCompletionRequest {
    merchantUid: string;
    impUid: string;
    amount: number;
    applyNum?: string; // 카드 승인번호
}

// 아임포트 응답 인터페이스
export interface IamportResponse {
    success: boolean;
    merchant_uid: string;
    imp_uid?: string;
    paid_amount?: number;
    apply_num?: string; // 카드 승인번호
    error_msg?: string;
    error_code?: string;
}

// 예약 요청 인터페이스
export interface ReservationRequest {
    ticketId: number;
    quantity: number;
    price: number; // 총 결제 금액 추가
    paymentMethod: string;
    scheduleId: number;
    paymentData: {
        imp_uid: string;
        merchant_uid: string;
        paid_amount: number;
        apply_num?: string;
    };
}

// 환불 요청 인터페이스
export interface RefundRequest {
    paymentId: number;
    merchantUid: string;
    refundRequestAmount: number;
    reason: string;
}

class PaymentService {
    private readonly IMP_CODE = "imp12487764"; // 가맹점 코드
    private isInitialized = false;



    /**
     * 아임포트 스크립트 로드 및 초기화
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        return new Promise((resolve, reject) => {
            // 이미 스크립트가 로드되어 있는지 확인
            if (window.IMP) {
                window.IMP.init(this.IMP_CODE);
                this.isInitialized = true;
                resolve();
                return;
            }

            // 스크립트 태그 생성 및 로드
            const script = document.createElement('script');
            script.src = 'https://cdn.iamport.kr/v1/iamport.js';
            script.async = true;
            
            script.onload = () => {
                if (window.IMP) {
                    window.IMP.init(this.IMP_CODE);
                    this.isInitialized = true;
                    resolve();
                } else {
                    reject(new Error('아임포트 스크립트 로드 실패'));
                }
            };

            script.onerror = () => {
                reject(new Error('아임포트 스크립트 로드 실패'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * 백엔드에서 고유한 주문번호 생성
     */
    async generateMerchantUid(targetType: string): Promise<string> {
        try {
            const response = await authManager.authenticatedFetch(`/api/payments/merchant-uid?targetType=${targetType}`);

            if (!response.ok) {
                throw new Error(`merchantUid 생성 실패: ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            console.error('merchantUid 생성 중 오류:', error);
            // 백엔드 호출 실패 시 기존 방식으로 fallback
            return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    /**
     * 결제 요청
     */
    async requestPayment(paymentRequest: PaymentRequest): Promise<IamportResponse> {
        await this.initialize();

        if (!window.IMP) {
            throw new Error('결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
        }

        return new Promise((resolve) => {
            window.IMP!.request_pay(paymentRequest, (response: IamportResponse) => {
                resolve(response);
            });
        });
    }

    /**
     * 환불 요청
     */
    async requestRefund(refundData: RefundRequest): Promise<any> {
        try {
            const response = await authManager.authenticatedFetch(`/api/refunds/${refundData.paymentId}/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    merchantUid: refundData.merchantUid,
                    refundRequestAmount: refundData.refundRequestAmount,
                    reason: refundData.reason
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`환불 요청 실패: ${response.status} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error('환불 요청 중 오류:', error);
            throw error;
        }
    }

    /**
     * 환불 승인
     */
    async approveRefund(refundId: number): Promise<any> {
        try {
            const response = await authManager.authenticatedFetch(`/api/refunds/${refundId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`환불 승인 실패: ${response.status} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error('환불 승인 중 오류:', error);
            throw error;
        }
    }

    /**
     * 완전한 결제 처리 함수 (결제 요청 저장 → 아임포트 결제 → 결제 완료 처리)
     */
    async processPayment(
        title:string,
        userId:number,
        userName:string,
        eventId:number,
        paymentTargetType:string,
        quantity:number,
        price:number,
        amount:number,
        reservationData?: any
    ): Promise<any> {
        try {
            // 무료 티켓인지 확인
            if (amount === 0) {
                return await this.processFreeTicket(
                    title, userId, userName, eventId, paymentTargetType, quantity, price, amount, reservationData
                );
            }

            const merchantUid = await this.generateMerchantUid(paymentTargetType);
            console.log('merchantUid:', merchantUid);

            // 1. 백엔드에 결제 요청 정보 저장 (PENDING 상태) - paymentId 반환
            const savedPayment = await this.savePaymentRequest({
                eventId: eventId,
                paymentTargetType: paymentTargetType,
                quantity: quantity,
                price: amount / quantity,
                amount:amount,
                merchantUid: merchantUid,
                pgProvider: 'uplus'
            });
            
            console.log('저장된 paymentId:', savedPayment.paymentId);

            // 3. 결제 요청 데이터 준비
            const scheduleId = reservationData?.scheduleId;
            const redirectUrl = scheduleId 
                ? `${window.location.origin}/ticket-reservation/${eventId}?scheduleId=${scheduleId}&success=true`
                : `${window.location.origin}/ticket-reservation/${eventId}?success=true`;
                
            const paymentRequest: PaymentRequest = {
                pg: 'uplus',
                pay_method: 'card',
                merchant_uid: merchantUid,
                name: `${title}`,
                amount: amount,
                buyer_name: userName,
                m_redirect_url: redirectUrl,
                popup: false
            };

            // 4. 아임포트 결제 요청
            const paymentResponse = await this.requestPayment(paymentRequest);

            if (!paymentResponse.success) {
                throw new Error(paymentResponse.error_msg || '결제가 실패했습니다.');
            }

            // 5. 결제 성공 시 백엔드로 결과 전송 (아임포트 검증 + 결제 상태 변경 - COMPLETED)
            const completionResult = await this.completePayment({
                merchantUid: paymentResponse.merchant_uid,
                impUid: paymentResponse.imp_uid!,
                amount: paymentResponse.paid_amount!,
                applyNum: paymentResponse.apply_num
            });

            console.log('결제 완료 결과:', completionResult);

            // completionResult에서 targetId를 가져옵니다 (백엔드에서 예약 생성 후 반환)
            const targetId = completionResult.targetId;
            
            if (!targetId) {
                throw new Error('결제 완료 후 예약 ID를 가져올 수 없습니다.');
            }

            console.log('백엔드에서 반환된 targetId:', targetId);

            return {
                success: true,
                paymentId: savedPayment.paymentId,
                paymentResponse,
                completionResult,
                targetId
            };

        } catch (error) {
            console.error('결제 처리 중 오류:', error);
            throw error;
        }
    }

    /**
     * 무료 티켓 처리 (PG사 연동 없이 직접 처리)
     */
    async processFreeTicket(
        title: string,
        userId: number,
        userName: string,
        eventId: number,
        paymentTargetType: string,
        quantity: number,
        price: number,
        amount: number,
        reservationData?: any
    ): Promise<any> {
        try {
            const merchantUid = await this.generateMerchantUid(paymentTargetType);
            console.log('무료 티켓 처리 - merchantUid:', merchantUid);

            // 1. 무료 티켓 직접 처리 (백엔드에서 즉시 완료 처리) - paymentId 반환
            const freeTicketResult = await this.processFreeTicketOnServer({
                eventId: eventId,
                paymentTargetType: paymentTargetType,
                quantity: quantity,
                price: 0, // 무료 티켓이므로 0
                merchantUid: merchantUid,
                pgProvider: 'free'
            });
            
            console.log('무료 티켓 paymentId:', freeTicketResult.paymentId);

            console.log('무료 티켓 처리 결과:', freeTicketResult);

            // freeTicketResult에서 targetId를 가져옵니다 (백엔드에서 예약 생성 후 반환)
            const targetId = freeTicketResult.targetId;
            
            if (!targetId) {
                throw new Error('무료 티켓 처리 후 예약 ID를 가져올 수 없습니다.');
            }

            console.log('무료 티켓 백엔드에서 반환된 targetId:', targetId);

            return {
                success: true,
                paymentId: freeTicketResult.paymentId,
                paymentResponse: {
                    success: true,
                    merchant_uid: freeTicketResult.merchantUid,
                    imp_uid: freeTicketResult.impUid,
                    paid_amount: 0,
                    apply_num: 'FREE_TICKET'
                },
                completionResult: freeTicketResult,
                targetId
            };

        } catch (error) {
            console.error('무료 티켓 처리 중 오류:', error);
            throw error;
        }
    }

    /**
     * 백엔드에 결제 요청 정보 저장
     */
    async savePaymentRequest(paymentData: {
        eventId?: number;
        paymentTargetType: string;
        quantity: number;
        price: number;
        amount: number;
        merchantUid: string;
        pgProvider: string;
    }): Promise<any> {
        try {
            const response = await authManager.authenticatedFetch('/api/payments/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventId: paymentData.eventId,
                    paymentTargetType: paymentData.paymentTargetType,
                    quantity: paymentData.quantity,
                    price: paymentData.price,
                    amount: paymentData.amount,
                    merchantUid: paymentData.merchantUid,
                    pgProvider: paymentData.pgProvider,
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`결제 요청 저장 실패: ${response.status} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error('결제 요청 저장 중 오류:', error);
            throw error;
        }
    }

    /**
     * 무료 티켓 서버 처리
     */
    async processFreeTicketOnServer(paymentData: {
        eventId?: number;
        paymentTargetType: string;
        quantity: number;
        price: number;
        merchantUid: string;
        pgProvider: string;
    }): Promise<any> {
        try {
            const response = await authManager.authenticatedFetch('/api/payments/free', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventId: paymentData.eventId,
                    paymentTargetType: paymentData.paymentTargetType,
                    quantity: paymentData.quantity,
                    price: paymentData.price,
                    merchantUid: paymentData.merchantUid,
                    pgProvider: paymentData.pgProvider,
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`무료 티켓 처리 실패: ${response.status} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error('무료 티켓 서버 처리 중 오류:', error);
            throw error;
        }
    }

    /**
     * 결제 완료 처리 (백엔드로 결과 전송)
     */
    async completePayment(completionData: PaymentCompletionRequest): Promise<any> {
        try {
            const response = await authManager.authenticatedFetch('/api/payments/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    merchantUid: completionData.merchantUid,
                    impUid: completionData.impUid,
                    amount: completionData.amount,
                    applyNum: completionData.applyNum
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`결제 완료 처리 실패: ${response.status} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error('결제 완료 처리 중 오류:', error);
            throw error;
        }
    }


    /**
     * 스크립트 정리
     */
    cleanup(): void {
        const scripts = document.querySelectorAll('script[src*="iamport"]');
        scripts.forEach(script => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        });
        this.isInitialized = false;
    }
}

// 싱글톤 인스턴스 생성
const paymentService = new PaymentService();

export default paymentService;