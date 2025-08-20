import React, { useState, useEffect, useCallback } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { adminSecurityService, type ChangeHistoryDto } from "../../services/adminSecurity.service";

export const ChangeLogs: React.FC = () => {
    const [changeLogs, setChangeLogs] = useState<ChangeHistoryDto[]>([]);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);

    // 검색 필터 상태
    const [filters, setFilters] = useState({
        email: '',
        changeItem: '전체',
        fromDate: '',
        toDate: ''
    });

    // 변경 항목 드롭다운 옵션
    const changeItemOptions = ["전체", "행사 정보", "계정 정보", "배너 정보"];

    // 날짜 포맷 함수
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // 변경 기록 데이터 로드 (실제 API 호출)
    const loadChangeLogs = useCallback(async (page: number = 0) => {
        setLoading(true);
        try {
            const response = await adminSecurityService.getChangeLogs({
                page,
                size: pageSize,
                email: filters.email || undefined,
                type: filters.changeItem === '전체' ? undefined : filters.changeItem,
                from: filters.fromDate || undefined,
                to: filters.toDate || undefined
            });

            setChangeLogs(response.content);
            setTotalElements(response.totalElements);
            setTotalPages(response.totalPages);
            setCurrentPage(response.number);
        } catch (error) {
            console.error('변경 기록 로드 중 오류:', error);
            // 에러 시 안전한 초기값으로 설정
            setChangeLogs([]);
            setTotalElements(0);
            setTotalPages(1);
            setCurrentPage(0);
        } finally {
            setLoading(false);
        }
    }, [pageSize, filters.email, filters.changeItem, filters.fromDate, filters.toDate]);

    useEffect(() => {
        setCurrentPage(0); // 필터 변경 시 첫 페이지로 이동
        loadChangeLogs(0);
    }, [loadChangeLogs]);

    // 초기화 핸들러
    const handleReset = () => {
        setFilters({
            email: '',
            changeItem: '전체',
            fromDate: '',
            toDate: ''
        });
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        loadChangeLogs(page);
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    변경 기록
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 검색 필터 카드 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">검색 조건</h3>
                            <button
                                onClick={handleReset}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-[10px] hover:bg-gray-50 focus:outline-none"
                            >
                                초기화
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    value={filters.email}
                                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="이메일 입력"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    변경 항목
                                </label>
                                <select
                                    value={filters.changeItem}
                                    onChange={(e) => setFilters({ ...filters, changeItem: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {changeItemOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={filters.fromDate}
                                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={filters.toDate}
                                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 변경 기록 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            변경일시
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            이름
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            이메일
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            변경 항목
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            변경 내용
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            대상 닉네임
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                로딩 중...
                                            </td>
                                        </tr>
                                    ) : !changeLogs || changeLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                변경 기록이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        (changeLogs || []).map((log, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDateTime(log.modifyTime)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.targetType}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {log.content}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.nickname}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 페이지네이션 */}
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-gray-600">
                                총 <span className="font-semibold text-blue-600">{totalElements}</span>건의 변경기록
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    이전
                                </button>

                                {Array.from({ length: totalPages || 1 }, (_, i) => i).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage >= totalPages - 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    다음
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangeLogs;
