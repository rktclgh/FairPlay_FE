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
import { getBoothDetails } from "../../api/boothApi";

interface ScannedTicket {
    qrCode: string;
    participantName: string;
    experienceTitle: string;
    experienceDate: string;
    startTime: string;
    endTime: string;
    status: 'VALID' | 'INVALID' | 'ALREADY_USED';
    scannedAt: Date;
}


const BoothQRScanPage: React.FC = () => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [scannedTickets, setScannedTickets] = useState<ScannedTicket[]>([]);
    const [currentTicket, setCurrentTicket] = useState<ScannedTicket | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [experiences, setExperiences] = useState<BoothExperience[] | null>(null);
    const [selectedExperience, setSelectedExperience] = useState<BoothExperience | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [booth, setBooth] = useState<BoothDetailResponse | null>();

        const startCamera = async () => {
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
            setIsCameraActive(true);
        } catch (error) {
            console.error('카메라를 시작할 수 없습니다:', error);
            alert('카메라 접근 권한이 필요합니다.');
        }
        };
    
    useEffect(() => {
        const fetchBooth = async () => {
            const res = await getBoothDetails(5, 12);
            setBooth(res);

        }
        const fetchExperiences = async () =>  {
            const res = await getBoothExperiences(5);
            setExperiences(res);
        };
        fetchBooth();
        fetchExperiences();
    },[])

    // 컴포넌트 언마운트 시 카메라 정리
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);



    // 카메라 중지
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    };


       // 비디오 엘리먼트가 렌더된 뒤 스트림을 연결
       useEffect(() => {
           const video = videoRef.current;
           const stream = streamRef.current;
   
           if (!isCameraActive || !video || !stream) {
               return;
           }
   
           try {
               (video as HTMLVideoElement).srcObject = stream;
               const playPromise = video.play();
               if (playPromise !== undefined) {
                   playPromise.catch((err) => {
                       console.error('비디오 재생 실패:', err);
                   });
               }
           } catch (err) {
               console.error('비디오 소스 연결 실패:', err);
           }
   
           video.onloadedmetadata = () => {
               console.log('비디오 메타데이터 로드 완료');
               console.log('비디오 크기:', video.videoWidth, 'x', video.videoHeight);
           };
   
           video.onplay = () => {
               console.log('비디오 재생 시작');
           };
   
           video.onerror = (e) => {
               console.error('비디오 에러:', e);
           };
       }, [isCameraActive]);


    const handleQRCodeScanned = async () => {
        try {

            // if (!selectedExperience) {
            //     toast.error('체험을 선택해주세요.');
            //     return;
            // }

            if (!videoRef.current) return;
        
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) return;

            // 현재 비디오 프레임 캡처
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, canvas.width, canvas.height);
            console.log(qrCode.data);
            if (qrCode) {
             
                // 부스 QR 스캔 위한 dto 생성
                const boothEntryRequestDto: BoothEntryRequestDto = {
                    boothExperienceId: 2,
                    boothId: 12,
                    eventId: 5,
                    qrCode: qrCode
                };

                // 부스 QR 스캔 API호출
                const res = await checkBoothQr(boothEntryRequestDto);
                
                // 스캔 결과에 따라 스캔된 티켓 정보 생성
                const scannedTicket: ScannedTicket = {
                    qrCode: qrCode.data,
                    participantName: res.name || '김참가자',
                    experienceTitle:  res.name,
                    experienceDate: selectedExperience?.experienceDate || '2024-01-15',
                    startTime: selectedExperience?.startTime || '10:00',
                    endTime: selectedExperience?.endTime || '11:00',
                    status: 'VALID',
                    scannedAt: new Date(res.checkInTime)
                };
                setCurrentTicket(scannedTicket);
                setShowResult(true);
                stopCamera();

                // 스캔된 티켓을 목록에 추가
                setScannedTickets(prev => [scannedTicket, ...prev]);

            }
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
                    ticket.qrCode === currentTicket.qrCode
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
                    ticket.qrCode === currentTicket.qrCode
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
                                {isCameraActive ? (
                                    <div className="w-full flex flex-col items-center">
                                        <div className="relative w-full max-w-md h-64 bg-black rounded-lg overflow-hidden mb-4">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                                onClick={handleQRCodeScanned}
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
                                {isCameraActive ? (
                                    <button
                                        onClick={stopCamera}
                                        className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-red-500 text-white hover:bg-red-600"
                                    >
                                        카메라 중지
                                    </button>
                                ) : (
                                    <button
                                        onClick={startCamera}
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
                                        <span className="text-gray-900">{ booth?.boothTitle}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">이벤트명</span>
                                        <span className="text-gray-900">{ booth?.boothTitle}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">위치</span>
                                        <span className="text-gray-900">{ booth?.location}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">운영시간</span>
                                        <span className="text-gray-900">{booth?.startDate} - { booth?.endDate}</span>
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
