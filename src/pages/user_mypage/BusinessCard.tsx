import React, { useState, useEffect } from 'react';
import { TopNav } from '../../components/TopNav';
import { AttendeeSideNav } from './AttendeeSideNav';
import { QRCodeModal } from '../../components/QRCodeModal';
import { toast } from 'react-toastify';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { User, Building, Phone, Mail, Globe, MapPin, FileText, Camera, QrCode, Share } from 'lucide-react';
import businessCardService from '../../services/businessCardService';
import type { BusinessCardFormData, BusinessCardResponse } from '../../types/businessCard';

export default function BusinessCard(): JSX.Element {
    const [formData, setFormData] = useState<BusinessCardFormData>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        loadBusinessCard();
    }, []);

    const loadBusinessCard = async () => {
        try {
            setLoading(true);
            const card = await businessCardService.getMyBusinessCard();
            if (card) {
                setFormData({
                    name: card.name || '',
                    company: card.company || '',
                    position: card.position || '',
                    department: card.department || '',
                    phoneNumber: card.phoneNumber || '',
                    email: card.email || '',
                    website: card.website || '',
                    address: card.address || '',
                    description: card.description || '',
                    linkedIn: card.linkedIn || '',
                    instagram: card.instagram || '',
                    facebook: card.facebook || '',
                    twitter: card.twitter || '',
                    profileImageUrl: card.profileImageUrl || ''
                });
            }
        } catch (error) {
            console.error('전자명함 로드 실패:', error);
            toast.error('전자명함을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof BusinessCardFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            hasChanges: true
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await businessCardService.saveBusinessCard(formData);
            toast.success('전자명함이 저장되었습니다.');
            setFormData(prev => ({ ...prev, hasChanges: false }));
        } catch (error: any) {
            console.error('전자명함 저장 실패:', error);
            const message = error.response?.data?.message || '전자명함 저장 중 오류가 발생했습니다.';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateQR = async () => {
        try {
            // 먼저 명함이 저장되어 있는지 확인
            if (formData.hasChanges) {
                toast.error('먼저 전자명함을 저장해주세요.');
                return;
            }

            const url = await businessCardService.generateQRCode();
            setQrUrl(url);
            setQrModalOpen(true);
        } catch (error: any) {
            console.error('QR 코드 생성 실패:', error);
            const message = error.response?.data?.message || 'QR 코드 생성에 실패했습니다.';
            toast.error(message);
        }
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
                    <div className="font-bold text-black text-xl md:text-2xl tracking-[0] leading-[54px] whitespace-nowrap flex items-center justify-between">
                        전자명함
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGenerateQR}
                                disabled={!formData.name && !formData.company}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                                    !formData.name && !formData.company
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                                }`}
                                title="QR 코드 생성 및 공유"
                            >
                                <QrCode className="w-4 h-4" />
                                QR 생성
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formData.hasChanges}
                                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    saving || !formData.hasChanges
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {saving ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 콘텐츠 */}
                <div className="md:absolute md:top-[200px] md:left-64 md:right-8 left-4 right-4 top-32 relative md:static">
                    <div className="space-y-6 max-w-4xl">
                        {/* 기본 정보 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                기본 정보
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        이름
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="이름을 입력하세요"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        직책
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.position || ''}
                                        onChange={(e) => handleInputChange('position', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="직책을 입력하세요"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        회사명
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company || ''}
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="회사명을 입력하세요"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        부서
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.department || ''}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="부서를 입력하세요"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 연락처 정보 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Phone className="w-5 h-5 mr-2 text-green-600" />
                                연락처 정보
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        전화번호
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber || ''}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        이메일
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="example@company.com"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        웹사이트
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website || ''}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.company.com"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        주소
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address || ''}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="서울시 강남구 테헤란로 123"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 소셜 미디어 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Globe className="w-5 h-5 mr-2 text-purple-600" />
                                소셜 미디어
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        LinkedIn
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.linkedIn || ''}
                                        onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="사용자명"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instagram
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.instagram || ''}
                                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="@사용자명"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Facebook
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.facebook || ''}
                                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="사용자명"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Twitter
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.twitter || ''}
                                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="@사용자명"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 자기소개 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-orange-600" />
                                자기소개
                            </h3>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="간단한 자기소개를 입력하세요..."
                            />
                        </div>
                    </div>
                </div>

                {/* QR 코드 모달 */}
                <QRCodeModal
                    isOpen={qrModalOpen}
                    onClose={() => setQrModalOpen(false)}
                    qrUrl={qrUrl}
                    title="전자명함 QR 코드"
                />
            </div>
        </div>
    );
}