import React, { useState, useEffect } from 'react';
import { TopNav } from '../../components/TopNav';
import { AttendeeSideNav } from './AttendeeSideNav';
import { AdminSideNav } from '../../components/AdminSideNav';
import { HostSideNav } from '../../components/HostSideNav';
import { BoothAdminSideNav } from '../../components/BoothAdminSideNav';
import { getCachedRoleCode } from '../../utils/role';
import { hasAdminPermission, hasEventManagerPermission, hasBoothManagerPermission } from '../../utils/permissions';
import { QRCodeModal } from '../../components/QRCodeModal';
import { toast } from 'react-toastify';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { User, Building, Phone, Mail, Globe, MapPin, FileText, Camera, QrCode, Share } from 'lucide-react';
import businessCardService from '../../services/businessCardService';
import type { BusinessCardFormData, BusinessCardResponse } from '../../types/businessCard';
import { loadKakaoMap } from '../../lib/loadKakaoMap';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useTranslation } from 'react-i18next';

// 카카오맵 전역 인터페이스 선언
declare global {
    interface Window {
        kakao: any;
    }
}

interface KakaoPlace {
    id: string;
    place_name: string;
    address_name: string;
    road_address_name?: string;
    phone?: string;
    x?: string; // longitude
    y?: string; // latitude
}

