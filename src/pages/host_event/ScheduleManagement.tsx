import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { ScheduleModal } from "../../components/schedule/ScheduleModal";
import { ScheduleTicketModal } from "../../components/schedule/ScheduleTicketModal";

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
            <ScheduleModal
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
            <ScheduleTicketModal
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