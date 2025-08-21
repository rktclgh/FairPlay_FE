import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { hasBoothManagerPermission } from "../utils/permissions";
import { getCachedRoleCode } from "../utils/role";

interface BoothAdminSideNavProps {
    className?: string;
}

export const BoothAdminSideNav: React.FC<BoothAdminSideNavProps> = ({ className = "" }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const role = getCachedRoleCode();

    // BOOTH_MANAGER가 아니면 렌더링하지 않음
    if (!role || !hasBoothManagerPermission(role)) {
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
                    BOOTH ADMIN
                </h2>

                <nav className="text-left">
                    {/* 대시보드 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            대시보드
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/booth-admin/dashboard"
                                className={linkClass("/booth-admin/dashboard")}
                                style={linkStyle("/booth-admin/dashboard")}
                            >
                                부스 현황
                            </Link>
                        </div>
                    </div>

                    {/* 부스 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            부스 관리
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/booth-admin/info-management"
                                className={linkClass("/booth-admin/info-management")}
                                style={linkStyle("/booth-admin/info-management")}
                            >
                                부스 정보 관리
                            </Link>
                            <Link
                                to="/booth-admin/experience-management"
                                className={linkClass("/booth-admin/experience-management")}
                                style={linkStyle("/booth-admin/experience-management")}
                            >
                                체험 관리
                            </Link>
                        </div>
                    </div>

                    {/* 예약 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            예약 관리
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/booth-admin/experience-reserver-management"
                                className={linkClass("/booth-admin/experience-reserver-management")}
                                style={linkStyle("/booth-admin/experience-reserver-management")}
                            >
                                예약 현황
                            </Link>
                            <Link
                                to="/booth-admin/qr-scan"
                                className={linkClass("/booth-admin/qr-scan")}
                                style={linkStyle("/booth-admin/qr-scan")}
                            >
                                QR 스캔
                            </Link>
                        </div>
                    </div>

                    {/* 내 정보 관리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            내 정보 관리
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/booth-admin/profile"
                                className={linkClass("/booth-admin/profile")}
                                style={linkStyle("/booth-admin/profile")}
                            >
                                내 정보 조회
                            </Link>
                        </div>
                    </div>

                    {/* 전자명함 카테고리 */}
                    <div className="mb-4 space-y-0">
                        <h3 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[54px] whitespace-nowrap">
                            {t('admin.businessCard.title')}
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/mypage/business-card"
                                className={linkClass("/mypage/business-card")}
                                style={linkStyle("/mypage/business-card")}
                            >
                                {t('admin.businessCard.myCard')}
                            </Link>
                            <Link
                                to="/mypage/business-card-wallet"
                                className={linkClass("/mypage/business-card-wallet")}
                                style={linkStyle("/mypage/business-card-wallet")}
                            >
                                {t('admin.businessCard.wallet')}
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};