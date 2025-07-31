import React from 'react';
import { HiOutlineSearch, HiOutlineUser, HiOutlineGlobeAlt } from 'react-icons/hi';

interface TopNavProps {
    className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ className = '' }) => {
    return (
        <div className={`bg-white w-full flex flex-col ${className}`}>
            {/* 상단 유틸리티 링크들 */}
            <div className="flex justify-end items-center px-6 py-2 space-x-6">
                <a href="#" className="text-xs text-gray-400 hover:text-black">고객센터</a>
                <a href="#" className="text-xs text-gray-400 hover:text-black">알림</a>
                <a href="#" className="text-xs text-gray-400 hover:text-black">로그인</a>
            </div>

            {/* 메인 네비게이션 */}
            <div className="flex items-center justify-between px-6 py-4">
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
                        <a href="#" className="text-black font-normal text-2xl" style={{ fontFamily: 'Segoe UI', letterSpacing: '0%' }}>HOME</a>
                        <a href="#" className="text-black font-normal text-2xl" style={{ fontFamily: 'Segoe UI', letterSpacing: '0%' }}>EVENTS</a>
                        <a href="#" className="text-black font-normal text-2xl" style={{ fontFamily: 'Segoe UI', letterSpacing: '0%' }}>REGISTER</a>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <HiOutlineSearch className="w-6 h-6 text-black cursor-pointer hover:text-gray-600" />
                        <HiOutlineUser className="w-6 h-6 text-black cursor-pointer hover:text-gray-600" />
                        <HiOutlineGlobeAlt className="w-6 h-6 text-black cursor-pointer hover:text-gray-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}; 