import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import api from "../../api/axios";
import { toast } from "react-toastify";

// ===== [DUMMY-START] SettlementManagement 테스트 더미 (실서버 전환 시 이 블록 삭제 가능) =====
const USE_DUMMY_SETTLEMENT = true; // 더미 사용시 true, 실서버 사용 시 false

interface SettlementItem {
    id: number;
    eventId: number;
    eventTitle: string;
    period: { startDate: string; endDate: string };
    grossSales: number; // 총 매출
    feeAmount: number;  // 수수료 금액
    netAmount: number;  // 정산 금액(=총매출-수수료)
    status: "대기" | "완료" | "보류";
    createdAt: string;
}

interface SettlementListResponse {
    content: SettlementItem[];
    totalElements: number;
    totalPages: number;
    summary?: { totalGross: number; totalNet: number; totalFee: number };
}

const DUMMY_SETTLEMENTS: SettlementItem[] = Array.from({ length: 18 }).map((_, i) => {
    const base = dayjs("2025-07-01").add(i, "day");
    const gross = 1000000 + i * 13750;
    const fee = Math.round(gross * 0.08);
    const net = gross - fee;
    const statuses: Array<SettlementItem["status"]> = ["대기", "완료", "보류"];
    return {
        id: 202507000 + i,
        eventId: 1000 + i,
        eventTitle: `샘플 행사 ${i + 1}`,
        period: { startDate: base.format("YYYY-MM-DD"), endDate: base.add(2, "day").format("YYYY-MM-DD") },
        grossSales: gross,
        feeAmount: fee,
        netAmount: net,
        status: statuses[i % statuses.length],
        createdAt: base.toISOString(),
    };
});
// ===== [DUMMY-END] SettlementManagement 테스트 더미 =====

const formatCurrency = (value: number) => new Intl.NumberFormat("ko-KR").format(value) + "원";

