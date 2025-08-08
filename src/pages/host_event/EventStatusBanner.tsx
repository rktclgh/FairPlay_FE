import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { Image as ImageIcon } from "lucide-react";

export const EventStatusBanner = () => {
    const [isPublic, setIsPublic] = useState(true);
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string>("");
    const [vipBannerForm, setVipBannerForm] = useState({
        companyName: "",
        contactPerson: "",
        phone: "",
        email: "",
        bannerType: "",
        startDate: "",
        endDate: "",
        description: ""
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setBannerPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // 저장 로직 구현
        console.log("저장:", { isPublic, bannerImage });
    };

    const handleVipBannerSubmit = () => {
        // VIP 배너 신청 로직 구현
        console.log("VIP 배너 신청:", vipBannerForm);
        alert("VIP 배너 신청이 접수되었습니다.");
    };

    const handleVipBannerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setVipBannerForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
            <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    배너/상태 관리
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px]">

                    {/* 행사 상태 설정 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">행사 상태 설정</h2>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left">행사 노출 여부</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        비공개로 설정하면 사용자는 행사 상세 페이지에 접근할 수 없습니다.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-sm font-medium ${!isPublic ? 'text-gray-900' : 'text-gray-400'}`}>
                                        비공개
                                    </span>
                                    <button
                                        onClick={() => setIsPublic(!isPublic)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isPublic ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1/2 left-1 h-6 w-6 bg-white rounded-full shadow-lg transition-transform duration-200 ease-in-out transform -translate-y-1/2 ${isPublic ? 'translate-x-6' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                    <span className={`text-sm font-medium ${isPublic ? 'text-gray-900' : 'text-gray-400'}`}>
                                        공개
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">현재 상태</h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                진행중
                            </span>
                        </div>
                    </div>

                    {/* 배너 이미지 설정 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">배너 이미지 설정</h2>

                        <div className="mb-4">
                            <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">행사 상단 배너 이미지</h3>
                            <p className="text-xs text-gray-500">권장 크기: 1440x300px (웹/모바일 모두 대응)</p>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                            {bannerPreview ? (
                                <div className="relative">
                                    <img
                                        src={bannerPreview}
                                        alt="배너 미리보기"
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            setBannerImage(null);
                                            setBannerPreview("");
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <label htmlFor="banner-upload" className="cursor-pointer">
                                        <span className="text-sm font-medium text-gray-900 hover:text-blue-600">
                                            클릭하여 이미지 업로드
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            또는 파일을 드래그하여 업로드
                                        </p>
                                    </label>
                                    <input
                                        id="banner-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* VIP 배너 신청 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">VIP 배너 신청(임시 화면)</h2>

                        <div className="grid grid-cols-2 gap-6">
                            {/* 회사명 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    회사명 *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={vipBannerForm.companyName}
                                    onChange={handleVipBannerInputChange}
                                    placeholder="회사명을 입력하세요"
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${vipBannerForm.companyName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                />
                            </div>

                            {/* 담당자명 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    담당자명 *
                                </label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    value={vipBannerForm.contactPerson}
                                    onChange={handleVipBannerInputChange}
                                    placeholder="담당자명을 입력하세요"
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${vipBannerForm.contactPerson ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                />
                            </div>

                            {/* 연락처 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    연락처 *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={vipBannerForm.phone}
                                    onChange={handleVipBannerInputChange}
                                    placeholder="010-0000-0000"
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${vipBannerForm.phone ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                />
                            </div>

                            {/* 이메일 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    이메일 *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={vipBannerForm.email}
                                    onChange={handleVipBannerInputChange}
                                    placeholder="example@company.com"
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${vipBannerForm.email ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                />
                            </div>

                            {/* 배너 유형 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    배너 유형 *
                                </label>
                                <select
                                    name="bannerType"
                                    value={vipBannerForm.bannerType}
                                    onChange={handleVipBannerInputChange}
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${vipBannerForm.bannerType ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                >
                                    <option value="">배너 유형을 선택하세요</option>
                                    <option value="main-banner">메인 배너</option>
                                    <option value="side-banner">사이드 배너</option>
                                    <option value="popup-banner">팝업 배너</option>
                                    <option value="floating-banner">플로팅 배너</option>
                                </select>
                            </div>

                            {/* 시작일 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    시작일 *
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={vipBannerForm.startDate}
                                    onChange={handleVipBannerInputChange}
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${vipBannerForm.startDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                />
                            </div>

                            {/* 종료일 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    종료일 *
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={vipBannerForm.endDate}
                                    onChange={handleVipBannerInputChange}
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${vipBannerForm.endDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                />
                            </div>
                        </div>

                        {/* 상세 설명 */}
                        <div className="mt-6">
                            <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                상세 설명
                            </label>
                            <textarea
                                name="description"
                                value={vipBannerForm.description}
                                onChange={handleVipBannerInputChange}
                                placeholder="배너 신청 목적과 요구사항을 상세히 입력해주세요"
                                rows={4}
                                className={`w-full border-0 border-b border-[#0000001a] rounded-none pl-0 pr-0 font-normal text-base bg-transparent outline-none text-left resize-none ${vipBannerForm.description ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                            />
                        </div>

                        {/* VIP 배너 신청 버튼 */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleVipBannerSubmit}
                                className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                VIP 배너 신청하기
                            </button>
                        </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-[10px] text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
