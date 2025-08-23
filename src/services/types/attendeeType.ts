// 참석자 저장 요청
export interface AttendeeSaveRequestDto{
    name: string,
    email: string, 
    phone: string,
    agreeToTerms: boolean
}

// 저장된 참석자 정보 응답
export interface AttendeeInfoResponseDto{
    reservationId: number,
    attendeeId: number,
    name: string,
    email: string, 
    phone: string,
    agreeToTerms: boolean
}

// 특정 예약에 대한 참석자 정보 응답
export interface AttendeeListInfoResponseDto{
    reservationId: number,
    attendees: AttendeeInfoResponseDto[]
}

// 특정 예약에 대한 참석자 정보 수정 요청
export interface AttendeeUpdateRequestDto{
    reservationId: number,
    name: string,
    email: string, 
    phone: string
}

export interface ShareTicketInfoResponseDto{
    formId: number,
    eventId: number,
    eventName: string
}

export interface TokenResponseDto{
    token: string
}