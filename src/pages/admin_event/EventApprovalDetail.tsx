import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { eventAPI } from "../../services/event";
import type { EventApplyDetail } from "../../services/types/eventType";
import { toast } from "react-toastify";
import Loader from "../../components/Spinner";

const statusBadge = (code?: string) => {
    switch (code) {
        case "APPROVED":
            return { text: "승인", klass: "bg-green-100 text-green-800" };
        case "REJECTED":
            return { text: "반려", klass: "bg-red-100 text-red-800" };
        case "PENDING":
        default:
            return { text: "대기", klass: "bg-yellow-100 text-yellow-800" };
    }
};

export default function EventApprovalDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [detail, setDetail] = useState<EventApplyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) {
                toast.error("잘못된 접근입니다.");
                navigate("/admin_dashboard/event-approvals");
                return;
            }
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
        fetchDetail();
    }, [id, navigate]);

    const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
        if (!id) return;
        try {
            setProcessing(true);
            const action = status === "APPROVED" ? "approve" : "reject";
            await eventAPI.updateEventApplicationStatus(Number(id), {
                action,
                adminComment: comment,
            });
            toast.success(status === "APPROVED" ? "승인되었습니다." : "반려되었습니다.");
            navigate("/admin_dashboard/event-approvals");
        } catch (err: any) {
            toast.error(err?.message || "처리에 실패했습니다.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading || !detail) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <AdminSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-1/2 -translate-x-1/2 top-[195px] w-[949px]">
                        <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-500">
                            {loading ? "데이터를 불러오는 중..." : "데이터 없음"}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const badge = statusBadge(detail.statusCode);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 상단 제목/뒤로가기 */}
                <div className="absolute top-[137px] left-64 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        목록으로
                    </button>
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl leading-[54px]">
                        행사 신청 상세
                    </h1>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${badge.klass}`}>{badge.text}</span>
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-8">
                    {/* 행사 기본 정보 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px]">
                                행사 기본 정보
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">행사명(국문)</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.titleKr}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">행사명(영문)</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.titleEng}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">행사 기간</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.startDate} ~ {detail.endDate}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">장소</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.address} {detail.locationName} {detail.locationDetail}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 담당자 정보 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="font-bold text-black text-lg mb-6">담당자 정보</h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">담당자 이름</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.managerName}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">연락처</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.contactNumber}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">이메일</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 사업자 정보 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="font-bold text-black text-lg mb-6">사업자 정보</h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">대표자 성명</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.businessName}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">사업자 등록번호</label>
                                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="text-black font-medium text-base mr-2">
                    {detail.businessNumber}
                  </span>
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded ${
                                            detail.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}
                                    >
                    {detail.verified ? "✓ 검증됨" : "✗ 미검증"}
                  </span>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">개업 일자</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.businessDate}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-bold text-[15px]">FairPlay 등록 이메일</label>
                                <div className="text-black font-medium text-base py-2 border-b border-gray-100">
                                    {detail.eventEmail}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 첨부 파일 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="font-bold text-black text-lg mb-6">첨부 파일</h2>

                        <div className="grid grid-cols-2 gap-8">
                            {/* 세로형 배너 */}
                            <div>
                                <label className="block mb-4 font-bold text-[15px]">
                                    세로형 배너 (320×400)
                                </label>
                                {detail.thumbnailUrl ? (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <img
                                            src={detail.thumbnailUrl}
                                            alt="세로형 배너"
                                            className="max-w-full max-h-64 mx-auto object-contain rounded"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">이미지 없음</div>
                                )}
                            </div>

                            {/* 가로형 배너 */}
                            <div>
                                <label className="block mb-4 font-bold text-[15px]">
                                    가로형 배너 (1920×1080)
                                </label>
                                {detail.bannerUrl ? (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <img
                                            src={detail.bannerUrl}
                                            alt="가로형 배너"
                                            className="max-w-full max-h-64 mx-auto object-contain rounded"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">이미지 없음</div>
                                )}
                            </div>
                        </div>

                        {/* 행사 개요서 */}
                        <div className="mt-8">
                            <label className="block mb-4 font-bold text-[15px]">행사 개요서</label>
                            {detail.fileUrl ? (
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
                            ) : (
                                <div className="text-sm text-gray-500">파일 없음</div>
                            )}
                        </div>
                    </div>

                    {/* 관리자 검토 (코멘트 + 승인/반려) */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="font-bold text-black text-lg mb-6">관리자 검토</h2>

                        <div className="mb-6">
                            <label className="block mb-2 font-bold text-[15px]">관리자 코멘트 (선택)</label>
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
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => handleUpdateStatus("REJECTED")}
                                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    반려
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("APPROVED")}
                                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    승인
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
