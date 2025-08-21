import React, {useEffect, useState, useRef, useMemo} from 'react';
import { TopNav } from "../../components/TopNav";
import { BoothAdminSideNav } from "../../components/BoothAdminSideNav";
import { toast } from 'react-toastify';
import { Edit3, Save, X } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface BoothInfo {
    boothId: number;
    boothTitle: string;
    boothDescription: string;
    boothBannerUrl?: string;
    startDate: string;
    endDate: string;
    managerName: string;
    contactEmail: string;
    contactNumber: string;
    eventTitle: string;
    boothTypeName: string;
    boothTypeSize: string;
    price: number;
    location: string;
    boothExternalLinks: BoothExternalLink[];
    eventId: number;
    statusCode: string;
    statusName: string;
    paymentStatusCode: string;
    paymentStatus: string;
}

interface BoothUpdateData {
    boothTitle?: string;
    boothDescription?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    boothExternalLinks?: BoothExternalLink[];
    tempFiles?: any[];
}

interface BoothExternalLink {
    displayText: string;
    url: string;
}

interface BoothAdminUpdateData {
    managerName?: string;
    contactNumber?: string;
    contactEmail?: string;
}

const BoothInfoManagement: React.FC = () => {
    // 파일 업로드 훅
    const { uploadFile, getFileByUsage, removeFile, getFileUploadDtos, clearAllFiles, isUploading } = useFileUpload();

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

    // 배너 파일 업로드 핸들러
    const handleBannerFileUpload = async (file: File) => {
        await uploadFile(file, 'banner');
    };

    // 배너 파일 제거 핸들러
    const handleBannerFileRemove = () => {
        removeFile('banner');
        setBannerFile(null);
        setBannerPreview(null);
    };

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

    const [booths, setBooths] = useState<BoothInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBooth, setEditingBooth] = useState<number | null>(null);
    const [editingAdmin, setEditingAdmin] = useState<number | null>(null);
    const [editData, setEditData] = useState<BoothUpdateData>({
        boothTitle: '',
        boothDescription: '',
        startDate: '',
        endDate: '',
        location: '',
        boothExternalLinks: []
    });
    const [adminData, setAdminData] = useState<BoothAdminUpdateData>({
        managerName: '',
        contactNumber: '',
        contactEmail: ''
    });
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchBoothInfo();
    }, []);

    const fetchBoothInfo = async () => {
        try {
            // 우선 내 부스 신청 목록 조회
            const applicationsResponse = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/my-booths`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!applicationsResponse.ok) {
                throw new Error('부스 정보를 불러올 수 없습니다.');
            }

            const applications = await applicationsResponse.json();

            console.log("applications:", applications);
            
            // 승인되고 결제완료된 부스들만 필터링해서 상세 정보 조회
            const approvedBooths = applications
                .filter((app: any) =>
                app.statusCode === 'APPROVED' && app.paymentStatusCode === 'PAID'
            );

            const boothInfoPromises = approvedBooths.map(async (app: any) => {
                try {
                    return {
                        boothId: app.boothId,
                        boothTitle: app.boothTitle,
                        boothDescription: app.boothDescription || '',
                        boothBannerUrl: app.boothBannerUrl,
                        startDate: app.startDate,
                        endDate: app.endDate,
                        managerName: app.managerName,
                        contactEmail: app.contactEmail,
                        contactNumber: app.contactNumber || '',
                        eventTitle: app.eventTitle,
                        boothTypeName: app.boothTypeName,
                        boothTypeSize: app.boothTypeSize,
                        price: app.price,
                        location: app.location || '',
                        boothExternalLinks: app.boothExternalLinks || [],
                        eventId: app.eventId,
                        statusCode: app.statusCode,
                        statusName: app.statusName,
                        paymentStatusCode: app.paymentStatusCode,
                        paymentStatus: app.paymentStatus,
                    };
                } catch (error) {
                    console.error('부스 상세 정보 조회 실패:', error);
                    return null;
                }
            });

            const boothInfos = (await Promise.all(boothInfoPromises)).filter(Boolean);
            setBooths(boothInfos as BoothInfo[]);
        } catch (error) {
            console.error('부스 정보 조회 오류:', error);
            toast.error('부스 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0,3)}-${digits.slice(3)}`;
        return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7,11)}`;
    };

    const handleBoothFormChange = (field: keyof BoothUpdateData, value: any) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAdminFormChange = (field: keyof BoothAdminUpdateData, value: any) => {
        setAdminData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAdminPhoneChange = (raw: string) => {
        const formatted = formatPhoneNumber(raw);
        setAdminData(prev => ({
            ...prev,
            contactNumber: formatted,
        }));
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const previewUrl = URL.createObjectURL(file);
            setBannerPreview(previewUrl);
        }
    };

    const startEditBooth = (booth: BoothInfo) => {
        setEditingBooth(booth.boothId);
        setEditData({
            boothTitle: booth.boothTitle,
            boothDescription: booth.boothDescription,
            startDate: booth.startDate,
            endDate: booth.endDate,
            location: booth.location,
            boothExternalLinks: booth.boothExternalLinks
        });
        setBannerFile(null);
        setBannerPreview(null);
        clearAllFiles(); // 기존 업로드 상태 클리어
    };

    const startEditAdmin = (booth: BoothInfo) => {
        setEditingAdmin(booth.boothId);
        setAdminData({
            managerName: booth.managerName,
            contactNumber: booth.contactNumber,
            contactEmail: booth.contactEmail
        });
    };

    const cancelEdit = () => {
        setEditingBooth(null);
        setEditingAdmin(null);
        setEditData({ boothTitle: '', boothDescription: '', startDate: '', endDate: '', location: '', boothExternalLinks: [] });
        setAdminData({ managerName: '', contactNumber: '', contactEmail: '' });
        setBannerFile(null);
        setBannerPreview(null);
        clearAllFiles(); // 업로드된 파일 상태 클리어
    };

    const saveBooth = async (boothId: number, eventId: number) => {
        try {
            let tempFiles: any[] = [];
            
            // 배너 파일이 있으면 업로드 (useFileUpload 훅에서 관리되는 파일들 사용)
            const uploadDtos = getFileUploadDtos();
            if (uploadDtos.length > 0) {
                tempFiles = uploadDtos;
            }
            
            // 기존 배너 파일 처리 (하위 호환성)
            if (bannerFile) {
                const bannerUploadResult = await uploadFile(bannerFile, `booth_banner_${Date.now()}`);
                if (bannerUploadResult && bannerUploadResult.s3Key) {
                    tempFiles.push({
                        s3Key: bannerUploadResult.s3Key,
                        originalFileName: bannerFile.name,
                        fileType: bannerFile.type,
                        fileSize: bannerFile.size,
                        usage: 'banner'
                    });
                } else {
                    console.error('파일 업로드 결과가 유효하지 않습니다:', bannerUploadResult);
                    toast.error('파일 업로드에 실패했습니다. 다시 시도해주세요.');
                    return;
                }
            }

            const updateData = {
                ...editData,
                ...(tempFiles.length > 0 && { tempFiles })
            };

            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/events/${eventId}/booths/${boothId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('부스 정보 수정에 실패했습니다.');
            }

            toast.success('부스 정보가 성공적으로 수정되었습니다.');
            setEditingBooth(null);
            setBannerFile(null);
            setBannerPreview(null);
            clearAllFiles(); // 업로드된 파일 상태 클리어
            await fetchBoothInfo();
        } catch (error) {
            console.error('부스 정보 수정 오류:', error);
            toast.error('부스 정보 수정 중 오류가 발생했습니다.');
        }
    };

    const saveAdmin = async (boothId: number, eventId: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/events/${eventId}/booths/${boothId}/manager`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(adminData),
            });

            if (!response.ok) {
                throw new Error('관리자 정보 수정에 실패했습니다.');
            }

            toast.success('관리자 정보가 성공적으로 수정되었습니다.');
            setEditingAdmin(null);
            await fetchBoothInfo();
        } catch (error) {
            console.error('관리자 정보 수정 오류:', error);
            toast.error('관리자 정보 수정 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />
                
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 정보 관리
                </div>

                <BoothAdminSideNav className="!absolute !left-0 !top-[117px]" />

                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    <div className="mb-6">
                        <p className="text-gray-600">부스 기본 정보와 관리자 정보를 수정할 수 있습니다</p>
                    </div>

                    {booths.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21h2m0 0h2m-4 0v-2m0 0V7a2 2 0 012-2h2m0 16h2m0 0v-2"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">관리할 부스가 없습니다</h3>
                            <p className="text-gray-600">승인되고 결제가 완료된 부스가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {booths.map((booth) => (
                                <div key={booth.boothId} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">{booth.boothTitle}</h2>
                                                <p className="text-gray-600">{booth.eventTitle}</p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {booth.boothTypeName} • {booth.boothTypeSize?.replace('x', 'm x ')}m
                                            </div>
                                        </div>

                                        {/* 부스 기본 정보 */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">부스 기본 정보</h3>
                                                {editingBooth !== booth.boothId && (
                                                    <button
                                                        onClick={() => startEditBooth(booth)}
                                                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Edit3 className="w-4 h-4 mr-1" />
                                                        수정
                                                    </button>
                                                )}
                                            </div>

                                            {editingBooth === booth.boothId ? (
                                                <div className="p-4 bg-white rounded-lg space-y-6">
                                                    {/* 부스명 */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            부스명 <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editData.boothTitle}
                                                            onChange={(e) => setEditData({ ...editData, boothTitle: e.target.value })}
                                                            placeholder="부스명을 입력하세요"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        />
                                                    </div>

                                                    {/* 부스 배너 */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            배너 이미지 (정방형)
                                                        </label>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                                            <div className="mb-10 relative flex flex-col">
                                                                <img src={ booth?.boothBannerUrl } alt="booth banner" width={500}/>
                                                                <p className="block text-sm font-medium text-gray-700 mb-2">기존 이미지</p>
                                                            </div>
                                                            <div
                                                                className="border-2 border-dashed border-gray-300 rounded-[10px] text-center hover:border-gray-400 transition-colors relative flex items-center justify-center"
                                                                style={{ height: "410px", padding: "1rem" }}
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
                                                                        handleBannerFileUpload(files[0]);
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
                                                                                            handleBannerFileUpload(file);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </label>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleBannerFileRemove()}
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
                                                                                            handleBannerFileUpload(file);
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

                                                    </div>

                                                    {/* 운영 기간 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                운영 시작일 <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={editData.startDate}
                                                                onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                운영 종료일 <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={editData.endDate}
                                                                onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* 부스 설명 */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            부스 설명 <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="overflow-hidden rounded-[10px] border border-gray-300">
                                                            <style>
                                                                {`
                                                                    .ql-editor {
                                                                        min-height: 200px !important;
                                                                    }
                                                                    .ql-toolbar {
                                                                        border-radius: 10px 10px 0 0;
                                                                    }
                                                                `}
                                                            </style>
                                                            <ReactQuill
                                                                ref={quillRef}
                                                                theme="snow"
                                                                value={editData.boothDescription}
                                                                onChange={(value) => handleBoothFormChange('boothDescription', value)}
                                                                placeholder="부스 및 전시 내용을 자세히 설명해주세요"
                                                                modules={editorModules}
                                                                formats={quillFormats}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* 외부 링크 */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            대표 사이트/SNS 링크
                                                        </label>
                                                        <div className="space-y-3">
                                                            {editData.boothExternalLinks?.map((link, index) => (
                                                                <div key={index} className="flex gap-2 items-center">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="링크 이름 (예: 홈페이지)"
                                                                        value={link.displayText}
                                                                        onChange={(e) => {
                                                                            const newLinks = [...(editData.boothExternalLinks || [])];
                                                                            newLinks[index] = { ...newLinks[index], displayText: e.target.value };
                                                                            setEditData(prev => ({ ...prev, boothExternalLinks: newLinks }));
                                                                        }}
                                                                        className="w-1/3 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                                    />
                                                                    <input
                                                                        type="url"
                                                                        placeholder="https://..."
                                                                        value={link.url}
                                                                        onChange={(e) => {
                                                                            const newLinks = [...(editData.boothExternalLinks || [])];
                                                                            newLinks[index] = { ...newLinks[index], url: e.target.value };
                                                                            setEditData(prev => ({ ...prev, boothExternalLinks: newLinks }));
                                                                        }}
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newLinks = (editData.boothExternalLinks || []).filter((_, i) => i !== index);
                                                                            setEditData(prev => ({ ...prev, boothExternalLinks: newLinks }));
                                                                        }}
                                                                        className="px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                                                                    >
                                                                        삭제
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newLinks = [...(editData.boothExternalLinks || []), { displayText: '', url: '' }];
                                                                    handleBoothFormChange('boothExternalLinks', newLinks);
                                                                }}
                                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                                            >
                                                                링크 추가
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* 저장/취소 버튼 */}
                                                    <div className="flex justify-end space-x-3 pt-4">
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            취소
                                                        </button>
                                                        <button
                                                            onClick={() => saveBooth(booth.boothId, booth.eventId)}
                                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                                        >
                                                            <Save className="w-4 h-4 mr-2" />
                                                            저장
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* 현재 배너 표시 */}
                                                    {booth.boothBannerUrl && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-500 mb-2">부스 배너</label>
                                                            <img 
                                                                src={booth.boothBannerUrl} 
                                                                alt="부스 배너" 
                                                                className="w-64 h-64 object-cover border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-500">부스명</label>
                                                            <div className="mt-1 text-gray-900">{booth.boothTitle}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-500">운영 기간</label>
                                                            <div className="mt-1 text-gray-900">
                                                                {booth.startDate ? new Date(booth.startDate).toLocaleDateString() : ''} ~ {booth.endDate ? new Date(booth.endDate).toLocaleDateString() : ''}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-500">부스 위치</label>
                                                            <div className="mt-1 text-gray-900">{booth.location || '행사 주최 측에서 아직 위치를 지정하지 않았습니다.'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-500">부스 설명</label>
                                                        <div className="mt-1 text-gray-900 prose max-w-none" dangerouslySetInnerHTML={{ __html: booth.boothDescription || '설명이 없습니다' }}></div>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-500">대표 사이트/SNS</label>
                                                        <div className="mt-1 text-gray-900">
                                                            {booth.boothExternalLinks && booth.boothExternalLinks.length > 0 ? (
                                                                <ul className="list-disc list-inside">
                                                                    {booth.boothExternalLinks.map((link, index) => (
                                                                        <li key={index}>
                                                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                                                {link.displayText}
                                                                            </a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                '등록된 링크가 없습니다'
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 관리자 정보 */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">관리자 정보</h3>
                                                {editingAdmin !== booth.boothId && (
                                                    <button
                                                        onClick={() => startEditAdmin(booth)}
                                                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Edit3 className="w-4 h-4 mr-1" />
                                                        수정
                                                    </button>
                                                )}
                                            </div>

                                            {editingAdmin === booth.boothId ? (
                                                <div className="p-4 bg-white rounded-lg space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                담당자명 <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={adminData.managerName}
                                                                onChange={(e) => setAdminData({ ...adminData, managerName: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                담당자 연락처 <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={adminData.contactNumber}
                                                                onChange={(e) => setAdminData({ ...adminData, contactNumber: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                담당자 이메일 <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={adminData.contactEmail}
                                                                onChange={(e) => setAdminData({ ...adminData, contactEmail: e.target.value })}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end space-x-3 pt-4">
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            취소
                                                        </button>
                                                        <button
                                                            onClick={() => saveAdmin(booth.boothId, booth.eventId)}
                                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                                        >
                                                            <Save className="w-4 h-4 mr-2" />
                                                            저장
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500">관리자명</label>
                                                        <div className="mt-1 text-gray-900">{booth.managerName}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500">연락처</label>
                                                        <div className="mt-1 text-gray-900">{booth.contactNumber || '등록된 연락처가 없습니다'}</div>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-500">이메일</label>
                                                        <div className="mt-1 text-gray-900">{booth.contactEmail}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoothInfoManagement;