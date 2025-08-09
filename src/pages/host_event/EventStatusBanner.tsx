import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";

export const EventStatusBanner = () => {
    const [isPublic, setIsPublic] = useState(true);

    const handleSave = () => {
        // 저장 로직 구현
        console.log("저장:", { isPublic });
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
            <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 노출 상태
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
