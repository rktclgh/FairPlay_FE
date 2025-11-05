/**
 * 사용자 온라인 상태를 관리하는 유틸리티 (HTTP-only 쿠키 기반)
 */

class PresenceManager {
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private isActive = false;
    private isAuthenticated = true; // 세션 유효 상태 (401 발생 시 false로 변경)

    /**
     * 온라인 상태 heartbeat 시작
     */
    startHeartbeat() {
        if (this.heartbeatInterval) {
            return;
        }

        this.isActive = true;
        this.isAuthenticated = true; // 시작 시 인증된 것으로 가정
        console.log('🔄 온라인 상태 heartbeat 시작 (HTTP-only 쿠키 기반)');

        // 즉시 한 번 실행
        this.sendHeartbeat();

        // 2분마다 heartbeat 전송 (Redis TTL이 5분이므로)
        this.heartbeatInterval = setInterval(() => {
            if (this.isActive && this.isAuthenticated) {
                this.sendHeartbeat();
            } else {
                this.stopHeartbeat();
            }
        }, 120000); // 2분
    }

    /**
     * 온라인 상태 heartbeat 중지
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
            this.isActive = false;
            console.log('⏹️ 온라인 상태 heartbeat 중지');
        }

        // 오프라인 상태로 설정
        if (this.isAuthenticated) {
            this.sendDisconnect();
        }
    }

    /**
     * heartbeat 전송 (HTTP-only 쿠키 기반)
     */
    private async sendHeartbeat() {
        try {
            const response = await fetch('/api/chat/presence/connect', {
                method: 'POST',
                credentials: 'include', // HTTP-only 쿠키 자동 전송
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                console.warn('🚫 Heartbeat: 인증 실패 (세션 만료), heartbeat 중단');
                this.isAuthenticated = false;
                this.stopHeartbeat();
                // 401 이벤트 발생 (AuthContext가 자동 로그아웃 처리)
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                return;
            }

            console.log('💓 Heartbeat 전송 완료 (HTTP-only 쿠키)');
        } catch (error) {
            console.error('❌ Heartbeat 전송 실패:', error);
        }
    }

    /**
     * 연결 해제 신호 전송 (HTTP-only 쿠키 기반)
     */
    private async sendDisconnect() {
        try {
            await fetch('/api/chat/presence/disconnect', {
                method: 'POST',
                credentials: 'include', // HTTP-only 쿠키 자동 전송
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('🔴 연결 해제 신호 전송 완료 (HTTP-only 쿠키)');
        } catch (error) {
            console.error('❌ 연결 해제 신호 전송 실패:', error);
        }
    }

    /**
     * 페이지 visibility 변경 시 처리
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // 페이지가 백그라운드로 갔을 때
            this.isActive = false;
        } else {
            // 페이지가 포그라운드로 왔을 때
            this.isActive = true;
            if (this.isAuthenticated && !this.heartbeatInterval) {
                this.startHeartbeat();
            }
        }
    }

    /**
     * 초기화 (HTTP-only 쿠키 기반 - 세션 유효성은 서버 요청 시 확인)
     */
    initialize() {
        // 페이지 로드 시 heartbeat 시작 (세션 유효성은 첫 요청에서 확인)
        this.startHeartbeat();

        // 페이지 visibility 변경 감지
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // 브라우저 종료 시 연결 해제
        window.addEventListener('beforeunload', () => {
            this.stopHeartbeat();
        });

        // 페이지 이동 시 연결 해제
        window.addEventListener('pagehide', () => {
            this.stopHeartbeat();
        });
    }

    /**
     * 정리 (컴포넌트 unmount 시)
     */
    cleanup() {
        this.stopHeartbeat();
    }
}

// 싱글톤 인스턴스
const presenceManager = new PresenceManager();

export default presenceManager;