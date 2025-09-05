import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentService from '../../services/paymentService';

interface BoothPaymentInfo {
  applicationId: number;
  eventTitle: string;
  boothTitle: string;
  boothTypeName: string;
  boothTypeSize: string;
  price: number;
  managerName: string;
  contactEmail: string;
  paymentStatus: string;
}

const BoothPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState<BoothPaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const applicationId = searchParams.get('applicationId');
  const success = searchParams.get('success');

  useEffect(() => {
    if (!applicationId) {
      setError('부스 신청 ID가 필요합니다.');
      setLoading(false);
      return;
    }

    // URL에 success=true 파라미터가 있으면 결제 성공 처리
    if (success === 'true') {
      toast.success('결제가 성공적으로 완료되었습니다!');
      // URL에서 success 파라미터 제거
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('success');
      window.history.replaceState({}, '', newUrl);
    }

    fetchPaymentInfo();
  }, [applicationId, success]);

  const fetchPaymentInfo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/payment/payment-page/${applicationId}`);
      
      if (!response.ok) {
        throw new Error('결제 정보를 불러올 수 없습니다.');
      }

      const data = await response.json();
      setPaymentInfo(data);
    } catch (err) {
      console.error('Payment info fetch error:', err);
      setError(err instanceof Error ? err.message : '결제 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentInfo || paymentProcessing) return;

    setPaymentProcessing(true);
    try {
      // 1. 아임포트 초기화
      await paymentService.initialize();
      
      // 2. 결제 요청 데이터 준비
      const paymentRequest = {
        pg: 'uplus', // 가장 일반적인 웹표준 결제
        pay_method: 'card',
        merchant_uid: `booth_${Date.now()}`,
        name: `${paymentInfo.eventTitle} - ${paymentInfo.boothTitle}`,
        amount: paymentInfo.price,
        buyer_email: paymentInfo.contactEmail,
        buyer_name: paymentInfo.managerName,
        m_redirect_url: `${window.location.origin}/booth/payment?applicationId=${paymentInfo.applicationId}&success=true`,
        popup: false
      };

      // 3. 아임포트 결제 요청
      const paymentResponse = await paymentService.requestPayment(paymentRequest);
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error_msg || '결제가 취소되었습니다.');
      }

      // 4. 결제 성공 시 백엔드에 결제 완료 알림
      const completeResponse = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/payment/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantUid: paymentResponse.merchant_uid,
          impUid: paymentResponse.imp_uid,
          status: 'PAID'
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('결제 완료 처리에 실패했습니다.');
      }

      toast.success('결제가 성공적으로 완료되었습니다!');
      
      // 결제 정보 다시 로드하여 상태 업데이트
      await fetchPaymentInfo();
      
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err instanceof Error ? err.message : '결제 중 오류가 발생했습니다.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="text-red-800 text-lg font-semibold mb-2">오류</div>
          <div className="text-red-600">{error}</div>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">결제 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">부스 결제</h1>
          <p className="text-gray-600">부스 운영을 위한 결제를 진행해주세요.</p>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">행사명</label>
              <div className="text-gray-900">{paymentInfo.eventTitle}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">부스명</label>
              <div className="text-gray-900">{paymentInfo.boothTitle}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">부스 타입</label>
              <div className="text-gray-900">{paymentInfo.boothTypeName}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">부스 크기</label>
              <div className="text-gray-900">{paymentInfo.boothTypeSize || '미지정'}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
              <div className="text-gray-900">{paymentInfo.managerName}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처 이메일</label>
              <div className="text-gray-900">{paymentInfo.contactEmail}</div>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">💳 결제 금액</h3>
          <div className="text-3xl font-bold text-yellow-900">
            {paymentInfo.price.toLocaleString()}원
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">결제 상태</h3>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            paymentInfo.paymentStatus === 'PAID' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {paymentInfo.paymentStatus === 'PAID' ? '결제 완료' : '결제 대기'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {paymentInfo.paymentStatus !== 'PAID' && (
            <button
              onClick={handlePayment}
              disabled={paymentProcessing}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                paymentProcessing 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {paymentProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  결제 처리 중...
                </div>
              ) : (
                '💳 결제하기'
              )}
            </button>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>

        {paymentInfo.paymentStatus === 'PAID' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800 font-semibold">✅ 결제가 완료되었습니다!</div>
            <div className="text-green-600 text-sm mt-1">
              부스 운영에 필요한 모든 준비가 완료되었습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoothPaymentPage;