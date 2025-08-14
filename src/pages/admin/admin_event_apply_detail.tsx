import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventAPI } from "../../services/event";
import type { EventApplyDetail } from "../../services/types/eventType";
import { toast } from "react-toastify";
import {TopNav} from "../../components/TopNav";
import Loader from "../../components/Spinner";

export default function AdminEventApprovalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [comment, setComment] = useState("");
    const [detail, setDetail] = useState<EventApplyDetail | null>(null);
    const [loading, setLoading] = useState(true); // Set to true initially to show loading
    const [processing, setProcessing] = useState(false); // 처리 중 상태

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await eventAPI.getEventApplicationDetail(Number(id));
                setDetail(res);
            } catch (err: any) {
                toast.error(err?.message || "상세 정보를 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
        try {
            setProcessing(true); // 처리 시작
            const action = status === "APPROVED" ? "approve" : "reject";
            await eventAPI.updateEventApplicationStatus(Number(id), { action, adminComment: comment });
            toast.success(status === "APPROVED" ? "승인되었습니다." : "반려되었습니다.");
            navigate("/admin/event-applications");
        } catch (err: any) {
            toast.error(err?.message || "처리에 실패했습니다.");
        } finally {
            setProcessing(false); // 처리 완료
        }
    };

    if (loading || !detail) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-lg text-gray-500">
                            {loading ? "데이터를 불러오는 중..." : "데이터 없음"}
                        </div>
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
                <div className="top-[137px] left-[153px] [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 신청 상세
                </div>

                {/* 메인 콘텐츠 */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[195px] w-[949px]">
                    
                    {/* 뒤로가기 버튼 */}
                    <div className="mb-6">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            ← 목록으로
                        </button>
                    </div>

                    {/* 행사 기본 정보 섹션 */}
                    <div className="mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0]">
                                    행사 기본 정보
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    detail.statusCode === 'APPROVED' 
                                        ? 'bg-green-100 text-green-800' 
                                        : detail.statusCode === 'REJECTED'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {detail.statusCode}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        행사명(국문)
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.titleKr}
                                    </div>
                                </div>
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        행사명(영문)
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.titleEng}
                                    </div>
                                </div>
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        행사 기간
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.startDate} ~ {detail.endDate}
                                    </div>
                                </div>
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        장소
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.address} {detail.locationName} {detail.locationDetail}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 담당자 정보 섹션 */}
                    <div className="mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block mb-6">
                                담당자 정보
                            </h2>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        담당자 이름
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.managerName}
                                    </div>
                                </div>
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        연락처
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.contactNumber}
                                    </div>
                                </div>
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        이메일
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 사업자 정보 섹션 */}
                    <div className="mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block mb-6">
                                사업자 정보
                            </h2>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        대표자 성명
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.businessName}
                                    </div>
                                </div>
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        사업자 등록번호
                                    </label>
                                    <div className="flex items-center py-2 border-b border-gray-100">
                                        <span className="text-black font-medium text-base mr-2">
                                            {detail.businessNumber}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                                            detail.verified 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {detail.verified ? "✓ 검증됨" : "✗ 미검증"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        개업 일자
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.businessDate}
                                    </div>
                                </div>
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-1">
                                        FairPlay 등록 이메일
                                    </label>
                                    <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                        {detail.eventEmail}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 첨부 파일 섹션 */}
                    <div className="mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block mb-6">
                                첨부 파일
                            </h2>
                            <div className="grid grid-cols-2 gap-8">
                                {/* 세로형 배너 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-4">
                                        세로형 배너 (320*400)
                                    </label>
                                    {detail.thumbnailUrl && (
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <img 
                                                src={detail.thumbnailUrl} 
                                                alt="세로형 배너"
                                                className="max-w-full max-h-64 mx-auto object-contain rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* 가로형 배너 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-4">
                                        가로형 배너 (1920*1080)
                                    </label>
                                    {detail.bannerUrl && (
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <img 
                                                src={detail.bannerUrl} 
                                                alt="가로형 배너"
                                                className="max-w-full max-h-64 mx-auto object-contain rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* 행사 개요서 */}
                            <div className="mt-8">
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-4">
                                    행사 개요서
                                </label>
                                {detail.fileUrl && (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <a 
                                            href={detail.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            파일 다운로드/보기
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 관리자 코멘트 및 승인/반려 섹션 */}
                    <div className="mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block mb-6">
                                관리자 검토
                            </h2>
                            
                            <div className="mb-6">
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block mb-2">
                                    관리자 코멘트 (선택)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 font-normal text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                                    placeholder="승인 또는 반려 사유를 입력하세요"
                                />
                            </div>

                            {processing ? (
                                <div className="flex justify-center items-center gap-3 py-4">
                                    <Loader />
                                </div>
                            ) : (
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => handleUpdateStatus("APPROVED")}
                                        className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        승인
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus("REJECTED")}
                                        className="px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        반려
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}