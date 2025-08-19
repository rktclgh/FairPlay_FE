import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentService from '../../services/paymentService';

interface BoothApplication {
  applicationId: number;
  eventTitle: string;
  boothTitle: string;
  boothTypeName: string;
  boothTypeSize: string;
  price: number;
  managerName: string;
  contactEmail: string;
  paymentStatus: 'PENDING' | 'PAID';
  applicationStatus: string;
  startDate: string;
  endDate: string;
}

const BoothAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<BoothApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchBoothApplications();
  }, []);

  const fetchBoothApplications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booths/my-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('부스 신청 정보를 불러올 수 없습니다.');
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Booth applications fetch error:', error);
      toast.error(error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (application: BoothApplication) => {
    if (application.paymentStatus === 'PAID') {
      toast.info('이미 결제가 완료된 부스입니다.');
      return;
    }

    setPaymentLoading(application.applicationId);

    try {
      // 1. 아임포트 초기화
      await paymentService.initialize();
      
      // 2. 결제 요청 데이터 준비
      const paymentRequest = {
        pg: 'uplus',
        pay_method: 'card',
        merchant_uid: `booth_${Date.now()}`,
        name: `${application.eventTitle} - ${application.boothTitle}`,
        amount: application.price,
        buyer_email: application.contactEmail,
        buyer_name: application.managerName
      };

      // 3. 아임포트 결제 요청
      const paymentResponse = await paymentService.requestPayment(paymentRequest);
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error_msg || '결제가 취소되었습니다.');
      }

      // 4. 결제 성공 시 백엔드에 결제 완료 알림
      const completeResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booths/payment/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          merchantUid: paymentResponse.merchant_uid,
          impUid: paymentResponse.imp_uid,
          targetId: application.applicationId,
          status: 'PAID'
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('결제 완료 처리에 실패했습니다.');
      }

      toast.success('결제가 성공적으로 완료되었습니다!');
      
      // 부스 신청 정보 다시 로드
      await fetchBoothApplications();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : '결제 중 오류가 발생했습니다.');
    } finally {
      setPaymentLoading(null);
    }
  };

  const canAccessOtherFeatures = (application: BoothApplication) => {
    return application.paymentStatus === 'PAID' && application.applicationStatus === 'APPROVED';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">부스 관리 대시보드</h1>
            <p className="mt-1 text-gray-600">부스 운영을 위한 모든 기능을 관리할 수 있습니다.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21h2m0 0h2m-4 0v-2m0 0V7a2 2 0 012-2h2m0 16h2m0 0v-2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">신청한 부스가 없습니다</h3>
            <p className="text-gray-600">먼저 부스를 신청해주세요.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.applicationId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{application.boothTitle}</h2>
                      <p className="text-gray-600">{application.eventTitle}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        application.applicationStatus === 'APPROVED' 
                          ? 'bg-green-100 text-green-800' 
                          : application.applicationStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {application.applicationStatus === 'APPROVED' ? '승인됨' 
                         : application.applicationStatus === 'PENDING' ? '검토중'
                         : '반려됨'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        application.paymentStatus === 'PAID' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {application.paymentStatus === 'PAID' ? '결제완료' : '결제대기'}
                      </span>
                    </div>
                  </div>

                  {/* Booth Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">부스 타입</label>
                      <div className="mt-1 text-gray-900">{application.boothTypeName}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">크기</label>
                      <div className="mt-1 text-gray-900">{application.boothTypeSize}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">운영 기간</label>
                      <div className="mt-1 text-gray-900">
                        {new Date(application.startDate).toLocaleDateString()} ~ {new Date(application.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">결제 금액</label>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        {application.price.toLocaleString()}원
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  {application.applicationStatus === 'APPROVED' && application.paymentStatus === 'PENDING' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-yellow-800">💳 결제가 필요합니다</h3>
                          <p className="text-yellow-700 text-sm">부스 운영을 위해 결제를 완료해주세요.</p>
                        </div>
                        <button
                          onClick={() => handlePayment(application)}
                          disabled={paymentLoading === application.applicationId}
                          className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50"
                        >
                          {paymentLoading === application.applicationId ? '결제 중...' : '결제하기'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feature Access */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">부스 관리 기능</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        onClick={() => canAccessOtherFeatures(application) ? navigate(`/booth/${application.applicationId}/qr-management`) : toast.warning('결제 완료 후 이용 가능합니다.')}
                        className={`p-4 rounded-lg border text-left transition-colors ${
                          canAccessOtherFeatures(application)
                            ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-lg mb-1">🎫</div>
                        <div className="font-medium text-sm">QR 티켓 관리</div>
                      </button>

                      <button
                        onClick={() => canAccessOtherFeatures(application) ? navigate(`/booth/${application.applicationId}/reservations`) : toast.warning('결제 완료 후 이용 가능합니다.')}
                        className={`p-4 rounded-lg border text-left transition-colors ${
                          canAccessOtherFeatures(application)
                            ? 'border-green-200 bg-green-50 hover:bg-green-100 text-green-800'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-lg mb-1">📋</div>
                        <div className="font-medium text-sm">예약 관리</div>
                      </button>

                      <button
                        onClick={() => canAccessOtherFeatures(application) ? navigate(`/booth/${application.applicationId}/analytics`) : toast.warning('결제 완료 후 이용 가능합니다.')}
                        className={`p-4 rounded-lg border text-left transition-colors ${
                          canAccessOtherFeatures(application)
                            ? 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-lg mb-1">📊</div>
                        <div className="font-medium text-sm">통계 분석</div>
                      </button>

                      <button
                        onClick={() => canAccessOtherFeatures(application) ? navigate(`/booth/${application.applicationId}/settings`) : toast.warning('결제 완료 후 이용 가능합니다.')}
                        className={`p-4 rounded-lg border text-left transition-colors ${
                          canAccessOtherFeatures(application)
                            ? 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-lg mb-1">⚙️</div>
                        <div className="font-medium text-sm">부스 설정</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoothAdminDashboard;