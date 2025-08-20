import {
  ReservationAttendeeDto,
  ReservationFilter,
  ReservationListResponse,
  ReservationUIData,
  RESERVATION_STATUS_NAMES,
  RESERVATION_STATUS_STYLES,
  getCheckinStatus,
  ReservationStatusType,
} from "./types/reservationType";
import authManager from "../utils/auth";

export interface ReservationResponseDto {
  reservationId: number;

  // 박람회(행사) 정보
  eventId: number;
  eventName: string;
  eventDescription?: string;
  eventThumbnailUrl?: string;
  mainCategory?: string;
  subCategory?: string;

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
   * 행사별 예약자 목록 조회 (페이지네이션 + 필터링)
   * 백엔드: GET /api/events/{eventId}/reservations/attendees
   */
  async getReservationAttendees(
    eventId: number,
    filter: ReservationFilter = {}
  ): Promise<ReservationListResponse> {
    try {
      // 쿼리 파라미터 구성
      const params = new URLSearchParams();

      // 필터 조건 추가
      if (filter.name) params.append("name", filter.name);
      if (filter.phone) params.append("phone", filter.phone);
      if (filter.reservationNumber) {
        // 예약번호에서 ID 추출 ("RES-123" -> "123")
        const id = filter.reservationNumber.replace(/^RES-/, "");
        if (!isNaN(Number(id))) {
          params.append("reservationId", id);
        }
      }
      if (filter.reservationStatus)
        params.append("status", filter.reservationStatus);

      // 페이지네이션 파라미터
      params.append("page", (filter.page || 0).toString());
      params.append("size", (filter.size || 15).toString());
      params.append("sortBy", filter.sortBy || "createdAt");
      params.append("sortDir", filter.sortDir || "desc");

      const apiUrl = `/api/events/${eventId}/reservations/attendees?${params.toString()}`;

      const response = await authManager.authenticatedFetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `API 호출 실패: ${response.status} ${response.statusText}`
        );
      }

      const data: ReservationListResponse = await response.json();

      // 응답 데이터 유효성 검사
      if (!data) {
        throw new Error("서버에서 응답 데이터를 받을 수 없습니다.");
      }

      return data;
    } catch (error: any) {
      // 네트워크 에러 처리
      if (
        error.message?.includes("Failed to fetch") ||
        error.name === "TypeError"
      ) {
        throw new Error(
          "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."
        );
      }

      throw error;
    }
  }

  /**
   * 예약자 명단 엑셀 다운로드
   * 백엔드: GET /api/events/{eventId}/reservations/attendees/excel
   */
  async downloadAttendeesExcel(
    eventId: number,
    filter: ReservationFilter = {}
  ): Promise<void> {
    try {
      // 필터 조건을 쿼리 파라미터로 전달
      const params = new URLSearchParams();
      if (filter.name) params.append("name", filter.name);
      if (filter.phone) params.append("phone", filter.phone);
      if (filter.reservationStatus)
        params.append("status", filter.reservationStatus);

      const apiUrl = `/api/events/${eventId}/reservations/attendees/excel?${params.toString()}`;
      const response = await authManager.authenticatedFetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `엑셀 다운로드 API 호출 실패: ${response.status} ${response.statusText}`
        );
      }

      // 브라우저에서 파일 다운로드 처리
      const blob = await response.blob();

      // Content-Type 확인
      if (!blob.type.includes("spreadsheet") && !blob.type.includes("excel")) {
        // blob을 텍스트로 읽어서 에러 메시지 확인
        const text = await blob.text();
        throw new Error(`잘못된 응답 형식: ${text}`);
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // 파일명 생성 (현재 날짜 포함)
      const today = new Date();
      const dateString =
        today.getFullYear() +
        String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getDate()).padStart(2, "0");
      link.download = `예약자목록_이벤트${eventId}_${dateString}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 백엔드 DTO를 UI용 데이터로 변환
   */
  transformToUIData(dto: ReservationAttendeeDto): ReservationUIData {
    const reservationStatus = dto.reservationStatus as ReservationStatusType;
    const checkinInfo = getCheckinStatus(reservationStatus);
    const statusStyle = RESERVATION_STATUS_STYLES[reservationStatus] || {
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    };

    return {
      ...dto,
      // UI 전용 필드 추가
      reservationNumber: `RES-${dto.reservationId.toString().padStart(6, "0")}`,
      reservationDate: this.formatDateTime(dto.createdAt),
      paymentStatusColor: statusStyle.bgColor,
      paymentStatusTextColor: statusStyle.textColor,
      checkinStatus: checkinInfo.status,
      checkinStatusColor: checkinInfo.bgColor,
      // 상태명을 한글로 변환
      reservationStatus:
        RESERVATION_STATUS_NAMES[reservationStatus] || dto.reservationStatus,
    };
  }

  /**
   * 날짜시간 포맷팅 (ISO 8601 -> "YYYY.MM.DD HH:mm")
   */
  private formatDateTime(isoString: string): string {
    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}.${month}.${day} ${hours}:${minutes}`;
    } catch (error) {
      return isoString;
    }
  }

  /**
   * 내 예약 목록 조회
   */
  async getMyReservations(): Promise<ReservationResponseDto[]> {
    try {
      const response = await authManager.authenticatedFetch(
        "/api/me/reservations"
      );

      if (!response.ok) {
        throw new Error(`예약 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("예약 목록 조회 중 오류:", error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const reservationService = new ReservationService();

export default reservationService;
