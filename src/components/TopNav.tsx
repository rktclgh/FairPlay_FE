import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineSearch, HiOutlineUser, HiOutlineGlobeAlt, HiOutlineX } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { eventApi } from '../services/api';
import axios from 'axios';
import { openChatRoomGlobal } from './chat/ChatFloatingModal';
import { useNotificationSocket, Notification } from '../hooks/useNotificationSocket';
import { requireAuth, isAuthenticated } from '../utils/authGuard';
import { hasHostPermission } from '../utils/permissions';
import { clearCachedRoleCode, getRoleCode } from '../utils/role';


interface TopNavProps {
    className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ className = '' }) => {
    const [activeMenu, setActiveMenu] = useState<string>('HOME');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

    const location = useLocation();
    const navigate = useNavigate();

    // 웹소켓 기반 알림 시스템 사용
    const { notifications, unreadCount, markAsRead, connect, disconnect } = useNotificationSocket();

    const checkLoginStatus = useCallback(() => {
        const loggedIn = isAuthenticated();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            connect(); // 로그인 시 웹소켓 연결
        } else {
            disconnect(); // 로그아웃 시 웹소켓 연결 해제
        }
    }, [connect, disconnect]);

    useEffect(() => {
        checkLoginStatus();
        window.addEventListener('storage', checkLoginStatus); // 다른 탭에서 로그인/로그아웃 시 상태 동기화
        return () => {
            window.removeEventListener('storage', checkLoginStatus);
            disconnect(); // 컴포넌트 언마운트 시 웹소켓 연결 해제
        };
    }, [checkLoginStatus, disconnect]);

    useEffect(() => {
        const path = location.pathname;
        if (path === '/') setActiveMenu('HOME');
        else if (path === '/eventoverview') setActiveMenu('EVENTS');
        else if (path === '/register') setActiveMenu('REGISTER');
        else if (path === '/event-registration-intro') setActiveMenu('REGISTER');
        else setActiveMenu('');
    }, [location.pathname]);

    const handleAuthClick = (e: React.MouseEvent) => {
        if (isLoggedIn) {
            e.preventDefault();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            clearCachedRoleCode();
            setIsLoggedIn(false);
            disconnect(); // 로그아웃 시 웹소켓 연결 해제
            navigate('/');
        }
    };

    const toggleNotification = () => {
        if (!requireAuth(navigate, '알림')) {
            return;
        }
        setIsNotificationOpen(prev => !prev);
    };

    const handleMarkAsRead = (notificationId: number) => {
        markAsRead(notificationId); // 웹소켓을 통한 읽음 처리
    };

    const handleDeleteNotification = async (e: React.MouseEvent, notificationId: number) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        await eventApi.deleteNotification(notificationId);
        // 웹소켓으로 관리되므로 상태 업데이트는 자동으로 처리됨
    };

    const handleDeleteAllRead = async () => {
        const readNotificationIds = notifications.filter(n => n.isRead).map(n => n.notificationId);
        if (readNotificationIds.length === 0) return;

        await eventApi.deleteMultipleNotifications(readNotificationIds);
        // 웹소켓으로 관리되므로 상태 업데이트는 자동으로 처리됨
    };



    // 운영자(전체 관리자) 문의 채팅방 생성/입장
    const handleCustomerService = async () => {
        if (!requireAuth(navigate, '고객센터 채팅')) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const api = axios.create({
                baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // ADMIN 권한을 가진 사용자에게 연결하는 1:N 구조 (전용 API 사용)
            const response = await api.post('/api/chat/admin-inquiry');

            const chatRoomId = response.data.chatRoomId;
            openChatRoomGlobal(chatRoomId);
        } catch (error) {
            console.error('운영자 문의 채팅방 생성 실패:', error);
        }
    };

    // 웹소켓에서 제공하는 unreadCount 사용

    return (
        <>
            <div className={`bg-white/90 backdrop-blur w-full flex flex-col ${className}`} style={{ position: 'sticky', top: 0, zIndex: 100, marginTop: '-32px' }}>
                <div className="flex justify-end items-center px-6 py-0.5 gap-3">
                    <button
                        onClick={handleCustomerService}
                        className="p-0 text-xs text-gray-500 hover:text-black bg-transparent border-none cursor-pointer focus:outline-none focus:ring-0"
                    >
                        고객센터
                    </button>
                    <button
                        onClick={toggleNotification}
                        className="relative p-0 text-xs text-gray-500 hover:text-black bg-transparent border-none cursor-pointer focus:outline-none focus:ring-0"
                    >
                        알림
                        {isLoggedIn && unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                    <Link
                        to={isLoggedIn ? "#" : "/login"}
                        className="p-0 text-xs text-gray-500 hover:text-black focus:outline-none focus:ring-0"
                        onClick={handleAuthClick}
                    >
                        {isLoggedIn ? '로그아웃' : '로그인'}
                    </Link>
                </div>

                <div className="flex items-center justify-between px-6 py-2">
                    <Link to="/"><img src="/images/FPlogo.png" alt="FairPlay Logo" className="h-10" /></Link>
                    <div className="flex items-center space-x-6">
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link to="/" className={`text-black ${activeMenu === 'HOME' ? 'font-semibold' : 'font-normal'} text-lg`}>HOME</Link>
                            <Link to="/eventoverview" className={`text-black ${activeMenu === 'EVENTS' ? 'font-semibold' : 'font-normal'} text-lg`}>EVENTS</Link>
                            <Link to="/event-registration-intro" className={`text-black ${activeMenu === 'REGISTER' ? 'font-semibold' : 'font-normal'} text-lg`}>APPLY</Link>
                        </nav>
                        <div className="flex items-center space-x-6">
                            <HiOutlineSearch className="w-5 h-5 text-black cursor-pointer" />
                            <HiOutlineUser className="w-5 h-5 text-black cursor-pointer" onClick={() => {
                                if (!requireAuth(navigate, '마이페이지')) {
                                    return;
                                }

                                (async () => {
                                    const role = await getRoleCode();
                                    if (!role) { navigate('/login'); return; }
                                    if (role === 'ADMIN') {
                                        navigate('/admin/dashboard');
                                    } else if (hasHostPermission(role)) {
                                        navigate('/host/dashboard');
                                    } else {
                                        navigate('/mypage/info');
                                    }
                                })();
                            }} />
                            <HiOutlineGlobeAlt className="w-5 h-5 text-black cursor-pointer" />
                        </div>
                    </div>
                </div>
                <div className="pb-4"></div>
            </div>

            {/* 알림 팝업을 TopNav 밖으로 이동 */}
            {isNotificationOpen && (
                <div className="fixed inset-0 z-[9999]">
                    {/* 어두운 배경 오버레이 - 알림 팝업을 제외한 나머지 화면 */}
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleNotification} />

                    {/* 알림 팝업 - 화면 오른쪽을 꽉 채움 */}
                    <div className="absolute right-0 top-0 h-full left-[calc(100vw-420px)] bg-white shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">알림</h2>
                            <div className="flex items-center gap-2">
                                {notifications.some(n => n.isRead) && (
                                    <button onClick={handleDeleteAllRead} className="text-xs text-gray-500 hover:text-black p-1 rounded">
                                        읽은 알림 삭제
                                    </button>
                                )}
                                <button onClick={toggleNotification} className="p-1 bg-transparent border-none hover:bg-gray-100 rounded">
                                    <HiOutlineX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {notifications.length > 0 ? (
                                <div className="space-y-3">
                                    {notifications.map(n => (
                                        <div
                                            key={n.notificationId}
                                            className={`p-3 rounded-lg border relative group ${n.isRead ? 'bg-gray-50 opacity-70' : 'bg-white hover:bg-gray-50'}`}
                                            onClick={() => !n.isRead && handleMarkAsRead(n.notificationId)}
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
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    새로운 알림이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
