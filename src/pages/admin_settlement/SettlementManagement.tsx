import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { toast } from "react-toastify";
import { adminStatisticsService } from "../../services/adminStatistics.service";
import type { TotalSalesStatistics, DailySalesDto } from "../../services/adminStatistics.service";

// ===== [DUMMY-START] SettlementManagement 테스트 더미 (실서버 전환 시 이 블록 삭제 가능) =====

interface SettlementItem {
    eventName: string;
    startDate: string;
    endDate: string;
    totalAmount: number; // 총 매출
    totalFee: number;    // 수수료 금액
    totalRevenue: number; // 정산 금액(순수익)
    paymentCount: number; // 결제 건수
    averageSales: number; // 총 매출
}

// ===== [DUMMY-END] SettlementManagement 테스트 더미 =====

const formatCurrency = (value: number) => new Intl.NumberFormat("ko-KR").format(value) + "원";

// 일별 매출 추이 섹션 (실제 API 데이터 사용)
const SalesTrendSection: React.FC<{
    dailySalesData: DailySalesDto[];
    dailySalesLoading: boolean;
}> = ({ dailySalesData, dailySalesLoading }) => {

    if (dailySalesLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">일별 매출 추이</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">매출 추이 데이터를 불러오는 중...</span>
                </div>
            </div>
        );
    }

    if (!dailySalesData || dailySalesData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">일별 매출 추이</h3>
                </div>
                <div className="text-center py-8 text-gray-500">
                    이번 달 매출 데이터가 없습니다.
                </div>
            </div>
        );
    }

    const maxVal = Math.max(...dailySalesData.map(d => d.totalAmount));

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">일별 매출 추이</h3>
                <div className="text-sm text-gray-500">
                    {dayjs().format('YYYY년 MM월')} ({dailySalesData.length}일)
                </div>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {dailySalesData.map((d, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{dayjs(d.date).format("MM/DD (ddd)")}</span>
                            <div className="text-right">
                                <span className="text-gray-900 font-semibold">
                                    {new Intl.NumberFormat("ko-KR").format(d.totalAmount)}원
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                    ({d.totalCount}건)
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="h-3 rounded-full transition-all duration-500 ease-out" 
                                style={{ 
                                    width: `${maxVal > 0 ? (d.totalAmount / maxVal) * 100 : 0}%`, 
                                    background: "linear-gradient(90deg,#2563eb,#16a34a)" 
                                }} 
                            />
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                        <div className="text-xs text-gray-500">총 매출</div>
                        <div className="font-semibold text-gray-900">
                            {new Intl.NumberFormat("ko-KR").format(dailySalesData.reduce((sum, d) => sum + d.totalAmount, 0))}원
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">총 거래</div>
                        <div className="font-semibold text-gray-900">
                            {dailySalesData.reduce((sum, d) => sum + d.totalCount, 0)}건
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">일일 총매출</div>
                        <div className="font-semibold text-gray-900">
                            {new Intl.NumberFormat("ko-KR").format(
                                Math.round(dailySalesData.reduce((sum, d) => sum + d.totalAmount, 0) / dailySalesData.length)
                            )}원
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 수익 출처별 매출 비교 섹션 (getEventCompare API 데이터만 사용)
interface RevenueSourcesSectionProps {
    eventCompareData: DailySalesDto[];
    compareLoading: boolean;
}

const RevenueSourcesSection: React.FC<RevenueSourcesSectionProps> = ({ 
    eventCompareData, 
    compareLoading 
}) => {
    if (compareLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">수익 출처별 매출 비교</h3>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">데이터를 불러오는 중...</span>
                </div>
            </div>
        );
    }

    // getEventCompare API 데이터만 사용
    const totals = { "예매": 0, "부스": 0, "광고": 0, "기타": 0 } as Record<string, number>;
    
    eventCompareData.forEach(item => {
        totals["예매"] += item.reservationAmount || 0;
        totals["부스"] += item.boothAmount || 0;
        totals["광고"] += item.adAmount || 0;
        totals["기타"] += item.etcAmount || 0;
    });

    const data = Object.entries(totals).map(([label, value]) => ({ label, value }));
    const maxVal = Math.max(1, ...data.map(d => d.value));
    const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);

    // 데이터가 없는 경우
    if (totalRevenue === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">수익 출처별 매출 비교</h3>
                <div className="text-center py-8 text-gray-500">
                    수익 출처별 데이터가 없습니다.
                </div>
            </div>
        );
    }

    // 색상 팔레트
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    // 데이터를 내림차순으로 정렬
    const sortedData = data.sort((a, b) => b.value - a.value);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">수익 출처별 매출 비교</h3>

            {/* 상단 요약 카드 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {sortedData.map((d, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold" style={{ color: colors[i] }}>
                            {totalRevenue > 0 ? ((d.value / totalRevenue) * 100).toFixed(1) : '0.0'}%
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
                        {sortedData.map((d, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{d.label}</span>
                                    <span className="text-gray-600">{new Intl.NumberFormat("ko-KR").format(d.value)}원</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%`,
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
                            {sortedData.map((d, i) => {
                                const percentage = totalRevenue > 0 ? (d.value / totalRevenue) * 100 : 0;
                                const radius = 40;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDasharray = circumference;
                                const strokeDashoffset = circumference - (percentage / 100) * circumference;

                                let offset = 0;
                                for (let j = 0; j < i; j++) {
                                    offset += totalRevenue > 0 ? (sortedData[j].value / totalRevenue) * 100 : 0;
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
                            <span className="font-medium">
                                {sortedData[0]?.label || '-'} ({totalRevenue > 0 ? (sortedData[0]?.value / totalRevenue * 100).toFixed(1) : '0.0'}%)
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">가장 낮은 비중:</span>
                            <span className="font-medium">
                                {sortedData[sortedData.length - 1]?.label || '-'} ({totalRevenue > 0 ? (sortedData[sortedData.length - 1]?.value / totalRevenue * 100).toFixed(1) : '0.0'}%)
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">총 매출:</span>
                            <span className="font-medium">
                                {new Intl.NumberFormat("ko-KR").format(sortedData.length > 0 ? Math.round(totalRevenue / sortedData.length) : 0)}원
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">총 거래 건수:</span>
                            <span className="font-medium">
                                {new Intl.NumberFormat("ko-KR").format(eventCompareData.reduce((sum, item) => sum + (item.totalCount || 0), 0))}건
                            </span>
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
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // 데이터
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [settlements, setSettlements] = useState<SettlementItem[]>([]);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [summary, setSummary] = useState<{ totalGross: number; totalNet: number; totalFee: number; totalCount: number } | null>(null);
    
    // 매출 통계 상태
    const [salesStats, setSalesStats] = useState<TotalSalesStatistics | null>(null);
    const [statsLoading, setStatsLoading] = useState<boolean>(true);
    const [dailySalesData, setDailySalesData] = useState<DailySalesDto[]>([]);
    const [dailySalesLoading, setDailySalesLoading] = useState<boolean>(false);
    const [eventCompareData, setEventCompareData] = useState<DailySalesDto[]>([]);
    const [compareLoading, setCompareLoading] = useState<boolean>(false);

    // 매출 통계 로드 함수
    const loadSalesStatistics = useCallback(async () => {
        try {
            setStatsLoading(true);
            const stats = await adminStatisticsService.getTotalSalesStatistics();
            setSalesStats(stats);
        } catch (error) {
            console.error('매출 통계 로드 실패:', error);
            toast.error('매출 통계를 불러오는데 실패했습니다.');
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // 수수료 계산 함수 (8%)
    const calculateCommission = useCallback((revenue: number) => {
        return Math.round(revenue * 0.08);
    }, []);

    // 정산 금액 계산 함수  
    const calculateSettlement = useCallback((revenue: number) => {
        return revenue - calculateCommission(revenue);
    }, [calculateCommission]);

    // 일별 매출 데이터 로드 함수 (이번 달 첫날부터 오늘까지)
    const loadDailySalesData = useCallback(async () => {
        try {
            setDailySalesLoading(true);
            
            // 이번 달 첫날
            const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
            // 오늘
            const today = dayjs().format('YYYY-MM-DD');
            
            const data = await adminStatisticsService.getDailySales(startOfMonth, today);
            setDailySalesData(data);
        } catch (error) {
            console.error('일별 매출 데이터 로드 실패:', error);
            toast.error('일별 매출 데이터를 불러오는데 실패했습니다.');
        } finally {
            setDailySalesLoading(false);
        }
    }, []);

    // 이벤트 비교 데이터 로드 함수
    const loadEventCompareData = useCallback(async () => {
        try {
            setCompareLoading(true);
            const data = await adminStatisticsService.getEventCompare();
            // API가 단일 객체를 반환하는 경우 배열로 변환
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                setEventCompareData([data]);
            } else if (Array.isArray(data)) {
                setEventCompareData(data);
            } else {
                setEventCompareData([]);
            }
        } catch (error) {
            console.error('이벤트 비교 데이터 로드 실패:', error);
            toast.error('이벤트 비교 데이터를 불러오는데 실패했습니다.');
            setEventCompareData([]);
        } finally {
            setCompareLoading(false);
        }
    }, []);

    const fetchSettlements = useCallback(async () => {
        try {
            setLoading(true);
            
            // getAllSales API 사용
            const response = await adminStatisticsService.getAllSales();
            const settlements = response.content.flat(); // AllSalesDto[] 배열을 평탄화
            
            // SettlementItem 형식으로 변환
            const formattedSettlements: SettlementItem[] = settlements.map(item => {
                // 임시로 결제 건수를 1로 설정 (실제로는 API에서 제공되어야 함)
                const paymentCount = 1; 
                const averageSales = item.totalAmount / paymentCount;
                
                return {
                    eventName: item.eventName,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    totalAmount: item.totalAmount,
                    totalFee: item.totalFee,
                    totalRevenue: item.totalRevenue,
                    paymentCount: paymentCount,
                    averageSales: averageSales
                };
            });

            // 검색 및 필터링 적용
            let filteredList = formattedSettlements;
            
            if (searchName) {
                filteredList = filteredList.filter((x) => 
                    x.eventName.toLowerCase().includes(searchName.toLowerCase())
                );
            }
            
            if (startDate) {
                filteredList = filteredList.filter((x) => 
                    dayjs(x.startDate).isSameOrAfter(dayjs(startDate), "day")
                );
            }
            
            if (endDate) {
                filteredList = filteredList.filter((x) => 
                    dayjs(x.endDate).isSameOrBefore(dayjs(endDate), "day")
                );
            }

            // 페이지네이션 적용
            const pageSize = 10;
            const from = (currentPage - 1) * pageSize;
            const pageData = filteredList.slice(from, from + pageSize);
            
            // 요약 정보 계산
            const sum = {
                totalGross: filteredList.reduce((a, b) => a + b.totalAmount, 0),
                totalNet: filteredList.reduce((a, b) => a + b.totalRevenue, 0),
                totalFee: filteredList.reduce((a, b) => a + b.totalFee, 0),
                totalCount: filteredList.length,
            };

            setSettlements(pageData);
            setTotalElements(filteredList.length);
            setTotalPages(Math.max(1, Math.ceil(filteredList.length / pageSize)));
            setSummary(sum);
            
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
    }, [currentPage, endDate, searchName, startDate]);

    useEffect(() => {
        fetchSettlements();
    }, [fetchSettlements]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchName, startDate, endDate]);

    // 매출 통계 로드
    useEffect(() => {
        loadSalesStatistics();
    }, [loadSalesStatistics]);

    // 일별 매출 데이터 로드
    useEffect(() => {
        loadDailySalesData();
    }, [loadDailySalesData]);

    // 이벤트 비교 데이터 로드
    useEffect(() => {
        loadEventCompareData();
    }, [loadEventCompareData]);

    const handleReset = () => {
        setSearchName("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
    };

    const handleExport = async () => {
        try {
            let exportStartDate: string;
            let exportEndDate: string;

            // 날짜 조건 처리
            if (!startDate && !endDate) {
                // 시작일과 종료일이 모두 없으면 전체 데이터
                // 충분히 과거 날짜부터 오늘까지
                exportStartDate = "2020-01-01";
                exportEndDate = dayjs().format("YYYY-MM-DD");
            } else if (startDate && !endDate) {
                // 시작일만 있으면 시작일부터 오늘까지
                exportStartDate = startDate;
                exportEndDate = dayjs().format("YYYY-MM-DD");
            } else if (!startDate && endDate) {
                // 종료일만 있으면 충분히 과거 날짜부터 종료날짜까지
                exportStartDate = "2020-01-01";
                exportEndDate = endDate;
            } else {
                // 시작일과 종료일이 모두 있으면 그대로 사용
                exportStartDate = startDate;
                exportEndDate = endDate;
            }

            // Excel 파일 다운로드
            const blob = await adminStatisticsService.exportSettlements(
                exportStartDate,
                exportEndDate,
                searchName || undefined,
                undefined, // settlementStatus - 현재 사용하지 않음
                undefined  // disputeStatus - 현재 사용하지 않음
            );

            // 파일 다운로드 처리
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `settlements_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("정산 데이터가 성공적으로 내보내졌습니다.");
        } catch (err) {
            console.error("정산 내보내기 실패:", err);
            toast.error("정산 내보내기에 실패했습니다.");
        }
    };

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
                key={`settlement-${currentPage}-${idx}`}
                className={`grid grid-cols-5 gap-3 py-5 px-6 text-sm items-center ${idx !== settlements.length - 1 ? "border-b border-gray-200" : ""}`}
                style={{ gridTemplateColumns: "1fr 2fr 1.2fr 1.2fr 1.2fr" }}
            >
                <div className="text-left font-bold text-black truncate">{s.eventName}</div>
                <div className="text-center text-gray-700">{dayjs(s.startDate).format("YYYY.MM.DD")} ~ {dayjs(s.endDate).format("YYYY.MM.DD")}</div>
                <div className="text-right text-gray-700">{formatCurrency(s.totalAmount)}</div>
                <div className="text-right text-gray-700">{formatCurrency(s.totalFee)}</div>
                <div className="text-right text-black font-semibold">{formatCurrency(s.totalRevenue)}</div>
            </div>
        ));
    }, [loading, settlements, currentPage]);

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
                    
                    {/* 매출 통계 요약 */}
                    {statsLoading ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">매출 통계를 불러오는 중...</span>
                            </div>
                        </div>
                    ) : salesStats ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 매출 통계</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-blue-600 mb-1">총 매출액</div>
                                    <div className="text-2xl font-bold text-blue-900">₩{salesStats.totalRevenue.toLocaleString()}</div>
                                    <div className="text-xs text-blue-600 mt-1">총 {salesStats.totalPayments}건의 결제</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-green-600 mb-1">플랫폼 수수료 (8%)</div>
                                    <div className="text-2xl font-bold text-green-900">₩{calculateCommission(salesStats.totalRevenue).toLocaleString()}</div>
                                    
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-purple-600 mb-1">정산 금액</div>
                                    <div className="text-2xl font-bold text-purple-900">₩{calculateSettlement(salesStats.totalRevenue).toLocaleString()}</div>
                                    <div className="text-xs text-purple-600 mt-1">주최자에게 지급될 금액</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="text-center py-8 text-gray-500">
                                매출 통계를 불러올 수 없습니다.
                            </div>
                        </div>
                    )}

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

                    {/* 카드 2: 일별 / 월별 매출 추이 */}
                    <SalesTrendSection 
                        dailySalesData={dailySalesData}
                        dailySalesLoading={dailySalesLoading}
                    />

                    {/* 카드 2.5: 수익 출처별 매출 비교 */}
                    <RevenueSourcesSection 
                        eventCompareData={eventCompareData}
                        compareLoading={compareLoading}
                    />

                    {/* 카드 3: 매출 상세 내역 리스트 (기존 테이블 유지) */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div
                                className="grid grid-cols-5 gap-3 text-sm font-bold text-gray-700"
                                style={{ gridTemplateColumns: "1fr 2fr 1.2fr 1.2fr 1.2fr" }}
                            >
                                <div className="text-left">행사명</div>
                                <div className="text-center">기간</div>
                                <div className="text-right">총 매출</div>
                                <div className="text-right">수수료</div>
                                <div className="text-right">실제 매출</div>
                            </div>
                        </div>

                        {/* 요약 바 */}
                        {summary && (
                            <div className="px-6 py-3 bg-white border-b border-gray-100">
                                <div className="flex items-center justify-end gap-6 text-xs text-gray-600">
                                    <div>총 매출: <span className="font-semibold text-black">{formatCurrency(summary.totalGross)}</span></div>
                                    <div>수수료: <span className="font-semibold text-black">{formatCurrency(summary.totalFee)}</span></div>
                                    <div>실제 매출: <span className="font-semibold text-black">{formatCurrency(summary.totalNet)}</span></div>

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
