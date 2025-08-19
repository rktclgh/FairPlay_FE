import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Clock, Users, MapPin, Calendar } from 'lucide-react';
import {
  getAvailableExperiences,
  getCongestionColor,
  getCongestionText,
  formatTime
} from '../../services/boothExperienceService';
import { BoothExperience, BoothExperienceFilters } from '../../services/types/boothExperienceType';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AttendeeSideNav } from "../../pages/user_mypage/AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import BoothExperienceReservationModal from '../../components/booth/BoothExperienceReservationModal';
import reservationService from '../../services/reservationService';
import { useTranslation } from 'react-i18next';

const BoothExperienceList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [experiences, setExperiences] = useState<BoothExperience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<BoothExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'congestionRate' | 'startTime' | 'createdAt'>('startTime');
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [availableEvents, setAvailableEvents] = useState<{ id: number, name: string }[]>([]);
  const [userRegisteredEvents, setUserRegisteredEvents] = useState<{ id: number, name: string }[]>([]);
  const [userEventsLoaded, setUserEventsLoaded] = useState(false);
  const [showOnlyRegisteredEvents, setShowOnlyRegisteredEvents] = useState(false);

  // 디바운스된 검색어
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // 검색어 디바운스 처리 (500ms 지연)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 사용자 참가 신청 행사 목록 로딩
  useEffect(() => {
    loadUserRegisteredEvents();
  }, []);

  // 데이터 로딩 - 사용자 행사 로딩이 완료된 후에 체험을 로딩
  useEffect(() => {
    console.log('useEffect 호출됨 - userEventsLoaded:', userEventsLoaded);
    if (userEventsLoaded) {
      loadExperiences();
    }
  }, [debouncedSearchTerm, startDate, endDate, showAvailableOnly, selectedEventId, sortBy, userEventsLoaded, showOnlyRegisteredEvents]);

  // 직접 필터링 제거 - 백엔드에서 필터링된 데이터를 받음
  useEffect(() => {
    setFilteredExperiences(experiences);
  }, [experiences]);

  const loadUserRegisteredEvents = async () => {
    console.log('loadUserRegisteredEvents 시작');
    try {
      const myReservations = await reservationService.getMyReservations();
      console.log('사용자 예약 목록:', myReservations);

      // 예약에서 고유한 행사 목록 추출
      const events = myReservations.reduce((acc: { id: number, name: string }[], reservation) => {
        const existingEvent = acc.find(e => e.id === reservation.eventId);
        if (!existingEvent && reservation.eventId && reservation.eventName) {
          acc.push({ id: reservation.eventId, name: reservation.eventName });
        }
        return acc;
      }, []);

      console.log('추출된 행사 목록:', events);
      setUserRegisteredEvents(events);
      setAvailableEvents(events); // 사용자가 참가 신청한 행사만 표시
      setUserEventsLoaded(true); // 로딩 완료 표시

    } catch (error) {
      console.error('사용자 참가 행사 목록 로딩 실패:', error);
      // 에러 시에도 일반적인 로딩은 계속 진행
      setUserRegisteredEvents([]);
      setAvailableEvents([]);
      setUserEventsLoaded(true); // 에러 상황에서도 로딩 완료로 처리
    }
  };

  const loadExperiences = async () => {
    console.log('loadExperiences 시작');
    try {
      setLoading(true);

      const filters: BoothExperienceFilters = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        boothName: debouncedSearchTerm || undefined,
        isAvailable: showAvailableOnly ? true : undefined,
        eventId: selectedEventId !== 'ALL' ? parseInt(selectedEventId) : undefined,
        sortBy,
        sortDirection: 'asc'
      };

      console.log('필터 조건:', filters);
      const data = await getAvailableExperiences(filters);
      console.log('백엔드에서 받은 체험 데이터:', data);

      // 참가 신청한 행사만 보기 옵션에 따라 필터링
      if (!showOnlyRegisteredEvents) {
        // 모든 체험 표시
        console.log('모든 체험을 표시합니다.');
        setExperiences(data);
      } else {
        // 참가 신청한 행사의 체험만 표시
        if (userRegisteredEvents.length === 0) {
          console.log('참가 신청한 행사가 없습니다.');
          setExperiences([]);
        } else {
          let eventIdsToFilter: number[] = [];

          if (selectedEventId === 'ALL') {
            // "모든 행사" 선택 시 참가 신청한 모든 행사
            eventIdsToFilter = userRegisteredEvents.map(event => event.id);
          } else {
            // 특정 행사 선택 시 해당 행사만
            eventIdsToFilter = [parseInt(selectedEventId)];
          }

          console.log('필터링할 행사 ID들:', eventIdsToFilter);
          const filteredData = data.filter(experience =>
            eventIdsToFilter.length === 0 || eventIdsToFilter.includes(experience.eventId)
          );

          console.log('필터링된 체험 데이터:', filteredData);
          setExperiences(filteredData);
        }
      }

    } catch (error) {
      console.error('부스 체험 목록 로딩 실패:', error);
      toast.error(t('boothExperience.loadingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceClick = (experienceId: number) => {
    setSelectedExperienceId(experienceId);
  };

  const handleCloseModal = () => {
    setSelectedExperienceId(null);
  };


  return (
    <>
      <style>{`
        /* select 박스 자체는 원래 스타일 유지 */
        select {
          border: 1px solid #d1d5db !important;
        }
        select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* select 드롭다운 스타일링 - Chrome 호환성 */
        select:focus {
          outline: none !important;
        }
        
        /* select 요소 자체에 그림자 효과로 테두리 시뮬레이션 */
        select:focus {
          box-shadow: 
            0 0 0 1px #d1d5db,
            0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* option 요소 스타일링 */
        select option {
          background: white !important;
          color: #374151 !important;
          padding: 8px 12px !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          min-height: 32px !important;
          line-height: 1.5 !important;
          /* Chrome에서 가능한 스타일만 사용 */
          border: none !important;
          outline: 1px solid #d1d5db !important;
          outline-offset: -1px !important;
        }
        
        select option:hover {
          background: #f3f4f6 !important;
          background-color: #f3f4f6 !important;
        }
        
        select option:checked, select option:focus, select option:active {
          background: #3b82f6 !important;
          background-color: #3b82f6 !important;
          color: white !important;
          outline-color: #3b82f6 !important;
        }
      `}</style>
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white w-[1256px] min-h-screen relative">
          <TopNav />

          {/* 페이지 제목 */}
          <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
            {t('boothExperience.list')}
          </div>

          {/* 사이드바 */}
          <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />

          {/* 메인 콘텐츠 */}
          <div className="ml-64 mt-[195px] w-[949px] pb-28 md:pb-36">
            {/* 헤더 */}
            <div className="mb-6">
              <p className="text-gray-600">{t('boothExperience.description')}</p>
            </div>

            {/* 검색 및 필터 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{t('payment.searchConditions')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {/* 행사 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('event.title')}</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <select
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                      <option value="ALL">
                        {t('event.allCategories')}
                      </option>
                      {availableEvents.map(event => (
                        <option key={event.id} value={event.id?.toString() || ''}>
                          {event.name || t('common.unknown')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 검색 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('boothExperience.experienceName')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={t('boothExperience.experienceNamePlaceholder')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* 시작 날짜 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('boothExperience.startDate')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      id="start-date-input"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer select-none [&::-webkit-datetime-edit]:select-none [&::-webkit-datetime-edit-fields-wrapper]:select-none [&::-webkit-datetime-edit-text]:select-none [&::-webkit-datetime-edit-month-field]:select-none [&::-webkit-datetime-edit-day-field]:select-none [&::-webkit-datetime-edit-year-field]:select-none"
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                      }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e) => {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        // 텍스트 선택 해제
                        if (document.getSelection) {
                          document.getSelection()?.removeAllRanges();
                        }
                        if (input.showPicker) {
                          try {
                            input.showPicker();
                          } catch (error) {
                            console.log('showPicker failed, falling back to focus');
                            input.focus();
                          }
                        }
                      }}
                      onMouseDown={(e) => {
                        // 마우스 다운 시 텍스트 선택 방지
                        e.preventDefault();
                      }}
                    />
                  </div>
                </div>

                {/* 종료 날짜 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('boothExperience.endDate')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      id="end-date-input"
                      type="date"
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer select-none [&::-webkit-datetime-edit]:select-none [&::-webkit-datetime-edit-fields-wrapper]:select-none [&::-webkit-datetime-edit-text]:select-none [&::-webkit-datetime-edit-month-field]:select-none [&::-webkit-datetime-edit-day-field]:select-none [&::-webkit-datetime-edit-year-field]:select-none"
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                      }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={(e) => {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        // 텍스트 선택 해제
                        if (document.getSelection) {
                          document.getSelection()?.removeAllRanges();
                        }
                        if (input.showPicker) {
                          try {
                            input.showPicker();
                          } catch (error) {
                            console.log('showPicker failed, falling back to focus');
                            input.focus();
                          }
                        }
                      }}
                      onMouseDown={(e) => {
                        // 마우스 다운 시 텍스트 선택 방지
                        e.preventDefault();
                      }}
                    />
                  </div>
                </div>

                {/* 정렬 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('boothExperience.sort')}</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <select
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                      style={{
                        backgroundImage: 'none',
                        boxShadow: 'none'
                      }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="startTime" style={{ backgroundColor: 'white', color: '#374151', padding: '8px 12px' }}>{t('boothExperience.sortByTime')}</option>
                      <option value="congestionRate" style={{ backgroundColor: 'white', color: '#374151', padding: '8px 12px' }}>{t('boothExperience.sortByCongestion')}</option>
                      <option value="createdAt" style={{ backgroundColor: 'white', color: '#374151', padding: '8px 12px' }}>{t('boothExperience.sortByCreated')}</option>
                    </select>
                    {/* 커스텀 화살표 */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 예약 가능한 것만 보기 */}
                <div className="flex items-end">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availableOnly"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded appearance-none bg-white border-2 relative checked:bg-blue-600 checked:border-blue-600 checked:before:content-['✓'] checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-white checked:before:text-xs checked:before:font-bold"
                      checked={showAvailableOnly}
                      onChange={(e) => setShowAvailableOnly(e.target.checked)}
                    />
                    <label htmlFor="availableOnly" className="ml-2 text-sm text-gray-700">
                      {t('boothExperience.availableOnly')}
                    </label>
                  </div>
                </div>

                {/* 참가 신청한 행사만 보기 */}
                <div className="flex items-end">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="registeredEventsOnly"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded appearance-none bg-white border-2 relative checked:bg-blue-600 checked:border-blue-600 checked:before:content-['✓'] checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-white checked:before:text-xs checked:before:font-bold"
                      checked={showOnlyRegisteredEvents}
                      onChange={(e) => setShowOnlyRegisteredEvents(e.target.checked)}
                    />
                    <label htmlFor="registeredEventsOnly" className="ml-2 text-sm text-gray-700">
                      {t('boothExperience.registeredEventsOnly')}
                    </label>
                  </div>
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
                    {t('common.total')} <span className="font-semibold text-blue-600">{filteredExperiences.length}</span>{t('boothExperience.totalExperiences')}
                  </p>
                </div>

                {/* 체험 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExperiences.map((experience) => (
                    <div
                      key={experience.experienceId}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                      onClick={() => handleExperienceClick(experience.experienceId)}
                    >
                      {/* 카드 헤더 */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {experience.title}
                          </h3>
                          <span className={`text-sm font-medium ${getCongestionColor(experience.congestionRate)}`}>
                            {getCongestionText(experience.congestionRate)}
                          </span>
                        </div>

                        {/* 행사명 */}
                        {experience.eventName && (
                          <div className="flex items-center text-blue-600 mb-2">
                            <span className="text-xs font-medium bg-blue-100 px-2 py-1 rounded-full">
                              🎪 {experience.eventName}
                            </span>
                          </div>
                        )}

                        {/* 부스명 */}
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{experience.boothName}</span>
                        </div>

                        {/* 체험 정보 */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {new Date(experience.experienceDate).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {formatTime(experience.startTime)} - {formatTime(experience.endTime)}
                              <span className="ml-1">({experience.durationMinutes}{t('boothExperience.minutes')})</span>
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {experience.currentParticipants}/{experience.maxCapacity}{t('boothExperience.participants')}
                              {experience.waitingCount > 0 && (
                                <span className="ml-1 text-orange-600">
                                  ({t('boothExperience.waiting')} {experience.waitingCount}{t('boothExperience.participants')})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* 설명 */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {experience.description}
                        </p>

                        {/* 예약 상태 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${experience.isReservationAvailable ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                            <span className={`text-sm font-medium ${experience.isReservationAvailable ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {experience.isReservationAvailable ? t('boothExperience.reservationAvailable') : t('boothExperience.reservationUnavailable')}
                            </span>
                          </div>

                          {/* 혼잡도 바 */}
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${experience.congestionRate >= 90 ? 'bg-red-500' :
                                  experience.congestionRate >= 70 ? 'bg-orange-500' :
                                    experience.congestionRate >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                              style={{ width: `${Math.min(experience.congestionRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 결과 없음 */}
                {filteredExperiences.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                      <Search className="w-12 h-12 mx-auto mb-2" />
                      {userRegisteredEvents.length === 0 ? (
                        <div>
                          <p className="mb-2">{t('boothExperience.noRegisteredEvents')}</p>
                          <p className="text-sm">{t('boothExperience.noRegisteredEventsDesc')}</p>
                        </div>
                      ) : (
                        <p>{t('boothExperience.noExperiences')}</p>
                      )}
                    </div>
                    {userRegisteredEvents.length > 0 && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStartDate('');
                          setEndDate('');
                          setShowAvailableOnly(false);
                          setSelectedEventId('ALL');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {t('boothExperience.resetFilters')}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 체험 예약 모달 */}
          {selectedExperienceId && (
            <BoothExperienceReservationModal
              experienceId={selectedExperienceId}
              onClose={handleCloseModal}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default BoothExperienceList;