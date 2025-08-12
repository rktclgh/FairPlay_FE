import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasHostPermission } from '../utils/permissions';
import { getRoleCode } from '../utils/role';

interface HostRouteGuardProps {
    children: React.ReactNode;
}

export const HostRouteGuard: React.FC<HostRouteGuardProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkPermission = async () => {
            const roleCode = await getRoleCode();

            if (!roleCode) {
                navigate('/login');
                return;
            }

            if (hasHostPermission(roleCode)) {
                setIsAuthorized(true);
            } else {
                navigate('/');
            }
        };

        checkPermission();
    }, [navigate]);

    // 권한 확인 중이거나 권한이 없는 경우 로딩 표시
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

    // 권한이 있는 경우에만 자식 컴포넌트 렌더링
    return isAuthorized ? <>{children}</> : null;
};
