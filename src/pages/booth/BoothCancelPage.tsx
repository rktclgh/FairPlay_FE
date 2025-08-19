import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface BoothCancelInfo {
  applicationId: number;
  eventTitle: string;
  boothTitle: string;
  boothTypeName: string;
  boothTypeSize: string;
  price: number;
  managerName: string;
  contactEmail: string;
  applicationStatus: string;
  paymentStatus: string;
  canCancel: boolean;
  cancelReason?: string;
}

const BoothCancelPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cancelInfo, setCancelInfo] = useState<BoothCancelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const applicationId = searchParams.get('applicationId');

  useEffect(() => {
    if (!applicationId) {
      setError('부스 신청 ID가 필요합니다.');
      setLoading(false);
      return;
    }

    fetchCancelInfo();
  }, [applicationId]);

  const fetchCancelInfo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/cancel/${applicationId}`);
      
      if (!response.ok) {
        throw new Error('취소 정보를 불러올 수 없습니다.');
      }

      const data = await response.json();
      setCancelInfo(data);
      setContactEmail(data.contactEmail);
    } catch (err) {
      console.error('Cancel info fetch error:', err);
      setError(err instanceof Error ? err.message : '취소 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelInfo) return;
    
    if (!cancelReason.trim()) {
      toast.error('취소 사유를 입력해주세요.');
      return;
    }

    if (!contactEmail.trim()) {
      toast.error('연락처 이메일을 입력해주세요.');
      return;
    }

    setCancelling(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/cancel/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: cancelReason.trim(),
          contactEmail: contactEmail.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '취소 요청에 실패했습니다.');
      }

      toast.success('부스 취소 요청이 완료되었습니다.');
      
      // 취소 정보 다시 로드
      await fetchCancelInfo();
      
    } catch (err) {
      console.error('Cancel request error:', err);
      toast.error(err instanceof Error ? err.message : '취소 요청 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
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

  if (!cancelInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">취소 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const isAlreadyCancelled = cancelInfo.cancelReason !== null && cancelInfo.cancelReason !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">부스 취소 요청</h1>
          <p className="text-gray-600">부스 운영 취소를 요청할 수 있습니다.</p>
        </div>

        {/* Booth Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">부스 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">행사명</label>
              <div className="text-gray-900">{cancelInfo.eventTitle}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">부스명</label>
              <div className="text-gray-900">{cancelInfo.boothTitle}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">부스 타입</label>
              <div className="text-gray-900">{cancelInfo.boothTypeName}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">부스 크기</label>
              <div className="text-gray-900">{cancelInfo.boothTypeSize || '미지정'}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
              <div className="text-gray-900">{cancelInfo.managerName}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
              <div className="text-gray-900">{cancelInfo.price.toLocaleString()}원</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">현재 상태</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">신청 상태</label>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                cancelInfo.applicationStatus === 'APPROVED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {cancelInfo.applicationStatus === 'APPROVED' ? '승인됨' : '대기중'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">결제 상태</label>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                cancelInfo.paymentStatus === 'PAID' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {cancelInfo.paymentStatus === 'PAID' ? '결제 완료' : '결제 대기'}
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Status or Form */}
        {isAlreadyCancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ 취소 요청 완료</h3>
            <div className="text-red-700">
              <strong>취소 사유:</strong> {cancelInfo.cancelReason}
            </div>
            <div className="text-red-600 text-sm mt-2">
              취소 요청이 접수되었습니다. 관련 데이터가 삭제되고 결제가 환불될 예정입니다.
            </div>
          </div>
        ) : cancelInfo.canCancel ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">취소 요청</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 이메일 *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="연락처 이메일을 입력해주세요"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                  취소 사유 *
                </label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="취소 사유를 상세히 입력해주세요"
                  required
                />
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <div className="text-yellow-800 font-semibold">⚠️ 주의사항</div>
              <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside space-y-1">
                <li>취소 요청 시 관련된 모든 데이터가 삭제됩니다.</li>
                <li>이미 결제된 금액은 환불 처리됩니다.</li>
                <li>취소 후에는 복구할 수 없습니다.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">취소 불가</h3>
            <div className="text-gray-600">
              현재 상태에서는 취소 요청을 할 수 없습니다.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!isAlreadyCancelled && cancelInfo.canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelling ? '처리 중...' : '⚠️ 취소 요청하기'}
            </button>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoothCancelPage;