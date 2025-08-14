import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
    const { isDark } = useTheme();

    return (
        <footer className={`w-full py-16 px-8 theme-surface theme-transition border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* 회사 정보 */}
                    <div className="col-span-1 md:col-span-2">
                        <img
                            src="/images/FPlogo.png"
                            alt="FairPlay Logo"
                            className={`h-8 mb-4 ${isDark ? 'filter brightness-0 invert' : ''}`}
                        />
                        <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            FairPlay는 공정하고 투명한 티켓 예매 서비스를 제공합니다.<br />
                            모든 사용자가 동등한 기회를 가질 수 있도록 최선을 다하겠습니다.
                        </p>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <p>대표이사: 홍길동 | 사업자등록번호: 123-45-67890</p>
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

                {/* 하단 구분선 및 저작권 */}
                <div className={`mt-12 pt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            © 2024 FairPlay. All rights reserved.
                        </p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <a href="#" className={`text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                                개인정보처리방침
                            </a>
                            <a href="#" className={`text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                                이용약관
                            </a>
                            <a href="#" className={`text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                                운영정책
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
