/**
 * 행사 상태 코드를 사용자에게 표시할 텍스트로 변환
 */
export const getEventStatusText = (statusCode: string): string => {
    switch (statusCode) {
        case 'UPCOMING':
            return '진행 예정';
        case 'ONGOING':
            return '진행중';
        case 'ENDED':
            return '종료';
        default:
            return statusCode;
    }
};

/**
 * 행사 상태에 따른 CSS 클래스 반환
 */
export const getEventStatusStyle = (statusCode: string): string => {
    switch (statusCode) {
        case 'UPCOMING':
            return 'bg-blue-100 text-blue-800';
        case 'ONGOING':
            return 'bg-green-100 text-green-800';
        case 'ENDED':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

/**
 * 날짜를 기준으로 행사 상태 계산
 */
export const calculateEventStatus = (startDate: string, endDate: string): 'UPCOMING' | 'ONGOING' | 'ENDED' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 시간 정보 제거하고 날짜만 비교
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (now < start) {
        return 'UPCOMING';
    } else if (now >= start && now <= end) {
        return 'ONGOING';
    } else {
        return 'ENDED';
    }
};