export default function BusinessCard(): JSX.Element {
    const { t } = useTranslation();
    const userRole = getCachedRoleCode();
    const [formData, setFormData] = useState<BusinessCardFormData>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    
    // 카카오맵 관련 상태
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    
    // 전화번호 관련 상태
    const [phonePrefix, setPhonePrefix] = useState('010');
    const [phoneMiddle, setPhoneMiddle] = useState('');
    const [phoneLast, setPhoneLast] = useState('');
    const [customPrefix, setCustomPrefix] = useState('');
    
    // 파일 업로드 훅
    const {
        uploadedFiles,
        isUploading,
        uploadFile,
        removeFile,
        getFileByUsage,
    } = useFileUpload();

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
                    detailAddress: card.detailAddress || '',
                    placeName: card.placeName || '',
                    latitude: card.latitude || null,
                    longitude: card.longitude || null,
                    placeUrl: card.placeUrl || '',
                    description: card.description || '',
                    linkedIn: card.linkedIn || '',
                    instagram: card.instagram || '',
                    facebook: card.facebook || '',
                    twitter: card.twitter || '',
                    profileImageUrl: card.profileImageUrl || ''
                });
                
                // 전화번호 파싱
                if (card.phoneNumber) {
                    parsePhoneNumber(card.phoneNumber);
                }
                
                // 카카오맵 검색어 설정
                if (card.placeName) {
                    setSearchKeyword(card.placeName);
                }
            }
        } catch (error) {
            console.error('전자명함 로드 실패:', error);
            toast.error(t('common.error'));
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

    // CDN URL 생성 유틸
    const toCdnUrl = (path: string) => {
        const base = import.meta.env.VITE_CDN_BASE_URL || "";
        if (/^https?:\/\//.test(path)) return path;
        const clean = path.startsWith("/") ? path.slice(1) : path;
        return `${base}/${clean}`;
    };
    
    // 프로필 이미지 업로드 핸들러
    const handleProfileImageUpload = async (file: File) => {
        if (!file) return;
        try {
            await uploadFile(file, 'profile_image');
            const uploadedFile = getFileByUsage('profile_image');
            if (uploadedFile) {
                const profileImageUrl = toCdnUrl(uploadedFile.key);
                setFormData(prev => ({
                    ...prev,
                    profileImageUrl,
                    hasChanges: true
                }));
            }
        } catch (error) {
            console.error('프로필 이미지 업로드 실패:', error);
            toast.error(t('businessCard.profileImageUploadError'));
        }
    };
    
    // 카카오맵 장소 검색
    const searchPlaces = () => {
        if (!searchKeyword.trim()) {
            toast.error(t('businessCard.searchError'));
            return;
        }

        loadKakaoMap(() => {
            if (!window.kakao?.maps?.services) {
                toast.error(t('businessCard.kakaoMapError'));
                return;
            }

            const ps = new window.kakao.maps.services.Places();
            ps.keywordSearch(searchKeyword, (data: KakaoPlace[], status: string) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    setSearchResults(data);
                    setShowSearchResults(true);
                } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                    toast.error(t('businessCard.noSearchResults'));
                    setSearchResults([]);
                    setShowSearchResults(false);
                } else {
                    toast.error(t('businessCard.searchFailed'));
                    setSearchResults([]);
                    setShowSearchResults(false);
                }
            });
        });
    };
    
    // 장소 선택
    const selectPlace = (place: KakaoPlace) => {
        const preferredAddress = place.road_address_name || place.address_name;
        setFormData(prev => ({
            ...prev,
            address: preferredAddress,
            placeName: place.place_name,
            detailAddress: '',
            longitude: place.x ? parseFloat(place.x) : null,
            latitude: place.y ? parseFloat(place.y) : null,
            placeUrl: `https://place.map.kakao.com/${place.id}`,
            hasChanges: true
        }));
        setSearchKeyword(place.place_name);
        setShowSearchResults(false);
    };
    
    // 전화번호 파싱 기능
    const parsePhoneNumber = (phoneNumber: string) => {
        const cleaned = phoneNumber.replace(/[^0-9]/g, '');

        const areaCodes2 = ['02']; // 2자리 지역번호
        const areaCodes3 = [
            '031','032','033','041','042','043','044',
            '051','052','053','054','055',
            '061','062','063','064'
        ]; // 3자리 지역번호

        if (areaCodes2.some(code => cleaned.startsWith(code))) {
            // 02 (서울)
            setPhonePrefix('02');
            if (cleaned.length >= 9) {
                // 9자리(02-XXX-XXXX) 또는 10자리(02-XXXX-XXXX)
                setPhoneMiddle(cleaned.slice(2, cleaned.length === 10 ? 6 : 5));
                setPhoneLast(cleaned.slice(cleaned.length === 10 ? 6 : 5));
            }
        } else if (areaCodes3.some(code => cleaned.startsWith(code))) {
            // 3자리 지역번호
            const prefix = cleaned.slice(0, 3);
            setPhonePrefix(prefix);
            if (cleaned.length >= 9) {
                setPhoneMiddle(cleaned.slice(3, cleaned.length - 4));
                setPhoneLast(cleaned.slice(-4));
            }
        } else if (
            cleaned.startsWith('010') || cleaned.startsWith('011') ||
            cleaned.startsWith('016') || cleaned.startsWith('017') ||
            cleaned.startsWith('018') || cleaned.startsWith('019')
        ) {
            // 휴대폰
            setPhonePrefix(cleaned.slice(0, 3));
            if (cleaned.length >= 10) {
                setPhoneMiddle(cleaned.slice(3, 7));
                setPhoneLast(cleaned.slice(7));
            }
        } else {
            // 그 외 직접 입력
            setPhonePrefix('직접입력');
            setCustomPrefix(cleaned.slice(0, 3));
            if (cleaned.length >= 7) {
                setPhoneMiddle(cleaned.slice(3, cleaned.length - 4));
                setPhoneLast(cleaned.slice(-4));
            }
        }
    };
    
    // 전화번호 업데이트
    const updatePhoneNumber = () => {
        let fullNumber = '';
        
        if (phonePrefix === '직접입력') {
            fullNumber = `${customPrefix}-${phoneMiddle}-${phoneLast}`;
        } else {
            fullNumber = `${phonePrefix}-${phoneMiddle}-${phoneLast}`;
        }
        
        // 빈 값이나 불완전한 번호 처리
        if (!phoneMiddle || !phoneLast) {
            fullNumber = '';
        }
        
        setFormData(prev => ({
            ...prev,
            phoneNumber: fullNumber,
            hasChanges: true
        }));
    };
    
    // 전화번호 부분이 변경될 때마다 업데이트
    React.useEffect(() => {
        updatePhoneNumber();
    }, [phonePrefix, phoneMiddle, phoneLast, customPrefix]);
    
    // 전화번호 입력 핸들러
    const handlePhonePrefixChange = (value: string) => {
        setPhonePrefix(value);
        if (value !== '직접입력') {
            setCustomPrefix('');
        }
    };
    
    const handlePhoneMiddleChange = (value: string) => {
        const cleaned = value.replace(/[^0-9]/g, '');
        if (cleaned.length <= 4) {
            setPhoneMiddle(cleaned);
        }
    };
    
    const handlePhoneLastChange = (value: string) => {
        const cleaned = value.replace(/[^0-9]/g, '');
        if (cleaned.length <= 4) {
            setPhoneLast(cleaned);
        }
    };
    
    const handleCustomPrefixChange = (value: string) => {
        const cleaned = value.replace(/[^0-9]/g, '');
        if (cleaned.length <= 4) {
            setCustomPrefix(cleaned);
        }
    };

    const phonePrefixes = [
        // 서울
        { code: "02", label: "02 (서울)" },
        // 수도권/강원
        { code: "031", label: "031 (경기)" },
        { code: "032", label: "032 (인천)" },
        { code: "033", label: "033 (강원)" },
        // 충청
        { code: "041", label: "041 (충남)" },
        { code: "042", label: "042 (대전)" },
        { code: "043", label: "043 (충북)" },
        { code: "044", label: "044 (세종)" },
        // 영남
        { code: "051", label: "051 (부산)" },
        { code: "052", label: "052 (울산)" },
        { code: "053", label: "053 (대구)" },
        { code: "054", label: "054 (경북)" },
        { code: "055", label: "055 (경남)" },
        // 호남/제주
        { code: "061", label: "061 (전남)" },
        { code: "062", label: "062 (광주)" },
        { code: "063", label: "063 (전북)" },
        { code: "064", label: "064 (제주)" },
        // 휴대폰
        { code: "010", label: "010" },
        { code: "011", label: "011" },
        { code: "016", label: "016" },
        { code: "017", label: "017" },
        { code: "018", label: "018" },
        { code: "019", label: "019" }
    ];

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // 업로드된 프로필 이미지가 있으면 URL 설정
            const uploadedProfileImage = getFileByUsage('profile_image');
            
            // 전화번호에서 대쉬 제거
            const cleanPhoneNumber = formData.phoneNumber ? formData.phoneNumber.replace(/[^0-9]/g, '') : '';
            
            const saveData = {
                ...formData,
                phoneNumber: cleanPhoneNumber, // 대쉬 제거된 전화번호
                profileImageUrl: uploadedProfileImage ? toCdnUrl(uploadedProfileImage.key) : formData.profileImageUrl
            };
            
            await businessCardService.saveBusinessCard(saveData);
            toast.success(t('businessCard.saved'));
            setFormData(prev => ({ ...prev, hasChanges: false }));
        } catch (error: any) {
            console.error('전자명함 저장 실패:', error);
            const message = error.response?.data?.message || t('businessCard.saveError');
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateQR = async () => {
        try {
            // 먼저 명함이 저장되어 있는지 확인
            if (formData.hasChanges) {
                toast.error(t('businessCard.saveFirst'));
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
                        <div className="text-lg">{t('common.loading')}</div>
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
                        {userRole && hasAdminPermission(userRole) && <AdminSideNav className="!relative !top-0 !left-0" />}
                        {userRole && hasEventManagerPermission(userRole) && <HostSideNav className="!relative !top-0 !left-0" />}
                        {userRole && hasBoothManagerPermission(userRole) && <BoothAdminSideNav className="!relative !top-0 !left-0" />}
                        {(!userRole || (!hasAdminPermission(userRole || '') && !hasEventManagerPermission(userRole || '') && !hasBoothManagerPermission(userRole || ''))) && <AttendeeSideNav className="!relative !top-0 !left-0" />}
                    </div>
                </div>

                {/* 데스크톱 사이드바 */}
                <div className="hidden md:block">
                    {userRole && hasAdminPermission(userRole) && <AdminSideNav className="!absolute !left-0 !top-[117px]" />}
                    {userRole && hasEventManagerPermission(userRole) && <HostSideNav className="!absolute !left-0 !top-[117px]" />}
                    {userRole && hasBoothManagerPermission(userRole) && <BoothAdminSideNav className="!absolute !left-0 !top-[117px]" />}
                    {(!userRole || (!hasAdminPermission(userRole || '') && !hasEventManagerPermission(userRole || '') && !hasBoothManagerPermission(userRole || ''))) && <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />}
                </div>

                <TopNav />

                {/* 제목 */}
                <div className="md:absolute md:top-[137px] md:left-64 left-4 right-4 top-24 relative">
                    <div className="font-bold text-black text-xl md:text-2xl tracking-[0] leading-[54px] whitespace-nowrap flex items-center justify-between">
                        {t('businessCard.title')}
                    </div>
                </div>

                {/* 콘텐츠 */}
                <div className="md:relative md:top-[180px] md:left-64 md:right-8 left-4 right-4 top-32 mb-16 relative">
                    <div className="static top-4 right-4 flex gap-2 mb-5">
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
                            {t('businessCard.generateQR')}
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
                            {saving ? t('businessCard.saving') : t('businessCard.save')}
                        </button>
                    </div>
                    <div className="space-y-6 max-w-4xl">

                        {/* 기본 정보 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">

                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                {t('businessCard.basicInfo')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('common.name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('businessCard.namePlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('businessCard.position')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.position || ''}
                                        onChange={(e) => handleInputChange('position', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('businessCard.positionPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('businessCard.company')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company || ''}
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('businessCard.companyPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('businessCard.department')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.department || ''}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('businessCard.departmentPlaceholder')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 프로필 이미지 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Camera className="w-5 h-5 mr-2 text-blue-600" />
                                {t('businessCard.profileImage')}
                            </h3>
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="relative">
                                        <img
                                            src={
                                                getFileByUsage('profile_image') 
                                                    ? toCdnUrl(getFileByUsage('profile_image')!.key) 
                                                    : formData.profileImageUrl || '/images/blank_profile.jpg'
                                            }
                                            alt={t('businessCard.profileImage')}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                        />
                                        {(formData.profileImageUrl || getFileByUsage('profile_image')) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    removeFile('profile_image');
                                                    setFormData(prev => ({ ...prev, profileImageUrl: '', hasChanges: true }));
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('businessCard.uploadImage')}
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold">
                                            {t('businessCard.selectImage')}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleProfileImageUpload(file);
                                                }}
                                                disabled={isUploading}
                                            />
                                        </label>
                                        {isUploading && (
                                            <span className="text-sm text-gray-500">{t('businessCard.uploading')}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('businessCard.imageFormat')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 연락처 정보 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Phone className="w-5 h-5 mr-2 text-green-600" />
                                {t('businessCard.contactInfo')}
                            </h3>
                            <div className="space-y-6">
                                {/* 전화번호 - 전체 너비 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('businessCard.phoneNumber')}
                                    </label>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        {/* 지역번호 드롭다운 */}
                                        <select
                                            value={phonePrefix}
                                            onChange={(e) => handlePhonePrefixChange(e.target.value)}
                                            className="w-20 sm:w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {phonePrefixes.map((p) => (
                                                <option key={p.code} value={p.code}>
                                                    {p.label}
                                                </option>
                                            ))}
                                            <option value="직접입력">{t('businessCard.directInput')}</option>
                                        </select>
                                        
                                        {/* 커스텀 지역번호 입력 */}
                                        {phonePrefix === '직접입력' && (
                                            <input
                                                type="tel"
                                                value={customPrefix}
                                                onChange={(e) => handleCustomPrefixChange(e.target.value)}
                                                placeholder={t('businessCard.areaCode')}
                                                className="w-16 sm:w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                maxLength={4}
                                            />
                                        )}
                                        
                                        <span className="text-gray-500 select-none">-</span>
                                        
                                        {/* 중간 번호 */}
                                        <input
                                            type="tel"
                                            value={phoneMiddle}
                                            onChange={(e) => handlePhoneMiddleChange(e.target.value)}
                                            placeholder="0000"
                                            className="w-16 sm:w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            maxLength={4}
                                        />
                                        
                                        <span className="text-gray-500 select-none">-</span>
                                        
                                        {/* 마지막 번호 */}
                                        <input
                                            type="tel"
                                            value={phoneLast}
                                            onChange={(e) => handlePhoneLastChange(e.target.value)}
                                            placeholder="0000"
                                            className="w-16 sm:w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                                
                                {/* 이메일과 웹사이트 - 2열 그리드 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('common.email')}
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={t('businessCard.emailPlaceholder')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('businessCard.website')}
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.website || ''}
                                            onChange={(e) => handleInputChange('website', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={t('businessCard.websitePlaceholder')}
                                        />
                                    </div>
                                </div>
                                
                                {/* 주소 - 전체 너비 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('businessCard.address')}
                                    </label>
                                    <div className="space-y-4">
                                        {/* 장소 검색 */}
                                        <div>
                                            <div className="relative w-full md:w-1/2">
                                                <input
                                                    type="text"
                                                    value={searchKeyword}
                                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                                    placeholder={t('businessCard.searchPlaceholder')}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-full pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            searchPlaces();
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={searchPlaces}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                                    style={{ background:"transparent" }}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* 검색 결과 */}
                                            {showSearchResults && searchResults.length > 0 && (
                                                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto mt-2">
                                                    {searchResults.map((place, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            onClick={() => selectPlace(place)}
                                                        >
                                                            <div className="font-semibold text-gray-900">
                                                                {place.place_name}
                                                            </div>
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                {place.road_address_name || place.address_name}
                                                            </div>
                                                            {place.road_address_name && place.address_name !== place.road_address_name && (
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    (지번: {place.address_name})
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* 기본 주소 */}
                                        <div>
                                            <input
                                                type="text"
                                                value={formData.address || ''}
                                                readOnly
                                                placeholder={t('businessCard.addressPlaceholder')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* 상세 주소 */}
                                        <div>
                                            <input
                                                type="text"
                                                value={formData.detailAddress || ''}
                                                onChange={(e) => handleInputChange('detailAddress', e.target.value)}
                                                placeholder={t('businessCard.detailAddressPlaceholder')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 소셜 미디어 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Globe className="w-5 h-5 mr-2 text-purple-600" />
                                {t('businessCard.socialMedia')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkedIn || ''}
                                        onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('businessCard.linkedInPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instagram URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.instagram || ''}
                                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('businessCard.instagramPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Facebook URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.facebook || ''}
                                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('businessCard.facebookPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Twitter URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.twitter || ''}
                                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('businessCard.twitterPlaceholder')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 자기소개 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-16">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-orange-600" />
                                {t('businessCard.description')}
                            </h3>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder={t('businessCard.descriptionPlaceholder')}
                            />
                        </div>
                    </div>
                </div>
                
                {/* 추가 공간 */}
                <div className="h-20"></div>

                {/* QR 코드 모달 */}
                <QRCodeModal
                    isOpen={qrModalOpen}
                    onClose={() => setQrModalOpen(false)}
                    qrUrl={qrUrl}
                    title={t('businessCard.qrCodeTitle')}
                />
            </div>
        </div>
    );
}