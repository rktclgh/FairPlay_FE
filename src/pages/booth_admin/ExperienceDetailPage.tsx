import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Calendar, MapPin, XCircle } from 'lucide-react';
import { TopNav } from "../../components/TopNav";
import { BoothAdminSideNav } from "../../components/BoothAdminSideNav";
import { toast } from 'react-toastify';
import type { BoothExperience } from '../../services/types/boothExperienceType';

// 예약자 타입 정의
interface Reservation {
    id: number;
    name: string;
    phone: string;
    status: 'IN_PROGRESS' | 'WAITING' | 'COMPLETED' | 'CANCELLED';
    statusText: string;
    reservedAt: string;
    queuePosition?: number;
}

const ExperienceDetailPage: React.FC = () => {
    const { experienceId } = useParams<{ experienceId: string }>();
    const navigate = useNavigate();
    const [experience, setExperience] = useState<BoothExperience | null>(null);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExperienceDetail();
        loadReservations();
    }, [experienceId]);

    const loadExperienceDetail = async () => {
        try {
            // 실제 API 호출로 대체 필요
            // const data = await getExperienceDetail(parseInt(experienceId!));

            // 임시 더미 데이터
            const dummyExperience: BoothExperience = {
                experienceId: parseInt(experienceId!),
                boothId: 1,
                eventId: 1,
                boothName: '더미 부스 A',
                eventName: '더미 이벤트',
                title: `더미 체험 ${experienceId}`,
                description: '샘플 설명입니다. 실제 데이터가 오면 대체됩니다.',
                experienceDate: new Date().toISOString().split('T')[0],
                startTime: '10:00:00',
                endTime: '11:00:00',
                durationMinutes: 30,
                maxCapacity: 10,
                currentParticipants: 3,
                waitingCount: 2,
                allowWaiting: true,
                maxWaitingCount: 10,
                allowDuplicateReservation: false,
                isReservationEnabled: true,
                isReservationAvailable: true,
                congestionRate: 0.3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            setExperience(dummyExperience);
        } catch (error) {
            console.error('체험 정보 로딩 실패:', error);
            toast.error('체험 정보를 불러오는데 실패했습니다.');
        }
    };

    const loadReservations = async () => {
        try {
            // 실제 API 호출로 대체 필요
            // const data = await getReservationsForExperience(parseInt(experienceId!));

            // 임시 더미 데이터
            const dummyReservations: Reservation[] = [
                // 체험중인 사람들
                { id: 1, name: '김철수', phone: '010-1234-5678', status: 'IN_PROGRESS', statusText: '체험중', reservedAt: '2024-01-15 09:30:00' },
                { id: 2, name: '이영희', phone: '010-2345-6789', status: 'IN_PROGRESS', statusText: '체험중', reservedAt: '2024-01-15 09:35:00' },
                { id: 3, name: '박민수', phone: '010-3456-7890', status: 'IN_PROGRESS', statusText: '체험중', reservedAt: '2024-01-15 09:40:00' },
                { id: 4, name: '정수진', phone: '010-4567-8901', status: 'IN_PROGRESS', statusText: '체험중', reservedAt: '2024-01-15 09:45:00' },

                // 대기중인 사람들
                { id: 5, name: '최지영', phone: '010-5678-9012', status: 'WAITING', statusText: '대기중', reservedAt: '2024-01-15 10:00:00', queuePosition: 1 },
                { id: 6, name: '강동원', phone: '010-6789-0123', status: 'WAITING', statusText: '대기중', reservedAt: '2024-01-15 10:05:00', queuePosition: 2 },
                { id: 7, name: '윤서연', phone: '010-7890-1234', status: 'WAITING', statusText: '대기중', reservedAt: '2024-01-15 10:10:00', queuePosition: 3 },
                { id: 8, name: '임태현', phone: '010-8901-2345', status: 'WAITING', statusText: '대기중', reservedAt: '2024-01-15 10:15:00', queuePosition: 4 },

                // 종료된 사람들
                { id: 9, name: '한소희', phone: '010-9012-3456', status: 'COMPLETED', statusText: '종료', reservedAt: '2024-01-15 08:00:00' },
                { id: 10, name: '송민호', phone: '010-0123-4567', status: 'COMPLETED', statusText: '종료', reservedAt: '2024-01-15 08:15:00' },
                { id: 11, name: '배수지', phone: '010-1234-5678', status: 'COMPLETED', statusText: '종료', reservedAt: '2024-01-15 08:30:00' },
                { id: 12, name: '조현우', phone: '010-2345-6789', status: 'COMPLETED', statusText: '종료', reservedAt: '2024-01-15 08:45:00' },

                // 취소한 사람들
                { id: 13, name: '오승철', phone: '010-3456-7890', status: 'CANCELLED', statusText: '취소', reservedAt: '2024-01-15 07:00:00' },
                { id: 14, name: '신민아', phone: '010-4567-8901', status: 'CANCELLED', statusText: '취소', reservedAt: '2024-01-15 07:15:00' },
                { id: 15, name: '류준열', phone: '010-5678-9012', status: 'CANCELLED', statusText: '취소', reservedAt: '2024-01-15 07:30:00' }
            ];

            setReservations(dummyReservations);
        } catch (error) {
            console.error('예약자 목록 로딩 실패:', error);
            toast.error('예약자 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
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

    if (!experience) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">체험을 찾을 수 없습니다</h2>
                    <button
                        onClick={() => navigate('/booth-admin/experience-management')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    체험 상세보기
                </div>

                {/* 사이드바 */}
                <BoothAdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 뒤로가기 버튼 */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/booth-admin/experience-management')}
                            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            체험 목록으로 돌아가기
                        </button>
                    </div>

                    {/* 간략한 체험 정보 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">{experience.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{experience.boothName}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{new Date(experience.experienceDate).toLocaleDateString('ko-KR')}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{experience.startTime} - {experience.endTime}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Users className="w-4 h-4 mr-2" />
                                <span>정원: {experience.maxCapacity}명</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-gray-700">{experience.description}</p>
                        </div>
                    </div>

                    {/* 예약자 목록 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">예약자 현황</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                체험중: {reservations.filter(r => r.status === 'IN_PROGRESS').length}명 |
                                대기중: {reservations.filter(r => r.status === 'WAITING').length}명 |
                                종료: {reservations.filter(r => r.status === 'COMPLETED').length}명 |
                                취소: {reservations.filter(r => r.status === 'CANCELLED').length}명
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            상태
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            예약자 정보
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
                                    {reservations.map((reservation) => (
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

                                            {/* 예약자 정보 */}
                                            <td className="px-6 py-4 text-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{reservation.name}</div>
                                                    <div className="text-sm text-gray-600">{reservation.phone}</div>
                                                </div>
                                            </td>

                                            {/* 예약일시 */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(reservation.reservedAt).toLocaleDateString('ko-KR')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(reservation.reservedAt).toLocaleTimeString('ko-KR')}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperienceDetailPage;
