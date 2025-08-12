import React from "react";
import { Link, useLocation } from "react-router-dom";
import { hasAdminPermission } from "../utils/permissions";
import { getCachedRoleCode } from "../utils/role";

interface AdminSideNavProps {
    className?: string;
}

export const AdminSideNav: React.FC<AdminSideNavProps> = ({ className = "" }) => {
    const location = useLocation();
    const role = getCachedRoleCode();

    // ADMIN이 아니면 렌더링하지 않음 (라우트 가드가 추가되면 이 체크는 보조 수단)
    if (!role || !hasAdminPermission(role)) {
        return null;
    }

    const linkClass = (path: string) =>
        `block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${location.pathname === path
            ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
            : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
        }`;

    const linkStyle = (path: string) => ({
        textDecoration: "none",
        color: location.pathname === path ? "black" : "#00000080",
    } as React.CSSProperties);

    return (
        <div className={`w-[240px] h-[800px] bg-white ${className}`}>
            <div className="p-6">
                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[40px] whitespace-nowrap mb-4 text-left">
                    ADMIN
                </h2>

                <nav className="text-left">
                    {/* 대시보드 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            대시보드
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin/dashboard"
                                className={linkClass("/admin/dashboard")}
                                style={linkStyle("/admin/dashboard")}
                            >
                                플랫폼 KPI
                            </Link>
                            <Link
                                to="/admin/event-comparison"
                                className={linkClass("/admin/event-comparison")}
                                style={linkStyle("/admin/event-comparison")}
                            >
                                행사별 비교 지표
                            </Link>
                        </div>
                    </div>

                    {/* 행사 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            행사 관리
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin/events"
                                className={linkClass("/admin/events")}
                                style={linkStyle("/admin/events")}
                            >
                                행사 목록
                            </Link>
                            <Link
                                to="/admin/event-approvals"
                                className={linkClass("/admin/event-approvals")}
                                style={linkStyle("/admin/event-approvals")}
                            >
                                행사 등록 승인
                            </Link>
                            <Link
                                to="/admin/event-edit-requests"
                                className={linkClass("/admin/event-edit-requests")}
                                style={linkStyle("/admin/event-edit-requests")}
                            >
                                행사 상세 수정 요청 목록
                            </Link>
                        </div>
                    </div>

                    {/* 계정 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            계정 관리
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin/accounts/issue"
                                className={linkClass("/admin/accounts/issue")}
                                style={linkStyle("/admin/accounts/issue")}
                            >
                                계정 발급
                            </Link>
                            <Link
                                to="/admin/accounts/roles"
                                className={linkClass("/admin/accounts/roles")}
                                style={linkStyle("/admin/accounts/roles")}
                            >
                                권한 설정
                            </Link>
                        </div>
                    </div>

                    {/* VIP 배너 광고 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            VIP 배너 광고
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin/vip-banners"
                                className={linkClass("/admin/vip-banners")}
                                style={linkStyle("/admin/vip-banners")}
                            >
                                배너 관리
                            </Link>
                        </div>
                    </div>

                    {/* 정산 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            정산 관리
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin/settlements"
                                className={linkClass("/admin/settlements")}
                                style={linkStyle("/admin/settlements")}
                            >
                                매출 정산
                            </Link>
                            <Link
                                to="/admin/remittances"
                                className={linkClass("/admin/remittances")}
                                style={linkStyle("/admin/remittances")}
                            >
                                송금 내역
                            </Link>
                        </div>
                    </div>

                    {/* 통합 통계 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            통합 통계
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin/analytics/reservations"
                                className={linkClass("/admin/analytics/reservations")}
                                style={linkStyle("/admin/analytics/reservations")}
                            >
                                예약 통계
                            </Link>
                            <Link
                                to="/admin/analytics/popular"
                                className={linkClass("/admin/analytics/popular")}
                                style={linkStyle("/admin/analytics/popular")}
                            >
                                인기 행사
                            </Link>
                        </div>
                    </div>

                    {/* 시스템 설정 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            시스템 설정
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin/settings/integrations"
                                className={linkClass("/admin/settings/integrations")}
                                style={linkStyle("/admin/settings/integrations")}
                            >
                                연동 설정
                            </Link>
                            <Link
                                to="/admin/settings/message-templates"
                                className={linkClass("/admin/settings/message-templates")}
                                style={linkStyle("/admin/settings/message-templates")}
                            >
                                메시지 템플릿
                            </Link>
                        </div>
                    </div>

                    {/* 로그/보안 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            로그/보안
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin/logs/access"
                                className={linkClass("/admin/logs/access")}
                                style={linkStyle("/admin/logs/access")}
                            >
                                접속 이력
                            </Link>
                            <Link
                                to="/admin/logs/changes"
                                className={linkClass("/admin/logs/changes")}
                                style={linkStyle("/admin/logs/changes")}
                            >
                                변경 기록
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};


