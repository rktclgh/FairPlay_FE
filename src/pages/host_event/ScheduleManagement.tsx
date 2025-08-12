import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";

// 티켓 설정 모달 컴포넌트
const TicketSetupModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    round: any;
    onComplete: () => void;
}> = ({ isOpen, onClose, round, onComplete }) => {
    // 회차 정보를 한 줄로 포맷하는 함수
    const formatRoundInfo = (round: any) => {
        if (!round) return "";
        const date = new Date(round.viewingDate);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = days[date.getDay()];
        return `${round.viewingDate}(${dayOfWeek}) ${round.startTime} ~ ${round.endTime}`;
    };

    // 티켓 관리에서 가져온 샘플 티켓 데이터 (실제로는 props나 context에서 가져와야 함)
    const [availableTickets] = useState([
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
            type: "성인",
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
            type: "성인",
            price: "100,000원",
            limit: "6매",
            status: "판매 종료",
            statusColor: "bg-red-100",
            textColor: "text-red-800"
        }
    ]);

    const [ticketSettings, setTicketSettings] = useState(
        availableTickets.map(ticket => ({
            ...ticket,
            saleQuantity: "",
            saleStartDate: "",
            saleStartTime: "",
            saleEndDate: "",
            saleEndTime: ""
        }))
    );

    const handleInputChange = (ticketId: number, field: string, value: string) => {
        setTicketSettings(prev => prev.map(ticket =>
            ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
        ));
    };

    const handleComplete = () => {
        onComplete();
        alert("티켓 설정이 완료되었습니다.");
        onClose();
    };

    // 10분 단위 시간 옵션 생성 함수
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 10) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                options.push(timeString);
            }
        }
        return options;
    };

    if (!isOpen || !round) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-[10px] shadow-xl w-[1200px] max-h-[90vh] overflow-y-auto">
                {/* 모달 헤더 */}
                <div className="flex items-center justify-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">회차 티켓 설정</h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* 회차 정보 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">회차 정보</h3>
                        <div className="text-base text-gray-900">
                            {formatRoundInfo(round)}
                        </div>
                    </div>

                    {/* 티켓 정보 */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">티켓 정보</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[1100px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-3 text-left font-bold text-gray-700 min-w-[100px]">티켓명</th>
                                        <th className="px-2 py-3 text-center font-bold text-gray-700 min-w-[70px]">좌석등급</th>
                                        <th className="px-2 py-3 text-center font-bold text-gray-700 min-w-[60px]">티켓유형</th>
                                        <th className="px-2 py-3 text-center font-bold text-gray-700 min-w-[80px]">가격</th>
                                        <th className="px-2 py-3 text-center font-bold text-gray-700 min-w-[90px]">1인판매제한수량</th>
                                        <th className="px-2 py-3 text-center font-bold text-gray-700 min-w-[80px]">판매할 수량</th>
                                        <th className="px-2 py-3 text-center font-bold text-gray-700 min-w-[140px]">판매 시작일시</th>
                                        <th className="px-2 py-3 text-center font-bold text-gray-700 min-w-[140px]">판매 종료일시</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ticketSettings.map((ticket, index) => (
                                        <tr key={ticket.id} className={index !== ticketSettings.length - 1 ? "border-b border-gray-200" : ""}>
                                            <td className="px-2 py-3 font-medium text-gray-900 min-w-[100px] whitespace-nowrap truncate">{ticket.name}</td>
                                            <td className="px-2 py-3 text-center text-gray-600 min-w-[70px] whitespace-nowrap">{ticket.seatGrade}</td>
                                            <td className="px-2 py-3 text-center min-w-[60px]">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                                                    {ticket.type}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-center font-bold text-gray-900 min-w-[80px] whitespace-nowrap">{ticket.price}</td>
                                            <td className="px-2 py-3 text-center text-gray-600 min-w-[90px] whitespace-nowrap">{ticket.limit}</td>
                                            <td className="px-2 py-3 text-center min-w-[80px]">
                                                <input
                                                    type="number"
                                                    value={ticket.saleQuantity}
                                                    onChange={(e) => handleInputChange(ticket.id, 'saleQuantity', e.target.value)}
                                                    placeholder="수량"
                                                    min="0"
                                                    className="w-16 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-2 py-3 text-center min-w-[140px]">
                                                <div className="space-y-1">
                                                    <input
                                                        type="date"
                                                        value={ticket.saleStartDate}
                                                        onChange={(e) => handleInputChange(ticket.id, 'saleStartDate', e.target.value)}
                                                        className="w-28 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <select
                                                        value={ticket.saleStartTime}
                                                        onChange={(e) => handleInputChange(ticket.id, 'saleStartTime', e.target.value)}
                                                        className="w-28 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">시간 선택</option>
                                                        {generateTimeOptions().map(time => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 text-center min-w-[140px]">
                                                <div className="space-y-1">
                                                    <input
                                                        type="date"
                                                        value={ticket.saleEndDate}
                                                        onChange={(e) => handleInputChange(ticket.id, 'saleEndDate', e.target.value)}
                                                        className="w-28 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <select
                                                        value={ticket.saleEndTime}
                                                        onChange={(e) => handleInputChange(ticket.id, 'saleEndTime', e.target.value)}
                                                        className="w-28 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">시간 선택</option>
                                                        {generateTimeOptions().map(time => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-[10px] text-sm font-medium hover:bg-gray-300 transition-colors focus:outline-none"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleComplete}
                            className="px-6 py-2 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none"
                        >
                            설정 완료
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 회차 추가/수정 모달 컴포넌트
const AddRoundModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddRound: (round: any) => void;
    onUpdateRound?: (round: any) => void;
    editRound?: any;
    isEditMode?: boolean;
}> = ({ isOpen, onClose, onAddRound, onUpdateRound, editRound, isEditMode = false }) => {
    const [formData, setFormData] = useState({
        viewingDate: "",
        startTime: "",
        endTime: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 10분 단위 시간 옵션 생성 함수
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 10) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                options.push(timeString);
            }
        }
        return options;
    };

    // 수정 모드일 때 기존 데이터로 폼 초기화
    React.useEffect(() => {
        if (isEditMode && editRound) {
            setFormData({
                viewingDate: editRound.viewingDate,
                startTime: editRound.startTime,
                endTime: editRound.endTime
            });
        } else {
            // 추가 모드일 때 폼 초기화
            setFormData({
                viewingDate: "",
                startTime: "",
                endTime: ""
            });
        }
    }, [isEditMode, editRound]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(isEditMode ? "회차 수정:" : "새 회차 추가:", formData);

        const roundData = {
            id: isEditMode ? editRound.id : Date.now(),
            viewingDate: formData.viewingDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            status: isEditMode ? editRound.status : "티켓 설정 대기",
            statusColor: isEditMode && editRound.status === "티켓 설정 완료" ? "bg-green-100" : "bg-yellow-100",
            textColor: isEditMode && editRound.status === "티켓 설정 완료" ? "text-green-800" : "text-yellow-800"
        };

        if (isEditMode && onUpdateRound) {
            onUpdateRound(roundData);
            alert("회차가 수정되었습니다.");
        } else {
            onAddRound(roundData);
            alert("회차가 추가되었습니다.");
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-[10px] shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
                {/* 모달 헤더 */}
                <div className="flex items-center justify-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "회차 수정" : "회차 추가"}</h2>
                </div>

                {/* 모달 바디 */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">



                    {/* 관람일 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            관람일
                        </label>
                        <input
                            type="date"
                            name="viewingDate"
                            value={formData.viewingDate}
                            onChange={handleInputChange}
                            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {/* 시작 시각 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            시작 시각
                        </label>
                        <div className="relative">
                            <select
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                                required
                            >
                                <option value="">시작 시각 선택</option>
                                {generateTimeOptions().map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 종료 시각 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            종료 시각
                        </label>
                        <div className="relative">
                            <select
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                                required
                            >
                                <option value="">종료 시각 선택</option>
                                {generateTimeOptions().map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
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

export const ScheduleManagement = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editRound, setEditRound] = useState(null);
    const [isTicketSetupModalOpen, setIsTicketSetupModalOpen] = useState(false);
    const [selectedRound, setSelectedRound] = useState(null);

    // 요일을 구하는 함수
    const getDayOfWeek = (dateString: string) => {
        const date = new Date(dateString);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
    };

    // 날짜와 요일을 함께 표시하는 함수
    const formatDateWithDay = (dateString: string) => {
        return `${dateString} (${getDayOfWeek(dateString)})`;
    };

    // 회차 정보를 한 줄로 포맷하는 함수
    const formatRoundInfo = (round: any) => {
        const date = new Date(round.viewingDate);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = days[date.getDay()];
        return `${round.viewingDate}(${dayOfWeek}) ${round.startTime} ~ ${round.endTime}`;
    };

    // 회차 번호를 자동으로 재할당하는 함수
    const reassignRoundNumbers = (rounds: any[]) => {
        const roundsByDate = rounds.reduce((acc, round) => {
            if (!acc[round.viewingDate]) {
                acc[round.viewingDate] = [];
            }
            acc[round.viewingDate].push(round);
            return acc;
        }, {} as Record<string, any[]>);

        const updatedRounds: any[] = [];

        Object.keys(roundsByDate).forEach(date => {
            // 각 날짜별로 시작 시간 순으로 정렬
            const sortedRounds = roundsByDate[date].sort((a, b) => {
                return a.startTime.localeCompare(b.startTime);
            });

            // 회차 번호 재할당 (1회차, 2회차, 3회차...)
            sortedRounds.forEach((round, index) => {
                updatedRounds.push({
                    ...round,
                    roundNumber: `${index + 1}회차`
                });
            });
        });

        return updatedRounds;
    };

    // 티켓 설정 모달 열기
    const handleTicketSetup = (round: any) => {
        setSelectedRound(round);
        setIsTicketSetupModalOpen(true);
    };

    // 티켓 설정 완료 처리 함수
    const handleTicketSetupComplete = () => {
        if (selectedRound) {
            setRoundData(prev => prev.map(round =>
                round.id === selectedRound.id
                    ? {
                        ...round,
                        status: "티켓 설정 완료",
                        statusColor: "bg-green-100",
                        textColor: "text-green-800"
                    }
                    : round
            ));
        }
    };
    const [roundData, setRoundData] = useState([
        {
            id: 1,
            roundNumber: "1회차",
            viewingDate: "2025-08-01",
            startTime: "14:00",
            endTime: "16:00",
            status: "티켓 설정 완료",
            statusColor: "bg-green-100",
            textColor: "text-green-800"
        },
        {
            id: 2,
            roundNumber: "2회차",
            viewingDate: "2025-08-01",
            startTime: "19:00",
            endTime: "21:00",
            status: "티켓 설정 완료",
            statusColor: "bg-green-100",
            textColor: "text-green-800"
        },
        {
            id: 3,
            roundNumber: "3회차",
            viewingDate: "2025-08-01",
            startTime: "21:30",
            endTime: "23:30",
            status: "티켓 설정 대기",
            statusColor: "bg-yellow-100",
            textColor: "text-yellow-800"
        },
        {
            id: 4,
            roundNumber: "1회차",
            viewingDate: "2025-08-02",
            startTime: "14:00",
            endTime: "16:00",
            status: "티켓 설정 완료",
            statusColor: "bg-green-100",
            textColor: "text-green-800"
        },
        {
            id: 5,
            roundNumber: "2회차",
            viewingDate: "2025-08-02",
            startTime: "19:00",
            endTime: "21:00",
            status: "티켓 설정 대기",
            statusColor: "bg-yellow-100",
            textColor: "text-yellow-800"
        },
        {
            id: 6,
            roundNumber: "1회차",
            viewingDate: "2025-08-03",
            startTime: "15:00",
            endTime: "17:00",
            status: "티켓 설정 완료",
            statusColor: "bg-green-100",
            textColor: "text-green-800"
        },
        {
            id: 7,
            roundNumber: "2회차",
            viewingDate: "2025-08-03",
            startTime: "19:30",
            endTime: "21:30",
            status: "티켓 설정 완료",
            statusColor: "bg-green-100",
            textColor: "text-green-800"
        },
        {
            id: 8,
            roundNumber: "1회차",
            viewingDate: "2025-08-05",
            startTime: "16:00",
            endTime: "18:00",
            status: "티켓 설정 대기",
            statusColor: "bg-yellow-100",
            textColor: "text-yellow-800"
        }
    ]);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    회차 관리
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 검색 및 필터 섹션 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                {/* 시작 날짜 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">시작 날짜</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-48 h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                {/* 종료 날짜 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">종료 날짜</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-48 h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* 회차 추가 버튼 */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2 opacity-0">회차 추가</label>
                                <button
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setEditRound(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="h-11 px-6 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-[10px] text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:bg-white/90 flex items-center gap-2 focus:outline-none"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    회차 추가
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 테이블 컨테이너 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-7 gap-3 text-sm font-bold text-gray-700">
                                <div className="text-center min-w-[110px]">관람일</div>
                                <div className="text-center min-w-[60px]">회차</div>
                                <div className="text-center min-w-[70px]">시작 시각</div>
                                <div className="text-center min-w-[70px]">종료 시각</div>
                                <div className="text-center min-w-[100px]">상태</div>
                                <div className="text-center min-w-[80px]">티켓 설정</div>
                                <div className="text-center min-w-[100px]">관리</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div className="bg-white">
                            {roundData
                                .filter(round => {
                                    // 날짜 필터링
                                    const startMatch = !startDate || round.viewingDate >= startDate;
                                    const endMatch = !endDate || round.viewingDate <= endDate;
                                    return startMatch && endMatch;
                                })
                                .map((round, index, filteredArray) => {
                                    // 이전 행과 같은 날짜인지 확인
                                    const showDate = index === 0 || filteredArray[index - 1].viewingDate !== round.viewingDate;

                                    return (
                                        <div
                                            key={round.id}
                                            className={`grid grid-cols-7 gap-3 py-5 px-6 text-sm items-center ${index !== filteredArray.length - 1 ? "border-b border-gray-200" : ""
                                                }`}
                                        >
                                            <div className="text-gray-600 text-center min-w-[110px] truncate">
                                                {showDate ? formatDateWithDay(round.viewingDate) : ""}
                                            </div>
                                            <div className="font-medium text-gray-900 text-center min-w-[60px]">{round.roundNumber}</div>
                                            <div className="text-center text-gray-600 min-w-[70px]">{round.startTime}</div>
                                            <div className="text-center text-gray-600 min-w-[70px]">{round.endTime}</div>
                                            <div className="text-center min-w-[100px]">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${round.statusColor} ${round.textColor}`}>
                                                    {round.status}
                                                </span>
                                            </div>
                                            <div className="text-center min-w-[80px]">
                                                <button
                                                    onClick={() => handleTicketSetup(round)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs whitespace-nowrap"
                                                >
                                                    티켓 설정
                                                </button>
                                            </div>
                                            <div className="text-center flex justify-center gap-2 min-w-[100px]">
                                                <button
                                                    onClick={() => {
                                                        setEditRound(round);
                                                        setIsEditMode(true);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs whitespace-nowrap"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`"${round.roundNumber}" 회차를 삭제하시겠습니까?`)) {
                                                            setRoundData(prev => {
                                                                const filteredRounds = prev.filter(r => r.id !== round.id);
                                                                return reassignRoundNumbers(filteredRounds);
                                                            });
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-800 font-medium transition-colors text-xs whitespace-nowrap"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* 하단 정보 */}
                    <div className="mt-6 text-sm text-gray-600">
                        총 <span className="font-bold text-black">
                            {roundData.filter(round => {
                                const startMatch = !startDate || round.viewingDate >= startDate;
                                const endMatch = !endDate || round.viewingDate <= endDate;
                                return startMatch && endMatch;
                            }).length}
                        </span>개의 회차
                    </div>
                </div>
            </div>

            {/* 회차 추가/수정 모달 */}
            <AddRoundModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditRound(null);
                }}
                onAddRound={(newRound) => {
                    setRoundData(prev => {
                        const updatedRounds = [...prev, newRound];
                        return reassignRoundNumbers(updatedRounds);
                    });
                }}
                onUpdateRound={(updatedRound) => {
                    setRoundData(prev => {
                        const updatedRounds = prev.map(round =>
                            round.id === updatedRound.id ? updatedRound : round
                        );
                        return reassignRoundNumbers(updatedRounds);
                    });
                }}
                editRound={editRound}
                isEditMode={isEditMode}
            />

            {/* 티켓 설정 모달 */}
            <TicketSetupModal
                isOpen={isTicketSetupModalOpen}
                onClose={() => {
                    setIsTicketSetupModalOpen(false);
                    setSelectedRound(null);
                }}
                round={selectedRound}
                onComplete={handleTicketSetupComplete}
            />
        </div>
    );
};

export default ScheduleManagement;
