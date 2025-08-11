import React, { useState } from "react";
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

export const EditEventInfo = () => {
    const [formData, setFormData] = useState({
        eventNameKr: "2025 테크 컨퍼런스",
        eventNameEn: "2025 Tech Conference",
        startDate: "2024-12-15",
        endDate: "2024-12-17",
        address: "",
        detailAddress: "",
        eventOutline: "",
        eventDetail: "",
        viewingTime: "",
        viewingGrade: "",
        mainCategory: "",
        subCategory: "",
        bannerImage: null as File | null,
        businessNumber: "123-45-67890",
        managerName: "김행사",
        phone: "010-1234-5678",
        email: "event@techconference.com",
        registerId: "techconference2025",
        externalTicketName: "",
        externalTicketUrl: "",
        organizerName: "",
        organizerContact: "",
        organizerWebsite: "",
        policy: "",
        reentryAllowed: false,
        exitScanRequired: false
    });

    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        // 메인카테고리가 변경되면 서브카테고리 초기화
        if (name === "mainCategory") {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                subCategory: "" // 서브카테고리 초기화
            }));
        } else if (type === "checkbox") {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
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
        setFormData(prev => ({
            ...prev,
            address: place.address_name,
            detailAddress: ""
        }));
        setSearchKeyword(place.place_name);
        setShowSearchResults(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("행사 정보 수정:", formData);
        // TODO: API 호출 로직 추가
        alert("행사 정보가 수정되었습니다.");
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
            <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 상세 정보
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

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
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 이미지
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                            <div className="space-y-2">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <div className="text-sm text-gray-600">
                                                    <label htmlFor="banner-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                        <span>이미지 업로드</span>
                                                        <input
                                                            id="banner-upload"
                                                            name="bannerImage"
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        bannerImage: file
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    <p className="pl-1">또는 드래그 앤 드롭</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF 최대 10MB</p>
                                            </div>
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
                                                value={formData.eventOutline || ""}
                                                onChange={handleInputChange}
                                                placeholder="행사 개요를 입력하세요"
                                                maxLength={80}
                                                className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.eventOutline ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                            />
                                            <div className="absolute right-0 bottom-1 text-xs text-gray-500">
                                                {(formData.eventOutline?.length || 0)}/80
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
                                                value={formData.eventDetail || ""}
                                                onChange={(content) => setFormData(prev => ({ ...prev, eventDetail: content }))}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder="행사 상세 정보를 입력하세요"
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
                                                    value={formData.viewingTime || ""}
                                                    onChange={handleInputChange}
                                                    placeholder="관람시간을 입력하세요"
                                                    min="30"
                                                    step="10"
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.viewingTime ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>

                                            {/* 관람등급 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    관람등급
                                                </label>
                                                <select
                                                    name="viewingGrade"
                                                    value={formData.viewingGrade || ""}
                                                    onChange={handleInputChange}
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.viewingGrade ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                >
                                                    <option value="">관람등급을 선택하세요</option>
                                                    <option value="전체관람가">전체관람가</option>
                                                    <option value="12세이상관람가">12세이상관람가</option>
                                                    <option value="15세이상관람가">15세이상관람가</option>
                                                    <option value="18세이상관람가">18세이상관람가</option>
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
                                                        checked={formData.reentryAllowed}
                                                        onChange={handleInputChange}
                                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label className="ml-3 text-sm font-medium text-gray-700">
                                                        재입장 허용
                                                    </label>
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
                                                        checked={formData.exitScanRequired}
                                                        onChange={handleInputChange}
                                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label className="ml-3 text-sm font-medium text-gray-700">
                                                        퇴장 시 스캔 필수
                                                    </label>
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
                                            value={formData.externalTicketName}
                                            onChange={handleInputChange}
                                            placeholder="예: 인터파크 티켓"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.externalTicketName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트 URL</label>
                                        <input
                                            type="text"
                                            name="externalTicketUrl"
                                            value={formData.externalTicketUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.externalTicketUrl ? 'text-black font-medium' : 'text-[#0000004c]'}`}
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
                                            value={formData.organizerName}
                                            onChange={handleInputChange}
                                            placeholder="주최자명을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.organizerName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">연락처</label>
                                        <input
                                            type="text"
                                            name="organizerContact"
                                            value={formData.organizerContact}
                                            onChange={handleInputChange}
                                            placeholder="010-0000-0000"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.organizerContact ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-[15px] font-bold mb-1">공식 웹사이트 URL</label>
                                    <input
                                        type="text"
                                        name="organizerWebsite"
                                        value={formData.organizerWebsite}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.organizerWebsite ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                                <div className="mt-6">
                                    <label className="block text-[15px] font-bold mb-1">예매 / 취소 / 환불 정책</label>
                                    <textarea
                                        name="policy"
                                        value={formData.policy}
                                        onChange={handleInputChange}
                                        placeholder="예매, 취소, 환불 정책을 입력하세요"
                                        className={`w-full h-[100px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left resize-none ${formData.policy ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* 담당자 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">담당자 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">담당자명</label>
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
                                        <label className="block text-[15px] font-bold mb-1">연락처</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="010-0000-0000"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.phone ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">사업자등록번호</label>
                                        <input
                                            type="text"
                                            name="businessNumber"
                                            value={formData.businessNumber}
                                            onChange={handleInputChange}
                                            placeholder="사업자등록번호를 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.businessNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">이메일</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="이메일을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.email ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">등록된 아이디</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.registerId ? 'text-black font-medium' : 'text-[#0000004c]'}`}>
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-600 font-medium">{formData.registerId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 폼 컨테이너 끝 */}
                    <div className="flex flex-col items-center space-y-4 mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.eventNameKr || !formData.eventNameEn || !formData.startDate || !formData.endDate || !formData.businessNumber || !formData.managerName || !formData.phone || !formData.email || !formData.registerId}
                            className={`px-6 py-2 rounded-[10px] transition-colors text-sm ${formData.eventNameKr && formData.eventNameEn && formData.startDate && formData.endDate && formData.businessNumber && formData.managerName && formData.phone && formData.email && formData.registerId
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                                }`}
                        >
                            행사 상세 정보 수정
                        </button>
                        <p className="text-sm text-gray-500 text-center">
                            수정된 정보는 즉시 반영됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
