import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { hasHostPermission, hasBoothManagerPermission } from '../../utils/permissions';

const KakaoCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const didRequest = useRef(false);

    useEffect(() => {
        const code = new URLSearchParams(location.search).get('code');
        if (!code) {
            toast.error('카카오 로그인에 실패했습니다.');
            navigate('/login');
            return;
        }
        if (didRequest.current) return; // 중복 방지
        didRequest.current = true;

        const handleKakaoLogin = async (code: string) => {
            try {
                console.log('카카오 로그인 시도 - code:', code);
                console.log('User Agent:', navigator.userAgent);
                console.log('Current URL:', window.location.href);
                
                const response = await api.post('/api/auth/kakao', { code }); // POST JSON!
                const { accessToken, refreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                toast.success('카카오 로그인에 성공했습니다!');

                // accessToken에서 사용자 역할 추출
                try {
                    const payload = JSON.parse(atob(accessToken.split('.')[1]));
                    const userRole = payload.role;

                    // 권한별 리다이렉션
                    if (hasHostPermission(userRole)) {
                        navigate("/host/dashboard");
                    } else if (hasBoothManagerPermission(userRole)) {
                        navigate("/booth-admin/dashboard");
                    } else {
                        navigate("/");
                    }
                } catch (error) {
                    console.error("토큰 파싱 실패:", error);
                    navigate("/"); // 기본적으로 메인 페이지로
                }
            } catch (error) {
                toast.error('카카오 로그인에 실패했습니다.');
                navigate('/login');
            }
        };
        handleKakaoLogin(code);
    }, [location, navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <p>카카오 로그인 처리 중...</p>
        </div>
    );
};

export default KakaoCallback;
