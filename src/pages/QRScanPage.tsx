import React, { useState, useRef, useEffect } from 'react';
import jsQR from "jsqr";
import { TopNav } from '../components/TopNav';
import { HostSideNav } from '../components/HostSideNav';
import { HiCamera, HiSearch } from 'react-icons/hi';
import {
    checkInManual,
    checkInQr,
    checkOutManual,
    checkOutQr
} from "../services/qrTicket";
import type {
    ManualCheckRequestDto,
    QrCheckRequestDto,
} from "../services/types/qrTicketType"

const QRScanPage: React.FC = () => {
    const [checkType, setCheckType] = useState("checkIn");
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [scanResult, setScanResult] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // 카메라 시작
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

    // 수동 코드 검색
    const handleManualSearch = async (input: string) => {
        if (!input.trim()) {
            alert('수동 코드를 입력해주세요.');
            return;
        }

        // QR 코드 형식 검증 (AB12-C3F4 형식)
        const codePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (!codePattern.test(manualCode.trim())) {
            alert('올바른 코드 형식을 입력해주세요. (예: AB12-C3F4)');
            return;
        }

        const manualCheckRequestDto: ManualCheckRequestDto = {
            manualCode: input
        }
        
        const res = checkType.match('checkIn') ? await checkInManual(manualCheckRequestDto)
            : await checkOutManual(manualCheckRequestDto);

        setScanResult(res.message);
    };

    // QR 코드 스캔 처리 (실제 구현에서는 QR 코드 라이브러리 사용)
    const handleQRScan = async () => {
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


        if (qrCode) {
            console.log("QR 코드 내용:", qrCode.data);

            const qrCheckRequestDto: QrCheckRequestDto = {
                qrCode: qrCode.data
            }

            const res = checkType.match('checkIn') ? await checkInQr(qrCheckRequestDto)
                : await checkOutQr(qrCheckRequestDto);
            
            setScanResult(res.message);
        } else {
            alert("QR 코드를 인식하지 못했습니다.");
        }
    };

    // 컴포넌트 언마운트 시 카메라 정리
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 + 체크인/체크아웃 타입 */}
                <div className="top-[137px] left-64 absolute flex items-center  gap-6">
                    <span className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        QR 체크인
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCheckType("checkIn")}
                            className={`px-4 py-2 rounded-[10px] font-medium text-sm hover:bg-blue-600 hover:text-white
                                ${checkType === "checkIn" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}
                            `}
                        >
                            체크인
                        </button>
                        <button
                            onClick={() => setCheckType("checkOut")}
                            className={`px-4 py-2 rounded-[10px] font-medium text-sm 
                                hover:text-white hover:bg-red-600 hover:border-red-600 
                                active:border-red-600 focus:border-red-600 focus:outline-none
                                ${checkType === "checkOut" ? "bg-red-500 text-white bg-red-500" : "bg-gray-200 text-gray-700"}
                            `}
                        >
                            체크아웃
                        </button>
                    </div>

                </div>
                

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

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
                                                onClick={handleQRScan}
                                            />
                                            {/* 스캔 가이드 오버레이 */}
                                            <div className="absolute inset-0 border-2 border-blue-500 border-dashed pointer-events-none"></div>
                                        </div>
                                        <div className="text-center text-sm text-gray-600">
                                            QR 코드를 클릭하여 스캔하세요
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <HiCamera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-4">카메라를 활성화하여 QR 코드를 스캔하세요</p>
                                    </div>
                                )}
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
                                {/* 디버깅 정보 */}
                                <div className="mt-2 text-xs text-gray-500">
                                    카메라 상태: {isCameraActive ? '활성화됨' : '비활성화'}
                                    {isCameraActive && streamRef.current && (
                                        <span className="ml-2">• 스트림 연결됨</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 수동 코드 입력 섹션 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                수동 코드 입력
                            </h3>

                            {/* 입력 필드와 검색 버튼 */}
                            <div className="flex gap-3 mb-6">
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    placeholder="수동 코드를 입력하세요"
                                    className="flex-1 h-10 border-2 border-gray-300 rounded-[10px] px-3 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all hover:border-gray-400"
                                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch(manualCode)}
                                />
                                <button
                                    onClick={() => handleManualSearch(manualCode)}
                                    className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
                                >
                                    <HiSearch className="w-4 h-4" />
                                    검색
                                </button>
                            </div>

                            {/* 도움말 영역 */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-3">
                                    검색 도움말
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                        수동 코드: AB12-C3F4 형식
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                        대문자와 숫자만 사용 가능
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                        하이픈(-)으로 구분
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 스캔 결과 표시 */}
                    {scanResult && (
                        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                            <h4 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-4">
                                스캔 결과
                            </h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-blue-800 font-medium">{scanResult}</p>
                            </div>
                            <div className="text-center">
                                <button
                                    onClick={() => setScanResult(null)}
                                    className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-gray-500 text-white hover:bg-gray-600"
                                >
                                    결과 지우기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRScanPage;
