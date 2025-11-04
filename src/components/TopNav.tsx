import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HiOutlineSearch, HiOutlineUser, HiOutlineX, HiOutlineHome, HiOutlineCalendar, HiOutlineTicket, HiOutlineBell, HiOutlinePencilAlt, HiOutlineLogout, HiOutlineLogin } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { openChatRoomGlobal } from './chat/ChatFloatingModal';
import { useNotificationSse } from '../hooks/useNotificationSse'; // 웹소켓 → SSE 마이그레이션
import { requireAuth } from '../utils/authGuard';
import { useAuth } from '../context/AuthContext';
import { hasHostPermission, hasBoothManagerPermission } from '../utils/permissions';
import { clearCachedRoleCode, getRoleCode } from '../utils/role';
import { useTheme } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

interface TopNavProps {
	className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ className = '' }) => {
	const { isDark } = useTheme();
	const { t } = useTranslation();
	const { isAuthenticated, logout } = useAuth();
	const [activeMenu, setActiveMenu] = useState<string>('HOME');
	const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
	const [mobileQuery, setMobileQuery] = useState<string>('');
	const [desktopQuery, setDesktopQuery] = useState<string>('');
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
	const [isMyPageModalOpen, setIsMyPageModalOpen] = useState<boolean>(false);
	const headerRef = useRef<HTMLDivElement>(null);
	const [headerHeight, setHeaderHeight] = useState<number>(0);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const location = useLocation();
	const navigate = useNavigate();

	// SSE (Server-Sent Events) 기반 실시간 알림 시스템 - HTTP-only 쿠키 인증
	const { notifications, unreadCount, markAsRead, deleteNotification, connect, disconnect } = useNotificationSse();

	// 검색 패널이 열릴 때 자동으로 입력폼에 포커스
	useEffect(() => {
		if (isSearchOpen && searchInputRef.current) {
			// 약간의 지연을 두어 애니메이션이 시작된 후 포커스
			setTimeout(() => {
				searchInputRef.current?.focus();
			}, 100);
		}
	}, [isSearchOpen]);

	// AuthContext에서 인증 상태를 가져와 SSE 연결 관리
	useEffect(() => {
		if (isAuthenticated) {
			connect(); // 로그인 시 SSE 연결
		} else {
			disconnect(); // 로그아웃 시 SSE 연결 해제
		}
		return () => {
			disconnect(); // 컴포넌트 언마운트 시 SSE 연결 해제
		};
	}, [isAuthenticated, connect, disconnect]);

	useEffect(() => {
		const path = location.pathname;
		if (path === '/') setActiveMenu('HOME');
		else if (path === '/eventoverview') setActiveMenu('EVENTS');
		else if (path === '/register') setActiveMenu('REGISTER');
		else if (path === '/event-registration-intro') setActiveMenu('REGISTER');
		else setActiveMenu('');
	}, [location.pathname]);

	// 헤더 높이 측정
	useEffect(() => {
		const measure = () => {
			if (headerRef.current) {
				const r = headerRef.current.getBoundingClientRect();
				setHeaderHeight(r.height);
			}
		};
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, []);

	const handleAuthClick = async (e: React.MouseEvent) => {
		if (isAuthenticated) {
			e.preventDefault();
			clearCachedRoleCode();
			await logout(); // AuthContext의 logout 사용
			disconnect(); // 로그아웃 시 SSE 연결 해제
			navigate('/');
		}
	};

	const handleMyPageClick = () => {
		setIsMyPageModalOpen(true);
	};

	const handleMyPageClose = () => {
		setIsMyPageModalOpen(false);
	};

	const handleMyPageAction = async () => {
		if (!isAuthenticated) {
			navigate('/login');
			setIsMyPageModalOpen(false);
			return;
		}

		// 로그인된 경우 역할에 따라 페이지 이동
		try {
			const role = await getRoleCode();
			if (!role) {
				navigate('/login');
				setIsMyPageModalOpen(false);
				return;
			}

			if (role === 'ADMIN') {
				navigate('/admin_dashboard');
			} else if (hasHostPermission(role)) {
				navigate('/host/dashboard');
			} else if (hasBoothManagerPermission(role)) {
				navigate('/booth-admin/dashboard');
			} else {
				navigate('/mypage/info');
			}
			setIsMyPageModalOpen(false);
		} catch (error) {
			console.error('역할 확인 실패:', error);
			navigate('/login');
			setIsMyPageModalOpen(false);
		}
	};

	const toggleNotification = async () => {
		if (!requireAuth(isAuthenticated, navigate, t('common.notification'))) {
			return;
		}
		setIsNotificationOpen(prev => !prev);
	};

	const handleMarkAsRead = (notificationId: number) => {
		markAsRead(notificationId); // SSE + REST API를 통한 읽음 처리
	};

	const handleDeleteNotification = (e: React.MouseEvent, notificationId: number) => {
		e.stopPropagation(); // 이벤트 버블링 방지

		console.log("🗑️ TopNav에서 알림 삭제:", notificationId);

		// 즉시 삭제 (아이폰 스타일)
		const success = deleteNotification(notificationId);
		if (!success) {
			console.warn("WebSocket을 통한 알림 삭제 실패");
		}
	};

	const handleMobileSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const q = mobileQuery.trim();
		if (q.length === 0) return;
		navigate(`/eventoverview?q=${encodeURIComponent(q)}`);
	};

	const handleDesktopSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const q = desktopQuery.trim();
		if (q.length === 0) return setIsSearchOpen(false);
		navigate(`/eventoverview?q=${encodeURIComponent(q)}`);
		setIsSearchOpen(false);
	};

	// 운영자(전체 관리자) 문의 채팅방 생성/입장
	const handleCustomerService = async () => {
		if (!requireAuth(isAuthenticated, navigate, t('common.customerService'))) {
			return;
		}

		try {
			// 세션 기반 API 호출 (토큰 헤더 제거, withCredentials 사용)
			const response = await axios.post(
				`${import.meta.env.VITE_BACKEND_BASE_URL}/api/chat/admin-inquiry`,
				{},
				{ withCredentials: true }
			);

			const chatRoomId = response.data.chatRoomId;
			openChatRoomGlobal(chatRoomId);
		} catch (error) {
			console.error('운영자 문의 채팅방 생성 실패:', error);
		}
	};

	return (
		<>
			{/* 모바일 고정 상단바: 로고 - 검색창 - 알림 (얇고 여백 최소화) */}
			<div className={`md:hidden fixed top-0 left-0 right-0 h-12 ${isDark ? 'bg-black' : 'bg-white'} z-[300]`}>
				<div className="flex items-center gap-2 px-3 h-full">
					<Link to="/" className="shrink-0 inline-flex items-center justify-center h-9 w-9">
						<img src="/images/FPlogo.png" alt="FairPlay Logo" className="block h-7 w-auto object-contain" />
					</Link>
					<form onSubmit={handleMobileSearchSubmit} className="flex-1">
						<div className={`relative ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full h-9`}>
							<HiOutlineSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
							<input
								type="search"
								placeholder={t('common.search')}
								value={mobileQuery}
								onChange={(e) => setMobileQuery(e.target.value)}
								className={`w-full h-full pl-9 pr-3 text-sm rounded-full outline-none focus:ring-2 ${isDark ? 'bg-gray-800 text-white focus:ring-gray-700' : 'bg-gray-100 text-black focus:ring-gray-300'}`}
							/>
						</div>
					</form>
					<button onClick={toggleNotification} aria-label={t('common.notification')} className="relative shrink-0 inline-flex items-center justify-center h-10 w-10 appearance-none bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent outline-none focus:outline-none">
						<HiOutlineBell className="block flex-none w-6 h-6 text-gray-500" aria-hidden="true" />
						{isAuthenticated && unreadCount > 0 && <span className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />}
					</button>
				</div>
			</div>

			{/* 데스크톱 네비게이션: 웹 화면 유지 (기존 구조) */}
			<div ref={headerRef} className={`hidden md:flex theme-surface theme-transition w-full flex-col ${className}`} style={{ position: 'sticky', top: 0, zIndex: 101, marginTop: '-32px' }}>
				{/* 상단 유틸 바 */}
				<div className="flex justify-end items-center px-6 py-0.5 gap-3">
					<button
						onClick={handleCustomerService}
						className={`p-0 text-xs ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-black'} bg-transparent border-none cursor-pointer focus:outline-none focus:ring-0`}
					>
						{t('common.customerService')}
					</button>
					<button
						onClick={toggleNotification}
						className={`relative p-0 text-xs ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-black'} bg-transparent border-none cursor-pointer focus:outline-none focus:ring-0`}
					>
						{t('common.notification')}
						{isAuthenticated && unreadCount > 0 && (
							<span className="absolute top-0 -right-1 w-1 h-1 bg-red-500 rounded-full"></span>
						)}
					</button>
					<Link
						to={isAuthenticated ? "#" : "/login"}
						className={`p-0 text-xs ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-black'} focus:outline-none focus:ring-0`}
						onClick={handleAuthClick}
					>
						{isAuthenticated ? t('common.logout') : t('common.login')}
					</Link>
				</div>

				<div className="flex items-center justify-between px-6 py-2">
					<Link to="/"><img src="/images/FPlogo.png" alt="FairPlay Logo" className="h-10" /></Link>
					<div className="flex items-center space-x-6">
						<nav className="flex items-center space-x-6">
							<Link to="/" className={`${isDark ? 'text-white' : 'text-black'} ${activeMenu === 'HOME' ? 'font-semibold' : 'font-normal'} text-lg`}>{t('navigation.home')}</Link>
							<Link to="/eventoverview" className={`${isDark ? 'text-white' : 'text-black'} ${activeMenu === 'EVENTS' ? 'font-semibold' : 'font-normal'} text-lg`}>{t('navigation.events')}</Link>
							<Link to="/event-registration-intro" className={`${isDark ? 'text-white' : 'text-black'} ${activeMenu === 'REGISTER' ? 'font-semibold' : 'font-normal'} text-lg`}>{t('navigation.apply')}</Link>
						</nav>
						<div className="flex items-center space-x-6">
							<HiOutlineSearch
								className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'} cursor-pointer`}
								onClick={() => {
									setIsSearchOpen(prev => !prev);
								}}
							/>
							<HiOutlineUser className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'} cursor-pointer`} onClick={async () => {
								if (!requireAuth(isAuthenticated, navigate, t('navigation.mypage'))) {
									return;
								}

								const role = await getRoleCode();
								if (!role) { navigate('/login'); return; }
								if (role === 'ADMIN') {
									navigate('/admin_dashboard');
								} else if (hasHostPermission(role)) {
									navigate('/host/dashboard');
								} else if (hasBoothManagerPermission(role)) {
									navigate('/booth-admin/dashboard');
								} else {
									navigate('/mypage/info');
								}
							}} />
							<LanguageToggle />
						</div>
					</div>
				</div>
			</div>

			{/* 데스크톱 검색 패널: 상단바는 유지, 아래로 여백이 부드럽게 펼쳐짐 */}
			<AnimatePresence>
				{isSearchOpen && (
					<motion.div
						key="desktop-search-panel"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: Math.max(0, (typeof window !== 'undefined' ? window.innerHeight : 0) - headerHeight), opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
						className={`${isDark ? 'bg-black/80' : 'bg-white/90'} backdrop-blur-sm hidden md:block overflow-hidden`}
						style={{ position: 'fixed', left: 0, right: 0, top: headerHeight, zIndex: 90 }}
					>
						<div className="max-w-7xl mx-auto px-6">
							<form onSubmit={handleDesktopSearchSubmit} className="py-8">
								<div className={`flex items-center gap-3 border-b-2 pb-3 ${isDark ? 'border-white/70' : 'border-black/50'}`}>
									<HiOutlineSearch className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
									<input
										type="search"
										placeholder={t('search.placeholder')}
										value={desktopQuery}
										onChange={(e) => setDesktopQuery(e.target.value)}
										className={`flex-1 text-xl outline-none bg-transparent ${isDark ? 'text-white placeholder-gray-500' : 'text-black placeholder-gray-500'}`}
										ref={searchInputRef}
									/>
								</div>
							</form>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* 모바일 하단 고정 네비게이션: 항상 표시, 안전영역 고려, 균형 정렬 */}
			<div className={`md:hidden fixed bottom-0 left-0 right-0 border-t ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} z-[200] pb-safe`}>
				<div className="grid grid-cols-5 h-16 items-center">
					<Link to="/eventoverview" className="flex flex-col items-center justify-center gap-1 text-[11px] leading-none">
						<HiOutlineCalendar className={`w-6 h-6 ${activeMenu === 'EVENTS' ? 'text-black dark:text-white' : 'text-gray-500'}`} />
						<span className={`${activeMenu === 'EVENTS' ? (isDark ? 'text-white' : 'text-black') : 'text-gray-500'}`}>{t('navigation.events')}</span>
					</Link>
					<Link to="/event-registration-intro" className="flex flex-col items-center justify-center gap-1 text-[11px] leading-none">
						<HiOutlinePencilAlt className="w-6 h-6 text-gray-500" />
						<span className="text-gray-500">{t('navigation.apply')}</span>
					</Link>
					<Link to="/" className="flex flex-col items-center justify-center gap-1 text-[11px] leading-none">
						<HiOutlineHome className={`w-6 h-6 ${activeMenu === 'HOME' ? 'text-black dark:text-white' : 'text-gray-500'}`} />
						<span className={`${activeMenu === 'HOME' ? (isDark ? 'text-white' : 'text-black') : 'text-gray-500'}`}>{t('navigation.home')}</span>
					</Link>
					<Link to="/mypage/tickets" className="flex flex-col items-center justify-center gap-1 text-[11px] leading-none">
						<HiOutlineTicket className="w-6 h-6 text-gray-500" />
						<span className="text-gray-500">{t('navigation.tickets')}</span>
					</Link>
					<button
						className="flex flex-col items-center justify-center gap-1 text-[11px] leading-none appearance-none bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent outline-none focus:outline-none"
						onClick={handleMyPageClick}
					>
						<HiOutlineUser className="w-6 h-6 text-gray-500" />
						<span className="text-gray-500">{t('navigation.my')}</span>
					</button>
				</div>
			</div>

			{/* 알림 팝업을 TopNav 밖으로 이동 */}
			<AnimatePresence>
				{isNotificationOpen && (
					<div className="fixed inset-0 z-[9999]">
						{/* 어두운 배경 오버레이 - 알림 팝업을 제외한 나머지 화면 */}
						<motion.div
							className="absolute inset-0 bg-black bg-opacity-50"
							onClick={toggleNotification}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
						/>

						{/* 알림 팝업 - 화면 오른쪽을 꽉 채움 */}
						<motion.div
							className="absolute right-0 top-0 h-full w-full md:w-auto md:left-[calc(100vw-420px)] left-0 bg-white shadow-2xl flex flex-col"
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 30,
								duration: 0.4
							}}
						>
							<div className="flex items-center justify-between p-4 border-b">
								<h2 className="text-lg font-semibold">{t('notification.title')}</h2>
								<div className="flex items-center gap-2">
									<button onClick={toggleNotification} className="p-1 bg-transparent border-none hover:bg-gray-100 rounded">
										<HiOutlineX className="w-5 h-5" />
									</button>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto p-4">
								{notifications.length > 0 ? (
									<div className="space-y-3">
										{notifications.map(n => (
											<motion.div
												key={n.notificationId}
												className={`p-3 rounded-lg border relative group ${n.isRead ? 'bg-gray-50 opacity-70' : 'bg-white hover:bg-gray-50'}`}
												onClick={() => !n.isRead && handleMarkAsRead(n.notificationId)}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3 }}
											>
												<div className={`flex-1 ${!n.isRead ? 'cursor-pointer' : ''}`}>
													<div className="flex items-center gap-2 mb-1">
														<h4 className={`font-semibold text-sm ${n.isRead ? 'text-gray-600' : 'text-black'}`}>{n.title}</h4>
														{!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
													</div>
													<p className="text-sm text-gray-700 mb-2">{n.message}</p>
													<span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
												</div>
												<button
													onClick={(e) => handleDeleteNotification(e, n.notificationId)}
													className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 bg-transparent border-none opacity-0 group-hover:opacity-100 transition-opacity"
												>
													<HiOutlineX className="w-4 h-4" />
												</button>
											</motion.div>
										))}
									</div>
								) : (
									<motion.div
										className="flex items-center justify-center h-full text-gray-500"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.3 }}
									>
										{t('notification.noNotifications')}
									</motion.div>
								)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* 마이페이지 사이드바 */}
			<AnimatePresence>
				{isMyPageModalOpen && (
					<div className="fixed inset-0 z-[9999]">
						{/* 어두운 배경 오버레이 */}
						<motion.div
							className="absolute inset-0 bg-black bg-opacity-30"
							onClick={handleMyPageClose}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
						/>

						{/* 마이페이지 사이드바 - 오른쪽 벽에서 슬라이드 */}
						<motion.div
							className="absolute bottom-20 right-0 bg-white shadow-lg min-w-[160px]"
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 30,
								duration: 0.3
							}}
						>
							{/* 사이드바 메뉴 */}
							<div className="py-2">
								{isAuthenticated ? (
									<div>
										<button
											onClick={handleMyPageAction}
											className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
										>
											마이페이지
										</button>
										<button
											onClick={handleAuthClick}
											className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
										>
											로그아웃
										</button>
									</div>
								) : (
									<div>
										<button
											onClick={handleMyPageAction}
											className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
										>
											로그인
										</button>
									</div>
								)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
};
