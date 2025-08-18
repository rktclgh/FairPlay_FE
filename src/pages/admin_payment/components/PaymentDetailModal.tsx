import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Calendar, 
  User, 
  Building2, 
  Receipt, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PaymentAdminDto } from '../types/payment.types';
import RefundProcessModal from './RefundProcessModal';

interface PaymentDetailModalProps {
  payment: PaymentAdminDto;
  onClose: () => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  onClose
}) => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch {
      return '-';
    }
  };

  const getStatusIcon = (statusCode: string) => {
    switch (statusCode) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentStatusBadge = (statusCode: string, statusName: string) => {
    const statusConfig = {
      'PENDING': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      'COMPLETED': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'CANCELLED': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      'REFUNDED': { variant: 'outline' as const, className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[statusCode as keyof typeof statusConfig] || 
      { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge variant={config.variant} className={config.className}>
        <span className="flex items-center gap-1">
          {getStatusIcon(statusCode)}
          {statusName}
        </span>
      </Badge>
    );
  };

  const getPaymentTypeBadge = (targetType: string, targetName: string) => {
    const typeConfig = {
      'RESERVATION': { className: 'bg-blue-100 text-blue-800' },
      'BOOTH': { className: 'bg-green-100 text-green-800' },
      'AD': { className: 'bg-purple-100 text-purple-800' }
    };

    const config = typeConfig[targetType as keyof typeof typeConfig] || 
      { className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={config.className}>
        {targetName}
      </Badge>
    );
  };

  const canRefund = payment.paymentStatusCode === 'COMPLETED' && 
    payment.refundedAmount < payment.amount;

  return (
    <div className="space-y-6">
      {/* 결제 기본 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              결제 기본 정보
            </CardTitle>
            {getPaymentStatusBadge(payment.paymentStatusCode, payment.paymentStatusName)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">결제 ID</label>
              <p className="font-mono"># {payment.paymentId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">주문 번호</label>
              <p className="font-mono">{payment.merchantUid}</p>
            </div>
          </div>

          {payment.impUid && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">PG 거래번호</label>
              <p className="font-mono">{payment.impUid}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">결제 항목</label>
              <div className="mt-1">
                {getPaymentTypeBadge(payment.paymentTargetType, payment.paymentTargetName)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">결제 방식</label>
              <p className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {payment.paymentTypeName}
              </p>
            </div>
          </div>

          {payment.pgProvider && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">PG사</label>
              <p>{payment.pgProvider}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 구매자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            구매자 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">구매자명</label>
              <p className="font-medium">{payment.buyerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">이메일</label>
              <p>{payment.buyerEmail}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 행사 정보 */}
      {payment.eventName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              행사 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-muted-foreground">행사명</label>
              <p className="font-medium">{payment.eventName}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 결제 금액 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            결제 금액 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">수량</label>
              <p>{payment.quantity}개</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">단가</label>
              <p>{formatAmount(payment.price)}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">총 결제 금액</span>
              <span className="text-lg font-bold">{formatAmount(payment.amount)}</span>
            </div>

            {payment.refundedAmount > 0 && (
              <>
                <div className="flex justify-between items-center text-red-600">
                  <span>환불 금액</span>
                  <span>-{formatAmount(payment.refundedAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-bold">
                  <span>실 결제 금액</span>
                  <span>{formatAmount(payment.amount - payment.refundedAmount)}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 결제 이력 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            결제 이력
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">결제 요청일</label>
              <p>{formatDate(payment.requestedAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">결제 완료일</label>
              <p>{formatDate(payment.paidAt)}</p>
            </div>
          </div>

          {payment.refundedAt && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">환불 완료일</label>
              <p className="text-red-600">{formatDate(payment.refundedAt)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex justify-end gap-3">
        {canRefund && (
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700"
            onClick={() => setIsRefundModalOpen(true)}
          >
            환불 처리
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
      </div>

      {/* 환불 처리 모달 */}
      {isRefundModalOpen && (
        <RefundProcessModal
          payment={payment}
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          onSuccess={() => {
            setIsRefundModalOpen(false);
            // 결제 상세 정보 새로고침 로직 추가 필요
          }}
        />
      )}
    </div>
  );
};

export default PaymentDetailModal;