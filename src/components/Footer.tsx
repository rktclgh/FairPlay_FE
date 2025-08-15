import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
    const { isDark } = useTheme();

    return (
        <footer className={`w-full py-16 px-8 theme-surface theme-transition border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="max-w-7xl mx-auto relative">
                {/* 우측 상단 소셜 아이콘 - 상단바 아이콘 사이즈/간격 매칭 */}
                <div className="absolute right-0 top-0 flex items-center space-x-6">
                    {/* Instagram */}
                    <a
                        href="https://www.instagram.com/fair_play.ink/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="FairPlay Instagram"
                        className={`${isDark ? 'text-white hover:opacity-80' : 'text-black hover:opacity-70'}`}
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                            <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm0 2a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM18 6a1 1 0 100 2 1 1 0 000-2z" />
                        </svg>
                    </a>
                    {/* Facebook */}
                    <a
                        href="#"
                        aria-label="FairPlay Facebook"
                        className={`${isDark ? 'text-white hover:opacity-80' : 'text-black hover:opacity-70'}`}
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                            <path d="M22 12.069C22 6.51 17.523 2 12 2S2 6.51 2 12.069C2 17.09 5.657 21.245 10.438 22v-7.01H7.898v-2.92h2.54V9.845c0-2.5 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.47h-1.26c-1.242 0-1.63.774-1.63 1.567v1.883h2.773l-.443 2.92h-2.33V22C18.343 21.245 22 17.09 22 12.069z" />
                        </svg>
                    </a>
                    {/* KakaoTalk */}
                    <a
                        href="#"
                        aria-label="FairPlay Kakao"
                        className={`${isDark ? 'text-white hover:opacity-80' : 'text-black hover:opacity-70'}`}
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                            <path d="M12 3C6.477 3 2 6.686 2 11.238c0 2.667 1.72 4.999 4.32 6.391l-.69 3.158a.6.6 0 00.88.657l3.66-2.044c.813.15 1.66.229 2.53.229 5.523 0 10-3.686 10-8.237C22 6.686 17.523 3 12 3z" />
                        </svg>
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* 회사 정보 */}
                    <div className="col-span-1 md:col-span-2">
                        <img
                            src="/images/FPlogo.png"
                            alt="FairPlay Logo"
                            className={`h-8 mb-4 ${isDark ? 'filter brightness-0 invert' : ''}`}
                        />
                        <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            FairPlay는 공정하고 투명한 예매 서비스를 제공합니다.<br />
                            모든 사용자가 동등한 기회를 가질 수 있도록 최선을 다하겠습니다.
                        </p>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <p>대표이사: 김페어 | 사업자등록번호: 123-45-67890</p>
                            <p>통신판매업신고번호: 제2024-서울강남-1234호</p>
                            <p>주소: 서울특별시 강남구 테헤란로 123, 4층</p>
                            <p>고객센터: 1588-1234 (평일 09:00~18:00)</p>
                        </div>
                    </div>

                    {/* 서비스 */}
                    <div>
                        <h3 className={`font-bold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>서비스</h3>
                        <ul className="space-y-2">
                            <li><a href="/eventoverview" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>이벤트 목록</a></li>
                            <li><a href="/event-registration-intro" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>이벤트 등록</a></li>
                            <li><a href="/mypage/info" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>마이페이지</a></li>
                        </ul>
                    </div>

                    {/* 고객지원 */}
                    <div>
                        <h3 className={`font-bold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>고객지원</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>공지사항</a></li>
                            <li><a href="#" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>자주 묻는 질문</a></li>
                            <li><a href="#" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>이용약관</a></li>
                            <li><a href="#" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>개인정보처리방침</a></li>
                        </ul>
                    </div>
                </div>

                {/* 하단 저작권/링크 */}
                <div className="mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            © 2025 FairPlay. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0 items-center">
                            <a href="#" className={`text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>개인정보처리방침</a>
                            <a href="#" className={`text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>이용약관</a>
                            <a href="#" className={`text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>운영정책</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
