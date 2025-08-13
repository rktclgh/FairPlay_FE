// 사업자 등록번호 검증 관련 타입
export interface BusinessVerificationRequest {
    businessNumber: string;    // 사업자등록번호 (10자리)
    businessName?: string;     // 대표자명 (선택사항)
    businessDate?: string;     // 개업일자 (선택사항)
}

export interface BusinessVerificationResponse {
    valid: boolean;           // 검증 결과
    message?: string;         // 응답 메시지
    businessNumber?: string;  // 검증된 사업자등록번호
    businessName?: string;    // 검증된 대표자명
    businessDate?: string;    // 검증된 개업일자
}

export const businessAPI = {
    /**
     * 사업자 등록번호 검증
     * @param data - 검증할 사업자 정보
     * @returns 검증 결과
     */
    verifyBusiness: async (data: BusinessVerificationRequest): Promise<BusinessVerificationResponse> => {
        // 프론트엔드에서 기본 검증
        if (!data.businessNumber || data.businessNumber.length !== 10) {
            return {
                valid: false,
                message: '사업자등록번호는 10자리 숫자여야 합니다.'
            };
        }

        if (!/^\d{10}$/.test(data.businessNumber)) {
            return {
                valid: false,
                message: '사업자등록번호는 숫자만 입력 가능합니다.'
            };
        }

        // 사업자등록번호만 필수, 나머지는 선택사항

        try {
            // 사업자등록번호만 정리
            const cleanedBusinessNumber = data.businessNumber.replace(/\D/g, ''); // 숫자만 추출
            
            console.log('원본 사업자번호:', data.businessNumber);
            console.log('정리된 사업자번호:', cleanedBusinessNumber);

            // 공공데이터포털 API 키 가져오기
            const serviceKey = import.meta.env.VITE_BUSINESS_SERVICE_KEY;
            if (!serviceKey) {
                console.error('사업자등록정보 API 서비스키가 설정되지 않았습니다.');
                return {
                    valid: false,
                    message: 'API 서비스 설정이 올바르지 않습니다.'
                };
            }

            // 사업자등록 상태조회 API 호출 (사업자번호만 사용)
            const apiUrl = 'https://api.odcloud.kr/api/nts-businessman/v1/status';
            
            // URL 파라미터로 전송하는 방식으로 변경
            const params = new URLSearchParams({
                serviceKey: serviceKey,
                returnType: 'JSON'
            });

            const requestBody = {
                b_no: [cleanedBusinessNumber] // 사업자번호 배열로 전송
            };

            const response = await fetch(`${apiUrl}?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            console.log('API 응답:', result);

            if (!response.ok) {
                console.error('API 오류 응답:', result);
                throw new Error(`API 호출 실패: ${response.status} - ${result.message || 'Unknown error'}`);
            }
            
            // API 응답 구조에 따른 검증 결과 처리
            if (result.data && result.data.length > 0) {
                const businessInfo = result.data[0];
                console.log('사업자 정보 상세 응답:', businessInfo);
                
                // 상태조회 API 응답 분석
                // b_stt_cd: "01" = 계속사업자, "02" = 휴업자, "03" = 폐업자
                const isValid = businessInfo.b_stt_cd === "01";
                
                // 상세한 정보 로그
                console.log('사업자 상태 정보:');
                console.log('- 사업자번호:', businessInfo.b_no);
                console.log('- 사업자 상태:', businessInfo.b_stt);
                console.log('- 사업자 상태 코드:', businessInfo.b_stt_cd);
                console.log('- 과세 유형:', businessInfo.tax_type);
                console.log('- 폐업일자:', businessInfo.end_dt);
                console.log('- API 응답 전체:', businessInfo);
                
                if (!isValid) {
                    console.warn('⚠️ 사업자 상태:', businessInfo.b_stt || '알 수 없음');
                } else {
                    console.log('✅ 유효한 사업자입니다.');
                }
                
                // 검증 실패 시 더 구체적인 메시지 제공
                let errorMessage = '유효한 사업자등록번호입니다.';
                if (!isValid) {
                    switch (businessInfo.b_stt_cd) {
                        case "02":
                            errorMessage = '휴업 중인 사업자입니다.';
                            break;
                        case "03":
                            errorMessage = '폐업한 사업자입니다.';
                            break;
                        default:
                            errorMessage = `사업자 상태: ${businessInfo.b_stt || '알 수 없음'}`;
                    }
                }
                
                return {
                    valid: isValid,
                    message: errorMessage,
                    businessNumber: cleanedBusinessNumber,
                    businessName: '', // 상태조회 API에서는 사업자명 정보 없음
                    businessDate: '' // 상태조회 API에서는 개업일자 정보 없음
                };
            } else {
                console.error('예상과 다른 API 응답 구조:', result);
                return {
                    valid: false,
                    message: 'API 응답이 올바르지 않습니다.'
                };
            }
        } catch (error) {
            console.error('사업자등록번호 검증 API 호출 실패:', error);
            
            // API 실패 시 폴백: 기본 형식 검증만 수행
            const isValidFormat = 
                cleanedBusinessNumber.length === 10 &&
                /^\d{10}$/.test(cleanedBusinessNumber);

            return {
                valid: false, // API 실패 시에는 검증 실패로 처리
                message: isValidFormat ? 
                    '사업자번호 형식은 올바르나 API 검증에 실패했습니다. 잠시 후 다시 시도해주세요.' : 
                    '사업자등록번호 형식이 올바르지 않습니다.'
            };
        }
    },

    /**
     * 사업자등록번호 형식 검증 (클라이언트 사이드)
     * @param businessNumber - 검증할 사업자등록번호
     * @returns 형식 유효성
     */
    validateBusinessNumberFormat: (businessNumber: string): boolean => {
        return /^\d{10}$/.test(businessNumber);
    },

    /**
     * 개업일자 형식 검증 (클라이언트 사이드)
     * @param businessDate - 검증할 개업일자
     * @returns 형식 유효성
     */
    validateBusinessDateFormat: (businessDate: string): boolean => {
        if (!/^\d{8}$/.test(businessDate)) return false;
        
        const year = parseInt(businessDate.substring(0, 4));
        const month = parseInt(businessDate.substring(4, 6));
        const day = parseInt(businessDate.substring(6, 8));
        
        // 기본적인 날짜 유효성 검사
        if (year < 1900 || year > new Date().getFullYear()) return false;
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        
        return true;
    }
};