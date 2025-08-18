import React, { useMemo, useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { useNavigate } from "react-router-dom";

const BoothParticipants: React.FC = () => {
    interface ApprovedBoothItem {
        id: number;
        boothName: string;
        startDate: string;
        endDate: string;
        boothType: string;
        zone: string;
    }

    // 테스트용 더미 데이터 (승인완료된 부스만)
    const [items, setItems] = useState<ApprovedBoothItem[]>([
        { id: 1, boothName: "FoodTech 스타트업 부스", startDate: "2025-02-01", endDate: "2025-02-03", boothType: "스탠다드", zone: "" },
        { id: 2, boothName: "AI 솔루션 체험관", startDate: "2025-02-01", endDate: "2025-02-02", boothType: "프리미엄", zone: "" },
        { id: 3, boothName: "메타버스 체험부스", startDate: "2025-02-02", endDate: "2025-02-04", boothType: "스탠다드", zone: "" },
        { id: 4, boothName: "로보틱스 연구회", startDate: "2025-02-01", endDate: "2025-02-01", boothType: "스탠다드", zone: "" },
        { id: 5, boothName: "클라우드 SaaS 데모", startDate: "2025-02-03", endDate: "2025-02-04", boothType: "프리미엄", zone: "" },
    ]);

    // 삭제/구역 표시 반영 (localStorage에서 상태를 읽어 표시)
    const deletedIds: number[] = (() => {
        try {
            const raw = localStorage.getItem('deletedBoothParticipantIds');
            const arr = JSON.parse(raw || '[]');
            return Array.isArray(arr) ? arr : [];
        } catch {
            return [];
        }
    })();

    const zoneById: Record<string, string> = (() => {
        try {
            const raw = localStorage.getItem('boothZoneById');
            const obj = JSON.parse(raw || '{}');
            return obj && typeof obj === 'object' ? obj : {};
        } catch {
            return {} as Record<string, string>;
        }
    })();

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
        const matchesName = !searchForm.boothName || b.boothName.toLowerCase().includes(searchForm.boothName.toLowerCase());
        const matchesType = !searchForm.boothType || b.boothType === searchForm.boothType;
        const matchesZone = !searchForm.zone || b.zone.toLowerCase().includes(searchForm.zone.toLowerCase());
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
    const handleView = (id: number) => {
        navigate(`/host/booth-participants/${id}`);
    };

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

                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
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
                                    <option value="스탠다드">스탠다드</option>
                                    <option value="프리미엄">프리미엄</option>
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
                                    <div key={b.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: tableColumns as any }}>
                                            <div className="text-gray-900 text-sm text-center whitespace-nowrap">
                                                {b.boothName}
                                                {deletedIds.includes(b.id) && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-200 text-gray-700">삭제됨</span>
                                                )}
                                            </div>
                                            <div className="text-gray-900 text-sm text-center whitespace-nowrap">{b.startDate}</div>
                                            <div className="text-gray-900 text-sm text-center whitespace-nowrap">{b.endDate}</div>
                                            <div className="text-gray-900 text-sm text-center">{b.boothType}</div>
                                            <div className="text-gray-900 text-sm text-center">{zoneById[String(b.id)] || b.zone || ''}</div>
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => handleView(b.id)}
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
            </div>
        </div>
    );
};

export default BoothParticipants;


