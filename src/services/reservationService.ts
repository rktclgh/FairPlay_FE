import {
  ReservationAttendeeDto,
  ReservationFilter,
  ReservationListResponse,
  ReservationUIData,
  RESERVATION_STATUS_NAMES,
  RESERVATION_STATUS_STYLES,
  getCheckinStatus,
  ReservationStatusType,
  PageResponse,
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
  private isActiveReservation(reservation: ReservationResponseDto): boolean {
    if (reservation.canceled) {
      return false;
    }

    const statuses = [reservation.reservationStatus, reservation.paymentStatus]
      .filter((status): status is string => Boolean(status))
      .map((status) => status.toLowerCase());

    return !statuses.some(
      (status) =>
        status.includes("cancel") ||
        status.includes("refund") ||
        status.includes("취소") ||
        status.includes("환불")
    );
  }

  private normalizeMyReservationsPage(
    data: unknown,
    page: number,
    size: number,
    activeOnly: boolean
  ): PageResponse<ReservationResponseDto> {
    const normalizedPage = Math.max(page, 0);
    const normalizedSize = Math.max(size, 1);

    // 구버전 백엔드는 전체 예약 배열을 반환한다. 새 Page 계약과 함께
    // 배포되는 동안에도 화면이 응답 형태에 따라 깨지지 않도록 페이지로 변환한다.
    if (Array.isArray(data)) {
      const reservations = (data as ReservationResponseDto[]).filter(
        (reservation) => !activeOnly || this.isActiveReservation(reservation)
      );
      const totalPages = Math.ceil(reservations.length / normalizedSize);
      const start = normalizedPage * normalizedSize;
      const content = reservations.slice(start, start + normalizedSize);

      return {
        content,
        totalElements: reservations.length,
        totalPages,
        size: normalizedSize,
        number: normalizedPage,
        numberOfElements: content.length,
        first: normalizedPage === 0,
        last: totalPages === 0 || normalizedPage >= totalPages - 1,
        empty: content.length === 0,
      };
    }

    if (
      data === null ||
      typeof data !== "object" ||
      !Array.isArray((data as { content?: unknown }).content)
    ) {
      throw new Error("예약 목록 응답 형식이 올바르지 않습니다.");
    }

    return data as PageResponse<ReservationResponseDto>;
  }

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
    } catch (error: unknown) {
      // 네트워크 에러 처리
      const message = error instanceof Error ? error.message : "";
      const name = error instanceof Error ? error.name : "";
      if (
        message.includes("Failed to fetch") ||
        name === "TypeError"
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
    } catch {
      return isoString;
    }
  }

  /**
   * 내 예약 목록 조회
   */
  async getMyReservations(): Promise<ReservationResponseDto[]> {
    const pageSize = 50;
    const firstPage = await this.getMyReservationsPage(0, pageSize);
    const reservations = [...firstPage.content];

    for (let page = 1; page < firstPage.totalPages; page += 1) {
      const nextPage = await this.getMyReservationsPage(page, pageSize);
      reservations.push(...nextPage.content);
    }

    return reservations;
  }

  async getMyReservationsPage(
    page: number = 0,
    size: number = 5,
    activeOnly: boolean = false
  ): Promise<PageResponse<ReservationResponseDto>> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        activeOnly: String(activeOnly),
      });
      const response = await authManager.authenticatedFetch(
        `/api/me/reservations?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`예약 목록 조회 실패: ${response.status}`);
      }

      const data: unknown = await response.json();
      return this.normalizeMyReservationsPage(data, page, size, activeOnly);
    } catch (error) {
      console.error("예약 목록 조회 중 오류:", error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const reservationService = new ReservationService();

export default reservationService;
