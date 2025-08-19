import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLocation } from "react-router-dom";

// 스크롤바 숨기기 CSS
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

// 비회원 QR 티켓 조회 페이지
export const OnlyQrTicketErrorPage = () => {
    const location = useLocation();
    const { title, message } = location.state;
    
    useEffect(() => {
    }, []);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
             <style>{scrollbarHideStyles}</style>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg">
                            {title}
                        </h3>
                    </div>
                </div>
                <p className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-base leading-6 mb-6">
                    {message}
                </p>
            </div>
        </div>
    );
}
