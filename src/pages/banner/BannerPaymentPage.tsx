import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentService from '../../services/paymentService';

console.log('=== BannerPaymentPage 모듈 로드됨 ===');

interface BannerPaymentInfo {
  applicationId: number;
  title: string;
  bannerType: string;
  totalAmount: number;
  applicantName: string;
  applicantEmail: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
}

const BannerPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState<BannerPaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const applicationId = searchParams.get('applicationId');
  const success = searchParams.get('success');

  console.log('=== BannerPaymentPage 컴포넌트 로드됨 ===');
  console.log('URL 파라미터 - applicationId:', applicationId);
  console.log('URL 파라미터 - success:', success);

  useEffect(() => {
    if (!applicationId) {
      setError('배너 신청 ID가 필요합니다.');
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
      const url = `${import.meta.env.VITE_BACKEND_BASE_URL}/api/banners/payment/payment-page/${applicationId}`;
      console.log('=== 배너 결제 정보 조회 요청 ===');
      console.log('Application ID:', applicationId);
      console.log('Request URL:', url);
      console.log('VITE_BACKEND_BASE_URL:', import.meta.env.VITE_BACKEND_BASE_URL);
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
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
      const merchantUid = `banner_${Date.now()}`;
      const paymentRequest = {
        pg: 'uplus', // 가장 일반적인 웹표준 결제
        pay_method: 'card',
        merchant_uid: merchantUid,
        name: `배너 광고 - ${paymentInfo.title}`,
        amount: paymentInfo.totalAmount,
        buyer_email: paymentInfo.applicantEmail,
        buyer_name: paymentInfo.applicantName,
        m_redirect_url: `${window.location.origin}/banner/payment?applicationId=${paymentInfo.applicationId}&success=true`,
        popup: false
      };

      // 3. 백엔드에 결제 요청 저장
      const saveResponse = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/banners/payment/request-from-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantUid: merchantUid,
          price: paymentInfo.totalAmount,
          quantity: 1,
          targetId: paymentInfo.applicationId,
          paymentTargetType: 'BANNER_APPLICATION'
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('결제 요청 저장에 실패했습니다.');
      }

      // 4. 아임포트 결제 요청
      const paymentResponse = await paymentService.requestPayment(paymentRequest);
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error_msg || '결제가 취소되었습니다.');
      }

      // 5. 결제 성공 시 백엔드에 결제 완료 알림
      const completeResponse = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/banners/payment/complete`, {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">배너 광고 결제</h1>
          <p className="text-gray-600">배너 광고 운영을 위한 결제를 진행해주세요.</p>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">광고 제목</label>
              <div className="text-gray-900">{paymentInfo.title}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">광고 유형</label>
              <div className="text-gray-900">{paymentInfo.bannerType}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">신청자명</label>
              <div className="text-gray-900">{paymentInfo.applicantName}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처 이메일</label>
              <div className="text-gray-900">{paymentInfo.applicantEmail}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">광고 시작일</label>
              <div className="text-gray-900">{new Date(paymentInfo.startDate).toLocaleDateString()}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">광고 종료일</label>
              <div className="text-gray-900">{new Date(paymentInfo.endDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">💳 결제 금액</h3>
          <div className="text-3xl font-bold text-purple-900">
            {paymentInfo.totalAmount.toLocaleString()}원
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
                  : 'bg-purple-600 text-white hover:bg-purple-700'
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
              배너 광고가 승인된 일정에 따라 자동으로 노출됩니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerPaymentPage;