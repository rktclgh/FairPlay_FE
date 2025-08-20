import React, { useState, useEffect, useRef, useMemo } from "react";
import { getBooths, getBoothDetails, applyForBooth, getBoothTypes } from "../../api/boothApi";
import {BoothDetailResponse, BoothSummary, BoothType} from "../../types/booth";
import { eventAPI } from "../../services/event";
import type { EventDetailResponseDto } from "../../services/types/eventType";
import { useFileUpload } from "../../hooks/useFileUpload";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Booth {
    id: number;
    name: string;
    company: string;
    category: string;
    description: string;
    location: string;
    contactEmail: string;
    contactPhone: string;
    website?: string;
    logoUrl?: string;
    isActive: boolean;
}

interface ParticipatingBoothsProps {
    eventId?: string;
}

export const ParticipatingBooths: React.FC<ParticipatingBoothsProps> = ({ eventId }) => {
    const [booths, setBooths] = useState<BoothSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooth, setSelectedBooth] = useState<BoothDetailResponse | null>(null);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [boothTypes, setBoothTypes] = useState<BoothType[]>([]);
    const [eventDetail, setEventDetail] = useState<EventDetailResponseDto | null>(null);
    
    // 파일 업로드 훅
    const { uploadFile, getFileByUsage, removeFile, getFileUploadDtos, isUploading } = useFileUpload();
    
    // ReactQuill 참조
    const quillRef = useRef<ReactQuill>(null);
    
    // 파일 선택
    const pickImageFile = () =>
        new Promise<File | null>((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = () => resolve(input.files?.[0] || null);
            input.click();
        });

    // 이미지 삽입
    const insertImage = (url: string) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        const range = quill.getSelection(true) ?? { index: quill.getLength(), length: 0 };
        quill.insertEmbed(range.index, "image", url, "user");
        quill.setSelection(range.index + 1, 0, "user");
    };

    // 서버 업로드 → CDN URL
    const uploadEditorImageAndGetUrl = async (file: File) => {
        try {
            const uploaded: any = await uploadFile(file, "editor_image");
            return uploaded?.url || null;
        } catch (error) {
            console.error("이미지 업로드 실패:", error);
            return null;
        }
    };

    // 에디터 모듈 설정
    const editorModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["clean"],
            ],
            handlers: {
                image: async () => {
                    const file = await pickImageFile();
                    if (!file) return;
                    const url = await uploadEditorImageAndGetUrl(file);
                    if (url) insertImage(url);
                },
            },
        },
        clipboard: { matchVisual: false },
        history: { delay: 1000, maxStack: 100, userOnly: true },
    }), []);

    const quillFormats = [
        "header", "bold", "italic", "underline", "strike",
        "list", "bullet", "indent", "link", "image"
    ];
    const [applicationForm, setApplicationForm] = useState({
        startDate: '',
        endDate: '',
        boothTypeId: '',
        boothName: '',
        description: '',
        representativeName: '',
        contactEmail: '',
        contactPhone: '',
        externalLinks: [] as { displayText: string; url: string }[],
        fairPlayEmail: ''
    });

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0,3)}-${digits.slice(3)}`;
        return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7,11)}`;
    };

    const handlePhoneChange = (raw: string) => {
        const formatted = formatPhoneNumber(raw);
        setApplicationForm(prev => ({
            ...prev,
            contactPhone: formatted, // 화면 표시값은 하이픈 포함
        }));
    };

    // 파일 업로드 핸들러
    const handleFileUpload = async (file: File, usage: string) => {
        await uploadFile(file, usage);
    };

    // 파일 제거 핸들러
    const handleFileRemove = (usage: string) => {
        removeFile(usage);
    };

    // 이미지 업로드 핸들러 (에디터용)
    const handleImageUpload = async (file: File): Promise<string | null> => {
        const response = await uploadFile(file, `description_image_${Date.now()}`);
        return response ? response.url : null;
    };



    // 목업 부스 데이터
    // const mockBooths: Booth[] = [
    //     {
    //         id: 1,
    //         name: "AI 혁신 부스",
    //         company: "테크노베이션",
    //         category: "기술/IT",
    //         description: "최신 AI 기술과 머신러닝 솔루션을 체험해보세요.",
    //         location: "A-01",
    //         contactEmail: "ai@technovation.co.kr",
    //         contactPhone: "02-1234-5678",
    //         website: "https://technovation.co.kr",
    //         logoUrl: "/images/NoImage.png",
    //         isActive: true
    //     },
    //     {
    //         id: 2,
    //         name: "스마트 홈 체험관",
    //         company: "스마트라이프",
    //         category: "기술/IT",
    //         description: "IoT 기반 스마트 홈 시스템을 체험해보세요.",
    //         location: "A-02",
    //         contactEmail: "info@smartlife.co.kr",
    //         contactPhone: "02-2345-6789",
    //         website: "https://smartlife.co.kr",
    //         logoUrl: "/images/NoImage.png",
    //         isActive: true
    //     },
    //     {
    //         id: 3,
    //         name: "건강한 먹거리",
    //         company: "그린푸드",
    //         category: "식품/음료",
    //         description: "유기농 식품과 건강한 먹거리를 소개합니다.",
    //         location: "B-01",
    //         contactEmail: "green@greenfood.co.kr",
    //         contactPhone: "02-3456-7890",
    //         logoUrl: "/images/NoImage.png",
    //         isActive: true
    //     },
    //     {
    //         id: 4,
    //         name: "에코 뷰티",
    //         company: "네이처코스메틱",
    //         category: "패션/뷰티",
    //         description: "자연 친화적인 화장품과 뷰티 제품을 만나보세요.",
    //         location: "B-02",
    //         contactEmail: "beauty@naturecosmetic.co.kr",
    //         contactPhone: "02-4567-8901",
    //         website: "https://naturecosmetic.co.kr",
    //         logoUrl: "/images/NoImage.png",
    //         isActive: true
    //     },
    //     {
    //         id: 5,
    //         name: "미래 교육 솔루션",
    //         company: "에듀테크",
    //         category: "교육/문화",
    //         description: "혁신적인 교육 기술을 체험해보세요.",
    //         location: "C-01",
    //         contactEmail: "edu@edutech.co.kr",
    //         contactPhone: "02-5678-9012",
    //         logoUrl: "/images/NoImage.png",
    //         isActive: true
    //     },
    //     {
    //         id: 6,
    //         name: "헬스케어 이노베이션",
    //         company: "메디케어플러스",
    //         category: "헬스케어",
    //         description: "디지털 헬스케어 솔루션을 체험해보세요.",
    //         location: "C-02",
    //         contactEmail: "health@medicareplus.co.kr",
    //         contactPhone: "02-6789-0123",
    //         website: "https://medicareplus.co.kr",
    //         logoUrl: "/images/NoImage.png",
    //         isActive: true
    //     },
    //     {
    //         id: 7,
    //         name: "블록체인 솔루션",
    //         company: "크립토이노베이션",
    //         category: "기술/IT",
    //         description: "블록체인 기술의 실제 활용사례를 소개합니다.",
    //         location: "A-03",
    //         contactEmail: "crypto@innovation.co.kr",
    //         contactPhone: "02-7890-1234",
    //         logoUrl: "/images/NoImage.png",
    //         isActive: true
    //     },
    //     {
    //         id: 8,
    //         name: "친환경 패키징",
    //         company: "그린패키지",
    //         category: "기타",
    //         description: "지속가능한 포장재 솔루션을 제공합니다.",
    //         location: "B-03",
    //         contactEmail: "green@package.co.kr",
    //         contactPhone: "02-8901-2345",
    //         logoUrl: "/images/NoImage.png",
    //         isActive: true
    //     }
    // ];

    useEffect(() => {
        const loadData = async () => {
            if (!eventId) return;
            
            try {
                setLoading(true);
                
                // 부스 목록, 부스 타입, 행사 상세 정보를 병렬로 로드
                const [boothsData, boothTypesData, eventDetailData] = await Promise.all([
                    getBooths(Number(eventId)),
                    getBoothTypes(Number(eventId)),
                    eventAPI.getEventDetail(Number(eventId))
                ]);
                
                setBooths(boothsData);
                setBoothTypes(boothTypesData);
                setEventDetail(eventDetailData);
            } catch (error) {
                console.error('데이터 로드 실패:', error);
                setError('데이터를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [eventId]);

    // 필터링된 부스 목록
    const filteredBooths = booths.filter(booth => {
        const matchesSearch = booth.boothTitle.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // 부스 클릭 핸들러
    const handleBoothClick = async (booth: BoothSummary) => {
        try {
            const boothDetail = await getBoothDetails(Number(eventId), booth.boothId);
            setSelectedBooth(boothDetail);
            // 스크롤을 탭 상단으로 이동 (상단바 높이 고려)
            setTimeout(() => {
                const tabContent = document.querySelector('[data-tab-content="booths"]');
                if (tabContent) {
                    const rect = tabContent.getBoundingClientRect();
                    const topNavHeight = 120; // 상단바 높이 + 여유공간
                    const targetPosition = window.pageYOffset + rect.top - topNavHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        } catch (error) {
            console.error('부스 상세 정보 불러오기 실패:', error);
            setError('부스 상세 정보를 불러오는 데 실패했습니다.');
        }
    };

    // 뒤로가기 핸들러
    const handleBackClick = () => {
        setSelectedBooth(null);
    };

    // 부스 신청하기 버튼 클릭 핸들러
    const handleApplicationClick = () => {
        setShowApplicationForm(true);
        // 스크롤을 탭 상단으로 이동 (상단바 높이 고려)
        setTimeout(() => {
            const tabContent = document.querySelector('[data-tab-content="booths"]');
            if (tabContent) {
                const rect = tabContent.getBoundingClientRect();
                const topNavHeight = 120; // 상단바 높이 + 여유공간
                const targetPosition = window.pageYOffset + rect.top - topNavHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    // 신청 폼 뒤로가기 핸들러
    const handleApplicationBackClick = () => {
        setShowApplicationForm(false);
    };

    // 폼 입력 핸들러
    const handleFormChange = (field: string, value: string | File | null) => {
        setApplicationForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 날짜 유효성 검증
    const validateDates = () => {
        if (!applicationForm.startDate || !applicationForm.endDate || !eventDetail) return true;
        
        const startDate = new Date(applicationForm.startDate);
        const endDate = new Date(applicationForm.endDate);
        const eventStartDate = new Date(eventDetail.startDate);
        const eventEndDate = new Date(eventDetail.endDate);
        
        // 시작일이 종료일보다 늦을 수 없음
        if (startDate > endDate) {
            return '시작일이 종료일보다 늦을 수 없습니다.';
        }
        
        // 부스 참가 일정이 행사 일정 범위 내에 있어야 함
        if (startDate < eventStartDate || endDate > eventEndDate) {
            return `참가 일정은 행사 기간(${eventDetail.startDate} ~ ${eventDetail.endDate}) 내에 있어야 합니다.`;
        }
        
        return true;
    };

    // 필수 필드 검증
    const isFormValid = () => {
        const dateValidation = validateDates();
        if (dateValidation !== true) return false;
        
        return (
            applicationForm.startDate &&
            applicationForm.endDate &&
            applicationForm.boothTypeId &&
            applicationForm.boothName &&
            applicationForm.description &&
            applicationForm.representativeName &&
            applicationForm.contactEmail &&
            applicationForm.contactPhone &&
            applicationForm.fairPlayEmail
        );
    };

    // 신청 제출 핸들러
    const handleSubmitApplication = async () => {
        const dateValidation = validateDates();
        if (dateValidation !== true) {
            alert(dateValidation);
            return;
        }
        
        if (!isFormValid()) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        try {
            setLoading(true);
            
            // 부스 신청 데이터 생성
            const uploadedFiles = getFileUploadDtos();
            const bannerFile = getFileByUsage('banner');
            
            const applicationData = {
                boothTitle: applicationForm.boothName,
                boothDescription: applicationForm.description,
                boothEmail: `${applicationForm.fairPlayEmail}@fair-play.ink`,
                managerName: applicationForm.representativeName,
                contactEmail: applicationForm.contactEmail,
                contactNumber: applicationForm.contactPhone.replace(/\D/g, ""),
                boothTypeId: Number(applicationForm.boothTypeId),
                startDate: applicationForm.startDate,
                endDate: applicationForm.endDate,
                tempBannerUrl: bannerFile ? {
                    s3Key: bannerFile.key,
                    originalFileName: bannerFile.name,
                    fileType: bannerFile.type,
                    fileSize: bannerFile.fileSize || 0
                } : null,
                boothExternalLinks: applicationForm.externalLinks.filter(link => 
                    link.url.trim() && link.displayText.trim()
                )
            };
            
            await applyForBooth(Number(eventId), applicationData);
            
            alert('부스 신청이 완료되었습니다. 1~2일 내에 검토 결과를 알려드립니다.');
            setShowApplicationForm(false);
            setApplicationForm({
                startDate: '',
                endDate: '',
                boothTypeId: '',
                boothName: '',
                description: '',
                representativeName: '',
                contactEmail: '',
                contactPhone: '',
                externalLinks: [],
                fairPlayEmail: ''
            });
            
            // 업로드된 파일들도 초기화
            removeFile('banner');
        } catch (error) {
            console.error('부스 신청 실패:', error);
            alert('부스 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">참가부스 정보를 불러오는 중...</p>
            </div>
        );
    }

    // 부스 상세보기 화면
    if (selectedBooth) {
        return (
            <div className="space-y-6">
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={handleBackClick}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>부스 목록으로 돌아가기</span>
                </button>

                {/* 부스 상세 정보 */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* 배너 이미지 */}
                            <div className="lg:w-1/3">
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                    {selectedBooth.boothBannerUrl ? (
                                        <img
                                            src={selectedBooth.boothBannerUrl}
                                            alt={selectedBooth.boothTitle}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-center">
                                            <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21h2m0 0h2m-4 0v-2m0 0V7a2 2 0 012-2h2m0 16h2m0 0v-2" />
                                            </svg>
                                            <p className="text-lg">이미지 없음</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 부스 정보 */}
                            <div className="lg:w-2/3 space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBooth.boothTitle}</h2>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                            {selectedBooth.location}
                                        </span>
                                    </div>
                                </div>

                                {/* 연락처 정보 */}
                                <div className="space-y-3">
                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <a href={`mailto:${selectedBooth.contactEmail}`} className="hover:text-blue-600">
                                            {selectedBooth.contactEmail}
                                        </a>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <a href={`tel:${selectedBooth.contactNumber}`} className="hover:text-blue-600">
                                            {selectedBooth.contactNumber}
                                        </a>
                                    </div>
                                    {selectedBooth.boothExternalLinks && selectedBooth.boothExternalLinks.length > 0 && (
                                        <div className="space-y-2">
                                            {selectedBooth.boothExternalLinks.map((link, index) => (
                                                <div key={index} className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                                        {link.displayText}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 부스 설명 */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">부스 소개</h3>
                            <div 
                                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedBooth.boothDescription }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 부스 신청 폼 화면
    if (showApplicationForm) {
        return (
            <div className="space-y-6">
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={handleApplicationBackClick}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>부스 목록으로 돌아가기</span>
                </button>

                {/* 부스 신청 폼 */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">부스 신청하기</h2>
                        <p className="text-gray-600 mb-6">본 신청은 주최 측 검토 후 승인이 완료되어야 부스 운영이 가능합니다.</p>

                        <form className="space-y-6">
                            {/* 참가 일정 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        참가 일정 시작일 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={applicationForm.startDate}
                                        onChange={(e) => handleFormChange('startDate', e.target.value)}
                                        min={eventDetail?.startDate}
                                        max={eventDetail?.endDate}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {eventDetail && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            행사 기간: {eventDetail.startDate} ~ {eventDetail.endDate}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        참가 일정 종료일 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={applicationForm.endDate}
                                        onChange={(e) => handleFormChange('endDate', e.target.value)}
                                        min={applicationForm.startDate || eventDetail?.startDate}
                                        max={eventDetail?.endDate}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* 부스 타입 및 부스명 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        부스 타입 <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={applicationForm.boothTypeId}
                                        onChange={(e) => handleFormChange('boothTypeId', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">부스 타입을 선택하세요</option>
                                        {boothTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name} ({type.size}) - {type.price.toLocaleString()}원
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        부스명 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={applicationForm.boothName}
                                        onChange={(e) => handleFormChange('boothName', e.target.value)}
                                        placeholder="부스명을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* 배너 업로드 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    배너 이미지 업로드 (선택사항)
                                </label>
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-[10px] p-6 text-center hover:border-gray-400 transition-colors relative"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                        const files = e.dataTransfer.files;
                                        if (files && files[0] && files[0].type.startsWith('image/')) {
                                            handleFileUpload(files[0], 'banner');
                                        }
                                    }}
                                >
                                    {getFileByUsage('banner') ? (
                                        <div className="space-y-2">
                                            <img
                                                src={getFileByUsage('banner')?.url}
                                                alt="배너 미리보기"
                                                className="mx-auto max-h-48 max-w-full object-contain rounded"
                                            />
                                            <p className="text-xs text-green-600">✓ {getFileByUsage('banner')?.name}</p>
                                            <div className="text-sm text-gray-600 space-x-2">
                                                <label htmlFor="banner-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>이미지 변경</span>
                                                    <input
                                                        id="banner-upload"
                                                        name="bannerImage"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileUpload(file, 'banner');
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFileRemove('banner')}
                                                    className="text-red-600 hover:text-red-500"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="text-sm text-gray-600">
                                                <label htmlFor="banner-upload-empty" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>이미지 업로드</span>
                                                    <input
                                                        id="banner-upload-empty"
                                                        name="bannerImage"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileUpload(file, 'banner');
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <p className="pl-1">또는 드래그 앤 드롭</p>
                                            </div>
                                            <p className="text-xs text-gray-500">이미지 파일 (PNG, JPG, GIF) 최대 10MB</p>
                                            {isUploading && (
                                                <div className="text-sm text-blue-600">
                                                    업로드 중...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 부스 소개 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    부스 소개 <span className="text-red-500">*</span>
                                </label>
                                <div className="overflow-hidden">
                                    <style>
                                        {`
                                            .ql-editor {
                                                min-height: 200px !important;
                                            }
                                        `}
                                    </style>
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={applicationForm.description}
                                        onChange={(value) => handleFormChange('description', value)}
                                        placeholder="부스 및 전시 내용을 자세히 설명해주세요"
                                        modules={editorModules}
                                        formats={quillFormats}
                                        style={{ 
                                            minHeight: '250px',
                                            borderRadius: '10px',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* 담당자 정보 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        부스 대표자명 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={applicationForm.representativeName}
                                        onChange={(e) => handleFormChange('representativeName', e.target.value)}
                                        placeholder="대표자명을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        담당자 이메일 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={applicationForm.contactEmail}
                                        onChange={(e) => handleFormChange('contactEmail', e.target.value)}
                                        placeholder="이메일을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        담당자 연락처 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={applicationForm.contactPhone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        placeholder="연락처를 입력하세요"
                                        maxLength={13} // 010-1234-5678
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>


                            {/* 외부 링크 섹션 */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        대표 사이트/SNS 링크
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newLinks = [...applicationForm.externalLinks, { displayText: '', url: '' }];
                                            setApplicationForm(prev => ({ ...prev, externalLinks: newLinks }));
                                        }}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        링크 추가
                                    </button>
                                </div>
                                
                                {applicationForm.externalLinks.length === 0 ? (
                                    <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-gray-500 text-sm">홈페이지, SNS 등의 링크를 추가할 수 있습니다.</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newLinks = [{ displayText: '', url: '' }];
                                                setApplicationForm(prev => ({ ...prev, externalLinks: newLinks }));
                                            }}
                                            className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            첫 번째 링크 추가
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {applicationForm.externalLinks.map((link, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <div className="flex gap-2 flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder="링크 이름 (예: 홈페이지, 인스타그램)"
                                                        value={link.displayText}
                                                        onChange={(e) => {
                                                            const newLinks = [...applicationForm.externalLinks];
                                                            newLinks[index] = { ...newLinks[index], displayText: e.target.value };
                                                            setApplicationForm(prev => ({ ...prev, externalLinks: newLinks }));
                                                        }}
                                                        className="w-3/8 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        style={{ flex: '3' }}
                                                    />
                                                    <input
                                                        type="url"
                                                        placeholder="https://..."
                                                        value={link.url}
                                                        onChange={(e) => {
                                                            const newLinks = [...applicationForm.externalLinks];
                                                            newLinks[index] = { ...newLinks[index], url: e.target.value };
                                                            setApplicationForm(prev => ({ ...prev, externalLinks: newLinks }));
                                                        }}
                                                        className="w-5/8 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        style={{ flex: '5' }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newLinks = applicationForm.externalLinks.filter((_, i) => i !== index);
                                                        setApplicationForm(prev => ({ ...prev, externalLinks: newLinks }));
                                                    }}
                                                    className="px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* FairPlay 계정 등록 이메일 */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">FairPlay에 등록할 이메일</h3>
                                <p className="text-sm text-gray-600 mb-4">부스 승인 시 작성된 이메일로 계정이 생성됩니다.</p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        이메일 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={applicationForm.fairPlayEmail}
                                            onChange={(e) => handleFormChange('fairPlayEmail', e.target.value)}
                                            placeholder="example"
                                            className="w-48 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            required
                                        />
                                        <span className="text-gray-600 font-medium">
                                            @fair-play.ink
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 신청 버튼 */}
                            <div className="text-center pt-6">
                                <button
                                    type="button"
                                    onClick={handleSubmitApplication}
                                    disabled={!isFormValid()}
                                    className={`font-medium px-8 py-3 rounded-[10px] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${isFormValid()
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md focus:ring-blue-500 cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    신청하기
                                </button>
                                <p className="text-sm text-gray-600 mt-4">
                                    신청 후 1~2일 내에 입력하신 담당자 이메일로 검토 결과를 알려드립니다.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" onClick={() => {
                    const el = document.getElementById("apply-section");
                    el?.scrollIntoView({ behavior: "smooth" }); // 부드럽게 스크롤
                }}>
                    부스 신청 바로가기
                </button>


            {/* 참가 부스 목록 섹션 */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    참가 부스 목록
                </h3>

                {/* 검색 */}
                <div className="mb-6">
                    <div className="w-full sm:w-1/2 lg:w-1/4">
                        <input
                            type="text"
                            placeholder="부스명으로 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* 부스 목록 */}
                {filteredBooths.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21h2m0 0h2m-4 0v-2m0 0V7a2 2 0 012-2h2m0 16h2m0 0v-2" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-2">조건에 맞는 참가부스가 없습니다</p>
                        <p className="text-sm text-gray-400">다른 검색어를 시도해보세요</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredBooths.map((booth) => (
                            <div
                                key={booth.boothId}
                                className="bg-white border border-gray-200 rounded-[10px] shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                onClick={() => handleBoothClick(booth)}
                            >
                                {/* 배너(정방형) */}
                                <div className="aspect-square bg-gray-100 rounded-t-[10px] flex items-center justify-center">
                                    {booth.boothBannerUrl ? (
                                        <img
                                            src={booth.boothBannerUrl}
                                            alt={booth.boothTitle}
                                            className="w-full h-full object-cover rounded-t-[10px]"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-center">
                                            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21h2m0 0h2m-4 0v-2m0 0V7a2 2 0 012-2h2m0 16h2m0 0v-2" />
                                            </svg>
                                            <p className="text-sm">이미지 없음</p>
                                        </div>
                                    )}
                                </div>

                                {/* 부스명과 구역 */}
                                <div className="p-4">
                                    <div className="items-center">
                                        <h4 className="font-semibold text-gray-900 text-base truncate">
                                            {booth.boothTitle}
                                        </h4>
                                        <div className="mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded shrink-0" style={{ width: '100px', textAlign: 'center' }}>
                                            {booth.location ? booth.location : "위치미정"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 부스 위치 안내 */}
            <div className="text-center">
                <p className="text-sm text-gray-600">
                    * 부스 위치는 행사 당일 변경될 수 있습니다. 정확한 위치는 현장 안내판을 확인해주세요.
                </p>
            </div>

            <hr className="my-8" />
            <h3 className="text-lg font-semibold text-gray-900 mb-6" id="apply-section">
                부스 신청
            </h3>

            {/* 부스 신청 안내 */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">부스 신청 안내</h4>
                <div className="text-sm text-gray-700 space-y-3 mb-6">
                    <div className="bg-white rounded p-4">
                        <h5 className="font-medium text-gray-900 mb-2">부스 신청 조건</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• 사업자등록증 보유 기업 또는 단체</li>
                            <li>• 박람회 취지에 부합하는 제품/서비스 보유</li>
                            <li>• 참가비 납부 및 부스 운영 인력 확보</li>
                            <li>• 전시 상품의 품질 및 안전성 보장</li>
                            <li>• 행사 규정 및 운영 지침 준수</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded p-4">
                        <h5 className="font-medium text-gray-900 mb-2">신청 절차</h5>
                        <ol className="space-y-2 text-sm text-gray-600">
                            <li>1. 온라인 신청서 작성 및 제출</li>
                            <li>2. 필요 서류 업로드 (사업자등록증, 제품 카탈로그 등)</li>
                            <li>3. 주최측 심사 및 승인</li>
                            <li>4. 참가비 납부</li>
                            <li>5. 부스 배정 및 최종 확정</li>
                        </ol>
                    </div>
                    <div className="bg-white rounded p-4">
                        <h5 className="font-medium text-gray-900 mb-2">혜택</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• 전시 공간 및 기본 시설 제공</li>
                            <li>• 박람회 홍보 마케팅 지원</li>
                            <li>• 바이어 매칭 및 상담 기회 제공</li>
                            <li>• 온라인 전시관 연동 서비스</li>
                        </ul>
                    </div>
                </div>
                <div className="text-center">
                    <button
                        onClick={handleApplicationClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-[10px] transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        부스 신청하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParticipatingBooths;
