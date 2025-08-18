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
  // 메인 배너 순위 정보 (기존)
  mainBannerRanks?: string[];
  // 메인 배너 날짜-순위 매핑 (신규)
  mainBannerSelections?: { date: string; rank: string }[];
  // 이벤트 연결 ID (검색 상단 고정 연결용)
  eventId?: number;
}

// 오늘 날짜 문자열 생성
const todayStr = new Date().toISOString().split('T')[0];

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
      },
      mainBannerRanks: ['1순위', '2순위', '3순위'],
      mainBannerSelections: [
        { date: '2025-05-20', rank: '1순위' },
        { date: '2025-05-21', rank: '2순위' },
        { date: '2025-05-22', rank: '3순위' },
      ],
      totalAmount: 6700000 // 1순위(2,500,000) + 2순위(2,200,000) + 3순위(2,000,000)
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
      },
      mainBannerRanks: ['1순위', '4순위', '5순위'],
      mainBannerSelections: [
        { date: '2025-06-10', rank: '1순위' },
        { date: '2025-06-11', rank: '4순위' },
        { date: '2025-06-12', rank: '5순위' },
      ],
      totalAmount: 5900000 // 1순위(2,500,000) + 4순위(1,800,000) + 5순위(1,600,000)
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
      },
      mainBannerRanks: ['2순위', '3순위', '6순위'],
      mainBannerSelections: [
        { date: '2025-07-15', rank: '2순위' },
        { date: '2025-07-16', rank: '3순위' },
        { date: '2025-07-17', rank: '6순위' },
      ],
      totalAmount: 5600000 // 2순위(2,200,000) + 3순위(2,000,000) + 6순위(1,400,000)
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
      },
      mainBannerRanks: ['7순위', '8순위', '9순위'],
      mainBannerSelections: [
        { date: '2025-08-05', rank: '7순위' },
        { date: '2025-08-06', rank: '8순위' },
        { date: '2025-08-07', rank: '9순위' },
      ],
      totalAmount: 3000000 // 7순위(1,200,000) + 8순위(1,000,000) + 9순위(800,000)
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
      },
      mainBannerRanks: ['10순위'],
      mainBannerSelections: [
        { date: '2025-09-01', rank: '10순위' },
      ],
      totalAmount: 600000 // 10순위(600,000)
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
      },
      mainBannerRanks: ['5순위', '6순위'],
      mainBannerSelections: [
        { date: '2025-10-10', rank: '5순위' },
        { date: '2025-10-11', rank: '6순위' },
      ],
      totalAmount: 3000000 // 5순위(1,600,000) + 6순위(1,400,000)
    },
    // 검색 상단 고정 (MD PICK) 더미 — 기존
    {
      id: '7',
      hostName: 'Netflix Korea',
      eventTitle: '테스트',
      type: 'searchTop',
      status: 'approved',
      submittedAt: '2024-03-22',
      requestedDates: [todayStr],
      totalAmount: 500000, // 1일 × 500,000원
      imageUrl: '/images/ex2.png',
      paymentStatus: 'completed',
      exposurePeriod: {
        startDate: todayStr,
        endDate: todayStr
      },
      eventId: undefined
    },
    {
      id: '8',
      hostName: 'Disney+ Korea',
      eventTitle: 'YE LIVE IN KOREA',
      type: 'searchTop',
      status: 'approved',
      submittedAt: '2024-03-14',
      requestedDates: [todayStr],
      totalAmount: 500000, // 1일 × 500,000원
      imageUrl: '/images/ex2.png',
      paymentStatus: 'completed',
      exposurePeriod: {
        startDate: todayStr,
        endDate: todayStr
      },
      eventId: undefined
    },
    {
      id: '9',
      hostName: 'Apple Music',
      eventTitle: 'Apple Music Festival 2025',
      type: 'searchTop',
      status: 'pending',
      submittedAt: '2025-03-25',
      requestedDates: ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04'],
      totalAmount: 2000000, // 4일 × 500,000원
      imageUrl: '/images/ex2.png',
      paymentStatus: 'pending',
      exposurePeriod: {
        startDate: '2025-06-01',
        endDate: '2025-06-04'
      }
    },
    {
      id: '10',
      hostName: 'FairPlay Lab',
      eventTitle: '테스트 MD PICK 더미',
      type: 'searchTop',
      status: 'pending',
      submittedAt: '2025-08-10',
      requestedDates: ['2025-08-18', '2025-08-19', '2025-08-20', '2025-08-21', '2025-08-22'],
      totalAmount: 2500000, // 5일 × 500,000원
      imageUrl: '/images/ex2.png',
      paymentStatus: 'pending',
      exposurePeriod: {
        startDate: '2025-08-18',
        endDate: '2025-08-22'
      },
      eventId: undefined
    }
  ]);

  // 호스트에서 임시 저장한 신청 데이터 병합 표시 (테스트/더미용)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('pendingAdApplications');
      if (!raw) return;
      const extra: AdvertisementApplication[] = JSON.parse(raw);
      if (Array.isArray(extra) && extra.length > 0) {
        setApplications(prev => [...extra, ...prev]);
        localStorage.removeItem('pendingAdApplications');
      }
    } catch (e) {
      console.error('임시 신청 병합 실패', e);
    }
  }, []);

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
        return '검색 상단 고정 (MD PICK)';
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

  // 메인 배너 순위별 금액 계산
  const getMainBannerPrice = (rank: string) => {
    const rankNumber = parseInt(rank.replace('순위', ''));
    switch (rankNumber) {
      case 1: return 2500000;
      case 2: return 2200000;
      case 3: return 2000000;
      case 4: return 1800000;
      case 5: return 1600000;
      case 6: return 1400000;
      case 7: return 1200000;
      case 8: return 1000000;
      case 9: return 800000;
      case 10: return 600000;
      default: return 600000;
    }
  };

  // 메인 배너 총액 계산 (순위 배열)
  const calculateMainBannerTotal = (ranks: string[]) => {
    return ranks.reduce((total, rank) => total + getMainBannerPrice(rank), 0);
  };
  // 메인 배너 총액 계산 (선택 매핑)
  const calculateMainBannerTotalFromSelections = (selections: { date: string; rank: string }[]) => {
    return selections.reduce((total, sel) => total + getMainBannerPrice(sel.rank), 0);
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
                  <option value="searchTop">검색 상단 고정 (MD PICK)</option>
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
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{application.eventTitle}</p>
                            {/* 메인 배너 이미지 확인 버튼 */}
                            {application.type === 'mainBanner' && application.imageUrl && (
                              <button
                                onClick={() => handleImageCheck(application.imageUrl!)}
                                className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded hover:bg-blue-100 transition-colors"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                이미지
                              </button>
                            )}
                          </div>
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

                      </div>

                      {/* MD PICK 상태 정보 (검색 상단 고정인 경우) */}
                      {application.type === 'searchTop' && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">전체 선택 기간</p>
                              <p className="text-sm font-medium text-gray-900">
                                {application.exposurePeriod
                                  ? `${application.exposurePeriod.startDate} ~ ${application.exposurePeriod.endDate}`
                                  : '-'
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">노출 날짜 ({application.requestedDates.length}일)</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {application.requestedDates.map((date, index) => (
                                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                    {date}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">총 금액:</span>
                                <span className="text-lg font-bold text-green-600">
                                  {application.totalAmount.toLocaleString()}원
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 메인 배너 순위 정보 */}
                      {application.type === 'mainBanner' && application.mainBannerSelections && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-2">노출 날짜</p>
                                <div className="space-y-1">
                                  {application.mainBannerSelections.map((sel, index) => (
                                    <p key={index} className="text-sm font-medium text-gray-900">{sel.date}</p>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-2">신청한 순위</p>
                                <div className="space-y-1">
                                  {application.mainBannerSelections.map((sel, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-blue-800">{sel.rank}</span>
                                      <span className="text-sm text-gray-600">({getMainBannerPrice(sel.rank).toLocaleString()}원)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-blue-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">총 금액:</span>
                                <span className="text-lg font-bold text-blue-600">
                                  {calculateMainBannerTotalFromSelections(application.mainBannerSelections).toLocaleString()}원
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* 액션 버튼 - 우측 하단 */}
                    <div className="w-40 flex-shrink-0 flex flex-col justify-end gap-3 min-h-[86px]">
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
