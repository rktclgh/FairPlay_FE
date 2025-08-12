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
    const formatScheduleInfo = (schedule: any) => {
        if (!schedule) return "";
        const date = new Date(schedule.date);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = days[date.getDay()];
        return `${schedule.date}(${dayOfWeek}) ${schedule.startTime} ~ ${schedule.endTime}`;
    };

    const [availableTickets] = useState([
        {
            ticketId: 1,
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
            ticketId: 2,
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
            ticketId: 3,
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
            scheduleId: round?.scheduleId || "",
            remainingStock: "",
            salesStartAt: "",
            salesEndAt: "",
            visible: false,
            types: "EVENT"
        }))
    );

    const handleInputChange = (ticketId: number, field: string, value: string | boolean) => {
        setTicketSettings(prev => prev.map(ticket =>
            ticket.ticketId === ticketId ? { ...ticket, [field]: value } : ticket
        ));
    };

    // 날짜와 시간을 합쳐서 DATETIME 형식으로 변환하는 함수
    const combineDateAndTime = (date: string, time: string) => {
        if (!date || !time) return "";
        return `${date}T${time}:00`;
    };

    // 폼 데이터를 서버 형식에 맞게 처리하는 함수
    const handleDateTimeChange = (ticketId: number, dateField: string, timeField: string, dateValue: string, timeValue: string) => {
        const currentTicket = ticketSettings.find(t => t.ticketId === ticketId);
        if (!currentTicket) return;

        let newDateValue = dateValue;
        let newTimeValue = timeValue;

        // 현재 저장된 값이 있다면 사용
        if (dateField === 'salesStartDate') {
            const existingDateTime = currentTicket.salesStartAt;
            if (existingDateTime) {
                const [existingDate, existingTime] = existingDateTime.split('T');
                newDateValue = dateValue || existingDate;
                newTimeValue = timeValue || existingTime?.substring(0, 5);
            }
        } else if (dateField === 'salesEndDate') {
            const existingDateTime = currentTicket.salesEndAt;
            if (existingDateTime) {
                const [existingDate, existingTime] = existingDateTime.split('T');
                newDateValue = dateValue || existingDate;
                newTimeValue = timeValue || existingTime?.substring(0, 5);
            }
        }

        const dateTimeValue = combineDateAndTime(newDateValue, newTimeValue);
        const targetField = dateField === 'salesStartDate' ? 'salesStartAt' : 'salesEndAt';
        
        handleInputChange(ticketId, targetField, dateTimeValue);
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
                            {formatScheduleInfo(round)}
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
                                        <tr key={ticket.ticketId} className={index !== ticketSettings.length - 1 ? "border-b border-gray-200" : ""}>
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
                                                    value={ticket.remainingStock}
                                                    onChange={(e) => handleInputChange(ticket.ticketId, 'remainingStock', e.target.value)}
                                                    placeholder="수량"
                                                    min="0"
                                                    className="w-16 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-2 py-3 text-center min-w-[140px]">
                                                <div className="space-y-1">
                                                    <input
                                                        type="date"
                                                        value={ticket.salesStartAt ? ticket.salesStartAt.split('T')[0] : ''}
                                                        onChange={(e) => handleDateTimeChange(ticket.ticketId, 'salesStartDate', 'salesStartTime', e.target.value, '')}
                                                        className="w-28 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <select
                                                        value={ticket.salesStartAt ? ticket.salesStartAt.split('T')[1]?.substring(0, 5) : ''}
                                                        onChange={(e) => handleDateTimeChange(ticket.ticketId, 'salesStartDate', 'salesStartTime', '', e.target.value)}
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
                                                        value={ticket.salesEndAt ? ticket.salesEndAt.split('T')[0] : ''}
                                                        onChange={(e) => handleDateTimeChange(ticket.ticketId, 'salesEndDate', 'salesEndTime', e.target.value, '')}
                                                        className="w-28 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <select
                                                        value={ticket.salesEndAt ? ticket.salesEndAt.split('T')[1]?.substring(0, 5) : ''}
                                                        onChange={(e) => handleDateTimeChange(ticket.ticketId, 'salesEndDate', 'salesEndTime', '', e.target.value)}
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