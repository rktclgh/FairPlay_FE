import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
    AttendeeInfoResponseDto
} from "../services/types/attendeeType";

interface EditParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    participant: AttendeeInfoResponseDto | null;
    onSave: (updatedParticipant: AttendeeInfoResponseDto) => void;
}

export default function EditParticipantModal({
    isOpen,
    onClose,
    participant,
    onSave
}: EditParticipantModalProps): JSX.Element {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
    });

    useEffect(() => {
        if (participant) {
            setFormData({
                name: participant.name,
                phone: participant.phone,
                email: participant.email
            });
        }
    }, [participant]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // 숫자만 허용하고 11자리로 제한
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length <= 11) {
                // 하이픈 자동 추가
                let formattedValue = numericValue;
                if (numericValue.length >= 3 && numericValue.length <= 7) {
                    formattedValue = numericValue.slice(0, 3) + '-' + numericValue.slice(3);
                } else if (numericValue.length >= 8) {
                    formattedValue = numericValue.slice(0, 3) + '-' + numericValue.slice(3, 7) + '-' + numericValue.slice(7);
                }

                setFormData(prev => ({
                    ...prev,
                    [name]: formattedValue
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.email) {
            alert(t('mypage.participantForm.validationError'));
            return;
        }

        if (!participant) return;

        const updatedParticipant: AttendeeInfoResponseDto = {
            ...participant,
            name: formData.name,
            phone: formData.phone,
            email: formData.email
        };

        onSave(updatedParticipant);
        onClose();
    };

    if (!isOpen || !participant) return <></>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl tracking-[0] leading-[30px]">
                        {t('mypage.participantList.editTitle')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* 내용 */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* 이름 */}
                        <div>
                            <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">
                                {t('common.name')}
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder={t('mypage.participantForm.namePlaceholder')}
                                className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black"
                            />
                        </div>

                        {/* 휴대폰 번호 */}
                        <div>
                            <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">
                                {t('common.phone')}
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder={t('mypage.participantForm.phonePlaceholder')}
                                maxLength={13}
                                className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black"
                            />
                        </div>

                        {/* 이메일 */}
                        <div>
                            <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">
                                {t('common.email')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder={t('mypage.participantForm.emailPlaceholder')}
                                className="w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black"
                            />
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-[10px] hover:bg-gray-400 transition-colors [font-family:'Roboto-Medium',Helvetica] font-medium text-sm"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.name || !formData.phone || !formData.email}
                            className={`px-6 py-2 rounded-[10px] transition-colors text-sm [font-family:'Roboto-Medium',Helvetica] font-medium ${formData.name && formData.phone && formData.email
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                                }`}
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 