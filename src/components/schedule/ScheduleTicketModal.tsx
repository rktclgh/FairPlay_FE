import React, { useState, useEffect } from "react";
import authManager from "../../utils/auth";
import {toast} from "react-toastify";

interface ScheduleTicketResponseDto {
    ticketId: number;
    name: string;
    price: number;
    saleQuantity: number;   // 판매할 수량
    salesStartAt: string;   // ISO DateTime string
    salesEndAt: string;     // ISO DateTime string
    visible: boolean;
}

interface ScheduleTicketRequestDto {
    ticketId: number;
    saleQuantity: number;   // 판매할 수량
    salesStartAt: string;   // ISO DateTime string
    salesEndAt: string;     // ISO DateTime string
    visible: boolean;
}

interface ScheduleTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    round: any;
    onComplete: () => void;
    eventId?: number;
}

export const ScheduleTicketModal: React.FC<ScheduleTicketModalProps> = ({
    isOpen, 
    onClose, 
    round, 
    onComplete,
    eventId
}) => {
    const formatScheduleInfo = (schedule: any) => {
        if (!schedule) return "";
        const date = new Date(schedule.date);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = days[date.getDay()];
        return `${schedule.date}(${dayOfWeek}) ${schedule.startTime} ~ ${schedule.endTime}`;
    };

    // 백엔드에서 받아올 티켓 목록 상태
    const [availableTickets, setAvailableTickets] = useState<ScheduleTicketResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    // 티켓 설정 상태 (사용자가 입력하는 데이터)
    const [ticketSettings, setTicketSettings] = useState<ScheduleTicketRequestDto[]>([]);

    // 티켓 목록 조회 함수
    const fetchTickets = async () => {
        if (!eventId || !round?.scheduleId || !isOpen) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await authManager.authenticatedFetch(
                `/api/events/${eventId}/schedule/${round.scheduleId}/tickets`
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '티켓 목록 조회에 실패했습니다.');
            }
            
            const tickets: ScheduleTicketResponseDto[] = await response.json();
            setAvailableTickets(tickets);
            
            // 기존 티켓 설정이 있다면 초기화
            const initialSettings: ScheduleTicketRequestDto[] = tickets.map(ticket => ({
                ticketId: ticket.ticketId,
                saleQuantity: ticket.saleQuantity || 0,
                salesStartAt: ticket.salesStartAt || '',
                salesEndAt: ticket.salesEndAt || '',
                visible: ticket.visible !== undefined ? ticket.visible : false // 기본값을 false로 설정 (사용자가 명시적으로 선택)
            }));
            setTicketSettings(initialSettings);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : '티켓 목록 조회에 실패했습니다.');
            console.error('티켓 조회 실패:', err);
        } finally {
            setLoading(false);
            setHasLoaded(true);
        }
    };

    // 티켓 설정 저장 함수
    const saveTicketSettings = async () => {
        if (!eventId || !round?.scheduleId) return;
        
        // 활성화된 티켓 중에서 필수 필드가 누락된 것이 있는지 확인
        const activeTickets = ticketSettings.filter(ticket => ticket.visible);
        const invalidTickets = activeTickets.filter(ticket => 
            !ticket.saleQuantity || 
            !ticket.salesStartAt || 
            !ticket.salesEndAt
        );
        
        if (activeTickets.length === 0) {
            toast.error("판매할 티켓을 하나 이상 선택해주세요.");
            return;
        }
        
        if (invalidTickets.length > 0) {
            toast.error("활성화된 티켓의 판매 수량과 판매 일시를 모두 입력해주세요.");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await authManager.authenticatedFetch(
                `/api/events/${eventId}/schedule/${round.scheduleId}/tickets`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(ticketSettings) // 모든 티켓 저장
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '티켓 설정 저장에 실패했습니다.');
            }
            
            onComplete();
            toast.success("티켓 설정이 성공적으로 완료되었습니다.");
            onClose();
            
        } catch (err) {
            setError(err instanceof Error ? err.message : '티켓 설정 저장에 실패했습니다.');
            console.error('티켓 설정 저장 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 티켓 목록 조회
    useEffect(() => {
        if (isOpen && eventId && round?.scheduleId) {
            setHasLoaded(false); // 새로운 조회 시작 시 초기화
            fetchTickets();
        }
    }, [isOpen, eventId, round?.scheduleId]);

    const handleInputChange = (ticketId: number, field: keyof ScheduleTicketRequestDto, value: string | boolean | number) => {
        setTicketSettings(prev => prev.map(ticket =>
            ticket.ticketId === ticketId ? { ...ticket, [field]: value } : ticket
        ));
    };

    // 날짜와 시간을 합쳐서 DATETIME 형식으로 변환하는 함수
    const combineDateAndTime = (date: string, time: string) => {
        if (!date || !time) return "";
        return `${date}T${time}:00`;
    };

    // 날짜/시간 변경 핸들러
    const handleDateTimeChange = (ticketId: number, field: 'salesStartAt' | 'salesEndAt', dateValue?: string, timeValue?: string) => {
        const currentTicket = ticketSettings.find(t => t.ticketId === ticketId);
        if (!currentTicket) return;

        const existingDateTime = currentTicket[field];
        let currentDate = '';
        let currentTime = '';
        
        if (existingDateTime) {
            [currentDate, currentTime] = existingDateTime.split('T');
            currentTime = currentTime?.substring(0, 5) || '';
        }

        const newDate = dateValue !== undefined ? dateValue : currentDate;
        const newTime = timeValue !== undefined ? timeValue : currentTime;
        
        // 날짜나 시간 중 하나라도 변경되면 상태 업데이트
        if (newDate || newTime) {
            if (newDate && newTime) {
                // 둘 다 있으면 완전한 datetime 생성
                const dateTimeValue = combineDateAndTime(newDate, newTime);
                handleInputChange(ticketId, field, dateTimeValue);
            } else if (newDate && !newTime) {
                // 날짜만 있으면 시간은 빈 문자열로 설정
                handleInputChange(ticketId, field, newDate + 'T');
            } else if (!newDate && newTime) {
                // 시간만 있으면 날짜는 빈 문자열로 설정  
                handleInputChange(ticketId, field, 'T' + newTime + ':00');
            } else {
                // 둘 다 없으면 빈 문자열
                handleInputChange(ticketId, field, '');
            }
        }
    };

    const handleComplete = () => {
        saveTicketSettings();
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
            <div className="bg-white rounded-[10px] shadow-xl w-[1300px] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">회차 티켓 설정</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">회차 정보</h3>
                        <div className="text-base text-gray-900">
                            {formatScheduleInfo(round)}
                        </div>
                    </div>

                    {/* 판매된 티켓이 있는 경우 경고 메시지 */}
                    {round?.soldTicketCount > 0 && (
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-orange-800">
                                        설정 변경 제한
                                    </h3>
                                    <div className="mt-2 text-sm text-orange-700">
                                        <p>이 회차에는 이미 판매된 티켓이 <span className="font-bold">{round.soldTicketCount}장</span> 있습니다.</p>
                                        <p>판매된 티켓이 있는 회차는 티켓 설정을 변경할 수 없습니다.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">티켓 정보</h3>
                        
                        
                        {/* 에러 상태 */}
                        {error && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="text-red-600 mb-4">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={() => fetchTickets()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none"
                                >
                                    다시 시도
                                </button>
                            </div>
                        )}
                        
                        {/* 티켓 목록이 없을 때 */}
                        {!error && hasLoaded && availableTickets.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 티켓이 없습니다</h3>
                                <p className="text-gray-600">먼저 이벤트 티켓을 등록해주세요.</p>
                            </div>
                        )}
                        
                        {/* 티켓 테이블 */}
                        {!error && availableTickets.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[1200px]">
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
                                        <th className="px-2 py-3 text-center font-bold text-gray-700 min-w-[80px]">판매 여부</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableTickets.map((ticket, index) => {
                                        const ticketSetting = ticketSettings.find(t => t.ticketId === ticket.ticketId);
                                        return (
                                            <tr key={ticket.ticketId} className={index !== availableTickets.length - 1 ? "border-b border-gray-200" : ""}>
                                                <td className="px-2 py-3 font-medium text-gray-900 min-w-[100px] whitespace-nowrap truncate">{ticket.name}</td>
                                                <td className="px-2 py-3 text-center text-gray-600 min-w-[70px] whitespace-nowrap">-</td> {/* 좌석등급 정보 없음 */}
                                                <td className="px-2 py-3 text-center min-w-[60px]">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                                                        성인
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 text-center font-bold text-gray-900 min-w-[80px] whitespace-nowrap">{ticket.price.toLocaleString()}원</td>
                                                <td className="px-2 py-3 text-center text-gray-600 min-w-[90px] whitespace-nowrap">제한없음</td> {/* maxPurchase 정보 없음 */}
                                                <td className="px-2 py-3 text-center min-w-[80px]">
                                                    <input
                                                        type="number"
                                                        value={ticketSetting?.saleQuantity || ''}
                                                        onChange={(e) => handleInputChange(ticket.ticketId, 'saleQuantity', parseInt(e.target.value) || 0)}
                                                        placeholder="수량"
                                                        min="0"
                                                        disabled={round?.soldTicketCount > 0}
                                                        className={`w-16 px-1 py-1 border rounded text-xs focus:outline-none ${
                                                            round?.soldTicketCount > 0 
                                                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" 
                                                                : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        }`}
                                                    />
                                                </td>
                                                <td className="px-2 py-3 text-center min-w-[140px]">
                                                    <div className="space-y-1">
                                                        <input
                                                            type="date"
                                                            value={ticketSetting?.salesStartAt ? ticketSetting.salesStartAt.split('T')[0] : ''}
                                                            onChange={(e) => handleDateTimeChange(ticket.ticketId, 'salesStartAt', e.target.value)}
                                                            disabled={round?.soldTicketCount > 0}
                                                            className={`w-28 px-1 py-1 border rounded text-xs focus:outline-none ${
                                                                round?.soldTicketCount > 0 
                                                                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" 
                                                                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            }`}
                                                        />
                                                        <select
                                                            value={ticketSetting?.salesStartAt ? ticketSetting.salesStartAt.split('T')[1]?.substring(0, 5) : ''}
                                                            onChange={(e) => handleDateTimeChange(ticket.ticketId, 'salesStartAt', undefined, e.target.value)}
                                                            disabled={round?.soldTicketCount > 0}
                                                            className={`w-28 px-1 py-1 border rounded text-xs focus:outline-none ${
                                                                round?.soldTicketCount > 0 
                                                                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" 
                                                                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            }`}
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
                                                            value={ticketSetting?.salesEndAt ? ticketSetting.salesEndAt.split('T')[0] : ''}
                                                            onChange={(e) => handleDateTimeChange(ticket.ticketId, 'salesEndAt', e.target.value)}
                                                            disabled={round?.soldTicketCount > 0}
                                                            className={`w-28 px-1 py-1 border rounded text-xs focus:outline-none ${
                                                                round?.soldTicketCount > 0 
                                                                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" 
                                                                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            }`}
                                                        />
                                                        <select
                                                            value={ticketSetting?.salesEndAt ? ticketSetting.salesEndAt.split('T')[1]?.substring(0, 5) : ''}
                                                            onChange={(e) => handleDateTimeChange(ticket.ticketId, 'salesEndAt', undefined, e.target.value)}
                                                            disabled={round?.soldTicketCount > 0}
                                                            className={`w-28 px-1 py-1 border rounded text-xs focus:outline-none ${
                                                                round?.soldTicketCount > 0 
                                                                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" 
                                                                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            }`}
                                                        >
                                                            <option value="">시간 선택</option>
                                                            {generateTimeOptions().map(time => (
                                                                <option key={time} value={time}>{time}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                                {/* 판매 여부 토글 */}
                                                <td className="px-2 py-3 text-center min-w-[80px]">
                                                    <label className={`relative inline-flex items-center ${round?.soldTicketCount > 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={ticketSetting?.visible || false}
                                                            onChange={(e) => handleInputChange(ticket.ticketId, 'visible', e.target.checked)}
                                                            disabled={round?.soldTicketCount > 0}
                                                            className="sr-only peer"
                                                        />
                                                        <div className={`relative w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                                            round?.soldTicketCount > 0 
                                                                ? "bg-gray-200 after:border-gray-300 cursor-not-allowed" 
                                                                : "bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:border-gray-300 peer-checked:bg-blue-600"
                                                        }`}></div>
                                                    </label>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        )}
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
                            onClick={() => {
                                if (round?.soldTicketCount > 0) {
                                    toast.error("판매된 티켓이 있는 회차는 설정을 변경할 수 없습니다.");
                                    return;
                                }
                                handleComplete();
                            }}
                            disabled={availableTickets.length === 0 || round?.soldTicketCount > 0}
                            className={`px-6 py-2 rounded-[10px] text-sm font-medium transition-colors focus:outline-none ${
                                availableTickets.length === 0 || round?.soldTicketCount > 0
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-gray-800"
                            }`}
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};