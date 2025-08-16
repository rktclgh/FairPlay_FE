import React, { useState } from 'react';
import { TopNav } from '../../components/TopNav';
import { AdminSideNav } from '../../components/AdminSideNav';

interface AdvertisementApplication {
  id: string;
  hostName: string;
  eventTitle: string;
  type: 'mainBanner' | 'searchTop';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  requestedDates: string[];
  totalAmount: number;
  imageUrl?: string;
  paymentStatus?: 'pending' | 'completed' | 'canceled';
  exposurePeriod?: {
    startDate: string;
    endDate: string;
  };
}

const AdvertisementApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<AdvertisementApplication[]>([
    {
      id: '1',
      hostName: 'YG Entertainment',
      eventTitle: 'G-DRAGON 2025 WORLD TOUR IN JAPAN',
      type: 'mainBanner',
      status: 'pending',
      submittedAt: '2024-03-15',
      requestedDates: ['2025-05-20', '2025-05-21', '2025-05-22', '2025-05-23', '2025-05-24', '2025-05-25'],
      totalAmount: 4500000,
      imageUrl: '/images/gd1.png',
      paymentStatus: 'pending',
      exposurePeriod: {
        startDate: '2025-05-20',
        endDate: '2025-05-25'
      }
    },
    {
      id: '2',
      hostName: 'Def Jam Recordings',
      eventTitle: 'YE LIVE IN KOREA',
      type: 'mainBanner',
      status: 'approved',
      submittedAt: '2024-03-10',
      requestedDates: ['2025-06-10', '2025-06-11', '2025-06-12', '2025-06-13', '2025-06-14', '2025-06-15'],
      totalAmount: 3800000,
      imageUrl: '/images/YE3.png',
      paymentStatus: 'completed',
      exposurePeriod: {
        startDate: '2025-06-10',
        endDate: '2025-06-15'
      }
    },
    {
      id: '3',
      hostName: 'Republic Records',
      eventTitle: 'Post Malone Concert',
      type: 'mainBanner',
      status: 'pending',
      submittedAt: '2024-03-08',
      requestedDates: ['2025-07-15', '2025-07-16', '2025-07-17', '2025-07-18', '2025-07-19', '2025-07-20'],
      totalAmount: 3200000,
      imageUrl: '/images/malone1.jpg',
      paymentStatus: 'pending',
      exposurePeriod: {
        startDate: '2025-07-15',
        endDate: '2025-07-20'
      }
    },
    {
      id: '4',
      hostName: 'JYP Entertainment',
      eventTitle: 'Event 4',
      type: 'mainBanner',
      status: 'approved',
      submittedAt: '2024-03-12',
      requestedDates: ['2025-08-05', '2025-08-06', '2025-08-07', '2025-08-08', '2025-08-09', '2025-08-10'],
      totalAmount: 2800000,
      imageUrl: '/images/therose2.png',
      paymentStatus: 'pending',
      exposurePeriod: {
        startDate: '2025-08-05',
        endDate: '2025-08-10'
      }
    },
    {
      id: '5',
      hostName: 'SM Entertainment',
      eventTitle: 'Event 5',
      type: 'mainBanner',
      status: 'rejected',
      submittedAt: '2024-03-05',
      requestedDates: ['2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05'],
      totalAmount: 2500000,
      imageUrl: '/images/eaj2.jpg',
      paymentStatus: 'canceled',
      exposurePeriod: {
        startDate: '2025-09-01',
        endDate: '2025-09-05'
      }
    },
    {
      id: '6',
      hostName: 'Cyber Entertainment',
      eventTitle: 'Event 6',
      type: 'mainBanner',
      status: 'pending',
      submittedAt: '2024-03-18',
      requestedDates: ['2025-10-10', '2025-10-11', '2025-10-12', '2025-10-13', '2025-10-14', '2025-10-15'],
      totalAmount: 2200000,
      imageUrl: '/images/cyber2.png',
      paymentStatus: 'pending',
      exposurePeriod: {
        startDate: '2025-10-10',
        endDate: '2025-10-15'
      }
    },
    {
      id: '7',
      hostName: 'Netflix Korea',
      eventTitle: 'Netflix Original Series Festival',
      type: 'searchTop',
      status: 'pending',
      submittedAt: '2024-03-22',
      requestedDates: ['2025-04-01', '2025-04-02', '2025-04-03', '2025-04-04', '2025-04-05'],
      totalAmount: 1800000,
      imageUrl: '/images/ex2.png',
      paymentStatus: 'pending',
      exposurePeriod: {
        startDate: '2025-04-01',
        endDate: '2025-04-05'
      }
    },
    {
      id: '8',
      hostName: 'Disney+ Korea',
      eventTitle: 'Disney+ Content Showcase',
      type: 'searchTop',
      status: 'approved',
      submittedAt: '2024-03-14',
      requestedDates: ['2025-05-01', '2025-05-02', '2025-05-03'],
      totalAmount: 1200000,
      imageUrl: '/images/ex2.png',
      paymentStatus: 'completed',
      exposurePeriod: {
        startDate: '2025-05-01',
        endDate: '2025-05-03'
      }
    },
    {
      id: '9',
      hostName: 'Apple Music',
      eventTitle: 'Apple Music Festival 2025',
      type: 'searchTop',
      status: 'pending',
      submittedAt: '2024-03-25',
      requestedDates: ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04'],
      totalAmount: 1600000,
      imageUrl: '/images/ex2.png',
      paymentStatus: 'pending',
      exposurePeriod: {
        startDate: '2025-06-01',
        endDate: '2025-06-04'
      }
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">대기</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">승인</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">반려</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">알 수 없음</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mainBanner':
        return '메인 배너';
      case 'searchTop':
        return '검색창 상단 노출';
      default:
        return '알 수 없음';
    }
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus) return null;
    
    switch (paymentStatus) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">대기</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">결제완료</span>;
      case 'canceled':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">취소</span>;
      default:
        return null;
    }
  };

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected') => {
    setApplications(prev => 
      prev.map(app => 
        app.id === id 
          ? { ...app, status: newStatus, paymentStatus: newStatus === 'approved' ? 'pending' : 'canceled' }
          : app
      )
    );
  };

  // 결제 완료 처리 버튼 제거에 따라 별도 처리 함수 불필요

  const handleImageCheck = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    if (filterType !== 'all' && app.type !== filterType) return false;
    return true;
  });

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1256px] min-h-screen relative">
        <TopNav />
        <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
          광고 신청 목록
        </div>
        <AdminSideNav className="!absolute !left-0 !top-[117px]" />
        
        <div className="absolute left-64 top-[195px] w-[949px] pb-20">
          {/* 필터 섹션 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  <option value="pending">대기</option>
                  <option value="approved">승인</option>
                  <option value="rejected">반려</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">광고 타입</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  <option value="mainBanner">메인 배너</option>
                  <option value="searchTop">검색창 상단 노출</option>
                </select>
              </div>
            </div>
          </div>

          {/* 광고 신청 목록 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                총 {filteredApplications.length}건의 광고 신청
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <div key={application.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* 정보 섹션 */}
                    <div className="flex-1 space-y-3">
                      {/* 기본 정보 */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {/* 1행: 호스트명 / 행사명 */}
                        <div>
                          <p className="text-xs text-gray-500">호스트명</p>
                          <p className="text-sm font-medium text-gray-900">{application.hostName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">행사명</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{application.eventTitle}</p>
                        </div>

                        {/* 2행: 광고 타입 / 신청된 날짜 */}
                        <div>
                          <p className="text-xs text-gray-500">광고 타입</p>
                          <p className="text-sm font-medium text-gray-900">{getTypeLabel(application.type)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">신청된 날짜</p>
                          <p className="text-sm font-medium text-gray-900">{application.submittedAt}</p>
                        </div>

                        {/* 3행: 상태 / 결제 상태 */}
                        <div>
                          <p className="text-xs text-gray-500">상태</p>
                          <div className="mt-1">{getStatusBadge(application.status)}</div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">결제 상태</p>
                          <div className="mt-1">
                            {getPaymentStatusBadge(application.paymentStatus || (application.status === 'rejected' ? 'canceled' : 'pending'))}
                          </div>
                        </div>

                        {/* 4행: 노출 / 총 금액 */}
                        <div>
                          <p className="text-xs text-gray-500">노출</p>
                          <p className="text-sm font-medium text-gray-900">
                            {application.exposurePeriod
                              ? (application.type === 'mainBanner'
                                  ? `${application.exposurePeriod.startDate} 00:00 ~ 23:59`
                                  : `${application.exposurePeriod.startDate} ~ ${application.exposurePeriod.endDate}`)
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">총 금액</p>
                          <p className="text-sm font-medium text-gray-900">{application.totalAmount.toLocaleString()}원</p>
                        </div>
                      </div>

                      {/* 메인 배너 이미지 확인 버튼 */}
                      {application.type === 'mainBanner' && application.imageUrl && (
                        <div>
                          <button
                            onClick={() => handleImageCheck(application.imageUrl!)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            배너 이미지 확인
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="w-40 flex-shrink-0 flex flex-col gap-3 min-h-[86px]">
                      {/* 슬롯 1 */}
                      {application.status === 'pending' ? (
                        <button
                          onClick={() => handleStatusChange(application.id, 'approved')}
                          className="block w-auto px-3 py-1.5 border border-green-500 text-green-600 text-xs font-medium rounded-[10px] hover:bg-green-50 transition-colors whitespace-nowrap self-start focus:outline-none"
                        >
                          승인
                        </button>
                      ) : (
                        <button className="block w-auto px-3 py-1.5 border border-transparent text-transparent text-xs font-medium rounded-[10px] invisible focus:outline-none">
                          placeholder
                        </button>
                      )}

                      {/* 슬롯 2 */}
                      {application.status === 'pending' ? (
                        <button
                          onClick={() => handleStatusChange(application.id, 'rejected')}
                          className="block w-auto px-3 py-1.5 border border-red-500 text-red-600 text-xs font-medium rounded-[10px] hover:bg-red-50 transition-colors whitespace-nowrap self-start focus:outline-none"
                        >
                          반려
                        </button>
                      ) : (
                        <button className="block w-auto px-3 py-1.5 border border-transparent text-transparent text-xs font-medium rounded-[10px] invisible focus:outline-none">
                          placeholder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 이미지 확인 모달 */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="배너 이미지"
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementApplicationList;
