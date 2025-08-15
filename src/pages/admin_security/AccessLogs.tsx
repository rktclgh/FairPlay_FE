import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";

interface AccessLog {
    id: number;
    userId: number;
    name: string;
    user_role_code_id: number;
    ip: string;
    userAgent: string;
    loginTime: string;
}

interface PageableResponse {
    content: AccessLog[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        unpaged: boolean;
        paged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export const AccessLogs: React.FC = () => {
    const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);

    // 검색 필터 상태
    const [filters, setFilters] = useState({
        userEmail: '',
        fromDate: '',
        toDate: ''
    });

    // 브라우저/기기 정보 파싱 함수
    const parseUserAgent = (userAgent: string) => {
        const browser = userAgent.includes('Chrome') ? 'Chrome' :
            userAgent.includes('Firefox') ? 'Firefox' :
                userAgent.includes('Safari') ? 'Safari' :
                    userAgent.includes('Edge') ? 'Edge' : 'Unknown';

        const os = userAgent.includes('Windows') ? 'Windows' :
            userAgent.includes('Mac') ? 'macOS' :
                userAgent.includes('Linux') ? 'Linux' :
                    userAgent.includes('Android') ? 'Android' :
                        userAgent.includes('iOS') ? 'iOS' : 'Unknown';

        return `${browser} / ${os}`;
    };

    // 날짜 포맷 함수
    const formatDateTime = (dateString: string) => {
        return dateString;
    };

    // 전체 목업 데이터
    const allMockData: AccessLog[] = [
        {
            id: 1,
            userId: 1,
            name: "테스트",
            user_role_code_id: 1,
            ip: "0:0:0:0:0:0:0:1",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
            loginTime: "2025-08-08T16:42:40"
        },
        {
            id: 2,
            userId: 2,
            name: "관리자",
            user_role_code_id: 3,
            ip: "192.168.1.100",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
            loginTime: "2025-08-08T15:30:15"
        },
        {
            id: 3,
            userId: 3,
            name: "김민수",
            user_role_code_id: 1,
            ip: "192.168.1.105",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
            loginTime: "2025-08-09T09:15:22"
        },
        {
            id: 4,
            userId: 4,
            name: "이영희",
            user_role_code_id: 2,
            ip: "203.123.45.67",
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            loginTime: "2025-08-09T14:23:11"
        },
        {
            id: 5,
            userId: 5,
            name: "박철수",
            user_role_code_id: 1,
            ip: "10.0.0.50",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
            loginTime: "2025-08-10T11:45:33"
        }
    ];

    // 접속 이력 데이터 로드 (실제 API 연동 시 구현)
    const loadAccessLogs = async (page: number = 0) => {
        setLoading(true);
        try {
            // 필터링 적용
            let filteredData = allMockData;

            // 사용자 이메일로 필터링 (이름으로 검색)
            if (filters.userEmail) {
                filteredData = filteredData.filter(log =>
                    log.name.toLowerCase().includes(filters.userEmail.toLowerCase()) ||
                    `user${log.userId}@example.com`.toLowerCase().includes(filters.userEmail.toLowerCase())
                );
            }

            // From 날짜로 필터링
            if (filters.fromDate) {
                filteredData = filteredData.filter(log =>
                    log.loginTime >= filters.fromDate
                );
            }

            // To 날짜로 필터링
            if (filters.toDate) {
                filteredData = filteredData.filter(log =>
                    log.loginTime <= filters.toDate + 'T23:59:59'
                );
            }

            // 페이지네이션 적용
            const totalElements = filteredData.length;
            const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;
            const pageData = filteredData.slice(startIndex, endIndex);

            const mockData: PageableResponse = {
                content: pageData,
                pageable: {
                    pageNumber: page,
                    pageSize: 10,
                    sort: { empty: false, sorted: true, unsorted: false },
                    offset: page * 10,
                    unpaged: false,
                    paged: true
                },
                last: page >= totalPages - 1,
                totalElements: totalElements,
                totalPages: totalPages,
                size: 10,
                number: page,
                sort: { empty: false, sorted: true, unsorted: false },
                first: page === 0,
                numberOfElements: pageData.length,
                empty: pageData.length === 0
            };

            setAccessLogs(mockData.content);
            setTotalElements(mockData.totalElements);
            setTotalPages(mockData.totalPages);
            setCurrentPage(mockData.number);
        } catch (error) {
            console.error('접속 이력 로드 중 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(0); // 필터 변경 시 첫 페이지로 이동
        loadAccessLogs(0);
    }, [filters]);

    // 초기화 핸들러
    const handleReset = () => {
        setFilters({
            userEmail: '',
            fromDate: '',
            toDate: ''
        });
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        loadAccessLogs(page);
    };



    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    접속 이력
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
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    사용자 이메일
                                </label>
                                <input
                                    type="email"
                                    value={filters.userEmail}
                                    onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="이메일 입력"
                                />
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



                    {/* 접속 이력 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            접속일시
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            이름
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            이메일
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            접속 IP
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            접속 브라우저/기기
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            위치 정보
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
                                    ) : accessLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                접속 이력이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        accessLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDateTime(log.loginTime)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    user{log.userId}@example.com
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.ip}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {parseUserAgent(log.userAgent)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.ip.startsWith('192.168') ? '내부 네트워크' : '외부 접속'}
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
                                총 <span className="font-semibold text-blue-600">{totalElements}</span>건의 접속이력
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

                                {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
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

export default AccessLogs;
