import React, { useState } from 'react';
import { TopNav } from "../../components/TopNav";
import { BoothAdminSideNav } from "../../components/BoothAdminSideNav";
import { QrCode, Plus, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BoothAdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [boothInfo] = useState({
        boothName: '더미 부스 A',
        eventName: '더미 이벤트',
        totalExperiences: 2,
        totalReservations: 15,
        activeReservations: 8
    });

    const [recentExperiences] = useState([
        {
            id: 1,
            title: '더미 체험 A',
            date: '2024-01-15',
            time: '10:00 - 11:00',
            participants: 3,
            maxCapacity: 10
        },
        {
            id: 2,
            title: '더미 체험 B',
            date: '2024-01-15',
            time: '14:00 - 15:30',
            participants: 5,
            maxCapacity: 12
        }
    ]);

    const handleQRScan = () => {
        navigate('/booth-admin/qr-scan');
    };

    const handleExperienceManagement = () => {
        navigate('/booth-admin/experience-management');
    };

    const handleReservationManagement = () => {
        navigate('/booth-admin/experience-reserver-management');
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 현황
                </div>

                {/* 사이드바 */}
                <BoothAdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 헤더 */}
                    <div className="mb-6">
                        <p className="text-gray-600">부스 운영 현황을 한눈에 확인하세요</p>
                    </div>

                    {/* 부스 정보 요약 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">부스 정보</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-600">
                                <span className="font-medium mr-2">부스명:</span>
                                <span>{boothInfo.boothName}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <span className="font-medium mr-2">이벤트:</span>
                                <span>{boothInfo.eventName}</span>
                            </div>
                        </div>
                    </div>

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Plus className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">등록된 체험</p>
                                    <p className="text-2xl font-semibold text-gray-900">{boothInfo.totalExperiences}개</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">총 예약</p>
                                    <p className="text-2xl font-semibold text-gray-900">{boothInfo.totalReservations}명</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">활성 예약</p>
                                    <p className="text-2xl font-semibold text-gray-900">{boothInfo.activeReservations}명</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 최근 체험 목록 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">최근 체험 목록</h3>
                            <button
                                onClick={handleExperienceManagement}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                전체 보기 →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentExperiences.map((experience) => (
                                <div key={experience.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{experience.title}</h4>
                                        <p className="text-sm text-gray-600">{experience.date} {experience.time}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">
                                            참여자: {experience.participants}/{experience.maxCapacity}명
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 빠른 액션 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={handleQRScan}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <QrCode className="w-6 h-6 text-blue-600 mr-2" />
                                <span className="font-medium">QR 스캔</span>
                            </button>
                            <button
                                onClick={handleExperienceManagement}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Plus className="w-6 h-6 text-green-600 mr-2" />
                                <span className="font-medium">체험 관리</span>
                            </button>
                            <button
                                onClick={handleReservationManagement}
                                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Users className="w-6 h-6 text-purple-600 mr-2" />
                                <span className="font-medium">예약 현황</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoothAdminDashboard;
