import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { hostStatisticsService, type HostEventReservationDto, type getDailyTrend } from "../../services/hostStatistics.service";
import authManager from "../../utils/auth";

// 차트용 데이터 인터페이스
interface ChartDataItem {
    date: string;
    rate: number;
}
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// 예매율 분석 페이지
export const BookingAnalysis: React.FC = () => {
    // 예매 통계 상태
    const [reservationStats, setReservationStats] = useState<HostEventReservationDto>({
        totalRate: 0,
        averageRate: 0,
        topRate: 0,
        bottomRate: 0
    });
    const [loading, setLoading] = useState<boolean>(false);
    
    // 일별 트렌드 데이터 상태 추가
    const [dailyTrendData, setDailyTrendData] = useState<ChartDataItem[]>([]);
    const [loadingDailyTrend, setLoadingDailyTrend] = useState<boolean>(false);

    const getUserId = (): number | null => {
        const userId = authManager.getCurrentUserId();
        return userId;
        
    };
    
    const userId = getUserId();

    // API 호출
    useEffect(() => {
        let ignore = false;
        const loadReservationStats = async () => {
            if (!userId) {
                console.error('userId가 없습니다.');
                return;
            }
            
            try {
                setLoading(true);
                const data = await hostStatisticsService.getEventReservationStatistics(userId);
                if (!ignore) {
                    setReservationStats(data);
                }
            } catch (error) {
                console.error('예매 통계 로딩 실패:', error);
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        loadReservationStats();
        return () => { ignore = true; };
    }, [userId]);

    // 일별 트렌드 데이터 로드
    useEffect(() => {
        let ignore = false;
        const loadDailyTrendData = async () => {
            if (!userId) {
                console.error('userId가 없습니다.');
                return;
            }
            
            try {
                setLoadingDailyTrend(true);
                const data = await hostStatisticsService.getDailyTrend(userId);
                if (!ignore) {
                    // API 데이터를 차트에 맞는 형태로 변환
                    const transformedData = data.map(item => ({
                        date: new Date(item.date).toLocaleDateString('ko-KR', { 
                            month: '2-digit', 
                            day: '2-digit' 
                        }).replace(/\./g, '/').slice(0, -1), // "12/01" 형태로 변환
                        rate: item.reservationRate
                    }));
                    setDailyTrendData(transformedData);
                }
                
            } catch (error) {
                console.error('일별 트렌드 데이터 로딩 실패:', error);
            } finally {
                if (!ignore) setLoadingDailyTrend(false);
            }
        };
        loadDailyTrendData();
        return () => { ignore = true; };
    }, [userId]);

    // 숫자 포맷팅 함수
    const formatRate = (rate: number) => {
        return rate.toFixed(1);
    };
    
    // 통계 카드 컴포넌트
    const StatCard: React.FC<{ title: string; value: string; unit?: string; trend?: string; isPositive?: boolean }> = ({ 
        title, 
        value, 
        unit, 
        trend, 
        isPositive 
    }) => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>
            <div className="flex items-baseline mb-2">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {unit && <span className="text-lg font-semibold text-gray-900 ml-1">{unit}</span>}
            </div>
            {trend && (
                <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '↗' : '↘'} {trend}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    예매율 분석
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 통계 카드 섹션 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {loading ? (
                            <>
                                <StatCard title="전체 예매율" value="로딩 중..." unit="" trend="" isPositive={true} />
                                <StatCard title="평균 예매율" value="로딩 중..." unit="" trend="" isPositive={true} />
                                <StatCard title="최고 예매율" value="로딩 중..." unit="" trend="" isPositive={true} />
                                <StatCard title="최저 예매율" value="로딩 중..." unit="" trend="" isPositive={true} />
                            </>
                        ) : (
                            <>
                                <StatCard 
                                    title="전체 예매율" 
                                    value={formatRate(reservationStats.totalRate)} 
                                    unit="%" 

                                />
                                <StatCard 
                                    title="평균 예매율" 
                                    value={formatRate(reservationStats.averageRate)} 
                                    unit="%" 

                                />
                                <StatCard 
                                    title="최고 예매율" 
                                    value={formatRate(reservationStats.topRate)} 
                                    unit="%" 

                                />
                                <StatCard 
                                    title="최저 예매율" 
                                    value={formatRate(reservationStats.bottomRate)} 
                                    unit="%" 

                                />
                            </>
                        )}
                    </div>

                    
                    {/* 두 번째 행: 일별 예매율 트렌드 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">일별 예매율 트렌드</h2>
                        <div className="h-64">
                            {loadingDailyTrend ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    로딩 중...
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dailyTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="#6b7280" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
                                        />
                                        <YAxis 
                                            stroke="#6b7280" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false}
                                            domain={[0, 100]}
                                            ticks={[0, 25, 50, 75, 100]}
                                        />
                                        <Tooltip 
                                            formatter={(value) => [`${value}%`, '예매율']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="rate" 
                                            stroke="#3B82F6" 
                                            strokeWidth={3}
                                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* 분석 인사이트 */}
                    <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 예매율 분석 인사이트</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <p className="font-medium mb-2">🎯 주요 발견사항:</p>
                                <ul className="space-y-1">
                                    <li>• 공연 카테고리가 가장 높은 예매율 (92%)</li>
                                    <li>• 오후 2-3시대에 예매율이 최고점 (95%)</li>
                                    <li>• 주말을 전후로 예매율이 급상승하는 경향</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium mb-2">💡 개선 제안:</p>
                                <ul className="space-y-1">
                                    <li>• 강연/세미나 카테고리 마케팅 강화</li>
                                    <li>• 오전 시간대 할인 혜택 제공</li>
                                    <li>• 주말 예매율 활용한 프로모션</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
