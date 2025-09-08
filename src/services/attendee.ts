import api from "../api/axios";
import type {
    AttendeeSaveRequestDto,
    AttendeeInfoResponseDto,
    AttendeeListInfoResponseDto,
    AttendeeUpdateRequestDto,
    ShareTicketInfoResponseDto,
    TokenResponseDto
} from "./types/attendeeType";

// HTTP-only 쿠키 방식으로 변경 - Authorization 헤더 불필요
// api 인스턴스가 withCredentials: true로 설정되어 쿠키 자동 전송

// 폼 링크 조회
export const getFormInfo = async (token: string): Promise<ShareTicketInfoResponseDto> => {
    const res = await api.get<ShareTicketInfoResponseDto>(`/api/form?token=${token}`);
    return res.data;
}

// 폼 링크 토큰 조회
export const getFormLink = async (reservationId: number): Promise<TokenResponseDto> => {
    const res = await api.get<TokenResponseDto>(`/api/form/${reservationId}`);
    return res.data;
}

// 참석자 저장
export const saveAttendee = async (token: string, data: AttendeeSaveRequestDto): Promise<AttendeeInfoResponseDto> => {
    const res = await api.post<AttendeeInfoResponseDto>(`/api/attendees?token=${token}`, data);
    return res.data;
}

// 참석자 전체 조회
export const getAttendeesReservation = async (reservationId: number): Promise<AttendeeListInfoResponseDto> => {
    const res = await api.get<AttendeeListInfoResponseDto>(`/api/attendees/${reservationId}`);
    return res.data;
}

// 참석자 정보 변경
export const updateAttendee = async (attendeeId: number, data: AttendeeUpdateRequestDto): Promise<AttendeeInfoResponseDto> => {
    const res = await api.patch<AttendeeInfoResponseDto>(`/api/attendees/${attendeeId}`, data);
    return res.data;
}

// 행사별 예약자 명단 조회
export const getAttendeesEvent = async (eventId: number): Promise<AttendeeInfoResponseDto[]> => {
    const res = await api.get<AttendeeInfoResponseDto[]>(`/api/attendees/events/${eventId}`);
    return res.data;
}