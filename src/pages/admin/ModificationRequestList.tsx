import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modificationRequestAPI, ModificationRequestListItem, PageResponse } from '../../services/modificationRequest';
import { toast } from 'react-toastify';

const ModificationRequestList: React.FC = () => {
    const [requests, setRequests] = useState<ModificationRequestListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    
    const navigate = useNavigate();

    const fetchRequests = async (page: number = 0, status: string = '') => {
        try {
            setLoading(true);
            const response: PageResponse<ModificationRequestListItem> = await modificationRequestAPI.getModificationRequests({
                status: status || undefined,
                page,
                size: 20
            });
            
            setRequests(response.content);
            setCurrentPage(response.number);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('수정 요청 목록 조회 실패:', error);
            toast.error('수정 요청 목록을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(0, statusFilter);
    }, [statusFilter]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchRequests(newPage, statusFilter);
        }
    };

    const handleRowClick = (requestId: number) => {
        navigate(`/admin/modification-requests/${requestId}`);
    };

    const getStatusBadge = (statusCode: string) => {
        const statusConfig = {
            'PENDING': { text: '대기중', className: 'bg-yellow-100 text-yellow-800' },
            'APPROVED': { text: '승인됨', className: 'bg-green-100 text-green-800' },
            'REJECTED': { text: '반려됨', className: 'bg-red-100 text-red-800' }
        };
        
        const config = statusConfig[statusCode as keyof typeof statusConfig] || { text: statusCode, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-500">로딩중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">행사 수정 요청 관리</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        행사 주최자들이 요청한 수정 사항을 검토하고 승인/반려할 수 있습니다.
                    </p>
                </div>

                {/* 필터 및 검색 */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center space-x-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                상태 필터
                            </label>
                            <select
                                id="status"
                                value={statusFilter}
                                onChange={handleStatusChange}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">전체</option>
                                <option value="PENDING">대기중</option>
                                <option value="APPROVED">승인됨</option>
                                <option value="REJECTED">반려됨</option>
                            </select>
                        </div>
                        <div className="flex-1 text-right">
                            <span className="text-sm text-gray-500">
                                총 {totalElements}건의 요청
                            </span>
                        </div>
                    </div>
                </div>

                {/* 요청 목록 테이블 */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    신청일시
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    이벤트 코드
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    제목
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    상태
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    처리일시
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        수정 요청이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request) => (
                                    <tr 
                                        key={request.requestId}
                                        onClick={() => handleRowClick(request.requestId)}
                                        className="hover:bg-gray-50 cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(request.createdAt).toLocaleString('ko-KR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {request.eventCode || `E${request.eventId}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {request.eventTitle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getStatusBadge(request.statusCode)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {request.processedAt 
                                                ? new Date(request.processedAt).toLocaleString('ko-KR')
                                                : '-'
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            페이지 {currentPage + 1} / {totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                이전
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModificationRequestList;