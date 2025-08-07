import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineSearch, HiOutlineUser, HiOutlineGlobeAlt, HiOutlineX } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { eventApi } from '../services/api';
import type { Notification } from '../services/api';

interface TopNavProps {
    className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ className = '' }) => {
    const [activeMenu, setActiveMenu] = useState<string>('HOME');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const location = useLocation();
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        if (!localStorage.getItem('accessToken')) return;
        try {
            const fetchedNotifications = await eventApi.getNotifications();
            setNotifications(fetchedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error("알림 로딩 실패:", error);
        }
    }, []);

    const checkLoginStatus = useCallback(() => {
        const loggedIn = !!localStorage.getItem('accessToken');
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            fetchNotifications();
        }
    }, [fetchNotifications]);

    useEffect(() => {
        checkLoginStatus();
        window.addEventListener('storage', checkLoginStatus); // 다른 탭에서 로그인/로그아웃 시 상태 동기화
        return () => window.removeEventListener('storage', checkLoginStatus);
    }, [checkLoginStatus]);

    useEffect(() => {
        const path = location.pathname;
        if (path === '/') setActiveMenu('HOME');
        else if (path === '/eventoverview') setActiveMenu('EVENTS');
        else if (path === '/register') setActiveMenu('REGISTER');
        else setActiveMenu('');
    }, [location.pathname]);

    const handleAuthClick = (e: React.MouseEvent) => {
        if (isLoggedIn) {
            e.preventDefault();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            setNotifications([]);
            navigate('/');
        }
    };

    const toggleNotification = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        setIsNotificationOpen(prev => !prev);
        if (!isNotificationOpen) {
            fetchNotifications();
        }
    };

    const handleMarkAsRead = async (notificationId: number) => {
        await eventApi.markNotificationAsRead(notificationId);
        setNotifications(prev => prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n));
    };

    const handleDeleteNotification = async (e: React.MouseEvent, notificationId: number) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        const success = await eventApi.deleteNotification(notificationId);
        if (success) {
            setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
        }
    };

    const handleDeleteAllRead = async () => {
        const readNotificationIds = notifications.filter(n => n.isRead).map(n => n.notificationId);
        if (readNotificationIds.length === 0) return;

        const success = await eventApi.deleteMultipleNotifications(readNotificationIds);
        if (success) {
            setNotifications(prev => prev.filter(n => !n.isRead));
        }
    };

    const newNotificationCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className={`bg-white w-full flex flex-col ${className}`} style={{ position: 'sticky', top: 0, zIndex: 1000, marginTop: '-32px' }}>
            <div className="flex justify-end items-center px-6 py-1 space-x-4">
                <a href="#" className="text-xs text-gray-500 hover:text-black">고객센터</a>
                <button onClick={toggleNotification} className="text-xs text-gray-500 hover:text-black bg-transparent border-none relative">
                    알림
                    {isLoggedIn && newNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                </button>
                <Link to={isLoggedIn ? "#" : "/login"} className="text-xs text-gray-500 hover:text-black" onClick={handleAuthClick}>
                    {isLoggedIn ? '로그아웃' : '로그인'}
                </Link>
            </div>

            <div className="flex items-center justify-between px-6 py-3">
                <Link to="/"><img src="/images/FPlogo.png" alt="FairPlay Logo" className="h-12" /></Link>
                <div className="flex items-center space-x-8">
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className={`text-black ${activeMenu === 'HOME' ? 'font-bold' : 'font-normal'} text-xl`}>HOME</Link>
                        <Link to="/eventoverview" className={`text-black ${activeMenu === 'EVENTS' ? 'font-bold' : 'font-normal'} text-xl`}>EVENTS</Link>
                        <Link to="/register" className={`text-black ${activeMenu === 'REGISTER' ? 'font-bold' : 'font-normal'} text-xl`}>REGISTER</Link>
                    </nav>
                    <div className="flex items-center space-x-8">
                        <HiOutlineSearch className="w-6 h-6 text-black cursor-pointer" />
                        <HiOutlineUser className="w-6 h-6 text-black cursor-pointer" onClick={() => {
                            // 사용자 역할에 따른 페이지 이동
                            const loginEmail = localStorage.getItem("loginEmail");
                            if (loginEmail === "a@a.a") {
                                navigate('/host/dashboard');
                            } else {
                                navigate('/mypage/info');
                            }
                        }} />
                        <HiOutlineGlobeAlt className="w-6 h-6 text-black cursor-pointer" />
                    </div>
                </div>
            </div>

            {isNotificationOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black bg-opacity-30" onClick={toggleNotification} />
                    <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl flex flex-col">
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
                                            className={`p-3 rounded-lg border relative ${n.isRead ? 'bg-gray-50 opacity-70' : 'bg-white hover:bg-gray-50'}`}
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
                                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 bg-transparent border-none"
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
        </div>
    );
};
