import { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { useParams, useNavigate } from "react-router-dom";
import { getBoothApplicationDetails, updateApplicationStatus, updatePaymentStatus } from "../../api/boothApi";
import { BoothApplication, BoothApplicationStatusUpdate, BoothPaymentStatusUpdate } from "../../types/booth";

export const BoothApplicationDetail = () => {
    const { eventId, applicationId } = useParams<{ eventId: string; applicationId: string }>();
    const navigate = useNavigate();

    const [applicationDetail, setApplicationDetail] = useState<BoothApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [adminComment, setAdminComment] = useState("");

    // 백엔드에서 데이터 로드
    useEffect(() => {
        if (eventId && applicationId) {
            setLoading(true);
            getBoothApplicationDetails(Number(eventId), Number(applicationId))
                .then(data => {
                    setApplicationDetail(data);
                    setAdminComment(data.adminComment || "");
                    setLoading(false);
                })
                .catch(err => {
                    setError('부스 신청 상세 정보를 불러오는 데 실패했습니다.');
                    setLoading(false);
                    console.error(err);
                });
        }
    }, [eventId, applicationId]);

    // 상태에 따른 색상 반환
    const getStatusColors = (statusCode: string) => {
        switch (statusCode) {
            case 'APPROVED':
                return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
            case 'REJECTED':
                return { bg: 'bg-red-100', text: 'text-red-800' };
            case 'PENDING':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };

    const getPaymentStatusColors = (paymentStatus: string) => {
        switch (paymentStatus) {
            case 'PAID':
            case '결제완료':
            case '결제 완료':
                return { bg: 'bg-green-100', text: 'text-green-800' };
            case 'CANCELLED':
            case '결제취소':
            case '결제 취소':
            case '부스 신청 취소':
                return { bg: 'bg-red-100', text: 'text-red-800' };
            case 'PENDING':
            case '결제대기':
            case '결제 대기':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
            case 'UNPAID':
            case '미결제':
                return { bg: 'bg-gray-100', text: 'text-gray-800' };
            case 'REFUNDED':
            case '환불완료':
                return { bg: 'bg-purple-100', text: 'text-purple-800' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };

    // 상태 업데이트 함수
    const handleStatusUpdate = async (status: 'APPROVED' | 'REJECTED') => {
        if (!eventId || !applicationId) return;
        
        setUpdating(true);
        try {
            const updateData: BoothApplicationStatusUpdate = {
                statusCode: status,
                adminComment: adminComment
            };
            
            await updateApplicationStatus(Number(eventId), Number(applicationId), updateData);
            
            // 데이터 다시 로드
            const updatedData = await getBoothApplicationDetails(Number(eventId), Number(applicationId));
            setApplicationDetail(updatedData);
            
            alert(`신청이 ${status === 'APPROVED' ? '승인' : '반려'}되었습니다.`);
        } catch (err) {
            console.error(err);
            alert('상태 업데이트에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 결제 상태 업데이트 함수
    const handlePaymentStatusUpdate = async (paymentStatus: 'PAID' | 'CANCELLED' | 'PENDING') => {
        if (!eventId || !applicationId) return;
        
        setUpdating(true);
        try {
            const updateData: BoothPaymentStatusUpdate = {
                paymentStatus
            };
            
            await updatePaymentStatus(Number(eventId), Number(applicationId), updateData);
            
            // 데이터 다시 로드
            const updatedData = await getBoothApplicationDetails(Number(eventId), Number(applicationId));
            setApplicationDetail(updatedData);
            
            alert(`결제 상태가 ${paymentStatus}로 업데이트되었습니다.`);
        } catch (err) {
            console.error(err);
            alert('결제 상태 업데이트에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    const handleBackToList = () => {
        navigate(`/host/events/${eventId}/booth-applications`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopNav />
                <div className="flex">
                    <HostSideNav />
                    <div className="flex-1 p-8">
                        <div className="text-center">로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !applicationDetail) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopNav />
                <div className="flex">
                    <HostSideNav />
                    <div className="flex-1 p-8">
                        <div className="text-center text-red-600">{error || '신청 정보를 찾을 수 없습니다.'}</div>
                        <button
                            onClick={handleBackToList}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusColors = getStatusColors(applicationDetail.statusCode);
    const paymentColors = getPaymentStatusColors(applicationDetail.paymentStatus);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 신청 상세
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="ml-64 mt-[195px] w-[949px] pb-20">
                    
                    {/* 뒤로 가기 버튼 */}
                    <div className="mb-6">
                        <button
                            onClick={handleBackToList}
                            className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                            ← 목록으로 돌아가기
                        </button>
                    </div>

                    {/* 기본 정보 섹션 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="font-bold text-black text-lg mb-6">기본 정보</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스명</label>
                                <div className="text-gray-900">{applicationDetail.boothTitle}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스 타입</label>
                                <div className="text-gray-900">{applicationDetail.boothTypeName}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">운영 시작일</label>
                                <div className="text-gray-900">{applicationDetail.startDate}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">운영 종료일</label>
                                <div className="text-gray-900">{applicationDetail.endDate}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">신청일시</label>
                                <div className="text-gray-900 whitespace-pre-line">{new Date(applicationDetail.applyAt).toLocaleString('ko-KR').replace(/(오전|오후)/, '\n$1')}</div>
                            </div>
                        </div>
                    </div>

                    {/* 부스 상세 정보 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="font-bold text-black text-lg mb-6">부스 상세 정보</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스 설명</label>
                                <div className="p-3 bg-gray-50 rounded-md">{applicationDetail.boothDescription}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스 이메일</label>
                                <div className="text-gray-900">{applicationDetail.boothEmail}</div>
                            </div>
                            {applicationDetail.boothBannerUrl && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">부스 배너</label>
                                    <img src={applicationDetail.boothBannerUrl} alt="부스 배너" className="max-w-xs rounded-md" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 담당자 정보 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="font-bold text-black text-lg mb-6">담당자 정보</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
                                <div className="text-gray-900">{applicationDetail.managerName}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                                <div className="text-gray-900">{applicationDetail.contactEmail}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <div className="text-gray-900">{applicationDetail.contactNumber}</div>
                            </div>
                        </div>
                    </div>

                    {/* 외부 링크 */}
                    {applicationDetail.boothExternalLinks && applicationDetail.boothExternalLinks.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="font-bold text-black text-lg mb-6">외부 링크</h2>
                            <div className="space-y-2">
                                {applicationDetail.boothExternalLinks.map((link, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <span className="text-gray-700">{link.displayText}:</span>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                            {link.url}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 상태 관리 섹션 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="font-bold text-black text-lg mb-6">상태 관리</h2>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">처리 상태</label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors.bg} ${statusColors.text}`}>
                                    {applicationDetail.statusCode}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">결제 상태</label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${paymentColors.bg} ${paymentColors.text}`}>
                                    {applicationDetail.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* 관리자 메모 */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">관리자 메모</label>
                            <textarea
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="관리자 메모를 입력하세요..."
                            />
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex space-x-4">
                            {applicationDetail.statusCode === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate('APPROVED')}
                                        disabled={updating}
                                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {updating ? '처리 중...' : '승인'}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('REJECTED')}
                                        disabled={updating}
                                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {updating ? '처리 중...' : '반려'}
                                    </button>
                                </>
                            )}
                            
                            {/* 결제 상태 변경 버튼 */}
                            {applicationDetail.statusCode === 'APPROVED' && (
                                <div className="flex space-x-2">
                                    {applicationDetail.paymentStatus !== 'PAID' && (
                                        <button
                                            onClick={() => handlePaymentStatusUpdate('PAID')}
                                            disabled={updating}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            결제완료 처리
                                        </button>
                                    )}
                                    {applicationDetail.paymentStatus !== 'CANCELLED' && (
                                        <button
                                            onClick={() => handlePaymentStatusUpdate('CANCELLED')}
                                            disabled={updating}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            결제취소 처리
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};