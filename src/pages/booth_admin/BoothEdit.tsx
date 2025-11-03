import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFileUpload } from '../../hooks/useFileUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { TopNav } from "../../components/TopNav";
import { BoothAdminSideNav } from "../../components/BoothAdminSideNav";

interface BoothExternalLink {
    displayText: string;
    url: string;
}

interface BoothUpdateRequest {
    boothTitle?: string;
    boothDescription?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    boothExternalLinks?: BoothExternalLink[];
    tempFiles?: any[];
    deletedFileIds?: number[];
}

interface BoothDetailData {
    boothId: number;
    boothTitle: string;
    boothDescription: string;
    boothBannerUrl?: string;
    boothTypeName: string;
    location?: string;
    startDate: string;
    endDate: string;
    managerName: string;
    contactEmail: string;
    contactNumber: string;
    boothExternalLinks: BoothExternalLink[];
}

const BoothEdit: React.FC = () => {
    const { boothId } = useParams<{ boothId: string }>();
    const navigate = useNavigate();
    
    // 파일 업로드 훅
    const { uploadFile, getFileByUsage, removeFile, getFileUploadDtos, clearAllFiles, isUploading } = useFileUpload();
    
    // ReactQuill 참조
    const quillRef = useRef<ReactQuill>(null);
    
    // 이미지 업로드 핸들러
    const handleImageUpload = async (file: File): Promise<string | null> => {
        const response = await uploadFile(file, `description_image_${Date.now()}`);
        return response ? response.url : null;
    };
    
    // ReactQuill 이미지 핸들러
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        
        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                try {
                    const imageUrl = await handleImageUpload(file);
                    if (imageUrl && quillRef.current) {
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection();
                        quill.insertEmbed(range?.index || 0, 'image', imageUrl);
                    }
                } catch (error) {
                    console.error('이미지 업로드 실패:', error);
                }
            }
        };
    };
    
    const [boothData, setBoothData] = useState<BoothDetailData | null>(null);
    const [formData, setFormData] = useState<BoothUpdateRequest>({
        boothTitle: '',
        boothDescription: '',
        startDate: '',
        endDate: '',
        location: '',
        boothExternalLinks: [],
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    
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

    useEffect(() => {
        if (boothId) {
            fetchBoothDetails();
        }
    }, [boothId]);

    const fetchBoothDetails = async () => {
        try {
            // 먼저 내 부스 목록에서 해당 boothId의 eventId를 찾기
            const myBoothsResponse = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/my-booths`, {
                credentials: 'include', // HTTP-only 쿠키 자동 전송
            });

            if (!myBoothsResponse.ok) {
                if (myBoothsResponse.status === 401) {
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
                }
                throw new Error('부스 목록을 불러올 수 없습니다.');
            }

            const myBooths = await myBoothsResponse.json();
            const currentBooth = myBooths.find((booth: any) => booth.boothId === Number(boothId));
            
            if (!currentBooth) {
                throw new Error('해당 부스를 찾을 수 없습니다.');
            }

            const eventId = currentBooth.eventId;
            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/events/${eventId}/booths/${boothId}`, {
                credentials: 'include', // HTTP-only 쿠키 자동 전송
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
                }
                throw new Error('부스 정보를 불러올 수 없습니다.');
            }

            const data: BoothDetailData = await response.json();
            setBoothData(data);
            setFormData({
                boothTitle: data.boothTitle,
                boothDescription: data.boothDescription,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location || '',
                boothExternalLinks: data.boothExternalLinks || [],
            });
        } catch (error) {
            console.error('Error fetching booth details:', error);
            toast.error('부스 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const previewUrl = URL.createObjectURL(file);
            setBannerPreview(previewUrl);
        }
    };

    const handleExternalLinkChange = (index: number, field: 'displayText' | 'url', value: string) => {
        setFormData(prev => {
            const updatedLinks = [...(prev.boothExternalLinks || [])];
            updatedLinks[index] = {
                ...updatedLinks[index],
                [field]: value
            };
            return { ...prev, boothExternalLinks: updatedLinks };
        });
    };

    const addExternalLink = () => {
        setFormData(prev => ({
            ...prev,
            boothExternalLinks: [...(prev.boothExternalLinks || []), { displayText: '', url: '' }]
        }));
    };

    const removeExternalLink = (index: number) => {
        setFormData(prev => ({
            ...prev,
            boothExternalLinks: (prev.boothExternalLinks || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!boothId || !boothData) return;

        setSubmitting(true);

        try {
            // 먼저 내 부스 목록에서 해당 boothId의 eventId를 찾기
            const myBoothsResponse = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/my-booths`, {
                credentials: 'include', // HTTP-only 쿠키 자동 전송
            });

            if (!myBoothsResponse.ok) {
                if (myBoothsResponse.status === 401) {
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
                }
                throw new Error('부스 목록을 불러올 수 없습니다.');
            }

            const myBooths = await myBoothsResponse.json();
            const currentBooth = myBooths.find((booth: any) => booth.boothId === Number(boothId));
            
            if (!currentBooth) {
                throw new Error('해당 부스를 찾을 수 없습니다.');
            }

            const eventId = currentBooth.eventId;
            
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
                ...formData,
                ...(tempFiles.length > 0 && { tempFiles })
            };

            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/events/${eventId}/booths/${boothId}`, {
                method: 'PATCH',
                credentials: 'include', // HTTP-only 쿠키 자동 전송
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
                }
                throw new Error('부스 정보 수정에 실패했습니다.');
            }

            toast.success('부스 정보가 성공적으로 수정되었습니다.');
            clearAllFiles(); // 업로드된 파일 상태 클리어
            navigate('/booth-admin/dashboard');
        } catch (error) {
            console.error('Error updating booth:', error);
            toast.error('부스 정보 수정 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">로딩 중...</div>
            </div>
        );
    }

    if (!boothData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-red-600">부스 정보를 찾을 수 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav/>

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 정보 수정
                </div>

                {/* 사이드바 */}
                <BoothAdminSideNav className="!absolute !left-0 !top-[117px]"/>

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', backgroundColor: 'white' }}>
                        <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>부스 정보 수정</h1>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>부스 이름</label>
                                <input 
                                    type="text" 
                                    name="boothTitle" 
                                    value={formData.boothTitle} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem' }} 
                                />
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>배너 이미지 (정방형)</label>
                                <div
                                    style={{
                                        border: '2px dashed #ccc',
                                        borderRadius: '10px',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s, background-color 0.2s',
                                        position: 'relative'
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.style.borderColor = '#60a5fa';
                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.style.borderColor = '#ccc';
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.style.borderColor = '#ccc';
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        const files = e.dataTransfer.files;
                                        if (files && files[0] && files[0].type.startsWith('image/')) {
                                            handleBannerFileUpload(files[0]);
                                        }
                                    }}
                                >
                                    {getFileByUsage('banner') ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                            <img
                                                src={getFileByUsage('banner')?.url}
                                                alt="배너 미리보기"
                                                style={{
                                                    maxHeight: '12rem',
                                                    maxWidth: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <p style={{ fontSize: '0.75rem', color: '#16a34a', margin: 0 }}>✓ {getFileByUsage('banner')?.name}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                                                <label
                                                    htmlFor="banner-upload"
                                                    style={{
                                                        cursor: 'pointer',
                                                        backgroundColor: 'white',
                                                        borderRadius: '6px',
                                                        fontWeight: '500',
                                                        color: '#2563eb',
                                                        textDecoration: 'none',
                                                        padding: '0.25rem 0.5rem'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#1d4ed8'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#2563eb'}
                                                >
                                                    <span>이미지 변경</span>
                                                    <input
                                                        id="banner-upload"
                                                        name="bannerImage"
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
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
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                        padding: '0.25rem 0.5rem'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#b91c1c'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#dc2626'}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                            <svg style={{ width: '3rem', height: '3rem', color: '#9ca3af', margin: '0 auto' }} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                                                <label
                                                    htmlFor="banner-upload-empty"
                                                    style={{
                                                        cursor: 'pointer',
                                                        backgroundColor: 'white',
                                                        borderRadius: '6px',
                                                        fontWeight: '500',
                                                        color: '#2563eb',
                                                        textDecoration: 'none'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#1d4ed8'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#2563eb'}
                                                >
                                                    <span>이미지 업로드</span>
                                                    <input
                                                        id="banner-upload-empty"
                                                        name="bannerImage"
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleBannerFileUpload(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <span style={{ paddingLeft: '0.25rem' }}>또는 드래그 앤 드롭</span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>이미지 파일 (PNG, JPG, GIF) 최대 10MB</p>
                                            {isUploading && (
                                                <div style={{ fontSize: '0.875rem', color: '#2563eb' }}>
                                                    업로드 중...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>부스 설명</label>
                                <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
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
                                        value={formData.boothDescription}
                                        onChange={(value) => setFormData(prev => ({ ...prev, boothDescription: value }))}
                                        placeholder="부스 및 전시 내용을 자세히 설명해주세요"
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                [{ 'color': [] }, { 'background': [] }],
                                                ['link', 'image'],
                                                ['clean']
                                            ],
                                            handlers: {
                                                image: imageHandler
                                            }
                                        }}
                                        formats={[
                                            'header', 'bold', 'italic', 'underline', 'strike',
                                            'list', 'bullet', 'color', 'background', 'link', 'image'
                                        ]}
                                        style={{ 
                                            minHeight: '250px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>부스 타입</label>
                                <input 
                                    type="text" 
                                    value={boothData.boothTypeName}
                                    disabled
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem', backgroundColor: '#f5f5f5', color: '#666' }} 
                                />
                                <small style={{ color: '#666', fontSize: '0.9rem' }}>부스 타입은 수정할 수 없습니다.</small>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>운영 시작일</label>
                                <input 
                                    type="date" 
                                    name="startDate" 
                                    value={formData.startDate} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem' }} 
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>운영 종료일</label>
                                <input 
                                    type="date" 
                                    name="endDate" 
                                    value={formData.endDate} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem' }} 
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>위치 (선택사항)</label>
                                <input 
                                    type="text" 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleChange} 
                                    placeholder="부스 위치를 입력해주세요"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem' }} 
                                />
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontWeight: 'bold' }}>외부 링크 (홈페이지, SNS 등)</label>
                                    <button 
                                        type="button" 
                                        onClick={addExternalLink} 
                                        style={{ 
                                            padding: '0.5rem 1rem', 
                                            fontSize: '0.9rem', 
                                            backgroundColor: '#007bff', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '5px', 
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        링크 추가
                                    </button>
                                </div>
                                {(formData.boothExternalLinks || []).map((link, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <input 
                                            type="text" 
                                            placeholder="링크 이름 (예: 홈페이지, 인스타그램)" 
                                            value={link.displayText}
                                            onChange={(e) => handleExternalLinkChange(index, 'displayText', e.target.value)}
                                            style={{ flex: '3', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px' }}
                                        />
                                        <input 
                                            type="url" 
                                            placeholder="https://..." 
                                            value={link.url}
                                            onChange={(e) => handleExternalLinkChange(index, 'url', e.target.value)}
                                            style={{ flex: '5', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px' }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeExternalLink(index)}
                                            style={{ 
                                                padding: '0.75rem', 
                                                backgroundColor: '#dc3545', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '5px', 
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                ))}
                                {(!formData.boothExternalLinks || formData.boothExternalLinks.length === 0) && (
                                    <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic', margin: '0.5rem 0' }}>
                                        부스 홈페이지, SNS 계정 등의 링크를 추가할 수 있습니다.
                                    </p>
                                )}
                            </div>
                            
                            <hr style={{ margin: '2rem 0', border: '1px solid #eee' }} />
                            
                            <div style={{ marginBottom: '1rem' }}>
                                <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>담당자 정보</h2>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    담당자 정보는 관리자 정보 수정에서 변경할 수 있습니다.
                                </p>
                                
                                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '5px', border: '1px solid #e9ecef' }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>담당자 이름:</strong> {boothData.managerName}
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>이메일:</strong> {boothData.contactEmail}
                                    </div>
                                    <div>
                                        <strong>연락처:</strong> {boothData.contactNumber}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/booth-admin/dashboard')}
                                    style={{ 
                                        flex: '1',
                                        padding: '1rem', 
                                        fontSize: '1.1rem', 
                                        backgroundColor: '#6c757d', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '5px', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                                    style={{ 
                                        flex: '2',
                                        padding: '1rem', 
                                        fontSize: '1.1rem', 
                                        backgroundColor: '#28a745', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '5px', 
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        opacity: submitting ? 0.7 : 1,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {submitting ? '수정 중...' : '수정하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoothEdit;