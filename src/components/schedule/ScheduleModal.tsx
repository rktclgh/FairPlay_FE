import React, { useState } from "react";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddRound: (round: any) => void;
    onUpdateRound?: (round: any) => void;
    editRound?: any;
    isEditMode?: boolean;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
    isOpen, 
    onClose, 
    onAddRound, 
    onUpdateRound, 
    editRound, 
    isEditMode = false 
}) => {
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
            setFormData({
                viewingDate: editRound.viewingDate,
                startTime: editRound.startTime,
                endTime: editRound.endTime
            });
        } else {
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
                            name="viewingDate"
                            value={formData.viewingDate}
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