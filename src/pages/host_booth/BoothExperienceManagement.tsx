import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Calendar, Clock, Users, Edit, Eye, Trash2,
  Filter, RefreshCw, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import {
  getManageableExperiences,
  getExperienceDetail,
  deleteBoothExperience,
  formatTime
} from '../../services/boothExperienceService';
import { BoothExperience } from '../../services/types/boothExperienceType';
import { toast } from 'react-toastify';
import BoothExperienceFormModal from '../../components/booth/BoothExperienceFormModal';
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";

const BoothExperienceManagement: React.FC = () => {
  const [experiences, setExperiences] = useState<BoothExperience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<BoothExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<BoothExperience | null>(null);

  // 필터 상태
  const [searchTitle, setSearchTitle] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // 권한 기반으로 관리 가능한 모든 부스 체험을 조회

  useEffect(() => {
    loadExperiences();
  }, []);

  useEffect(() => {
    filterExperiences();
  }, [experiences, searchTitle, searchDate]);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await getManageableExperiences();
      setExperiences(data);
    } catch (error) {
      console.error('체험 목록 로딩 실패:', error);
      toast.error('체험 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterExperiences = () => {
    let filtered = [...experiences];

    // 체험명 및 부스명 검색
    if (searchTitle.trim()) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
        (exp.boothName && exp.boothName.toLowerCase().includes(searchTitle.toLowerCase()))
      );
    }

    // 체험일 검색
    if (searchDate) {
      filtered = filtered.filter(exp => exp.experienceDate === searchDate);
    }

    // 등록일시 기준 내림차순 정렬 (최신순)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredExperiences(filtered);
  };

  const handleAddExperience = () => {
    setEditingExperience(null);
    setShowFormModal(true);
  };

  // 체험 수정
  const handleEditExperience = async (experience: BoothExperience) => {
    try {
      // 최신 데이터를 백엔드에서 가져오기
      const latestData = await getExperienceDetail(experience.experienceId);
      setEditingExperience(latestData);
      setShowFormModal(true);
    } catch (error) {
      console.error('체험 정보 로딩 실패:', error);
      toast.error('체험 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleFormSubmitSuccess = () => {
    setShowFormModal(false);
    setEditingExperience(null);
    loadExperiences(); // 목록 새로고침
    toast.success(editingExperience ? '체험이 수정되었습니다.' : '체험이 추가되었습니다.');
  };

  const handleDeleteExperience = async (experienceId: number) => {
    if (!confirm('정말로 이 체험을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteBoothExperience(experienceId);
      toast.success('체험이 삭제되었습니다.');
      loadExperiences();
    } catch (error) {
      console.error('체험 삭제 실패:', error);
      toast.error('체험 삭제에 실패했습니다.');
    }
  };

  const resetFilters = () => {
    setSearchTitle('');
    setSearchDate('');
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
          체험 관리
        </div>

        {/* 사이드바 */}
        <HostSideNav className="!absolute !left-0 !top-[117px]" />

        {/* 메인 콘텐츠 */}
        <div className="absolute left-64 top-[195px] w-[949px] pb-20">
          {/* 헤더 */}
          <div className="mb-6">
            <p className="text-gray-600">부스에서 제공하는 체험들을 관리하세요</p>
          </div>

          {/* 필터 및 검색 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">검색 조건</h3>
            <div className="flex flex-col md:flex-row gap-4">
              {/* 체험명/부스명 검색 */}
              <div className="flex-1 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">체험명/부스명</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="체험명 또는 부스명으로 검색"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* 체험일 검색 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">체험일</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />
                </div>
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

            {/* 결과 개수 및 체험 추가 버튼 */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                총 <span className="font-semibold text-blue-600">{filteredExperiences.length}</span>개의 체험이 있습니다
              </div>
              <button
                onClick={handleAddExperience}
                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center font-medium text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                체험 추가
              </button>
            </div>
          </div>

          {/* 체험 목록 테이블 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredExperiences.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">체험이 없습니다</h3>
                <p className="text-gray-600 mb-4">
                  {searchTitle || searchDate ? '검색 조건에 맞는 체험이 없습니다.' : '첫 번째 체험을 추가해보세요.'}
                </p>
                {searchTitle || searchDate ? (
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    필터 초기화
                  </button>
                ) : (
                  <button
                    onClick={handleAddExperience}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    체험 추가하기
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        체험 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        일정
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        운영 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        등록일시
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExperiences.map((experience) => (
                      <tr key={experience.experienceId} className="hover:bg-gray-50">
                        {/* 체험 정보 */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {experience.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {experience.description}
                            </div>
                            {experience.boothName && (
                              <div className="text-xs text-blue-600 flex items-center">
                                <span className="bg-blue-100 px-2 py-1 rounded-full">
                                  🏪 {experience.boothName}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 일정 */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                              {new Date(experience.experienceDate).toLocaleDateString('ko-KR')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              {formatTime(experience.startTime)} - {formatTime(experience.endTime)}
                            </div>
                          </div>
                        </td>

                        {/* 운영 정보 */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="mb-1">
                              소요시간: <span className="font-medium">{experience.durationMinutes}분</span>
                            </div>
                            <div className="mb-1">
                              동시참여: <span className="font-medium">{experience.maxCapacity}명</span>
                            </div>
                            <div>
                              대기제한: <span className="font-medium">{experience.maxWaitingCount}명</span>
                            </div>
                          </div>
                        </td>

                        {/* 상태 */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {experience.isReservationEnabled ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 mr-2" />
                            )}
                            <span className={`text-sm font-medium ${experience.isReservationEnabled ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {experience.isReservationEnabled ? '예약 활성' : '예약 비활성'}
                            </span>
                          </div>
                        </td>

                        {/* 등록일시 */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(experience.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(experience.createdAt).toLocaleTimeString('ko-KR')}
                          </div>
                        </td>

                        {/* 작업 버튼 */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditExperience(experience)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="수정"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExperience(experience.experienceId)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 체험 추가/수정 모달 */}
      {showFormModal && (
        <BoothExperienceFormModal
          boothId={editingExperience ? editingExperience.boothId : undefined}
          experience={editingExperience}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSubmitSuccess}
        />
      )}
    </div>
  );
};

export default BoothExperienceManagement;