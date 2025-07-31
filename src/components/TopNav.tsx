import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlineUser, HiOutlineGlobeAlt } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';

interface TopNavProps {
    className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ className = '' }) => {
    const [activeMenu, setActiveMenu] = useState<string>('HOME');
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    return (
        <div className={`bg-white w-full flex flex-col ${className}`} style={{ margin: 0, padding: 0, position: 'sticky', top: 0, zIndex: 1000 }}>
            {/* 상단 유틸리티 링크들 */}
            <div className="flex justify-end items-center px-6 py-1 space-x-4">
                <a href="#" className="text-xs text-gray-500 hover:text-black">고객센터</a>
                <a href="#" className="text-xs text-gray-500 hover:text-black">알림</a>
                <Link to="/login" className="text-xs text-gray-500 hover:text-black">로그인</Link>
            </div>

            {/* 메인 네비게이션 */}
            <div className="flex items-center justify-between px-6 py-3">
                {/* 로고 */}
                <div className="flex items-center">
                    <img
                        src="/images/FPlogo.png"
                        alt="FairPlay Logo"
                        className="h-12 w-auto"
                        onError={(e) => {
                            console.log('로고 이미지 로드 실패:', e);
                        }}
                    />
                </div>

                {/* 메뉴와 아이콘들을 오른쪽에 함께 배치 */}
                <div className="flex items-center space-x-8">
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`text-black ${isHomePage ? 'font-bold' : 'font-normal'} text-xl cursor-pointer`}
                            style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '0%' }}
                            onClick={() => setActiveMenu('HOME')}
                        >
                            HOME
                        </Link>
                        <a
                            href="#"
                            className={`text-black ${activeMenu === 'EVENTS' ? 'font-bold' : 'font-normal'} text-xl cursor-pointer`}
                            style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '0%' }}
                            onClick={() => setActiveMenu('EVENTS')}
                        >
                            EVENTS
                        </a>
                        <a
                            href="#"
                            className={`text-black ${activeMenu === 'REGISTER' ? 'font-bold' : 'font-normal'} text-xl cursor-pointer`}
                            style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '0%' }}
                            onClick={() => setActiveMenu('REGISTER')}
                        >
                            REGISTER
                        </a>
                    </nav>
                    <div className="flex items-center space-x-8">
                        <HiOutlineSearch className="w-6 h-6 text-black cursor-pointer hover:text-gray-600" />
                        <HiOutlineUser className="w-6 h-6 text-black cursor-pointer hover:text-gray-600" />
                        <HiOutlineGlobeAlt className="w-6 h-6 text-black cursor-pointer hover:text-gray-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}; 