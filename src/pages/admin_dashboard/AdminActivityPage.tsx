import React, { useState, useEffect } from 'react';
import { TopNav } from '../../components/TopNav';
import { AdminSideNav } from '../../components/AdminSideNav';
import { ArrowLeft, Search, Calendar, Settings, Shield, DollarSign, FileText, Users, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type AdminActivity = {
    id: number;
    title: string;
    actor: string;
    actorRole: string;
    timestamp: string;
    category: 'EVENT' | 'USER' | 'SYSTEM' | 'FINANCE' | 'SECURITY' | 'MARKETING';
    description: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    colorClass: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
};

const AdminActivityPage: React.FC = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState<AdminActivity[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<AdminActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // 더미 데이터 생성
    useEffect(() => {
        const generateDummyData = () => {
            const categories = ['EVENT', 'USER', 'SYSTEM', 'FINANCE', 'SECURITY', 'MARKETING'];
            const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
            const actors = [
                { name: 'admin@fairplay.com', role: '시스템 관리자' },
                { name: 'finance@fairplay.com', role: '재무 담당자' },
                { name: 'marketing@fairplay.com', role: '마케팅 담당자' },
                { name: 'tech@fairplay.com', role: '기술 담당자' },
                { name: 'support@fairplay.com', role: '고객 지원 담당자' },
                { name: 'security@fairplay.com', role: '보안 담당자' }
            ];

            const dummyActivities: AdminActivity[] = [];
            const now = new Date();

            for (let i = 0; i < 150; i++) {
                const category = categories[Math.floor(Math.random() * categories.length)] as 'EVENT' | 'USER' | 'SYSTEM' | 'FINANCE' | 'SECURITY' | 'MARKETING';
                const severity = severities[Math.floor(Math.random() * severities.length)] as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
                const actor = actors[Math.floor(Math.random() * actors.length)];
                const timestamp = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

                let title = '';
                let description = '';
                let details = '';

                switch (category) {
                    case 'EVENT':
                        title = '행사 관리 작업';
                        description = '행사 등록, 수정, 승인, 취소 등의 작업을 수행했습니다.';
                        details = `행사 ID: ${Math.floor(Math.random() * 1000) + 1}, 작업 유형: ${['등록', '수정', '승인', '취소'][Math.floor(Math.random() * 4)]}`;
                        break;
                    case 'USER':
                        title = '사용자 계정 관리';
                        description = '사용자 계정 생성, 수정, 권한 변경 등의 작업을 수행했습니다.';
                        details = `사용자 ID: ${Math.floor(Math.random() * 10000) + 1}, 작업 유형: ${['생성', '수정', '권한 변경', '비활성화'][Math.floor(Math.random() * 4)]}`;
                        break;
                    case 'SYSTEM':
                        title = '시스템 설정 변경';
                        description = '플랫폼 설정, API 키 관리, 시스템 파라미터 조정 등의 작업을 수행했습니다.';
                        details = `설정 항목: ${['플랫폼 설정', 'API 키', '시스템 파라미터', '백업 설정'][Math.floor(Math.random() * 4)]}`;
                        break;
                    case 'FINANCE':
                        title = '재무 처리 작업';
                        description = '정산 처리, 환불 승인, 수수료 설정 등의 작업을 수행했습니다.';
                        details = `거래 ID: ${Math.floor(Math.random() * 100000) + 1}, 금액: ${(Math.random() * 1000000).toLocaleString()}원`;
                        break;
                    case 'SECURITY':
                        title = '보안 관련 작업';
                        description = '접근 로그 확인, 보안 정책 설정, 위험 사용자 차단 등의 작업을 수행했습니다.';
                        details = `보안 레벨: ${severity}, 작업 유형: ${['접근 로그', '보안 정책', '사용자 차단', '시스템 점검'][Math.floor(Math.random() * 4)]}`;
                        break;
                    case 'MARKETING':
                        title = '마케팅 활동 관리';
                        description = 'VIP 배너 등록, 프로모션 설정, 광고 캠페인 관리 등의 작업을 수행했습니다.';
                        details = `캠페인 ID: ${Math.floor(Math.random() * 100) + 1}, 예산: ${(Math.random() * 5000000).toLocaleString()}원`;
                        break;
                }

                const colorClass = {
                    'LOW': 'bg-green-500',
                    'MEDIUM': 'bg-yellow-500',
                    'HIGH': 'bg-orange-500',
                    'CRITICAL': 'bg-red-500'
                }[severity];

                dummyActivities.push({
                    id: i + 1,
                    title,
                    actor: actor.name,
                    actorRole: actor.role,
                    timestamp: timestamp.toLocaleString('ko-KR'),
                    category,
                    description,
                    details,
                    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    colorClass,
                    severity: severity
                });
            }

            // 최신 순으로 정렬
            dummyActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setActivities(dummyActivities);
            setFilteredActivities(dummyActivities);
            setLoading(false);
        };

        generateDummyData();
    }, []);

    // 필터링 및 검색
    useEffect(() => {
        let filtered = [...activities];

        // 검색어 필터링
        if (searchTerm) {
            filtered = filtered.filter(activity =>
                activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 카테고리 필터링
        if (selectedCategory !== 'ALL') {
            filtered = filtered.filter(activity => activity.category === selectedCategory);
        }

        // 심각도 필터링
        if (selectedSeverity !== 'ALL') {
            filtered = filtered.filter(activity => activity.severity === selectedSeverity);
        }

        // 날짜 범위 필터링
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(activity => {
                const activityDate = new Date(activity.timestamp);
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                return activityDate >= startDate && activityDate <= endDate;
            });
        }

        setFilteredActivities(filtered);
        setCurrentPage(1);
    }, [activities, searchTerm, selectedCategory, selectedSeverity, dateRange]);

    // 페이지네이션
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentActivities = filteredActivities.slice(startIndex, endIndex);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'EVENT': return <Calendar className="w-4 h-4" />;
            case 'USER': return <Users className="w-4 h-4" />;
            case 'SYSTEM': return <Settings className="w-4 h-4" />;
            case 'FINANCE': return <DollarSign className="w-4 h-4" />;
            case 'SECURITY': return <Shield className="w-4 h-4" />;
            case 'MARKETING': return <Eye className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels = {
            'EVENT': '행사 관리',
            'USER': '사용자 관리',
            'SYSTEM': '시스템 관리',
            'FINANCE': '재무 관리',
            'SECURITY': '보안 관리',
            'MARKETING': '마케팅 관리'
        };
        return labels[category as keyof typeof labels] || category;
    };

    const getSeverityLabel = (severity: string) => {
        const labels = {
            'LOW': '낮음',
            'MEDIUM': '보통',
            'HIGH': '높음',
            'CRITICAL': '심각'
        };
        return labels[severity as keyof typeof labels] || severity;
    };

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <AdminSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-64">
                        <div className="text-lg">로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 페이지 제목 및 뒤로가기 */}
                <div className="absolute left-64 top-[137px] w-[949px]">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-black tracking-[0] leading-[54px] whitespace-nowrap mb-4">
                            관리자 활동
                        </h1>
                        <button
                            onClick={() => navigate('/admin_dashboard')}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            뒤로가기
                        </button>
                    </div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[280px] w-[949px] pb-20">
                    {/* 필터 및 검색 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">검색조건</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* 검색 */}
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="활동 제목, 담당자, 설명으로 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* 카테고리 필터 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">전체</option>
                                    <option value="EVENT">행사 관리</option>
                                    <option value="USER">사용자 관리</option>
                                    <option value="SYSTEM">시스템 관리</option>
                                    <option value="FINANCE">재무 관리</option>
                                    <option value="SECURITY">보안 관리</option>
                                    <option value="MARKETING">마케팅 관리</option>
                                </select>
                            </div>

                            {/* 심각도 필터 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">심각도</label>
                                <select
                                    value={selectedSeverity}
                                    onChange={(e) => setSelectedSeverity(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">전체</option>
                                    <option value="LOW">낮음</option>
                                    <option value="MEDIUM">보통</option>
                                    <option value="HIGH">높음</option>
                                    <option value="CRITICAL">심각</option>
                                </select>
                            </div>
                        </div>

                        {/* 날짜 범위 필터 */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory('ALL');
                                        setSelectedSeverity('ALL');
                                        setDateRange({ start: '', end: '' });
                                    }}
                                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-[10px] hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    초기화
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 결과 요약 */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                총 <span className="font-semibold text-blue-600">{filteredActivities.length}</span>개의 활동이 있습니다
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                <Download className="w-4 h-4" />
                                CSV 내보내기
                            </button>
                        </div>
                    </div>

                    {/* 활동 목록 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활동</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">심각도</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentActivities.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{activity.title}</div>
                                                    <div className="text-sm text-gray-500">{activity.description}</div>
                                                    <div className="text-xs text-gray-400 mt-1">{activity.details}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{activity.actor}</div>
                                                    <div className="text-xs text-gray-500">{activity.actorRole}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getCategoryIcon(activity.category)}
                                                    <span className="text-sm text-gray-900">{getCategoryLabel(activity.category)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${activity.colorClass}`}></div>
                                                    <span className="text-sm text-gray-900">{getSeverityLabel(activity.severity)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{activity.timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-lg shadow-md p-4 mt-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    {startIndex + 1} - {Math.min(endIndex, filteredActivities.length)} / {filteredActivities.length}개
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        이전
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-2 text-sm border rounded-md ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
};

export default AdminActivityPage;
