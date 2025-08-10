import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";

// 티켓 추가/수정 모달 컴포넌트
const AddTicketModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddTicket: (ticket: any) => void;
    onUpdateTicket?: (ticket: any) => void;
    editTicket?: any;
    isEditMode?: boolean;
}> = ({ isOpen, onClose, onAddTicket, onUpdateTicket, editTicket, isEditMode = false }) => {
    const [formData, setFormData] = useState({
        ticketName: "",
        seatGrade: "",
        ticketType: "",
        price: "",
        status: "",
        limit: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 수정 모드일 때 기존 데이터로 폼 초기화
    React.useEffect(() => {
        if (isEditMode && editTicket) {
            setFormData({
                ticketName: editTicket.name,
                seatGrade: editTicket.seatGrade,
                ticketType: editTicket.type,
                price: editTicket.price.replace(/[^0-9]/g, ''), // "원" 제거
                status: editTicket.status,
                limit: editTicket.limit.replace(/[^0-9]/g, '') // "매" 제거
            });
        } else {
            // 추가 모드일 때 폼 초기화
            setFormData({
                ticketName: "",
                seatGrade: "",
                ticketType: "",
                price: "",
                status: "",
                limit: ""
            });
        }
    }, [isEditMode, editTicket]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(isEditMode ? "티켓 수정:" : "새 티켓 추가:", formData);

        const ticketData = {
            id: isEditMode ? editTicket.id : Date.now(),
            name: formData.ticketName,
            seatGrade: formData.seatGrade,
            type: formData.ticketType,
            price: `${Number(formData.price).toLocaleString()}원`,
            limit: `${formData.limit}매`,
            status: formData.status,
            statusColor: formData.status === "판매중" ? "bg-green-100" : formData.status === "판매 종료" ? "bg-red-100" : "bg-yellow-100",
            textColor: formData.status === "판매중" ? "text-green-800" : formData.status === "판매 종료" ? "text-red-800" : "text-yellow-800"
        };

        if (isEditMode && onUpdateTicket) {
            onUpdateTicket(ticketData);
            alert("티켓이 수정되었습니다.");
        } else {
            onAddTicket(ticketData);
            alert("티켓이 추가되었습니다.");
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-[10px] shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
                {/* 모달 헤더 */}
                <div className="flex items-center justify-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "티켓 수정" : "티켓 추가"}</h2>
                </div>

                {/* 모달 바디 */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* 티켓명 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            티켓명
                        </label>
                        <input
                            type="text"
                            name="ticketName"
                            value={formData.ticketName}
                            onChange={handleInputChange}
                            placeholder="티켓명을 입력하세요"
                            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {/* 좌석 등급 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            좌석 등급
                        </label>
                        <div className="relative">
                            <select
                                name="seatGrade"
                                value={formData.seatGrade}
                                onChange={handleInputChange}
                                className="w-full h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">좌석 등급을 선택하세요</option>
                                <option value="VIP석">VIP석</option>
                                <option value="A석">A석</option>
                                <option value="B석">B석</option>
                                <option value="C석">C석</option>
                                <option value="S석">S석</option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 티켓 유형 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            티켓 유형
                        </label>
                        <div className="relative">
                            <select
                                name="ticketType"
                                value={formData.ticketType}
                                onChange={handleInputChange}
                                className="w-full h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">티켓 유형을 선택하세요</option>
                                <option value="성인">성인</option>
                                <option value="청소년">청소년</option>
                                <option value="어린이">어린이</option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 가격 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            가격
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="가격을 입력하세요"
                            min="0"
                            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {/* 상태 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            상태
                        </label>
                        <div className="relative">
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">상태를 선택하세요</option>
                                <option value="판매중">판매중</option>
                                <option value="판매 종료">판매 종료</option>
                                <option value="판매 예정">판매 예정</option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 1인 제한 수량 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            1인 제한 수량
                        </label>
                        <input
                            type="number"
                            name="limit"
                            value={formData.limit}
                            onChange={handleInputChange}
                            placeholder="제한 수량을 입력하세요"
                            min="1"
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

export const TicketManagement = () => {
    const [selectedTicketType, setSelectedTicketType] = useState("전체");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTicket, setEditTicket] = useState(null);
    const [ticketData, setTicketData] = useState([
        {
            id: 1,
            name: "VIP 티켓",
            seatGrade: "VIP석",
            type: "성인",
            price: "150,000원",
            limit: "2매",
            status: "판매중",
            statusColor: "bg-green-100",
            textColor: "text-green-800"
        },
        {
            id: 2,
            name: "얼리버드 티켓",
            seatGrade: "A석",
            type: "청소년",
            price: "80,000원",
            limit: "4매",
            status: "판매중",
            statusColor: "bg-green-100",
            textColor: "text-green-800"
        },
        {
            id: 3,
            name: "일반 티켓",
            seatGrade: "B석",
            type: "어린이",
            price: "100,000원",
            limit: "6매",
            status: "판매 종료",
            statusColor: "bg-red-100",
            textColor: "text-red-800"
        }
    ]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case "성인":
                return "bg-red-100 text-red-800";
            case "청소년":
                return "bg-blue-100 text-blue-800";
            case "어린이":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    티켓 관리
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 검색 및 필터 섹션 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                {/* 티켓 유형 필터 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">티켓 유형</label>
                                    <div className="relative">
                                        <select
                                            value={selectedTicketType}
                                            onChange={(e) => setSelectedTicketType(e.target.value)}
                                            className="w-48 h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="전체">전체</option>
                                            <option value="성인">성인</option>
                                            <option value="청소년">청소년</option>
                                            <option value="어린이">어린이</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* 검색 영역 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">티켓명 검색</label>
                                    <input
                                        type="text"
                                        placeholder="티켓명을 입력하세요"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-72 h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* 티켓 추가 버튼 */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2 opacity-0">티켓 추가</label>
                                <button
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setEditTicket(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="h-11 px-6 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-[10px] text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:bg-white/90 flex items-center gap-2 focus:outline-none"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    티켓 추가
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 테이블 컨테이너 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-7 gap-2 text-sm font-bold text-gray-700">
                                <div className="text-left">티켓명</div>
                                <div className="text-center">좌석 등급</div>
                                <div className="text-center">티켓 유형</div>
                                <div className="text-center">가격</div>
                                <div className="text-center">1인 제한 수량</div>
                                <div className="text-center">판매 상태</div>
                                <div className="text-center">관리</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div className="bg-white">
                            {ticketData
                                .filter(ticket => {
                                    // 티켓 유형 필터링
                                    const typeMatch = selectedTicketType === "전체" || ticket.type === selectedTicketType;
                                    // 검색어 필터링
                                    const searchMatch = !searchTerm || ticket.name.toLowerCase().includes(searchTerm.toLowerCase());
                                    return typeMatch && searchMatch;
                                })
                                .map((ticket, index) => (
                                    <div
                                        key={ticket.id}
                                        className={`grid grid-cols-7 gap-2 py-5 px-6 text-sm items-center ${index !== ticketData.length - 1 ? "border-b border-gray-200" : ""
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900 text-left truncate">{ticket.name}</div>
                                        <div className="text-gray-600 text-center">{ticket.seatGrade}</div>
                                        <div className="text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(ticket.type)}`}>
                                                {ticket.type}
                                            </span>
                                        </div>
                                        <div className="font-bold text-gray-900 text-center">{ticket.price}</div>
                                        <div className="text-center text-gray-600">{ticket.limit}</div>
                                        <div className="text-center">
                                            <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${ticket.statusColor} ${ticket.textColor}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <div className="text-center flex justify-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditTicket(ticket);
                                                    setIsEditMode(true);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`"${ticket.name}" 티켓을 삭제하시겠습니까?`)) {
                                                        setTicketData(prev => prev.filter(t => t.id !== ticket.id));
                                                    }
                                                }}
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
                            {ticketData.filter(ticket => {
                                const typeMatch = selectedTicketType === "전체" || ticket.type === selectedTicketType;
                                const searchMatch = !searchTerm || ticket.name.toLowerCase().includes(searchTerm.toLowerCase());
                                return typeMatch && searchMatch;
                            }).length}
                        </span>개의 티켓
                    </div>
                </div>
            </div>

            {/* 티켓 추가/수정 모달 */}
            <AddTicketModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditTicket(null);
                }}
                onAddTicket={(newTicket) => {
                    setTicketData(prev => [...prev, newTicket]);
                }}
                onUpdateTicket={(updatedTicket) => {
                    setTicketData(prev => prev.map(ticket =>
                        ticket.id === updatedTicket.id ? updatedTicket : ticket
                    ));
                }}
                editTicket={editTicket}
                isEditMode={isEditMode}
            />
        </div>
    );
};

export default TicketManagement;
