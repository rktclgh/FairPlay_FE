import React, { useEffect, useState, useMemo } from "react";
import { eventAPI } from "../../services/event";
import type { EventApplyListItem } from "../../services/types/eventType";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

export default function AdminEventApproval() {
    const navigate = useNavigate();
    const [list, setList] = useState<EventApplyListItem[]>([]);
    const [status, setStatus] = useState<string>("");
    const [page, setPage] = useState(0); // 0-based
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchList = async (p = 0, st = status) => {
        try {
            setLoading(true);
            const res = await eventAPI.getEventApplications({ status: st || undefined, page: p, size: PAGE_SIZE });
            setList(res.content);
            setTotalPages(res.totalPages);
            setTotalElements(res.totalElements);
            setPage(res.number);
        } catch (err: any) {
            toast.error(err?.message || "목록을 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList(0, status);
    }, [status]);

    const pages = useMemo(() => {
        const cur = page + 1;
        const start = Math.max(1, cur - 2);
        const end = Math.min(totalPages, start + 4);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [page, totalPages]);

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">행사 등록 승인</h1>
            <div className="mb-4">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-2 py-1 rounded">
                    <option value="">전체</option>
                    <option value="PENDING">대기</option>
                    <option value="APPROVED">승인완료</option>
                    <option value="REJECTED">반려됨</option>
                </select>
            </div>

            <table className="w-full border">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">신청일</th>
                    <th className="p-2">행사명</th>
                    <th className="p-2">기간</th>
                    <th className="p-2">담당자</th>
                    <th className="p-2">연락처</th>
                    <th className="p-2">상태</th>
                    <th className="p-2">보기</th>
                </tr>
                </thead>
                <tbody>
                {loading && <tr><td colSpan={7} className="p-4 text-center">불러오는 중...</td></tr>}
                {!loading && list.map(row => (
                    <tr key={row.eventApplyId} className="border-t hover:bg-gray-50">
                        <td className="p-2">{row.applyAt ? new Date(row.applyAt).toLocaleDateString('ko-KR') : '-'}</td>
                        <td className="p-2">{row.titleKr}</td>
                        <td className="p-2">{row.startDate} ~ {row.endDate}</td>
                        <td className="p-2">{row.managerName}</td>
                        <td className="p-2">{row.contactNumber}</td>
                        <td className="p-2">{row.statusCode}</td>
                        <td className="p-2 text-center">
                            <button className="text-blue-600" onClick={() => navigate(`/admin/event-applications/${row.eventApplyId}`)}>
                                보기
                            </button>
                        </td>
                    </tr>
                ))}
                {!loading && list.length === 0 && (
                    <tr><td colSpan={7} className="p-4 text-center">데이터 없음</td></tr>
                )}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className="flex justify-between items-center mt-4">
                <span>총 {totalElements}건</span>
                <div className="flex gap-1">
                    <button disabled={page === 0} onClick={() => fetchList(page - 1)}>이전</button>
                    {pages.map(p => (
                        <button
                            key={p}
                            onClick={() => fetchList(p - 1)}
                            className={p - 1 === page ? "font-bold" : ""}
                        >
                            {p}
                        </button>
                    ))}
                    <button disabled={page === totalPages - 1} onClick={() => fetchList(page + 1)}>다음</button>
                </div>
            </div>
        </div>
    );
}