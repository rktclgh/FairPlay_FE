import api from '../api/axios';
import type {
    BusinessCardRequest,
    BusinessCardResponse,
    CollectedCard,
    QRCodeResponse,
    CollectCardRequest,
    UpdateMemoRequest
} from '../types/businessCard';

class BusinessCardService {
    
    // 내 전자명함 조회
    async getMyBusinessCard(): Promise<BusinessCardResponse | null> {
        try {
            const response = await api.get<BusinessCardResponse>('/api/business-card/my');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // 명함이 없는 경우
            }
            throw error;
        }
    }

    // 전자명함 저장/수정
    async saveBusinessCard(data: BusinessCardRequest): Promise<BusinessCardResponse> {
        const response = await api.post<BusinessCardResponse>('/api/business-card', data);
        return response.data;
    }

    // QR 코드 URL 생성
    async generateQRCode(): Promise<string> {
        const response = await api.get<QRCodeResponse>('/api/business-card/qr');
        return response.data.qrUrl;
    }

    // 공개 전자명함 조회 (QR 스캔 시 사용)
    async getPublicBusinessCard(userId: number): Promise<BusinessCardResponse> {
        const response = await api.get<BusinessCardResponse>(`/api/business-card/public/${userId}`);
        return response.data;
    }

    // 전자명함 수집 (일반 사용자 ID)
    async collectBusinessCard(cardOwnerId: number, data?: CollectCardRequest): Promise<void> {
        await api.post(`/api/business-card/collect/${cardOwnerId}`, data);
    }

    // 전자명함 수집 (인코딩된 사용자 ID - QR 코드에서)
    async collectBusinessCardByEncodedId(encodedUserId: string, data?: CollectCardRequest): Promise<void> {
        await api.post(`/api/business-card/collect/encoded/${encodedUserId}`, data);
    }

    // 수집한 명함 목록 조회
    async getCollectedCards(): Promise<CollectedCard[]> {
        const response = await api.get<CollectedCard[]>('/api/business-card/collected');
        return response.data;
    }

    // 수집한 명함 삭제
    async deleteCollectedCard(collectedCardId: number): Promise<void> {
        await api.delete(`/api/business-card/collected/${collectedCardId}`);
    }

    // 수집한 명함 메모 수정
    async updateCollectedCardMemo(collectedCardId: number, data: UpdateMemoRequest): Promise<void> {
        await api.patch(`/api/business-card/collected/${collectedCardId}/memo`, data);
    }

    // QR 코드에서 사용자 ID 추출
    extractUserIdFromQRUrl(qrUrl: string): string | null {
        try {
            const url = new URL(qrUrl);
            const pathSegments = url.pathname.split('/');
            const collectIndex = pathSegments.indexOf('collect');
            
            if (collectIndex !== -1 && collectIndex < pathSegments.length - 1) {
                return pathSegments[collectIndex + 1];
            }
            return null;
        } catch {
            return null;
        }
    }

    // 소셜 미디어 URL 생성 헬퍼 (이제 URL을 직접 입력받으므로 검증만 수행)
    validateSocialMediaUrl(url: string): boolean {
        if (!url) return true; // 빈 값은 유효
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // 소셜 미디어 URL 정규화 (레거시 지원을 위해 유지)
    getSocialMediaUrl(platform: string, username: string): string {
        const platforms: Record<string, string> = {
            instagram: `https://instagram.com/${username}`,
            facebook: `https://facebook.com/${username}`,
            twitter: `https://twitter.com/${username}`,
            linkedIn: `https://linkedin.com/in/${username}`
        };
        
        return platforms[platform] || username;
    }

    // 전화번호 포맷팅
    formatPhoneNumber(phone: string): string {
        // 한국 전화번호 형식으로 포맷팅
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return phone;
    }

    // 웹사이트 URL 검증 및 정규화
    normalizeWebsiteUrl(url: string): string {
        if (!url) return url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    }
}

export default new BusinessCardService();