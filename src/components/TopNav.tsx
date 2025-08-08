import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineSearch, HiOutlineUser, HiOutlineGlobeAlt, HiOutlineX } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { eventApi } from '../services/api';
import type { Notification } from '../services/api';
import axios from 'axios';
import { openChatRoomGlobal } from './chat/ChatFloatingModal';

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

    // 운영자(전체 관리자) 문의 채팅방 생성/입장
    const handleCustomerService = async () => {
        if (!isLoggedIn) {
            navigate('/login');
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

    const newNotificationCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className={`bg-white/90 backdrop-blur w-full flex flex-col border-b border-black/5 ${className}`} style={{ position: 'sticky', top: 0, zIndex: 1000, marginTop: '-32px' }}>
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
                    {isLoggedIn && newNotificationCount > 0 && (
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
                        <Link to="/register" className={`text-black ${activeMenu === 'REGISTER' ? 'font-semibold' : 'font-normal'} text-lg`}>REGISTER</Link>
                    </nav>
                    <div className="flex items-center space-x-6">
                        <HiOutlineSearch className="w-5 h-5 text-black cursor-pointer" />
                        <HiOutlineUser className="w-5 h-5 text-black cursor-pointer" onClick={() => {
                            // 토큰에서 사용자 역할 확인
                            const accessToken = localStorage.getItem('accessToken');
                            if (accessToken) {
                                try {
                                    const payload = JSON.parse(decodeURIComponent(escape(atob(accessToken.split('.')[1]))));
                                    const userRole = payload.role;

                                    if (userRole === 'HOST' || userRole === 'ADMIN' || userRole.includes('행사') || userRole.includes('관리자')) {
                                        navigate('/host/dashboard');
                                    } else {
                                        navigate('/mypage/info');
                                    }
                                } catch (error) {
                                    console.error('토큰 파싱 실패:', error);
                                    navigate('/mypage/info');
                                }
                            } else {
                                navigate('/login');
                            }
                        }} />
                        <HiOutlineGlobeAlt className="w-5 h-5 text-black cursor-pointer" />
                    </div>
                </div>
            </div>
            <div className="pb-4"></div>

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
