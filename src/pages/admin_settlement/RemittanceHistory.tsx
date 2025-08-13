import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import api from "../../api/axios";
import { toast } from "react-toastify";

// ===== [DUMMY-START] RemittanceHistory 테스트 더미 (실서버 전환 시 삭제 가능) =====
const USE_DUMMY_REMITTANCE = true;

type RemittanceStatus = "대기" | "송금중" | "완료" | "실패";

interface RemittanceItem {
    id: number;
    settlementId: number;
    eventId: number;
    eventTitle: string;
    recipientName: string;
    bankName: string;
    accountNumber: string;
    amount: number;     // 총 송금액
    fee: number;        // 송금 수수료
    netPaid: number;    // 실제 입금액
    status: RemittanceStatus;
    requestedAt: string;
    processedAt?: string;
    memo?: string;
    breakdown?: Array<{ label: string; amount: number }>;
}

interface RemittanceListResponse {
    content: RemittanceItem[];
    totalElements: number;
    totalPages: number;
    summary?: { totalAmount: number; totalFee: number; totalNetPaid: number };
}

const DUMMY_REMITTANCES: RemittanceItem[] = Array.from({ length: 23 }).map((_, i) => {
    const base = dayjs("2025-07-05").add(i, "day");
    const amount = 800000 + i * 12345;
    const fee = 500 + (i % 3) * 250;
    const net = amount - fee;
    const statuses: RemittanceStatus[] = ["대기", "송금중", "완료", "실패"];
    return {
        id: 202507500 + i,
        settlementId: 202507000 + i,
        eventId: 1000 + i,
        eventTitle: `정산 행사 ${i + 1}`,
        recipientName: i % 2 === 0 ? "페어플레이 주식회사" : "홍길동",
        bankName: i % 2 === 0 ? "카카오뱅크" : "신한은행",
        accountNumber: i % 2 === 0 ? "3333-12-3456789" : "110-123-456789",
        amount,
        fee,
        netPaid: net,
        status: statuses[i % statuses.length],
        requestedAt: base.toISOString(),
        processedAt: i % 3 === 0 ? base.add(1, "day").toISOString() : undefined,
        memo: i % 4 === 0 ? "세금계산서 발행 요청됨" : undefined,
        breakdown: [
            { label: "티켓 정산", amount: Math.round(amount * 0.7) },
            { label: "부스 수익", amount: Math.round(amount * 0.3) },
        ],
    };
});
// ===== [DUMMY-END] RemittanceHistory 테스트 더미 =====

const formatCurrency = (value: number) => new Intl.NumberFormat("ko-KR").format(value) + "원";

