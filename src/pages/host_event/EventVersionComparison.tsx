import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { eventVersionAPI } from "../../services/eventVersion";
import { dashboardAPI } from "../../services/dashboard";
import type { EventVersionComparison as EventVersionComparisonData } from "../../services/types/eventVersionType";
import { toast } from "react-toastify";

export const EventVersionComparison: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const version1 = searchParams.get('v1');
    const version2 = searchParams.get('v2');

    const [eventId, setEventId] = useState<number | null>(null);
    const [comparisonData, setComparisonData] = useState<EventVersionComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventIdAndComparison = async () => {
            try {
                setLoading(true);
                const myEvent = await dashboardAPI.getMyEventWithDetails();
                if (myEvent && myEvent.eventId) {
                    setEventId(myEvent.eventId);
                    if (version1 && version2) {
                        fetchComparison(myEvent.eventId, parseInt(version1, 10), parseInt(version2, 10));
                    } else {
                        setError("비교할 버전 정보를 찾을 수 없습니다.");
                    }
                } else {
                    setError("담당하는 행사를 찾을 수 없습니다.");
                }
            } catch (err) {
                setError("행사 정보를 불러오는데 실패했습니다.");
                toast.error("행사 정보를 불러올 수 없습니다.");
            } 
        };

        fetchEventIdAndComparison();
    }, [version1, version2]);

    const fetchComparison = async (id: number, v1: number, v2: number) => {
        try {
            const data = await eventVersionAPI.compareVersions(id, v1, v2);
            setComparisonData(data);
        } catch (err) {
            setError("버전 비교 정보를 불러오는데 실패했습니다.");
            toast.error("버전 비교 정보를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    const getFieldStyle = (fieldName: string) => {
        return comparisonData?.fieldDifferences.hasOwnProperty(fieldName)
            ? 'bg-yellow-50 border-l-4 border-yellow-400 pl-3 rounded-r-md'
            : '';
    };

    const countDifferences = () => {
        return comparisonData ? Object.keys(comparisonData.fieldDifferences).length : 0;
    };

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

    if (error || !comparisonData) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-full min-h-screen relative">
                    <TopNav />
                    <div className="absolute left-[50px] top-[195px] right-[50px] pb-20 flex items-center justify-center">
                        <div className="text-lg text-red-500">{error || "버전 비교 정보를 찾을 수 없습니다."}</div>
                    </div>
                </div>
            </div>
        );
    }

    const { snapshot1, snapshot2 } = comparisonData;

    const renderReadOnlyField = (label: string, value: any, fieldName: string, isDate = false) => (
        <div className={getFieldStyle(fieldName)}>
            <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                {label}
            </label>
            <input
                type={isDate ? "date" : "text"}
                value={value || ''}
                readOnly
                className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
            />
        </div>
    );

    const renderReadOnlyQuill = (label: string, value: string, fieldName: string) => (
        <div className={`mb-12 ${getFieldStyle(fieldName)}`}>
            <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                {label}
            </label>
            <ReactQuill
                theme="snow"
                value={value || ''}
                readOnly={true}
                modules={{ toolbar: false }}
                style={{ height: '150px', backgroundColor: '#f9fafb' }}
            />
        </div>
    );
    
    const renderCheckbox = (label: string, checked: boolean, fieldName: string) => (
         <div className={getFieldStyle(fieldName)}>
            <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                {label}
            </label>
            <div className="flex items-center h-[54px]">
                <input type="checkbox" checked={checked} disabled className="w-4 h-4" />
                <span className="ml-2">{checked ? "허용" : "비허용"}</span>
            </div>
        </div>
    );

    const renderSnapshot = (snapshot: any, versionNum: number) => (
        <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                    행사 정보 (v.{versionNum})
                </h2>


                <div className="space-y-6">
                    {renderReadOnlyField("행사명(국문)", snapshot.titleKr, "titleKr")}
                    {renderReadOnlyField("행사명(영문)", snapshot.titleEng, "titleEng")}
                    {renderReadOnlyField("시작일", snapshot.startDate, "startDate", true)}
                    {renderReadOnlyField("종료일", snapshot.endDate, "endDate", true)}
                    
                    {/* 행사 장소 정보 */}
                    <div className={getFieldStyle("address")}>
                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                            행사 장소
                        </label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={snapshot.placeName || ''}
                                readOnly
                                placeholder="장소명"
                                className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                            />
                            <input
                                type="text"
                                value={snapshot.address || ''}
                                readOnly
                                placeholder="기본 주소"
                                className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                            />
                            <input
                                type="text"
                                value={snapshot.locationDetail || ''}
                                readOnly
                                placeholder="상세 주소"
                                className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                            />
                        </div>
                    </div>

                    {renderReadOnlyField("메인 카테고리", snapshot.mainCategoryName, "mainCategoryName")}
                    {renderReadOnlyField("서브 카테고리", snapshot.subCategoryName, "subCategoryName")}
                    {renderReadOnlyField("행사 개요", snapshot.bio, "bio")}
                    {renderReadOnlyQuill("상세 정보", snapshot.content, "content")}
                    {renderReadOnlyField("관람시간(분)", snapshot.eventTime, "eventTime")}
                    {renderReadOnlyField("관람등급", snapshot.age ? "청소년불가" : "전체이용가", "age")}
                    
                    {/* 썸네일/배너 이미지 */}
                    {snapshot.thumbnailUrl && (
                        <div className={getFieldStyle("thumbnailUrl")}>
                            <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                썸네일 이미지
                            </label>
                            <img 
                                src={snapshot.thumbnailUrl} 
                                alt="썸네일" 
                                className="w-32 h-32 object-cover border rounded-md"
                            />
                        </div>
                    )}

                    {renderCheckbox("체크인 허용", snapshot.checkInAllowed, "checkInAllowed")}
                    {renderCheckbox("재입장 허용", snapshot.reentryAllowed, "reentryAllowed")}
                    {renderCheckbox("퇴장 스캔 필수", snapshot.checkOutAllowed, "checkOutAllowed")}
                </div>
            </div>

            {/* 예매/취소/환불 정책 섹션 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-6">
                    {renderReadOnlyQuill("예매/취소/환불 정책", snapshot.policy, "policy")}
                </div>
            </div>

            {/* 외부 링크 섹션 */}
            {snapshot.externalLinks && snapshot.externalLinks.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="font-bold text-black text-lg leading-[30px] mb-6">외부 링크</h2>
                    <div className="space-y-4">
                        {snapshot.externalLinks.map((link: any, index: number) => (
                            <div key={index} className={`grid grid-cols-1 gap-8 border-t-2 border-dashed border-blue-400 p-5 ${getFieldStyle("externalLinks")}`}>
                                <div>
                                    <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트명</label>
                                    <input
                                        type="text"
                                        value={link.displayText || ''}
                                        readOnly
                                        className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트 URL</label>
                                    <input
                                        type="text"
                                        value={link.url || ''}
                                        readOnly
                                        className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 주최자 정보 섹션 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                 <h2 className="font-bold text-black text-lg leading-[30px] mb-6">주최자 정보</h2>
                 <div className="space-y-6">
                    {renderReadOnlyField("주최자명", snapshot.hostName, "hostName")}
                    {renderReadOnlyField("사업자 등록번호", snapshot.businessNumber, "businessNumber")}
                    {renderReadOnlyField("주최/기획사", snapshot.hostCompany, "hostCompany")}
                    {renderReadOnlyField("공식 웹사이트 URL", snapshot.officialUrl, "officialUrl")}
                </div>
            </div>

            {/* 담당자 정보 섹션 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">담당자 정보</h2>
                <div className="space-y-6">
                    {renderReadOnlyField("담당자명", snapshot.managerName, "managerName")}
                    {renderReadOnlyField("담당자 연락처", snapshot.managerPhone, "managerPhone")}
                    {renderReadOnlyField("담당자 이메일", snapshot.managerEmail, "managerEmail")}
                </div>
            </div>

            {/* 문의처 섹션 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">문의처</h2>
                <div className="space-y-6">
                    {renderReadOnlyQuill("문의처", snapshot.contactInfo, "contactInfo")}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-full min-h-screen relative">
                <TopNav />

                <div className="top-[137px] left-[50px] [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 버전 비교
                </div>

                <div className="absolute left-[50px] top-[195px] right-[50px] pb-20">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    버전 비교 (v.{comparisonData.version1}{" "}
                                    <span className="text-gray-400">vs.</span>{" "}
                                    v.{comparisonData.version2})
                                </h2>
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
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {renderSnapshot(snapshot1, comparisonData.version1)}
                        {renderSnapshot(snapshot2, comparisonData.version2)}
                    </div>
                </div>
            </div>
        </div>
    );
};