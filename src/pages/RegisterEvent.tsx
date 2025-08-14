import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { loadKakaoMap } from "../lib/loadKakaoMap";
import { eventAPI } from "../services/event";
import type { EventApplyRequestDto } from "../services/types/eventType";
import { toast } from "react-toastify";
import { useFileUpload } from "../hooks/useFileUpload";
import { businessAPI, BusinessVerificationRequest } from "../services/business";


declare global {
    interface Window {
        kakao: any;
    }
}

interface KakaoPlace {
    id: string;
    place_name: string;
    address_name: string;
    road_address_name?: string; // 도로명 주소
    phone?: string;
    x?: string; // 경도 (longitude)
    y?: string; // 위도 (latitude)
}

export const RegisterEvent = () => {
    const [formData, setFormData] = useState({
        eventNameKr: "",
        eventNameEn: "",
        startDate: "",
        endDate: "",
        address: "",
        detailAddress: "",
        mainCategory: "",
        subCategory: "",
        businessNumber: "",
        businessName: "",
        businessDate: "",
        managerName: "",
        phone: "",
        contactEmail: "",
        email: "",
        // 카카오맵에서 받은 장소 정보
        placeName: "",
        latitude: "",
        longitude: "",
        placeUrl: "",
    });

    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    
    // 파일 업로드 훅 사용
    const { 
        uploadedFiles, 
        isUploading, 
        uploadFile, 
        removeFile, 
        getFileByUsage, 
        getFileUploadDtos,
        clearAllFiles 
    } = useFileUpload();



    // 카테고리 매핑 함수
    const getCategoryIds = (mainCategory: string, subCategory: string) => {
        // 메인 카테고리 ID 매핑
        const mainCategoryMap: Record<string, number> = {
            "박람회": 1,
            "강연/세미나": 2,
            "전시/행사": 3,
            "공연": 4,
            "축제": 5
        };

        // 서브 카테고리 ID 매핑 (추정값)
        const subCategoryMap: Record<string, Record<string, number>> = {
            "박람회": {
                "취업/채용": 101,
                "산업/기술": 102,
                "유학/이민/해외취업": 103,
                "프랜차이즈/창업": 104,
                "뷰티/패션": 105,
                "식품/음료": 106,
                "반려동물": 107,
                "교육/도서": 108,
                "IT/전자": 109,
                "스포츠/레저": 110,
                "기타(박람회)": 111
            },
            "강연/세미나": {
                "취업/진로": 201,
                "창업/스타트업": 202,
                "과학/기술": 203,
                "자기계발/라이프스타일": 204,
                "인문/문화/예술": 205,
                "건강/의학": 206,
                "기타(세미나)": 207
            },
            "전시/행사": {
                "미술/디자인": 301,
                "사진/영상": 302,
                "공예/수공예": 303,
                "패션/주얼리": 304,
                "역사/문화": 305,
                "체험 전시": 306,
                "아동/가족": 307,
                "행사/축제": 308,
                "브랜드 프로모션": 309,
                "기타(전시/행사)": 310
            },
            "공연": {
                "콘서트": 401,
                "연극/뮤지컬": 402,
                "클래식/무용": 403,
                "아동/가족(공연)": 404,
                "기타(공연)": 405
            },
            "축제": {
                "음악 축제": 501,
                "영화 축제": 502,
                "문화 축제": 503,
                "음식 축제": 504,
                "전통 축제": 505,
                "지역 축제": 506,
                "기타(축제)": 507
            }
        };

        return {
            mainCategoryId: mainCategoryMap[mainCategory] || null,
            subCategoryId: subCategoryMap[mainCategory]?.[subCategory] || null
        };
    };

    // 서브카테고리 매핑 (EventOverview.tsx와 동일)
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

    // 파일 업로드 핸들러
    const handleFileUpload = async (file: File, usage: string) => {
        await uploadFile(file, usage);
    };

    // 파일 제거 핸들러
    const handleFileRemove = (usage: string) => {
        removeFile(usage);
    };

    // 날짜를 YYYYMMDD 형식으로 변환
    const formatDateToYYYYMMDD = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    // 전화번호 포맷팅 함수 (대시 자동 입력)
    const formatPhoneNumber = (value: string): string => {
        // 숫자만 추출
        const phoneNumber = value.replace(/[^\d]/g, '');
        
        // 길이에 따라 포맷팅
        if (phoneNumber.length <= 3) {
            return phoneNumber;
        } else if (phoneNumber.length <= 7) {
            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
        } else if (phoneNumber.length <= 11) {
            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;
        } else {
            // 11자리 초과 시 잘라내기
            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
        }
    };

    // 전화번호 대시 제거 함수 (내부 처리용)
    const removePhoneDashes = (phoneNumber: string): string => {
        return phoneNumber.replace(/[^\d]/g, '');
    };

    // 사업자 등록번호 검증 함수 (내부 사용)
    const verifyBusinessNumber = async (businessData: BusinessVerificationRequest) => {
        try {
            console.log('사업자 검증 API 호출 전:', businessData);
            const result = await businessAPI.verifyBusiness(businessData);
            console.log('사업자 검증 API 응답:', result);
            console.log('검증 결과 (result.valid):', result.valid);
            return result.valid;
        } catch (error) {
            console.error('사업자 정보 검증 실패:', error);
            return false;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let processedValue = value;

        // 전화번호 입력 시 자동 포맷팅
        if (name === "phone") {
            processedValue = formatPhoneNumber(value);
        }

        // 메인카테고리가 변경되면 서브카테고리 초기화
        if (name === "mainCategory") {
        setFormData(prev => ({
            ...prev,
                [name]: processedValue,
                subCategory: "" // 서브카테고리 초기화
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: processedValue
            }));
        }
    };

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
        // 도로명 주소가 있으면 우선 사용, 없으면 지번 주소 사용
        const preferredAddress = place.road_address_name || place.address_name;
        
        setFormData(prev => ({
            ...prev,
            address: preferredAddress,
            placeName: place.place_name,
            latitude: place.y || "", // 카카오맵에서 y가 위도
            longitude: place.x || "", // 카카오맵에서 x가 경도
            placeUrl: `https://place.map.kakao.com/${place.id}`, // 카카오맵 장소 URL
            detailAddress: ""
        }));
        setSearchKeyword(place.place_name);
        setShowSearchResults(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // 폼 데이터 검증
            if (!formData.eventNameKr || !formData.eventNameEn || !formData.startDate || 
                !formData.endDate || !formData.businessNumber || !formData.businessName ||
                !formData.businessDate || !formData.managerName || 
                !formData.phone || !formData.contactEmail || !formData.email) {
                toast.error("필수 항목을 모두 입력해주세요.");
                return;
            }

            // 사업자 등록번호 검증
            const businessDateFormatted = formatDateToYYYYMMDD(formData.businessDate);
            const businessVerificationData: BusinessVerificationRequest = {
                businessNumber: formData.businessNumber,
                businessName: formData.businessName,
                businessDate: businessDateFormatted
            };

            console.log("사업자 정보 검증 중...", businessVerificationData);
            const isBusinessVerified = await verifyBusinessNumber(businessVerificationData);
            console.log("사업자 검증 결과:", isBusinessVerified);

            // 카테고리 ID 매핑
            const categoryIds = getCategoryIds(formData.mainCategory, formData.subCategory);

            // 날짜를 YYYY-MM-DD 형식으로 변환 (LocalDate용)
            const formatDateForBackend = (dateString: string): string => {
                if (!dateString) return "";
                // input[type="date"]에서 이미 YYYY-MM-DD 형식으로 오므로 그대로 사용
                return dateString;
            };

            // businessDate를 YYYY-MM-DD 형식으로 변환
            const businessDateForBackend = formData.businessDate; // 이미 YYYY-MM-DD 형식

            // API 요청 데이터 구성
            const requestData: EventApplyRequestDto = {
                eventEmail: `${formData.email}@fair-play.ink`,
                businessNumber: formData.businessNumber,
                businessName: formData.businessName,
                businessDate: businessDateForBackend, // YYYY-MM-DD 형식으로 전송
                verified: isBusinessVerified, // 검증 결과 설정
                managerName: formData.managerName,
                email: formData.contactEmail,
                contactNumber: removePhoneDashes(formData.phone), // 대시 제거 적용
                titleKr: formData.eventNameKr,
                titleEng: formData.eventNameEn,
                startDate: formatDateForBackend(formData.startDate), // YYYY-MM-DD 형식
                endDate: formatDateForBackend(formData.endDate), // YYYY-MM-DD 형식
                
                // 장소 정보 직접 전송
                locationId: null,
                address: formData.address || undefined,
                placeName: formData.placeName || undefined,
                latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
                longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
                placeUrl: formData.placeUrl || undefined,
                locationDetail: formData.detailAddress || undefined,
                
                mainCategoryId: categoryIds.mainCategoryId || null,
                subCategoryId: categoryIds.subCategoryId || null,
                tempFiles: getFileUploadDtos(), // 업로드된 파일 정보 추가
            };

            console.log("행사 등록 신청 데이터:", requestData);

            // API 호출
            const response = await eventAPI.submitEventApplication(requestData);
            
            console.log("행사 등록 신청 성공:", response);
            toast.success("행사 등록 신청이 완료되었습니다. 승인 검토 후 연락드리겠습니다.");
            
            // 폼 초기화 (선택사항)
            setFormData({
                eventNameKr: "",
                eventNameEn: "",
                startDate: "",
                endDate: "",
                address: "",
                detailAddress: "",
                mainCategory: "",
                subCategory: "",
                businessNumber: "",
                businessName: "",
                businessDate: "",
                managerName: "",
                phone: "",
                contactEmail: "",
                email: "",
                // 카카오맵에서 받은 장소 정보
                placeName: "",
                latitude: "",
                longitude: "",
                placeUrl: "",
            });
            
            // 업로드된 파일들 초기화
            clearAllFiles();
            
            // 검색 관련 state 초기화
            setSearchKeyword("");
            setSearchResults([]);
            setShowSearchResults(false);
        } catch (error) {
            console.error("행사 등록 신청 실패:", error);
            // axios 인터셉터에서 자동으로 toast.error()가 호출되므로 여기서는 별도 처리 불필요
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
            <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-[153px] [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 등록 신청
                </div>

                {/* 메인 콘텐츠 */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[195px] w-[949px]">

                    {/* 폼 컨테이너 시작 */}
                    <form onSubmit={handleSubmit} className="bg-white">
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
                                        value={formData.eventNameKr}
                                        onChange={handleInputChange}
                                        placeholder="국문 행사명을 입력하세요"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.eventNameKr ? 'text-black font-medium' : 'text-[#0000004c]'}`}
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
                                        value={formData.eventNameEn}
                                        onChange={handleInputChange}
                                        placeholder="영문 행사명을 입력하세요"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.eventNameEn ? 'text-black font-medium' : 'text-[#0000004c]'}`}
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
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.startDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
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
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.endDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
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
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {place.road_address_name || place.address_name}
                                                                </div>
                                                                {place.road_address_name && place.address_name !== place.road_address_name && (
                                                                    <div className="text-xs text-gray-400 mt-1">
                                                                        (지번: {place.address_name})
                                                                    </div>
                                                                )}
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
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="기본 주소"
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.address ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>

                                            {/* 상세주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    name="detailAddress"
                                                    value={formData.detailAddress}
                                                    onChange={handleInputChange}
                                                    placeholder="상세 주소"
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.detailAddress ? 'text-black font-medium' : 'text-[#0000004c]'}`}
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
                                                    value={formData.mainCategory || ""}
                                                    onChange={handleInputChange}
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.mainCategory ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                >
                                                    <option value="">메인카테고리를 선택하세요</option>
                                                    <option value="박람회">박람회</option>
                                                    <option value="강연/세미나">강연/세미나</option>
                                                    <option value="전시/행사">전시/행사</option>
                                                    <option value="공연">공연</option>
                                                    <option value="축제">축제</option>
                                                </select>
                                        </div>

                                            {/* 서브카테고리 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    서브카테고리
                                                </label>
                                                <select
                                                    name="subCategory"
                                                    value={formData.subCategory || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!formData.mainCategory}
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${!formData.mainCategory
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : formData.subCategory
                                                            ? 'text-black font-medium'
                                                            : 'text-[#0000004c]'
                                                        }`}
                                                >
                                                    <option value="">
                                                        {!formData.mainCategory
                                                            ? "메인카테고리를 먼저 선택하세요"
                                                            : "서브카테고리를 선택하세요"
                                                        }
                                                    </option>
                                                    {formData.mainCategory && getSubCategories(formData.mainCategory).map((subCategory: string, index: number) => (
                                                        <option key={index} value={subCategory}>
                                                            {subCategory}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 행사 배너 이미지 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 세로형 배너 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    행사 배너 이미지 (세로형)
                                                </label>
                                                <span className="[font-family:'Roboto',Helvetica] font-medium text-indigo-800 text-[13px] leading-[30px] tracking-[0] block text-left mb-1">사이즈: 320*400</span>
                                                <div 
                                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative"
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                                                    }}
                                                    onDragLeave={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                                    }}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                                        const files = e.dataTransfer.files;
                                                        if (files && files[0] && files[0].type.startsWith('image/')) {
                                                            handleFileUpload(files[0], 'thumbnail');
                                                        }
                                                    }}
                                                >
                                                    {getFileByUsage('thumbnail') ? (
                                                        <div className="space-y-2">
                                                            <img 
                                                                src={getFileByUsage('thumbnail')?.url} 
                                                                alt="세로형 배너 미리보기" 
                                                                className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                            />
                                                            <p className="text-xs text-green-600">✓ {getFileByUsage('thumbnail')?.name}</p>
                                                            <div className="text-sm text-gray-600 space-x-2">
                                                                <label htmlFor="banner-vertical-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                                    <span>이미지 변경</span>
                                                                    <input
                                                                        id="banner-vertical-upload"
                                                                        name="bannerImageVertical"
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="sr-only"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                handleFileUpload(file, 'thumbnail');
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleFileRemove('thumbnail')}
                                                                    className="text-red-600 hover:text-red-500"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <div className="text-sm text-gray-600">
                                                                <label htmlFor="banner-vertical-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                                    <span>이미지 업로드</span>
                                                                    <input
                                                                        id="banner-vertical-upload"
                                                                        name="bannerImageVertical"
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="sr-only"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                handleFileUpload(file, 'thumbnail');
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                                <p className="pl-1">또는 드래그 앤 드롭</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">이미지 파일 (PNG, JPG, GIF) 최대 5MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                        </div>

                                            {/* 가로형 배너 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    행사 배너 이미지 (가로형)
                                                </label>
                                                <span className="[font-family:'Roboto',Helvetica] font-medium text-indigo-800 text-[13px] leading-[30px] tracking-[0] block text-left mb-1">사이즈: 1920*1080</span>

                                                <div 
                                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative"
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                                                    }}
                                                    onDragLeave={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                                    }}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                                        const files = e.dataTransfer.files;
                                                        if (files && files[0] && files[0].type.startsWith('image/')) {
                                                            handleFileUpload(files[0], 'banner');
                                                        }
                                                    }}
                                                >
                                                    {getFileByUsage('banner') ? (
                                                        <div className="space-y-2">
                                                            <img 
                                                                src={getFileByUsage('banner')?.url} 
                                                                alt="가로형 배너 미리보기" 
                                                                className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                            />
                                                            <p className="text-xs text-green-600">✓ {getFileByUsage('banner')?.name}</p>
                                                            <div className="text-sm text-gray-600 space-x-2">
                                                                <label htmlFor="banner-horizontal-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                                    <span>이미지 변경</span>
                                                                    <input
                                                                        id="banner-horizontal-upload"
                                                                        name="bannerImageHorizontal"
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="sr-only"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                handleFileUpload(file, 'banner');
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleFileRemove('banner')}
                                                                    className="text-red-600 hover:text-red-500"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <div className="text-sm text-gray-600">
                                                                <label htmlFor="banner-horizontal-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                                    <span>이미지 업로드</span>
                                                                    <input
                                                                        id="banner-horizontal-upload"
                                                                        name="bannerImageHorizontal"
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="sr-only"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                handleFileUpload(file, 'banner');
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                                <p className="pl-1">또는 드래그 앤 드롭</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">이미지 파일 (PNG, JPG, GIF) 최대 5MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        </div>

                                    {/* 행사 개요서 */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 개요서
                                        </label>
                                        <div 
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                                const files = e.dataTransfer.files;
                                                if (files && files[0]) {
                                                    handleFileUpload(files[0], 'application_file');
                                                }
                                            }}
                                        >
                                            {getFileByUsage('application_file') ? (
                                                <div className="space-y-2">
                                                    <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-xs text-green-600">✓ {getFileByUsage('application_file')?.name}</p>
                                                    <div className="text-sm text-gray-600 space-x-2">
                                                        <label htmlFor="event-outline-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                            <span>파일 변경</span>
                                                            <input
                                                                id="event-outline-upload"
                                                                name="eventOutline"
                                                                type="file"
                                                                accept=".pdf,.doc,.docx,.hwp,.jpg,.jpeg,.png"
                                                                className="sr-only"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        handleFileUpload(file, 'application_file');
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFileRemove('application_file')}
                                                            className="text-red-600 hover:text-red-500"
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div className="text-sm text-gray-600">
                                                        <label htmlFor="event-outline-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                            <span>파일 업로드</span>
                                                            <input
                                                                id="event-outline-upload"
                                                                name="eventOutline"
                                                                type="file"
                                                                accept=".pdf,.doc,.docx,.hwp,.jpg,.jpeg,.png"
                                                                className="sr-only"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        handleFileUpload(file, 'application_file');
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <p className="pl-1">또는 드래그 앤 드롭</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">문서/이미지 파일 (PDF, DOC, DOCX, HWP, JPG, PNG) 최대 20MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* 사업자 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">사업자 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    {/* 첫 번째 행 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">사업자 등록번호</label>
                                        <input
                                            type="text"
                                            name="businessNumber"
                                            value={formData.businessNumber}
                                            onChange={handleInputChange}
                                            placeholder="0000000000 (10자리 숫자)"
                                            maxLength={10}
                                            pattern="[0-9]{10}"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.businessNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">대표자 성명</label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleInputChange}
                                            placeholder="대표자명을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.businessName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    
                                    {/* 두 번째 행 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">개업일자</label>
                                        <input
                                            type="date"
                                            name="businessDate"
                                            value={formData.businessDate}
                                            onChange={handleInputChange}
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.businessDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div></div>
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
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 이름</label>
                                        <input
                                            type="text"
                                            name="managerName"
                                            value={formData.managerName}
                                            onChange={handleInputChange}
                                            placeholder="담당자명을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.managerName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">연락처</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="010-0000-0000"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.phone ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    
                                    {/* 두 번째 행 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">이메일</label>
                                        <input
                                            type="email"
                                            name="contactEmail"
                                            value={formData.contactEmail || ""}
                                            onChange={handleInputChange}
                                            placeholder="담당자 이메일을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.contactEmail ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div></div>
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
                                        <input
                                            type="text"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="example"
                                            className="w-[200px] h-[48px] border border-gray-300 rounded-lg px-3 font-normal text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        />
                                        <span className="text-gray-600 font-medium">
                                            @fair-play.ink
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* 폼 컨테이너 끝 */}
                        <div className="flex flex-col items-center space-y-4 mt-8">
                            <button
                                type="submit"
                                disabled={!formData.eventNameKr || !formData.eventNameEn || !formData.startDate || !formData.endDate || !formData.businessNumber || !formData.businessName || !formData.businessDate || !formData.managerName || !formData.phone || !formData.contactEmail || !formData.email || isUploading}
                                className={`px-6 py-2 rounded-[10px] transition-colors text-sm flex items-center space-x-2 ${formData.eventNameKr && formData.eventNameEn && formData.startDate && formData.endDate && formData.businessNumber && formData.businessName && formData.businessDate && formData.managerName && formData.phone && formData.contactEmail && formData.email && !isUploading
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-400 text-white cursor-not-allowed'
                                    }`}
                            >
                                {isUploading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                <span>{isUploading ? '파일 업로드 중...' : '행사 등록 신청'}</span>
                            </button>
                            <p className="text-sm text-gray-500 text-center">
                                신청 후 플랫폼 운영자의 승인을 거쳐야 공개됩니다.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}; 