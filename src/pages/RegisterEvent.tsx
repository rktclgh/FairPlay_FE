import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { loadKakaoMap } from "../lib/loadKakaoMap";


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

export const RegisterEvent = () => {
    const [formData, setFormData] = useState({
        eventNameKr: "",
        eventNameEn: "",
        startDate: "",
        endDate: "",
        address: "",
        detailAddress: "",
        eventOutline: null as File | null,
        bannerImageVertical: null as File | null,
        bannerImageHorizontal: null as File | null,
        mainCategory: "",
        subCategory: "",
        businessNumber: "",
        managerName: "",
        phone: "",
        contactEmail: "",
        email: "",

    });

    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);



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
        const { name, value } = e.target;

        // 메인카테고리가 변경되면 서브카테고리 초기화
        if (name === "mainCategory") {
        setFormData(prev => ({
            ...prev,
                [name]: value,
                subCategory: "" // 서브카테고리 초기화
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
        console.log("행사 등록 신청:", formData);
        // TODO: API 호출 로직 추가
        alert("행사 등록 신청이 완료되었습니다.");
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
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 세로형 배너 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    행사 배너 이미지 (세로형)
                                                </label>
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
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                bannerImageVertical: files[0]
                                                            }));
                                                        }
                                                    }}
                                                >
                                                    {formData.bannerImageVertical ? (
                                                        <div className="space-y-2">
                                                            <img 
                                                                src={URL.createObjectURL(formData.bannerImageVertical)} 
                                                                alt="세로형 배너 미리보기" 
                                                                className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                            />
                                                            <p className="text-xs text-green-600">✓ {formData.bannerImageVertical.name}</p>
                                                            <div className="text-sm text-gray-600">
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
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    bannerImageVertical: file
                                                                                }));
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
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
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    bannerImageVertical: file
                                                                                }));
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                                <p className="pl-1">또는 드래그 앤 드롭</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">PNG, JPG, GIF 최대 10MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                        </div>

                                            {/* 가로형 배너 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    행사 배너 이미지 (가로형)
                                                </label>
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
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                bannerImageHorizontal: files[0]
                                                            }));
                                                        }
                                                    }}
                                                >
                                                    {formData.bannerImageHorizontal ? (
                                                        <div className="space-y-2">
                                                            <img 
                                                                src={URL.createObjectURL(formData.bannerImageHorizontal)} 
                                                                alt="가로형 배너 미리보기" 
                                                                className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                            />
                                                            <p className="text-xs text-green-600">✓ {formData.bannerImageHorizontal.name}</p>
                                                            <div className="text-sm text-gray-600">
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
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    bannerImageHorizontal: file
                                                                                }));
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
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
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    bannerImageHorizontal: file
                                                                                }));
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                                <p className="pl-1">또는 드래그 앤 드롭</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">PNG, JPG, GIF 최대 10MB</p>
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
                                                    const file = files[0];
                                                    const allowedTypes = [
                                                        'application/pdf',
                                                        'application/msword',
                                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                                        'application/haansofthwp',
                                                        'application/x-hwp',
                                                        'image/jpeg',
                                                        'image/jpg',
                                                        'image/png'
                                                    ];
                                                    const fileExtension = file.name.toLowerCase().split('.').pop();
                                                    const allowedExtensions = ['pdf', 'doc', 'docx', 'hwp', 'jpg', 'jpeg', 'png'];
                                                    
                                                    if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension || '')) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            eventOutline: file
                                                        }));
                                                    }
                                                }
                                            }}
                                        >
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
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        eventOutline: file
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                    </label>
                                                    <p className="pl-1">또는 드래그 앤 드롭</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF, DOC, DOCX, HWP, JPG, PNG 최대 10MB</p>
                                                {formData.eventOutline && (
                                                    <p className="text-xs text-green-600 mt-1">✓ {formData.eventOutline.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
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
                                        value={formData.businessNumber}
                                        onChange={handleInputChange}
                                        placeholder="사업자등록번호를 입력하세요"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.businessNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
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
                                
                                {/* 두 번째 행 */}
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
                    </div>
                    {/* 폼 컨테이너 끝 */}
                    <div className="flex flex-col items-center space-y-4 mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.eventNameKr || !formData.eventNameEn || !formData.startDate || !formData.endDate || !formData.businessNumber || !formData.managerName || !formData.phone || !formData.contactEmail || !formData.email}
                            className={`px-6 py-2 rounded-[10px] transition-colors text-sm ${formData.eventNameKr && formData.eventNameEn && formData.startDate && formData.endDate && formData.businessNumber && formData.managerName && formData.phone && formData.contactEmail && formData.email
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                                }`}
                        >
                            행사 등록 신청
                        </button>
                        <p className="text-sm text-gray-500 text-center">
                            신청 후 플랫폼 운영자의 승인을 거쳐야 공개됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}; 