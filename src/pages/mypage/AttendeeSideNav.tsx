import React from "react";
import { Link } from "react-router-dom";

interface AttendeeSideNavProps {
    className?: string;
}

export const AttendeeSideNav: React.FC<AttendeeSideNavProps> = ({ className = "" }) => {
    return (
        <div className={`w-[240px] h-[800px] bg-white ${className}`}>
            <div className="p-6">
                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[40px] whitespace-nowrap mb-4 text-left">MY PAGE</h2>

                <nav className="text-left">
                    {/* 예매 정보 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">예매 정보</h3>
                        <div className="space-y-1">
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] tracking-[0] whitespace-nowrap">예약/결제</div>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] tracking-[0] whitespace-nowrap">나의 예약/QR</div>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] tracking-[0] whitespace-nowrap">취소/환불</div>
                        </div>
                    </div>

                    {/* 내 정보 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">내 정보</h3>
                        <div className="space-y-1">
                            <Link
                                to="/mypage/info"
                                className="block text-black hover:text-gray-600 transition-colors cursor-pointer [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base tracking-[0] whitespace-nowrap"
                            >
                                내 정보 조회
                            </Link>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] tracking-[0] whitespace-nowrap">환불계좌정보</div>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] tracking-[0] whitespace-nowrap">관심</div>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] tracking-[0] whitespace-nowrap">관람평</div>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}; 