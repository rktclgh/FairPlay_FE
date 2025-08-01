import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';

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
                const response = await api.post('/api/auth/kakao', { code }); // POST JSON!
                const { accessToken, refreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                toast.success('카카오 로그인에 성공했습니다!');
                navigate('/');
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
