import authManager from "../utils/auth";

// 백엔드 ReservationResponseDto와 정확히 일치하는 타입 정의 (null 안전성 고려)
export interface ReservationResponseDto {
    reservationId: number;
    
    // 박람회(행사) 정보
    eventId: number;
    eventName: string;
    eventDescription?: string;
    eventThumbnailUrl?: string;
    
    // 회차 정보 (일정) - schedule이 없을 수 있음
    scheduleId?: number;
    scheduleDate?: string; // LocalDate -> string (YYYY-MM-DD)
    startTime?: string; // LocalTime -> string (HH:MM:SS)
    endTime?: string; // LocalTime -> string (HH:MM:SS)
    
    // 티켓 정보
    ticketId: number;
    ticketName: string;
    ticketDescription?: string;
    ticketPrice: number;
    
    // 예약자 정보
    userId: number;
    userName: string;
    userEmail: string;

    // 예약 정보
    quantity: number;
    price: number;
    reservationStatus: string;
    createdAt: string; // LocalDateTime -> string (ISO format)
    updatedAt: string; // LocalDateTime -> string (ISO format)
    canceled: boolean;
    canceledAt: string | null; // LocalDateTime -> string (ISO format) or null
    
    // 결제 정보 (optional - 결제가 연결된 경우만)
    paymentId?: number;
    merchantUid?: string;
    impUid?: string;
    paymentAmount?: number;
    paymentStatus?: string;
    paymentMethod?: string;
    paidAt?: string; // LocalDateTime -> string (ISO format)
}

class ReservationService {
    /**
     * 내 예약 목록 조회
     */
    async getMyReservations(): Promise<ReservationResponseDto[]> {
        try {
            const response = await authManager.authenticatedFetch('/api/me/reservations');
            
            if (!response.ok) {
                throw new Error(`예약 목록 조회 실패: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('예약 목록 조회 중 오류:', error);
            throw error;
        }
    }
}

// 싱글톤 인스턴스 생성
const reservationService = new ReservationService();

export default reservationService;