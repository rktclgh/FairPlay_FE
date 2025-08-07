import React from "react";
import { Link, useLocation } from "react-router-dom";

interface HostSideNavProps {
    className?: string;
}

export const HostSideNav: React.FC<HostSideNavProps> = ({ className = "" }) => {
    const location = useLocation();

    return (
        <div className={`w-[240px] h-[800px] bg-white ${className}`}>
            <div className="p-6">
                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[40px] whitespace-nowrap mb-4 text-left">HOST PAGE</h2>

                <nav className="text-left">
                    {/* 대시보드 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">대시보드</h3>
                        <div className="space-y-1">
                            <Link
                                to="/host/dashboard"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/dashboard"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/dashboard" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/dashboard" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/dashboard" ? "black" : "#00000080";
                                }}
                            >
                                행사 요약 정보
                            </Link>
                        </div>
                    </div>

                    {/* 행사 관리 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">행사 관리</h3>
                        <div className="space-y-1">
                            <Link
                                to="/host/event-edit"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/event-edit"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/event-edit" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/event-edit" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/event-edit" ? "black" : "#00000080";
                                }}
                            >
                                행사 정보 수정
                            </Link>
                            <Link
                                to="/host/ticket-management"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/ticket-management"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/ticket-management" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/ticket-management" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/ticket-management" ? "black" : "#00000080";
                                }}
                            >
                                티켓 관리
                            </Link>
                            <Link
                                to="/host/session-management"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/session-management"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/session-management" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/session-management" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/session-management" ? "black" : "#00000080";
                                }}
                            >
                                회차 관리
                            </Link>
                            <Link
                                to="/host/status-management"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/status-management"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/status-management" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/status-management" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/status-management" ? "black" : "#00000080";
                                }}
                            >
                                상태 관리
                            </Link>
                        </div>
                    </div>

                    {/* 참가자 관리 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">참가자 관리</h3>
                        <div className="space-y-1">
                            <Link
                                to="/host/reservation-list"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/reservation-list"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/reservation-list" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/reservation-list" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/reservation-list" ? "black" : "#00000080";
                                }}
                            >
                                예약자 명단
                            </Link>
                            <Link
                                to="/host/reservation-stats"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/reservation-stats"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/reservation-stats" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/reservation-stats" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/reservation-stats" ? "black" : "#00000080";
                                }}
                            >
                                예약 통계 요약
                            </Link>
                            <Link
                                to="/host/inquiry-history"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/inquiry-history"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/inquiry-history" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/inquiry-history" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/inquiry-history" ? "black" : "#00000080";
                                }}
                            >
                                문의 내역
                            </Link>
                        </div>
                    </div>

                    {/* 부스 관리 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">부스 관리</h3>
                        <div className="space-y-1">
                            <Link
                                to="/host/booth-type"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/booth-type"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/booth-type" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/booth-type" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/booth-type" ? "black" : "#00000080";
                                }}
                            >
                                부스 타입 관리
                            </Link>
                            <Link
                                to="/host/booth-applications"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/booth-applications"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/booth-applications" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/booth-applications" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/booth-applications" ? "black" : "#00000080";
                                }}
                            >
                                부스 신청 목록
                            </Link>
                        </div>
                    </div>

                    {/* 체크인 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">체크인</h3>
                        <div className="space-y-1">
                            <Link
                                to="/host/qr-scan"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/qr-scan"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/qr-scan" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/qr-scan" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/qr-scan" ? "black" : "#00000080";
                                }}
                            >
                                QR 스캔
                            </Link>
                        </div>
                    </div>

                    {/* 통계 리포트 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">통계 리포트</h3>
                        <div className="space-y-1">
                            <Link
                                to="/host/booking-analysis"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/booking-analysis"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/booking-analysis" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/booking-analysis" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/booking-analysis" ? "black" : "#00000080";
                                }}
                            >
                                예매율 분석
                            </Link>
                            <Link
                                to="/host/revenue-summary"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/revenue-summary"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/revenue-summary" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/revenue-summary" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/revenue-summary" ? "black" : "#00000080";
                                }}
                            >
                                매출 요약
                            </Link>
                            <Link
                                to="/host/time-analysis"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/time-analysis"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/time-analysis" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/time-analysis" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/time-analysis" ? "black" : "#00000080";
                                }}
                            >
                                시간대별 분석
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};
