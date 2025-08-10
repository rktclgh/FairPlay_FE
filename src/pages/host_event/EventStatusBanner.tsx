import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import "./EventStatusBanner.css";

export const EventStatusBanner = () => {
    const [isPublic, setIsPublic] = useState(true);

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
                                    <label className="relative">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            checked={isPublic}
                                            onChange={() => setIsPublic(!isPublic)}
                                        />
                                        <div className="slider"></div>
                                    </label>
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


                </div>
            </div>
        </div>
    );
};
