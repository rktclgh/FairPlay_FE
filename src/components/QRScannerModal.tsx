import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (result: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps): JSX.Element | null {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string>('');
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

    useEffect(() => {
        if (isOpen) {
            startScanning();
        } else {
            stopScanning();
        }

        return () => {
            stopScanning();
        };
    }, [isOpen]);

    const startScanning = async () => {
        try {
            setError('');
            setIsScanning(true);

            // 카메라 권한 확인
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // 후면 카메라 우선
            });
            setHasPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // QR 리더 초기화
            if (!codeReaderRef.current) {
                codeReaderRef.current = new BrowserMultiFormatReader();
            }

            // QR 코드 스캔 시작
            codeReaderRef.current.decodeFromVideoDevice(undefined, videoRef.current!, (result, error) => {
                if (result) {
                    const scannedText = result.getText();
                    console.log('QR 스캔 결과:', scannedText);
                    onScanSuccess(scannedText);
                    stopScanning();
                    onClose();
                }
                if (error && !(error.name === 'NotFoundException')) {
                    console.error('QR 스캔 에러:', error);
                }
            });

        } catch (err: any) {
            console.error('카메라 접근 실패:', err);
            setHasPermission(false);
            setError('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        setIsScanning(false);

        // 비디오 스트림 정지
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }

        // QR 리더 정지
        if (codeReaderRef.current) {
            codeReaderRef.current.reset();
        }
    };

    const handleRetry = () => {
        setError('');
        setHasPermission(null);
        startScanning();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            {/* 배경 오버레이 */}
            <div
                className="absolute inset-0 bg-black bg-opacity-75"
                onClick={onClose}
            />

            {/* 모달 컨테이너 */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">QR 코드 스캔</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 컨텐츠 */}
                <div className="p-4">
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                            <button
                                onClick={handleRetry}
                                className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {/* 비디오 영역 */}
                    <div className="relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                        />

                        {/* 스캔 오버레이 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-48 border-2 border-white rounded-lg">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                            </div>
                        </div>

                        {/* 스캐닝 상태 표시 */}
                        {isScanning && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                QR 코드를 화면에 맞춰주세요
                            </div>
                        )}
                    </div>

                    {/* 안내 메시지 */}
                    <div className="mt-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Camera className="w-5 h-5 text-gray-500 mr-2" />
                            <p className="text-sm text-gray-600">
                                전자명함 QR 코드를 스캔해보세요
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">
                            QR 코드가 중앙의 사각형 안에 들어오도록 조정해주세요
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}