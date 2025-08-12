import authManager from '../utils/auth';

// 티켓 상태 enum
export type TicketStatusCode = 'BEFORE_SALE' | 'SELLING' | 'SOLD_OUT' | 'CLOSED';

// 티켓 타입 enum
export type AudienceType = 'ADULT' | 'TEEN' | 'CHILD';

// 좌석 등급 enum
export type SeatType = 'VIP' | 'R' | 'S' | 'A' | 'B' | 'FREE';

// 티켓 타입 정의
export interface Ticket {
  ticketId?: number;
  name: string;
  description?: string;
  seatTypeCode: string;
  seatTypeName: string;
  audienceTypeCode: string;
  audienceTypeName: string;
  price: number;
  ticketStatusCode: string;
  ticketStatusName: string;
  maxPurchase: number;
  stock?: number;
  visible?: boolean;
  deleted?: boolean;
  types?: string;
  createdAt?: string;
  version?: number;
  message?: string;
}

// API 요청/응답 타입
export interface TicketCreateRequest {
  name: string;
  seatType: SeatType;
  audienceType: AudienceType;
  price: number;
  ticketStatusCode: TicketStatusCode;
  maxPurchase: number;
}

export interface TicketUpdateRequest extends TicketCreateRequest {
  id: number;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
}

// 티켓 API 서비스 클래스
export class TicketService {
  private baseUrl = '/api/events';

  // 티켓 목록 조회
  async getTickets(eventId?: number, seatType?: string, searchTicketName?: string, audienceType?: string): Promise<Ticket[]> {
    try {
      const params = new URLSearchParams();
      if (eventId) params.append('eventId', eventId.toString());
      if (seatType && seatType !== '전체') params.append('seatType', seatType);
      if (audienceType && audienceType !== '전체') params.append('audienceType', audienceType);
      if (searchTicketName) params.append('searchTicketName', searchTicketName);

      const url = `${this.baseUrl}/${eventId}/tickets${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await authManager.authenticatedFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`티켓 목록 조회 실패: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tickets || data;
    } catch (error) {
      throw error;
    }
  }

  // 티켓 생성
  async createTicket(eventId: number, ticketData: TicketCreateRequest): Promise<Ticket> {
    try {
      const response = await authManager.authenticatedFetch(`/api/events/${eventId}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        await response.text();
        throw new Error(`티켓 생성 실패: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // 티켓 수정
  async updateTicket(eventId: number, ticketId: number, ticketData: TicketCreateRequest): Promise<Ticket> {
    try {
      const response = await authManager.authenticatedFetch(`${this.baseUrl}/${eventId}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        throw new Error(`티켓 수정 실패: ${response.statusText}`);
      }

      const updatedTicket = await response.json();
      return updatedTicket;
    } catch (error) {
      throw error;
    }
  }

  // 티켓 삭제
  async deleteTicket(eventId: number, ticketId: number): Promise<boolean> {
    try {
      const response = await authManager.authenticatedFetch(`${this.baseUrl}/${eventId}/tickets/${ticketId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`티켓 삭제 실패: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // 상태 변환 유틸리티
  getTicketStatusCode(status: string): { text: string; color: string; textColor: string } {
    switch (status) {
      case 'BEFORE_SALE':
        return { text: '판매전', color: 'bg-gray-100', textColor: 'text-gray-800' };
      case 'SELLING':
        return { text: '판매중', color: 'bg-green-100', textColor: 'text-green-800' };
      case 'SOLD_OUT':
        return { text: '품절', color: 'bg-red-100', textColor: 'text-red-800' };
      case 'CLOSED':
        return { text: '판매 종료', color: 'bg-orange-100', textColor: 'text-orange-800' };
      default:
        return { text: '알 수 없음', color: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  }

  // 티켓 유형별 색상
  getAudienceTypeColor(type: string): string {
    switch (type) {
      case "ADULT":
        return "bg-red-100 text-red-800";
      case "TEEN":
        return "bg-blue-100 text-blue-800";
      case "CHILD":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // 티켓 유형 한글 변환
  getAudienceTypeName(type: string): string {
    switch (type) {
      case 'ADULT':
        return '성인';
      case 'TEEN':
        return '청소년';
      case 'CHILD':
        return '어린이';
      default:
        return type;
    }
  }

  // 좌석 등급 한글 변환
  getSeatTypeName(seatGrade: string): string {
    switch (seatGrade) {
      case 'VIP':
        return 'VIP석';
      case 'R':
        return 'R석';
      case 'S':
        return 'S석';
      case 'A':
        return 'A석';
      case 'B':
        return 'B석';
      case 'FREE':
        return '자유석';
      default:
        return seatGrade;
    }
  }

  // 상수 정의
  static readonly AUDIENCE_TYPES = [
    { value: 'ADULT', label: '성인' },
    { value: 'TEEN', label: '청소년' },
    { value: 'CHILD', label: '어린이' },
  ];

  static readonly SEAT_TYPES = [
    { value: 'VIP', label: 'VIP석' },
    { value: 'R', label: 'R석' },
    { value: 'S', label: 'S석' },
    { value: 'A', label: 'A석' },
    { value: 'B', label: 'B석' },
    { value: 'FREE', label: '자유석' },
  ];

  static readonly TICKET_STATUSES = [
    { value: 'BEFORE_SALE', label: '판매전' },
    { value: 'SELLING', label: '판매중' },
    { value: 'SOLD_OUT', label: '품절' },
    { value: 'CLOSED', label: '판매 종료' },
  ];
}

// 싱글톤 인스턴스 export
export const ticketService = new TicketService();