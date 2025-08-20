import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { hasEventManagerPermission } from "../utils/permissions";
import { getCachedRoleCode } from "../utils/role";
import authManager from "../utils/auth";

interface HostSideNavProps {
    className?: string;
}

export const HostSideNav: React.FC<HostSideNavProps> = ({ className = "" }) => {
    const location = useLocation();
    const userRole = getCachedRoleCode();
    const [managedEventId, setManagedEventId] = useState<number | null>(null);

    //userId를 기준으로 담당 행사 정보 가져오기
    useEffect(() => {
        const fetchManagedEvent = async () => {
            try {
                if (userRole === 'EVENT_MANAGER') {
                    const response = await authManager.authenticatedFetch('/api/events/manager/event');
                    if (response.ok) {
                        const eventId = await response.json();
                        setManagedEventId(eventId);
                        console.log('담당 행사 ID 조회 성공:', eventId);
                    }
                }
            } catch (error) {
                console.error('담당 행사 조회 실패:', error);
            }
        };

        fetchManagedEvent();
    }, [userRole]);

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
                                to="/host/edit-event-info"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/edit-event-info"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/edit-event-info" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/edit-event-info" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/edit-event-info" ? "black" : "#00000080";
                                }}
                            >
                                행사 상세 정보
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
                                행사 노출 상태
                            </Link>
                            <Link
                                to="/host/event-version"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/event-version"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/event-version" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/event-version" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/event-version" ? "black" : "#00000080";
                                }}
                            >
                                행사 버전 관리
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
                                to="/host/round-management"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/round-management"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/round-management" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/round-management" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/round-management" ? "black" : "#00000080";
                                }}
                            >
                                회차 관리
                            </Link>
                            <Link
                                to="/host/advertisement-application"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/advertisement-application"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/advertisement-application" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/advertisement-application" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/advertisement-application" ? "black" : "#00000080";
                                }}
                            >
                                광고 신청
                            </Link>
                        </div>
                    </div>

                    {/* 참가자 관리 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">참가자 관리</h3>
                        <div className="space-y-1">
                            <Link
                                to={managedEventId ? `/host/reservation-list/${managedEventId}` : "/host/reservation-list"}
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname.startsWith("/host/reservation-list")
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
                                참가자 명단
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
                        </div>
                    </div>

                    {/* 부스 관리 카테고리 - EVENT_MANAGER 권한 필요 */}
                    {hasEventManagerPermission(userRole || '') && (
                        <div className="mb-4 space-y-0">
                            <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">부스 관리</h3>
                            <div className="space-y-1">
                                <Link
                                    to={managedEventId ? `/host/events/${managedEventId}/booth-types` : "/host/booth-type"}
                                    className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname.includes("/booth-type")
                                        ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                        : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                        }`}
                                    style={{
                                        textDecoration: 'none',
                                        color: location.pathname.includes("/booth-type") ? "black" : "#00000080"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = location.pathname.includes("/booth-type") ? "black" : "#00000080";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = location.pathname.includes("/booth-type") ? "black" : "#00000080";
                                    }}
                                >
                                    부스 타입 관리
                                </Link>
                                <Link
                                    to={managedEventId ? `/host/events/${managedEventId}/booths` : "/host/booths"}
                                    className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname.includes("/booths") && !location.pathname.includes("/booth-applications")
                                        ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                        : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                        }`}
                                    style={{
                                        textDecoration: 'none',
                                        color: location.pathname.includes("/booths") && !location.pathname.includes("/booth-applications") ? "black" : "#00000080"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = location.pathname.includes("/booths") && !location.pathname.includes("/booth-applications") ? "black" : "#00000080";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = location.pathname.includes("/booths") && !location.pathname.includes("/booth-applications") ? "black" : "#00000080";
                                    }}
                                >
                                    참가 부스 목록
                                </Link>
                                <Link
                                    to={managedEventId ? `/host/events/${managedEventId}/booth-applications` : "/host/booth-applications"}
                                    className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname.includes("/booth-applications")
                                        ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                        : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                        }`}
                                    style={{
                                        textDecoration: 'none',
                                        color: location.pathname.includes("/booth-applications") ? "black" : "#00000080"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = location.pathname.includes("/booth-applications") ? "black" : "#00000080";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = location.pathname.includes("/booth-applications") ? "black" : "#00000080";
                                    }}
                                >
                                    부스 신청 목록
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* 부스 체험 카테고리 제거됨 */}

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

                    {/* 결제 관리 카테고리 - EVENT_MANAGER 권한 필요 */}
                    {hasEventManagerPermission(userRole || '') && (
                        <div className="mb-4 space-y-0">
                            <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">결제 관리</h3>
                            <div className="space-y-1">
                                <Link
                                    to="/host/payment-management"
                                    className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/payment-management"
                                        ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                        : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                        }`}
                                    style={{
                                        textDecoration: 'none',
                                        color: location.pathname === "/host/payment-management" ? "black" : "#00000080"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = location.pathname === "/host/payment-management" ? "black" : "#00000080";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = location.pathname === "/host/payment-management" ? "black" : "#00000080";
                                    }}
                                >
                                    결제 정보 관리
                                </Link>
                                <Link
                                    to="/host/refund-management"
                                    className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/refund-management"
                                        ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                        : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                        }`}
                                    style={{
                                        textDecoration: 'none',
                                        color: location.pathname === "/host/refund-management" ? "black" : "#00000080"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = location.pathname === "/host/refund-management" ? "black" : "#00000080";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = location.pathname === "/host/refund-management" ? "black" : "#00000080";
                                    }}
                                >
                                    환불 신청 관리
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* 통계 리포트 카테고리 - EVENT_MANAGER 권한 필요 */}
                    {hasEventManagerPermission(userRole || '') && (
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
                    )}

                    {/* 내 정보 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">내 정보 관리</h3>
                        <div className="space-y-1">
                            <Link
                                to="/host/profile"
                                className={`block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === "/host/profile"
                                    ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                                    : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    color: location.pathname === "/host/profile" ? "black" : "#00000080"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/profile" ? "black" : "#00000080";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = location.pathname === "/host/profile" ? "black" : "#00000080";
                                }}
                            >
                                내 정보 조회
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};
