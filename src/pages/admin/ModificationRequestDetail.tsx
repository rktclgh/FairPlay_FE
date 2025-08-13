import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modificationRequestAPI, ModificationRequestDetail } from '../../services/modificationRequest';
import { toast } from 'react-toastify';

const ModificationRequestDetailPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    
    const [request, setRequest] = useState<ModificationRequestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [adminComment, setAdminComment] = useState('');

    useEffect(() => {
        if (requestId) {
            fetchRequestDetail(parseInt(requestId));
        }
    }, [requestId]);

    const fetchRequestDetail = async (id: number) => {
        try {
            setLoading(true);
            const response = await modificationRequestAPI.getModificationRequestDetail(id);
            setRequest(response);
            setAdminComment(response.adminComment || '');
        } catch (error) {
            console.error('수정 요청 상세 조회 실패:', error);
            toast.error('수정 요청 정보를 불러올 수 없습니다.');
            navigate('/admin/modification-requests');
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (action: 'approve' | 'reject') => {
        if (!request) return;
        
        if (request.statusCode !== 'PENDING') {
            toast.error('이미 처리된 요청입니다.');
            return;
        }

        const confirmMessage = action === 'approve' 
            ? '이 수정 요청을 승인하시겠습니까?' 
            : '이 수정 요청을 반려하시겠습니까?';
        
        if (!window.confirm(confirmMessage)) return;

        try {
            setProcessing(true);
            await modificationRequestAPI.processModificationRequest(request.requestId, {
                action,
                adminComment: adminComment.trim() || undefined
            });
            
            toast.success(action === 'approve' ? '요청이 승인되었습니다.' : '요청이 반려되었습니다.');
            
            // 상세 정보 다시 로드
            await fetchRequestDetail(request.requestId);
        } catch (error) {
            console.error('요청 처리 실패:', error);
            toast.error('요청 처리에 실패했습니다.');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (statusCode: string) => {
        const statusConfig = {
            'PENDING': { text: '대기중', className: 'bg-yellow-100 text-yellow-800' },
            'APPROVED': { text: '승인됨', className: 'bg-green-100 text-green-800' },
            'REJECTED': { text: '반려됨', className: 'bg-red-100 text-red-800' }
        };
        
        const config = statusConfig[statusCode as keyof typeof statusConfig] || { text: statusCode, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.className}`}>
                {config.text}
            </span>
        );
    };

    const renderFieldComparison = (label: string, originalValue: any, modifiedValue: any) => {
        // 값이 동일하면 표시하지 않음
        if (originalValue === modifiedValue) return null;
        
        const formatValue = (value: any) => {
            if (value === null || value === undefined) return '-';
            if (typeof value === 'boolean') return value ? '예' : '아니오';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value);
        };

        return (
            <div className="border-b border-gray-200 py-4">
                <h4 className="font-medium text-gray-900 mb-2">{label}</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm font-medium text-gray-500">기존 값</span>
                        <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded text-sm">
                            {formatValue(originalValue)}
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">수정 요청 값</span>
                        <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded text-sm">
                            {formatValue(modifiedValue)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-500">로딩 중...</div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-500">요청 정보를 찾을 수 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => navigate('/admin/modification-requests')}
                                className="mb-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                                ← 목록으로 돌아가기
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">수정 요청 상세</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                요청 ID: {request.requestId} | 이벤트: {request.eventTitle}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusBadge(request.statusCode)}
                        </div>
                    </div>
                </div>

                {/* 요청 기본 정보 */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">요청 정보</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <span className="text-sm font-medium text-gray-500">신청일시</span>
                            <div className="mt-1 text-sm text-gray-900">
                                {new Date(request.createdAt).toLocaleString('ko-KR')}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">이벤트 코드</span>
                            <div className="mt-1 text-sm text-gray-900">
                                {request.eventCode || `E${request.eventId}`}
                            </div>
                        </div>
                        {request.processedAt && (
                            <>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">처리일시</span>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(request.processedAt).toLocaleString('ko-KR')}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">처리자</span>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {request.processedBy || '-'}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 변경 사항 비교 */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">변경 사항</h2>
                    <div className="space-y-4">
                        {renderFieldComparison('위치 상세', request.originalData?.locationDetail, request.modifiedData?.locationDetail)}
                        {renderFieldComparison('주최자명', request.originalData?.hostName, request.modifiedData?.hostName)}
                        {renderFieldComparison('주최/기획사', request.originalData?.hostCompany, request.modifiedData?.hostCompany)}
                        {renderFieldComparison('연락처', request.originalData?.contactInfo, request.modifiedData?.contactInfo)}
                        {renderFieldComparison('행사 개요', request.originalData?.bio, request.modifiedData?.bio)}
                        {renderFieldComparison('상세 내용', request.originalData?.content, request.modifiedData?.content)}
                        {renderFieldComparison('정책', request.originalData?.policy, request.modifiedData?.policy)}
                        {renderFieldComparison('공식 URL', request.originalData?.officialUrl, request.modifiedData?.officialUrl)}
                        {renderFieldComparison('관람시간', request.originalData?.eventTime, request.modifiedData?.eventTime)}
                        {renderFieldComparison('시작일', request.originalData?.startDate, request.modifiedData?.startDate)}
                        {renderFieldComparison('종료일', request.originalData?.endDate, request.modifiedData?.endDate)}
                        {renderFieldComparison('재입장 허용', request.originalData?.reentryAllowed, request.modifiedData?.reentryAllowed)}
                        {renderFieldComparison('퇴장 스캔 필수', request.originalData?.checkOutAllowed, request.modifiedData?.checkOutAllowed)}
                        {renderFieldComparison('관람등급', request.originalData?.age, request.modifiedData?.age)}
                        
                        {/* 변경사항이 없는 경우 */}
                        {!Object.keys(request.modifiedData || {}).some(key => 
                            request.originalData?.[key] !== request.modifiedData?.[key]
                        ) && (
                            <div className="text-center py-8 text-gray-500">
                                비교할 변경사항이 없습니다.
                            </div>
                        )}
                    </div>
                </div>

                {/* 관리자 코멘트 및 처리 버튼 */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">관리자 코멘트</h2>
                    
                    {request.statusCode === 'PENDING' ? (
                        <div className="space-y-4">
                            <textarea
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                placeholder="처리 사유나 코멘트를 입력하세요 (선택사항)"
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleProcess('approve')}
                                    disabled={processing}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? '처리 중...' : '승인'}
                                </button>
                                <button
                                    onClick={() => handleProcess('reject')}
                                    disabled={processing}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? '처리 중...' : '반려'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                            {request.adminComment || '관리자 코멘트가 없습니다.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModificationRequestDetailPage;