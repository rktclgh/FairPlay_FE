import React, { useEffect, useState } from 'react';
import { TopNav } from '../../components/TopNav';
import { AdminSideNav } from '../../components/AdminSideNav';
import { useNavigate } from 'react-router-dom';
import { getAllCreators, createCreator, updateCreator, deleteCreator, Creator as ApiCreator, CreatorRequest } from '../../api/creatorApi';
import { useFileUpload } from '../../hooks/useFileUpload';
import { toast } from 'react-toastify';

interface Creator {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
    bio: string;
    responsibilities?: string[];
    github?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const CreatorManagement: React.FC = () => {
    const navigate = useNavigate();
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);

    // 파일 업로드 훅
    const {
        uploadedFiles,
        isUploading,
        uploadFile,
        removeFile,
        getFileByUsage,
        clearAllFiles
    } = useFileUpload();

    useEffect(() => {
        fetchCreators();
    }, []);

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
            if (uploadedFile && editingCreator) {
                const profileImageUrl = toCdnUrl(uploadedFile.key);
                setEditingCreator({
                    ...editingCreator,
                    profileImage: profileImageUrl
                });
                toast.success('프로필 이미지가 업로드되었습니다.');
            }
        } catch (error) {
            console.error('프로필 이미지 업로드 실패:', error);
            toast.error('프로필 이미지 업로드에 실패했습니다.');
        }
    };

    const fetchCreators = async () => {
        try {
            setLoading(true);
            const data = await getAllCreators();
            setCreators(data);
        } catch (error) {
            console.error('제작자 목록 조회 실패:', error);
            toast.error('제작자 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setIsCreateMode(true);
        setEditingCreator({
            id: 0,
            name: '',
            email: '',
            role: '',
            bio: '',
            responsibilities: [],
            displayOrder: creators.length + 1,
            isActive: true,
            createdAt: '',
            updatedAt: ''
        });
    };

    const handleEdit = (creator: Creator) => {
        setIsCreateMode(false);
        setEditingCreator({ ...creator });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            await deleteCreator(id);
            toast.success('제작자가 삭제되었습니다.');
            fetchCreators();
        } catch (error) {
            console.error('삭제 실패:', error);
            toast.error('삭제에 실패했습니다.');
        }
    };

    const handleSave = async () => {
        if (!editingCreator) return;

        // 필수 필드 검증
        if (!editingCreator.name || !editingCreator.email || !editingCreator.role || !editingCreator.bio) {
            toast.error('필수 항목을 모두 입력해주세요.');
            return;
        }

        try {
            // 업로드된 프로필 이미지가 있으면 URL 설정
            const uploadedProfileImage = getFileByUsage('profile_image');
            const profileImageUrl = uploadedProfileImage
                ? toCdnUrl(uploadedProfileImage.key)
                : editingCreator.profileImage;

            const requestData: CreatorRequest = {
                name: editingCreator.name,
                email: editingCreator.email,
                profileImageUrl: profileImageUrl,
                role: editingCreator.role,
                bio: editingCreator.bio,
                responsibilities: editingCreator.responsibilities,
                githubUrl: editingCreator.github,
                linkedinUrl: editingCreator.linkedin,
                instagramUrl: editingCreator.instagram,
                twitterUrl: editingCreator.twitter,
                websiteUrl: editingCreator.website,
                displayOrder: editingCreator.displayOrder,
                isActive: editingCreator.isActive
            };

            if (isCreateMode) {
                await createCreator(requestData);
                toast.success('제작자가 생성되었습니다.');
            } else {
                await updateCreator(editingCreator.id, requestData);
                toast.success('제작자가 수정되었습니다.');
            }

            setEditingCreator(null);
            setIsCreateMode(false);
            clearAllFiles(); // 업로드된 파일 정리
            fetchCreators();
        } catch (error) {
            console.error('저장 실패:', error);
            toast.error('저장에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        setEditingCreator(null);
        setIsCreateMode(false);
        clearAllFiles(); // 업로드된 파일 정리
    };

    const updateField = (field: keyof Creator, value: any) => {
        if (!editingCreator) return;
        setEditingCreator({ ...editingCreator, [field]: value });
    };

    const addResponsibility = () => {
        if (!editingCreator) return;
        const responsibilities = editingCreator.responsibilities || [];
        setEditingCreator({
            ...editingCreator,
            responsibilities: [...responsibilities, '']
        });
    };

    const updateResponsibility = (index: number, value: string) => {
        if (!editingCreator) return;
        const responsibilities = [...(editingCreator.responsibilities || [])];
        responsibilities[index] = value;
        setEditingCreator({ ...editingCreator, responsibilities });
    };

    const removeResponsibility = (index: number) => {
        if (!editingCreator) return;
        const responsibilities = [...(editingCreator.responsibilities || [])];
        responsibilities.splice(index, 1);
        setEditingCreator({ ...editingCreator, responsibilities });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TopNav />
            <div className="flex max-w-[1440px] mx-auto">
                <AdminSideNav className="flex-shrink-0" />

                <div className="flex-1 p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">제작자 관리</h1>
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            + 새 제작자 추가
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-gray-500">로딩 중...</div>
                        </div>
                    ) : (
                        <>
                            {/* 제작자 목록 */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순서</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {creators.map((creator) => (
                                            <tr key={creator.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{creator.displayOrder}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {creator.profileImage && (
                                                            <img
                                                                src={creator.profileImage}
                                                                alt={creator.name}
                                                                className="w-10 h-10 rounded-full mr-3"
                                                            />
                                                        )}
                                                        <div className="text-sm font-medium text-gray-900">{creator.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{creator.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{creator.role}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        creator.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {creator.isActive ? '활성' : '비활성'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(creator)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(creator.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        삭제
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 편집 모달 */}
                            {editingCreator && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                        <div className="p-6">
                                            <h2 className="text-2xl font-bold mb-6">
                                                {isCreateMode ? '새 제작자 추가' : '제작자 수정'}
                                            </h2>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                                                        <input
                                                            type="text"
                                                            value={editingCreator.name}
                                                            onChange={(e) => updateField('name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                                                        <input
                                                            type="email"
                                                            value={editingCreator.email}
                                                            onChange={(e) => updateField('email', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">역할 *</label>
                                                        <input
                                                            type="text"
                                                            value={editingCreator.role}
                                                            onChange={(e) => updateField('role', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">표시 순서 *</label>
                                                        <input
                                                            type="number"
                                                            value={editingCreator.displayOrder}
                                                            onChange={(e) => updateField('displayOrder', parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">프로필 이미지</label>
                                                    <div className="flex items-center space-x-4">
                                                        {/* 이미지 미리보기 */}
                                                        <div className="relative">
                                                            <img
                                                                src={
                                                                    getFileByUsage('profile_image')
                                                                        ? toCdnUrl(getFileByUsage('profile_image')!.key)
                                                                        : editingCreator.profileImage || '/images/blank_profile.jpg'
                                                                }
                                                                alt="프로필 이미지"
                                                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                                            />
                                                            {(editingCreator.profileImage || getFileByUsage('profile_image')) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        removeFile('profile_image');
                                                                        updateField('profileImage', '');
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                                                >
                                                                    ×
                                                                </button>
                                                            )}
                                                        </div>
                                                        {/* 업로드 버튼 */}
                                                        <div className="flex-1">
                                                            <label className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold">
                                                                이미지 선택
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
                                                                <span className="ml-3 text-sm text-gray-500">업로드 중...</span>
                                                            )}
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                JPG, PNG, GIF 형식 (최대 10MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">소개 *</label>
                                                    <textarea
                                                        value={editingCreator.bio}
                                                        onChange={(e) => updateField('bio', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">담당 업무</label>
                                                    {(editingCreator.responsibilities || []).map((responsibility, index) => (
                                                        <div key={index} className="flex gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                value={responsibility}
                                                                onChange={(e) => updateResponsibility(index, e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                placeholder="담당 업무 입력"
                                                            />
                                                            <button
                                                                onClick={() => removeResponsibility(index)}
                                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={addResponsibility}
                                                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                    >
                                                        + 담당 업무 추가
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                                                        <input
                                                            type="text"
                                                            value={editingCreator.github || ''}
                                                            onChange={(e) => updateField('github', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                                        <input
                                                            type="text"
                                                            value={editingCreator.linkedin || ''}
                                                            onChange={(e) => updateField('linkedin', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                                                        <input
                                                            type="text"
                                                            value={editingCreator.instagram || ''}
                                                            onChange={(e) => updateField('instagram', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                                                        <input
                                                            type="text"
                                                            value={editingCreator.twitter || ''}
                                                            onChange={(e) => updateField('twitter', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                                                    <input
                                                        type="text"
                                                        value={editingCreator.website || ''}
                                                        onChange={(e) => updateField('website', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={editingCreator.isActive}
                                                            onChange={(e) => updateField('isActive', e.target.checked)}
                                                            className="mr-2"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">활성화</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    저장
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
