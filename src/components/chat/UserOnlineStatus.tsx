import { useState, useEffect, useRef } from "react";
import authManager from "../../utils/auth";

// 전역 캐시로 중복 요청 방지
interface StatusCache {
  isOnline: boolean;
  timestamp: number;
  loading: boolean;
}

const statusCache = new Map<number, StatusCache>();
const CACHE_DURATION = 30000; // 30초 캐시
const pendingRequests = new Set<number>();

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
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 사용자 온라인 상태 확인 (캐시 및 중복 요청 방지 적용)
  const checkUserStatus = async (force = false) => {
    // 컴포넌트가 언마운트된 경우 요청 중단
    if (!isMountedRef.current) return;
    
    // 캐시 확인
    const cachedData = statusCache.get(userId);
    const now = Date.now();
    
    if (!force && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      console.log(`📋 사용자 ${userId} 상태 캐시 사용:`, cachedData.isOnline);
      setIsOnline(cachedData.isOnline);
      setLoading(false);
      return;
    }
    
    // 이미 요청 중인 경우 중복 요청 방지
    if (pendingRequests.has(userId)) {
      console.log(`⏳ 사용자 ${userId} 상태 요청 대기 중...`);
      
      // 기존 요청 완료를 기다림 (최대 5초)
      let attempts = 0;
      const waitForRequest = () => {
        if (!isMountedRef.current) return;
        
        if (!pendingRequests.has(userId) || attempts >= 50) {
          const updatedCache = statusCache.get(userId);
          if (updatedCache) {
            setIsOnline(updatedCache.isOnline);
            setLoading(false);
          }
          return;
        }
        
        attempts++;
        setTimeout(waitForRequest, 100);
      };
      
      waitForRequest();
      return;
    }
    
    try {
      pendingRequests.add(userId);
      console.log(`🔍 사용자 ${userId} 온라인 상태 API 요청`);
      
      const response = await fetch(`/api/chat/presence/status/${userId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!isMountedRef.current) return;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 사용자 ${userId} 상태 응답:`, data.isOnline);
        
        // 캐시 업데이트
        statusCache.set(userId, {
          isOnline: data.isOnline,
          timestamp: now,
          loading: false
        });
        
        setIsOnline(data.isOnline);
      } else {
        console.warn(`⚠️ 사용자 ${userId} 상태 조회 실패:`, response.status);
        setIsOnline(false);
        
        // 실패한 경우도 캐시에 저장 (짧은 시간)
        statusCache.set(userId, {
          isOnline: false,
          timestamp: now,
          loading: false
        });
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.warn(`🚨 사용자 ${userId} 상태 조회 네트워크 오류:`, error);
      setIsOnline(false);
      
      // 에러 시에도 캐시에 저장 (더 짧은 시간)
      statusCache.set(userId, {
        isOnline: false,
        timestamp: now - (CACHE_DURATION / 2), // 더 빨리 재시도하도록
        loading: false
      });
    } finally {
      pendingRequests.delete(userId);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // 컴포넌트 마운트 시 상태 확인 및 주기적 업데이트
  useEffect(() => {
    isMountedRef.current = true;
    
    // 초기 로드
    checkUserStatus();
    
    // 1분마다 상태 갱신 (30초에서 1분으로 증가하여 서버 부하 감소)
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        checkUserStatus(true); // force 옵션으로 캐시 무시
      }
    }, 60000);
    
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [userId]);
  
  // cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 로딩 중이면서 캐시된 데이터가 없는 경우에만 로딩 표시
  const cachedData = statusCache.get(userId);
  if (loading && !cachedData) {
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