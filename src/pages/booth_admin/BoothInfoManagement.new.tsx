import React, { useEffect, useState, useRef, useMemo } from 'react';
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
                throw new Error('부스 신청 정보를 불러올 수 없습니다.');
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
    };

    const saveBooth = async (boothId: number, eventId: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/events/${eventId}/booths/${boothId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(editData),
            });

            if (!response.ok) {
                throw new Error('부스 정보 수정에 실패했습니다.');
            }

            toast.success('부스 정보가 성공적으로 수정되었습니다.');
            setEditingBooth(null);
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
                                                            onChange={(e) => handleBoothFormChange('boothTitle', e.target.value)}
                                                            placeholder="부스명을 입력하세요"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        />
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
                                                                onChange={(e) => handleBoothFormChange('startDate', e.target.value)}
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
                                                                onChange={(e) => handleBoothFormChange('endDate', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* 부스 위치 */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            부스 위치
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editData.location}
                                                            onChange={(e) => handleBoothFormChange('location', e.target.value)}
                                                            placeholder="부스 위치를 입력하세요 (예: A-1)"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
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
                                                                            handleBoothFormChange('boothExternalLinks', newLinks);
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
                                                                            handleBoothFormChange('boothExternalLinks', newLinks);
                                                                        }}
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newLinks = (editData.boothExternalLinks || []).filter((_, i) => i !== index);
                                                                            handleBoothFormChange('boothExternalLinks', newLinks);
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
                                                                onChange={(e) => handleAdminFormChange('managerName', e.target.value)}
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
                                                                onChange={(e) => handleAdminPhoneChange(e.target.value)}
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
                                                                onChange={(e) => handleAdminFormChange('contactEmail', e.target.value)}
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