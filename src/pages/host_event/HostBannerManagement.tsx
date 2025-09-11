import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { toast } from "react-toastify";
import axios from "axios";

// axios 인스턴스 설정
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL ?? "https://fair-play.ink",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface BannerApplication {
  id: number;
  eventTitle: string;
  bannerType: string;
  bannerTypeName: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  applicationStatus: string;
  paymentStatus: string;
  combinedStatus: string;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  adminComment?: string;
  canCancel: boolean;
  canPay: boolean;
  paymentUrl?: string;
  slots: Array<{
    slotDate: string;
    priority: number;
    price: number;
  }>;
}

interface FilterState {
  status: string;
  bannerType: string;
  startDate: string;
  endDate: string;
}

export const HostBannerManagement = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<BannerApplication[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    bannerType: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchBannerApplications();
  }, [currentPage, filters]);

  const fetchBannerApplications = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage.toString(),
        size: "20",
        ...(filters.status && { status: filters.status }),
        ...(filters.bannerType && { bannerType: filters.bannerType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };
      
      const response = await api.get("/api/host/banner-management/applications", { params });

      setApplications(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("배너 신청 목록 로드 실패:", error);
      toast.error("배너 신청 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
    setCurrentPage(0);
  };

  const handlePayment = (application: BannerApplication) => {
    if (application.paymentUrl) {
      // 새 창에서 결제 페이지 열기
      window.open(application.paymentUrl, '_blank', 'width=800,height=600');
    } else {
      toast.error("결제 URL을 생성할 수 없습니다.");
    }
  };

  const handleCancel = async (applicationId: number) => {
    if (!confirm("정말로 이 배너 신청을 취소하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/host/banner-management/applications/${applicationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('배너 신청 취소에 실패했습니다.');
      }

      toast.success("배너 신청이 취소되었습니다.");
      fetchBannerApplications();
    } catch (error) {
      console.error("배너 신청 취소 실패:", error);
      toast.error("배너 신청 취소에 실패했습니다.");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      "승인 대기": "bg-yellow-100 text-yellow-800",
      "결제 대기": "bg-blue-100 text-blue-800", 
      "결제 완료": "bg-green-100 text-green-800",
      "반려됨": "bg-red-100 text-red-800",
      "결제 취소": "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white w-[1256px] min-h-screen relative">
          <TopNav />
          <HostSideNav className="!absolute !left-0 !top-[117px]" />
          <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
            <div className="text-lg text-gray-500">데이터를 불러오는 중...</div>
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
          배너 광고 관리
        </div>

        {/* 사이드바 */}
        <HostSideNav className="!absolute !left-0 !top-[117px]" />

        {/* 메인 콘텐츠 */}
        <div className="absolute left-64 top-[195px] w-[949px] pb-20">

          {/* 필터링 섹션 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">필터링</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 상태 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">전체</option>
                  <option value="PENDING">승인 대기</option>
                  <option value="PAYMENT_PENDING">결제 대기</option>
                  <option value="PAID">결제 완료</option>
                  <option value="REJECTED">반려됨</option>
                </select>
              </div>

              {/* 배너 타입 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">배너 타입</label>
                <select 
                  value={filters.bannerType} 
                  onChange={(e) => setFilters(prev => ({ ...prev, bannerType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">전체</option>
                  <option value="HERO">메인 히어로</option>
                  <option value="SEARCH_TOP">검색 상단</option>
                  <option value="HOT_PICK">HOT PICK</option>
                </select>
              </div>

              {/* 날짜 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 배너 신청 목록 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">배너 신청 내역</h3>
              <p className="text-sm text-gray-500 mt-1">총 {applications.length}개의 신청</p>
            </div>

            {applications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">신청한 배너가 없습니다.</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <div key={app.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{app.title}</h4>
                          {getStatusBadge(app.combinedStatus)}
                          <span className="text-sm text-gray-500">#{app.id}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <div>배너 타입: <span className="font-medium">{app.bannerTypeName}</span></div>
                          <div>신청일: {new Date(app.createdAt).toLocaleDateString()}</div>
                          <div>결제 금액: <span className="font-medium text-blue-600">{app.totalAmount.toLocaleString()}원</span></div>
                        </div>

                        {app.adminComment && (
                          <div className="bg-gray-50 rounded-md p-3 mb-3">
                            <div className="text-sm text-gray-600">
                              <strong>관리자 코멘트:</strong> {app.adminComment}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {app.canPay && (
                          <button
                            onClick={() => handlePayment(app)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            💳 결제하기
                          </button>
                        )}
                        
                        {app.canCancel && (
                          <button
                            onClick={() => handleCancel(app.id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                          >
                            취소
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 슬롯 정보 */}
                    {app.slots && app.slots.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">광고 일정</h5>
                        <div className="flex flex-wrap gap-2">
                          {app.slots.map((slot, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                              {new Date(slot.slotDate).toLocaleDateString()} (우선순위: {slot.priority})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    페이지 {currentPage + 1} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      다음
                    </button>
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