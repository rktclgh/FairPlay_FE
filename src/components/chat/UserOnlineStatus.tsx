import { useState, useEffect } from "react";
import authManager from "../../utils/auth";

interface UserOnlineStatusProps {
  userId: number;
  className?: string;
  showText?: boolean;
}

export default function UserOnlineStatus({ 
  userId, 
  className = "", 
  showText = false 
}: UserOnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // 사용자 온라인 상태 확인
  const checkUserStatus = async () => {
    try {
      console.log(`🔍 사용자 ${userId} 온라인 상태 확인 시작`);
      // authManager 대신 직접 fetch 사용 (인증 불필요)
      const response = await fetch(`/api/chat/presence/status/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 사용자 ${userId} 상태 응답:`, data);
        setIsOnline(data.isOnline);
      } else {
        console.error(`❌ 사용자 ${userId} 상태 조회 실패:`, response.status, response.statusText);
        setIsOnline(false);
      }
    } catch (error) {
      console.error(`🚨 사용자 ${userId} 상태 조회 오류:`, error);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 상태 확인 및 주기적 업데이트
  useEffect(() => {
    checkUserStatus();
    
    // 30초마다 상태 갱신
    const interval = setInterval(checkUserStatus, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow-md animate-pulse"></div>
        {showText && <span className="text-xs text-gray-400">확인 중...</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${
          isOnline 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-gray-400'
        }`}
      />
      {showText && (
        <span 
          className={`text-xs font-medium ${
            isOnline ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {isOnline ? '온라인' : '오프라인'}
        </span>
      )}
    </div>
  );
}