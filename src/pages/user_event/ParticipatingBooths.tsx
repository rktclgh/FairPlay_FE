import React, { useState, useEffect } from "react";

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
    const [booths, setBooths] = useState<Booth[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [applicationForm, setApplicationForm] = useState({
        startDate: '',
        endDate: '',
        boothType: '',
        boothName: '',
        bannerImage: null as File | null,
        description: '',
        representativeName: '',
        contactEmail: '',
        contactPhone: '',
        websiteLink: '',
        fairPlayEmail: ''
    });

    // 목업 부스 데이터
    const mockBooths: Booth[] = [
        {
            id: 1,
            name: "AI 혁신 부스",
            company: "테크노베이션",
            category: "기술/IT",
            description: "최신 AI 기술과 머신러닝 솔루션을 체험해보세요.",
            location: "A-01",
            contactEmail: "ai@technovation.co.kr",
            contactPhone: "02-1234-5678",
            website: "https://technovation.co.kr",
            logoUrl: "/images/NoImage.png",
            isActive: true
        },
        {
            id: 2,
            name: "스마트 홈 체험관",
            company: "스마트라이프",
            category: "기술/IT",
            description: "IoT 기반 스마트 홈 시스템을 체험해보세요.",
            location: "A-02",
            contactEmail: "info@smartlife.co.kr",
            contactPhone: "02-2345-6789",
            website: "https://smartlife.co.kr",
            logoUrl: "/images/NoImage.png",
            isActive: true
        },
        {
            id: 3,
            name: "건강한 먹거리",
            company: "그린푸드",
            category: "식품/음료",
            description: "유기농 식품과 건강한 먹거리를 소개합니다.",
            location: "B-01",
            contactEmail: "green@greenfood.co.kr",
            contactPhone: "02-3456-7890",
            logoUrl: "/images/NoImage.png",
            isActive: true
        },
        {
            id: 4,
            name: "에코 뷰티",
            company: "네이처코스메틱",
            category: "패션/뷰티",
            description: "자연 친화적인 화장품과 뷰티 제품을 만나보세요.",
            location: "B-02",
            contactEmail: "beauty@naturecosmetic.co.kr",
            contactPhone: "02-4567-8901",
            website: "https://naturecosmetic.co.kr",
            logoUrl: "/images/NoImage.png",
            isActive: true
        },
        {
            id: 5,
            name: "미래 교육 솔루션",
            company: "에듀테크",
            category: "교육/문화",
            description: "혁신적인 교육 기술을 체험해보세요.",
            location: "C-01",
            contactEmail: "edu@edutech.co.kr",
            contactPhone: "02-5678-9012",
            logoUrl: "/images/NoImage.png",
            isActive: true
        },
        {
            id: 6,
            name: "헬스케어 이노베이션",
            company: "메디케어플러스",
            category: "헬스케어",
            description: "디지털 헬스케어 솔루션을 체험해보세요.",
            location: "C-02",
            contactEmail: "health@medicareplus.co.kr",
            contactPhone: "02-6789-0123",
            website: "https://medicareplus.co.kr",
            logoUrl: "/images/NoImage.png",
            isActive: true
        },
        {
            id: 7,
            name: "블록체인 솔루션",
            company: "크립토이노베이션",
            category: "기술/IT",
            description: "블록체인 기술의 실제 활용사례를 소개합니다.",
            location: "A-03",
            contactEmail: "crypto@innovation.co.kr",
            contactPhone: "02-7890-1234",
            logoUrl: "/images/NoImage.png",
            isActive: true
        },
        {
            id: 8,
            name: "친환경 패키징",
            company: "그린패키지",
            category: "기타",
            description: "지속가능한 포장재 솔루션을 제공합니다.",
            location: "B-03",
            contactEmail: "green@package.co.kr",
            contactPhone: "02-8901-2345",
            logoUrl: "/images/NoImage.png",
            isActive: true
        }
    ];

    useEffect(() => {
        // 실제로는 API 호출
        const loadBooths = async () => {
            try {
                setLoading(true);
                // API 호출 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 1000));
                setBooths(mockBooths);
            } catch (error) {
                console.error('부스 데이터 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBooths();
    }, [eventId]);

    // 필터링된 부스 목록
    const filteredBooths = booths.filter(booth => {
        const matchesSearch = booth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booth.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booth.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && booth.isActive;
    });

    // 부스 클릭 핸들러
    const handleBoothClick = (booth: Booth) => {
        setSelectedBooth(booth);
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

    // 필수 필드 검증
    const isFormValid = () => {
        return (
            applicationForm.startDate &&
            applicationForm.endDate &&
            applicationForm.boothType &&
            applicationForm.boothName &&
            applicationForm.bannerImage &&
            applicationForm.description &&
            applicationForm.representativeName &&
            applicationForm.contactEmail &&
            applicationForm.contactPhone &&
            applicationForm.fairPlayEmail
        );
    };

    // 신청 제출 핸들러
    const handleSubmitApplication = () => {
        if (!isFormValid()) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        // TODO: 실제 API 호출
        alert('부스 신청이 완료되었습니다. 1~2일 내에 검토 결과를 알려드립니다.');
        setShowApplicationForm(false);
        setApplicationForm({
            startDate: '',
            endDate: '',
            boothType: '',
            boothName: '',
            bannerImage: null,
            description: '',
            representativeName: '',
            contactEmail: '',
            contactPhone: '',
            websiteLink: '',
            fairPlayEmail: ''
        });
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
                                    {selectedBooth.logoUrl ? (
                                        <img
                                            src={selectedBooth.logoUrl}
                                            alt={selectedBooth.name}
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
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBooth.name}</h2>
                                    <p className="text-lg text-gray-700 mb-1">{selectedBooth.company}</p>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                            {selectedBooth.category}
                                        </span>
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
                                        <a href={`tel:${selectedBooth.contactPhone}`} className="hover:text-blue-600">
                                            {selectedBooth.contactPhone}
                                        </a>
                                    </div>
                                    {selectedBooth.website && (
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            <a href={selectedBooth.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                                {selectedBooth.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 부스 설명 */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">부스 소개</h3>
                            <p className="text-gray-700 leading-relaxed">{selectedBooth.description}</p>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        참가 일정 종료일 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={applicationForm.endDate}
                                        onChange={(e) => handleFormChange('endDate', e.target.value)}
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
                                        value={applicationForm.boothType}
                                        onChange={(e) => handleFormChange('boothType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">부스 타입을 선택하세요</option>
                                        <option value="standard">표준 부스 (3m x 3m)</option>
                                        <option value="premium">프리미엄 부스 (6m x 3m)</option>
                                        <option value="corner">코너 부스 (3m x 3m)</option>
                                        <option value="large">대형 부스 (6m x 6m)</option>
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
                                    배너 업로드 <span className="text-red-500">*</span>
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
                                            handleFormChange('bannerImage', files[0]);
                                        }
                                    }}
                                >
                                    {applicationForm.bannerImage ? (
                                        <div className="space-y-2">
                                            <img
                                                src={URL.createObjectURL(applicationForm.bannerImage)}
                                                alt="배너 미리보기"
                                                className="mx-auto max-h-48 max-w-full object-contain rounded"
                                            />
                                            <p className="text-xs text-green-600">✓ {applicationForm.bannerImage.name}</p>
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
                                                                handleFormChange('bannerImage', file);
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFormChange('bannerImage', null)}
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
                                                <label htmlFor="banner-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>이미지 업로드</span>
                                                    <input
                                                        id="banner-upload"
                                                        name="bannerImage"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFormChange('bannerImage', file);
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </label>
                                                <p className="pl-1">또는 드래그 앤 드롭</p>
                                            </div>
                                            <p className="text-xs text-gray-500">이미지 파일 (PNG, JPG, GIF) 최대 5MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 부스 소개 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    부스 소개 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={applicationForm.description}
                                    onChange={(e) => handleFormChange('description', e.target.value)}
                                    placeholder="부스 및 전시 내용을 자세히 설명해주세요"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    required
                                />
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        담당자 연락처 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={applicationForm.contactPhone}
                                        onChange={(e) => handleFormChange('contactPhone', e.target.value)}
                                        placeholder="연락처를 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        대표 사이트 or SNS 링크
                                    </label>
                                    <input
                                        type="url"
                                        value={applicationForm.websiteLink}
                                        onChange={(e) => handleFormChange('websiteLink', e.target.value)}
                                        placeholder="웹사이트 주소를 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
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
                                    신청 후 1~2일 내에 주최 측에서 검토 결과를 알려드립니다.
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
                            placeholder="부스명, 업체명으로 검색"
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
                                key={booth.id}
                                className="bg-white border border-gray-200 rounded-[10px] shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                onClick={() => handleBoothClick(booth)}
                            >
                                {/* 배너(정방형) */}
                                <div className="aspect-square bg-gray-100 rounded-t-[10px] flex items-center justify-center">
                                    {booth.logoUrl ? (
                                        <img
                                            src={booth.logoUrl}
                                            alt={booth.name}
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
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-900 text-base truncate">
                                            {booth.name}
                                        </h4>
                                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded shrink-0">
                                            {booth.location}
                                        </span>
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
