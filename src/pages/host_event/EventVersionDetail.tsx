import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { loadKakaoMap } from "../../lib/loadKakaoMap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

declare global {
    interface Window {
        kakao: any;
    }
}

interface KakaoPlace {
    id: string;
    place_name: string;
    address_name: string;
    phone?: string;
    x?: string;
    y?: string;
}

interface VersionData {
    id: string;
    version: string;
    nameKo: string;
    nameEn: string;
    modifiedDate: string;
    status: string;
    eventNameKr: string;
    eventNameEn: string;
    startDate: string;
    endDate: string;
    address: string;
    detailAddress: string;
    eventOutline: string;
    eventDetail: string;
    viewingTime: string;
    viewingGrade: string;
    mainCategory: string;
    subCategory: string;
    bannerImageVertical: string | null;
    bannerImageHorizontal: string | null;
    businessNumber: string;
    managerName: string;
    phone: string;
    email: string;
    registerId: string;
    externalTicketName: string;
    externalTicketUrl: string;
    organizerName: string;
    organizerContact: string;
    organizerWebsite: string;
    policy: string;
    reentryAllowed: boolean;
    exitScanRequired: boolean;
}

export const EventVersionDetail: React.FC = () => {
    const { versionId } = useParams<{ versionId: string }>();
    const navigate = useNavigate();
    const [versionData, setVersionData] = useState<VersionData | null>(null);
    const [loading, setLoading] = useState(true);

    // 검색 관련 state들
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Quill 에디터 설정 (읽기 전용)
    const quillFormats = [
        'header',
        'bold', 'italic', 'underline',
        'list', 'bullet',
        'link', 'image'
    ];

    // 카카오맵 장소 검색
    const searchPlaces = () => {
        if (!searchKeyword.trim()) {
            alert('장소명을 입력해주세요!');
            return;
        }

        loadKakaoMap(() => {
            if (!window.kakao?.maps?.services) {
                alert('카카오맵 서비스를 불러올 수 없습니다.');
                return;
            }

            const ps = new window.kakao.maps.services.Places();
            ps.keywordSearch(searchKeyword, (data: KakaoPlace[], status: string) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    setSearchResults(data);
                    setShowSearchResults(true);
                } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                    alert('검색 결과가 없습니다.');
                    setSearchResults([]);
                    setShowSearchResults(false);
                } else {
                    alert('검색 중 오류가 발생했습니다.');
                    setSearchResults([]);
                    setShowSearchResults(false);
                }
            });
        });
    };

    // 장소 선택
    const selectPlace = (place: KakaoPlace) => {
        setVersionData(prev => prev ? ({
            ...prev,
            address: place.address_name,
            detailAddress: ""
        }) : null);
        setSearchKeyword(place.place_name);
        setShowSearchResults(false);
    };

    // 모든 필드를 읽기 전용으로 만들기 위해 handleInputChange 함수 제거
    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    //     // 읽기 전용이므로 수정 불가
    // };

    // 임시 데이터 - 실제로는 API에서 가져올 데이터
    useEffect(() => {
        // 시뮬레이션된 API 호출
        setTimeout(() => {
            // 버전별로 다른 데이터 설정
            let mockData: VersionData;

            if (versionId === '1') {
                mockData = {
                    id: '1',
                    version: 'v1.0',
                    nameKo: '2024 서울 IT 컨퍼런스',
                    nameEn: 'Seoul IT Conference 2024',
                    modifiedDate: '2024-01-15',
                    status: '승인됨',
                    eventNameKr: "2024 서울 IT 컨퍼런스",
                    eventNameEn: "Seoul IT Conference 2024",
                    startDate: "2024-03-15",
                    endDate: "2024-03-17",
                    address: "서울 강남구 삼성동 159",
                    detailAddress: "코엑스 3층 B홀",
                    eventOutline: "2024년 서울에서 개최되는 IT 기술 컨퍼런스입니다.",
                    eventDetail: "AI, 클라우드, 보안 등 다양한 IT 주제를 다루는 컨퍼런스입니다.",
                    viewingTime: "120",
                    viewingGrade: "전체관람가",
                    mainCategory: "강연/세미나",
                    subCategory: "과학/기술",
                    bannerImageVertical: null,
                    bannerImageHorizontal: null,
                    businessNumber: "123-45-67890",
                    managerName: "김행사",
                    phone: "010-1234-5678",
                    email: "event@techconference.com",
                    registerId: "techconference2024",
                    externalTicketName: "",
                    externalTicketUrl: "",
                    organizerName: "테크컨퍼런스 주식회사",
                    organizerContact: "02-1234-5678",
                    organizerWebsite: "https://techconference.com",
                    policy: "예매 후 7일 이내 취소 시 전액 환불",
                    reentryAllowed: true,
                    exitScanRequired: false
                };
                // 검색창에 장소명 설정
                setSearchKeyword("코엑스");
            } else if (versionId === '2') {
                mockData = {
                    id: '2',
                    version: 'v1.1',
                    nameKo: '2024 서울 IT 컨퍼런스',
                    nameEn: 'Seoul IT Conference 2024',
                    modifiedDate: '2024-02-20',
                    status: '승인 대기',
                    eventNameKr: "2024 서울 IT 컨퍼런스 v1.1",
                    eventNameEn: "Seoul IT Conference 2024 v1.1",
                    startDate: "2024-04-20",
                    endDate: "2024-04-22",
                    address: "서울 강남구 삼성동 159",
                    detailAddress: "코엑스 3층 B홀",
                    eventOutline: "2024년 서울에서 개최되는 IT 기술 컨퍼런스 v1.1입니다.",
                    eventDetail: "AI, 클라우드, 보안, 블록체인 등 다양한 IT 주제를 다루는 컨퍼런스입니다.",
                    viewingTime: "150",
                    viewingGrade: "12세이상관람가",
                    mainCategory: "강연/세미나",
                    subCategory: "과학/기술",
                    bannerImageVertical: null,
                    bannerImageHorizontal: null,
                    businessNumber: "123-45-67890",
                    managerName: "박행사",
                    phone: "010-2345-6789",
                    email: "event2@techconference.com",
                    registerId: "techconference2024v2",
                    externalTicketName: "인터파크 티켓",
                    externalTicketUrl: "https://ticket.interpark.com",
                    organizerName: "테크컨퍼런스 주식회사",
                    organizerContact: "02-2345-6789",
                    organizerWebsite: "https://techconference2024.com",
                    policy: "예매 후 14일 이내 취소 시 전액 환불",
                    reentryAllowed: false,
                    exitScanRequired: true
                };
                // 검색창에 장소명 설정
                setSearchKeyword("코엑스");
            } else {
                mockData = {
                    id: '3',
                    version: 'v2.0',
                    nameKo: '2024 서울 IT 컨퍼런스',
                    nameEn: 'Seoul IT Conference 2024',
                    modifiedDate: '2024-03-10',
                    status: '반려',
                    eventNameKr: "2024 서울 IT 컨퍼런스 v2.0",
                    eventNameEn: "Seoul IT Conference 2024 v2.0",
                    startDate: "2024-05-15",
                    endDate: "2024-05-17",
                    address: "서울 강남구 삼성동 159",
                    detailAddress: "코엑스 3층 B홀",
                    eventOutline: "2024년 서울에서 개최되는 IT 기술 컨퍼런스 v2.0입니다.",
                    eventDetail: "AI, 클라우드, 보안, 블록체인, 메타버스 등 최신 IT 주제를 다루는 컨퍼런스입니다.",
                    viewingTime: "180",
                    viewingGrade: "15세이상관람가",
                    mainCategory: "강연/세미나",
                    subCategory: "과학/기술",
                    bannerImageVertical: null,
                    bannerImageHorizontal: null,
                    businessNumber: "123-45-67890",
                    managerName: "이행사",
                    phone: "010-3456-7890",
                    email: "event3@techconference.com",
                    registerId: "techconference2024v3",
                    externalTicketName: "예스24 티켓",
                    externalTicketUrl: "https://ticket.yes24.com",
                    organizerName: "테크컨퍼런스 주식회사",
                    organizerContact: "02-3456-7890",
                    organizerWebsite: "https://techconference2024v2.com",
                    policy: "예매 후 30일 이내 취소 시 전액 환불",
                    reentryAllowed: true,
                    exitScanRequired: false
                };
                // 검색창에 장소명 설정
                setSearchKeyword("코엑스");
            }
            setVersionData(mockData);
            setLoading(false);
        }, 500);
    }, [versionId]);

    // 읽기 전용이므로 handleSubmit 함수 제거
    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     console.log("버전 정보 수정:", versionData);
    //     // TODO: API 호출 로직 추가
    //     alert("버전 정보가 수정되었습니다.");
    // };

    const handleBack = () => {
        navigate('/host/event-version');
    };

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] pb-20 flex items-center justify-center">
                        <div className="text-lg text-gray-600">로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!versionData) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] pb-20 flex items-center justify-center">
                        <div className="text-lg text-gray-600">버전 정보를 찾을 수 없습니다.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 버전 상세
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

                    {/* 버전 정보 헤더 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">버전 정보</h2>
                            <button
                                onClick={handleBack}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-[10px] hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-200"
                            >
                                목록으로 돌아가기
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">버전 번호</label>
                                <div className="text-lg font-semibold text-gray-900">{versionData.version}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">수정일</label>
                                <div className="text-lg font-semibold text-gray-900">{versionData.modifiedDate}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">상태</label>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${versionData.status === '승인됨'
                                    ? 'bg-green-100 text-green-800'
                                    : versionData.status === '승인 대기'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : versionData.status === '반려'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {versionData.status}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">행사명</label>
                                <div className="text-lg font-semibold text-gray-900">{versionData.nameKo}</div>
                            </div>
                        </div>
                    </div>

                    {/* 폼 컨테이너 시작 */}
                    <div className="bg-white">
                        {/* 행사 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                    행사 정보
                                </h2>
                                <div className="grid grid-cols-2 gap-8">
                                    {/* 행사명(국문) */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(국문)
                                        </label>
                                        <input
                                            type="text"
                                            name="eventNameKr"
                                            value={versionData.eventNameKr}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.eventNameKr ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 행사명(영문) */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(영문)
                                        </label>
                                        <input
                                            type="text"
                                            name="eventNameEn"
                                            value={versionData.eventNameEn}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.eventNameEn ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 시작일 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            시작일
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={versionData.startDate}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.startDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 종료일 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            종료일
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={versionData.endDate}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.endDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 행사 장소 */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 장소
                                        </label>

                                        <div className="space-y-4">
                                            {/* 장소 검색 */}
                                            <div>
                                                <div className="relative w-1/2">
                                                    <input
                                                        type="text"
                                                        value={searchKeyword}
                                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                                        placeholder="장소명을 입력하세요"
                                                        className="w-full h-[40px] border border-gray-300 rounded-full px-4 pr-12 font-normal text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                searchPlaces();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={searchPlaces}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600 transition-colors w-16 h-12 flex items-center justify-center bg-transparent"
                                                    >
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* 검색 결과 */}
                                                {showSearchResults && searchResults.length > 0 && (
                                                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto mt-2">
                                                        {searchResults.map((place, index) => (
                                                            <div
                                                                key={index}
                                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                onClick={() => selectPlace(place)}
                                                            >
                                                                <div className="font-semibold text-gray-900">{place.place_name}</div>
                                                                <div className="text-sm text-gray-600 mt-1">{place.address_name}</div>
                                                                {place.phone && (
                                                                    <div className="text-sm text-green-600 mt-1">{place.phone}</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* 주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={versionData.address}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.address ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>

                                            {/* 상세주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    name="detailAddress"
                                                    value={versionData.detailAddress}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.detailAddress ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 카테고리 선택 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 메인카테고리 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    메인카테고리
                                                </label>
                                                <select
                                                    name="mainCategory"
                                                    value={versionData.mainCategory || ""}
                                                    disabled
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.mainCategory ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                >
                                                    <option value={versionData.mainCategory}>{versionData.mainCategory}</option>
                                                </select>
                                            </div>

                                            {/* 서브카테고리 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    서브카테고리
                                                </label>
                                                <select
                                                    name="subCategory"
                                                    value={versionData.subCategory || ""}
                                                    disabled
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.subCategory ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                >
                                                    <option value={versionData.subCategory}>{versionData.subCategory}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 행사 배너 이미지 */}
                                    {/* 세로형 배너 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 이미지 (세로형)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            {versionData.bannerImageVertical ? (
                                                <div className="space-y-2">
                                                    <img
                                                        src={versionData.bannerImageVertical}
                                                        alt="세로형 배너"
                                                        className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                    />
                                                    <p className="text-xs text-green-600">✓ 이미지 업로드됨</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <p className="text-sm text-gray-500">이미지 없음</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 가로형 배너 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 이미지 (가로형)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            {versionData.bannerImageHorizontal ? (
                                                <div className="space-y-2">
                                                    <img
                                                        src={versionData.bannerImageHorizontal}
                                                        alt="가로형 배너"
                                                        className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                    />
                                                    <p className="text-xs text-green-600">✓ 이미지 업로드됨</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <p className="text-sm text-gray-500">이미지 없음</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 행사 개요 */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 개요 (최대 80자)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="eventOutline"
                                                value={versionData.eventOutline || ""}
                                                readOnly
                                                maxLength={80}
                                                className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.eventOutline ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                            />
                                            <div className="absolute right-0 bottom-1 text-xs text-gray-500">
                                                {(versionData.eventOutline?.length || 0)}/80
                                            </div>
                                        </div>
                                    </div>

                                    {/* 상세 정보 */}
                                    <div className="col-span-2 mb-12">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            상세 정보
                                        </label>
                                        <div>
                                            <ReactQuill
                                                theme="snow"
                                                value={versionData.eventDetail || ""}
                                                readOnly={true}
                                                modules={{ toolbar: false }}
                                                formats={quillFormats}
                                                style={{ height: '150px' }}
                                            />
                                        </div>
                                    </div>

                                    {/* 관람시간과 관람등급 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 관람시간(분) */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    관람시간(분)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="viewingTime"
                                                    value={versionData.viewingTime || ""}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.viewingTime ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>

                                            {/* 관람등급 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    관람등급
                                                </label>
                                                <select
                                                    name="viewingGrade"
                                                    value={versionData.viewingGrade || ""}
                                                    disabled
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.viewingGrade ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                >
                                                    <option value={versionData.viewingGrade}>{versionData.viewingGrade}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 재입장 허용 여부와 퇴장 스캔 여부 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 재입장 허용 여부 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    재입장 허용 여부
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <input
                                                        type="checkbox"
                                                        name="reentryAllowed"
                                                        checked={versionData.reentryAllowed}
                                                        disabled
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                                        재입장 허용
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 퇴장 스캔 여부 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    퇴장 스캔 여부
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <input
                                                        type="checkbox"
                                                        name="exitScanRequired"
                                                        checked={versionData.exitScanRequired}
                                                        disabled
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                                        퇴장 시 스캔 필수
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 외부 링크 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">외부 링크</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트명</label>
                                        <input
                                            type="text"
                                            name="externalTicketName"
                                            value={versionData.externalTicketName}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.externalTicketName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트 URL</label>
                                        <input
                                            type="text"
                                            name="externalTicketUrl"
                                            value={versionData.externalTicketUrl}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.externalTicketUrl ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 주최자 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">주최자 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">주최자명</label>
                                        <input
                                            type="text"
                                            name="organizerName"
                                            value={versionData.organizerName}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.organizerName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">연락처</label>
                                        <input
                                            type="text"
                                            name="organizerContact"
                                            value={versionData.organizerContact}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.organizerContact ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-[15px] font-bold mb-1">공식 웹사이트 URL</label>
                                    <input
                                        type="text"
                                        name="organizerWebsite"
                                        value={versionData.organizerWebsite}
                                        readOnly
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.organizerWebsite ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                                <div className="mt-6">
                                    <label className="block text-[15px] font-bold mb-1">예매 / 취소 / 환불 정책</label>
                                    <textarea
                                        name="policy"
                                        value={versionData.policy}
                                        readOnly
                                        className={`w-full h-[100px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left resize-none ${versionData.policy ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 담당자 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">담당자 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    {/* 첫 번째 행 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">사업자 등록 번호</label>
                                        <input
                                            type="text"
                                            name="businessNumber"
                                            value={versionData.businessNumber}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.businessNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 이름</label>
                                        <input
                                            type="text"
                                            name="managerName"
                                            value={versionData.managerName}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.managerName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>

                                    {/* 두 번째 행 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">연락처</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={versionData.phone}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.phone ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">이메일</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={versionData.email}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${versionData.email ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FairPlay에 등록할 이메일 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-2">FairPlay에 등록할 이메일</h2>
                                <p className="text-sm text-gray-600 mb-6">행사 승인 시 작성된 이메일로 계정이 생성됩니다.</p>

                                <div className="mb-4">
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">이메일</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-[200px] h-[48px] border border-gray-300 rounded-lg px-3 font-normal text-base bg-gray-50 flex items-center text-gray-600">
                                            {versionData.registerId}
                                        </div>
                                        <span className="text-gray-600 font-medium">
                                            @fair-play.ink
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 폼 컨테이너 끝 */}

                    {/* 저장 버튼 제거됨 - 읽기 전용 페이지 */}
                </div>
            </div>
        </div>
    );
};
