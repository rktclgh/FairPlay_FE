import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { openChatRoomGlobal } from './chat/ChatFloatingModal';
import api from '../api/axios'; // HTTP-only 쿠키 기반 인증

export const Footer: React.FC = () => {
    const { isDark } = useTheme();
    const { t } = useTranslation();

    return (
        <footer className={`w-full mt-10 md:mt-16 py-8 md:py-16 px-4 md:px-8 theme-surface theme-transition border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="max-w-7xl mx-auto relative">
                {/* 우측 상단 소셜 아이콘 - 상단바 아이콘 사이즈/간격 매칭 (모바일에서는 숨김) */}
                <div className="hidden md:flex absolute right-0 top-0 items-center space-x-6">
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

                {/* 모바일 간결한 푸터 */}
                <div className="md:hidden">
                    <img src="/images/FPlogo.png" alt="FairPlay Logo" className={`h-7 mb-3 ${isDark ? 'filter brightness-0 invert' : ''}`} />
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('footer.copyright_simple')}</p>
                </div>

                {/* 데스크톱 기존 푸터 */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-4 gap-8">
                        {/* 회사 정보 */}
                        <div className="col-span-2">
                            <img src="/images/FPlogo.png" alt="FairPlay Logo" className={`h-8 mb-4 ${isDark ? 'filter brightness-0 invert' : ''}`} />
                            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {t('footer.description')}<br />
                                {t('footer.commitment')}
                            </p>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <p>{t('footer.ceoInfo')}</p>
                                <p>{t('footer.businessLicense')}</p>
                                <p>{t('footer.address')}</p>
                                <p>{t('footer.customerServiceInfo')}</p>
                            </div>
                        </div>
                        {/* 서비스 */}
                        <div>
                            <h3 className={`font-bold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>{t('footer.serviceTitle')}</h3>
                            <ul className="space-y-2">
                                <li><a href="/eventoverview" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>{t('navigation.eventList')}</a></li>
                                <li><a href="/event-registration-intro" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>{t('navigation.eventRegistration')}</a></li>
                                <li><a href="/mypage/info" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>{t('navigation.mypage')}</a></li>
                            </ul>
                        </div>
                        {/* 고객지원 */}
                        <div>
                            <h3 className={`font-bold text-sm mb-4 ${isDark ? 'text-white' : 'text-black'}`}>{t('footer.supportTitle')}</h3>
                            <ul className="space-y-2">
                                <li><Link to="/support/notices" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>{t('footer.notices')}</Link></li>
                                <li><Link to="/support/faq" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>{t('footer.faq')}</Link></li>
                                <li><Link to="/creators" className={`text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>제작자 소개</Link></li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                // HTTP-only 쿠키로 인증 - withCredentials로 자동 전송
                                                const res = await api.post<{ chatRoomId?: number }>('/api/chat/admin-inquiry');
                                                const chatRoomId = res.data?.chatRoomId;
                                                if (chatRoomId != null) {
                                                    openChatRoomGlobal(chatRoomId);
                                                }
                                            } catch (e: any) {
                                                console.error('푸터 고객센터 채팅 오픈 실패', e);
                                                // 401 에러는 axios interceptor가 자동으로 로그인 페이지로 리다이렉트
                                                if (e?.response?.status === 401) {
                                                    // 이미 interceptor에서 처리됨
                                                    return;
                                                }
                                                alert('고객센터 채팅을 여는 중 오류가 발생했습니다.');
                                            }
                                        }}
                                        className={`text-left p-0 bg-transparent border-none cursor-pointer text-sm hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                                    >
                                        {t('common.customerService')}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 flex justify-between items-center">
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('footer.copyright_full')}</p>
                        <div className="flex space-x-6 items-center">
                            <Link to="/legal/privacy" className={`text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>{t('auth.privacyPolicy')}</Link>
                            <Link to="/legal/terms" className={`text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>{t('auth.termsOfService')}</Link>
                            <Link to="/legal/policy" className={`text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>{t('footer.operationPolicy')}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