const statusChipClass = (status: RemittanceStatus) => {
    switch (status) {
        case "대기":
            return "bg-yellow-100 text-yellow-800";
        case "송금중":
            return "bg-blue-100 text-blue-800";
        case "완료":
            return "bg-green-100 text-green-800";
        case "실패":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export const RemittanceHistory: React.FC = () => {
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
    const [items, setItems] = useState<RemittanceItem[]>([]);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [summary, setSummary] = useState<{ totalAmount: number; totalFee: number; totalNetPaid: number } | null>(null);

    // 상세 모달
    const [detailOpen, setDetailOpen] = useState<boolean>(false);
    const [detailItem, setDetailItem] = useState<RemittanceItem | null>(null);

    const openDetail = (item: RemittanceItem) => {
        setDetailItem(item);
        setDetailOpen(true);
    };

    const closeDetail = () => {
        setDetailOpen(false);
        setDetailItem(null);
    };

    const fetchRemittances = useCallback(async () => {
        try {
            setLoading(true);
            if (USE_DUMMY_REMITTANCE) {
                let list = DUMMY_REMITTANCES;
                if (searchName) list = list.filter(x => x.eventTitle.toLowerCase().includes(searchName.toLowerCase()));
                if (selectedStatus !== "전체") list = list.filter(x => x.status === selectedStatus);
                if (startDate) list = list.filter(x => dayjs(x.requestedAt).isSameOrAfter(dayjs(startDate), "day"));
                if (endDate) list = list.filter(x => dayjs(x.requestedAt).isSameOrBefore(dayjs(endDate), "day"));

                const pageSize = 10;
                const from = (currentPage - 1) * pageSize;
                const pageSlice = list.slice(from, from + pageSize);
                setItems(pageSlice);
                setTotalElements(list.length);
                setTotalPages(Math.max(1, Math.ceil(list.length / pageSize)));
                // 요약(필터 전체 기준)
                const sum = {
                    totalAmount: list.reduce((a, b) => a + b.amount, 0),
                    totalFee: list.reduce((a, b) => a + b.fee, 0),
                    totalNetPaid: list.reduce((a, b) => a + b.netPaid, 0),
                };
                setSummary(sum);
                return;
            }

            const params: Record<string, string | number> = { page: currentPage - 1, size: 10 };
            if (searchName) params.keyword = searchName;
            if (selectedStatus !== "전체") params.status = selectedStatus;
            if (startDate) params.fromDate = startDate;
            if (endDate) params.toDate = endDate;

            const res = await api.get<RemittanceListResponse>("/api/admin/remittances", { params });
            const data = res.data as RemittanceListResponse;
            setItems(data.content || []);
            setTotalElements(data.totalElements || 0);
            setTotalPages(data.totalPages || 1);
            if (data.summary) {
                setSummary(data.summary);
            } else if (data.content) {
                // 서버에서 요약을 제공하지 않으면 현재 페이지 기준으로 임시 합산
                const sum = {
                    totalAmount: data.content.reduce((a, b) => a + (b.amount || 0), 0),
                    totalFee: data.content.reduce((a, b) => a + (b.fee || 0), 0),
                    totalNetPaid: data.content.reduce((a, b) => a + (b.netPaid || 0), 0),
                };
                setSummary(sum);
            } else {
                setSummary(null);
            }
        } catch {
            console.error("송금 내역 조회 실패:")
            toast.error("송금 내역을 불러오지 못했습니다.");
            setItems([]);
            setTotalElements(0);
            setTotalPages(1);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [currentPage, endDate, searchName, selectedStatus, startDate]);

    useEffect(() => {
        fetchRemittances();
    }, [fetchRemittances]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchName, selectedStatus, startDate, endDate]);

    const statuses: Array<"전체" | RemittanceStatus> = ["전체", "대기", "송금중", "완료", "실패"];

    const tableBody = useMemo(() => {
        if (loading) {
            return (
                <div className="py-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    데이터를 불러오는 중...
                </div>
            );
        }
        if (!items || items.length === 0) {
            return <div className="py-8 text-center text-gray-500">송금 내역이 없습니다.</div>;
        }
        return items.map((r, idx) => (
            <div
                key={r.id}
                className={`grid grid-cols-9 gap-3 py-5 px-6 text-sm items-center ${idx !== items.length - 1 ? "border-b border-gray-200" : ""}`}
                style={{ gridTemplateColumns: "1fr 2fr 1.3fr 1.3fr 1.1fr 1.1fr 1.1fr 1fr 0.9fr" }}
            >
                <div className="text-left text-gray-700">{r.id}</div>
                <div className="text-left font-bold text-black truncate">{r.eventTitle}</div>
                <div className="text-left text-gray-700 truncate">{r.recipientName}</div>
                <div className="text-left text-gray-700 truncate">{r.bankName} {r.accountNumber}</div>
                <div className="text-right text-gray-700">{formatCurrency(r.amount)}</div>
                <div className="text-right text-gray-700">{formatCurrency(r.fee)}</div>
                <div className="text-right text-black font-semibold">{formatCurrency(r.netPaid)}</div>
                <div className="text-center"><span className={`inline-block px-3 py-1 rounded text-xs font-medium ${statusChipClass(r.status)}`}>{r.status}</span></div>
                <div className="text-center">
                    <button
                        onClick={() => openDetail(r)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                    >
                        상세보기
                    </button>
                </div>
            </div>
        ));
    }, [items, loading]);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    송금 내역
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
                                    onClick={() => {
                                        toast.info("내보내기는 추후 연결 예정입니다.");
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-[10px] hover:bg-gray-800 focus:outline-none"
                                >
                                    CSV 내보내기
                                </button>
                                <button
                                    onClick={() => { setSearchName(""); setSelectedStatus("전체"); setStartDate(""); setEndDate(""); setCurrentPage(1); }}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-[10px] hover:bg-gray-50 focus:outline-none"
                                >
                                    초기화
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-4" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">행사명</label>
                                <input type="text" value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="행사명을 입력하세요" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">상태</label>
                                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                                    {(statuses as string[]).map(s => (<option key={s} value={s}>{s}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">요청 시작일</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">요청 종료일</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* 카드 2: 송금 내역 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-9 gap-3 text-sm font-bold text-gray-700" style={{ gridTemplateColumns: "1fr 2fr 1.3fr 1.3fr 1.1fr 1.1fr 1.1fr 1fr 0.9fr" }}>
                                <div className="text-left">송금 ID</div>
                                <div className="text-left">행사명</div>
                                <div className="text-left">수취인</div>
                                <div className="text-left">입금계좌</div>
                                <div className="text-right">총 송금액</div>
                                <div className="text-right">수수료</div>
                                <div className="text-right">실제 입금액</div>
                                <div className="text-center">상태</div>
                                <div className="text-center">상세</div>
                            </div>
                        </div>
                        {/* 요약 바 */}
                        {summary && (
                            <div className="px-6 py-3 bg-white border-b border-gray-100">
                                <div className="flex items-center justify-end gap-6 text-xs text-gray-600">
                                    <div>총 송금액: <span className="font-semibold text-black">{formatCurrency(summary.totalAmount)}</span></div>
                                    <div>수수료: <span className="font-semibold text-black">{formatCurrency(summary.totalFee)}</span></div>
                                    <div>실제 입금액: <span className="font-semibold text-black">{formatCurrency(summary.totalNetPaid)}</span></div>
                                    <div>건수: <span className="font-semibold text-black">{totalElements}</span></div>
                                </div>
                            </div>
                        )}
                        {/* 바디 */}
                        <div>
                            {tableBody}
                        </div>
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">총 <span className="font-bold text-black">{totalElements}</span>건</div>
                                <div className="flex items-center space-x-2">
                                    <button className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>이전</button>
                                    <div className="flex space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button key={page} className={`px-3 py-2 text-sm border rounded-md ${currentPage === page ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"}`} onClick={() => setCurrentPage(page)}>{page}</button>
                                        ))}
                                    </div>
                                    <button className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>다음</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 상세 모달 */}
            {detailOpen && detailItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-[10px] shadow-xl w-[720px] max-h-[90vh] overflow-y-auto">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">송금 상세</h2>
                            <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600 focus:outline-none">×</button>
                        </div>
                        {/* 바디 */}
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500">송금 ID</div>
                                    <div className="text-sm font-semibold">{detailItem.id}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">정산 ID</div>
                                    <div className="text-sm font-semibold">{detailItem.settlementId}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-xs text-gray-500">행사명</div>
                                    <div className="text-sm font-semibold">{detailItem.eventTitle}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">수취인</div>
                                    <div className="text-sm font-semibold">{detailItem.recipientName}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">입금계좌</div>
                                    <div className="text-sm font-semibold">{detailItem.bankName} {detailItem.accountNumber}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">요청일</div>
                                    <div className="text-sm font-semibold">{dayjs(detailItem.requestedAt).format("YYYY.MM.DD HH:mm")}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">처리일</div>
                                    <div className="text-sm font-semibold">{detailItem.processedAt ? dayjs(detailItem.processedAt).format("YYYY.MM.DD HH:mm") : '-'}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500">총 송금액</div>
                                    <div className="text-base font-bold text-black">{formatCurrency(detailItem.amount)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">수수료</div>
                                    <div className="text-base font-bold text-black">{formatCurrency(detailItem.fee)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">실제 입금액</div>
                                    <div className="text-base font-bold text-black">{formatCurrency(detailItem.netPaid)}</div>
                                </div>
                            </div>
                            {detailItem.memo && (
                                <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700">메모: {detailItem.memo}</div>
                            )}
                            {detailItem.breakdown && detailItem.breakdown.length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold mb-2">내역</div>
                                    <div className="space-y-2">
                                        {detailItem.breakdown.map((b, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <div className="text-gray-700">{b.label}</div>
                                                <div className="text-gray-900 font-semibold">{formatCurrency(b.amount)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* 푸터 */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button onClick={closeDetail} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-[10px] text-sm font-medium hover:bg-gray-50 transition-colors">닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemittanceHistory;
