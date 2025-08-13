import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { ticketService, type Ticket, TicketService } from "../../services/ticketService";
import { TicketFormModal } from "../../components/ticket/TicketFormModal";
import { toast } from 'react-toastify';
import authManager from "../../utils/auth";


export const TicketManagement = () => {
    const [eventId, setEventId] = useState<number | null>(null);
    const [isEventLoading, setIsEventLoading] = useState(true);
    const [eventError, setEventError] = useState<string | null>(null);

    // 사용자의 담당 eventId 조회
    useEffect(() => {
        const fetchUserEventId = async () => {
            try {
                setIsEventLoading(true);
                const response = await authManager.authenticatedFetch('/api/events/manager/event');

                if (!response.ok) {
                    throw new Error('행사 관리 권한이 없습니다.');
                }
                
                const data = await response.json();
                setEventId(data);
            } catch (error) {
                setEventError('행사 관리 권한이 없거나 담당 행사를 찾을 수 없습니다.');
            } finally {
                setIsEventLoading(false);
            }
        };
        
        fetchUserEventId();
    }, []);

    const [selectedSeatType, setSelectedSeatType] = useState("ALL");
    const [selectedAudienceType, setSelectedAudienceType] = useState("ALL");
    const [searchTicketName, setSearchTicketName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTicket, setEditTicket] = useState<Ticket | null>(null);
    const [ticketData, setTicketData] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 티켓 목록 로드
    const loadTickets = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const tickets = await ticketService.getTickets(eventId, selectedSeatType !== "ALL" ? selectedSeatType : undefined, searchTicketName, selectedAudienceType !== "ALL" ? selectedAudienceType : undefined);
            setTicketData(tickets);
        } catch (error) {
            setError('티켓 목록을 불러오는데 실패했습니다.');
            setTicketData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // eventId가 로드된 후 티켓 목록 로드
    useEffect(() => {
        if (eventId) {
            loadTickets();
        }
    }, [eventId]);

    // 필터 변경시 티켓 목록 다시 로드 (검색어는 Enter 키로만 조회)
    useEffect(() => {
        if (eventId) {
            loadTickets();
        }
    }, [selectedSeatType, selectedAudienceType]);

    // 티켓 추가 핸들러
    const handleAddTicket = (newTicket: Ticket) => {
        setTicketData(prev => [...prev, newTicket]);
    };

    // 티켓 수정 핸들러
    const handleUpdateTicket = (updatedTicket: Ticket) => {
        setTicketData(prev => prev.map(ticket => 
            ticket.ticketId === updatedTicket.ticketId ? updatedTicket : ticket
        ));
    };

    // 티켓 삭제 핸들러
    const handleDeleteTicket = async (ticketId: number, name: string, eventId: number) => {
        if (!window.confirm(`"${name}" 티켓을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await ticketService.deleteTicket(eventId, ticketId);
            setTicketData(prev => prev.filter(ticket => ticket.ticketId !== ticketId));
            toast.success('티켓이 삭제되었습니다.');
        } catch (error) {
            toast.error('티켓 삭제에 실패했습니다.');
        }
    };

    // 서버에서 이미 필터링되므로 클라이언트 필터링 제거
    const filteredTickets = ticketData;

    // eventId 로딩 중이거나 에러가 있으면 해당 화면 표시
    if (isEventLoading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] h-[1407px] relative">
                    <TopNav />
                    <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                        티켓 관리
                    </div>
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-gray-500">담당 행사 정보를 불러오는 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (eventError || !eventId) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] h-[1407px] relative">
                    <TopNav />
                    <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                        티켓 관리
                    </div>
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-red-500">
                            {eventError || '행사 관리 권한이 없습니다.'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    티켓 관리
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px]">
                    {/* 검색 및 필터 섹션 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                {/* 티켓 유형 필터 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">티켓 유형</label>
                                    <div className="relative">
                                        <select
                                            value={selectedAudienceType}
                                            onChange={(e) => setSelectedAudienceType(e.target.value)}
                                            className="w-48 h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            disabled={isLoading}
                                        >
                                            <option value="ALL">전체</option>
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

                                {/* 좌석 등급 필터 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">좌석 등급</label>
                                    <div className="relative">
                                        <select
                                            value={selectedSeatType}
                                            onChange={(e) => setSelectedSeatType(e.target.value)}
                                            className="w-48 h-11 bg-white border border-gray-300 rounded-[10px] px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            disabled={isLoading}
                                        >
                                            <option value="ALL">전체</option>
                                            {TicketService.SEAT_TYPES.map(seatType => (
                                                <option key={seatType.value} value={seatType.value}>{seatType.label}</option>
                                            ))}
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
                                        placeholder="티켓명을 입력하세요 (Enter키로 검색)"
                                        value={searchTicketName}
                                        onChange={(e) => setSearchTicketName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && eventId) {
                                                loadTickets();
                                            }
                                        }}
                                        className="w-72 h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isLoading}
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
                            {isLoading ? (
                                <div className="py-12 text-center">
                                    <div className="text-gray-500">티켓 목록을 불러오는 중...</div>
                                </div>
                            ) : error ? (
                                <div className="py-12 text-center">
                                    <div className="text-red-500 mb-2">{error}</div>
                                    <button 
                                        onClick={loadTickets}
                                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
                                    >
                                        다시 시도
                                    </button>
                                </div>
                            ) : filteredTickets.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="text-gray-500">
                                        {searchTicketName || selectedSeatType !== "ALL"
                                            ? "검색 조건에 맞는 티켓이 없습니다." 
                                            : "등록된 티켓이 없습니다."}
                                    </div>
                                </div>
                            ) : (
                                filteredTickets.map((ticket, index) => {
                                    const ticketStatus = ticketService.getTicketStatusCode(ticket.ticketStatusCode);

                                    return (
                                        <div
                                            key={ticket.ticketId}
                                            className={`grid grid-cols-7 gap-2 py-5 px-6 text-sm items-center ${
                                                index !== filteredTickets.length - 1 ? "border-b border-gray-200" : ""
                                            }`}
                                        >
                                            <div className="font-medium text-gray-900 text-left truncate">{ticket.name || '티켓명 없음'}</div>
                                            <div className="text-gray-600 text-center">{ticket.seatTypeName || '없음'}</div>
                                            <div className="text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ticket.audienceTypeCode ? ticketService.getAudienceTypeColor(ticket.audienceTypeCode) : 'bg-gray-100 text-gray-800'}`}>
                                                    {ticket.audienceTypeName}
                                                </span>
                                            </div>
                                            <div className="font-bold text-gray-900 text-center">{ticket.price ? ticket.price.toLocaleString() : '0'}원</div>
                                            <div className="text-center text-gray-600">{ticket.maxPurchase || 0}매</div>
                                            <div className="text-center">
                                                <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${ticketStatus.color} ${ticketStatus.textColor}`}>
                                                    {ticket.ticketStatusName}
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
                                                    disabled={isLoading}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => ticket.ticketId && handleDeleteTicket(ticket.ticketId, ticket.name, eventId)}
                                                    className="text-red-600 hover:text-red-800 font-medium transition-colors text-xs"
                                                    disabled={isLoading || !ticket.ticketId}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 하단 정보 */}
                    {!isLoading && !error && (
                        <div className="mt-6 text-sm text-gray-600">
                            총 <span className="font-bold text-black">{filteredTickets.length}</span>개의 티켓
                        </div>
                    )}
                </div>
            </div>

            {/* 티켓 추가/수정 모달 */}
            <TicketFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditTicket(null);
                }}
                onAddTicket={handleAddTicket}
                onUpdateTicket={handleUpdateTicket}
                editTicket={editTicket}
                isEditMode={isEditMode}
                eventId={eventId}
            />
        </div>
    );
};

export default TicketManagement;