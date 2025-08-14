import React, { useState } from "react";
import authManager from "../../utils/auth";
import {toast} from "react-toastify";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSchedule: (round: any) => void;
    onUpdateSchedule?: (round: any) => void;
    editRound?: any;
    isEditMode?: boolean;
    eventId: number;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
    isOpen, 
    onClose,
    onAddSchedule,
    onUpdateSchedule,
    editRound, 
    isEditMode = false,
    eventId
}) => {
    const [formData, setFormData] = useState({
        date: "",
        startTime: "",
        endTime: "",
        weekday: 0
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let updatedData = {
            ...formData,
            [name]: value
        };

        // 날짜가 변경되면 weekday 자동 계산
        if (name === 'date' && value) {
            const dateObj = new Date(value);
            updatedData.weekday = dateObj.getDay();
        }
        
        setFormData(updatedData);
    };

    // 시작/종료 시각 => 00 : 00 ~ 23 : 50 분 까지 10분 간격으로 설정
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

    React.useEffect(() => {
        if (isEditMode && editRound) {
            
            // 시간 형식 변환 (HH:MM:SS -> HH:MM)
            const formatTime = (time: string) => {
                if (!time) return "";
                return time.substring(0, 5); // "02:40:00" -> "02:40"
            };
            
            setFormData({
                date: editRound.date || "",
                startTime: formatTime(editRound.startTime),
                endTime: formatTime(editRound.endTime),
                weekday: editRound.weekday || 0
            });
        } else {
            setFormData({
                date: "",
                startTime: "",
                endTime: "",
                weekday: 0
            });
        }
    }, [isEditMode, editRound]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 필수 필드 검증
        if (!formData.date || !formData.startTime || !formData.endTime) {
            toast("모든 필드를 입력해주세요.");
            return;
        }

        try {
            if (isEditMode) {
                // 수정 모드 - 서버 API 호출
                const updateScheduleRequest = {
                    date: formData.date,
                    startTime: formData.startTime,
                    endTime: formData.endTime
                };

                const response = await authManager.authenticatedFetch(`/api/events/${eventId}/schedule/${editRound.scheduleId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateScheduleRequest)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '회차 수정에 실패했습니다.');
                }

                const updatedSchedule = await response.json();
                
                // 성공시 UI 업데이트를 위한 데이터 구조 변환
                const scheduleData = {
                    scheduleId: updatedSchedule.scheduleId,
                    eventId: updatedSchedule.eventId,
                    date: updatedSchedule.date,
                    startTime: updatedSchedule.startTime,
                    endTime: updatedSchedule.endTime,
                    weekday: updatedSchedule.weekday,
                    status: editRound.status, // UI 상태 유지
                    statusColor: editRound.statusColor,
                    textColor: editRound.textColor,
                    roundNumber: editRound.roundNumber // UI 상태 유지
                };

                if (onUpdateSchedule) {
                    onUpdateSchedule(scheduleData);
                    toast.success("회차가 성공적으로 수정되었습니다.");
                }
            } else {
                // 새로 생성 - 서버 API 호출
                const createScheduleRequest = {
                    date: formData.date,
                    startTime: formData.startTime,
                    endTime: formData.endTime
                };

                const response = await authManager.authenticatedFetch(`/api/events/${eventId}/schedule`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(createScheduleRequest),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '회차 생성에 실패했습니다.');
                }

                const createdSchedule = await response.json();
                
                // 성공시 UI 업데이트를 위한 데이터 구조 변환
                const scheduleData = {
                    scheduleId: createdSchedule.scheduleId,
                    eventId: createdSchedule.eventId,
                    date: createdSchedule.date,
                    startTime: createdSchedule.startTime,
                    endTime: createdSchedule.endTime,
                    weekday: createdSchedule.weekday,
                    status: "티켓 설정 대기",
                    statusColor: "bg-yellow-100",
                    textColor: "text-yellow-800",
                    roundNumber: "" // 부모 컴포넌트에서 재할당됨
                };

                onAddSchedule(scheduleData);
                toast.success("회차가 성공적으로 추가되었습니다.");
            }

            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '회차 저장에 실패했습니다.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-[10px] shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "회차 수정" : "회차 추가"}</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            관람일
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

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