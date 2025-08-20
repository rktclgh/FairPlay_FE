import {
  PaymentSearchCriteria,
  PaymentAdminDto,
  PaymentStatistics,
  ApiResponse,
  RefundRequest,
  RefundResponse
} from '../types/payment.types';
import authManager from "../../../utils/auth";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'https://fair-play.ink';

// 검색 조건을 쿼리 파라미터로 변환
const buildQueryParams = (criteria: PaymentSearchCriteria): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (criteria.paymentTypes && criteria.paymentTypes.length > 0) {
    criteria.paymentTypes.forEach(type => params.append('paymentTypes', type));
  }
  
  if (criteria.paymentStatuses && criteria.paymentStatuses.length > 0) {
    criteria.paymentStatuses.forEach(status => params.append('paymentStatuses', status));
  }
  
  if (criteria.startDate) {
    params.append('startDate', criteria.startDate.toISOString().split('T')[0]);
  }
  
  if (criteria.endDate) {
    params.append('endDate', criteria.endDate.toISOString().split('T')[0]);
  }
  
  if (criteria.eventName && criteria.eventName.trim()) {
    params.append('eventName', criteria.eventName.trim());
  }
  
  if (criteria.buyerName && criteria.buyerName.trim()) {
    params.append('buyerName', criteria.buyerName.trim());
  }
  
  if (criteria.minAmount !== undefined && criteria.minAmount > 0) {
    params.append('minAmount', criteria.minAmount.toString());
  }
  
  if (criteria.maxAmount !== undefined && criteria.maxAmount > 0) {
    params.append('maxAmount', criteria.maxAmount.toString());
  }
  
  params.append('page', criteria.page.toString());
  params.append('size', criteria.size.toString());
  params.append('sort', criteria.sort);
  params.append('direction', criteria.direction);
  
  return params;
};

export const paymentAdminAPI = {
  /**
   * 결제 목록 조회
   */
  async getPaymentList(criteria: PaymentSearchCriteria): Promise<ApiResponse<PaymentAdminDto>> {
    try {
      const params = buildQueryParams(criteria);
      const response = await authManager.authenticatedFetch(
        `${API_BASE_URL}/api/admin/payments?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('결제 목록 조회 실패:', error);
      throw new Error(
        error.message || 
        '결제 목록을 조회하는 중 오류가 발생했습니다.'
      );
    }
  },

  /**
   * 결제 상세 정보 조회
   */
  async getPaymentDetail(paymentId: number): Promise<PaymentAdminDto> {
    try {
      const response = await authManager.authenticatedFetch(
        `${API_BASE_URL}/api/admin/payments/${paymentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('결제 상세 조회 실패:', error);
      throw new Error(
        error.message || 
        '결제 상세 정보를 조회하는 중 오류가 발생했습니다.'
      );
    }
  },

  /**
   * 결제 통계 정보 조회
   */
  async getPaymentStatistics(criteria: PaymentSearchCriteria): Promise<PaymentStatistics> {
    try {
      const params = buildQueryParams(criteria);
      const response = await authManager.authenticatedFetch(
        `${API_BASE_URL}/api/admin/payments/statistics?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('결제 통계 조회 실패:', error);
      throw new Error(
        error.message || 
        '결제 통계를 조회하는 중 오류가 발생했습니다.'
      );
    }
  },

  /**
   * 엑셀 다운로드
   */
  async exportPaymentExcel(criteria: PaymentSearchCriteria): Promise<Blob> {
    try {
      const params = buildQueryParams(criteria);
      const response = await authManager.authenticatedFetch(
        `${API_BASE_URL}/api/admin/payments/export/excel?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error: any) {
      console.error('엑셀 다운로드 실패:', error);
      throw new Error(
        error.message || 
        '엑셀 파일을 다운로드하는 중 오류가 발생했습니다.'
      );
    }
  },

  /**
   * 환불 처리
   */
  async processRefund(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await authManager.authenticatedFetch(
        `${API_BASE_URL}/api/admin/payments/refund`,
        {
          method: 'POST',
          body: JSON.stringify(refundRequest)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('환불 처리 실패:', error);
      throw new Error(
        error.message || 
        '환불 처리 중 오류가 발생했습니다.'
      );
    }
  }
};

// 기본 내보내기
export default paymentAdminAPI;