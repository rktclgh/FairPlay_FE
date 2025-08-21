import React, { useState, useEffect } from 'react';
import { TopNav } from '../../components/TopNav';
import { AttendeeSideNav } from './AttendeeSideNav';
import { QRScannerModal } from '../../components/QRScannerModal';
import { toast } from 'react-toastify';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { Trash2, Edit3, User, Building, Phone, Mail, Globe, MapPin, Calendar, Search, QrCode, Plus } from 'lucide-react';
import businessCardService from '../../services/businessCardService';
import type { CollectedCard } from '../../types/businessCard';

export default function BusinessCardWallet(): JSX.Element {
    const [collectedCards, setCollectedCards] = useState<CollectedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingMemo, setEditingMemo] = useState<{ cardId: number; memo: string } | null>(null);
    const [qrScannerOpen, setQrScannerOpen] = useState(false);

    useEffect(() => {
        loadCollectedCards();
    }, []);

    const loadCollectedCards = async () => {
        try {
            setLoading(true);
            const cards = await businessCardService.getCollectedCards();
            setCollectedCards(cards);
        } catch (error) {
            console.error('명함 지갑 로드 실패:', error);
            toast.error('명함 지갑을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async (cardId: number, ownerName?: string) => {
        if (!window.confirm(`${ownerName || '이 명함'}을(를) 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await businessCardService.deleteCollectedCard(cardId);
            setCollectedCards(prev => prev.filter(card => card.id !== cardId));
            toast.success('명함이 삭제되었습니다.');
        } catch (error: any) {
            console.error('명함 삭제 실패:', error);
            const message = error.response?.data?.message || '명함 삭제 중 오류가 발생했습니다.';
            toast.error(message);
        }
    };

    const handleSaveMemo = async () => {
        if (!editingMemo) return;

        try {
            await businessCardService.updateCollectedCardMemo(editingMemo.cardId, {
                memo: editingMemo.memo
            });

            setCollectedCards(prev =>
                prev.map(card =>
                    card.id === editingMemo.cardId
                        ? { ...card, memo: editingMemo.memo }
                        : card
                )
            );
            
            setEditingMemo(null);
            toast.success('메모가 저장되었습니다.');
        } catch (error: any) {
            console.error('메모 저장 실패:', error);
            const message = error.response?.data?.message || '메모 저장 중 오류가 발생했습니다.';
            toast.error(message);
        }
    };

    const handleQRScanResult = async (scannedUrl: string) => {
        try {
            // QR 코드 URL에서 사용자 ID 추출
            const userId = businessCardService.extractUserIdFromQRUrl(scannedUrl);
            
            if (!userId) {
                toast.error('유효하지 않은 QR 코드입니다.');
                return;
            }

            // 인코딩된 사용자 ID로 명함 수집
            await businessCardService.collectBusinessCardByEncodedId(userId);
            toast.success('전자명함이 수집되었습니다!');
            
            // 수집된 명함 목록 새로고침
            await loadCollectedCards();
            
        } catch (error: any) {
            console.error('명함 수집 실패:', error);
            const message = error.response?.data?.message || '명함 수집 중 오류가 발생했습니다.';
            toast.error(message);
        }
    };

    const filteredCards = collectedCards.filter(card => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        const businessCard = card.businessCard;
        
        return (
            businessCard?.name?.toLowerCase().includes(searchLower) ||
            businessCard?.company?.toLowerCase().includes(searchLower) ||
            businessCard?.position?.toLowerCase().includes(searchLower) ||
            card.memo?.toLowerCase().includes(searchLower)
        );
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getSocialMediaUrl = (platform: string, username: string) => {
        return businessCardService.getSocialMediaUrl(platform, username);
    };

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-full md:w-[1256px] min-h-screen relative">
                    <TopNav />
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg">로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-full md:w-[1256px] min-h-screen relative">
                {/* 모바일 햄버거 버튼 */}
                <button
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="md:hidden fixed top-20 left-4 z-50 p-3 bg-transparent"
                >
                    {isMobileSidebarOpen ? (
                        <HiOutlineX className="w-6 h-6 text-gray-600" />
                    ) : (
                        <HiOutlineMenu className="w-6 h-6 text-gray-600" />
                    )}
                </button>

                {/* 모바일 사이드바 오버레이 */}
                {isMobileSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* 모바일 사이드바 */}
                <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="p-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2"
                        >
                            <HiOutlineX className="w-6 h-6 text-gray-600" />
                        </button>
                        <AttendeeSideNav className="!relative !top-0 !left-0" />
                    </div>
                </div>

                {/* 데스크톱 사이드바 */}
                <div className="hidden md:block">
                    <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                </div>

                <TopNav />

                {/* 제목 */}
                <div className="md:absolute md:top-[137px] md:left-64 left-4 right-4 top-24 relative md:static">
                    <div className="font-bold text-black text-xl md:text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        <div className="flex items-center justify-between w-full">
                            <span>명함 지갑 ({filteredCards.length})</span>
                            <button
                                onClick={() => setQrScannerOpen(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-sm font-semibold"
                                title="QR 코드 스캔으로 명함 수집"
                            >
                                <QrCode className="w-4 h-4" />
                                QR 스캔
                            </button>
                        </div>
                    </div>
                </div>

                {/* 검색창 */}
                <div className="md:absolute md:top-[190px] md:left-64 md:right-8 left-4 right-4 top-32 relative md:static">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="이름, 회사, 직책, 메모로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* 명함 목록 */}
                <div className="md:absolute md:top-[260px] md:left-64 md:right-8 left-4 right-4 top-40 relative md:static">
                    {filteredCards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <User className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg mb-2">
                                {searchTerm ? '검색 결과가 없습니다' : '수집된 명함이 없습니다'}
                            </p>
                            <p className="text-sm">
                                {searchTerm ? '다른 키워드로 검색해보세요' : 'QR 코드를 스캔하여 명함을 수집해보세요'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredCards.map((card) => (
                                <div key={card.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                    {/* 명함 헤더 */}
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold mb-1">
                                                    {card.businessCard?.name || 'Unknown'}
                                                </h3>
                                                {card.businessCard?.position && (
                                                    <p className="text-blue-100 text-sm mb-1">
                                                        {card.businessCard.position}
                                                    </p>
                                                )}
                                                {card.businessCard?.company && (
                                                    <p className="text-blue-100 text-sm">
                                                        {card.businessCard.company}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCard(card.id, card.businessCard?.name)}
                                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                                title="명함 삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 명함 내용 */}
                                    <div className="p-4 space-y-3">
                                        {/* 부서 */}
                                        {card.businessCard?.department && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Building className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{card.businessCard.department}</span>
                                            </div>
                                        )}

                                        {/* 전화번호 */}
                                        {card.businessCard?.phoneNumber && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                <a
                                                    href={`tel:${card.businessCard.phoneNumber}`}
                                                    className="hover:text-blue-600 transition-colors"
                                                >
                                                    {businessCardService.formatPhoneNumber(card.businessCard.phoneNumber)}
                                                </a>
                                            </div>
                                        )}

                                        {/* 이메일 */}
                                        {card.businessCard?.email && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                <a
                                                    href={`mailto:${card.businessCard.email}`}
                                                    className="hover:text-blue-600 transition-colors break-all"
                                                >
                                                    {card.businessCard.email}
                                                </a>
                                            </div>
                                        )}

                                        {/* 웹사이트 */}
                                        {card.businessCard?.website && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                                                <a
                                                    href={businessCardService.normalizeWebsiteUrl(card.businessCard.website)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-blue-600 transition-colors break-all"
                                                >
                                                    {card.businessCard.website}
                                                </a>
                                            </div>
                                        )}

                                        {/* 주소 */}
                                        {card.businessCard?.address && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{card.businessCard.address}</span>
                                            </div>
                                        )}

                                        {/* 소셜 미디어 링크들 */}
                                        {(card.businessCard?.linkedIn || card.businessCard?.instagram || card.businessCard?.facebook || card.businessCard?.twitter) && (
                                            <div className="flex space-x-2">
                                                {card.businessCard.linkedIn && (
                                                    <a
                                                        href={getSocialMediaUrl('linkedIn', card.businessCard.linkedIn)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        LinkedIn
                                                    </a>
                                                )}
                                                {card.businessCard.instagram && (
                                                    <a
                                                        href={getSocialMediaUrl('instagram', card.businessCard.instagram)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-pink-600 hover:text-pink-800 text-sm"
                                                    >
                                                        Instagram
                                                    </a>
                                                )}
                                                {card.businessCard.facebook && (
                                                    <a
                                                        href={getSocialMediaUrl('facebook', card.businessCard.facebook)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-700 hover:text-blue-900 text-sm"
                                                    >
                                                        Facebook
                                                    </a>
                                                )}
                                                {card.businessCard.twitter && (
                                                    <a
                                                        href={getSocialMediaUrl('twitter', card.businessCard.twitter)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-600 text-sm"
                                                    >
                                                        Twitter
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* 자기소개 */}
                                        {card.businessCard?.description && (
                                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                <p className="whitespace-pre-wrap">{card.businessCard.description}</p>
                                            </div>
                                        )}

                                        {/* 메모 섹션 */}
                                        <div className="border-t pt-3 mt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">메모</span>
                                                {editingMemo?.cardId !== card.id && (
                                                    <button
                                                        onClick={() => setEditingMemo({
                                                            cardId: card.id,
                                                            memo: card.memo || ''
                                                        })}
                                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                        title="메모 편집"
                                                    >
                                                        <Edit3 className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                )}
                                            </div>

                                            {editingMemo?.cardId === card.id ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={editingMemo.memo}
                                                        onChange={(e) => setEditingMemo({
                                                            ...editingMemo,
                                                            memo: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        rows={3}
                                                        placeholder="메모를 입력하세요..."
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={handleSaveMemo}
                                                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                        >
                                                            저장
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingMemo(null)}
                                                            className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                                                        >
                                                            취소
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-600 min-h-[20px]">
                                                    {card.memo || '메모가 없습니다.'}
                                                </p>
                                            )}
                                        </div>

                                        {/* 수집 날짜 */}
                                        <div className="flex items-center text-xs text-gray-400 pt-2 border-t">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {formatDate(card.collectedAt)} 수집
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* QR 스캐너 모달 */}
                <QRScannerModal
                    isOpen={qrScannerOpen}
                    onClose={() => setQrScannerOpen(false)}
                    onScanSuccess={handleQRScanResult}
                />
            </div>
        </div>
    );
}