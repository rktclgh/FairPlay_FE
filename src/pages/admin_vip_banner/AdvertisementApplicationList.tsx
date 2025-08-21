import React, {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
//import axios, { AxiosError } from 'axios';
import {TopNav} from '../../components/TopNav';
import {AdminSideNav} from '../../components/AdminSideNav';
import authManager from "../../utils/auth";

// ---- Backend response types ----
type BackendApplyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type BackendBannerType = 'HERO' | 'SEARCH_TOP';
type BackendPayment = 'WAITING' | 'PAID' | 'REFUND_PENDING' | 'REFUNDED' | 'N/A';

interface BackendSlot {
    slotDate: string;
    priority: number;
    price: number
}

interface BackendApplicationItem {
    applicationId: number | string;
    hostName?: string;
    eventId?: number;
    eventName?: string;
    bannerType: BackendBannerType;
    appliedAt: string;
    applyStatus: BackendApplyStatus;
    paymentStatus?: BackendPayment;
    imageUrl?: string;
    totalAmount: number;
    slots?: BackendSlot[];
}

interface BackendPage<T> {
    content: T[]
}  // 필요한 필드만 최소 정의
type BackendListResponse<T> = BackendPage<T> | T[];
const isPage = <T, >(d: unknown): d is BackendPage<T> => {
    if (typeof d !== 'object' || d === null) return false;
    const maybe = d as { content?: unknown };
    return Array.isArray(maybe.content);
};

interface AdvertisementApplication {
    id: string;
    hostName: string;
    eventTitle: string;                         // eventName
    type: 'mainBanner' | 'searchTop';           // HERO | SEARCH_TOP
    status: 'pending' | 'approved' | 'rejected';// PENDING | APPROVED | REJECTED
    submittedAt: string;                        // appliedAt(yyyy-MM-ddTHH:mm:ss)
    requestedDates: string[];                   // slots[].slotDate
    totalAmount: number;                        // server totalAmount
    imageUrl?: string;                          // imageUrl
    paymentStatus?: 'pending' | 'completed' | 'canceled'; // WAITING/PAID/N/A -> mapped
    exposurePeriod?: { startDate: string; endDate: string };
    mainBannerRanks?: string[];                 // optional (표시용)
    mainBannerSelections?: { date: string; rank: string }[];
    eventId?: number;
}


const AdvertisementApplicationList: React.FC = () => {

    const [applications, setApplications] = useState<AdvertisementApplication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


//백엔드 베이스 URL & 토큰
    const BASE_URL = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? 'https://fair-play.ink', []);
    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        return token ? {Authorization: `Bearer ${token}`} : {};
    };

    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);


    // ------------ 매핑 유틸 ------------
    const toFrontType = (bannerType: string): 'mainBanner' | 'searchTop' =>
        bannerType === 'HERO' ? 'mainBanner' : 'searchTop';

    const toFrontStatus = (applyStatus: string): 'pending' | 'approved' | 'rejected' => {
        if (applyStatus === 'APPROVED') return 'approved';
        if (applyStatus === 'REJECTED') return 'rejected';
        return 'pending';
    };

    const paymentToFront = (paymentStatus?: string): 'pending' | 'completed' | 'canceled' => {
        if (paymentStatus === 'PAID' || paymentStatus === 'REFUNDED') return 'completed';
        if (paymentStatus === 'N/A') return 'canceled';
        return 'pending';
    };

    const rankLabel = (priority: number) => `${priority}순위`;

    const mapBackendItem = (row: BackendApplicationItem): AdvertisementApplication => {
        // row: 서버 목록의 1개 item (content[])
        const slots: BackendSlot[] = Array.isArray(row.slots) ? [...row.slots] : [];
        // 안전하게 날짜/우선순위 정렬
        slots.sort((a, b) => a.slotDate.localeCompare(b.slotDate) || a.priority - b.priority);
        const requestedDates = slots.map(s => s.slotDate);
        const mainBannerSelections = slots.map(s => ({date: s.slotDate, rank: rankLabel(s.priority)}));

        const exposurePeriod =
            requestedDates.length > 0
                ? {startDate: requestedDates[0], endDate: requestedDates[requestedDates.length - 1]}
                : undefined;
        return {
            id: String(row.applicationId),
            hostName: row.hostName ?? '',
            eventTitle: row.eventName ?? '',
            type: toFrontType(row.bannerType),
            status: toFrontStatus(row.applyStatus),
            submittedAt: (row.appliedAt || '').split('T')[0] || '',
            requestedDates,
            totalAmount: row.totalAmount ?? 0,
            imageUrl: row.imageUrl ?? undefined,
            paymentStatus: paymentToFront(row.paymentStatus),
            exposurePeriod,
            mainBannerRanks: [...new Set(mainBannerSelections.map(s => s.rank))],
            mainBannerSelections,
            eventId: row.eventId ?? undefined
        };
    };

    // ------------ 목록 불러오기 ------------
    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = {};
            if (filterStatus !== 'all') params.status = filterStatus.toUpperCase(); // PENDING/APPROVED/REJECTED
            if (filterType !== 'all') params.type = filterType === 'mainBanner' ? 'HERO' : 'SEARCH_TOP';
            params.page = '0';
            params.size = '100';
            const res = await axios.get<BackendListResponse<BackendApplicationItem>>(`/api/admin/banners/applications`, {
                params,
                headers: {...getAuthHeaders()}
            });
            console.log(res.data);
            const content: BackendApplicationItem[] =
                isPage<BackendApplicationItem>(res.data) ? res.data.content
                    : Array.isArray(res.data) ? res.data
                        : [];
            const mapped = content.map(mapBackendItem);
            setApplications(mapped);
        } catch (e: unknown) {
            if (axios.isAxiosError<{ message?: string }>(e)) {
                const apiMsg = e.response?.data?.message ?? e.message;
                setError(apiMsg || '목록 조회 실패');
            } else {
                setError('목록 조회 실패');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, filterType]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span
                    className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">대기</span>;
            case 'approved':
                return <span
                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">승인</span>;
            case 'rejected':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">반려</span>;
            default:
                return <span
                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">알 수 없음</span>;
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
                return <span
                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">결제완료</span>;
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
            case 1:
                return 2500000;
            case 2:
                return 2200000;
            case 3:
                return 2000000;
            case 4:
                return 1800000;
            case 5:
                return 1600000;
            case 6:
                return 1400000;
            case 7:
                return 1200000;
            case 8:
                return 1000000;
            case 9:
                return 800000;
            case 10:
                return 600000;
            default:
                return 600000;
        }
    };


    // 메인 배너 총액 계산 (선택 매핑)
    const calculateMainBannerTotalFromSelections = (selections: { date: string; rank: string }[]) => {
        return selections.reduce((total, sel) => total + getMainBannerPrice(sel.rank), 0);
    };


    // 승인/반려 → 백엔드 호출
    const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
        // 상태에 따른 확인창 표시
        const confirmMessage = newStatus === 'approved'
            ? '승인하시겠습니까?\n\n승인 시 신청자에게 결제 링크가 포함된 이메일이 발송됩니다.'
            : '거부하시겠습니까?\n\n거부 시 신청자에게 반려 알림이 발송됩니다.';

        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) {
            return; // 사용자가 취소를 선택한 경우 함수 종료
        }

        try {
            if (newStatus === 'approved') {
                console.log('승인 API 호출 시작:', {
                    url: `/api/admin/banners/applications/${id}/approve`,
                    id,
                    headers: getAuthHeaders()
                });

                const res = await axios.post(
                    `/api/admin/banners/applications/${id}/approve`,
                    {note: 'approved from admin UI'},
                    {headers: {'Content-Type': 'application/json', ...getAuthHeaders()}}
                );

                console.log('승인 API 응답:', res.data);
                const updated = mapBackendItem(res.data);
                setApplications(prev => prev.map(a => (a.id === id ? updated : a)));

                // 승인 완료 알림
                alert('승인이 완료되었습니다.\n신청자에게 결제 링크가 포함된 이메일이 발송되었습니다.');
            } else {
                console.log('반려 API 호출 시작:', {
                    url: `/api/admin/banners/applications/${id}/reject`,
                    id,
                    headers: getAuthHeaders()
                });

                const reason = 'rejected from admin UI';
                const res = await axios.post(
                    `/api/admin/banners/applications/${id}/reject`,
                    {reason},
                    {headers: {'Content-Type': 'application/json', ...getAuthHeaders()}}
                );

                console.log('반려 API 응답:', res.data);
                const updated = mapBackendItem(res.data);
                setApplications(prev => prev.map(a => (a.id === id ? updated : a)));

                // 반려 완료 알림
                alert('반려가 완료되었습니다.\n신청자에게 반려 알림이 발송되었습니다.');
            }
        } catch (err: unknown) {
            console.error('API 호출 에러:', err);

            if (axios.isAxiosError<{ message?: string }>(err)) {
                const code = err.response?.status;
                const msg =
                    err.response?.data?.message ??
                    err.message ??
                    '처리 실패';

                console.error('Axios 에러 상세:', {
                    status: code,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                    url: err.config?.url,
                    method: err.config?.method
                });

                alert(code ? `[${code}] ${msg}` : msg);
            } else {
                console.error('알 수 없는 에러:', err);
                alert('처리 실패');
            }
        }
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
                <TopNav/>
                <div
                    className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    광고 신청 목록
                </div>
                <AdminSideNav className="!absolute !left-0 !top-[117px]"/>

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
                            <div className="ml-auto">
                                <button
                                    onClick={fetchApplications}
                                    className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                                >
                                    새로고침
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 광고 신청 목록 */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {loading ? '불러오는 중...' : `총 ${filteredApplications.length}건의 광고 신청`}
                            </h2>
                            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

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
                                                                <svg className="w-3 h-3 mr-1" fill="none"
                                                                     stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                                          strokeWidth={2}
                                                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                                          strokeWidth={2}
                                                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
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
                                                            <p className="text-xs text-gray-500">노출 날짜
                                                                ({application.requestedDates.length}일)</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {application.requestedDates.map((date, index) => (
                                                                    <span key={index}
                                                                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
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
                                                                        <p key={index}
                                                                           className="text-sm font-medium text-gray-900">{sel.date}</p>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-2">신청한 순위</p>
                                                                <div className="space-y-1">
                                                                    {application.mainBannerSelections.map((sel, index) => (
                                                                        <div key={index}
                                                                             className="flex items-center justify-between">
                                                                            <span
                                                                                className="text-sm font-medium text-blue-800">{sel.rank}</span>
                                                                            <span
                                                                                className="text-sm text-gray-600">({getMainBannerPrice(sel.rank).toLocaleString()}원)</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="pt-2 border-t border-blue-200">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium text-gray-700">총 금액:</span>
                                                                <span className="text-lg font-bold text-blue-600">
                                  {application.totalAmount.toLocaleString()}원
                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                        {/* 액션 버튼 - 우측 하단 */}
                                        <div
                                            className="w-40 flex-shrink-0 flex flex-col justify-end gap-3 min-h-[86px]">
                                            {/* 슬롯 1 */}
                                            {application.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleStatusChange(application.id, 'approved')}
                                                    className="block w-auto px-3 py-1.5 border border-green-500 text-green-600 text-xs font-medium rounded-[10px] hover:bg-green-50 transition-colors whitespace-nowrap self-start focus:outline-none"
                                                >
                                                    승인
                                                </button>
                                            ) : (
                                                <button
                                                    className="block w-auto px-3 py-1.5 border border-transparent text-transparent text-xs font-medium rounded-[10px] invisible focus:outline-none">
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
                                                <button
                                                    className="block w-auto px-3 py-1.5 border border-transparent text-transparent text-xs font-medium rounded-[10px] invisible focus:outline-none">
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
