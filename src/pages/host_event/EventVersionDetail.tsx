import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { eventVersionAPI } from "../../services/eventVersion";
import { dashboardAPI } from "../../services/dashboard";
import type { EventDetailResponseDto } from "../../services/types/eventType";
import { toast } from "react-toastify";

export const EventVersionDetail: React.FC = () => {
    const { versionNumber } = useParams<{ versionNumber: string }>();
    const navigate = useNavigate();
    const [eventId, setEventId] = useState<number | null>(null);
    const [versionData, setVersionData] = useState<EventDetailResponseDto | null>(null);
    const [currentVersion, setCurrentVersion] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventIdAndVersion = async () => {
            try {
                setLoading(true);
                // 기본 이벤트 정보 조회 (현재 버전 정보 포함)
                const myEvent = await dashboardAPI.getMyEvent();
                if (myEvent && myEvent.eventId) {
                    setEventId(myEvent.eventId);
                    setCurrentVersion(myEvent.version);
                    if (versionNumber) {
                        fetchVersionDetail(myEvent.eventId, parseInt(versionNumber, 10));
                    } else {
                        setError("버전 번호를 찾을 수 없습니다.");
                    }
                } else {
                    setError("담당하는 행사를 찾을 수 없습니다.");
                }
            } catch (err) {
                setError("행사 정보를 불러오는데 실패했습니다.");
                toast.error("행사 정보를 불러올 수 없습니다.");
            } 
        };

        fetchEventIdAndVersion();
    }, [versionNumber]);

    const fetchVersionDetail = async (id: number, verNum: number) => {
        try {
            console.log('버전 상세 조회 시작:', { eventId: id, versionNumber: verNum });
            const data = await eventVersionAPI.getEventVersion(id, verNum);
            console.log('버전 상세 조회 결과:', data);
            setVersionData(data);
        } catch (err) {
            console.error('버전 상세 조회 오류:', err);
            setError("버전 상세 정보를 불러오는데 실패했습니다.");
            toast.error("버전 상세 정보를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/host/event-version');
    };
    
    const handleRestore = async () => {
        if (!eventId || !versionData) return;
        
        if (!window.confirm(`v${versionNumber} 버전으로 복원 요청을 보내시겠습니까?`)) {
            return;
        }

        try {
            await eventVersionAPI.createVersionRestoreRequest(eventId, parseInt(versionNumber!, 10));
            toast.success("버전 복원 요청이 성공적으로 전송되었습니다.");
            navigate("/host/event-version");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "버전 복원 요청에 실패했습니다.");
        }
    };

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] pb-20 flex items-center justify-center">
                        <div className="text-lg text-gray-600">로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !versionData) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] pb-20 flex items-center justify-center">
                        <div className="text-lg text-red-500">{error || "버전 정보를 찾을 수 없습니다."}</div>
                    </div>
                </div>
            </div>
        );
    }
    
    const snapshot = versionData;

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 버전 상세
                </div>

                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">버전 정보</h2>
                            <div className="flex items-center gap-4">
                                {currentVersion && parseInt(versionNumber!, 10) === currentVersion ? (
                                    <div className="px-6 py-2 bg-green-100 text-green-700 rounded-[10px] text-sm font-medium border border-green-200">
                                        현재 사용중인 버전
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleRestore}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-[10px] hover:bg-blue-600 transition-colors text-sm font-medium"
                                    >
                                        이 버전으로 복원 요청
                                    </button>
                                )}
                                <button
                                    onClick={handleBack}
                                    className="px-6 py-2 bg-transparent text-gray-700 rounded-[10px] hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-200"
                                >
                                    목록으로 돌아가기
                                </button>
                            </div>
                        </div>
                        <div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">버전 번호</label>
                                <div className="text-lg font-semibold text-gray-900">v{versionNumber}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white">
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
                                            value={snapshot.titleKr}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                    {/* 행사명(영문) */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(영문)
                                        </label>
                                        <input
                                            type="text"
                                            value={snapshot.titleEng}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                    {/* 시작일 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            시작일
                                        </label>
                                        <input
                                            type="date"
                                            value={snapshot.startDate}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                    {/* 종료일 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            종료일
                                        </label>
                                        <input
                                            type="date"
                                            value={snapshot.endDate}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                    {/* 행사 장소 */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 장소
                                        </label>

                                        <div className="space-y-4">
                                            {/* 장소 검색 (읽기 전용) */}
                                            <div>
                                                <div className="relative w-1/2">
                                                    <input
                                                        type="text"
                                                        value={snapshot.placeName || ""}
                                                        readOnly
                                                        placeholder="장소명"
                                                        className="w-full h-[40px] border border-gray-300 rounded-full px-4 pr-12 font-normal text-base outline-none bg-transparent text-black font-medium"
                                                    />
                                                </div>
                                            </div>

                                            {/* 주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={snapshot.address || ""}
                                                    readOnly
                                                    placeholder="기본 주소 (도로명 주소)"
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                                />
                                            </div>

                                            {/* 상세주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={snapshot.locationDetail || ""}
                                                    readOnly
                                                    placeholder="상세 주소"
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
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
                                                <input
                                                    type="text"
                                                    value={snapshot.mainCategory || ""}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                                />
                                            </div>
                                            {/* 서브카테고리 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    서브카테고리
                                                </label>
                                                <input
                                                    type="text"
                                                    value={snapshot.subCategory || ""}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 행사 배너 (세로형) */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 (세로형)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-transparent">
                                            {snapshot.thumbnailUrl ? (
                                                <img src={snapshot.thumbnailUrl} alt="썸네일" className="mx-auto max-h-48 max-w-full object-contain rounded" />
                                            ) : (
                                                <p className="text-sm text-gray-500">이미지 없음</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 행사 개요 */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 개요 (최대 80자)
                                        </label>
                                        <input
                                            type="text"
                                            value={snapshot.bio || ""}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>

                                    {/* 상세 정보 */}
                                    <div className="col-span-2 mb-12">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            상세 정보
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={snapshot.content || ""}
                                            readOnly={true}
                                            modules={{ toolbar: false }}
                                            style={{ height: '400px', backgroundColor: 'transparent' }}
                                        />
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
                                                    value={snapshot.eventTime || ""}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                                />
                                            </div>
                                            {/* 관람등급 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    관람등급
                                                </label>
                                                <input
                                                    type="text"
                                                    value={snapshot.age ? "청소년불가" : "전체이용가"}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 입장/재입장/퇴장 스캔 설정 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-3 gap-6">
                                            {/* 체크인 허용 여부 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    체크인 허용 여부
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <input type="checkbox" checked={snapshot.checkInAllowed} disabled className="w-4 h-4" />
                                                    <span className="ml-2">체크인 허용</span>
                                                </div>
                                            </div>
                                            {/* 재입장 허용 여부 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    재입장 허용 여부
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <input type="checkbox" checked={snapshot.reentryAllowed} disabled className="w-4 h-4" />
                                                     <span className="ml-2">재입장 허용</span>
                                                </div>
                                            </div>
                                            {/* 퇴장 스캔 여부 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    퇴장 스캔 여부
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <input type="checkbox" checked={snapshot.checkOutAllowed} disabled className="w-4 h-4" />
                                                     <span className="ml-2">퇴장 시 스캔 필수</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 정책 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="col-span-2 mb-12">
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        예매/취소/환불 정책
                                    </label>
                                    <ReactQuill
                                        theme="snow"
                                        value={snapshot.policy || ""}
                                        readOnly={true}
                                        modules={{ toolbar: false }}
                                        style={{ height: '150px', backgroundColor: 'transparent' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">외부 링크</h2>
                                {snapshot.externalLinks && snapshot.externalLinks.length > 0 ? (
                                    snapshot.externalLinks.map((link, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-8 mb-4">
                                            <div>
                                                <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트명</label>
                                                <input
                                                    type="text"
                                                    value={link.displayText}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트 URL</label>
                                                <input
                                                    type="text"
                                                    value={link.url}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">등록된 외부 링크가 없습니다.</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">주최자 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">주최자명</label>
                                        <input
                                            type="text"
                                            value={snapshot.hostName}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">사업자등록번호</label>
                                        <input
                                            type="text"
                                            value={snapshot.managerBusinessNumber || ""}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">주최/기획사</label>
                                        <input
                                            type="text"
                                            value={snapshot.hostCompany || ""}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">공식 웹사이트 URL</label>
                                    <input
                                        type="text"
                                        value={snapshot.officialUrl || ""}
                                        readOnly
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">담당자 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자명</label>
                                        <input
                                            type="text"
                                            value={snapshot.managerName || ""}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 연락처</label>
                                        <input
                                            type="text"
                                            value={snapshot.managerPhone || ""}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 이메일</label>
                                        <input
                                            type="text"
                                            value={snapshot.managerEmail || ""}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">문의처</h2>
                                <div className="mb-12">
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">상세 정보</label>
                                    <ReactQuill
                                        theme="snow"
                                        value={snapshot.contactInfo || ""}
                                        readOnly={true}
                                        modules={{ toolbar: false }}
                                        style={{ height: '150px', backgroundColor: 'transparent' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
