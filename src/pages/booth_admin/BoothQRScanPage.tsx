import React, { useState, useRef, useEffect } from 'react';
import { TopNav } from "../../components/TopNav";
import { BoothAdminSideNav } from "../../components/BoothAdminSideNav";
import { QrCode, Camera, X, CheckCircle, AlertCircle, Users, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';
import type { BoothEntryRequestDto } from "../../services/types/qrTicketType";
import type { BoothExperience } from "../../services/types/boothExperienceType";
import type { BoothDetailResponse } from '../../types/booth';
import { checkBoothQr } from "../../services/qrTicket";
import { getBoothExperiences } from "../../services/boothExperienceService";
import {getBoothDetails} from "../../api/boothApi";
import { useLocation } from 'react-router-dom';

interface ScannedTicket {
    participantName: string;
    experienceTitle: string;
    experienceDate: string;
    startTime: string;
    endTime: string;
    status: 'VALID' | 'INVALID' | 'ALREADY_USED';
    scannedAt: Date;
}

interface Experience {
    id: number;
    title: string;
    date: string;
    time: string;
    maxCapacity: number;
    currentParticipants: number;
}


const BoothQRScanPage: React.FC = () => {
    const location = useLocation();
    const { eventId, boothId } = location.state;
    const [isScanning, setIsScanning] = useState(false);
    const [scannedTickets, setScannedTickets] = useState<ScannedTicket[]>([]);
    const [currentTicket, setCurrentTicket] = useState<ScannedTicket | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [experiences, setExperiences] = useState<BoothExperience[] | null>(null);
    const [selectedExperience, setSelectedExperience] = useState<BoothExperience | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const fetchExperiences = async () =>  {
            const res = await getBoothExperiences(boothId);
            setExperiences(res);
        };
        fetchExperiences();
    },[])

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startScanning = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
                audio: false,
            });

            // 먼저 스트림을 저장하고, 비디오가 렌더되도록 상태를 변경
            streamRef.current = stream;
            setIsScanning(true);
        } catch (error) {
            console.error('카메라 접근 실패:', error);
            toast.error('카메라에 접근할 수 없습니다.');
        }
    };

    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            try {
                videoRef.current.srcObject = null;
            } catch { }
        }
        setIsScanning(false);
    };

    // 비디오 엘리먼트가 렌더된 뒤 스트림을 연결하고 재생 및 스캔 시작
    useEffect(() => {
        const video = videoRef.current;
        const stream = streamRef.current;
        if (!isScanning || !video || !stream) return;

        try {
            video.srcObject = stream;
            const playPromise = video.play?.();
            if (playPromise) {
                playPromise.catch(() => {
                    /* autoplay가 막혀도 사용자 제스처 버튼으로 시작되므로 무시 */
                });
            }
        } catch (err) {
            console.error('비디오 소스 연결 실패:', err);
        }

        // 비디오 연결 후 스캔 루프 시작
        scanQRCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScanning]);

    const scanQRCode = () => {
        if (!isScanning || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        const scanFrame = () => {
            if (!isScanning) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                handleQRCodeScanned(code.data);
                return;
            }

            requestAnimationFrame(scanFrame);
        };

        scanFrame();
    };

    const handleQRCodeScanned = async (qrCode: string) => {
        try {

            if (!selectedExperience) {
                toast.error('체험을 선택해주세요.');
                return;
            }

            // 부스 QR 스캔 위한 dto 생성
            const boothEntryRequestDto: BoothEntryRequestDto = {
                boothExperienceId: selectedExperience.experienceId,
                boothId: boothId,
                eventId: eventId,
                qrCode: qrCode
            };

            // 부스 QR 스캔 API호출
            const res = await checkBoothQr(boothEntryRequestDto);
            
            // 스캔 결과에 따라 스캔된 티켓 정보 생성
            const scannedTicket: ScannedTicket = {
                participantName: res.name|| '김참가자',
                experienceTitle: selectedExperience.title || '더미 체험 A',
                experienceDate: selectedExperience.experienceDate || '2024-01-15',
                startTime: selectedExperience.startTime || '10:00',
                endTime: selectedExperience.endTime || '11:00',
                status: 'VALID',
                scannedAt: res.checkInTime
            };
            setCurrentTicket(scannedTicket);
            setShowResult(true);
            stopScanning();

            // 스캔된 티켓을 목록에 추가
            setScannedTickets(prev => [scannedTicket, ...prev]);

            toast.success('QR 코드가 성공적으로 스캔되었습니다!');
        } catch (error) {
            console.error('QR 코드 파싱 실패:', error);
            toast.error('유효하지 않은 QR 코드입니다.');
        }
    };

    const handleConfirmTicket = () => {
        if (currentTicket) {
            // 티켓 상태를 '사용됨'으로 변경
            setScannedTickets(prev =>
                prev.map(ticket =>
                    ticket.id === currentTicket.id
                        ? { ...ticket, status: 'ALREADY_USED' }
                        : ticket
                )
            );
            setShowResult(false);
            setCurrentTicket(null);
            toast.success('티켓이 확인되었습니다.');
        }
    };

    const handleRejectTicket = () => {
        if (currentTicket) {
            // 티켓 상태를 '무효'로 변경
            setScannedTickets(prev =>
                prev.map(ticket =>
                    ticket.id === currentTicket.id
                        ? { ...ticket, status: 'INVALID' }
                        : ticket
                )
            );
            setShowResult(false);
            setCurrentTicket(null);
            toast.error('티켓이 거부되었습니다.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VALID': return 'text-green-600';
            case 'INVALID': return 'text-red-600';
            case 'ALREADY_USED': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'VALID': return '유효';
            case 'INVALID': return '무효';
            case 'ALREADY_USED': return '사용됨';
            default: return '알 수 없음';
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    QR 스캔
                </div>

                {/* 사이드바 */}
                <BoothAdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* QR 코드 스캔 섹션 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                QR 코드 스캔
                            </h3>

                            {/* 스캔 영역 */}
                            <div className="bg-gray-50 border-2 border-gray-200 rounded-[10px] p-8 mb-6 flex flex-col items-center justify-center min-h-[300px]">
                                {isScanning ? (
                                    <div className="w-full flex flex-col items-center">
                                        <div className="relative w-full max-w-md h-64 bg-black rounded-lg overflow-hidden mb-4">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                            />
                                            {/* 스캔 가이드 오버레이 */}
                                            <div className="absolute inset-0 border-2 border-blue-500 border-dashed pointer-events-none"></div>
                                        </div>
                                        <div className="text-center text-sm text-gray-600">
                                            QR 코드를 인식하고 있습니다
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-4">참가자의 QR 티켓을 스캔하세요</p>
                                    </div>
                                )}
                            </div>

                            <div className="font-bold text-center text-sm text-gray-600 mb-4">
                                QR 코드가 가까이 있으면 인식이 어려울 수 있습니다. <br />
                                카메라에서 20~30cm 떨어져서 QR 코드를 보여주세요.
                            </div>

                            {/* 카메라 제어 버튼 */}
                            <div className="text-center">
                                {isScanning ? (
                                    <button
                                        onClick={stopScanning}
                                        className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-red-500 text-white hover:bg-red-600"
                                    >
                                        카메라 중지
                                    </button>
                                ) : (
                                    <button
                                        onClick={startScanning}
                                        className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-blue-500 text-white hover:bg-blue-600"
                                    >
                                        카메라 시작
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 부스 정보 및 체험리스트 */}
                        <div className="space-y-6">
                            {/* 부스 정보 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-4">
                                    부스 정보
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">부스명</span>
                                        <span className="text-gray-900">더미 부스 A</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">이벤트명</span>
                                        <span className="text-gray-900">더미 이벤트</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">위치</span>
                                        <span className="text-gray-900">A구역 1번</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">운영시간</span>
                                        <span className="text-gray-900">09:00 - 18:00</span>
                                    </div>
                                </div>
                            </div>

                            {/* 체험리스트 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-4">
                                    체험리스트
                                </h3>
                                <div className="space-y-3">
                                    {experiences?.map((experience) => (
                                        <div key={experience.experienceId} className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer
                                            ${experience.experienceId === selectedExperience?.experienceId ? 'border-blue-500' : 'border-gray-200'}`}
                                            onClick={() => setSelectedExperience(experience)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{experience.title}</h4>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${experience.currentParticipants >= experience.maxCapacity
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {experience.currentParticipants >= experience.maxCapacity ? '마감' : '진행중'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    <span>{experience.experienceDate}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    <span>{experience.startTime}</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">참가자 현황</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {experience.currentParticipants}/{experience.maxCapacity}명
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${(experience.currentParticipants / experience.maxCapacity) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 스캔된 티켓 목록 */}
                    {scannedTickets.length > 0 && (
                        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">스캔된 티켓 목록</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                스캔 시간
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                참가자
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                체험 정보
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                상태
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {scannedTickets.map((ticket, index) => (
                                            <tr key={index+1} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                                    {ticket.scannedAt.toLocaleTimeString('ko-KR')}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                                                    {ticket.participantName}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                                    <div>{ticket.experienceTitle}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {ticket.experienceDate} {ticket.startTime}-{ticket.endTime}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                        {getStatusText(ticket.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 스캔 결과 모달 */}
            {showResult && currentTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">QR 티켓 스캔 완료</h3>

                            <div className="text-left space-y-3 mb-6">
                                <div>
                                    <span className="font-medium">참가자:</span> {currentTicket.participantName}
                                </div>
                                <div>
                                    <span className="font-medium">체험:</span> {currentTicket.experienceTitle}
                                </div>
                                <div>
                                    <span className="font-medium">일정:</span> {currentTicket.experienceDate} {currentTicket.startTime}-{currentTicket.endTime}
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleConfirmTicket}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    확인
                                </button>
                                <button
                                    onClick={handleRejectTicket}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    거부
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoothQRScanPage;
