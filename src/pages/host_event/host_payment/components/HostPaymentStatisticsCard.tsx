import React from 'react';
import { PaymentStatistics } from '../types/payment.types';

interface HostPaymentStatisticsCardProps {
  statistics: PaymentStatistics | null;
}

const HostPaymentStatisticsCard: React.FC<HostPaymentStatisticsCardProps> = ({
  statistics
}) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatCount = (count: number) => {
    return new Intl.NumberFormat('ko-KR').format(count);
  };

  if (!statistics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="text-sm text-gray-500">로딩 중...</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { paymentCounts, paymentAmounts } = statistics;

  const completionRate = paymentCounts.total > 0 
    ? ((paymentCounts.completed / paymentCounts.total) * 100).toFixed(1)
    : '0';

  const refundRate = paymentAmounts.totalAmount > 0
    ? ((paymentAmounts.refundedAmount / paymentAmounts.totalAmount) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-4">
      {/* 메인 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 총 결제 건수 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">총 결제 건수</p>
              <p className="text-2xl font-bold text-gray-900">{formatCount(paymentCounts.total)}</p>
              <p className="text-xs text-gray-500 mt-1">완료율 {completionRate}%</p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>

        {/* 완료된 결제 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">결제 완료</p>
              <p className="text-2xl font-bold text-green-600">{formatCount(paymentCounts.completed)}</p>
              <p className="text-xs text-gray-500 mt-1">📈 전체의 {completionRate}%</p>
            </div>
            <div className="text-2xl">💳</div>
          </div>
        </div>

        {/* 취소/환불 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">취소/환불</p>
              <p className="text-2xl font-bold text-red-600">{formatCount(paymentCounts.cancelled)}</p>
              <p className="text-xs text-gray-500 mt-1">
                전체의 {paymentCounts.total > 0 
                  ? ((paymentCounts.cancelled / paymentCounts.total) * 100).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
            <div className="text-2xl">🔄</div>
          </div>
        </div>

        {/* 순 결제 금액 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">순 결제 금액</p>
              <p className="text-2xl font-bold text-blue-600">{formatAmount(paymentAmounts.netAmount)}</p>
              <p className="text-xs text-gray-500 mt-1">환불률 {refundRate}%</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HostPaymentStatisticsCard;