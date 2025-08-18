import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { eventAPI } from "../../services/event";
import type { EventApplyListItem } from "../../services/types/eventType";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

const statusBadge = (code?: string) => {
    switch (code) {
        case "PENDING":
            return { text: "대기", klass: "bg-yellow-100 text-yellow-800" };
        case "APPROVED":
            return { text: "승인", klass: "bg-green-100 text-green-800" };
        case "REJECTED":
            return { text: "반려", klass: "bg-red-100 text-red-800" };
        default:
            return { text: code ?? "-", klass: "bg-gray-100 text-gray-800" };
    }
};

export default function EventApproval() {
    const navigate = useNavigate();

    const [list, setList] = useState<EventApplyListItem[]>([]);
    const [status, setStatus] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState<number>(1); // 1-based for UI
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    const fetchList = async (uiPage = 1, st = status) => {
        try {
            setLoading(true);
            const zeroBased = Math.max(uiPage - 1, 0);
            const res = await eventAPI.getEventApplications({
                status: st || undefined,
                page: zeroBased,
                size: PAGE_SIZE,
            });
            // Page 응답 형태 가정: content, totalPages, totalElements, number
            setList(res.content ?? []);
            setTotalPages(res.totalPages ?? 0);
            setTotalElements(res.totalElements ?? 0);
            setCurrentPage((res.number ?? zeroBased) + 1); // 서버가 돌려준 현재 페이지 반영 (1-based로 변환)
        } catch (err: any) {
            toast.error(err?.message || "목록을 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList(1, status);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const handlePageChange = (page: number) => {
        if (page < 1 || (totalPages > 0 && page > totalPages)) return;
        fetchList(page, status);
    };

    const handleDetailClick = (eventApplyId: number) => {
        navigate(`/admin_dashboard/event-approvals/${eventApplyId}`);
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 등록 승인
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">

                    {/* 상태 필터 (데이터 로딩은 1번 파일 기준이라 유지) */}
                    <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
                        <label className="text-sm text-gray-700">상태</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-3 py-2 text-sm border rounded-md"
                        >
                            <option value="">전체</option>
                            <option value="PENDING">대기</option>
                            <option value="APPROVED">승인완료</option>
                            <option value="REJECTED">반려됨</option>
                        </select>
                    </div>

                    {/* 리스트 카드 (디자인은 2번 파일 기준) */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div
                                className="grid grid-cols-7 gap-4 text-sm font-bold text-gray-700"
                                style={{ gridTemplateColumns: "1fr 2fr 1.5fr 1fr 1.5fr 1fr 1fr" }}
                            >
                                <div className="text-center">신청일</div>
                                <div className="text-center">행사명(국문)</div>
                                <div className="text-center">행사기간</div>
                                <div className="text-center">담당자</div>
                                <div className="text-center">연락처</div>
                                <div className="text-center">상태</div>
                                <div className="text-center">처리</div>
                            </div>
                        </div>

                        {/* 바디 */}
                        <div>
                            {loading ? (
                                <div className="py-8 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    데이터를 불러오는 중...
                                </div>
                            ) : list.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    승인 대기 중인 행사가 없습니다.
                                </div>
                            ) : (
                                list.map((row, index) => {
                                    const badge = statusBadge(row.statusCode);
                                    return (
                                        <div
                                            key={row.eventApplyId}
                                            className={`grid grid-cols-7 gap-4 py-5 px-6 text-sm items-center ${
                                                index !== list.length - 1 ? "border-b border-gray-200" : ""
                                            }`}
                                            style={{ gridTemplateColumns: "1fr 2fr 1.5fr 1fr 1.5fr 1fr 1fr" }}
                                        >
                                            <div className="text-gray-600 text-center">
                                                {row.applyAt
                                                    ? new Date(row.applyAt).toLocaleDateString("ko-KR")
                                                    : "-"}
                                            </div>
                                            <div className="text-gray-900 text-center font-bold truncate">
                                                {row.titleKr}
                                            </div>
                                            <div className="text-gray-600 text-center">
                                                {row.startDate} ~ {row.endDate}
                                            </div>
                                            <div className="text-gray-600 text-center">{row.managerName}</div>
                                            <div className="text-gray-600 text-center truncate">
                                                {row.contactNumber}
                                            </div>
                                            <div className="text-center">
                        <span
                            className={`inline-block px-3 py-1 rounded text-xs font-medium ${badge.klass}`}
                        >
                          {badge.text}
                        </span>
                                            </div>
                                            <div className="text-center">
                                                <button
                                                    onClick={() => handleDetailClick(row.eventApplyId)}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    상세보기
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 페이지네이션 (2번 파일 UI) */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    총 <span className="font-bold text-black">{totalElements}</span>개의 신청
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        이전
                                    </button>
                                    <div className="flex space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                className={`px-3 py-2 text-sm border rounded-md ${
                                                    currentPage === p
                                                        ? "text-white bg-blue-600 border-blue-600"
                                                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                                                }`}
                                                onClick={() => handlePageChange(p)}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
