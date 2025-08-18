import React, { useState } from 'react';
import { HostPaymentSearchCriteria } from '../types/payment.types';

interface HostPaymentSearchFiltersProps {
  searchCriteria: HostPaymentSearchCriteria;
  onSearchCriteriaChange: (criteria: HostPaymentSearchCriteria) => void;
  onSearch: () => void;
  loading: boolean;
}

const HostPaymentSearchFilters: React.FC<HostPaymentSearchFiltersProps> = ({
  searchCriteria,
  onSearchCriteriaChange,
  onSearch,
  loading
}) => {
  const [localCriteria, setLocalCriteria] = useState<HostPaymentSearchCriteria>(searchCriteria);

  const handleFilterChange = (field: keyof HostPaymentSearchCriteria, value: any) => {
    const updatedCriteria = { ...localCriteria, [field]: value };
    setLocalCriteria(updatedCriteria);
    onSearchCriteriaChange(updatedCriteria);
  };

  const handlePaymentTypeChange = (type: string, checked: boolean) => {
    const currentTypes = localCriteria.paymentTypes || [];
    const newTypes = checked 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    
    handleFilterChange('paymentTypes', newTypes);
  };

  const handlePaymentStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = localCriteria.paymentStatuses || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    handleFilterChange('paymentStatuses', newStatuses);
  };

  const handleReset = () => {
    const resetCriteria: HostPaymentSearchCriteria = {
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
    
    setLocalCriteria(resetCriteria);
    onSearchCriteriaChange(resetCriteria);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const paymentTypeOptions = [
    { value: 'RESERVATION', label: '티켓 예약' },
    { value: 'BOOTH', label: '부스 대여' }
  ];

  const paymentStatusOptions = [
    { value: 'PENDING', label: '결제 대기' },
    { value: 'COMPLETED', label: '결제 완료' },
    { value: 'CANCELLED', label: '결제 취소' },
    { value: 'REFUNDED', label: '환불 완료' }
  ];

  return (
    <div className="space-y-6">
      {/* 결제 항목 및 상태 필터 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 결제 항목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">결제 항목</label>
          <div className="space-y-2">
            {paymentTypeOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localCriteria.paymentTypes?.includes(option.value) || false}
                  onChange={(e) => handlePaymentTypeChange(option.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 결제 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">결제 상태</label>
          <div className="space-y-2">
            {paymentStatusOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localCriteria.paymentStatuses?.includes(option.value) || false}
                  onChange={(e) => handlePaymentStatusChange(option.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 날짜 범위 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">결제일 범위</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">시작일</label>
            <input
              type="date"
              value={localCriteria.startDate ? localCriteria.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">종료일</label>
            <input
              type="date"
              value={localCriteria.endDate ? localCriteria.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* 구매자명 및 금액 범위 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">구매자명</label>
          <input
            type="text"
            placeholder="구매자명 검색 (Enter로 검색)"
            value={localCriteria.buyerName || ''}
            onChange={(e) => handleFilterChange('buyerName', e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">최소 금액</label>
          <input
            type="number"
            placeholder="최소 금액 (Enter로 검색)"
            value={localCriteria.minAmount || ''}
            onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">최대 금액</label>
          <input
            type="number"
            placeholder="최대 금액 (Enter로 검색)"
            value={localCriteria.maxAmount || ''}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex justify-between items-center pt-4 border-t">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          초기화
        </button>
        <button
          onClick={onSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              검색 중...
            </>
          ) : (
            <>
              🔍 검색
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HostPaymentSearchFilters;