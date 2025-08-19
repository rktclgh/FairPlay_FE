import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, DollarSign, RefreshCw } from 'lucide-react';
import { PaymentAdminDto } from '../types/payment.types';
import { toast } from 'react-toastify';

interface RefundProcessModalProps {
  payment: PaymentAdminDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RefundRequest {
  paymentId: number;
  refundAmount: number;
  reason: string;
}

const RefundProcessModal: React.FC<RefundProcessModalProps> = ({
  payment,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [refundAmount, setRefundAmount] = useState<number>(
    payment.amount - payment.refundedAmount
  );
  const [reason, setReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const maxRefundAmount = payment.amount - payment.refundedAmount;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const handleRefundAmountChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    if (numericValue <= maxRefundAmount) {
      setRefundAmount(numericValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (refundAmount <= 0) {
      toast.error('환불 금액을 입력해주세요.');
      return;
    }

    if (refundAmount > maxRefundAmount) {
      toast.error(`환불 가능 금액을 초과했습니다. (최대: ${formatAmount(maxRefundAmount)})`);
      return;
    }

    if (!reason.trim()) {
      toast.error('환불 사유를 입력해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      const refundRequest: RefundRequest = {
        paymentId: payment.paymentId,
        refundAmount,
        reason: reason.trim()
      };

      // TODO: API 호출 구현
      // const response = await refundAPI.processRefund(refundRequest);
      
      // 임시로 성공 처리
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('환불 처리가 완료되었습니다.');
      onSuccess();
    } catch (error: any) {
      console.error('환불 처리 중 오류:', error);
      toast.error(error.message || '환불 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFullRefund = () => {
    setRefundAmount(maxRefundAmount);
  };

  const handlePartialRefund = (percentage: number) => {
    const amount = Math.floor(maxRefundAmount * (percentage / 100));
    setRefundAmount(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            환불 처리
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 결제 정보 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">결제 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">결제 ID</Label>
                  <p className="font-mono">#{payment.paymentId}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">구매자</Label>
                  <p>{payment.buyerName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">결제 항목</Label>
                  <p>{payment.paymentTargetName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">행사명</Label>
                  <p>{payment.eventName || '-'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">총 결제 금액</Label>
                  <p className="font-semibold">{formatAmount(payment.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">기존 환불 금액</Label>
                  <p className="font-semibold text-red-600">
                    {formatAmount(payment.refundedAmount)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">환불 가능 금액</Label>
                  <p className="font-semibold text-blue-600">
                    {formatAmount(maxRefundAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 환불 금액 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                환불 금액 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 빠른 선택 버튼 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">빠른 선택</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePartialRefund(25)}
                    disabled={isProcessing}
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePartialRefund(50)}
                    disabled={isProcessing}
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePartialRefund(75)}
                    disabled={isProcessing}
                  >
                    75%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFullRefund}
                    disabled={isProcessing}
                  >
                    전액 환불
                  </Button>
                </div>
              </div>

              {/* 환불 금액 입력 */}
              <div className="space-y-2">
                <Label htmlFor="refundAmount">환불 금액 (원)</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  min="0"
                  max={maxRefundAmount}
                  value={refundAmount}
                  onChange={(e) => handleRefundAmountChange(e.target.value)}
                  disabled={isProcessing}
                  className="text-right"
                />
                <p className="text-sm text-muted-foreground">
                  최대 환불 가능 금액: {formatAmount(maxRefundAmount)}
                </p>
              </div>

              {/* 환불 금액 미리보기 */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>환불 후 남은 금액:</span>
                  <span className="font-semibold">
                    {formatAmount(maxRefundAmount - refundAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 환불 사유 */}
          <Card>
            <CardHeader>
              <CardTitle>환불 사유</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="reason">사유 <span className="text-red-500">*</span></Label>
                <Textarea
                  id="reason"
                  placeholder="환불 사유를 상세히 입력해주세요."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isProcessing}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  환불 사유는 고객에게 전달되며, 환불 처리 이력에 기록됩니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 주의사항 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">환불 처리 주의사항</p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• 환불 처리는 취소할 수 없습니다.</li>
                  <li>• 환불 금액은 결제 수단으로 자동 환불됩니다.</li>
                  <li>• 환불 완료까지 3-5영업일이 소요될 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isProcessing || refundAmount <= 0 || !reason.trim()}
            >
              {isProcessing && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {isProcessing ? '환불 처리 중...' : `${formatAmount(refundAmount)} 환불 처리`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RefundProcessModal;