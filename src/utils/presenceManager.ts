/**
 * 사용자 온라인 상태를 관리하는 유틸리티 (HTTP-only 쿠키 기반)
 */

class PresenceManager {
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private isActive = false;
    private isAuthenticated = false; // 세션 유효 상태 (401/403 발생 시 false로 변경)
    private hasConnectedSession = false;
    private heartbeatSequence = 0;
    private isInitialized = false;
    private readonly handleBeforeUnload = () => {
        void this.stopHeartbeat();
    };
    private readonly handlePageHide = () => {
        void this.stopHeartbeat();
    };
    private readonly handleVisibility = () => {
        this.handleVisibilityChange();
    };

    /**
     * 온라인 상태 heartbeat 시작
     */
    startHeartbeat() {
        if (this.heartbeatInterval) {
            return;
        }

        const sequence = ++this.heartbeatSequence;
        this.isActive = true;
        this.isAuthenticated = true; // 시작 시 인증된 것으로 가정
        console.log('🔄 온라인 상태 heartbeat 시작 (HTTP-only 쿠키 기반)');

        // 즉시 한 번 실행
        void this.sendHeartbeat(sequence);

        // 2분마다 heartbeat 전송 (Redis TTL이 5분이므로)
        this.heartbeatInterval = setInterval(() => {
            if (this.isActive && this.isAuthenticated) {
                void this.sendHeartbeat(sequence);
            } else {
                void this.stopHeartbeat();
            }
        }, 120000); // 2분
    }

    /**
     * 온라인 상태 heartbeat 중지
     */
    async stopHeartbeat() {
        const shouldDisconnect = this.isAuthenticated && this.hasConnectedSession;
        this.heartbeatSequence += 1;
        this.hasConnectedSession = false;

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
            console.log('⏹️ 온라인 상태 heartbeat 중지');
        }
        this.isActive = false;

        // 실제 heartbeat 연결이 성립된 세션만 오프라인 상태로 설정
        if (shouldDisconnect) {
            await this.sendDisconnect();
        }
    }

    /**
     * heartbeat 전송 (HTTP-only 쿠키 기반)
     */
    private async sendHeartbeat(sequence: number) {
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
                this.hasConnectedSession = false;
                await this.stopHeartbeat();
                // 401 이벤트 발생 (AuthContext가 자동 로그아웃 처리)
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                return;
            }

            if (response.ok && sequence === this.heartbeatSequence && this.isActive) {
                this.hasConnectedSession = true;
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
            const response = await fetch('/api/chat/presence/disconnect', {
                method: 'POST',
                credentials: 'include', // HTTP-only 쿠키 자동 전송
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                this.isAuthenticated = false;
                return;
            }

            console.log('🔴 연결 해제 신호 전송 완료 (HTTP-only 쿠키)');
        } catch (error) {
            if (this.isExpectedUnloadAbort(error)) {
                return;
            }
            console.error('❌ 연결 해제 신호 전송 실패:', error);
        }
    }

    private isExpectedUnloadAbort(error: unknown) {
        if (!error) return false;
        if (error instanceof DOMException && error.name === 'AbortError') return true;
        const message = error instanceof Error ? error.message : String(error);
        return /abort|failed to fetch|networkerror/i.test(message);
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
     *
     * ⚠️ 주의: 인증된 사용자만 heartbeat를 시작해야 합니다.
     * AuthContext에서 isAuthenticated가 true일 때만 startHeartbeat()를 호출하세요.
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.isInitialized = true;
        // ❌ 무조건 heartbeat 시작하지 않음 (AuthContext가 인증 상태 확인 후 시작)
        // this.startHeartbeat();

        // 페이지 visibility 변경 감지
        document.addEventListener('visibilitychange', this.handleVisibility);

        // 브라우저 종료 시 연결 해제
        window.addEventListener('beforeunload', this.handleBeforeUnload);

        // 페이지 이동 시 연결 해제
        window.addEventListener('pagehide', this.handlePageHide);
    }

    /**
     * 정리 (컴포넌트 unmount 시)
     */
    cleanup() {
        document.removeEventListener('visibilitychange', this.handleVisibility);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        window.removeEventListener('pagehide', this.handlePageHide);
        this.isInitialized = false;
        void this.stopHeartbeat();
    }
}

// 싱글톤 인스턴스
const presenceManager = new PresenceManager();

export default presenceManager;
