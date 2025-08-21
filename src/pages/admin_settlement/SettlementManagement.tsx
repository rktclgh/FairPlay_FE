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

const DUMMY_SETTLEMENTS: SettlementItem[] = Array.from({ length: 50 }).map((_, i) => {
    const base = dayjs("2025-07-01").add(i, "day");
    const gross = 1000000 + i * 13750;
    const fee = Math.round(gross * 0.08);
    const net = gross - fee;
    const statuses: Array<SettlementItem["status"]> = ["대기", "완료", "보류"];

    // 현실적인 행사명 더미 데이터
    const eventNames = [
        "2025 서울 봄 페스티벌",
        "부산 해운대 음악제",
        "대구 국제 영화제",
        "인천 월미도 불꽃축제",
        "광주 비엔날레",
        "대전 사이언스 페어",
        "울산 태화강 봄축제",
        "세종 도시재생 페스티벌",
        "경기 수원 화성 문화제",
        "강원 강릉 단오제",
        "충북 청주 공예비엔날레",
        "충남 아산 온양온천 축제",
        "전북 전주 한옥마을 축제",
        "전남 여수 엑스포 축제",
        "경북 경주 불국사 문화제",
        "경남 진주 남강유등축제",
        "제주 한라문화제",
        "부산국제영화제",
        "서울 국제 도서전",
        "부산 국제 영화제",
        "대구 국제 뮤지컬 페스티벌",
        "인천 국제 공연예술제",
        "광주 국제 음악제",
        "대전 국제 과학기술 엑스포",
        "울산 국제 해양축제",
        "세종 국제 교육박람회",
        "경기 수원 국제 영화제",
        "강원 평창 동계올림픽 기념축제",
        "충북 청주 국제 공예전",
        "충남 아산 국제 온천축제",
        "전북 전주 국제 영화제",
        "전남 여수 국제 엑스포",
        "경북 경주 국제 문화제",
        "경남 진주 국제 유등축제",
        "제주 국제 해양축제",
        "서울 국제 패션위크",
        "부산 국제 요트쇼",
        "대구 국제 와인페스티벌",
        "인천 국제 항공우주전시회",
        "광주 국제 디자인비엔날레",
        "대전 국제 로봇엑스포",
        "울산 국제 에너지엑스포",
        "세종 국제 스마트시티엑스포",
        "경기 수원 국제 정원박람회",
        "강원 강릉 국제 커피축제",
        "충북 청주 국제 와인페스티벌",
        "충남 아산 국제 온천문화제",
        "전북 전주 국제 한복문화제",
        "전남 여수 국제 해양문화제",
        "경북 경주 국제 불교문화제",
        "경남 진주 국제 유등문화제",
        "제주 국제 해양문화제"
    ];

    return {
        id: 202507000 + i,
        eventId: 1000 + i,
        eventTitle: eventNames[i % eventNames.length],
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

// 일/월별 추이 섹션 (간단 바차트 렌더링)
const SalesTrendSection: React.FC<{
    useDummy: boolean;
    onSummaryChange: (summary: { totalGross: number; totalNet: number; totalFee: number; totalCount: number }) => void;
}> = ({ useDummy, onSummaryChange }) => {
    const [granularity, setGranularity] = useState<"daily" | "monthly">("daily");

    // 하드코딩된 데이터로 변경
    React.useEffect(() => {
        if (!useDummy) return;

        let data: Array<{ label: string; value: number }>;

        if (granularity === "daily") {
            // 하드코딩된 일별 데이터 (최근 30일)
            data = [
                { label: "01/01", value: 450000 },
                { label: "01/02", value: 520000 },
                { label: "01/03", value: 380000 },
                { label: "01/04", value: 610000 },
                { label: "01/05", value: 680000 },
                { label: "01/06", value: 890000 },
                { label: "01/07", value: 420000 },
                { label: "01/08", value: 550000 },
                { label: "01/09", value: 720000 },
                { label: "01/10", value: 810000 },
                { label: "01/11", value: 760000 },
                { label: "01/12", value: 920000 },
                { label: "01/13", value: 480000 },
                { label: "01/14", value: 650000 },
                { label: "01/15", value: 780000 },
                { label: "01/16", value: 850000 },
                { label: "01/17", value: 690000 },
                { label: "01/18", value: 940000 },
                { label: "01/19", value: 510000 },
                { label: "01/20", value: 670000 },
                { label: "01/21", value: 830000 },
                { label: "01/22", value: 760000 },
                { label: "01/23", value: 890000 },
                { label: "01/24", value: 540000 },
                { label: "01/25", value: 720000 },
                { label: "01/26", value: 810000 },
                { label: "01/27", value: 680000 },
                { label: "01/28", value: 950000 },
                { label: "01/29", value: 620000 },
                { label: "01/30", value: 780000 }
            ];
        } else {
            // 하드코딩된 월별 데이터 (2024-12부터 2025-08까지)
            data = [
                { label: "2024-12", value: 8500000 },
                { label: "2025-01", value: 9200000 },
                { label: "2025-02", value: 7800000 },
                { label: "2025-03", value: 9500000 },
                { label: "2025-04", value: 8800000 },
                { label: "2025-05", value: 10200000 },
                { label: "2025-06", value: 11500000 },
                { label: "2025-07", value: 12800000 },
                { label: "2025-08", value: 13500000 }
            ];
        }

        const totalGross = data.reduce((sum, d) => sum + d.value, 0);
        const totalFee = Math.round(totalGross * 0.08);
        const totalNet = totalGross - totalFee;
        const totalCount = granularity === "daily" ? 30 : 9; // 일별은 30일, 월별은 9개월

        onSummaryChange({
            totalGross,
            totalFee,
            totalNet,
            totalCount
        });
    }, [granularity, onSummaryChange, useDummy]);

    if (!useDummy) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">일별 / 월별 매출 추이</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setGranularity("daily")} className={`px-3 py-1.5 text-xs border rounded-md ${granularity === "daily" ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"}`}>일별</button>
                        <button onClick={() => setGranularity("monthly")} className={`px-3 py-1.5 text-xs border rounded-md ${granularity === "monthly" ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"}`}>월별</button>
                    </div>
                </div>
                <div className="text-sm text-gray-500">서버 연동 대기</div>
            </div>
        );
    }

    // 하드코딩된 데이터 렌더링
    let data: Array<{ label: string; value: number }>;

    if (granularity === "daily") {
        data = [
            { label: "01/01", value: 450000 },
            { label: "01/02", value: 520000 },
            { label: "01/03", value: 380000 },
            { label: "01/04", value: 610000 },
            { label: "01/05", value: 680000 },
            { label: "01/06", value: 890000 },
            { label: "01/07", value: 420000 },
            { label: "01/08", value: 550000 },
            { label: "01/09", value: 720000 },
            { label: "01/10", value: 810000 },
            { label: "01/11", value: 760000 },
            { label: "01/12", value: 920000 },
            { label: "01/13", value: 480000 },
            { label: "01/14", value: 650000 },
            { label: "01/15", value: 780000 },
            { label: "01/16", value: 850000 },
            { label: "01/17", value: 690000 },
            { label: "01/18", value: 940000 },
            { label: "01/19", value: 510000 },
            { label: "01/20", value: 670000 },
            { label: "01/21", value: 830000 },
            { label: "01/22", value: 760000 },
            { label: "01/23", value: 890000 },
            { label: "01/24", value: 540000 },
            { label: "01/25", value: 720000 },
            { label: "01/26", value: 810000 },
            { label: "01/27", value: 680000 },
            { label: "01/28", value: 950000 },
            { label: "01/29", value: 620000 },
            { label: "01/30", value: 780000 }
        ];
    } else {
        data = [
            { label: "2024-12", value: 8500000 },
            { label: "2025-01", value: 9200000 },
            { label: "2025-02", value: 7800000 },
            { label: "2025-03", value: 9500000 },
            { label: "2025-04", value: 8800000 },
            { label: "2025-05", value: 10200000 },
            { label: "2025-06", value: 11500000 },
            { label: "2025-07", value: 12800000 },
            { label: "2025-08", value: 13500000 }
        ];
    }

    const maxVal = Math.max(1, ...data.map(d => d.value));

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">일별 / 월별 매출 추이</h3>
                <div className="flex gap-2">
                    <button onClick={() => setGranularity("daily")} className={`px-3 py-1.5 text-xs border rounded-md ${granularity === "daily" ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"}`}>일별</button>
                    <button onClick={() => setGranularity("monthly")} className={`px-3 py-1.5 text-xs border rounded-md ${granularity === "monthly" ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"}`}>월별</button>
                </div>
            </div>
            <div className="space-y-2">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-16 text-[11px] text-gray-500 text-right">{d.label}</div>
                        <div className="flex-1 h-4 bg-gray-100 rounded">
                            <div className="h-4 rounded" style={{ width: `${(d.value / maxVal) * 100}%`, background: "linear-gradient(90deg,#2563eb,#16a34a)" }} />
                        </div>
                        <div className="w-28 text-right text-xs text-gray-700">{new Intl.NumberFormat("ko-KR").format(d.value)}원</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 수익 출처별 매출 비교 섹션 (간단 바차트 렌더링)
const RevenueSourcesSection: React.FC<{ useDummy: boolean; startDate: string; endDate: string; }> = ({ useDummy, startDate, endDate }) => {
    if (!useDummy) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">수익 출처별 매출 비교</h3>
                <div className="text-sm text-gray-500">서버 연동 대기</div>
            </div>
        );
    }

    const from = startDate ? dayjs(startDate) : dayjs(DUMMY_SETTLEMENTS[0]?.period.startDate);
    const to = endDate ? dayjs(endDate) : dayjs(DUMMY_SETTLEMENTS[DUMMY_SETTLEMENTS.length - 1]?.period.endDate);
    if (!from.isValid() || !to.isValid() || from.isAfter(to)) return null;

    const inRange = DUMMY_SETTLEMENTS.filter(s => dayjs(s.period.endDate).isSameOrAfter(from, "day") && dayjs(s.period.startDate).isSameOrBefore(to, "day"));

    // 더미 가중치: 예매 60%, 부스 30%, 광고 5%, 기타 5% (총매출 기준)
    const totals = { "예매": 0, "부스": 0, "광고": 0, "기타": 0 } as Record<string, number>;
    inRange.forEach(s => {
        totals["예매"] += Math.round(s.grossSales * 0.6);
        totals["부스"] += Math.round(s.grossSales * 0.3);
        totals["광고"] += Math.round(s.grossSales * 0.05);
        totals["기타"] += Math.round(s.grossSales * 0.05);
    });

    const data = Object.entries(totals).map(([label, value]) => ({ label, value }));
    const maxVal = Math.max(1, ...data.map(d => d.value));
    const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);

    // 색상 팔레트
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">수익 출처별 매출 비교</h3>

            {/* 상단 요약 카드 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {data.map((d, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold" style={{ color: colors[i] }}>
                            {((d.value / totalRevenue) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{d.label}</div>
                        <div className="text-lg font-semibold text-gray-900 mt-2">
                            {new Intl.NumberFormat("ko-KR").format(d.value)}원
                        </div>
                    </div>
                ))}
            </div>

            {/* 메인 차트 섹션 */}
            <div className="grid grid-cols-2 gap-6">
                {/* 왼쪽: 바 차트 */}
                <div>
                    <h4 className="text-md font-medium text-gray-700 mb-4">매출 금액 비교</h4>
                    <div className="space-y-4">
                        {data.map((d, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{d.label}</span>
                                    <span className="text-gray-600">{new Intl.NumberFormat("ko-KR").format(d.value)}원</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${(d.value / maxVal) * 100}%`,
                                            backgroundColor: colors[i]
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 오른쪽: 원형 차트 (시각적 표현) */}
                <div>
                    <h4 className="text-md font-medium text-gray-700 mb-4">비율 분포</h4>
                    <div className="relative w-32 h-32 mx-auto">
                        {/* 원형 차트 시각화 */}
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                            {data.map((d, i) => {
                                const percentage = (d.value / totalRevenue) * 100;
                                const radius = 40;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDasharray = circumference;
                                const strokeDashoffset = circumference - (percentage / 100) * circumference;

                                let offset = 0;
                                for (let j = 0; j < i; j++) {
                                    offset += (data[j].value / totalRevenue) * 100;
                                }
                                const startAngle = (offset / 100) * 360;

                                return (
                                    <circle
                                        key={i}
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        fill="none"
                                        stroke={colors[i]}
                                        strokeWidth="8"
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={strokeDashoffset}
                                        transform={`rotate(${startAngle} 50 50)`}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                );
                            })}
                        </svg>

                        {/* 중앙 텍스트 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat("ko-KR").format(totalRevenue)}원
                                </div>
                                <div className="text-xs text-gray-500">총 매출</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단 상세 정보 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-700 mb-3">상세 분석</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">가장 높은 비중:</span>
                            <span className="font-medium">{data[0].label} ({(data[0].value / totalRevenue * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">가장 낮은 비중:</span>
                            <span className="font-medium">{data[data.length - 1].label} ({(data[data.length - 1].value / totalRevenue * 100).toFixed(1)}%)</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">평균 매출:</span>
                            <span className="font-medium">{new Intl.NumberFormat("ko-KR").format(Math.round(totalRevenue / data.length))}원</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">표준편차:</span>
                            <span className="font-medium">±{new Intl.NumberFormat("ko-KR").format(Math.round(totalRevenue * 0.15))}원</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
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
    const [summary, setSummary] = useState<{ totalGross: number; totalNet: number; totalFee: number; totalCount: number } | null>(null);

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
                    totalCount: list.length,
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
            setSummary(data.summary ? {
                ...data.summary,
                totalCount: data.totalElements || 0
            } : null);
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
                    매출 통계
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

                        <div className="grid grid-cols-5 gap-4" style={{ gridTemplateColumns: "1.2fr 0.7fr 1fr 1fr 1fr" }}>
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
                            {/* 빠른 선택 */}
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={() => { const to = dayjs().format("YYYY-MM-DD"); const from = dayjs().subtract(6, "day").format("YYYY-MM-DD"); setStartDate(from); setEndDate(to); }}
                                    className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                                >최근 7일</button>
                                <button
                                    onClick={() => { const to = dayjs().format("YYYY-MM-DD"); const from = dayjs().subtract(29, "day").format("YYYY-MM-DD"); setStartDate(from); setEndDate(to); }}
                                    className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                                >최근 30일</button>
                                <button
                                    onClick={() => { const start = dayjs().startOf("month").format("YYYY-MM-DD"); const end = dayjs().endOf("month").format("YYYY-MM-DD"); setStartDate(start); setEndDate(end); }}
                                    className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                                >이번달</button>
                            </div>
                        </div>
                    </div>

                    {summary && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="grid grid-cols-4 gap-6">
                                <div>
                                    <div className="text-xs text-gray-500">총 매출</div>
                                    <div className="text-xl font-bold text-black">{formatCurrency(summary.totalGross)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">수수료</div>
                                    <div className="text-xl font-bold text-black">{formatCurrency(summary.totalFee)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">정산 금액</div>
                                    <div className="text-xl font-bold text-black">{formatCurrency(summary.totalNet)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">정산 건수</div>
                                    <div className="text-xl font-bold text-black">{totalElements}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 카드 2: 일별 / 월별 매출 추이 */}
                    <SalesTrendSection useDummy={USE_DUMMY_SETTLEMENT} onSummaryChange={(summary) => setSummary(summary)} />

                    {/* 카드 2.5: 수익 출처별 매출 비교 */}
                    <RevenueSourcesSection useDummy={USE_DUMMY_SETTLEMENT} startDate={startDate} endDate={endDate} />

                    {/* 카드 3: 매출 상세 내역 리스트 (기존 테이블 유지) */}
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
                                    <div>건수: <span className="font-semibold text-black">{summary.totalCount}</span></div>
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
