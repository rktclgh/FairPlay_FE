import React, { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineUser, HiOutlineGlobeAlt } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface TopNavProps {
    className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ className = '' }) => {
    const [activeMenu, setActiveMenu] = useState<string>('HOME');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/';

    // 로그인 상태 확인 함수
    const checkLoginStatus = () => {
        // 로컬 스토리지에서 토큰 확인 (accessToken 또는 refreshToken)
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        setIsLoggedIn(!!(accessToken || refreshToken));
    };

    // 컴포넌트 마운트 시와 경로 변경 시 로그인 상태 확인
    useEffect(() => {
        checkLoginStatus();
    }, [location.pathname]);

    // 현재 경로에 따라 activeMenu 상태를 업데이트
    useEffect(() => {
        if (isHomePage) {
            setActiveMenu('HOME');
        } else if (location.pathname === '/eventoverview') {
            setActiveMenu('EVENTS');
        } else {
            // 로그인 페이지나 다른 페이지에서는 activeMenu를 초기화
            setActiveMenu('');
        }
    }, [isHomePage, location.pathname]);

    // 로그인/로그아웃 처리 함수
    const handleAuthClick = (e: React.MouseEvent) => {
        if (isLoggedIn) {
            // 로그아웃 처리
            e.preventDefault();
            // 토큰 제거
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            // 홈페이지로 리다이렉트
            navigate('/');
        }
        // 로그인 상태가 아닐 때는 기본 링크 동작 (로그인 페이지로 이동)
    };

    return (
        <div className={`bg-white w-full flex flex-col ${className}`} style={{ margin: 0, padding: 0, position: 'sticky', top: 0, zIndex: 1000 }}>
            {/* 상단 유틸리티 링크들 */}
            <div className="flex justify-end items-center px-6 py-1 space-x-4">
                <a href="#" className="text-xs text-gray-500 hover:text-black">고객센터</a>
                <a href="#" className="text-xs text-gray-500 hover:text-black">알림</a>
                <Link
                    to={isLoggedIn ? "#" : "/login"}
                    className="text-xs text-gray-500 hover:text-black"
                    onClick={handleAuthClick}
                >
                    {isLoggedIn ? '로그아웃' : '로그인'}
                </Link>
            </div>

            {/* 메인 네비게이션 */}
            <div className="flex items-center justify-between px-6 py-3">
                {/* 로고 */}
                <div className="flex items-center">
                    <Link to="/" onClick={() => setActiveMenu('HOME')}>
                        <img
                            src="/images/FPlogo.png"
                            alt="FairPlay Logo"
                            className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                            onError={(e) => {
                                console.log('로고 이미지 로드 실패:', e);
                            }}
                        />
                    </Link>
                </div>

                {/* 메뉴와 아이콘들을 오른쪽에 함께 배치 */}
                <div className="flex items-center space-x-8">
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`text-black ${activeMenu === 'HOME' ? 'font-bold' : 'font-normal'} text-xl cursor-pointer`}
                            style={{
                                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '0%',
                                color: 'black !important',
                                textDecoration: 'none !important'
                            }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.color = 'black';
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.color = 'black';
                            }}
                            onClick={() => setActiveMenu('HOME')}
                        >
                            HOME
                        </Link>
                        <Link
                            to="/eventoverview"
                            className={`text-black ${activeMenu === 'EVENTS' ? 'font-bold' : 'font-normal'} text-xl cursor-pointer`}
                            style={{
                                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '0%',
                                color: 'black !important',
                                textDecoration: 'none !important'
                            }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.color = 'black';
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.color = 'black';
                            }}
                            onClick={() => setActiveMenu('EVENTS')}
                        >
                            EVENTS
                        </Link>
                        <a
                            href="#"
                            className={`text-black ${activeMenu === 'REGISTER' ? 'font-bold' : 'font-normal'} text-xl cursor-pointer`}
                            style={{
                                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                letterSpacing: '0%',
                                color: 'black !important',
                                textDecoration: 'none !important'
                            }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.color = 'black';
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.color = 'black';
                            }}
                            onClick={() => setActiveMenu('REGISTER')}
                        >
                            REGISTER
                        </a>
                    </nav>
                    <div className="flex items-center space-x-8">
                        <HiOutlineSearch className="w-6 h-6 text-black cursor-pointer hover:text-gray-600" />
                        <HiOutlineUser
                            className="w-6 h-6 text-black cursor-pointer hover:text-gray-600"
                            onClick={() => navigate('/mypage/info')}
                        />
                        <HiOutlineGlobeAlt className="w-6 h-6 text-black cursor-pointer hover:text-gray-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}; 