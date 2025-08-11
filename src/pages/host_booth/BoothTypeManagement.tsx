import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";

interface BoothType {
    id: number;
    boothType: string;
    boothSize: string;
    boothCost: string;
    maxParticipants: number;
}

// 부스 타입 추가/수정 모달 컴포넌트
const AddBoothTypeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddBoothType: (boothType: BoothType) => void;
    onUpdateBoothType?: (boothType: BoothType) => void;
    editBoothType?: BoothType | null;
    isEditMode?: boolean;
}> = ({ isOpen, onClose, onAddBoothType, onUpdateBoothType, editBoothType, isEditMode = false }) => {
    const [formData, setFormData] = useState({
        boothType: "",
        boothSizeWidth: "",
        boothSizeHeight: "",
        boothCost: "",
        maxParticipants: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'maxParticipants') {
            // 최대 참가자는 숫자만 입력, 앞의 0 제거
            const numValue = parseInt(value) || 0;
            setFormData(prev => ({
                ...prev,
                [name]: numValue
            }));
        } else if (name === 'boothCost') {
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
            // "3m x 3m" 형태에서 가로와 세로 추출
            const sizeMatch = editBoothType.boothSize.match(/(\d+(?:\.\d+)?)m\s*x\s*(\d+(?:\.\d+)?)m/);
            if (sizeMatch) {
                setFormData({
                    boothType: editBoothType.boothType,
                    boothSizeWidth: sizeMatch[1],
                    boothSizeHeight: sizeMatch[2],
                    boothCost: editBoothType.boothCost,
                    maxParticipants: editBoothType.maxParticipants
                });
            } else {
                setFormData({
                    boothType: editBoothType.boothType,
                    boothSizeWidth: "",
                    boothSizeHeight: "",
                    boothCost: editBoothType.boothCost,
                    maxParticipants: editBoothType.maxParticipants
                });
            }
        } else {
            // 추가 모드일 때 폼 초기화
            setFormData({
                boothType: "",
                boothSizeWidth: "",
                boothSizeHeight: "",
                boothCost: "",
                maxParticipants: ""
            });
        }
    }, [isEditMode, editBoothType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(isEditMode ? "부스 타입 수정:" : "새 부스 타입 추가:", formData);

        const boothTypeData: BoothType = {
            id: isEditMode && editBoothType ? editBoothType.id : Date.now(),
            boothType: formData.boothType,
            boothSize: `${formData.boothSizeWidth}m x ${formData.boothSizeHeight}m`,
            boothCost: formData.boothCost,
            maxParticipants: parseInt(formData.maxParticipants) || 0
        };

        if (isEditMode && onUpdateBoothType) {
            onUpdateBoothType(boothTypeData);
            alert("부스 타입이 수정되었습니다.");
        } else {
            onAddBoothType(boothTypeData);
            alert("부스 타입이 추가되었습니다.");
        }

        onClose();
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
                            name="boothType"
                            value={formData.boothType}
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
                            name="boothCost"
                            value={formData.boothCost}
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
                            name="maxParticipants"
                            value={formData.maxParticipants}
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
                            className="px-6 py-2 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const BoothTypeManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editBoothType, setEditBoothType] = useState<BoothType | null>(null);
    const [boothTypes, setBoothTypes] = useState<BoothType[]>([
        {
            id: 1,
            boothType: "스탠다드 부스",
            boothSize: "3m x 3m",
            boothCost: "500,000",
            maxParticipants: 10
        },
        {
            id: 2,
            boothType: "프리미엄 부스",
            boothSize: "6m x 6m",
            boothCost: "1,200,000",
            maxParticipants: 25
        },
        {
            id: 3,
            boothType: "VIP 부스",
            boothSize: "9m x 9m",
            boothCost: "2,500,000",
            maxParticipants: 50
        }
    ]);

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

    // 삭제 핸들러
    const handleDelete = (id: number) => {
        if (window.confirm("정말로 이 부스 타입을 삭제하시겠습니까?")) {
            setBoothTypes(prev => prev.filter(type => type.id !== id));
            alert("부스 타입이 삭제되었습니다.");
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
                            {boothTypes
                                .filter(boothType => {
                                    // 검색어 필터링
                                    const searchMatch = !searchTerm || boothType.boothType.toLowerCase().includes(searchTerm.toLowerCase());
                                    return searchMatch;
                                })
                                .map((boothType, index) => (
                                    <div
                                        key={boothType.id}
                                        className={`grid grid-cols-5 gap-2 py-5 px-6 text-sm items-center ${index !== boothTypes.length - 1 ? "border-b border-gray-200" : ""}`}
                                    >
                                        <div className="font-medium text-gray-900 text-left truncate">{boothType.boothType}</div>
                                        <div className="text-gray-600 text-center">{boothType.boothSize}</div>
                                                                                 <div className="font-bold text-gray-900 text-center">{boothType.boothCost}원</div>
                                        <div className="text-center text-gray-600">{boothType.maxParticipants}명</div>
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
                                ))}
                        </div>
                    </div>

                    {/* 하단 정보 */}
                    <div className="mt-6 text-sm text-gray-600">
                        총 <span className="font-bold text-black">
                            {boothTypes.filter(boothType => {
                                const searchMatch = !searchTerm || boothType.boothType.toLowerCase().includes(searchTerm.toLowerCase());
                                return searchMatch;
                            }).length}
                        </span>개의 부스 타입
                    </div>
                </div>
            </div>

            {/* 부스 타입 추가/수정 모달 */}
            <AddBoothTypeModal
                isOpen={isModalOpen}
                onClose={closeEditModal}
                onAddBoothType={(newBoothType) => {
                    setBoothTypes(prev => [...prev, newBoothType]);
                }}
                onUpdateBoothType={(updatedBoothType) => {
                    setBoothTypes(prev => prev.map(boothType =>
                        boothType.id === updatedBoothType.id ? updatedBoothType : boothType
                    ));
                }}
                editBoothType={editBoothType}
                isEditMode={isEditMode}
            />
        </div>
    );
};
