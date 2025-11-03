import React, { useState, useEffect } from 'react';
import { TopNav } from '../../components/TopNav';
import { HostSideNav } from '../../components/HostSideNav';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../api/axios';

// 광고 신청 상태 타입
type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "ACTIVE";

// 배너 타입
type BannerType = "HERO" | "SEARCH_TOP";

// 광고 신청 아이템 인터페이스
interface ApplicationItem {
  date: string;
  priority: number;
  price: number;
}

// 광고 신청 상세 정보 인터페이스
interface AdvertisementApplication {
  id: number;
  eventId: number;
  eventTitle: string;
  bannerType: BannerType;
  title: string;
  imageUrl: string | null;
  linkUrl: string | null;
  status: ApplicationStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: ApplicationItem[];
  rejectionReason?: string;
}

// 상태별 스타일 클래스
const getStatusClass = (status: ApplicationStatus): string => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    case "EXPIRED":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "ACTIVE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// 상태별 한글명
const getStatusText = (status: ApplicationStatus): string => {
  switch (status) {
    case "PENDING":
      return "승인 대기";
    case "APPROVED":
      return "승인됨";
    case "REJECTED":
      return "거부됨";
    case "EXPIRED":
      return "만료됨";
    case "ACTIVE":
      return "활성";
    default:
      return "알 수 없음";
  }
};

// 배너 타입별 한글명
const getBannerTypeText = (type: BannerType): string => {
  switch (type) {
    case "HERO":
      return "메인 배너";
    case "SEARCH_TOP":
      return "검색 상단 고정 (MD PICK)";
    default:
      return type;
  }
};

const AdvertisementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AdvertisementApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<AdvertisementApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | ApplicationStatus>('ALL');

  // 광고 신청 목록 조회
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/banner/applications/my');
      setApplications(response.data);
    } catch (error) {
      console.error('광고 신청 목록 조회 실패:', error);
      // 빈 배열로 설정하여 UI가 깨지지 않도록 함
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // 필터링된 신청 목록
  const filteredApplications = applications.filter(app => 
    filter === 'ALL' || app.status === filter
  );

  // 상세 모달 열기
  const openDetailModal = (application: AdvertisementApplication) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  // 상세 모달 닫기
  const closeDetailModal = () => {
    setSelectedApplication(null);
    setShowDetailModal(false);
  };

  if (loading) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white w-[1256px] min-h-screen relative">
          <TopNav />
          <HostSideNav className="!absolute !left-0 !top-[117px]" />
          <div className="absolute left-64 top-[220px] w-[949px] flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">광고 신청 이력을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1256px] min-h-screen relative">
        <TopNav />

        {/* 페이지 제목 */}
        <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
          광고 관리 대시보드
        </div>

        {/* 사이드바 */}
        <HostSideNav className="!absolute !left-0 !top-[117px]" />

        {/* 메인 콘텐츠 */}
        <div className="absolute left-64 top-[195px] w-[949px] pb-20">
          <div className="space-y-6">
            {/* 상단 액션 바 */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {/* 상태 필터 */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'ALL' | ApplicationStatus)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">전체</option>
                  <option value="PENDING">승인 대기</option>
                  <option value="APPROVED">승인됨</option>
                  <option value="REJECTED">거부됨</option>
                  <option value="ACTIVE">활성</option>
                  <option value="EXPIRED">만료됨</option>
                </select>
              </div>
              
              <button
                onClick={() => navigate('/host/advertisement-application')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                새 광고 신청
              </button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {applications.length}
                  </div>
                  <div className="text-sm text-blue-800">총 신청 건수</div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {applications.filter(app => app.status === 'PENDING').length}
                  </div>
                  <div className="text-sm text-yellow-800">승인 대기</div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {applications.filter(app => app.status === 'APPROVED' || app.status === 'ACTIVE').length}
                  </div>
                  <div className="text-sm text-green-800">승인/활성</div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {applications.reduce((sum, app) => sum + (app.totalAmount || 0), 0).toLocaleString()}원
                  </div>
                  <div className="text-sm text-purple-800">총 광고비</div>
                </div>
              </div>
            </div>

            {/* 신청 목록 */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">광고 신청 이력</h3>
              </div>
              
              {filteredApplications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {filter === 'ALL' ? '광고 신청 이력이 없습니다.' : `${getStatusText(filter as ApplicationStatus)} 상태의 신청이 없습니다.`}
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/host/advertisement-application')}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      첫 광고 신청하기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {application.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusClass(application.status)}`}>
                              {getStatusText(application.status)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{getBannerTypeText(application.bannerType)}</span>
                            <span>•</span>
                            <span>행사: {application.eventTitle}</span>
                            <span>•</span>
                            <span>신청일: {dayjs(application.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {application.totalAmount?.toLocaleString()}원
                          </div>
                        </div>
                      </div>
                      
                      {/* 광고 아이템 요약 */}
                      <div className="mb-3">
                        <div className="text-sm text-gray-600">
                          광고 기간: {application.items.length > 0 && 
                            application.items.length === 1 
                              ? application.items[0].date
                              : application.items.length > 0
                                ? `${application.items[0].date} ~ ${application.items[application.items.length - 1].date}`
                                : '정보 없음'
                          }
                        </div>
                      </div>
                      
                      {/* 거부 사유 표시 */}
                      {application.status === 'REJECTED' && application.rejectionReason && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-sm text-red-800">
                            <strong>거부 사유:</strong> {application.rejectionReason}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <button
                          onClick={() => openDetailModal(application)}
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                        >
                          상세 보기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 상세 정보 모달 */}
        {showDetailModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">광고 신청 상세 정보</h3>
                  <button
                    onClick={closeDetailModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">광고 제목</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">배너 타입</label>
                      <p className="mt-1 text-sm text-gray-900">{getBannerTypeText(selectedApplication.bannerType)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">행사명</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.eventTitle}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">상태</label>
                      <span className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded border ${getStatusClass(selectedApplication.status)}`}>
                        {getStatusText(selectedApplication.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">신청일</label>
                      <p className="mt-1 text-sm text-gray-900">{dayjs(selectedApplication.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">마지막 수정일</label>
                      <p className="mt-1 text-sm text-gray-900">{dayjs(selectedApplication.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
                    </div>
                  </div>
                </div>

                {/* 광고 이미지 */}
                {selectedApplication.imageUrl && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">광고 이미지</h4>
                    <img
                      src={selectedApplication.imageUrl}
                      alt="광고 이미지"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* 광고 상세 아이템 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">광고 상세 내역</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            날짜
                          </th>
                          {selectedApplication.bannerType !== 'SEARCH_TOP' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              순위
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            금액
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedApplication.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.date}
                            </td>
                            {selectedApplication.bannerType !== 'SEARCH_TOP' && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.priority}순위
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.price?.toLocaleString()}원
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className={`px-6 py-3 text-sm font-medium text-gray-900 ${selectedApplication.bannerType !== 'SEARCH_TOP' ? 'colspan-2' : ''}`}>
                            총액
                          </td>
                          <td className="px-6 py-3 text-sm font-bold text-green-600">
                            {selectedApplication.totalAmount?.toLocaleString()}원
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* 거부 사유 */}
                {selectedApplication.status === 'REJECTED' && selectedApplication.rejectionReason && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">거부 사유</h4>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{selectedApplication.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* 링크 URL */}
                {selectedApplication.linkUrl && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">연결 URL</h4>
                    <p className="text-sm text-blue-600 break-all">
                      <a href={selectedApplication.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {selectedApplication.linkUrl}
                      </a>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={closeDetailModal}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertisementDashboard;