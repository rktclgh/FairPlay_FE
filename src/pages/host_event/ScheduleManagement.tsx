import React, { useEffect, useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { ScheduleModal } from "../../components/schedule/ScheduleModal";
import { ScheduleTicketModal } from "../../components/schedule/ScheduleTicketModal";
import authManager from "../../utils/auth";
import { toast } from "react-toastify";

export const ScheduleManagement = () => {
    const [eventId, setEventId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editSchedule, setEditSchedule] = useState(null);
    const [isScheduleTicketModalOpen, setIsScheduleTicketModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 사용자의 담당 eventId 조회
    useEffect(() => {
        const fetchUserEventId = async () => {
            const response = await authManager.authenticatedFetch('/api/events/manager/event');

            if (!response.ok) {
                throw new Error('행사 관리 권한이 없습니다.');
            }

            const data = await response.json();
            setEventId(data);
        };
        fetchUserEventId();
    }, []);

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
    const reassignScheduleNumbers = (dataList: any[]) => {
        const scheduleByDate = dataList.reduce((acc, scehdule) => {
            if (!acc[scehdule.date]) {
                acc[scehdule.date] = [];
            }
            acc[scehdule.date].push(scehdule);
            return acc;
        }, {} as Record<string, any[]>);

        const updatedSchedules: any[] = [];

        // 날짜 키를 최신순으로 정렬
        const sortedDates = Object.keys(scheduleByDate).sort((a, b) => {
            return b.localeCompare(a); // 내림차순 (최신순)
        });

        sortedDates.forEach(date => {
            // 각 날짜별로 시작 시간 순으로 정렬
            const sortedSchedules = scheduleByDate[date].sort((a, b) => {
                return a.startTime.localeCompare(b.startTime);
            });

            // 회차 번호 재할당 (1회차, 2회차, 3회차...)
            sortedSchedules.forEach((sortedSchdule, index) => {
                updatedSchedules.push({
                    ...sortedSchdule,
                    roundNumber: `${index + 1}회차`
                });
            });
        });

        return updatedSchedules;
    };

    // 티켓 설정 모달 열기
    const handleTicketSetup = (round: any) => {
        setSelectedSchedule(round);
        setIsScheduleTicketModalOpen(true);
    };

    // 회차 삭제 함수
    const handleDeleteSchedule = async (schedule: any) => {
        if (!window.confirm(`"${schedule.scheduleId}" 회차를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const response = await authManager.authenticatedFetch(`/api/events/${eventId}/schedule/${schedule.scheduleId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '회차 삭제에 실패했습니다.');
            }

            // 삭제 성공 시 목록 다시 조회
            await fetchSchedules();
            toast("회차가 성공적으로 삭제되었습니다.");
        } catch (error) {
            toast(error instanceof Error ? error.message : '회차 삭제에 실패했습니다.');
        }
    };

    // 회차 목록 조회 함수
    const fetchSchedules = async () => {
        if (!eventId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authManager.authenticatedFetch(`/api/events/${eventId}/schedule`);

            if (!response.ok) {
                throw new Error('회차 목록 조회에 실패했습니다.');
            }

            const schedules = await response.json();

            // 서버 응답을 UI 형식에 맞게 변환
            const formattedSchedules = schedules.map((schedule: any, index: number) => ({
                scheduleId: schedule.scheduleId,
                eventId: schedule.eventId,
                date: schedule.date,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                weekday: schedule.weekday,
                roundNumber: "", // 재할당됨
                hasActiveTickets: schedule.hasActiveTickets,
                soldTicketCount: schedule.soldTicketCount || 0,
                status: schedule.hasActiveTickets ? "티켓 설정 완료" : "티켓 설정 대기",
                statusColor: schedule.hasActiveTickets ? "bg-green-100" : "bg-yellow-100",
                textColor: schedule.hasActiveTickets ? "text-green-800" : "text-yellow-800"
            }));

            // 회차 번호 재할당
            setScheduleData(reassignScheduleNumbers(formattedSchedules));

        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            console.error('회차 조회 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 회차 목록 조회
    React.useEffect(() => {
        if (eventId) {
            fetchSchedules();
        }
    }, [eventId]);

    // 티켓 설정 완료 처리 함수
    const handleTicketSetupComplete = () => {
        // 티켓 설정 완료 후 목록 다시 조회하여 최신 상태 반영
        fetchSchedules();
    };

    const [scheduleData, setScheduleData] = useState([]);

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
                            <div className="flex items-center gap-6">
                                {/* 시작 날짜 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">시작 날짜</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-40 h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                {/* 종료 날짜 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">종료 날짜</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-40 h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                {/* 초기화 버튼 */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-2 opacity-0">초기화</label>
                                    <button
                                        onClick={() => {
                                            setStartDate("");
                                            setEndDate("");
                                        }}
                                        className="h-11 px-6 py-2 bg-gray-300 text-gray-700 rounded-[10px] hover:bg-gray-400 transition-colors [font-family:'Roboto-Medium',Helvetica] font-medium text-sm flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        초기화
                                    </button>
                                </div>
                            </div>

                            {/* 회차 추가 버튼 */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2 opacity-0">회차 추가</label>
                                <button
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setEditSchedule(null);
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
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                        <span className="text-gray-600">회차 목록을 불러오고 있습니다...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="text-red-600 mb-4">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
                                    <p className="text-gray-600 mb-4">{error}</p>
                                    <button
                                        onClick={() => fetchSchedules()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none"
                                    >
                                        다시 시도
                                    </button>
                                </div>
                            ) : scheduleData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 회차가 없습니다</h3>
                                    <p className="text-gray-600 mb-4">첫 번째 회차를 추가해보세요.</p>
                                    <button
                                        onClick={() => {
                                            setIsEditMode(false);
                                            setEditSchedule(null);
                                            setIsModalOpen(true);
                                        }}
                                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        회차 추가
                                    </button>
                                </div>
                            ) : (
                                scheduleData
                                    .filter(schedule => {
                                        // 날짜 필터링
                                        const startMatch = !startDate || schedule.date >= startDate;
                                        const endMatch = !endDate || schedule.date <= endDate;
                                        return startMatch && endMatch;
                                    })
                                    .map((schedule, index, filteredArray) => {
                                        // 이전 행과 같은 날짜인지 확인
                                        const showDate = index === 0 || filteredArray[index - 1].date !== schedule.date;

                                        return (
                                            <div
                                                key={schedule.scheduleId}
                                                className={`grid grid-cols-7 gap-3 py-5 px-6 text-sm items-center ${index !== filteredArray.length - 1 ? "border-b border-gray-200" : ""
                                                    }`}
                                            >
                                                <div className="text-gray-600 text-center min-w-[110px] truncate">
                                                    {showDate ? formatDateWithDay(schedule.date) : ""}
                                                </div>
                                                <div className="font-medium text-gray-900 text-center min-w-[60px]">{schedule.roundNumber}</div>
                                                <div className="text-center text-gray-600 min-w-[70px]">{schedule.startTime}</div>
                                                <div className="text-center text-gray-600 min-w-[70px]">{schedule.endTime}</div>
                                                <div className="text-center min-w-[100px]">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${schedule.statusColor} ${schedule.textColor}`}>
                                                        {schedule.status}
                                                    </span>
                                                </div>
                                                <div className="text-center min-w-[80px]">
                                                    <button
                                                        onClick={() => handleTicketSetup(schedule)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs whitespace-nowrap"
                                                    >
                                                        티켓 설정
                                                    </button>
                                                </div>
                                                <div className="text-center flex justify-center gap-2 min-w-[100px]">
                                                    <button
                                                        onClick={() => {
                                                            if (schedule.soldTicketCount > 0) {
                                                                alert("판매된 티켓이 있는 회차는 수정할 수 없습니다.");
                                                                return;
                                                            }
                                                            setEditSchedule(schedule);
                                                            setIsEditMode(true);
                                                            setIsModalOpen(true);
                                                        }}
                                                        disabled={schedule.soldTicketCount > 0}
                                                        className={`font-medium transition-colors text-xs whitespace-nowrap ${schedule.soldTicketCount > 0
                                                                ? "text-gray-400 cursor-not-allowed"
                                                                : "text-blue-600 hover:text-blue-800"
                                                            }`}
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (schedule.soldTicketCount > 0) {
                                                                alert("판매된 티켓이 있는 회차는 삭제할 수 없습니다.");
                                                                return;
                                                            }
                                                            handleDeleteSchedule(schedule);
                                                        }}
                                                        disabled={schedule.soldTicketCount > 0}
                                                        className={`font-medium transition-colors text-xs whitespace-nowrap ${schedule.soldTicketCount > 0
                                                                ? "text-gray-400 cursor-not-allowed"
                                                                : "text-red-600 hover:text-red-800"
                                                            }`}
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
                    {!loading && !error && (
                        <div className="mt-6 text-sm text-gray-600">
                            총 <span className="font-bold text-black">
                                {scheduleData.filter(round => {
                                    const startMatch = !startDate || round.date >= startDate;
                                    const endMatch = !endDate || round.date <= endDate;
                                    return startMatch && endMatch;
                                }).length}
                            </span>개의 회차
                        </div>
                    )}
                </div>
            </div>

            {/* 회차 추가/수정 모달 */}
            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditSchedule(null);
                }}
                onAddSchedule={(newRound) => {
                    // 새 회차 생성 후 목록 다시 조회
                    fetchSchedules();
                }}
                onUpdateSchedule={(updatedRound) => {
                    // 회차 수정 후 목록 다시 조회
                    fetchSchedules();
                }}
                editRound={editSchedule}
                isEditMode={isEditMode}
                eventId={eventId}
            />

            {/* 티켓 설정 모달 */}
            <ScheduleTicketModal
                isOpen={isScheduleTicketModalOpen}
                onClose={() => {
                    setIsScheduleTicketModalOpen(false);
                    setSelectedSchedule(null);
                }}
                round={selectedSchedule}
                onComplete={handleTicketSetupComplete}
                eventId={eventId}
            />
        </div>
    );
};

export default ScheduleManagement;