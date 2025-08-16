import React, { useState, useRef, useEffect } from "react";
import { Bell, X, Trash2 } from "lucide-react";
import { useNotificationSocket, Notification } from "../hooks/useNotificationSocket";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export function NotificationBell() {
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
    
    setDeletingIds(prev => new Set(prev).add(notificationId));
    
    const success = deleteNotification(notificationId);
    console.log("🗑️ deleteNotification 결과:", success);
    
    if (!success) {
      console.log("🗑️ 삭제 실패, 상태 롤백");
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
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
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">알림</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount}개의 읽지 않은 알림</p>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                알림이 없습니다.
              </div>
            ) : (
              notifications.map((notification) => {
                const isDeleting = deletingIds.has(notification.notificationId);
                return (
                  <div
                    key={notification.notificationId}
                    className={`relative group p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-300 ${
                      !notification.isRead ? "bg-blue-50" : ""
                    } ${isDeleting ? "opacity-50 transform translate-x-full" : ""}`}
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
                            locale: ko
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
            <div className="p-3 border-t border-gray-100 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                모든 알림 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}