import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { adminStatisticsService, type PopularTop5Item } from "../../services/adminStatistics.service";

export const PopularEvents: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');

    // 추가: 성별/세대 Top5 상태
    // const [gender, setGender] = useState<GenderCode>('MALE');
    const [ageGroup, setAgeGroup] = useState<number>(20);
    const [topByMale, setTopByMale] = useState<PopularTop5Item[]>([]);
    const [topByFemale, setTopByFemale] = useState<PopularTop5Item[]>([]);
    const [topByAge, setTopByAge] = useState<PopularTop5Item[]>([]);
    const [loadingMale, setLoadingMale] = useState<boolean>(false);
    const [loadingFemale, setLoadingFemale] = useState<boolean>(false);
    const [loadingAge, setLoadingAge] = useState<boolean>(false);

    // 샘플 데이터 (실제로는 API에서 가져올 데이터)
    const [statsData] = useState({
        averageViews: 2847,
        averageReservations: 89,
        averageInterests: 156
    });

    const [topViewsData] = useState([
        { name: '2025 서울 국제 박람회', views: 12500, category: '박람회' },
        { name: 'K-POP 콘서트', views: 8900, category: '공연' },
        { name: '스타트업 창업 세미나', views: 7200, category: '강연/세미나' },
        { name: '서울 아트 페어', views: 6800, category: '전시/행사' },
        { name: 'IT 개발자 컨퍼런스', views: 6100, category: '강연/세미나' }
    ]);

    const [topReservationsData] = useState([
        { name: '2025 서울 국제 박람회', reservations: 156, category: '박람회' },
        { name: '스타트업 창업 세미나', reservations: 89, category: '강연/세미나' },
        { name: '서울 아트 페어', reservations: 78, category: '전시/행사' },
        { name: 'K-POP 콘서트', reservations: 67, category: '공연' },
        { name: '한국 전통 축제', reservations: 45, category: '축제' }
    ]);

    const [topInterestsData] = useState([
        { name: '2025 서울 국제 박람회', interests: 234, category: '박람회' },
        { name: 'K-POP 콘서트', interests: 189, category: '공연' },
        { name: '서울 아트 페어', interests: 167, category: '전시/행사' },
        { name: '스타트업 창업 세미나', interests: 145, category: '강연/세미나' },
        { name: '패션 트렌드 쇼', interests: 123, category: '전시/행사' }
    ]);

    const [allPopularEvents] = useState([
        { rank: 1, name: '2025 서울 국제 박람회', category: '박람회', views: 12500, reservations: 156, interests: 234 },
        { rank: 2, name: 'K-POP 콘서트', category: '공연', views: 8900, reservations: 67, interests: 189 },
        { rank: 3, name: '스타트업 창업 세미나', category: '강연/세미나', views: 7200, reservations: 89, interests: 145 },
        { rank: 4, name: '서울 아트 페어', category: '전시/행사', views: 6800, reservations: 78, interests: 167 },
        { rank: 5, name: 'IT 개발자 컨퍼런스', category: '강연/세미나', views: 6100, reservations: 42, interests: 98 },
        { rank: 6, name: '한국 전통 축제', category: '축제', views: 5800, reservations: 45, interests: 87 },
        { rank: 7, name: '패션 트렌드 쇼', category: '전시/행사', views: 5200, reservations: 38, interests: 123 },
        { rank: 8, name: '클래식 음악회', category: '공연', views: 4800, reservations: 35, interests: 76 },
        { rank: 9, name: '반려동물 박람회', category: '박람회', views: 4500, reservations: 32, interests: 89 },
        { rank: 10, name: '건강 다이어트 세미나', category: '강연/세미나', views: 4200, reservations: 28, interests: 65 }
    ]);

    const [filteredEvents, setFilteredEvents] = useState(allPopularEvents);

    // 검색 및 필터링
    useEffect(() => {
        let filtered = allPopularEvents;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(event => event.category === selectedCategory);
        }

        if (searchKeyword) {
            filtered = filtered.filter(event =>
                event.name.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        setFilteredEvents(filtered);
    }, [selectedCategory, searchKeyword]);

    // 숫자 포맷팅
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('ko-KR').format(num);
    };

    // 카테고리별 색상
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            '박람회': '#8884d8',
            '강연/세미나': '#82ca9d',
            '전시/행사': '#ffc658',
            '공연': '#ff7300',
            '축제': '#8dd1e1'
        };
        return colors[category] || '#8884d8';
    };

    // 성별 Top5 로드
    useEffect(() => {
        let ignore = false;
        const load = async () => {
            try {
                setLoadingMale(true);
                const data = await adminStatisticsService.getTop5ByMale();
                if (!ignore) setTopByMale(data);
            } finally {
                if (!ignore) setLoadingMale(false);
            }
        };
        load();
        return () => { ignore = true; };
    }, []);

    useEffect(() => {
        let ignore = false;
        const load = async () => {
            try {
                setLoadingFemale(true);
                const data = await adminStatisticsService.getTop5ByFemale();
                if (!ignore) setTopByFemale(data);
            } finally {
                if (!ignore) setLoadingFemale(false);
            }
        };
        load();
        return () => { ignore = true; };
    }, []);

    // 세대 Top5 로드
    useEffect(() => {
        let ignore = false;
        const load = async () => {
            try {
                setLoadingAge(true);
                const data = await adminStatisticsService.getTop5ByAge(ageGroup);
                if (!ignore) setTopByAge(data);
            } finally {
                if (!ignore) setLoadingAge(false);
            }
        };
        load();
        return () => { ignore = true; };
    }, [ageGroup]);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    인기 행사
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">

                    {/* 주요 지표 카드들 */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* 평균 조회 수 */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">평균 조회 수</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatNumber(statsData.averageViews)}회</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 평균 예약 수 */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">평균 예약 수</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatNumber(statsData.averageReservations)}건</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 평균 관심 수 */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">평균 관심 수</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatNumber(statsData.averageInterests)}건</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TOP 5 차트 섹션 */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* 조회 수 TOP 5 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">조회 수 TOP 5</h3>
                            <div className="space-y-3">
                                {topViewsData.map((event, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {event.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{
                                                        width: `${(event.views / topViewsData[0].views) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-blue-600 min-w-[60px] text-right">
                                                {formatNumber(event.views)}회
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 예약 수 TOP 5 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">예약 수 TOP 5</h3>
                            <div className="space-y-3">
                                {topReservationsData.map((event, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {event.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{
                                                        width: `${(event.reservations / topReservationsData[0].reservations) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-green-600 min-w-[60px] text-right">
                                                {formatNumber(event.reservations)}건
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 관심 수 TOP 5 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">관심 수 TOP 5</h3>
                            <div className="space-y-3">
                                {topInterestsData.map((event, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {event.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500 rounded-full"
                                                    style={{
                                                        width: `${(event.interests / topInterestsData[0].interests) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-purple-600 min-w-[60px] text-right">
                                                {formatNumber(event.interests)}건
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 성별/세대 TOP5 추가 섹션 */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* 남성 TOP5 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">남성 TOP 5</h3>
                            {loadingMale ? (
                                <div className="h-24 flex items-center justify-center text-gray-500">로딩 중...</div>
                            ) : (
                                <div className="space-y-3">
                                    {topByMale.map((item, index) => (
                                        <div key={item.eventTitle} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">{item.eventTitle}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.count / (topByMale[0]?.count || 1)) * 100}%` }}></div>
                                                </div>
                                                <span className="text-sm font-semibold text-blue-600 min-w-[60px] text-right">{formatNumber(item.count)}회</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 여성 TOP5 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">여성 TOP 5</h3>
                            {loadingFemale ? (
                                <div className="h-24 flex items-center justify-center text-gray-500">로딩 중...</div>
                            ) : (
                                <div className="space-y-3">
                                    {topByFemale.map((item, index) => (
                                        <div key={item.eventTitle} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">{item.eventTitle}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-pink-400 rounded-full" style={{ width: `${(item.count / (topByFemale[0]?.count || 1)) * 100}%` }}></div>
                                                </div>
                                                <span className="text-sm font-semibold text-pink-600 min-w-[60px] text-right">{formatNumber(item.count)}회</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 세대별 TOP5 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">세대별 TOP 5</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">세대</span>
                                    <select
                                        value={ageGroup}
                                        onChange={(e) => setAgeGroup(parseInt(e.target.value))}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={10}>10대</option>
                                        <option value={20}>20대</option>
                                        <option value={30}>30대</option>
                                        <option value={40}>40대</option>
                                        <option value={50}>50대</option>
                                    </select>
                                </div>
                            </div>
                            {loadingAge ? (
                                <div className="h-24 flex items-center justify-center text-gray-500">로딩 중...</div>
                            ) : (
                                <div className="space-y-3">
                                    {topByAge.map((item, index) => (
                                        <div key={item.eventTitle} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">{item.eventTitle}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(item.count / (topByAge[0]?.count || 1)) * 100}%` }}></div>
                                                </div>
                                                <span className="text-sm font-semibold text-indigo-600 min-w-[60px] text-right">{formatNumber(item.count)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 전체 인기 행사 리스트 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">전체 인기 행사 리스트</h3>
                            <div className="flex items-center gap-4">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">전체 카테고리</option>
                                    <option value="박람회">박람회</option>
                                    <option value="강연/세미나">강연/세미나</option>
                                    <option value="전시/행사">전시/행사</option>
                                    <option value="공연">공연</option>
                                    <option value="축제">축제</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="행사명 검색..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">행사명</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회 수</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약 수</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관심 수</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEvents.map((event) => (
                                        <tr key={event.rank} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${event.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                    event.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                                        event.rank === 3 ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {event.rank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {event.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                                    style={{ backgroundColor: getCategoryColor(event.category) }}
                                                >
                                                    {event.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatNumber(event.views)}회
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatNumber(event.reservations)}건
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatNumber(event.interests)}건
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopularEvents;