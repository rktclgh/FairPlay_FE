import React from "react";
import { CheckCircle } from "lucide-react";

interface Participant {
    id: number;
    name: string;
    phone: string;
    email: string;
}

interface RegistrationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    participant: Participant | null;
    eventName: string;
}

export default function RegistrationSuccessModal({
    isOpen,
    onClose,
    participant,
    eventName
}: RegistrationSuccessModalProps): JSX.Element {
    if (!isOpen) return <></>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8 text-center">
                    {/* 성공 아이콘 */}
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>

                    {/* 성공 메시지 */}
                    <div className="mb-8">
                        <div className="mb-2">
                            <p className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg">
                                {eventName}
                            </p>
                        </div>
                        <p className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-600 text-base leading-6">
                            참여자 등록이 완료되었습니다.
                        </p>
                    </div>

                    {/* 참여자 정보 */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <div className="space-y-3 text-left">
                            <div className="flex justify-between">
                                <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-700 text-sm">
                                    이름
                                </span>
                                <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                    {participant?.name}
                                </span>
                            </div>                          
                            <div className="flex justify-between">
                                <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-700 text-sm">
                                    휴대폰 번호
                                </span>
                                <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                    {participant?.phone}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-700 text-sm">
                                    이메일
                                </span>
                                <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-900 text-sm">
                                    {participant?.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 확인 버튼 */}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-[10px] hover:bg-gray-50 transition-colors [font-family:'Roboto-Medium',Helvetica] font-medium text-xs"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
} 