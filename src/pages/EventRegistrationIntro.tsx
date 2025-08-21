import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaCalendarPlus, FaUsers, FaChartLine, FaGift, FaHeadset, FaArrowRight, FaPlay } from 'react-icons/fa';
import { TopNav } from '../components/TopNav';
import { useTranslation } from 'react-i18next';
import { useScrollToTop } from '../hooks/useScrollToTop';

export const EventRegistrationIntro: React.FC = () => {
    useScrollToTop();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <TopNav />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white py-32">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        {t('eventRegistration.newPlatform')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                            {t('eventRegistration.heroTitle1')}
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                            {t('eventRegistration.heroTitle2')}
                        </span>{t('eventRegistration.heroTitle3')}
                        <br />
                        <span className="text-white">{t('eventRegistration.heroTitle4')}</span>
                    </h1>

                    <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        {t('eventRegistration.heroSubtitle1')}<br />
                        {t('eventRegistration.heroSubtitle2')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link
                            to="/register"
                            className="group relative bg-gradient-to-r from-orange-400 to-pink-500 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:from-orange-500 hover:to-pink-600 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-1 border-none focus:outline-none"
                        >
                            <span className="flex items-center">
                                {t('eventRegistration.startNow')}
                                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                        </Link>

                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group flex items-center bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/30 focus:outline-none"
                        >
                            <FaPlay className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                            {t('eventRegistration.watchDemo')}
                        </button>
                    </div>

                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
                        <div className="group">
                            <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
                            <div className="text-gray-300 text-sm">{t('eventRegistration.stats.successfulEvents')}</div>
                        </div>
                        <div className="group">
                            <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
                            <div className="text-gray-300 text-sm">{t('eventRegistration.stats.satisfiedParticipants')}</div>
                        </div>
                        <div className="group">
                            <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">98%</div>
                            <div className="text-gray-300 text-sm">{t('eventRegistration.stats.satisfaction')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
                    <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-blue-200/20 to-transparent rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-transparent rounded-full filter blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            ✨ 프리미엄 기능들
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                            왜 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FairPlay</span>를 선택해야 할까요?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            최첨단 기술과 직관적인 디자인이 만나 완벽한 행사 경험을 제공합니다
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaCalendarPlus className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">간편한 행사 등록</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    AI 기반 스마트 등록 시스템으로 몇 번의 클릭만으로 전문적인 행사를 생성할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaUsers className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">스마트 참가자 관리</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    실시간 체크인부터 개인화된 참가자 경험까지, 차세대 참가자 관리 솔루션을 제공합니다.
                                </p>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaChartLine className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">실시간 분석 대시보드</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    실시간 데이터 시각화와 예측 분석으로 데이터 기반의 현명한 결정을 내릴 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaGift className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">무제한 행사 유형</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    온라인, 오프라인, 하이브리드까지 모든 형태의 행사를 자유롭게 커스터마이징할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-rose-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaHeadset className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">프리미엄 고객지원</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    전담 고객 성공 매니저와 24/7 실시간 채팅 지원으로 완벽한 행사를 보장합니다.
                                </p>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaCheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">엔터프라이즈급 보안</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    SOC2 Type II 인증과 GDPR 준수로 최고 수준의 데이터 보안과 개인정보 보호를 제공합니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it Works Section */}
            <div className="py-24 bg-white relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full filter blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            🚀 간단한 프로세스
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">3단계</span>로 시작하는 성공적인 행사
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            복잡한 설정은 이제 그만, 누구나 쉽게 전문적인 행사를 만들 수 있습니다
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connection Lines */}
                        <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 transform -translate-y-1/2 z-0"></div>

                        <div className="group text-center relative z-10">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    1
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">스마트 정보 입력</h3>
                            <p className="text-gray-600 leading-relaxed">
                                AI가 도와주는 스마트 폼으로 행사명, 일정, 장소를 빠르게 설정하세요. 자동 추천 기능이 완벽한 설정을 도와드립니다.
                            </p>
                        </div>

                        <div className="group text-center relative z-10">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    2
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">유연한 티켓 설정</h3>
                            <p className="text-gray-600 leading-relaxed">
                                다양한 티켓 타입과 할인 정책을 설정하고, 실시간 재고 관리로 완벽한 참가자 경험을 제공하세요.
                            </p>
                        </div>

                        <div className="group text-center relative z-10">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    3
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">즉시 런칭</h3>
                            <p className="text-gray-600 leading-relaxed">
                                빠른 검토 후 승인되면 바로 공개! 참가자들이 쉽게 찾아 신청할 수 있는 최적화된 행사 페이지가 완성됩니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Stories Section */}
            <div className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
                            📈 실시간 성과
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">검증된 성과</span>로 말하는 FairPlay
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            숫자가 증명하는 플랫폼의 신뢰성과 사용자 만족도
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-300 text-center">
                                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                                    500+
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">성공적인 행사</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    전 세계 주최자들이 FairPlay로 만든 성공적인 행사의 수가 계속 증가하고 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-300 text-center">
                                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                                    50K+
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">행복한 참가자</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    놀라운 행사 경험을 통해 만족도 98%를 달성한 참가자들의 실제 후기가 증명합니다.
                                </p>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-300 text-center">
                                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                                    98%
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">완벽한 만족도</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    주최자와 참가자 모두가 인정하는 업계 최고 수준의 서비스 품질을 자랑합니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-white relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight">
                            지금 바로 <br />
                            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                꿈의 행사
                            </span>를 만들어보세요!
                        </h2>
                        <p className="text-xl md:text-2xl mb-12 text-orange-100 leading-relaxed">
                            혁신적인 기술과 직관적인 인터페이스로 <br />
                            단 몇 분 만에 전문적인 행사를 시작할 수 있습니다
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                            <Link
                                to="/register"
                                className="group relative bg-white text-gray-900 px-12 py-6 rounded-2xl text-xl font-black hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:-translate-y-2 border-none focus:outline-none"
                            >
                                <span className="flex items-center">
                                    무료로 시작하기
                                    <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </Link>

                            <div className="text-center">
                                <div className="text-sm text-orange-200 mb-1">💳 신용카드 불필요</div>
                                <div className="text-sm text-orange-200">⚡️ 30초 만에 시작</div>
                            </div>
                        </div>

                        <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-sm font-medium border border-white/20">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                            지금 1,250명의 주최자가 FairPlay를 사용 중입니다
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};