const statusChipClass = (status: SettlementItem["status"]) => {
    switch (status) {
        case "대기":
            return "bg-yellow-100 text-yellow-800";
        case "완료":
            return "bg-green-100 text-green-800";
        case "보류":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export const SettlementManagement: React.FC = () => {
    dayjs.extend(isSameOrAfter);
    dayjs.extend(isSameOrBefore);
    // 필터
    const [searchName, setSearchName] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("전체");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // 데이터
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [settlements, setSettlements] = useState<SettlementItem[]>([]);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [summary, setSummary] = useState<{ totalGross: number; totalNet: number; totalFee: number } | null>(null);

    const fetchSettlements = useCallback(async () => {
        try {
            setLoading(true);
            if (USE_DUMMY_SETTLEMENT) {
                // 간단 필터/페이지네이션
                let list = DUMMY_SETTLEMENTS;
                if (searchName) {
                    list = list.filter((x) => x.eventTitle.toLowerCase().includes(searchName.toLowerCase()));
                }
                if (selectedStatus !== "전체") {
                    list = list.filter((x) => x.status === selectedStatus);
                }
                if (startDate) {
                    list = list.filter((x) => dayjs(x.period.startDate).isSameOrAfter(dayjs(startDate), "day"));
                }
                if (endDate) {
                    list = list.filter((x) => dayjs(x.period.endDate).isSameOrBefore(dayjs(endDate), "day"));
                }

                const pageSize = 10;
                const from = (currentPage - 1) * pageSize;
                const pageData = list.slice(from, from + pageSize);
                const sum = {
                    totalGross: list.reduce((a, b) => a + b.grossSales, 0),
                    totalNet: list.reduce((a, b) => a + b.netAmount, 0),
                    totalFee: list.reduce((a, b) => a + b.feeAmount, 0),
                };

                setSettlements(pageData);
                setTotalElements(list.length);
                setTotalPages(Math.max(1, Math.ceil(list.length / pageSize)));
                setSummary(sum);
                return;
            }

            const params: Record<string, string | number> = {
                page: currentPage - 1,
                size: 10,
            };
            if (searchName) params.keyword = searchName;
            if (selectedStatus !== "전체") params.status = selectedStatus;
            if (startDate) params.fromDate = startDate;
            if (endDate) params.toDate = endDate;

            const res = await api.get<SettlementListResponse>("/api/admin/settlements", { params });
            const data = res.data as SettlementListResponse;
            setSettlements(data.content || []);
            setTotalElements(data.totalElements || 0);
            setTotalPages(data.totalPages || 1);
            setSummary(data.summary || null);
        } catch (err) {
            console.error("정산 목록 조회 실패:", err);
            toast.error("정산 목록을 불러오지 못했습니다.");
            setSettlements([]);
            setTotalElements(0);
            setTotalPages(1);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [currentPage, endDate, searchName, selectedStatus, startDate]);

    useEffect(() => {
        fetchSettlements();
    }, [fetchSettlements]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchName, selectedStatus, startDate, endDate]);

    const handleReset = () => {
        setSearchName("");
        setSelectedStatus("전체");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
    };

    const handleExport = async () => {
        try {
            if (USE_DUMMY_SETTLEMENT) {
                toast.info("더미 모드에서는 다운로드가 비활성화되어 있습니다.");
                return;
            }
            const params: Record<string, string> = {};
            if (searchName) params.keyword = searchName;
            if (selectedStatus !== "전체") params.status = selectedStatus;
            if (startDate) params.fromDate = startDate;
            if (endDate) params.toDate = endDate;
            const res = await api.get("/api/admin/settlements/export", { params, responseType: "blob" });
            const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `settlements_${dayjs().format("YYYYMMDD_HHmm")}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("정산 내보내기 실패:", err);
            toast.error("정산 내보내기에 실패했습니다.");
        }
    };

    const statuses = ["전체", "대기", "완료", "보류"];

    const tableBody = useMemo(() => {
        if (loading) {
            return (
                <div className="py-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    데이터를 불러오는 중...
                </div>
            );
        }
        if (!settlements || settlements.length === 0) {
            return <div className="py-8 text-center text-gray-500">정산 데이터가 없습니다.</div>;
        }
        return settlements.map((s, idx) => (
            <div
                key={s.id}
                className={`grid grid-cols-7 gap-3 py-5 px-6 text-sm items-center ${idx !== settlements.length - 1 ? "border-b border-gray-200" : ""}`}
                style={{ gridTemplateColumns: "1fr 2fr 1.6fr 1.2fr 1.2fr 1.2fr 0.9fr" }}
            >
                <div className="text-left text-gray-700">{s.id}</div>
                <div className="text-left font-bold text-black truncate">{s.eventTitle}</div>
                <div className="text-center text-gray-700">{dayjs(s.period.startDate).format("YYYY.MM.DD")} ~ {dayjs(s.period.endDate).format("YYYY.MM.DD")}</div>
                <div className="text-right text-gray-700">{formatCurrency(s.grossSales)}</div>
                <div className="text-right text-gray-700">{formatCurrency(s.feeAmount)}</div>
                <div className="text-right text-black font-semibold">{formatCurrency(s.netAmount)}</div>
                <div className="text-center">
                    <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${statusChipClass(s.status)}`}>
                        {s.status}
                    </span>
                </div>
            </div>
        ));
    }, [loading, settlements]);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    매출 정산
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">
                    {/* 카드 1: 검색/필터 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">검색 조건</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleExport}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-[10px] hover:bg-gray-800 focus:outline-none disabled:opacity-50"
                                >
                                    CSV 내보내기
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-[10px] hover:bg-gray-50 focus:outline-none"
                                >
                                    초기화
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-4" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
                            {/* 행사명 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">행사명</label>
                                <input
                                    type="text"
                                    placeholder="행사명을 입력하세요"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* 상태 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">상태</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 시작일 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">시작일</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* 종료일 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">종료일</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 카드 2: 정산 목록 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div
                                className="grid grid-cols-7 gap-3 text-sm font-bold text-gray-700"
                                style={{ gridTemplateColumns: "1fr 2fr 1.6fr 1.2fr 1.2fr 1.2fr 0.9fr" }}
                            >
                                <div className="text-left">정산 ID</div>
                                <div className="text-left">행사명</div>
                                <div className="text-center">기간</div>
                                <div className="text-right">총 매출</div>
                                <div className="text-right">수수료</div>
                                <div className="text-right">정산 금액</div>
                                <div className="text-center">상태</div>
                            </div>
                        </div>

                        {/* 요약 바 */}
                        {summary && (
                            <div className="px-6 py-3 bg-white border-b border-gray-100">
                                <div className="flex items-center justify-end gap-6 text-xs text-gray-600">
                                    <div>총 매출: <span className="font-semibold text-black">{formatCurrency(summary.totalGross)}</span></div>
                                    <div>수수료: <span className="font-semibold text-black">{formatCurrency(summary.totalFee)}</span></div>
                                    <div>정산 금액: <span className="font-semibold text-black">{formatCurrency(summary.totalNet)}</span></div>
                                    <div>건수: <span className="font-semibold text-black">{totalElements}</span></div>
                                </div>
                            </div>
                        )}

                        {/* 테이블 바디 */}
                        <div>
                            {tableBody}
                        </div>
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    총 <span className="font-bold text-black">{totalElements}</span>건
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        이전
                                    </button>
                                    <div className="flex space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                className={`px-3 py-2 text-sm border rounded-md ${currentPage === page
                                                    ? "text-white bg-blue-600 border-blue-600"
                                                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
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
};

export default SettlementManagement;
