import React, { useState } from "react";

interface ScheduleTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    round: any;
    onComplete: () => void;
}

export const ScheduleTicketModal: React.FC<ScheduleTicketModalProps> = ({
    isOpen, 
    onClose, 
    round, 
    onComplete 
}) => {
    const formatRoundInfo = (round: any) => {
        if (!round) return "";
        const date = new Date(round.viewingDate);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = days[date.getDay()];
        return `${round.viewingDate}(${dayOfWeek}) ${round.startTime} ~ ${round.endTime}`;
    };

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
                <div className="flex items-center justify-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">회차 티켓 설정</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">회차 정보</h3>
                        <div className="text-base text-gray-900">
                            {formatRoundInfo(round)}
                        </div>
                    </div>

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