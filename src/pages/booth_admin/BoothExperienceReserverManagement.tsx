import React, { useState, useEffect } from 'react';
import { TopNav } from "../../components/TopNav";
import { BoothAdminSideNav } from "../../components/BoothAdminSideNav";
import { Search, Calendar, Clock, Phone, User, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

interface Reservation {
    id: number;
    experienceId: number;
    experienceTitle: string;
    experienceDate: string;
    startTime: string;
    endTime: string;
    participantName: string;
    participantPhone: string;
    status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    statusText: string;
    reservedAt: string;
    queuePosition?: number;
}

const BoothExperienceReserverManagement: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    // 필터 상태
    const [searchName, setSearchName] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchStatus, setSearchStatus] = useState<string>('');

    useEffect(() => {
        loadReservations();
    }, []);

    useEffect(() => {
        filterReservations();
    }, [reservations, searchName, searchDate, searchStatus]);

    const loadReservations = async () => {
        try {
            setLoading(true);
            // 실제 API 호출로 대체 필요
            // const data = await getReservationsForBooth(boothId);

            // 임시 더미 데이터
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            const dummyReservations: Reservation[] = [
                // 체험중인 사람들
                { id: 1, experienceId: 1, experienceTitle: '더미 체험 A', experienceDate: dateStr, startTime: '10:00', endTime: '11:00', participantName: '김철수', participantPhone: '010-1234-5678', status: 'IN_PROGRESS', statusText: '체험중', reservedAt: '2024-01-15 09:30:00' },
                { id: 2, experienceId: 1, experienceTitle: '더미 체험 A', experienceDate: dateStr, startTime: '10:00', endTime: '11:00', participantName: '이영희', participantPhone: '010-2345-6789', status: 'IN_PROGRESS', statusText: '체험중', reservedAt: '2024-01-15 09:35:00' },
                { id: 3, experienceId: 1, experienceTitle: '더미 체험 A', experienceDate: dateStr, startTime: '10:00', endTime: '11:00', participantName: '박민수', participantPhone: '010-3456-7890', status: 'IN_PROGRESS', statusText: '체험중', reservedAt: '2024-01-15 09:40:00' },

                // 대기중인 사람들
                { id: 4, experienceId: 1, experienceTitle: '더미 체험 A', experienceDate: dateStr, startTime: '10:00', endTime: '11:00', participantName: '정수진', participantPhone: '010-4567-8901', status: 'WAITING', statusText: '대기중', reservedAt: '2024-01-15 10:00:00', queuePosition: 1 },
                { id: 5, experienceId: 1, experienceTitle: '더미 체험 A', experienceDate: dateStr, startTime: '10:00', endTime: '11:00', participantName: '최지영', participantPhone: '010-5678-9012', status: 'WAITING', statusText: '대기중', reservedAt: '2024-01-15 10:05:00', queuePosition: 2 },
                { id: 6, experienceId: 2, experienceTitle: '더미 체험 B', experienceDate: dateStr, startTime: '14:00', endTime: '15:30', participantName: '강동원', participantPhone: '010-6789-0123', status: 'WAITING', statusText: '대기중', reservedAt: '2024-01-15 10:10:00', queuePosition: 1 },
                { id: 7, experienceId: 2, experienceTitle: '더미 체험 B', experienceDate: dateStr, startTime: '14:00', endTime: '15:30', participantName: '윤서연', participantPhone: '010-7890-1234', status: 'WAITING', statusText: '대기중', reservedAt: '2024-01-15 10:15:00', queuePosition: 2 },

                // 종료된 사람들
                { id: 8, experienceId: 1, experienceTitle: '더미 체험 A', experienceDate: dateStr, startTime: '10:00', endTime: '11:00', participantName: '임태현', participantPhone: '010-8901-2345', status: 'COMPLETED', statusText: '종료', reservedAt: '2024-01-15 08:00:00' },
                { id: 9, experienceId: 1, experienceTitle: '더미 체험 A', experienceDate: dateStr, startTime: '10:00', endTime: '11:00', participantName: '한소희', participantPhone: '010-9012-3456', status: 'COMPLETED', statusText: '종료', reservedAt: '2024-01-15 08:15:00' },
                { id: 10, experienceId: 2, experienceTitle: '더미 체험 B', experienceDate: dateStr, startTime: '14:00', endTime: '15:30', participantName: '송민호', participantPhone: '010-0123-4567', status: 'COMPLETED', statusText: '종료', reservedAt: '2024-01-15 08:30:00' },

                // 취소한 사람들
                { id: 11, experienceId: 1, experienceTitle: '더미 체험 A', experienceDate: dateStr, startTime: '10:00', endTime: '11:00', participantName: '배수지', participantPhone: '010-1234-5678', status: 'CANCELLED', statusText: '취소', reservedAt: '2024-01-15 07:00:00' },
                { id: 12, experienceId: 2, experienceTitle: '더미 체험 B', experienceDate: dateStr, startTime: '14:00', endTime: '15:30', participantName: '조현우', participantPhone: '010-2345-6789', status: 'CANCELLED', statusText: '취소', reservedAt: '2024-01-15 07:15:00' }
            ];

            setReservations(dummyReservations);
        } catch (error) {
            console.error('예약자 목록 로딩 실패:', error);
            toast.error('예약자 목록을 불러오는데 실패했습니다.');
            setReservations([]);
        } finally {
            setLoading(false);
        }
    };

    const filterReservations = () => {
        let filtered = [...reservations];

        // 참가자명 검색
        if (searchName.trim()) {
            filtered = filtered.filter(res =>
                res.participantName.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        // 체험일 검색
        if (searchDate) {
            filtered = filtered.filter(res => res.experienceDate === searchDate);
        }

        // 상태별 필터링
        if (searchStatus) {
            filtered = filtered.filter(res => res.status === searchStatus);
        }

        // 예약일시 기준 내림차순 정렬 (최신순)
        filtered.sort((a, b) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime());

        setFilteredReservations(filtered);
    };

    const handleCancelReservation = async (reservationId: number) => {
        if (!confirm('정말로 이 예약을 취소하시겠습니까?')) {
            return;
        }

        try {
            // 실제 API 호출로 대체 필요
            // await cancelReservation(reservationId);

            // 임시로 상태만 변경
            setReservations(prev =>
                prev.map(res =>
                    res.id === reservationId
                        ? { ...res, status: 'CANCELLED', statusText: '취소' }
                        : res
                )
            );

            toast.success('예약이 취소되었습니다.');
        } catch (error) {
            console.error('예약 취소 실패:', error);
            toast.error('예약 취소에 실패했습니다.');
        }
    };

    const resetFilters = () => {
        setSearchName('');
        setSearchDate('');
        setSearchStatus('');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
            case 'WAITING': return 'bg-yellow-100 text-yellow-800';
            case 'COMPLETED': return 'bg-gray-100 text-gray-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return '🟢';
            case 'WAITING': return '🟡';
            case 'COMPLETED': return '⚪';
            case 'CANCELLED': return '🔴';
            default: return '⚪';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    예약 현황
                </div>

                {/* 사이드바 */}
                <BoothAdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 헤더 */}
                    <div className="mb-6">
                        <p className="text-gray-600">체험 예약자들의 현황을 관리하세요</p>
                    </div>

                    {/* 필터 및 검색 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex flex-wrap items-end gap-4 mb-4">
                            {/* 참가자명 검색 */}
                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-1">
                                    참가자명
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="searchName"
                                        className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="참가자명으로 검색"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                </div>
                            </div>

                            {/* 체험일 검색 */}
                            <div className="flex-1 min-w-[180px]">
                                <label htmlFor="searchDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    체험일
                                </label>
                                <input
                                    type="date"
                                    id="searchDate"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                />
                            </div>

                            {/* 상태별 필터 */}
                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="searchStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                    상태
                                </label>
                                <select
                                    id="searchStatus"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={searchStatus}
                                    onChange={(e) => setSearchStatus(e.target.value)}
                                >
                                    <option value="">전체</option>
                                    <option value="WAITING">대기중</option>
                                    <option value="IN_PROGRESS">체험중</option>
                                    <option value="COMPLETED">종료</option>
                                    <option value="CANCELLED">취소</option>
                                </select>
                            </div>

                            {/* 검색 버튼 */}
                            <button
                                onClick={filterReservations}
                                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center h-[38px]"
                            >
                                <Search className="w-4 h-4 mr-2" /> 검색
                            </button>
                            {/* 초기화 버튼 */}
                            {(searchName || searchDate || searchStatus) && (
                                <button
                                    onClick={resetFilters}
                                    className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md transition-colors flex items-center justify-center h-[38px]"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" /> 초기화
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 예약자 목록 테이블 */}
                    {filteredReservations.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-semibold">예약자가 없습니다.</p>
                            <p className="text-sm mt-2">예약 현황이 여기에 표시됩니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            상태
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            체험 정보
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            참가자 정보
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            예약일시
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            대기순서
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            작업
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReservations.map((reservation) => (
                                        <tr key={reservation.id} className="hover:bg-gray-50">
                                            {/* 상태 */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="mr-2">{getStatusIcon(reservation.status)}</span>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                                                        {reservation.statusText}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 체험 정보 */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm text-gray-900">
                                                    <div className="font-medium mb-1">{reservation.experienceTitle}</div>
                                                    <div className="flex items-center justify-center mb-1">
                                                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                        <span>{new Date(reservation.experienceDate).toLocaleDateString('ko-KR')}</span>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                        <span>{reservation.startTime} - {reservation.endTime}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 참가자 정보 */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <User className="w-4 h-4 mr-1 text-gray-400" />
                                                        <span className="font-medium">{reservation.participantName}</span>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <Phone className="w-4 h-4 mr-1 text-gray-400" />
                                                        <span>{reservation.participantPhone}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 예약일시 */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm text-gray-900">
                                                    <div>{new Date(reservation.reservedAt).toLocaleDateString('ko-KR')}</div>
                                                    <div className="text-xs text-gray-500">{new Date(reservation.reservedAt).toLocaleTimeString('ko-KR')}</div>
                                                </div>
                                            </td>

                                            {/* 대기순서 */}
                                            <td className="px-6 py-4 text-center">
                                                {reservation.status === 'WAITING' && reservation.queuePosition ? (
                                                    <span className="text-sm font-medium text-yellow-600">
                                                        {reservation.queuePosition}번
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>

                                            {/* 작업 */}
                                            <td className="px-6 py-4 text-center">
                                                {(reservation.status === 'IN_PROGRESS' || reservation.status === 'WAITING') && (
                                                    <button
                                                        onClick={() => handleCancelReservation(reservation.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 flex items-center justify-center"
                                                        title="노쇼 처리 - 예약 취소"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        <span className="text-xs">취소</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoothExperienceReserverManagement;
