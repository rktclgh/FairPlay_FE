import React, { useState } from 'react';
import { PaymentSearchCriteria } from '../types/payment.types';

interface PaymentSearchFiltersProps {
  searchCriteria: PaymentSearchCriteria;
  onSearchCriteriaChange: (criteria: PaymentSearchCriteria) => void;
  onSearch: () => void;
  loading: boolean;
}

const PaymentSearchFilters: React.FC<PaymentSearchFiltersProps> = ({
  searchCriteria,
  onSearchCriteriaChange,
  onSearch,
  loading
}) => {
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);

  const paymentTypeOptions = [
    { value: 'RESERVATION', label: '티켓' },
    { value: 'BOOTH', label: '부스' },
    { value: 'AD', label: '광고' }
  ];

  const paymentStatusOptions = [
    { value: 'PENDING', label: '결제 대기' },
    { value: 'COMPLETED', label: '결제 완료' },
    { value: 'CANCELLED', label: '결제 취소' },
    { value: 'REFUNDED', label: '환불 완료' }
  ];

  const handlePaymentTypeChange = (type: string, checked: boolean) => {
    const currentTypes = searchCriteria.paymentTypes || [];
    const newTypes = checked 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    
    onSearchCriteriaChange({
      ...searchCriteria,
      paymentTypes: newTypes
    });
  };

  const handlePaymentStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = searchCriteria.paymentStatuses || [];
    const newStatuses = checked 
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    onSearchCriteriaChange({
      ...searchCriteria,
      paymentStatuses: newStatuses
    });
  };

  const handleReset = () => {
    onSearchCriteriaChange({
      paymentTypes: [],
      paymentStatuses: [],
      startDate: undefined,
      endDate: undefined,
      eventName: '',
      buyerName: '',
      minAmount: undefined,
      maxAmount: undefined,
      page: 0,
      size: 20,
      sort: 'paidAt',
      direction: 'desc'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* 결제 항목 선택 */}
      <div className="space-y-3">
        <label className="text-sm font-medium">결제 항목</label>
        <div className="flex flex-wrap gap-4">
          {paymentTypeOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchCriteria.paymentTypes?.includes(option.value) || false}
                onChange={(e) => handlePaymentTypeChange(option.value, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 결제일 범위 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">시작일</label>
          <input
            type="date"
            value={searchCriteria.startDate ? formatDate(searchCriteria.startDate) : ''}
            onChange={(e) => 
              onSearchCriteriaChange({
                ...searchCriteria,
                startDate: e.target.value ? new Date(e.target.value) : undefined
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">종료일</label>
          <input
            type="date"
            value={searchCriteria.endDate ? formatDate(searchCriteria.endDate) : ''}
            onChange={(e) => 
              onSearchCriteriaChange({
                ...searchCriteria,
                endDate: e.target.value ? new Date(e.target.value) : undefined
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 결제 상태 */}
      <div className="space-y-3">
        <label className="text-sm font-medium">결제 상태</label>
        <div className="flex flex-wrap gap-4">
          {paymentStatusOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchCriteria.paymentStatuses?.includes(option.value) || false}
                onChange={(e) => handlePaymentStatusChange(option.value, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 검색 텍스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">행사명</label>
          <input
            type="text"
            placeholder="행사명으로 검색 (Enter로 검색)"
            value={searchCriteria.eventName || ''}
            onChange={(e) => 
              onSearchCriteriaChange({
                ...searchCriteria,
                eventName: e.target.value
              })
            }
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">구매자명</label>
          <input
            type="text"
            placeholder="구매자명으로 검색 (Enter로 검색)"
            value={searchCriteria.buyerName || ''}
            onChange={(e) => 
              onSearchCriteriaChange({
                ...searchCriteria,
                buyerName: e.target.value
              })
            }
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 결제 금액 범위 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">최소 금액</label>
          <input
            type="number"
            placeholder="최소 결제 금액 (Enter로 검색)"
            value={searchCriteria.minAmount || ''}
            onChange={(e) => 
              onSearchCriteriaChange({
                ...searchCriteria,
                minAmount: e.target.value ? Number(e.target.value) : undefined
              })
            }
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">최대 금액</label>
          <input
            type="number"
            placeholder="최대 결제 금액 (Enter로 검색)"
            value={searchCriteria.maxAmount || ''}
            onChange={(e) => 
              onSearchCriteriaChange({
                ...searchCriteria,
                maxAmount: e.target.value ? Number(e.target.value) : undefined
              })
            }
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 검색/초기화 버튼 */}
      <div className="flex justify-end gap-2">
        <button 
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          🔄 초기화
        </button>
        <button 
          onClick={onSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          🔍 {loading ? '검색 중...' : '검색'}
        </button>
      </div>
    </div>
  );
};

export default PaymentSearchFilters;