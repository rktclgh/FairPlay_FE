
/* ===== 티켓 조회 ===== */

// 마이페이지 QR 티켓 조회 요청
export interface QrTicketRequestDto{
    attendeeId: number | null,
    eventId: number,
    ticketId: number,
    reservationId: number | null
}

interface ViewingScheduleInfo{
        date: string, 
    dayOfWeek: string, 
    startTime: string; 
}

// 마이페이지 QR 티켓 조회 또는 비회원 QR 티켓 조회 응답
export interface QrTicketResponseDto{
    qrTicketId: number,
    title: string, // 행사 제목
    buildingName: string, // 행사 장소
    address: string // 행사 주소
    qrCode: string, // QR 이미지 코드
    manualCode: string, // 수동 코드
    ticketNo: string, // 티켓 번호
    viewingScheduleInfo: ViewingScheduleInfo, // 관람 일시 정보
    reservationDate: string // 예매일
}

/* ===== 티켓 재발급 ===== */

// QR 화면 새로고침 버튼 이용한 재발급 요청  - 비회원 
export interface QrTicketReissueGuestRequestDto{
    qrUrlToken: string // qr 화면 url 맨 뒤 token 값
}

// QR 화면 새로고침 버튼 이용한 재발급 요청  - 회원 
export interface QrTicketReissueMemberRequestDto{
    reservationId: number,
    qrTicketId: number
}

//  회원이 마이페이지에서 QR 링크 조회 안될 때 관리자 강제 QR 티켓 리셋 요청
// 회원/비회원 QR 티켓 리셋 요청 후 이메일로 재발급 링크 발급 요청
export interface QrTicketReissueRequestDto{
    attendeeId: number, // 참석자 ID
    ticketNo: string // 티켓 번호
}

// QR 티켓 재발급 응답 
export interface QrTicketReissueResponseDto{
    ticketNo: string, // 티켓 번호
    email: string
}

// QR 화면 새로고침 버튼 이용한 재발급 응답 
export interface QrTicketUpdateResponseDto{
    qrCode: string, // 이미지 코드
    manualCode: string // 수동코드
}


/* ===== 티켓 체크인, 체크아웃 ===== */

export interface QrCheckRequestDto{
    qrCode: string
}

export interface ManualCheckRequestDto{
    manualCode: string
}

// 체크인/체크아웃 응답
export interface CheckResponseDto{
    message: string,
    checkInTime: Date    
}

// 관리자 강제 체크인/체크아웃 요청
export interface AdminForceCheckRequestDto{
    ticketNo: string,
    qrCheckStatusCode: string
}

export interface QrTicketData {
    eventName: string;  // 행사명
    eventDate: string | null; // 행사날짜
    venue: string; // 장소. 없으면 street 
    seatInfo: string | null; // 좌석정보. 없으면 Null
    ticketNumber: string; // ticketNo
    bookingDate: string; // 예약날짜
    entryTime: string; // 입장시간
    qrCode: string; // qrCode
    manualCode: string; // 수동코드
}