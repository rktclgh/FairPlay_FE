import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '../../components/TopNav';
import { HostSideNav } from '../../components/HostSideNav';
import { eventVersionAPI } from '../../services/eventVersion';
import { dashboardAPI } from '../../services/dashboard';
import type { EventVersion } from '../../services/types/eventVersionType';
import type { Page } from '../../services/types/pageType';
import { toast } from 'react-toastify';

const EventVersionManagement: React.FC = () => {
    const navigate = useNavigate();
    const [eventId, setEventId] = useState<number | null>(null);
    const [versionsPage, setVersionsPage] = useState<Page<EventVersion> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVersion1, setSelectedVersion1] = useState<string>('');
    const [selectedVersion2, setSelectedVersion2] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const fetchEventIdAndVersions = async () => {
            try {
                setLoading(true);
                const myEvent = await dashboardAPI.getMyEventWithDetails();
                if (myEvent && myEvent.eventId) {
                    setEventId(myEvent.eventId);
                    fetchVersions(myEvent.eventId, currentPage);
                } else {
                    setError("담당하는 행사를 찾을 수 없습니다.");
                }
            } catch (err) {
                setError("행사 정보를 불러오는데 실패했습니다.");
                toast.error("행사 정보를 불러올 수 없습니다.");
            }
        };

        fetchEventIdAndVersions();
    }, [currentPage]);

    const fetchVersions = async (id: number, page: number) => {
        try {
            const data = await eventVersionAPI.getEventVersions(id, { page, size: 10 });
            setVersionsPage(data);
        } catch (err) {
            setError("버전 정보를 불러오는데 실패했습니다.");
            toast.error("버전 정보를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = () => {
        if (selectedVersion1 && selectedVersion2 && eventId) {
            if (selectedVersion1 === selectedVersion2) {
                toast.warn("서로 다른 버전을 선택해주세요.");
                return;
            }
            navigate(`/host/event-version/comparison?v1=${selectedVersion1}&v2=${selectedVersion2}`);
        }
    };

    const handleViewDetails = (versionNumber: number) => {
        if (eventId) {
            navigate(`/host/event-version/${versionNumber}`);
        }
    };
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const versions = versionsPage?.content || [];

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 버전 관리
                </div>

                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-bold text-gray-700 whitespace-nowrap">버전 번호</label>
                                        <div className="relative">
                                            <select
                                                value={selectedVersion1}
                                                onChange={(e) => setSelectedVersion1(e.target.value)}
                                                className="w-32 h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                <option value="">선택</option>
                                                {versions.map((version) => (
                                                    <option key={version.versionNumber} value={version.versionNumber}>
                                                        v.{version.versionNumber}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-bold text-gray-700 whitespace-nowrap">버전 번호</label>
                                        <div className="relative">
                                            <select
                                                value={selectedVersion2}
                                                onChange={(e) => setSelectedVersion2(e.target.value)}
                                                className="w-32 h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                <option value="">선택</option>
                                                {versions.map((version) => (
                                                    <option key={version.versionNumber} value={version.versionNumber}>
                                                        v.{version.versionNumber}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCompare}
                                        disabled={!selectedVersion1 || !selectedVersion2 || loading}
                                        className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        비교하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-5 gap-4 text-sm font-bold text-gray-700">
                                <div className="text-left w-20">버전 번호</div>
                                <div className="text-left flex-1">행사명(국문)</div>
                                <div className="text-left flex-1">행사명(영문)</div>
                                <div className="text-center w-40">수정일</div>
                                <div className="text-center w-20">관리</div>
                            </div>
                        </div>

                        <div className="bg-white">
                            {loading ? (
                                <div className="text-center py-10">로딩 중...</div>
                            ) : error ? (
                                <div className="text-center py-10 text-red-500">{error}</div>
                            ) : versions.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">버전 정보가 없습니다.</div>
                            ) : (
                                versions.map((version, index) => (
                                    <div
                                        key={version.eventVersionId}
                                        className={`grid grid-cols-5 gap-4 py-5 px-6 text-sm items-center ${index !== versions.length - 1 ? "border-b border-gray-200" : ""}`}
                                    >
                                        <div className="font-medium text-gray-900 text-left w-20">v.{version.versionNumber}</div>
                                        <div className="text-gray-600 text-left truncate flex-1">{version.snapshot.titleKr}</div>
                                        <div className="text-gray-600 text-left truncate flex-1">{version.snapshot.titleEng}</div>
                                        <div className="text-gray-600 text-center w-40">{new Date(version.updatedAt).toLocaleString()}</div>
                                        <div className="text-center w-20">
                                            <button
                                                onClick={() => handleViewDetails(version.versionNumber)}
                                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs"
                                            >
                                                상세보기
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    {versionsPage && versionsPage.totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                이전
                            </button>
                            {Array.from({ length: versionsPage.totalPages }, (_, i) => i).map(pageNumber => (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`px-3 py-1 text-sm rounded-md ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {pageNumber + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === versionsPage.totalPages - 1}
                                className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                다음
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-sm text-gray-600">
                        총 <span className="font-bold text-black">{versionsPage?.totalElements || 0}</span>개의 버전
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventVersionManagement;
