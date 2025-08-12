import React, { useState, useEffect } from "react";
import { ticketService, type Ticket, type TicketCreateRequest, type AudienceType, type SeatType, type TicketStatusCode, TicketService } from "../../services/ticketService";
import { toast } from 'react-toastify';

interface TicketFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTicket: (ticket: Ticket) => void;
    onUpdateTicket?: (ticket: Ticket) => void;
    editTicket?: Ticket;
    isEditMode?: boolean;
    eventId: number;
}

export const TicketFormModal: React.FC<TicketFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onAddTicket, 
    onUpdateTicket, 
    editTicket, 
    isEditMode = false,
    eventId 
}) => {

    const [formData, setFormData] = useState({
        name: "",
        seatType: "" as SeatType | "",
        audienceType: "" as AudienceType | "",
        price: "",
        ticketStatusCode: "" as TicketStatusCode | "",
        maxPurchase: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

// 수정 모드일 때 기존 데이터로 폼 초기화
    useEffect(() => {
        if (isEditMode && editTicket) {
            // 실제 API 응답 구조에 맞게 데이터 추출
            const editTicketAny = editTicket as Record<string, any>;
            
            setFormData({
                name: editTicket.name || "",
                seatType: editTicketAny.seatTypeCode || "",
                audienceType: editTicketAny.audienceTypeCode || "",
                price: editTicket.price?.toString() || "",
                ticketStatusCode: editTicketAny.ticketStatusCode || "",
                maxPurchase: editTicket.maxPurchase?.toString() || ""
            });
        } else {
            // 추가 모드일 때 폼 초기화
            setFormData({
                name: "",
                seatType: "" as SeatType | "",
                audienceType: "" as AudienceType | "",
                price: "",
                ticketStatusCode: "" as TicketStatusCode | "",
                maxPurchase: ""
            });
        }
    }, [isEditMode, editTicket, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const ticketData: TicketCreateRequest = {
                name: formData.name,
                seatType: formData.seatType as SeatType,
                audienceType: formData.audienceType as AudienceType,
                price: Number(formData.price),
                ticketStatusCode: formData.ticketStatusCode as TicketStatusCode,
                maxPurchase: Number(formData.maxPurchase)
            };

            if (isEditMode && (editTicket as Record<string, any>)?.ticketId && onUpdateTicket) {
                const updatedTicket = await ticketService.updateTicket(eventId, (editTicket as Record<string, any>).ticketId, ticketData);
                onUpdateTicket(updatedTicket);
                toast.success("티켓이 수정되었습니다.");
            } else {
                const newTicket = await ticketService.createTicket(eventId, ticketData);
                onAddTicket(newTicket);
                toast.success("티켓이 추가되었습니다.");
            }

            onClose();
        } catch {
            toast.error(isEditMode ? '티켓 수정에 실패했습니다.' : '티켓 추가에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
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
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="티켓명을 입력하세요"
                            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 좌석 등급 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            좌석 등급
                        </label>
                        <div className="relative">
                            <select
                                name="seatType"
                                value={formData.seatType}
                                onChange={handleInputChange}
                                className="w-full h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">좌석 등급을 선택하세요</option>
                                {TicketService.SEAT_TYPES.map(grade => (
                                    <option key={grade.value} value={grade.value}>{grade.label}</option>
                                ))}
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
                                name="audienceType"
                                value={formData.audienceType}
                                onChange={handleInputChange}
                                className="w-full h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">티켓 유형을 선택하세요</option>
                                {TicketService.AUDIENCE_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
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
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 상태 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            상태
                        </label>
                        <div className="relative">
                            <select
                                name="ticketStatusCode"
                                value={formData.ticketStatusCode}
                                onChange={handleInputChange}
                                className="w-full h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">상태를 선택하세요</option>
                                {TicketService.TICKET_STATUSES.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
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
                            name="maxPurchase"
                            value={formData.maxPurchase}
                            onChange={handleInputChange}
                            placeholder="제한 수량을 입력하세요"
                            min="1"
                            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};