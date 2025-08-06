import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

export default function WarningModal({ isOpen, onClose, title, message }: WarningModalProps): JSX.Element {
    if (!isOpen) return <></>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-base leading-6 mb-6">
                    {message}
                </p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
} 