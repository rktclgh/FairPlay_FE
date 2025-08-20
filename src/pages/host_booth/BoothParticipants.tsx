import React, { useMemo, useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { useNavigate, useParams } from "react-router-dom";
import { getAllBoothsForHost } from "../../api/boothApi";
import { BoothSummaryForManager } from "../../types/booth";

const BoothParticipants: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    
    // 부스 데이터 상태
    const [items, setItems] = useState<BoothSummaryForManager[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 백엔드에서 데이터 로드
    useEffect(() => {
        if (eventId) {
            setLoading(true);
            getAllBoothsForHost(Number(eventId))
                .then(data => {
                    setItems(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError('참가 부스 목록을 불러오는 데 실패했습니다.');
                    setLoading(false);
                    console.error(err);
                });
        }
    }, [eventId]);

    // 중복 제거한 부스타입 리스트
    const boothTypes = useMemo(() => {
        const types = items.map(b => b.boothTypeName);
        return Array.from(new Set(types));
    }, [items]);

    // 검색 폼 상태
    const [searchForm, setSearchForm] = useState({
        boothName: "",
        boothType: "",
        zone: ""
    });

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // 검색 핸들러
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1);
    };

    // 필터링
    const filteredItems = items.filter(b => {
        const matchesName = !searchForm.boothName || b.boothTitle.toLowerCase().includes(searchForm.boothName.toLowerCase());
        const matchesType = !searchForm.boothType || b.boothTypeName.toLowerCase().includes(searchForm.boothType.toLowerCase());
        const matchesZone = !searchForm.zone || b.location.toLowerCase().includes(searchForm.zone.toLowerCase());
        return matchesName && matchesType && matchesZone;
    });

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentList = filteredItems.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

    const tableColumns = useMemo(() => '200px 160px 160px 120px 90px 100px', []);
    const navigate = useNavigate();
    const handleView = (boothId: number) => {
        navigate(`/host/events/${eventId}/booth-participants/${boothId}`);
    };

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="ml-64 mt-[195px] w-[949px] pb-20">
                        <div className="text-center py-12">로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="ml-64 mt-[195px] w-[949px] pb-20">
                        <div className="text-center py-12 text-red-600">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                <div className="top-[137px] left-64 absolute">
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        참가 부스 목록
                    </h1>
                </div>

                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                <div className="ml-64 mt-[195px] w-[949px] pb-20">
                    {/* 검색 영역 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">검색 조건</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스명</label>
                                <input
                                    type="text"
                                    name="boothName"
                                    value={searchForm.boothName}
                                    onChange={handleSearchChange}
                                    placeholder="부스명 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">구역</label>
                                <input
                                    type="text"
                                    name="zone"
                                    value={searchForm.zone}
                                    onChange={handleSearchChange}
                                    placeholder="구역(A-01 등)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스타입</label>
                                <select
                                    name="boothType"
                                    value={searchForm.boothType}
                                    onChange={handleSearchChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">전체</option>
                                    {boothTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 결과 요약 */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            총 <span className="font-semibold text-blue-600">{filteredItems.length}</span>건의 참가 부스가 있습니다.
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gray-50 border-b">
                            <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: tableColumns as any }}>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">부스명</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">참가 시작일</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">참가 종료일</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">부스 타입</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">구역</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">상세 보기</div>
                            </div>
                        </div>
                        <div>
                            {currentList.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">승인된 참가 부스 데이터가 없습니다.</div>
                            ) : (
                                currentList.map((b) => (
                                    <div key={b.boothId} className="border-b hover:bg-gray-50 transition-colors">
                                        <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: tableColumns as any }}>
                                            <div className="text-gray-900 text-sm text-center whitespace-nowrap">
                                                {b.boothTitle}
                                            </div>
                                            <div className="text-gray-900 text-sm text-center whitespace-nowrap">{b.startDate}</div>
                                            <div className="text-gray-900 text-sm text-center whitespace-nowrap">{b.endDate}</div>
                                            <div className="text-gray-900 text-sm text-center">{b.boothTypeName}</div>
                                            <div className="text-gray-900 text-sm text-center">{b.location}</div>
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => handleView(b.boothId)}
                                                    className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors focus:outline-none text-sm font-medium border border-blue-200 hover:border-blue-300"
                                                    title="상세보기"
                                                >
                                                    상세보기
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {/* 페이지네이션 */}
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-gray-700">
                                총 {filteredItems.length}건 중 {filteredItems.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredItems.length)}건 표시
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    이전
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages
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
                <div className="h-32 md:h-48" />
            </div>
        </div>
    );
};

export default BoothParticipants;


