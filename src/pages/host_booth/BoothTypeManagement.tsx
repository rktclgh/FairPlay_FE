import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { useParams, useNavigate } from "react-router-dom";
import { getBoothTypes, createBoothType, updateBoothType, deleteBoothType } from "../../api/boothApi";
import { BoothType } from "../../types/booth";


// 부스 타입 추가/수정 모달 컴포넌트
const AddBoothTypeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddBoothType: (boothType: BoothType) => Promise<void>;
    onUpdateBoothType?: (boothType: BoothType) => Promise<void>;
    editBoothType?: BoothType | null;
    isEditMode?: boolean;
    eventId: string;
}> = ({ isOpen, onClose, onAddBoothType, onUpdateBoothType, editBoothType, isEditMode = false, eventId }) => {
    const [formData, setFormData] = useState({
        boothTypeName: "",
        boothSizeWidth: "",
        boothSizeHeight: "",
        price: "",
        maxCapacity: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'maxCapacity') {
            // 최대 참가자는 숫자만 입력, 앞의 0 제거
            const numValue = parseInt(value) || 0;
            setFormData(prev => ({
                ...prev,
                [name]: numValue.toString()
            }));
        } else if (name === 'price') {
            // 비용은 숫자만 입력하고 자동으로 콤마 추가
            const numValue = value.replace(/[^\d]/g, '');
            if (numValue === '') {
                setFormData(prev => ({
                    ...prev,
                    [name]: ''
                }));
            } else {
                const formattedValue = parseInt(numValue).toLocaleString();
                setFormData(prev => ({
                    ...prev,
                    [name]: formattedValue
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // 수정 모드일 때 기존 데이터로 폼 초기화
    React.useEffect(() => {
        if (isEditMode && editBoothType) {
            setFormData({
                boothTypeName: editBoothType.name,
                boothSizeWidth: editBoothType.size.split("x")[0]?.toString() || "",
                boothSizeHeight: editBoothType.size.split("x")[1]?.toString() || "",
                price: editBoothType.price?.toString() || "",
                maxCapacity: editBoothType.maxApplicants?.toString() || ""
            });
        } else {
            // 추가 모드일 때 폼 초기화
            setFormData({
                boothTypeName: "",
                boothSizeWidth: "",
                boothSizeHeight: "",
                price: "",
                maxCapacity: ""
            });
        }
    }, [isEditMode, editBoothType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const boothTypeData: BoothType = {
                id: isEditMode && editBoothType ? editBoothType.id : 0,
                name: formData.boothTypeName,
                size: formData.boothSizeWidth + "x" + formData.boothSizeHeight || "",
                price: parseInt(formData.price.replace(/[^\d]/g, '')) || 0,
                maxApplicants: parseInt(formData.maxCapacity) || 0
            };

            if (isEditMode && onUpdateBoothType) {
                await onUpdateBoothType(boothTypeData);
                alert("부스 타입이 수정되었습니다.");
            } else {
                await onAddBoothType(boothTypeData);
                alert("부스 타입이 추가되었습니다.");
            }

            onClose();
        } catch (error) {
            console.error('부스 타입 저장 실패:', error);
            alert(isEditMode ? '부스 타입 수정에 실패했습니다.' : '부스 타입 추가에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-[10px] shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
                {/* 모달 헤더 */}
                <div className="flex items-center justify-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "부스 타입 수정" : "부스 타입 추가"}</h2>
                </div>

                {/* 모달 바디 */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* 부스 타입 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            부스 타입
                        </label>
                        <input
                            type="text"
                            name="boothTypeName"
                            value={formData.boothTypeName}
                            onChange={handleInputChange}
                            placeholder="부스 타입을 입력하세요"
                            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {/* 부스 크기 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            부스 크기
                        </label>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1">가로 (m)</label>
                                <input
                                    type="number"
                                    name="boothSizeWidth"
                                    value={formData.boothSizeWidth}
                                    onChange={handleInputChange}
                                    placeholder="가로"
                                    min="1"
                                    step="0.1"
                                    className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                            <div className="flex items-end text-gray-500 mb-1">x</div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1">세로 (m)</label>
                                <input
                                    type="number"
                                    name="boothSizeHeight"
                                    value={formData.boothSizeHeight}
                                    onChange={handleInputChange}
                                    placeholder="세로"
                                    min="1"
                                    step="0.1"
                                    className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* 비용 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            비용 (원)
                        </label>
                        <input
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="비용을 입력하세요 (예: 500000)"
                            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {/* 최대 참가자 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            최대 참가자
                        </label>
                        <input
                            type="text"
                            name="maxCapacity"
                            value={formData.maxCapacity}
                            onChange={handleInputChange}
                            placeholder="최대 참가자 수를 입력하세요"
                            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-[10px] text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none disabled:opacity-50"
                        >
                            {submitting ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const BoothTypeManagement = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { eventId } = useParams<{ eventId: string }>();
    console.log('All URL params:', params);
    console.log('Extracted eventId:', eventId);
    console.log('Current URL:', window.location.pathname);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editBoothType, setEditBoothType] = useState<BoothType | null>(null);
    const [boothTypes, setBoothTypes] = useState<BoothType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 백엔드에서 부스 타입 데이터 로드
    useEffect(() => {
        console.log('BoothTypeManagement - eventId:', eventId);
        
        // URL에서 eventId를 가져오거나 localStorage에서 현재 이벤트 ID 가져오기
        let currentEventId = eventId;
        if (!currentEventId) {
            const selectedEvent = localStorage.getItem('selectedEvent');
            if (selectedEvent) {
                try {
                    const eventData = JSON.parse(selectedEvent);
                    currentEventId = eventData.eventId?.toString();
                    console.log('BoothTypeManagement - using eventId from localStorage:', currentEventId);
                    
                    // eventId가 있으면 올바른 URL로 리다이렉트
                    if (currentEventId && window.location.pathname === '/host/booth-type') {
                        console.log('Redirecting to:', `/host/events/${currentEventId}/booth-types`);
                        navigate(`/host/events/${currentEventId}/booth-types`, { replace: true });
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing selectedEvent from localStorage:', e);
                }
            }
        }
        
        if (currentEventId) {
            loadBoothTypes(currentEventId);
        } else {
            console.log('BoothTypeManagement - eventId is missing from both URL and localStorage');
            setLoading(false);
            setError('이벤트 ID가 필요합니다. 호스트 대시보드에서 이벤트를 먼저 선택해주세요.');
        }
    }, [eventId, navigate]);

    const loadBoothTypes = async (currentEventId: string) => {
        if (!currentEventId) return;
        
        try {
            setLoading(true);
            console.log('loadBoothTypes - calling getBoothTypes with eventId:', parseInt(currentEventId));
            const data = await getBoothTypes(parseInt(currentEventId));
            console.log('loadBoothTypes - received data:', data);
            setBoothTypes(data);
        } catch (err) {
            console.error('loadBoothTypes - error:', err);
            setError('부스 타입 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 편집 모달 열기
    const openEditModal = (boothType: BoothType) => {
        setEditBoothType(boothType);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    // 편집 모달 닫기
    const closeEditModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditBoothType(null);
    };

    // 부스 타입 추가
    const handleAddBoothType = async (boothType: BoothType) => {
        if (!eventId) return;
        
        await createBoothType(parseInt(eventId), boothType);
        await loadBoothTypes(); // 목록 새로고침
    };

    // 부스 타입 수정
    const handleUpdateBoothType = async (boothType: BoothType) => {
        if (!eventId) return;
        
        await updateBoothType(parseInt(eventId), boothType.id, boothType);
        await loadBoothTypes(); // 목록 새로고침
    };

    // 삭제 핸들러
    const handleDelete = async (boothTypeId: number) => {
        if (!eventId) return;
        
        if (window.confirm("정말로 이 부스 타입을 삭제하시겠습니까?")) {
            try {
                await deleteBoothType(parseInt(eventId), boothTypeId);
                await loadBoothTypes(); // 목록 새로고침
                alert("부스 타입이 삭제되었습니다.");
            } catch (error) {
                console.error('부스 타입 삭제 실패:', error);
                alert('부스 타입 삭제에 실패했습니다.');
            }
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 타입 관리
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {loading ? (
                        <div className="text-center py-12">로딩 중...</div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-600">{error}</div>
                    ) : (
                        <>
                        {/* 검색 및 필터 섹션 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                {/* 검색 영역 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">부스 타입 검색</label>
                                    <input
                                        type="text"
                                        placeholder="부스 타입을 입력하세요"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-72 h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* 부스 타입 추가 버튼 */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2 opacity-0">부스 타입 추가</label>
                                <button
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setEditBoothType(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="h-11 px-6 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-[10px] text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:bg-white/90 flex items-center gap-2 focus:outline-none"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    부스 타입 추가
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 테이블 컨테이너 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-5 gap-2 text-sm font-bold text-gray-700">
                                <div className="text-left">부스 타입</div>
                                <div className="text-center">부스 크기</div>
                                <div className="text-center">비용</div>
                                <div className="text-center">최대 참가자</div>
                                <div className="text-center">관리</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div className="bg-white">
                            {boothTypes.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">등록된 부스 타입이 없습니다.</div>
                            ) : (
                                boothTypes
                                    .filter(boothType => {
                                        // 검색어 필터링
                                        const searchMatch = !searchTerm || boothType.name.toLowerCase().includes(searchTerm.toLowerCase());
                                        return searchMatch;
                                    })
                                    .map((boothType, index) => (
                                        <div
                                            key={boothType.id}
                                            className={`grid grid-cols-5 gap-2 py-5 px-6 text-sm items-center ${index !== boothTypes.length - 1 ? "border-b border-gray-200" : ""}`}
                                        >
                                            <div className="font-medium text-gray-900 text-left truncate">{boothType.name}</div>
                                            <div className="text-gray-600 text-center">{boothType.size.split("x")[0]}m x {boothType.size.split("x")[1]}m</div>
                                            <div className="font-bold text-gray-900 text-center">{boothType.price?.toLocaleString()}원</div>
                                            <div className="text-center text-gray-600">{boothType.maxApplicants}명</div>
                                            <div className="text-center flex justify-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(boothType)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(boothType.id)}
                                                    className="text-red-600 hover:text-red-800 font-medium transition-colors text-xs"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>

                    {/* 하단 정보 */}
                    <div className="mt-6 text-sm text-gray-600">
                        총 <span className="font-bold text-black">
                            {boothTypes.filter(boothType => {
                                const searchMatch = !searchTerm || boothType.name.toLowerCase().includes(searchTerm.toLowerCase());
                                return searchMatch;
                            }).length}
                        </span>개의 부스 타입
                    </div>
                        </>
                    )}
                </div>
            </div>

            {/* 부스 타입 추가/수정 모달 */}
            {eventId && (
                <AddBoothTypeModal
                    isOpen={isModalOpen}
                    onClose={closeEditModal}
                    onAddBoothType={handleAddBoothType}
                    onUpdateBoothType={handleUpdateBoothType}
                    editBoothType={editBoothType}
                    isEditMode={isEditMode}
                    eventId={eventId}
                />
            )}
        </div>
    );
};
