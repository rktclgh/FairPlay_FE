import authManager from "../utils/auth";

// 예약 요청 인터페이스
export interface ReservationRequest {
    eventId: number;
    scheduleId?: number;
    ticketId: number;
    quantity: number;
    price: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    paymentMethod: string;
    paymentData?: {
        imp_uid: string;
        merchant_uid: string;
        paid_amount: number;
        apply_num?: string;
    };
}

class TicketReservationService {

    /**
     * 티켓 예약
     */
    async processTicketReservation(
        eventId: number,
        reservationData: ReservationRequest
    ): Promise<any> {
        try {
            const response = await authManager.authenticatedFetch(`/api/events/${eventId}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`예약 실패: ${response.status} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error('예약 처리 중 오류:', error);
            throw error;
        }
    }
}

// 싱글톤 인스턴스 생성
const ticketReservationService = new TicketReservationService();

export default ticketReservationService;