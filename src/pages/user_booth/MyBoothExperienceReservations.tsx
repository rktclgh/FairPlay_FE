import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Clock, Users, MapPin, Calendar, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getMyReservations,
  cancelReservation,
  formatTime
} from '../../services/boothExperienceService';
import { BoothExperienceReservation, ExperienceStatusCode, ReservationFilters } from '../../services/types/boothExperienceType';
import { toast } from 'react-toastify';
import { AttendeeSideNav } from "../user_mypage/AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import authManager from '../../utils/auth';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const MyBoothExperienceReservations: React.FC = () => {
  useScrollToTop();
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<BoothExperienceReservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<BoothExperienceReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  // 디바운스된 검색어
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // 검색어 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 데이터 로딩
  useEffect(() => {
    loadReservations();
  }, [debouncedSearchTerm, selectedStatus, startDate, endDate]);

  // 필터링 처리
  useEffect(() => {
    filterReservations();
  }, [reservations, debouncedSearchTerm, selectedStatus, startDate, endDate]);

  const loadReservations = async () => {
    try {
      setLoading(true);

      const filters: ReservationFilters = {
        statusCode: selectedStatus !== 'ALL' ? selectedStatus as ExperienceStatusCode : undefined,
        dateFrom: startDate || undefined,
        dateTo: endDate || undefined,
      };

      const data = await getMyReservations(filters);
      setReservations(data);
    } catch (error) {
      console.error('예약 목록 로딩 실패:', error);
      toast.error(t('boothExperienceReservation.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = useCallback(() => {
    let filtered = [...reservations];

    // 검색어 필터링
    if (debouncedSearchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.experienceTitle.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reservation.boothName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    setFilteredReservations(filtered);
  }, [reservations, debouncedSearchTerm]);

  const handleCancelReservation = async () => {
    if (!selectedReservationId) return;

    try {
      await cancelReservation(selectedReservationId);
      toast.success(t('boothExperienceReservation.cancelSuccess'));
      setShowCancelModal(false);
      setSelectedReservationId(null);
      loadReservations(); // 목록 새로고침
    } catch (error) {
      console.error('예약 취소 실패:', error);
      toast.error(t('boothExperienceReservation.cancelFailed'));
    }
  };

  const getStatusBadge = (statusCode: string, statusName: string) => {
    const statusConfig = {
      'WAITING': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
      'READY': { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' },
      'IN_PROGRESS': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🔵' },
      'COMPLETED': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '✅' },
      'CANCELLED': { bg: 'bg-gray-100', text: 'text-gray-600', icon: '❌' },
      'NO_SHOW': { bg: 'bg-red-100', text: 'text-red-800', icon: '⚠️' }
    };

    const config = statusConfig[statusCode as keyof typeof statusConfig] || statusConfig['WAITING'];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {statusName}
      </span>
    );
  };

  const canCancelReservation = (statusCode: string) => {
    return statusCode === 'WAITING' || statusCode === 'READY';
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white w-[1256px] min-h-screen relative">
          <TopNav />

          {/* 페이지 제목 */}
          <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
            {t('boothExperienceReservation.title')}
          </div>

          {/* 사이드바 */}
          <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />

          {/* 메인 콘텐츠 */}
          <div className="ml-64 mt-[195px] w-[949px] pb-28 md:pb-36">
            {/* 헤더 */}
            <div className="mb-6">
              <p className="text-gray-600">{t('boothExperienceReservation.description')}</p>
            </div>

            {/* 검색 및 필터 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{t('boothExperienceReservation.searchConditions')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 검색 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('boothExperienceReservation.experienceOrBoothName')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={t('boothExperienceReservation.experienceOrBoothNamePlaceholder')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* 예약 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">예약 상태</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <select
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="ALL">전체</option>
                      <option value="WAITING">대기중</option>
                      <option value="READY">입장가능</option>
                      <option value="IN_PROGRESS">체험중</option>
                      <option value="COMPLETED">완료</option>
                      <option value="CANCELLED">취소됨</option>
                      <option value="NO_SHOW">노쇼</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 시작 날짜 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {/* 종료 날짜 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                  <input
                    type="date"
                    min={startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 로딩 상태 */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* 결과 개수 */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    총 <span className="font-semibold text-blue-600">{filteredReservations.length}</span>개의 예약이 있습니다
                  </p>
                </div>

                {/* 예약 목록 */}
                <div className="space-y-4">
                  {filteredReservations.map((reservation) => (
                    <div
                      key={reservation.reservationId}
                      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {reservation.experienceTitle}
                            </h3>
                            {getStatusBadge(reservation.statusCode, reservation.statusName)}
                          </div>

                          {/* 행사명 */}
                          {reservation.eventName && (
                            <div className="flex items-center text-blue-600 mb-2">
                              <span className="text-xs font-medium bg-blue-100 px-2 py-1 rounded-full">
                                🎪 {reservation.eventName}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{reservation.boothName}</span>
                          </div>

                          <div className="flex items-center text-gray-600 mb-2">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              예약일시: {formatDateTime(reservation.reservedAt)}
                            </span>
                          </div>

                          {reservation.queuePosition > 0 && (
                            <div className="flex items-center text-orange-600 mb-2">
                              <Users className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">
                                대기순번: {reservation.queuePosition}번
                              </span>
                            </div>
                          )}

                          {reservation.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">메모:</span> {reservation.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {canCancelReservation(reservation.statusCode) && (
                            <button
                              onClick={() => {
                                setSelectedReservationId(reservation.reservationId);
                                setShowCancelModal(true);
                              }}
                              className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              예약 취소
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 결과 없음 */}
                {filteredReservations.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                      <Search className="w-12 h-12 mx-auto mb-2" />
                      <p>조건에 맞는 예약을 찾을 수 없습니다</p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedStatus('ALL');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      필터 초기화
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 예약 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">예약 취소 확인</h3>
            </div>

            <p className="text-gray-600 mb-6">
              정말로 이 예약을 취소하시겠습니까?<br />
              취소된 예약은 복구할 수 없습니다.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedReservationId(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={handleCancelReservation}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                예약 취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBoothExperienceReservations;