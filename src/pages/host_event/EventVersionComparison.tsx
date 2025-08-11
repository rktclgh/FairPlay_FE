import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
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

export const EventVersionComparison: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const version1Id = searchParams.get('v1');
    const version2Id = searchParams.get('v2');

    const [version1Data, setVersion1Data] = useState<VersionData | null>(null);
    const [version2Data, setVersion2Data] = useState<VersionData | null>(null);
    const [loading, setLoading] = useState(true);

    // 두 값이 다른지 확인하는 함수
    const isDifferent = (value1: string | boolean | null, value2: string | boolean | null) => {
        return value1 !== value2;
    };

    // 차이점이 있는 필드에 스타일 적용
    const getFieldStyle = (value1: string | boolean | null, value2: string | boolean | null) => {
        return isDifferent(value1, value2)
            ? 'bg-yellow-50 border-l-4 border-yellow-400 pl-3 rounded-r-md'
            : '';
    };

    // 총 차이점 개수 계산
    const countDifferences = () => {
        if (!version1Data || !version2Data) return 0;

        let count = 0;
        const fieldsToCheck = [
            'eventNameKr', 'eventNameEn', 'startDate', 'endDate', 'eventOutline', 'eventDetail',
            'viewingTime', 'viewingGrade', 'reentryAllowed', 'exitScanRequired',
            'externalTicketName', 'externalTicketUrl', 'policy',
            'managerName', 'phone', 'email', 'registerId'
        ];

        fieldsToCheck.forEach(field => {
            if (isDifferent(version1Data[field as keyof VersionData], version2Data[field as keyof VersionData])) {
                count++;
            }
        });

        return count;
    };

    // Quill 에디터 설정
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline',
        'list', 'bullet',
        'link', 'image'
    ];

    // 서브카테고리 매핑
    const getSubCategories = (mainCategory: string) => {
        const subCategories: Record<string, string[]> = {
            "박람회": [
                "취업/채용", "산업/기술", "유학/이민/해외취업", "프랜차이즈/창업",
                "뷰티/패션", "식품/음료", "반려동물", "교육/도서", "IT/전자", "스포츠/레저", "기타(박람회)"
            ],
            "강연/세미나": [
                "취업/진로", "창업/스타트업", "과학/기술", "자기계발/라이프스타일",
                "인문/문화/예술", "건강/의학", "기타(세미나)"
            ],
            "전시/행사": [
                "미술/디자인", "사진/영상", "공예/수공예", "패션/주얼리", "역사/문화",
                "체험 전시", "아동/가족", "행사/축제", "브랜드 프로모션", "기타(전시/행사)"
            ],
            "공연": [
                "콘서트", "연극/뮤지컬", "클래식/무용", "아동/가족(공연)", "기타(공연)"
            ],
            "축제": [
                "음악 축제", "영화 축제", "문화 축제", "음식 축제", "전통 축제", "지역 축제", "기타(축제)"
            ]
        };
        return subCategories[mainCategory] || [];
    };

    // 임시 데이터 로드
    useEffect(() => {
        setTimeout(() => {
            const mockVersions: Record<string, VersionData> = {
                "1": {
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
                },
                "2": {
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
                },
                "3": {
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
                }
            };

            const version1 = mockVersions[version1Id || ""];
            const version2 = mockVersions[version2Id || ""];

            if (version1 && version2) {
                setVersion1Data(version1);
                setVersion2Data(version2);
            } else {
                navigate('/host/event-version');
                return;
            }

            setLoading(false);
        }, 500);
    }, [version1Id, version2Id, navigate]);

    const handleBack = () => {
        navigate('/host/event-version');
    };

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-full min-h-screen relative">
                    <TopNav />
                    <div className="absolute left-[50px] top-[195px] right-[50px] pb-20 flex items-center justify-center">
                        <div className="text-lg text-gray-600">로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!version1Data || !version2Data) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-full min-h-screen relative">
                    <TopNav />
                    <div className="absolute left-[50px] top-[195px] right-[50px] pb-20 flex items-center justify-center">
                        <div className="text-lg text-gray-600">버전 정보를 찾을 수 없습니다.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-full min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-[50px] [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 버전 비교
                </div>

                {/* 메인 콘텐츠 - 전체 화면 너비 사용 */}
                <div className="absolute left-[50px] top-[195px] right-[50px] pb-20">

                    {/* 비교 헤더 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">버전 비교</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    총 <span className="font-semibold text-yellow-600">{countDifferences()}개</span>의 차이점이 발견되었습니다.
                                </p>
                            </div>
                            <button
                                onClick={handleBack}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-[10px] hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-200"
                            >
                                목록으로 돌아가기
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900 mb-2">버전 1</div>
                                <div className="text-2xl font-bold text-blue-600">{version1Data.version}</div>
                                <div className="text-sm text-gray-600 mt-1">{version1Data.modifiedDate}</div>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${version1Data.status === '승인됨'
                                    ? 'bg-green-100 text-green-800'
                                    : version1Data.status === '승인 대기'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : version1Data.status === '반려'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {version1Data.status}
                                </span>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900 mb-2">버전 2</div>
                                <div className="text-2xl font-bold text-green-600">{version2Data.version}</div>
                                <div className="text-sm text-gray-600 mt-1">{version2Data.modifiedDate}</div>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${version2Data.status === '승인됨'
                                    ? 'bg-green-100 text-green-800'
                                    : version2Data.status === '승인 대기'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : version2Data.status === '반려'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {version2Data.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 두 개의 EventVersionDetail을 나란히 배치 */}
                    <div className="grid grid-cols-2 gap-6">

                        {/* 버전 1 - EventVersionDetail과 완전히 동일한 양식 */}
                        <div className="space-y-8">
                            {/* 행사 정보 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                    행사 정보
                                </h2>
                                <div className="space-y-6">
                                    {/* 행사명(국문) */}
                                    <div className={getFieldStyle(version1Data.eventNameKr, version2Data.eventNameKr)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(국문)
                                        </label>
                                        <input
                                            type="text"
                                            value={version1Data.eventNameKr}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 행사명(영문) */}
                                    <div className={getFieldStyle(version1Data.eventNameEn, version2Data.eventNameEn)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(영문)
                                        </label>
                                        <input
                                            type="text"
                                            value={version1Data.eventNameEn}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 시작일 */}
                                    <div className={getFieldStyle(version1Data.startDate, version2Data.startDate)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            시작일
                                        </label>
                                        <input
                                            type="date"
                                            value={version1Data.startDate}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 종료일 */}
                                    <div className={getFieldStyle(version1Data.endDate, version2Data.endDate)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            종료일
                                        </label>
                                        <input
                                            type="date"
                                            value={version1Data.endDate}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 행사 장소 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 장소
                                        </label>
                                        <div className="space-y-4">
                                            {/* 장소 검색 */}
                                            <div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value="코엑스"
                                                        readOnly
                                                        className="w-full h-[40px] border border-gray-300 rounded-full px-4 pr-12 font-normal text-base outline-none bg-gray-50"
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-16 h-12 flex items-center justify-center bg-transparent"
                                                    >
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            {/* 주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={version1Data.address}
                                                    readOnly
                                                    className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                                />
                                            </div>
                                            {/* 상세주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={version1Data.detailAddress}
                                                    readOnly
                                                    className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* 메인카테고리 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            메인카테고리
                                        </label>
                                        <select
                                            value={version1Data.mainCategory}
                                            disabled
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        >
                                            <option value={version1Data.mainCategory}>{version1Data.mainCategory}</option>
                                        </select>
                                    </div>
                                    {/* 서브카테고리 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            서브카테고리
                                        </label>
                                        <select
                                            value={version1Data.subCategory}
                                            disabled
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        >
                                            <option value={version1Data.subCategory}>{version1Data.subCategory}</option>
                                        </select>
                                    </div>
                                    {/* 세로형 배너 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 이미지 (세로형)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <div className="space-y-2">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="text-sm text-gray-500">이미지 없음</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 가로형 배너 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 이미지 (가로형)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <div className="space-y-2">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="text-sm text-gray-500">이미지 없음</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 행사 개요 */}
                                    <div className={getFieldStyle(version1Data.eventOutline, version2Data.eventOutline)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 개요 (최대 80자)
                                        </label>
                                        <input
                                            type="text"
                                            value={version1Data.eventOutline}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 상세 정보 */}
                                    <div className={`mb-12 ${getFieldStyle(version1Data.eventDetail, version2Data.eventDetail)}`}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            상세 정보
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={version1Data.eventDetail}
                                            readOnly={true}
                                            modules={{ toolbar: false }}
                                            formats={quillFormats}
                                            style={{ height: '150px' }}
                                        />
                                    </div>
                                    {/* 관람시간(분) */}
                                    <div className={getFieldStyle(version1Data.viewingTime, version2Data.viewingTime)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            관람시간(분)
                                        </label>
                                        <input
                                            type="number"
                                            value={version1Data.viewingTime}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 관람등급 */}
                                    <div className={getFieldStyle(version1Data.viewingGrade, version2Data.viewingGrade)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            관람등급
                                        </label>
                                        <select
                                            value={version1Data.viewingGrade}
                                            disabled
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        >
                                            <option value={version1Data.viewingGrade}>{version1Data.viewingGrade}</option>
                                        </select>
                                    </div>
                                    {/* 재입장 허용 여부 */}
                                    <div className={getFieldStyle(version1Data.reentryAllowed, version2Data.reentryAllowed)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            재입장 허용 여부
                                        </label>
                                        <div className="flex items-center h-[54px]">
                                            <input
                                                type="checkbox"
                                                checked={version1Data.reentryAllowed}
                                                disabled
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-700">
                                                재입장 허용
                                            </span>
                                        </div>
                                    </div>
                                    {/* 퇴장 스캔 여부 */}
                                    <div className={getFieldStyle(version1Data.exitScanRequired, version2Data.exitScanRequired)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            퇴장 스캔 여부
                                        </label>
                                        <div className="flex items-center h-[54px]">
                                            <input
                                                type="checkbox"
                                                checked={version1Data.exitScanRequired}
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

                            {/* 외부 링크 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">외부 링크</h2>
                                <div className="space-y-6">
                                    <div className={getFieldStyle(version1Data.externalTicketName, version2Data.externalTicketName)}>
                                        <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트명</label>
                                        <input
                                            type="text"
                                            value={version1Data.externalTicketName}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div className={getFieldStyle(version1Data.externalTicketUrl, version2Data.externalTicketUrl)}>
                                        <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트 URL</label>
                                        <input
                                            type="text"
                                            value={version1Data.externalTicketUrl}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 주최자 정보 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">주최자 정보</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">주최자명</label>
                                        <input
                                            type="text"
                                            value={version1Data.organizerName}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">연락처</label>
                                        <input
                                            type="text"
                                            value={version1Data.organizerContact}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">공식 웹사이트 URL</label>
                                        <input
                                            type="text"
                                            value={version1Data.organizerWebsite}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div className={getFieldStyle(version1Data.policy, version2Data.policy)}>
                                        <label className="block text-[15px] font-bold mb-1">예매 / 취소 / 환불 정책</label>
                                        <textarea
                                            value={version1Data.policy}
                                            readOnly
                                            className="w-full h-[100px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left resize-none text-black font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 담당자 정보 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">담당자 정보</h2>
                                <div className="space-y-6">
                                    <div className={getFieldStyle(version1Data.businessNumber, version2Data.businessNumber)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">사업자 등록 번호</label>
                                        <input
                                            type="text"
                                            value={version1Data.businessNumber}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div className={getFieldStyle(version1Data.managerName, version2Data.managerName)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 이름</label>
                                        <input
                                            type="text"
                                            value={version1Data.managerName}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div className={getFieldStyle(version1Data.phone, version2Data.phone)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">연락처</label>
                                        <input
                                            type="text"
                                            value={version1Data.phone}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div className={getFieldStyle(version1Data.email, version2Data.email)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">이메일</label>
                                        <input
                                            type="email"
                                            value={version1Data.email}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* FairPlay에 등록할 이메일 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-2">FairPlay에 등록할 이메일</h2>
                                <p className="text-sm text-gray-600 mb-6">행사 승인 시 작성된 이메일로 계정이 생성됩니다.</p>
                                <div className="mb-4">
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">이메일</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-[200px] h-[48px] border border-gray-300 rounded-lg px-3 font-normal text-base bg-gray-50 flex items-center text-gray-600">
                                            {version1Data.registerId}
                                        </div>
                                        <span className="text-gray-600 font-medium">
                                            @fair-play.ink
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 버전 2 - EventVersionDetail과 완전히 동일한 양식 */}
                        <div className="space-y-8">
                            {/* 행사 정보 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                    행사 정보
                                </h2>
                                <div className="space-y-6">
                                    {/* 행사명(국문) */}
                                    <div className={getFieldStyle(version1Data.eventNameKr, version2Data.eventNameKr)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(국문)
                                        </label>
                                        <input
                                            type="text"
                                            value={version2Data.eventNameKr}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 행사명(영문) */}
                                    <div className={getFieldStyle(version1Data.eventNameEn, version2Data.eventNameEn)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(영문)
                                        </label>
                                        <input
                                            type="text"
                                            value={version2Data.eventNameEn}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 시작일 */}
                                    <div className={getFieldStyle(version1Data.startDate, version2Data.startDate)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            시작일
                                        </label>
                                        <input
                                            type="date"
                                            value={version2Data.startDate}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 종료일 */}
                                    <div className={getFieldStyle(version1Data.endDate, version2Data.endDate)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            종료일
                                        </label>
                                        <input
                                            type="date"
                                            value={version2Data.endDate}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 행사 장소 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 장소
                                        </label>
                                        <div className="space-y-4">
                                            {/* 장소 검색 */}
                                            <div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value="코엑스"
                                                        readOnly
                                                        className="w-full h-[40px] border border-gray-300 rounded-full px-4 pr-12 font-normal text-base outline-none bg-gray-50"
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-16 h-12 flex items-center justify-center bg-transparent"
                                                    >
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            {/* 주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={version2Data.address}
                                                    readOnly
                                                    className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                                />
                                            </div>
                                            {/* 상세주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={version2Data.detailAddress}
                                                    readOnly
                                                    className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* 메인카테고리 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            메인카테고리
                                        </label>
                                        <select
                                            value={version2Data.mainCategory}
                                            disabled
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        >
                                            <option value={version2Data.mainCategory}>{version2Data.mainCategory}</option>
                                        </select>
                                    </div>
                                    {/* 서브카테고리 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            서브카테고리
                                        </label>
                                        <select
                                            value={version2Data.subCategory}
                                            disabled
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        >
                                            <option value={version2Data.subCategory}>{version2Data.subCategory}</option>
                                        </select>
                                    </div>
                                    {/* 세로형 배너 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 이미지 (세로형)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <div className="space-y-2">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="text-sm text-gray-500">이미지 없음</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 가로형 배너 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 이미지 (가로형)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <div className="space-y-2">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="text-sm text-gray-500">이미지 없음</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 행사 개요 */}
                                    <div className={getFieldStyle(version1Data.eventOutline, version2Data.eventOutline)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 개요 (최대 80자)
                                        </label>
                                        <input
                                            type="text"
                                            value={version2Data.eventOutline}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 상세 정보 */}
                                    <div className={`mb-12 ${getFieldStyle(version1Data.eventDetail, version2Data.eventDetail)}`}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            상세 정보
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={version2Data.eventDetail}
                                            readOnly={true}
                                            modules={{ toolbar: false }}
                                            formats={quillFormats}
                                            style={{ height: '150px' }}
                                        />
                                    </div>
                                    {/* 관람시간(분) */}
                                    <div className={getFieldStyle(version1Data.viewingTime, version2Data.viewingTime)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            관람시간(분)
                                        </label>
                                        <input
                                            type="number"
                                            value={version2Data.viewingTime}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    {/* 관람등급 */}
                                    <div className={getFieldStyle(version1Data.viewingGrade, version2Data.viewingGrade)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            관람등급
                                        </label>
                                        <select
                                            value={version2Data.viewingGrade}
                                            disabled
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        >
                                            <option value={version2Data.viewingGrade}>{version2Data.viewingGrade}</option>
                                        </select>
                                    </div>
                                    {/* 재입장 허용 여부 */}
                                    <div className={getFieldStyle(version1Data.reentryAllowed, version2Data.reentryAllowed)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            재입장 허용 여부
                                        </label>
                                        <div className="flex items-center h-[54px]">
                                            <input
                                                type="checkbox"
                                                checked={version2Data.reentryAllowed}
                                                disabled
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-700">
                                                재입장 허용
                                            </span>
                                        </div>
                                    </div>
                                    {/* 퇴장 스캔 여부 */}
                                    <div className={getFieldStyle(version1Data.exitScanRequired, version2Data.exitScanRequired)}>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            퇴장 스캔 여부
                                        </label>
                                        <div className="flex items-center h-[54px]">
                                            <input
                                                type="checkbox"
                                                checked={version2Data.exitScanRequired}
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

                            {/* 외부 링크 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">외부 링크</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트명</label>
                                        <input
                                            type="text"
                                            value={version2Data.externalTicketName}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트 URL</label>
                                        <input
                                            type="text"
                                            value={version2Data.externalTicketUrl}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 주최자 정보 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">주최자 정보</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">주최자명</label>
                                        <input
                                            type="text"
                                            value={version2Data.organizerName}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">연락처</label>
                                        <input
                                            type="text"
                                            value={version2Data.organizerContact}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">공식 웹사이트 URL</label>
                                        <input
                                            type="text"
                                            value={version2Data.organizerWebsite}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">예매 / 취소 / 환불 정책</label>
                                        <textarea
                                            value={version2Data.policy}
                                            readOnly
                                            className="w-full h-[100px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left resize-none text-black font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 담당자 정보 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">담당자 정보</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">사업자 등록 번호</label>
                                        <input
                                            type="text"
                                            value={version2Data.businessNumber}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 이름</label>
                                        <input
                                            type="text"
                                            value={version2Data.managerName}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">연락처</label>
                                        <input
                                            type="text"
                                            value={version2Data.phone}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">이메일</label>
                                        <input
                                            type="email"
                                            value={version2Data.email}
                                            readOnly
                                            className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* FairPlay에 등록할 이메일 섹션 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-2">FairPlay에 등록할 이메일</h2>
                                <p className="text-sm text-gray-600 mb-6">행사 승인 시 작성된 이메일로 계정이 생성됩니다.</p>
                                <div className="mb-4">
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">이메일</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-[200px] h-[48px] border border-gray-300 rounded-lg px-3 font-normal text-base bg-gray-50 flex items-center text-gray-600">
                                            {version2Data.registerId}
                                        </div>
                                        <span className="text-gray-600 font-medium">
                                            @fair-play.ink
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};