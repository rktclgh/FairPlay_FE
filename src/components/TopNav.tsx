import React, { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineUser, HiOutlineGlobeAlt, HiOutlineBell, HiOutlineX } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface TopNavProps {
    className?: string;
}

// 알림 데이터 타입 정의
interface Notification {
    id: number;
    title: string;
    description: string;
    type: 'event' | 'system' | 'promotion';
    date: string;
    isRead: boolean;
    badge?: string;
    image?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ className = '' }) => {
    const [activeMenu, setActiveMenu] = useState<string>('HOME');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'all' | 'event' | 'system'>('all');
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 1,
            title: "새로운 행사가 등록되었습니다!",
            description: "2025 AI & 로봇 박람회가 등록되었습니다. 지금 확인해보세요.",
            type: 'event',
            date: "방금 전",
            isRead: false,
            badge: "NEW"
        },
        {
            id: 2,
            title: "관람평 작성 기간이 종료되었습니다",
            description: "2024 스마트시티 엑스포 관람평 작성 기간이 종료되었습니다.",
            type: 'system',
            date: "1시간 전",
            isRead: false
        },
        {
            id: 3,
            title: "특별 할인 이벤트 진행 중!",
            description: "첫 구매 고객을 위한 20% 할인 쿠폰을 발급해드립니다.",
            type: 'promotion',
            date: "3시간 전",
            isRead: true,
            badge: "20% OFF",
            image: "/images/NoImage.png"
        },
        {
            id: 4,
            title: "행사 일정이 변경되었습니다",
            description: "2025 푸드테크 페어의 일정이 변경되었습니다. 확인해주세요.",
            type: 'event',
            date: "어제",
            isRead: true
        },
        {
            id: 5,
            title: "시스템 점검 안내",
            description: "오늘 밤 12시부터 2시간 동안 시스템 점검이 진행됩니다.",
            type: 'system',
            date: "2일 전",
            isRead: true
        },
        {
            id: 6,
            title: "추천 행사 알림",
            description: "관심 분야와 일치하는 새로운 행사가 등록되었습니다.",
            type: 'event',
            date: "3일 전",
            isRead: true,
            badge: "추천"
        }
    ]);

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

    // 알림 모달 토글
    const toggleNotification = () => {
        if (!isLoggedIn) {
            // 로그아웃 상태일 때는 로그인 페이지로 이동
            navigate('/login');
            return;
        }
        setIsNotificationOpen(!isNotificationOpen);
    };

    // 알림 읽음 처리
    const markNotificationAsRead = (notificationId: number) => {
        // 실제로는 API 호출을 통해 서버에서 읽음 상태를 업데이트해야 합니다
        // 여기서는 로컬 상태만 업데이트합니다
        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    // 알림 필터링
    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'event') return notification.type === 'event';
        if (activeTab === 'system') return notification.type === 'system';
        return true;
    });

    // 새 알림 개수 (읽지 않은 알림)
    const newNotificationCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className={`bg-white w-full flex flex-col ${className}`} style={{ margin: 0, padding: 0, position: 'sticky', top: 0, zIndex: 1000 }}>
            {/* 상단 유틸리티 링크들 */}
            <div className="flex justify-end items-center px-6 py-1 space-x-4">
                <a href="#" className="text-xs text-gray-500 hover:text-black">고객센터</a>
                <button
                    onClick={toggleNotification}
                    className="text-xs text-gray-500 hover:text-black bg-transparent border-none p-0 relative focus:outline-none"
                >
                    알림
                    {isLoggedIn && newNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    )}
                </button>
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

            {/* 알림 모달 */}
            {isNotificationOpen && (
                <div className="fixed inset-0 z-50">
                    {/* 배경 오버레이 */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={toggleNotification}
                    />

                    {/* 알림 모달 */}
                    <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl flex flex-col">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">알림</h2>
                            <button
                                onClick={toggleNotification}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 탭 */}
                        <nav className="h-[40px] border-b border-neutral-200 relative" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '-1px' }}>
                            <ul className="flex items-center h-full">
                                <li
                                    className="h-full flex items-center px-2.5 cursor-pointer"
                                    onClick={() => setActiveTab('all')}
                                >
                                    <span
                                        className={`
                                             relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
                                             ${activeTab === 'all' ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]' : 'font-normal text-gray-600 hover:text-black'}
                                         `}
                                    >
                                        전체
                                    </span>
                                </li>
                                <li
                                    className="h-full flex items-center px-2.5 cursor-pointer"
                                    onClick={() => setActiveTab('event')}
                                >
                                    <span
                                        className={`
                                             relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
                                             ${activeTab === 'event' ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]' : 'font-normal text-gray-600 hover:text-black'}
                                         `}
                                    >
                                        행사
                                    </span>
                                </li>
                                <li
                                    className="h-full flex items-center px-2.5 cursor-pointer"
                                    onClick={() => setActiveTab('system')}
                                >
                                    <span
                                        className={`
                                             relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
                                             ${activeTab === 'system' ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]' : 'font-normal text-gray-600 hover:text-black'}
                                         `}
                                    >
                                        시스템
                                    </span>
                                </li>
                            </ul>
                        </nav>

                        {/* 알림 목록 */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredNotifications.length > 0 ? (
                                <div className="p-4">
                                    {/* 새 알림 섹션 */}
                                    {filteredNotifications.filter(n => !n.isRead).length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="font-bold text-black text-sm mb-3">새 알림</h3>
                                            <div className="space-y-4">
                                                {filteredNotifications.filter(n => !n.isRead).map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className="p-4 rounded-lg border bg-white border-gray-200 cursor-pointer hover:bg-gray-50"
                                                        onClick={() => markNotificationAsRead(notification.id)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <h3 className="font-medium text-sm">
                                                                        {notification.title}
                                                                    </h3>
                                                                    {notification.badge && (
                                                                        <span className="px-2 py-1 text-xs bg-red-500 text-white rounded">
                                                                            {notification.badge}
                                                                        </span>
                                                                    )}
                                                                    {!notification.isRead && (
                                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {notification.description}
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-400">
                                                                        {notification.date}
                                                                    </span>
                                                                    {notification.image && (
                                                                        <img
                                                                            src={notification.image}
                                                                            alt="notification"
                                                                            className="w-8 h-8 object-cover rounded"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 지난 알림 섹션 */}
                                    {filteredNotifications.filter(n => n.isRead).length > 0 && (
                                        <div>
                                            <h3 className="font-bold text-black text-sm mb-3">지난 알림</h3>
                                            <div className="space-y-4">
                                                {filteredNotifications.filter(n => n.isRead).map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className="p-4 rounded-lg border bg-white border-gray-200"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <h3 className="font-medium text-sm">
                                                                        {notification.title}
                                                                    </h3>
                                                                    {notification.badge && (
                                                                        <span className="px-2 py-1 text-xs bg-red-500 text-white rounded">
                                                                            {notification.badge}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {notification.description}
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-400">
                                                                        {notification.date}
                                                                    </span>
                                                                    {notification.image && (
                                                                        <img
                                                                            src={notification.image}
                                                                            alt="notification"
                                                                            className="w-8 h-8 object-cover rounded"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-32 text-gray-500">
                                    알림이 없습니다
                                </div>
                            )}
                        </div>

                        {/* 하단 안내 */}
                        <div className="p-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                알림 설정 및 삭제는 앱에서 가능합니다
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 