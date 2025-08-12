/**
 * 사용자 온라인 상태를 관리하는 유틸리티
 */

class PresenceManager {
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private isActive = false;

    /**
     * 온라인 상태 heartbeat 시작
     */
    startHeartbeat() {
        if (this.heartbeatInterval || !this.isAuthenticated()) {
            return;
        }

        this.isActive = true;
        console.log('🔄 온라인 상태 heartbeat 시작');

        // 즉시 한 번 실행
        this.sendHeartbeat();

        // 2분마다 heartbeat 전송 (Redis TTL이 5분이므로)
        this.heartbeatInterval = setInterval(() => {
            if (this.isActive && this.isAuthenticated()) {
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
        if (this.isAuthenticated()) {
            this.sendDisconnect();
        }
    }

    /**
     * heartbeat 전송
     */
    private async sendHeartbeat() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.warn('🚫 Heartbeat: 토큰 없음, heartbeat 중단');
                this.stopHeartbeat();
                return;
            }

            const response = await fetch('/api/chat/presence/connect', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                console.warn('🚫 Heartbeat: 인증 실패, heartbeat 중단');
                this.stopHeartbeat();
                return;
            }

            console.log('💓 Heartbeat 전송 완료');
        } catch (error) {
            console.error('❌ Heartbeat 전송 실패:', error);
        }
    }

    /**
     * 연결 해제 신호 전송
     */
    private async sendDisconnect() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            await fetch('/api/chat/presence/disconnect', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('🔴 연결 해제 신호 전송 완료');
        } catch (error) {
            console.error('❌ 연결 해제 신호 전송 실패:', error);
        }
    }

    /**
     * 인증 상태 확인
     */
    private isAuthenticated(): boolean {
        const token = localStorage.getItem('accessToken');
        return !!token;
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
            if (this.isAuthenticated() && !this.heartbeatInterval) {
                this.startHeartbeat();
            }
        }
    }

    /**
     * 초기화
     */
    initialize() {
        // 페이지 로드 시 heartbeat 시작
        if (this.isAuthenticated()) {
            this.startHeartbeat();
        }

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