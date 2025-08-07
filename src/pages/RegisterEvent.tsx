import React, { useState } from "react";
import { TopNav } from "../components/TopNav";

export const RegisterEvent = () => {
    const [formData, setFormData] = useState({
        eventNameKr: "",
        eventNameEn: "",
        startDate: "",
        endDate: "",
        eventOutline: null as File | null,
        businessNumber: "",
        managerName: "",
        phone: "",
        email: "",
        registerId: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                eventOutline: file
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("행사 등록 신청:", formData);
        // TODO: API 호출 로직 추가
        alert("행사 등록 신청이 완료되었습니다.");
    };

    return (
        <div className="bg-white flex flex-col items-center min-h-screen w-full">
            <TopNav />
            <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-[800px] mt-20 mb-8">
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] mb-8">행사 등록 신청</h1>
                    {/* 폼 컨테이너 시작 */}
                    <div className="bg-white">
                        {/* 행사 정보 섹션 */}
                        <div className="mb-8">
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
                            </div>
                            {/* 행사개요서 */}
                            <div className="mt-6">
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    행사개요서
                                </label>
                                <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                                    <input
                                        type="file"
                                        name="eventOutline"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center space-y-4"
                                    >
                                        {/* 업로드 아이콘 */}
                                        <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>

                                        {/* 메인 텍스트 */}
                                        <div className="text-lg font-semibold text-gray-600">
                                            {formData.eventOutline ? formData.eventOutline.name : "파일을 업로드해주세요"}
                                        </div>

                                        {/* 서브 텍스트 */}
                                        <div className="text-sm text-gray-500">
                                            {formData.eventOutline ? "파일이 선택되었습니다" : "파일을 드래그하거나 여기를 클릭하여 업로드하세요."}
                                        </div>

                                        {/* 버튼 */}
                                        <button
                                            type="button"
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                                        >
                                            파일 선택하기
                                        </button>
                                    </label>
                                </div>
                            </div>
                        </div>
                        {/* 담당자 정보 섹션 */}
                        <div className="mb-8">
                            <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                담당자 정보
                            </h2>
                            <div className="grid grid-cols-2 gap-8">
                                {/* 사업자 등록 번호 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        사업자 등록 번호
                                    </label>
                                    <input
                                        type="text"
                                        name="businessNumber"
                                        value={formData.businessNumber}
                                        onChange={handleInputChange}
                                        placeholder="000-00-00000"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.businessNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                                {/* 담당자 이름 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        담당자 이름
                                    </label>
                                    <input
                                        type="text"
                                        name="managerName"
                                        value={formData.managerName}
                                        onChange={handleInputChange}
                                        placeholder="담당자 이름을 입력하세요"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.managerName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                                {/* 연락처 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        연락처
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="010-0000-0000"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.phone ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                                {/* 이메일 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        이메일
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="example@email.com"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.email ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                                {/* 등록할 아이디 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        등록할 아이디
                                    </label>
                                    <input
                                        type="text"
                                        name="registerId"
                                        value={formData.registerId}
                                        onChange={handleInputChange}
                                        placeholder="등록할 아이디를 입력하세요"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.registerId ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
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