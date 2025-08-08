import React from "react";
import { Link, useLocation } from "react-router-dom";

interface AttendeeSideNavProps {
    className?: string;
}

export const AttendeeSideNav: React.FC<AttendeeSideNavProps> = ({ className = "" }) => {
    const location = useLocation();

    return (
        <div className={`w-[240px] h-[800px] bg-white ${className}`}>
            <div className="p-6">
                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[40px] whitespace-nowrap mb-4 text-left">MY PAGE</h2>

                <nav className="text-left">
                    {/* 예매 정보 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">예매 정보</h3>
                        <div className="space-y-1">
                            <Link
                                to="/mypage/reservation"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/mypage/reservation"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/mypage/reservation" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/reservation" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/reservation" ? "black" : "#00000080";
                                }}
                            >
                                예약/결제
                            </Link>
                            <Link
                                to="/mypage/tickets"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/mypage/tickets"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/mypage/tickets" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/tickets" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/tickets" ? "black" : "#00000080";
                                }}
                            >
                                내 티켓
                            </Link>
                            <div className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] tracking-[0] whitespace-nowrap">취소/환불</div>
                        </div>
                    </div>

                    {/* 내 정보 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">내 정보</h3>
                        <div className="space-y-1">
                            <Link
                                to="/mypage/info"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/mypage/info"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/mypage/info" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/info" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/info" ? "black" : "#00000080";
                                }}
                            >
                                내 정보 조회
                            </Link>
                            <Link
                                to="/mypage/account"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/mypage/account"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/mypage/account" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/account" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/account" ? "black" : "#00000080";
                                }}
                            >
                                환불계좌정보
                            </Link>
                            <Link
                                to="/mypage/favorites"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/mypage/favorites"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/mypage/favorites" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/favorites" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/mypage/favorites" ? "black" : "#00000080";
                                }}
                            >
                                관심
                            </Link>
                            <Link
                                to="/mypage/write-review"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/mypage/write-review" || location.pathname === "/mypage/my-review"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: (location.pathname === "/mypage/write-review" || location.pathname === "/mypage/my-review") ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = (location.pathname === "/mypage/write-review" || location.pathname === "/mypage/my-review") ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = (location.pathname === "/mypage/write-review" || location.pathname === "/mypage/my-review") ? "black" : "#00000080";
                                }}
                            >
                                관람평
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}; 