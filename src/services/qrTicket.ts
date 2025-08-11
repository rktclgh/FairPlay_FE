import api from "../api/axios";
import type {
    QrTicketRequestDto,
    QrTicketResponseDto,
    QrTicketUpdateRequestDto,
    QrTicketUpdateResponseDto,
    QrTicketReissueRequestDto,
    QrTicketReissueResponseDto,
    MemberQrCheckRequestDto,
    MemberManualCheckRequestDto,
    GuestQrCheckRequestDto,
    GuestManualCheckRequestDto,
    CheckResponseDto,
    AdminForceCheckRequestDto
} from "./types/qrTicketType";

// 마이페이지에서 QR 티켓 조회
export const getQrTicketForMypage = async (data: QrTicketRequestDto): Promise<QrTicketResponseDto> => {
    const res = await api.post<QrTicketResponseDto>(`/api/qr-tickets`,data);
    return res.data;
}

// 비회원 QR 티켓 링크를 통한 조회
export const getQrTicketForLink = async (token: string): Promise<QrTicketResponseDto> => {
    const res = await api.get<QrTicketResponseDto>(`/api/qr-tickets/${token}`);
    return res.data;
}

// QR 티켓 화면에서 새로고침 버튼 이용해 재발급 
export const reissueQrTicket = async (data: QrTicketUpdateRequestDto): Promise<QrTicketUpdateResponseDto> => {
    const res = await api.post<QrTicketUpdateResponseDto>(`/api/qr-tickets/reissue`,data);
    return res.data;
}

// 회원이 마이페이지에서 QR 링크 조회 안될 때 관리자 강제 QR 티켓 리셋 요청
export const reissueAdminQrTicketByUser = async (data: QrTicketReissueRequestDto): Promise<QrTicketReissueResponseDto> => {
    const res = await api.post<QrTicketReissueResponseDto>(`/api/qr-tickets/admin/reissue`,data);
    return res.data;
}

// 회원, 비회원 관리자 강제 QR 티켓 리셋 후 재발급 이메일 발송
export const reissueAdminQrTicket = async (data: QrTicketReissueRequestDto): Promise<QrTicketReissueResponseDto> => {
    const res = await api.post<QrTicketReissueResponseDto>(`/api/qr-tickets/admin/reissue/send-email`,data);
    return res.data;
}

// 회원 + QR 체크인
export const checkInWithQrByMember = async (data: MemberQrCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-in/member/qr`,data);
    return res.data;
}

// 회원 + 수동코드 체크인
export const checkInWithManualByMember = async (data: MemberManualCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-in/member/manual`,data);
    return res.data;
}

// 비회원 + QR 체크인
export const checkInWithQrByGuest = async (data: GuestQrCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-in/guest/q`,data);
    return res.data;
}

// 회원 + QR 체크아웃
export const checkOutWithQrByMember = async (data: GuestManualCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-out/guest/manual`,data);
    return res.data;
}

// 회원 + 수동코드 체크아웃
export const checkOutWithManualByMember = async (data: MemberQrCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-out/guest/manual`,data);
    return res.data;
}

// 비회원 + QR 체크아웃
export const checkOutWithQrByGuest = async (data: MemberManualCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-out/guest/manual`,data);
    return res.data;
}

// 비회원 + 수동코드 체크아웃
export const checkOutWithManualByGuest = async (data: GuestQrCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-out/guest/manual`,data);
    return res.data;
}

// 관리자 강제 체크인/체크아웃
export const adminForceCheck = async (data: AdminForceCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/admin/check`,data);
    return res.data;
}