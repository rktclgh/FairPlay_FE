import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarPlus, FaUsers, FaArrowRight, FaPlay, FaQrcode, FaTicketAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { TopNav } from '../components/TopNav';
import { useTranslation } from 'react-i18next';
import { useScrollToTop } from '../hooks/useScrollToTop';

export const EventRegistrationIntro: React.FC = () => {
    useScrollToTop();
    const { t } = useTranslation();

    // Intersection Observer를 위한 ref들
    const featuresRef = useRef<HTMLDivElement>(null);
    const processRef = useRef<HTMLDivElement>(null);
    const storiesRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);

        // 각 섹션을 관찰
        if (featuresRef.current) observer.observe(featuresRef.current);
        if (processRef.current) observer.observe(processRef.current);
        if (storiesRef.current) observer.observe(storiesRef.current);
        if (ctaRef.current) observer.observe(ctaRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-black">
            <TopNav />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-32">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                        {t('eventRegistration.newPlatform')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
                        <span className="bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
                            {t('eventRegistration.heroTitle1')}
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
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
                            className="group relative bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-1 border-none focus:outline-none"
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
                            <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">100+</div>
                            <div className="text-gray-300 text-sm">성공적인 행사</div>
                        </div>
                        <div className="group">
                            <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">10K+</div>
                            <div className="text-gray-300 text-sm">만족한 참가자</div>
                        </div>
                        <div className="group">
                            <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">95%</div>
                            <div className="text-gray-300 text-sm">사용자 만족도</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div ref={featuresRef} id="features" className="py-24 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-gray-800/20 to-transparent rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-r from-gray-800/20 to-transparent rounded-full filter blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20 opacity-0 translate-y-10 transition-all duration-1000">
                        <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            ✨ 차별화된 핵심 기능들
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                            왜 <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">FairPlay</span>를 선택해야 할까요?
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            다른 플랫폼과는 차별화된, 행사 운영자만을 위한 특별한 기능들
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="group relative opacity-0 translate-y-8 transition-all duration-700 delay-100">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaCalendarPlus className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white">5분 만에 완성하는 행사 등록</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    복잡한 설정 없이 핵심 정보만 입력하면 자동으로 완벽한 행사 페이지가 완성됩니다. 다른 플랫폼의 30분 → FairPlay의 5분!
                                </p>
                            </div>
                        </div>

                        <div className="group relative opacity-0 translate-y-8 transition-all duration-700 delay-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaTicketAlt className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white">직관적인 티켓 관리</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    다양한 티켓 타입, 가격 설정, 수량 관리로 체계적인 예약 시스템을 구축하세요. 복잡한 설정 없이 간단하게 관리할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="group relative opacity-0 translate-y-8 transition-all duration-700 delay-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaQrcode className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white">실시간 QR 체크인으로 대기줄 제거</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    입장 대기줄이 사라집니다! 1초 만에 체크인되어 참가자 만족도가 급상승하고, 행사 이미지가 완전히 달라집니다.
                                </p>
                            </div>
                        </div>

                        <div className="group relative opacity-0 translate-y-8 transition-all duration-700 delay-400">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaUsers className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white">참가자 정보 자동 수집</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    별도 설문조사나 수기 입력 없이 예약 시점에 모든 참가자 정보를 자동으로 수집합니다. 행사 후 마케팅까지 완벽하게!
                                </p>
                            </div>
                        </div>

                        <div className="group relative opacity-0 translate-y-8 transition-all duration-700 delay-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-rose-600/20 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaMapMarkerAlt className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white">부스별 웨이팅으로 수익 극대화</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    인기 부스의 웨이팅 시스템으로 참가자들이 더 오래 머물고, 부스 운영자들의 수익이 2-3배 증가합니다!
                                </p>
                            </div>
                        </div>

                        <div className="group relative opacity-0 translate-y-8 transition-all duration-700 delay-600">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FaClock className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white">실시간 데이터로 즉시 의사결정</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    출석률, 인기 부스, 참가자 만족도를 실시간으로 확인하고 즉시 행사 운영 방향을 조정할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it Works Section */}
            <div ref={processRef} className="py-24 bg-gradient-to-br from-gray-800 to-black relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-full filter blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20 opacity-0 translate-y-10 transition-all duration-1000">
                        <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            🚀 다른 플랫폼과는 차원이 다른 프로세스
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">3단계</span>로 시작하는 성공적인 행사
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            복잡한 설정은 이제 그만, 누구나 쉽게 전문적인 행사를 만들 수 있습니다
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connection Lines */}
                        <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 transform -translate-y-1/2 z-0"></div>

                        <div className="group text-center relative z-10 opacity-0 translate-y-8 transition-all duration-700 delay-100">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    1
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">5분 만에 행사 등록</h3>
                            <p className="text-gray-300 leading-relaxed">
                                행사명, 일정, 장소만 입력하면 AI가 자동으로 완벽한 행사 페이지를 만들어줍니다. 다른 플랫폼의 30분 → FairPlay의 5분!
                            </p>
                        </div>

                        <div className="group text-center relative z-10 opacity-0 translate-y-8 transition-all duration-700 delay-200">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    2
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">자동으로 참가자 모집</h3>
                            <p className="text-gray-300 leading-relaxed">
                                생성된 행사 페이지가 SNS에서 자동으로 공유되고, 참가자들이 알아서 찾아와 예약합니다. 별도 홍보 노력이 필요 없습니다.
                            </p>
                        </div>

                        <div className="group text-center relative z-10 opacity-0 translate-y-8 transition-all duration-700 delay-300">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    3
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">완벽한 행사 운영</h3>
                            <p className="text-gray-300 leading-relaxed">
                                QR 티켓으로 대기줄 없는 입장, 실시간 참가자 현황 모니터링, 그리고 다음 행사 준비를 위한 완벽한 데이터까지!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Stories Section */}
            <div ref={storiesRef} className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20 opacity-0 translate-y-10 transition-all duration-1000">
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
                            📈 실제 사용 후기
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">실제 사용자들이</span> 증명하는 FairPlay의 차별화
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            다른 플랫폼에서 FairPlay로 전환한 주최자들의 생생한 후기
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="group relative opacity-0 translate-y-8 transition-all duration-700 delay-100">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 text-center">
                                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                                    95%
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">참가자 만족도</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    "QR 체크인과 부스 체험 시스템으로 참가자들이 정말 만족해합니다. 다음 행사도 꼭 FairPlay로 진행하고 싶어요." - 전시회 주최자 김씨
                                </p>
                            </div>
                        </div>

                        <div className="group relative opacity-0 translate-y-8 transition-all duration-700 delay-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 text-center">
                                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                                    90%
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">시간 절약</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    "행사 준비 시간이 90% 줄었습니다. 복잡한 설정 없이 5분 만에 완성되는 게 정말 신기해요." - 박람회 운영팀 이씨
                                </p>
                            </div>
                        </div>

                        <div className="group relative opacity-0 translate-y-8 transition-all duration-700 delay-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 text-center">
                                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                                    100%
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">재참여율</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    "QR 체크인으로 대기줄이 완전히 사라졌고, 참가자들이 '다음에도 꼭 참여하고 싶다'고 말해줍니다." - 세미나 주최자 박씨
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div ref={ctaRef} className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="max-w-4xl mx-auto opacity-0 translate-y-10 transition-all duration-1000">
                        <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight">
                            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">FairPlay</span>와 함께<br />행사 운영의 새로운 기준을 만들어보세요!
                        </h2>
                        <p className="text-xl md:text-2xl mb-12 text-gray-300 leading-relaxed">
                            5분 만에 완성, 대기줄 없는 입장, 실시간 모니터링 <br />
                            FairPlay만의 차별화된 기능으로 행사 운영의 새로운 기준을 만들어보세요
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                            <Link
                                to="/register"
                                className="group relative bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-12 py-6 rounded-2xl text-xl font-black hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-2 border-none focus:outline-none"
                            >
                                <span className="flex items-center">
                                    지금 바로 시작하기
                                    <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </Link>

                            <div className="text-center">
                                <div className="text-sm text-gray-400 mb-1">💳 직관적인 티켓 관리</div>
                                <div className="text-sm text-gray-400">⚡️ 5분 만에 행사 완성</div>
                            </div>
                        </div>

                        <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-sm font-medium border border-white/20">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
                            지금 500명 이상의 주최자가 FairPlay로 성공적인 행사를 운영하고 있습니다
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};
