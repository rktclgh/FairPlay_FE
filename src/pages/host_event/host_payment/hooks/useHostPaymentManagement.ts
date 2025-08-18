import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  PaymentAdminDto,
  HostPaymentSearchCriteria,
  PaymentStatistics,
  PaginationInfo,
  HostPaymentManagementState,
  ApiResponse
} from '../types/payment.types';
import { hostPaymentAPI } from '../services/hostPayment.service';

const initialSearchCriteria: HostPaymentSearchCriteria = {
  paymentTypes: [],
  paymentStatuses: [],
  startDate: undefined,
  endDate: undefined,
  buyerName: '',
  minAmount: undefined,
  maxAmount: undefined,
  page: 0,
  size: 20,
  sort: 'paidAt',
  direction: 'desc'
};

const initialPagination: PaginationInfo = {
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  size: 20,
  hasNext: false,
  hasPrevious: false
};

export const useHostPaymentManagement = () => {
  const [state, setState] = useState<HostPaymentManagementState>({
    payments: [],
    statistics: null,
    searchCriteria: initialSearchCriteria,
    pagination: initialPagination,
    loading: false,
    error: null
  });

  // 검색 조건 업데이트
  const setSearchCriteria = useCallback((criteria: HostPaymentSearchCriteria) => {
    setState(prev => ({
      ...prev,
      searchCriteria: { ...criteria, page: 0 } // 새로운 검색 시 첫 페이지로
    }));
  }, []);

  // 결제 목록 조회
  const fetchPayments = useCallback(async (criteria?: HostPaymentSearchCriteria) => {
    const searchParams = criteria || state.searchCriteria;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: ApiResponse<PaymentAdminDto> = await hostPaymentAPI.getPaymentList(searchParams);
      
      setState(prev => ({
        ...prev,
        payments: response.payments,
        pagination: {
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          size: response.size,
          hasNext: response.hasNext,
          hasPrevious: response.hasPrevious
        },
        loading: false
      }));
    } catch (error: any) {
      console.error('결제 목록 조회 실패:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '결제 목록을 불러오는 중 오류가 발생했습니다.'
      }));
      toast.error('결제 목록을 불러오는 중 오류가 발생했습니다.');
    }
  }, [state.searchCriteria]);

  // 결제 통계 조회
  const fetchStatistics = useCallback(async (criteria?: HostPaymentSearchCriteria) => {
    const searchParams = criteria || state.searchCriteria;

    try {
      const statistics: PaymentStatistics = await hostPaymentAPI.getPaymentStatistics(searchParams);
      setState(prev => ({
        ...prev,
        statistics
      }));
    } catch (error: any) {
      console.error('결제 통계 조회 실패:', error);
      toast.error('통계 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, [state.searchCriteria]);

  // 검색 실행
  const handleSearch = useCallback(async () => {
    await Promise.all([
      fetchPayments(),
      fetchStatistics()
    ]);
  }, [fetchPayments, fetchStatistics]);

  // 페이지 변경
  const handlePageChange = useCallback(async (page: number) => {
    const newCriteria = { ...state.searchCriteria, page };
    setState(prev => ({ ...prev, searchCriteria: newCriteria }));
    await fetchPayments(newCriteria);
  }, [state.searchCriteria, fetchPayments]);

  // 정렬 변경
  const handleSort = useCallback(async (field: string, direction: 'asc' | 'desc') => {
    const newCriteria = { ...state.searchCriteria, sort: field, direction, page: 0 };
    setState(prev => ({ ...prev, searchCriteria: newCriteria }));
    await fetchPayments(newCriteria);
  }, [state.searchCriteria, fetchPayments]);

  // 엑셀 다운로드
  const handleExportExcel = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const blob = await hostPaymentAPI.exportPaymentExcel(state.searchCriteria);
      
      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');
      link.download = `host_payment_list_${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('엑셀 다운로드 실패:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.searchCriteria]);

  // 데이터 새로고침
  const refetch = useCallback(async () => {
    await handleSearch();
  }, [handleSearch]);

  // 초기 데이터 로드
  useEffect(() => {
    handleSearch();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  return {
    // 상태
    payments: state.payments,
    statistics: state.statistics,
    searchCriteria: state.searchCriteria,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    
    // 액션
    setSearchCriteria,
    handleSearch,
    handlePageChange,
    handleSort,
    handleExportExcel,
    refetch
  };
};