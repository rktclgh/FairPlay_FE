import React, { useState, useEffect } from 'react';
import { 
  Clock, Users, MapPin, Calendar, AlertCircle,
  CheckCircle, XCircle, RefreshCw, User, X
} from 'lucide-react';
import {
  getExperienceDetail,
  getQueueStatus,
  pollQueueStatus,
  getCongestionColor,
  getCongestionText,
  formatTime,
  formatWaitTime,
  createReservation
} from '../../services/boothExperienceService';
import {
  BoothExperience,
  QueueStatusResponse
} from '../../services/types/boothExperienceType';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

type ApiError = {
  response?: { status?: number; data?: { message?: string } | string };
  message?: string;
};

interface BoothExperienceReservationModalProps {
  experienceId: number;
  onClose: () => void;
}

const BoothExperienceReservationModal: React.FC<BoothExperienceReservationModalProps> = ({ experienceId, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [experience, setExperience] = useState<BoothExperience | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (experienceId) {
      loadExperienceDetail();
    }
  }, [experienceId]);

  useEffect(() => {
    if (!experienceId) return;

    // 대기열 상태 실시간 업데이트
    const cleanup = pollQueueStatus(
      experienceId,
      (status) => setQueueStatus(status),
      5000 // 5초마다 업데이트
    );

    return cleanup;
  }, [experienceId]);

  const loadExperienceDetail = async () => {
    try {
      setLoading(true);
      const [experienceData, queueData] = await Promise.all([
        getExperienceDetail(experienceId),
        getQueueStatus(experienceId)
      ]);
      
      setExperience(experienceData);
      setQueueStatus(queueData);
    } catch (error) {
      console.error('체험 상세 정보 로딩 실패:', error);
      toast.error('체험 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const queueData = await getQueueStatus(experienceId);
      setQueueStatus(queueData);
      toast.success('정보가 업데이트되었습니다.');
    } catch {
      toast.error('정보 업데이트에 실패했습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleReservation = async () => {
    if (!experience || !experience.isReservationAvailable || reserving) return;

    const confirmMessage = '예약 하시겠습니까?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setReserving(true);
    try {
      if (!isAuthenticated) {
        toast.error('로그인이 필요합니다.');
        return;
      }
      
      const reservationData = {
        notes: '' // 예약 메모 (선택사항)
      };

      await createReservation(experienceId, reservationData);
      toast.success('예약이 완료되었습니다!');
      
      // 예약 후 정보 새로고침
      loadExperienceDetail();
    } catch (error) {
      const apiError = error as ApiError;
      console.error('예약 실패:', error);
      
      // 에러 응답 상세 로깅
      if (apiError.response) {
        const responseData = apiError.response.data;
        const message = typeof responseData === 'string' ? responseData : responseData?.message;
        console.error('Response status:', apiError.response.status);
        console.error('Response data:', responseData);
        toast.error(`예약 실패: ${message || '서버 오류가 발생했습니다.'}`);
      } else if (apiError.message) {
        console.error('Error message:', apiError.message);
        toast.error(`예약 실패: ${apiError.message}`);
      } else {
        toast.error('예약에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-lg w-full max-w-5xl max-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">체험을 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">요청하신 체험이 존재하지 않거나 삭제되었습니다.</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[80vh] overflow-auto">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="bg-white text-gray-600 hover:text-gray-900 transition-colors p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-2">
              {/* 체험 기본 정보 */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{experience.title}</h1>
                      <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="ml-2 bg-white text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 p-1 rounded"
                      >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="text-lg">{experience.boothName}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getCongestionColor(experience.congestionRate)}`}>
                      {getCongestionText(experience.congestionRate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      혼잡도 {Math.round(experience.congestionRate)}%
                    </div>
                  </div>
                </div>

                {/* 일정 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium">날짜</div>
                      <div className="text-sm">{new Date(experience.experienceDate).toLocaleDateString('ko-KR')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium">운영 시간</div>
                      <div className="text-sm">
                        {formatTime(experience.startTime)} - {formatTime(experience.endTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium">수용 인원</div>
                      <div className="text-sm">최대 {experience.maxCapacity}명 동시 참여</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium">체험 시간</div>
                      <div className="text-sm">{experience.durationMinutes}분</div>
                    </div>
                  </div>
                </div>

                {/* 설명 */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">체험 소개</h3>
                  <p className="text-gray-700 leading-relaxed">{experience.description}</p>
                </div>

                {/* 예약 버튼 (모바일에서 더 잘 보이도록) */}
                <div className="lg:hidden">
                  {experience.isReservationEnabled ? (
                    <button
                      onClick={handleReservation}
                      disabled={!experience.isReservationAvailable || reserving}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors shadow-lg ${
                        experience.isReservationAvailable && !reserving
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {reserving ? '예약 중...' : experience.isReservationAvailable ? '🎯 즉시 예약하기' : '⏰ 예약 불가'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 px-6 rounded-lg font-semibold text-lg bg-gray-300 text-gray-500 cursor-not-allowed shadow-lg"
                    >
                      ❌ 예약 불가
                    </button>
                  )}
                  
                  {/* 현재 상황 요약 (모바일용) */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{queueStatus?.currentParticipants || 0}</div>
                      <div className="text-xs text-gray-600">체험중</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{queueStatus?.waitingCount || 0}</div>
                      <div className="text-xs text-gray-600">대기중</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{experience.maxCapacity}</div>
                      <div className="text-xs text-gray-600">최대수용</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 실시간 현황 */}
              <div className="bg-white rounded-lg shadow-sm p-4 border">
                <h3 className="font-semibold text-gray-900 mb-4">실시간 현황</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{queueStatus?.currentParticipants || 0}</div>
                    <div className="text-sm text-gray-600">현재 체험중</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{queueStatus?.waitingCount || 0}</div>
                    <div className="text-sm text-gray-600">대기중</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{experience.maxCapacity}</div>
                    <div className="text-sm text-gray-600">최대 수용</div>
                  </div>
                </div>

                {/* 혼잡도 시각화 */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">현재 혼잡도</span>
                    <span className={`text-sm font-medium ${getCongestionColor(experience.congestionRate)}`}>
                      {Math.round(experience.congestionRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        experience.congestionRate >= 90 ? 'bg-red-500' :
                        experience.congestionRate >= 70 ? 'bg-orange-500' :
                        experience.congestionRate >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(experience.congestionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* 예상 대기 시간 */}
                {queueStatus?.estimatedWaitTime && queueStatus.estimatedWaitTime > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                      <span className="text-amber-800 font-medium">
                        {formatWaitTime(queueStatus.estimatedWaitTime)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 사이드바 */}
            <div className="lg:col-span-1">
              {/* 예약 카드 */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
                <h3 className="font-semibold text-gray-900 mb-4">예약하기</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">예약 상태</span>
                    <div className="flex items-center">
                      {experience.isReservationAvailable ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mr-1" />
                      )}
                      <span className={experience.isReservationAvailable ? 'text-green-600' : 'text-red-600'}>
                        {experience.isReservationAvailable ? '예약 가능' : '예약 불가'}
                      </span>
                    </div>
                  </div>
                  
                  {experience.allowWaiting && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">대기열</span>
                      <span className="text-blue-600">허용</span>
                    </div>
                  )}
                  
                  {experience.allowDuplicateReservation && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">중복 예약</span>
                      <span className="text-blue-600">허용</span>
                    </div>
                  )}
                </div>

                {/* 예약 버튼 */}
                {experience.isReservationEnabled ? (
                  <button
                    onClick={handleReservation}
                    disabled={!experience.isReservationAvailable || reserving}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      experience.isReservationAvailable && !reserving
                        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {reserving ? '예약 중...' : experience.isReservationAvailable ? '즉시 예약하기' : '예약 불가'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    예약 불가
                  </button>
                )}

                {/* 추가 안내 메시지 */}
                {experience.isReservationEnabled && !experience.isReservationAvailable && experience.allowWaiting && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800 text-center">
                      현재 만석입니다. 대기열에 등록하시겠습니까?
                    </p>
                  </div>
                )}

                {experience.isReservationEnabled && queueStatus?.estimatedWaitTime && queueStatus.estimatedWaitTime > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 text-center">
                      {formatWaitTime(queueStatus.estimatedWaitTime)}
                    </p>
                  </div>
                )}

              </div>

              {/* 추가 정보 */}
              <div className="bg-white rounded-lg shadow-sm p-4 border">
                <h3 className="font-semibold text-gray-900 mb-4">참고사항</h3>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>체험 시간은 약 {experience.durationMinutes}분 소요됩니다.</span>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>최대 {experience.maxCapacity}명까지 동시에 참여할 수 있습니다.</span>
                  </div>
                  
                  {experience.allowWaiting && (
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>대기열 최대 {experience.maxWaitingCount}명까지 등록 가능합니다.</span>
                    </div>
                  )}
                  
                  {!experience.allowDuplicateReservation && (
                    <div className="flex items-start">
                      <User className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>동일한 체험은 한 번만 예약할 수 있습니다.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BoothExperienceReservationModal;
