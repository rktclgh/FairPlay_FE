import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '../../components/TopNav';
import { HostSideNav } from '../../components/HostSideNav';

const EventVersionManagement: React.FC = () => {
    const navigate = useNavigate();
    const [selectedVersion1, setSelectedVersion1] = useState<string>('');
    const [selectedVersion2, setSelectedVersion2] = useState<string>('');

    // 임시 데이터 - 실제로는 API에서 가져올 데이터
    const versions = [
        { id: '1', version: 'v1.0', nameKo: '2024 서울 IT 컨퍼런스', nameEn: 'Seoul IT Conference 2024', modifiedDate: '2024-01-15', status: '승인됨' },
        { id: '2', version: 'v1.1', nameKo: '2024 서울 IT 컨퍼런스', nameEn: 'Seoul IT Conference 2024', modifiedDate: '2024-02-20', status: '승인 대기' },
        { id: '3', version: 'v2.0', nameKo: '2024 서울 IT 컨퍼런스', nameEn: 'Seoul IT Conference 2024', modifiedDate: '2024-03-10', status: '반려' },
    ];

    const handleCompare = () => {
        if (selectedVersion1 && selectedVersion2) {
            // 버전 ID를 찾기 위해 versions 배열에서 검색
            const version1 = versions.find(v => v.id === selectedVersion1);
            const version2 = versions.find(v => v.id === selectedVersion2);

            if (version1 && version2) {
                navigate(`/host/event-version/comparison?v1=${version1.id}&v2=${version2.id}`);
            }
        }
    };

    const handleViewDetails = (versionId: string) => {
        console.log('상세보기:', versionId);
        // 행사 버전 상세 페이지로 이동
        navigate(`/host/event-version/${versionId}`);
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 버전 관리
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

                    {/* 검색 및 필터 섹션 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                {/* 행사 비교 */}
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
                                                    <option key={version.id} value={version.id}>
                                                        {version.version}
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
                                                    <option key={version.id} value={version.id}>
                                                        {version.version}
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
                                        disabled={!selectedVersion1 || !selectedVersion2}
                                        className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        비교하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 테이블 컨테이너 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-6 gap-4 text-sm font-bold text-gray-700">
                                <div className="text-left w-20">버전 번호</div>
                                <div className="text-left flex-1">행사명(국문)</div>
                                <div className="text-left flex-1">행사명(영문)</div>
                                <div className="text-center w-24">수정일</div>
                                <div className="text-center w-20">상태</div>
                                <div className="text-center w-20">관리</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div className="bg-white">
                            {versions.slice().reverse().map((version, index) => (
                                <div
                                    key={version.id}
                                    className={`grid grid-cols-6 gap-4 py-5 px-6 text-sm items-center ${index !== versions.length - 1 ? "border-b border-gray-200" : ""}`}
                                >
                                    <div className="font-medium text-gray-900 text-left w-20">{version.version}</div>
                                    <div className="text-gray-600 text-left truncate flex-1">{version.nameKo}</div>
                                    <div className="text-gray-600 text-left truncate flex-1">{version.nameEn}</div>
                                    <div className="text-gray-600 text-center w-24">{version.modifiedDate}</div>
                                    <div className="text-center w-20">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${version.status === '승인됨'
                                            ? 'bg-green-100 text-green-800'
                                            : version.status === '승인 대기'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : version.status === '반려'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {version.status}
                                        </span>
                                    </div>
                                    <div className="text-center w-20">
                                        <button
                                            onClick={() => handleViewDetails(version.id)}
                                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs"
                                        >
                                            상세보기
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 하단 정보 */}
                    <div className="mt-6 text-sm text-gray-600">
                        총 <span className="font-bold text-black">{versions.length}</span>개의 버전
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventVersionManagement;
