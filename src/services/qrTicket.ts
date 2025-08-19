import api from "../api/axios";
import type {
    QrTicketRequestDto,
    QrTicketResponseDto,
    QrTicketGuestResponseDto,
    QrTicketReissueMemberRequestDto,
    QrTicketReissueGuestRequestDto,
    QrTicketReissueRequestDto,
    QrTicketUpdateResponseDto,
    QrTicketReissueResponseDto,
    QrCheckRequestDto,
    ManualCheckRequestDto,
    CheckResponseDto,
    AdminForceCheckRequestDto
} from "./types/qrTicketType";

// 마이페이지에서 QR 티켓 조회
export const getQrTicketForMypage = async (data: QrTicketRequestDto): Promise<QrTicketResponseDto> => {
    const res = await api.post<QrTicketResponseDto>(`/api/qr-tickets`,data);
    return res.data;
}

// 비회원 QR 티켓 링크를 통한 조회
export const getQrTicketForLink = async (token: string): Promise<QrTicketGuestResponseDto> => {
    const res = await api.get<QrTicketGuestResponseDto>(`/api/qr-tickets/${token}`);
    return res.data;
}

// QR 티켓 화면에서 새로고침 버튼 이용해 재발급 - 회원
export const reissueQrTicketByMember = async (data: QrTicketReissueMemberRequestDto): Promise<QrTicketUpdateResponseDto> => {
    const res = await api.post<QrTicketUpdateResponseDto>(`/api/qr-tickets/reissue/member`,data);
    return res.data;
}

// QR 티켓 화면에서 새로고침 버튼 이용해 재발급 - 비회원
export const reissueQrTicketByGuest = async (data: QrTicketReissueGuestRequestDto): Promise<QrTicketUpdateResponseDto> => {
    const res = await api.post<QrTicketUpdateResponseDto>(`/api/qr-tickets/reissue/guest`,data);
    return res.data;
}

// QR 티켓 강제 재발급 - 회원
export const reissueQrTicket = async (data: QrTicketReissueRequestDto): Promise<QrTicketReissueResponseDto> => {
    const res = await api.post<QrTicketReissueResponseDto>(`/api/qr-tickets/admin/reissue`,data);
    return res.data;
}

// QR 티켓 강제 재발급 후 메일 전송 - 회원, 비회원
export const reissueQrTicketSendEmail = async (data: QrTicketReissueRequestDto): Promise<QrTicketReissueResponseDto> => {
    const res = await api.post<QrTicketReissueResponseDto>(`/api/qr-tickets/admin/reissue/send-email`,data);
    return res.data;
}

// 체크인 QR
export const checkInQr = async (data: QrCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-in/qr`,data);
    return res.data;
}

// 체크인 수동
export const checkInManual = async (data: ManualCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-in/manual`,data);
    return res.data;    
}

// 체크아웃 QR
export const checkOutQr = async (data: QrCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-out/qr`,data);
    return res.data;    
}

// 체크아웃 수동
export const checkOutManual = async (data: ManualCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/check-out/manual`,data);
    return res.data;    
}

// // 부스 입장 
// export const checkBoothQr = async (): Promise<> => {

// }

export const adminForceCheck = async (data: AdminForceCheckRequestDto): Promise<CheckResponseDto> => {
    const res = await api.post<CheckResponseDto>(`/api/qr-tickets/admin/check`,data);
    return res.data;    
}