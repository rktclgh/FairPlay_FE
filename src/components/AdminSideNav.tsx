import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { hasAdminPermission } from "../utils/permissions";
import { getCachedRoleCode } from "../utils/role";

interface AdminSideNavProps {
    className?: string;
}

export const AdminSideNav: React.FC<AdminSideNavProps> = ({ className = "" }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const role = getCachedRoleCode();

    // ADMIN이 아니면 렌더링하지 않음 (라우트 가드가 추가되면 이 체크는 보조 수단)
    if (!role || !hasAdminPermission(role)) {
        return null;
    }

    const linkClass = (path: string, isParentPath: boolean = false) =>
        `block cursor-pointer text-[15px] tracking-[0] whitespace-nowrap no-underline ${isParentPath
            ? location.pathname.startsWith(path)
                ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
            : location.pathname === path
                ? "[font-family:'Roboto-Bold',Helvetica] font-bold text-black"
                : "[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080]"
        }`;

    const linkStyle = (path: string, isParentPath: boolean = false) => ({
        textDecoration: "none",
        color: isParentPath
            ? location.pathname.startsWith(path) ? "black" : "#00000080"
            : location.pathname === path ? "black" : "#00000080",
    } as React.CSSProperties);

    return (
        <div className={`w-[240px] h-[800px] bg-white ${className}`}>
            <div className="p-6">
                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[40px] whitespace-nowrap mb-4 text-left">
                    {t('admin.title')}
                </h2>

                <nav className="text-left">
                    {/* 대시보드 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.dashboard.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard"
                                className={linkClass("/admin_dashboard")}
                                style={linkStyle("/admin_dashboard")}
                            >
                                {t('admin.dashboard.platformKpi')}
                            </Link>
                            <Link
                                to="/admin_dashboard/event-comparison"
                                className={linkClass("/admin_dashboard/event-comparison")}
                                style={linkStyle("/admin_dashboard/event-comparison")}
                            >
                                {t('admin.dashboard.eventComparison')}
                            </Link>
                        </div>
                    </div>

                    {/* 행사 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.eventManagement.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard/events"
                                className={linkClass("/admin_dashboard/events")}
                                style={linkStyle("/admin_dashboard/events")}
                            >
                                {t('admin.eventManagement.eventList')}
                            </Link>
                            <Link
                                to="/admin_dashboard/event-approvals"
                                className={linkClass("/admin_dashboard/event-approvals", true)}
                                style={linkStyle("/admin_dashboard/event-approvals", true)}
                            >
                                {t('admin.eventManagement.eventApproval')}
                            </Link>
                            <Link
                                to="/admin_dashboard/event-edit-requests"
                                className={linkClass("/admin_dashboard/event-edit-requests")}
                                style={linkStyle("/admin_dashboard/event-edit-requests")}
                            >
                                {t('admin.eventManagement.eventEditRequests')}
                            </Link>
                        </div>
                    </div>

                    {/* 계정 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.accountManagement.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard/accounts/roles"
                                className={linkClass("/admin_dashboard/accounts/roles")}
                                style={linkStyle("/admin_dashboard/accounts/roles")}
                            >
                                {t('admin.accountManagement.roleSettings')}
                            </Link>
                        </div>
                    </div>

                    {/* VIP 배너 광고 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.vipBanner.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard/vip-banners"
                                className={linkClass("/admin_dashboard/vip-banners")}
                                style={linkStyle("/admin_dashboard/vip-banners")}
                            >
                                {t('admin.vipBanner.bannerManagement')}
                            </Link>
                            <Link
                                to="/admin_dashboard/advertisement-applications"
                                className={linkClass("/admin_dashboard/advertisement-applications")}
                                style={linkStyle("/admin_dashboard/advertisement-applications")}
                            >
                                {t('admin.vipBanner.adApplications')}
                            </Link>
                        </div>
                    </div>

                    {/* 정산 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.settlement.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard/settlements"
                                className={linkClass("/admin_dashboard/settlements")}
                                style={linkStyle("/admin_dashboard/settlements")}
                            >
                                {t('admin.settlement.revenueStats')}
                            </Link>
                            <Link
                                to="/admin_dashboard/remittances"
                                className={linkClass("/admin_dashboard/remittances")}
                                style={linkStyle("/admin_dashboard/remittances")}
                            >
                                {t('admin.settlement.remittanceSettlement')}
                            </Link>
                        </div>
                    </div>

                    {/* 결제 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.paymentManagement.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard/payments"
                                className={linkClass("/admin_dashboard/payments")}
                                style={linkStyle("/admin_dashboard/payments")}
                            >
                                {t('admin.paymentManagement.paymentInfo')}
                            </Link>
                            <Link
                                to="/admin_dashboard/refunds"
                                className={linkClass("/admin_dashboard/refunds")}
                                style={linkStyle("/admin_dashboard/refunds")}
                            >
                                {t('admin.paymentManagement.refundManagement')}
                            </Link>
                        </div>
                    </div>

                    {/* 통합 통계 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.statistics.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard/analytics/reservations"
                                className={linkClass("/admin_dashboard/analytics/reservations")}
                                style={linkStyle("/admin_dashboard/analytics/reservations")}
                            >
                                {t('admin.statistics.reservationStats')}
                            </Link>
                            <Link
                                to="/admin_dashboard/analytics/popular"
                                className={linkClass("/admin_dashboard/analytics/popular")}
                                style={linkStyle("/admin_dashboard/analytics/popular")}
                            >
                                {t('admin.statistics.popularEvents')}
                            </Link>
                        </div>
                    </div>

                    {/* 시스템 설정 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.systemSettings.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard/settings/integrations"
                                className={linkClass("/admin_dashboard/settings/integrations")}
                                style={linkStyle("/admin_dashboard/settings/integrations")}
                            >
                                {t('admin.systemSettings.integrationSettings')}
                            </Link>
                            <Link
                                to="/admin_dashboard/settings/message-templates"
                                className={linkClass("/admin_dashboard/settings/message-templates")}
                                style={linkStyle("/admin_dashboard/settings/message-templates")}
                            >
                                {t('admin.systemSettings.emailTemplates')}
                            </Link>
                        </div>
                    </div>

                    {/* 로그/보안 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.security.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard/logs/access"
                                className={linkClass("/admin_dashboard/logs/access")}
                                style={linkStyle("/admin_dashboard/logs/access")}
                            >
                                {t('admin.security.accessLogs')}
                            </Link>
                            <Link
                                to="/admin_dashboard/logs/changes"
                                className={linkClass("/admin_dashboard/logs/changes")}
                                style={linkStyle("/admin_dashboard/logs/changes")}
                            >
                                {t('admin.security.changeLogs')}
                            </Link>
                        </div>
                    </div>

                    {/* 내 정보 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.profile.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/admin_dashboard/profile"
                                className={linkClass("/admin_dashboard/profile")}
                                style={linkStyle("/admin_dashboard/profile")}
                            >
                                {t('admin.profile.myInfo')}
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};


