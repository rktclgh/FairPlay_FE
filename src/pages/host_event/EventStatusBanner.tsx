import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { eventAPI } from "../../services/event";
import { dashboardAPI } from "../../services/dashboard";
import type { EventDetailResponseDto } from "../../services/types/eventType";
import { toast } from "react-toastify";
import "./EventStatusBanner.css";

export const EventStatusBanner = () => {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [eventData, setEventData] = useState<EventDetailResponseDto | null>(null);
    const [isPublic, setIsPublic] = useState(true);

    useEffect(() => {
        fetchEventData();
    }, []);

    const fetchEventData = async () => {
        try {
            setLoading(true);
            const myEvent = await dashboardAPI.getMyEventWithDetails();
            if (myEvent) {
                setEventData(myEvent);
                setIsPublic(!myEvent.hidden); // hidden이 false이면 공개
            }
        } catch (error) {
            console.error("이벤트 데이터 로드 실패:", error);
            toast.error("이벤트 정보를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async () => {
        if (!eventData) return;

        try {
            setUpdating(true);
            const newHiddenStatus = isPublic; // 현재 isPublic을 반전
            
            await eventAPI.updateEvent(eventData.eventId, {
                email: eventData.managerEmail || "",
                titleKr: eventData.titleKr,
                titleEng: eventData.titleEng || "",
                hidden: newHiddenStatus
            });

            setIsPublic(!isPublic);
            setEventData(prev => prev ? { ...prev, hidden: newHiddenStatus } : null);
            toast.success(newHiddenStatus ? "이벤트가 비공개로 설정되었습니다." : "이벤트가 공개되었습니다.");
        } catch (error) {
            console.error("상태 업데이트 실패:", error);
            toast.error("상태 변경에 실패했습니다.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-lg text-gray-500">데이터를 불러오는 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-lg text-gray-500">담당하는 이벤트가 없습니다.</div>
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
                    행사 노출 상태
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

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
                                            disabled={updating}
                                            onChange={handleStatusChange}
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
                            <div className="space-y-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    isPublic 
                                        ? 'bg-green-50 text-green-700' 
                                        : 'bg-red-50 text-red-700'
                                }`}>
                                    {updating ? "변경 중..." : isPublic ? "공개" : "비공개"}
                                </span>
                                {eventData && (
                                    <div className="text-xs text-gray-500">
                                        행사명: {eventData.titleKr}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};
