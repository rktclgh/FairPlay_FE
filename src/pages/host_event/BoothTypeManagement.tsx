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
            boothSize: "4m x 4m",
            boothCost: "800,000원",
            maxParticipants: 15
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoothType, setNewBoothType] = useState({
        boothType: "",
        boothSize: "",
        boothCost: "",
        maxParticipants: ""
    });

    const handleAddBoothType = () => {
        if (!newBoothType.boothType || !newBoothType.boothSize || !newBoothType.boothCost || !newBoothType.maxParticipants) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        const boothType: BoothType = {
            id: boothTypes.length + 1,
            boothType: newBoothType.boothType,
            boothSize: newBoothType.boothSize,
            boothCost: newBoothType.boothCost,
            maxParticipants: parseInt(newBoothType.maxParticipants)
        };

        setBoothTypes([...boothTypes, boothType]);
        setNewBoothType({
            boothType: "",
            boothSize: "",
            boothCost: "",
            maxParticipants: ""
        });
        setIsModalOpen(false);
    };

    const handleDeleteBoothType = (id: number) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            setBoothTypes(boothTypes.filter(booth => booth.id !== id));
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
                    {/* 헤더 */}
                    <div className="flex justify-end items-center mb-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-2 opacity-0">부스 타입 등록</label>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="h-11 px-6 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-[10px] text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:bg-white/90 flex items-center gap-2 focus:outline-none"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                부스 타입 등록
                            </button>
                        </div>
                    </div>

                    {/* 부스 타입 리스트 */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            부스 타입
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            부스 크기
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            부스 비용
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            최대 인원 수
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            관리
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {boothTypes.map((booth) => (
                                        <tr key={booth.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {booth.boothType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booth.boothSize}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booth.boothCost}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booth.maxParticipants}명
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleDeleteBoothType(booth.id)}
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
                    </div>
                </div>
            </div>

            {/* 부스 타입 등록 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-[10px] shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
                        {/* 모달 헤더 */}
                        <div className="flex items-center justify-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">부스 타입 등록</h2>
                        </div>

                        {/* 모달 바디 */}
                        <form onSubmit={(e) => { e.preventDefault(); handleAddBoothType(); }} className="p-6 space-y-6">
                            {/* 부스 타입 */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    부스 타입
                                </label>
                                <input
                                    type="text"
                                    value={newBoothType.boothType}
                                    onChange={(e) => setNewBoothType({...newBoothType, boothType: e.target.value})}
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
                                <input
                                    type="text"
                                    value={newBoothType.boothSize}
                                    onChange={(e) => setNewBoothType({...newBoothType, boothSize: e.target.value})}
                                    placeholder="예: 3m x 3m"
                                    className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* 부스 비용 */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    부스 비용
                                </label>
                                <input
                                    type="text"
                                    value={newBoothType.boothCost}
                                    onChange={(e) => setNewBoothType({...newBoothType, boothCost: e.target.value})}
                                    placeholder="예: 500,000원"
                                    className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* 최대 인원 수 */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    최대 인원 수
                                </label>
                                <input
                                    type="number"
                                    value={newBoothType.maxParticipants}
                                    onChange={(e) => setNewBoothType({...newBoothType, maxParticipants: e.target.value})}
                                    placeholder="예: 10"
                                    className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* 버튼 영역 */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-[10px] text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 border border-transparent rounded-[10px] text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    등록
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
