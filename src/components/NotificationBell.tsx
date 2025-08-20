import React, { useState, useRef, useEffect } from "react";
import { Bell, X, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotificationSocket, Notification } from "../hooks/useNotificationSocket";
import { formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, deleteNotification, connect, disconnect } = useNotificationSocket();
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      console.log("📖 알림 읽음 처리:", notification.notificationId);
      markAsRead(notification.notificationId);
    }
    
    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    
    console.log("🗑️ 삭제 버튼 클릭됨:", notificationId);
    
    // 슬라이드 애니메이션 시작
    setDeletingIds(prev => new Set(prev).add(notificationId));
    
    // 0.3초 후 실제 삭제 (슬라이드 애니메이션과 함께)
    setTimeout(() => {
      deleteNotification(notificationId); // 이미 즉시 UI 업데이트 + 백엔드 요청 처리됨
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }, 300);
  };

  const getNotificationIcon = (typeCode: string) => {
    switch (typeCode) {
      case "BOOKING":
        return "📅";
      case "PAYMENT":
        return "💳";
      case "REVIEW":
        return "⭐";
      case "SYSTEM":
        return "🔔";
      default:
        return "📢";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100 flex-none">
            <h3 className="font-semibold text-gray-900">{t('notification.title')}</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount}{t('notification.unreadCount')}</p>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t('notification.noNotifications')}
              </div>
            ) : (
              notifications.map((notification) => {
                const isDeleting = deletingIds.has(notification.notificationId);
                return (
                  <div
                    key={notification.notificationId}
                    className={`relative group p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-300 ${
                      !notification.isRead ? "bg-blue-50" : ""
                    } ${isDeleting ? "opacity-0 transform translate-x-full scale-95" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.typeCode)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${
                          !notification.isRead ? "text-gray-900" : "text-gray-700"
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: i18n.language === 'ko' ? ko : enUS
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                        <button
                          onClick={(e) => {
                            console.log("🗑️ 버튼 onClick 이벤트 발생!");
                            handleDeleteNotification(e, notification.notificationId);
                          }}
                          className="opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded z-10"
                          disabled={isDeleting}
                          style={{ pointerEvents: 'all' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center flex-none">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('notification.viewAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}