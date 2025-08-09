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

export const BoothTypeManagement = () => {
    const [boothTypes, setBoothTypes] = useState<BoothType[]>([
        {
            id: 1,
            boothType: "스탠다드 부스",
            boothSize: "3m x 3m",
            boothCost: "500,000원",
            maxParticipants: 10
        },
        {
            id: 2,
            boothType: "프리미엄 부스",
            boothSize: "6m x 6m",
            boothCost: "1,200,000원",
            maxParticipants: 25
        },
        {
            id: 3,
            boothType: "VIP 부스",
            boothSize: "9m x 9m",
            boothCost: "2,500,000원",
            maxParticipants: 50
        }
    ]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBoothType, setEditingBoothType] = useState<BoothType | null>(null);
    const [formData, setFormData] = useState({
        boothType: "",
        boothSize: "",
        boothCost: "",
        maxParticipants: 0
    });

    // 편집 모달 열기
    const openEditModal = (boothType: BoothType) => {
        setEditingBoothType(boothType);
        setFormData({
            boothType: boothType.boothType,
            boothSize: boothType.boothSize,
            boothCost: boothType.boothCost,
            maxParticipants: boothType.maxParticipants
        });
        setIsEditModalOpen(true);
    };

    // 편집 모달 닫기
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingBoothType(null);
        setFormData({
            boothType: "",
            boothSize: "",
            boothCost: "",
            maxParticipants: 0
        });
    };

    // 폼 데이터 변경 핸들러
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'maxParticipants' ? parseInt(value) || 0 : value
        }));
    };

    // 저장 핸들러
    const handleSave = () => {
        if (editingBoothType) {
            setBoothTypes(prev => prev.map(type => 
                type.id === editingBoothType.id 
                    ? { ...type, ...formData }
                    : type
            ));
            alert("부스 타입이 수정되었습니다.");
        }
        closeEditModal();
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
            <div className="bg-white w-[1256px] h-[1407px] relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 타입 관리
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px]">
                    
                    {/* 부스 타입 목록 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b">
                            <div className="grid grid-cols-6 gap-4 p-4 items-center">
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm">부스 타입</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm">부스 크기</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm">비용</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm">최대 참가자</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center" colSpan={2}>관리</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {boothTypes.map((boothType) => (
                                <div key={boothType.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <div className="grid grid-cols-6 gap-4 p-4 items-center">
                                        <div className="text-gray-900 text-sm">{boothType.boothType}</div>
                                        <div className="text-gray-900 text-sm">{boothType.boothSize}</div>
                                        <div className="text-gray-900 text-sm">{boothType.boothCost}</div>
                                        <div className="text-gray-900 text-sm">{boothType.maxParticipants}명</div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(boothType)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(boothType.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 편집 모달 */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-96">
                            <h3 className="text-lg font-bold mb-4">부스 타입 수정</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">부스 타입</label>
                                    <input
                                        type="text"
                                        name="boothType"
                                        value={formData.boothType}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">부스 크기</label>
                                    <input
                                        type="text"
                                        name="boothSize"
                                        value={formData.boothSize}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">비용</label>
                                    <input
                                        type="text"
                                        name="boothCost"
                                        value={formData.boothCost}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">최대 참가자</label>
                                    <input
                                        type="number"
                                        name="maxParticipants"
                                        value={formData.maxParticipants}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
