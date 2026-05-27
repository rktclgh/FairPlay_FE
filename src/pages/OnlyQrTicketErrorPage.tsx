import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();
    const state = location.state as { title?: unknown; message?: unknown } | null;
    const title = typeof state?.title === "string" ? state.title : "죄송합니다";
    const message =
        typeof state?.message === "string"
            ? state.message
            : "QR 티켓 정보를 불러올 수 없습니다. 링크를 다시 확인해주세요.";

    const handleClose = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate("/");
    };

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
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="닫기"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-base leading-6 mb-6">
                    {message}
                </p>
                <button
                    type="button"
                    onClick={handleClose}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    닫기
                </button>
            </div>
        </div>
    );
}
