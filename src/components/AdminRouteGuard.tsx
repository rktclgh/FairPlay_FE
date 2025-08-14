import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAdminPermission } from '../utils/permissions';
import { getRoleCode } from '../utils/role';

interface AdminRouteGuardProps {
    children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            const role = await getRoleCode();
            if (!role) {
                navigate('/login');
                return;
            }
            if (hasAdminPermission(role)) {
                setIsAuthorized(true);
            } else {
                navigate('/');
            }
        };
        check();
    }, [navigate]);

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">권한을 확인하고 있습니다...</p>
                </div>
            </div>
        );
    }

    return isAuthorized ? <>{children}</> : null;
};


