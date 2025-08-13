import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { loadKakaoMap } from "../../lib/loadKakaoMap";
// kakao 타입은 전역 declarations.d.ts에서 정의됩니다.

interface KakaoPlace {
    id: string;
    place_name: string;
    address_name: string;
    phone?: string;
    x?: string;
    y?: string;
}

export const EventEditRequestDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        eventNameKr: "2025 서울 국제 박람회",
        eventNameEn: "2025 Seoul International Fair",
        startDate: "2025-03-15",
        endDate: "2025-03-20",
        placeName: "코엑스", // 신청 시 넘어온 장소명
        address: "서울특별시 강남구 테헤란로 123",
        detailAddress: "456번지 7층",
        eventOutline: new File([""], "행사개요서.pdf", { type: "application/pdf" }) as File,
        bannerImageVertical: new File([""], "malone.jpg", { type: "image/jpeg" }) as File,
        bannerImageHorizontal: new File([""], "malone1.jpg", { type: "image/jpeg" }) as File,
        mainCategory: "박람회",
        subCategory: "산업/기술",
        businessNumber: "123-45-67890",
        managerName: "김철수",
        phone: "010-1234-5678",
        contactEmail: "kim@example.com",
        email: "seoulfair2025",
    });

    const [searchKeyword, setSearchKeyword] = useState<string>(formData.placeName);
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
            placeName: place.place_name,
            address: place.address_name,
            detailAddress: ""
        }));
        setSearchKeyword(place.place_name);
        setShowSearchResults(false);
    };

    // 수정 승인 처리
    const handleApprove = async () => {
        console.log('수정 승인 처리:', id);
        // TODO: 수정 승인 API 호출
        alert('행사 수정이 승인되었습니다.');
        navigate('/admin_dashboard/event-edit-requests');
    };

    // 수정 반려 처리
    const handleReject = async () => {
        console.log('수정 반려 처리:', id);
        // TODO: 수정 반려 API 호출
        alert('행사 수정이 반려되었습니다.');
        navigate('/admin_dashboard/event-edit-requests');
    };

    // 목록으로 돌아가기
    const handleBackToList = () => {
        navigate('/admin_dashboard/event-edit-requests');
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 목록으로 돌아가기 버튼 */}
                <div className="absolute top-[137px] left-64">
                    <button
                        onClick={handleBackToList}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        목록으로
                    </button>
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">

                    {/* 폼 컨테이너 시작 */}
                    <div className="bg-white space-y-6">
                        {/* 행사 정보 섹션 */}
                        <div>
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
                                            readOnly
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
                                            readOnly
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
                                            readOnly
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
                                            readOnly
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
                                                        readOnly
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={searchPlaces}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600 transition-colors w-16 h-12 flex items-center justify-center bg-transparent"
                                                        disabled
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
                                                    readOnly
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
                                                    disabled
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
                                                    disabled
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.subCategory
                                                        ? 'text-black font-medium'
                                                        : 'text-[#0000004c]'
                                                        }`}
                                                >
                                                    <option value="">서브카테고리를 선택하세요</option>
                                                    {getSubCategories(formData.mainCategory).map((subCategory: string, index: number) => (
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
                                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors relative min-h-[200px] flex items-center justify-center"
                                                >
                                                    {formData.bannerImageVertical ? (
                                                        <div className="space-y-2">
                                                            <img
                                                                src="/images/malone.jpg"
                                                                alt="세로형 배너 미리보기"
                                                                className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                            />
                                                            <p className="text-xs text-green-600">✓ {formData.bannerImageVertical.name}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <p className="text-sm text-gray-600">이미지가 업로드되었습니다</p>
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
                                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors min-h-[200px] flex items-center justify-center"
                                                >
                                                    {formData.bannerImageHorizontal ? (
                                                        <div className="space-y-2">
                                                            <img
                                                                src="/images/malone1.jpg"
                                                                alt="가로형 배너 미리보기"
                                                                className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                            />
                                                            <p className="text-xs text-green-600">✓ {formData.bannerImageHorizontal.name}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <p className="text-sm text-gray-600">이미지가 업로드되었습니다</p>
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
                                        >
                                            <div className="space-y-2">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-sm text-gray-600">파일이 업로드되었습니다</p>
                                                <p className="text-xs text-green-600">✓ {formData.eventOutline.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 담당자 정보 섹션 */}
                        <div>
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
                                            readOnly
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
                                            readOnly
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
                                            readOnly
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
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FairPlay에 등록할 이메일 섹션 */}
                        <div>
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
                                            readOnly
                                        />
                                        <span className="text-gray-600 font-medium">
                                            @fair-play.ink
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 수정 승인/반려 버튼 섹션 */}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleReject}
                            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            수정 반려
                        </button>
                        <button
                            onClick={handleApprove}
                            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            수정 승인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventEditRequestDetail;
