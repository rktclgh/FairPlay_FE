import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Share2, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrUrl: string;
    title?: string;
}

export function QRCodeModal({ isOpen, onClose, qrUrl, title = "전자명함 QR 코드" }: QRCodeModalProps): JSX.Element | null {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen && qrUrl && canvasRef.current) {
            generateQRCode();
        }
    }, [isOpen, qrUrl]);

    const generateQRCode = async () => {
        if (!canvasRef.current || !qrUrl) return;

        try {
            setIsGenerating(true);
            await QRCode.toCanvas(canvasRef.current, qrUrl, {
                width: 280,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        } catch (error) {
            console.error('QR 코드 생성 실패:', error);
            toast.error('QR 코드 생성에 실패했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(qrUrl);
            setCopied(true);
            toast.success('링크가 클립보드에 복사되었습니다.');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
            toast.error('링크 복사에 실패했습니다.');
        }
    };

    const handleDownload = () => {
        if (!canvasRef.current) return;

        try {
            const canvas = canvasRef.current;
            const link = document.createElement('a');
            link.download = 'business-card-qr.png';
            link.href = canvas.toDataURL();
            link.click();
            toast.success('QR 코드가 다운로드되었습니다.');
        } catch (error) {
            console.error('다운로드 실패:', error);
            toast.error('다운로드에 실패했습니다.');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: '전자명함을 확인하세요',
                    url: qrUrl,
                });
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('공유 실패:', error);
                    handleCopyUrl(); // 공유 실패 시 클립보드 복사로 대체
                }
            }
        } else {
            handleCopyUrl(); // Web Share API 미지원 시 클립보드 복사
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            {/* 배경 오버레이 */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* 모달 컨테이너 */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 컨텐츠 */}
                <div className="p-6">
                    {/* QR 코드 */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white rounded-lg border-2 border-gray-100 shadow-sm">
                            {isGenerating ? (
                                <div className="w-[280px] h-[280px] flex items-center justify-center bg-gray-50 rounded">
                                    <div className="text-gray-500">QR 코드 생성 중...</div>
                                </div>
                            ) : (
                                <canvas
                                    ref={canvasRef}
                                    className="block"
                                />
                            )}
                        </div>
                    </div>

                    {/* 설명 */}
                    <div className="text-center mb-6">
                        <p className="text-gray-600 text-sm">
                            QR 코드를 스캔하여 전자명함을 확인하세요
                        </p>
                    </div>

                    {/* URL 표시 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            공유 링크
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={qrUrl}
                                readOnly
                                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md"
                            />
                            <button
                                onClick={handleCopyUrl}
                                className={`px-3 py-2 rounded-md transition-colors ${copied
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {copied ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            다운로드
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={isGenerating}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            공유
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}