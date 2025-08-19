import React, { useState, useEffect } from 'react';
import {
  Search, Calendar, Users, Clock, Phone, User,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Filter
} from 'lucide-react';
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { toast } from 'react-toastify';
import {
  getManageableBoothsForReservation,
  getReservationsForManagement,
  updateReservationStatusForManagement,
  type ReservationManagementResponse,
  type Booth,
  type ReservationManagementFilters
} from '../../services/boothExperienceService';

// 타입 정의
interface BoothSummary {
  boothId: number;
  boothName: string;
  maxCapacity: number;
  currentParticipants: number;
  waitingCount: number;
  currentParticipantNames: string[];
  nextParticipantName?: string;
}

const BoothExperienceReserverManagement: React.FC = () => {
  // 상태 관리
  const [selectedBooth, setSelectedBooth] = useState<BoothSummary | null>(null);
  const [reservations, setReservations] = useState<ReservationManagementResponse[]>([]);
  const [availableBooths, setAvailableBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // 검색 필터 상태
  const [filters, setFilters] = useState({
    boothId: '',
    reserverName: '',
    reserverPhone: '',
    experienceDate: '',
    statusCode: ''
  });

  // 페이지네이션 상태
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  // 상태 코드 옵션
  const statusOptions = [
    { value: '', label: '전체' },
    { value: 'WAITING', label: '대기중' },
    { value: 'READY', label: '입장가능' },
    { value: 'IN_PROGRESS', label: '체험중' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'CANCELLED', label: '취소' }
  ];

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 필터 변경 시 검색
  useEffect(() => {
    if (!loading) {
      handleSearch();
    }
  }, [filters, pagination.page]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // 관리 가능한 부스 목록 조회
      const booths = await getManageableBoothsForReservation();

      // 배열인지 확인하고 설정
      if (Array.isArray(booths)) {
        setAvailableBooths(booths);

        // 첫 번째 부스를 기본 선택
        if (booths.length > 0) {
          setFilters(prev => ({ ...prev, boothId: booths[0].boothId.toString() }));
          await loadBoothSummary(booths[0].boothId);
        }
      } else {
        console.warn('부스 목록이 배열이 아닙니다:', booths);
        setAvailableBooths([]);
      }
    } catch (error) {
      console.error('초기 데이터 로딩 실패:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
      setAvailableBooths([]); // 오류 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  const loadBoothSummary = async (boothId: number) => {
    try {
      // 현재는 임시 데이터를 사용. 실제로는 부스별 요약 API가 필요함
      if (Array.isArray(availableBooths)) {
        const selectedBoothData = availableBooths.find(b => b.boothId === boothId);
        if (selectedBoothData) {
          // 임시 데이터 - 실제로는 부스별 현황 요약 API에서 가져와야 함
          setSelectedBooth({
            boothId: boothId,
            boothName: selectedBoothData.boothTitle,
            maxCapacity: 10,
            currentParticipants: 3,
            waitingCount: 5,
            currentParticipantNames: ['홍길동', '김영희', '이철수'],
            nextParticipantName: '박민수'
          });
        }
      }
    } catch (error) {
      console.error('부스 요약 정보 로딩 실패:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setSearchLoading(true);

      const searchFilters: ReservationManagementFilters = {
        boothId: filters.boothId ? parseInt(filters.boothId) : undefined,
        reserverName: filters.reserverName || undefined,
        reserverPhone: filters.reserverPhone || undefined,
        experienceDate: filters.experienceDate || undefined,
        statusCode: filters.statusCode || undefined,
        page: pagination.page,
        size: pagination.size,
        sortBy: 'reservedAt',
        sortDirection: 'asc'
      };

      const data = await getReservationsForManagement(searchFilters);
      setReservations(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));

      // 선택된 부스의 요약 정보 업데이트
      if (filters.boothId) {
        await loadBoothSummary(parseInt(filters.boothId));
      }
    } catch (error) {
      console.error('예약자 목록 검색 실패:', error);
      toast.error('예약자 목록을 불러오는데 실패했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStatusChange = async (reservationId: number, newStatusCode: string) => {
    try {
      await updateReservationStatusForManagement(reservationId, newStatusCode);
      toast.success('상태가 변경되었습니다.');
      handleSearch(); // 목록 새로고침
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const resetFilters = () => {
    setFilters({
      boothId: Array.isArray(availableBooths) && availableBooths.length > 0 ? availableBooths[0].boothId.toString() : '',
      reserverName: '',
      reserverPhone: '',
      experienceDate: '',
      statusCode: ''
    });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const getStatusBadgeColor = (statusCode: string) => {
    switch (statusCode) {
      case 'WAITING': return 'bg-yellow-100 text-yellow-800';
      case 'READY': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1256px] min-h-screen relative">
        <TopNav />

        {/* 페이지 제목 */}
        <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
          체험 예약자 관리
        </div>

        {/* 사이드바 */}
        <HostSideNav className="!absolute !left-0 !top-[117px]" />

        {/* 메인 콘텐츠 */}
        <div className="absolute left-64 top-[195px] w-[949px] pb-20">
          {/* 현재 부스 현황 */}
          {selectedBooth && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                🏢 {selectedBooth.boothName} 현황
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 기본 정보 */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">정원 / 체험중 / 대기</div>
                  <div className="text-xl font-bold text-blue-600">
                    {selectedBooth.maxCapacity}명 / {selectedBooth.currentParticipants}명 / {selectedBooth.waitingCount}명
                  </div>
                </div>

                {/* 체험중인 인원 */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">체험중인 인원</div>
                  <div className="text-lg font-semibold text-green-600">
                    {selectedBooth.currentParticipants}명
                  </div>
                  {selectedBooth.currentParticipantNames.length > 0 && (
                    <div className="text-sm text-gray-700 mt-1">
                      {selectedBooth.currentParticipantNames.join(', ')}
                    </div>
                  )}
                </div>

                {/* 다음 입장자 */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">다음 입장 예약자</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {selectedBooth.nextParticipantName || '없음'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 검색 조건 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              검색 조건
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 부스 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">부스명</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.boothId}
                  onChange={(e) => setFilters(prev => ({ ...prev, boothId: e.target.value }))}
                >
                  <option value="">전체 부스</option>
                  {Array.isArray(availableBooths) && availableBooths.map(booth => (
                    <option key={booth.boothId} value={booth.boothId}>
                      {booth.boothTitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* 예약자명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예약자명</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="예약자 이름"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.reserverName}
                    onChange={(e) => setFilters(prev => ({ ...prev, reserverName: e.target.value }))}
                  />
                </div>
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="010-1234-5678"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.reserverPhone}
                    onChange={(e) => setFilters(prev => ({ ...prev, reserverPhone: e.target.value }))}
                  />
                </div>
              </div>

              {/* 체험일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">체험일</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.experienceDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, experienceDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* 체험 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">체험 상태</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.statusCode}
                  onChange={(e) => setFilters(prev => ({ ...prev, statusCode: e.target.value }))}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 필터 초기화 버튼 */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  초기화
                </button>
              </div>
            </div>

            {/* 검색 결과 정보 */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                총 <span className="font-semibold text-blue-600">{pagination.totalElements}</span>개의 예약이 있습니다
              </div>
              {searchLoading && (
                <div className="flex items-center text-blue-600">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  검색 중...
                </div>
              )}
            </div>
          </div>

          {/* 예약자 목록 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">예약이 없습니다</h3>
                <p className="text-gray-600">
                  검색 조건에 맞는 예약이 없습니다.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        부스/체험 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        예약자 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        입장/대기 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        예약일시
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태 변경
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                      <tr key={reservation.reservationId} className="hover:bg-gray-50">
                        {/* 부스/체험 정보 */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.boothName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {reservation.experienceTitle}
                            </div>
                            <div className="text-xs text-blue-600 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {reservation.experienceDate}
                            </div>
                          </div>
                        </td>

                        {/* 예약자 정보 */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <User className="w-4 h-4 mr-1 text-gray-400" />
                              {reservation.reserverName}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-gray-400" />
                              {reservation.reserverPhone}
                            </div>
                          </div>
                        </td>

                        {/* 입장/대기 정보 */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center mb-1">
                              {reservation.canEnter ? (
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500 mr-1" />
                              )}
                              <span className={`text-sm font-medium ${reservation.canEnter ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {reservation.canEnter ? '입장 가능' : '입장 불가'}
                              </span>
                            </div>
                            {reservation.queuePosition && (
                              <div className="text-xs text-gray-600">
                                대기 순서: {reservation.queuePosition}번
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 상태 */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(reservation.statusCode)}`}>
                            {reservation.statusName}
                          </span>
                        </td>

                        {/* 예약일시 */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(reservation.reservedAt).toLocaleDateString('ko-KR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(reservation.reservedAt).toLocaleTimeString('ko-KR')}
                          </div>
                        </td>

                        {/* 상태 변경 버튼 */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-1">
                            {reservation.statusCode === 'WAITING' && (
                              <button
                                onClick={() => handleStatusChange(reservation.reservationId, 'READY')}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                title="입장 가능으로 변경"
                              >
                                입장가능
                              </button>
                            )}
                            {reservation.statusCode === 'READY' && (
                              <button
                                onClick={() => handleStatusChange(reservation.reservationId, 'IN_PROGRESS')}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                title="체험 시작"
                              >
                                체험시작
                              </button>
                            )}
                            {reservation.statusCode === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleStatusChange(reservation.reservationId, 'COMPLETED')}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                title="체험 완료"
                              >
                                완료
                              </button>
                            )}
                            {(reservation.statusCode === 'WAITING' || reservation.statusCode === 'READY') && (
                              <button
                                onClick={() => handleStatusChange(reservation.reservationId, 'CANCELLED')}
                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                title="예약 취소"
                              >
                                취소
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                    disabled={pagination.page === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages - 1, prev.page + 1) }))}
                    disabled={pagination.page >= pagination.totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{pagination.page * pagination.size + 1}</span>
                      {' '}부터{' '}
                      <span className="font-medium">
                        {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}
                      </span>
                      {' '}까지 (전체{' '}
                      <span className="font-medium">{pagination.totalElements}</span>
                      {' '}개)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                        disabled={pagination.page === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      {/* 페이지 번호들 */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, Math.min(pagination.totalPages - 5, pagination.page - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.page === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages - 1, prev.page + 1) }))}
                        disabled={pagination.page >= pagination.totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoothExperienceReserverManagement;