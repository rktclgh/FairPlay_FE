import { useState, useEffect, useRef } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { useParams, useNavigate } from "react-router-dom";
import { getBoothDetails, updateBooth, deleteBooth, updateBoothAdminInfo } from "../../api/boothApi";
import type {BoothDetailResponse, BoothUpdateRequest, BoothAdminRequest} from "../../types/booth";
import { useFileUpload } from "../../hooks/useFileUpload";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const BoothParticipantDetail = () => {
    const { eventId, id } = useParams<{ eventId: string; id: string }>();
    const boothId = id;
    const navigate = useNavigate();
    
    // 파일 업로드 훅
    const { uploadFile } = useFileUpload();
    
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

    // 상태 관리
    const [detail, setDetail] = useState<BoothDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [editingLocation, setEditingLocation] = useState(false);
    const [updating, setUpdating] = useState(false);

    // 편집 폼 데이터
    const [editData, setEditData] = useState<BoothUpdateRequest>({});
    const [adminData, setAdminData] = useState<BoothAdminRequest>({
        name: '',
        email: '',
        phone: ''
    });
    const [locationData, setLocationData] = useState('');

    // 백엔드에서 데이터 로드
    useEffect(() => {
        if (eventId && boothId) {
            setLoading(true);
            getBoothDetails(Number(eventId), Number(boothId))
                .then(data => {
                    console.log(data);
                    setDetail(data);
                    setEditData({
                        boothTitle: data.boothTitle,
                        boothDescription: data.boothDescription,
                        startDate: data.startDate,
                        endDate: data.endDate,
                        location: data.location,
                        boothExternalLinks: data.boothExternalLinks
                    });
                    setAdminData({
                        name: data.managerName,
                        email: data.contactEmail,
                        phone: data.contactNumber
                    });
                    setLocationData(data.location || '');
                    setLoading(false);
                })
                .catch(err => {
                    setError('부스 상세 정보를 불러오는 데 실패했습니다.');
                    setLoading(false);
                    console.error(err);
                });
        }
    }, [eventId, boothId]);

    // 부스 정보 업데이트
    const handleUpdateBooth = async () => {
        if (!eventId || !boothId || !detail) return;

        setUpdating(true);
        try {
            const updatedBooth = await updateBooth(Number(eventId), Number(boothId), editData);
            setDetail(updatedBooth);
            setEditing(false);
            alert('부스 정보가 성공적으로 업데이트되었습니다.');
        } catch (err) {
            console.error(err);
            alert('부스 정보 업데이트에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 관리자 정보 업데이트
    const handleUpdateAdmin = async () => {
        if (!eventId || !boothId) return;

        setUpdating(true);
        try {
            await updateBoothAdminInfo(Number(eventId), Number(boothId), adminData);

            // 업데이트된 정보로 상세 정보 다시 로드
            const updatedDetail = await getBoothDetails(Number(eventId), Number(boothId));
            setDetail(updatedDetail);

            alert('관리자 정보가 성공적으로 업데이트되었습니다.');
        } catch (err) {
            console.error(err);
            alert('관리자 정보 업데이트에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 부스 위치 업데이트
    const handleUpdateLocation = async () => {
        if (!eventId || !boothId) return;

        setUpdating(true);
        try {
            const locationUpdateData = {
                location: locationData
            };
            
            const updatedBooth = await updateBooth(Number(eventId), Number(boothId), locationUpdateData);
            setDetail(updatedBooth);
            setEditingLocation(false);
            alert('부스 위치가 성공적으로 업데이트되었습니다.');
        } catch (err) {
            console.error(err);
            alert('부스 위치 업데이트에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    // 부스 삭제
    const handleDeleteBooth = async () => {
        if (!eventId || !boothId) return;

        if (!confirm('정말로 이 부스를 삭제하시겠습니까?')) return;

        setUpdating(true);
        try {
            await deleteBooth(Number(eventId), Number(boothId));
            alert('부스가 성공적으로 삭제되었습니다.');
            navigate(`/host/events/${eventId}/booth-participants`);
        } catch (err) {
            console.error(err);
            alert('부스 삭제에 실패했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    const handleBackToList = () => navigate(`/host/events/${eventId}/booth-participants`);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-auto relative min-h-screen">
                <TopNav />

                {/* 페이지 제목: 부스명 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    {loading ? '로딩 중...' : error ? '오류 발생' : detail?.boothTitle || '부스 정보 없음'}
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="ml-64 mt-[195px] w-[949px] pb-24">
                    {loading ? (
                        <div className="text-center py-12">로딩 중...</div>
                    ) : error || !detail ? (
                        <div className="text-center py-12">
                            <div className="text-red-600 mb-4">{error || '부스 정보를 찾을 수 없습니다.'}</div>
                            <button
                                onClick={handleBackToList}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                목록으로 돌아가기
                            </button>
                        </div>
                    ) : (
                    <div className="bg-white">
                        {/* 기본 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">기본 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">참가 일정 시작일</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            {editing ? (
                                                <input
                                                    type="date"
                                                    value={editData.startDate || ''}
                                                    onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                                                    className="w-full bg-transparent outline-none"
                                                />
                                            ) : (
                                                <span>{detail.startDate}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">참가 일정 종료일</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            {editing ? (
                                                <input
                                                    type="date"
                                                    value={editData.endDate || ''}
                                                    onChange={(e) => setEditData({...editData, endDate: e.target.value})}
                                                    className="w-full bg-transparent outline-none"
                                                />
                                            ) : (
                                                <span>{detail.endDate}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">부스 타입</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{detail.boothTypeName}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">부스 대표자명</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <input
                                                type="text"
                                                value={adminData.name}
                                                onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                                                className="w-full bg-transparent outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 이메일</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <input
                                                type="email"
                                                value={adminData.email}
                                                onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                                                className="w-full bg-transparent outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 연락처</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <input
                                                type="tel"
                                                value={adminData.phone}
                                                onChange={(e) => setAdminData({...adminData, phone: e.target.value})}
                                                className="w-full bg-transparent outline-none"
                                            />
                                        </div>
                                    </div>
                                    {/* 대표 사이트/SNS */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-3">대표 사이트/SNS</label>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">외부 링크</label>
                                                <div className={`w-full min-h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                                    {editing ? (
                                                        <div className="space-y-2">
                                                            {(editData.boothExternalLinks || []).map((link, index) => (
                                                                <div key={index} className="flex gap-2 items-center">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="링크 이름"
                                                                        value={link.displayText}
                                                                        onChange={(e) => {
                                                                            const updatedLinks = [...(editData.boothExternalLinks || [])];
                                                                            updatedLinks[index] = {...updatedLinks[index], displayText: e.target.value};
                                                                            setEditData({...editData, boothExternalLinks: updatedLinks});
                                                                        }}
                                                                        className="p-2 border border-gray-300 rounded text-sm"
                                                                        style={{ flex: '3' }}
                                                                    />
                                                                    <input
                                                                        type="url"
                                                                        placeholder="https://..."
                                                                        value={link.url}
                                                                        onChange={(e) => {
                                                                            const updatedLinks = [...(editData.boothExternalLinks || [])];
                                                                            updatedLinks[index] = {...updatedLinks[index], url: e.target.value};
                                                                            setEditData({...editData, boothExternalLinks: updatedLinks});
                                                                        }}
                                                                        className="p-2 border border-gray-300 rounded text-sm"
                                                                        style={{ flex: '5' }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updatedLinks = (editData.boothExternalLinks || []).filter((_, i) => i !== index);
                                                                            setEditData({...editData, boothExternalLinks: updatedLinks});
                                                                        }}
                                                                        className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                                                                    >
                                                                        삭제
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedLinks = [...(editData.boothExternalLinks || []), {displayText: '', url: ''}];
                                                                    setEditData({...editData, boothExternalLinks: updatedLinks});
                                                                }}
                                                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                                            >
                                                                링크 추가
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        detail.boothExternalLinks && detail.boothExternalLinks.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {detail.boothExternalLinks.map((link, index) => (
                                                                    <div key={index} className="flex items-center space-x-2">
                                                                        <span className="text-gray-700">{link.displayText}:</span>
                                                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                                            {link.url}
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[#0000004c]">등록된 외부 링크가 없습니다</span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 부스 위치 관리 - 행사 관리자 전용 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left">
                                        부스 위치 관리
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            행사 관리자 전용
                                        </span>
                                    </h2>
                                    <div className="space-x-2">
                                        {!editingLocation ? (
                                            <button
                                                onClick={() => setEditingLocation(true)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                            >
                                                위치 수정
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleUpdateLocation}
                                                    disabled={updating}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                                                >
                                                    {updating ? '저장 중...' : '저장'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingLocation(false);
                                                        setLocationData(detail?.location || '');
                                                    }}
                                                    disabled={updating}
                                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
                                                >
                                                    취소
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">
                                            부스 배치 위치
                                        </label>
                                        {editingLocation ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={locationData}
                                                    onChange={(e) => setLocationData(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                                    placeholder="부스 위치를 입력하세요 (예: A-01, B구역 3번, 메인홀 좌측 등)"
                                                />
                                                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                                    <p className="font-medium text-blue-800 mb-1">위치 입력 가이드:</p>
                                                    <ul className="text-blue-700 space-y-1">
                                                        <li>• 구역별 번호: A-01, B-03, C-15</li>
                                                        <li>• 구역명 + 위치: 메인홀 좌측, 야외부스 2번</li>
                                                        <li>• 층수 포함: 2층 A구역 5번</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-1">
                                                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base font-medium text-gray-900">
                                                        {detail?.location || '위치가 설정되지 않았습니다'}
                                                    </div>
                                                </div>
                                                {detail?.location && (
                                                    <div className="flex items-center text-green-600">
                                                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-sm font-medium">설정됨</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {!detail?.location && !editingLocation && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <p className="text-yellow-800 font-medium">부스 위치가 설정되지 않았습니다</p>
                                                    <p className="text-yellow-700 text-sm">참가자가 부스를 찾을 수 있도록 위치를 설정해주세요.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 부스 소개 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">부스 소개</h2>
                                {editing ? (
                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                                            value={editData.boothDescription || ''}
                                            onChange={(value) => setEditData({...editData, boothDescription: value})}
                                            placeholder="부스 소개를 입력하세요"
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
                                ) : (
                                    <div 
                                        className="w-full min-h-[150px] border-0 border-b border-[#0000001a] pl-0 pb-4 font-normal text-base bg-transparent outline-none text-left text-black font-medium leading-relaxed prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: detail.boothDescription || '부스 소개가 없습니다.' }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* 부스 배너 이미지 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">부스 배너 이미지</h2>
                                {detail.boothBannerUrl ? (
                                    <div className="w-[240px] aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                        <img src={detail.boothBannerUrl} alt="부스 배너" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm">등록된 배너 이미지가 없습니다.</div>
                                )}
                            </div>
                        </div>

                        {/* 버튼 섹션 */}
                        <div className="flex justify-center gap-3 mt-8">
                            <button onClick={handleBackToList} className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-gray-500 text-white hover:bg-gray-600">목록으로 돌아가기</button>
                            <button onClick={() => setIsDeleteOpen(true)} className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-red-600 text-white hover:bg-red-700">삭제</button>
                        </div>
                    </div>
                    )}

                    {isDeleteOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
                            <div className="bg-white rounded-[10px] shadow-xl w-[520px] max-w-[90%] p-6">
                                <h3 className="text-lg font-semibold mb-3">삭제 확인</h3>
                                <div className="text-sm text-gray-700 space-y-2 mb-6">
                                    <p>삭제 시 일반 사용자에게는 해당 부스가 표시되지 않습니다.</p>
                                    <p>부스 관리자는 권한을 잃게 됩니다.</p>
                                    <p>관리자 페이지에서는 계속 표시됩니다.</p>
                                    <p className="font-medium">정말 삭제하시겠습니까?</p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setIsDeleteOpen(false)}
                                        className="px-4 py-2 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleDeleteBooth}
                                        disabled={updating}
                                        className="px-4 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {updating ? '삭제 중...' : '삭제'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="h-32 md:h-48" />
            </div>
        </div>
    );
};

export default BoothParticipantDetail;


