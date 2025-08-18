import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Logo from './Logo';

type SplashIntroProps = {
    onFinish: () => void;
};

// 타이밍(수정 가능):
// - 로고 페이드/확대: LOGO_IN = 1.6s (더 느리게)
// - 유지(딜레이): HOLD = 0.35s
// - 오버레이 슬라이드업: SLIDE_UP = 1.1s
// 총 ~3.05s (환경에 따라 미세 오차)
const LOGO_IN = 1.6;
const HOLD = 0.35;
const SLIDE_UP = 1.1;

const SplashIntro: React.FC<SplashIntroProps> = ({ onFinish }) => {
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const originalOverflow = document.documentElement.style.overflow;
            const originalTouchAction = document.documentElement.style.touchAction;
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.touchAction = 'none';
            return () => {
                document.documentElement.style.overflow = originalOverflow;
                document.documentElement.style.touchAction = originalTouchAction;
            };
        }
    }, []);

    useEffect(() => {
        if (prefersReducedMotion) {
            const id = window.setTimeout(onFinish, 0);
            return () => window.clearTimeout(id);
        }
    }, [prefersReducedMotion, onFinish]);

    if (prefersReducedMotion) return null;

    const totalDelay = LOGO_IN + HOLD;

    return (
        <motion.div
            initial={{ y: 0 }}
            animate={{ y: '-100%' }}
            transition={{ delay: totalDelay, duration: SLIDE_UP, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={onFinish}
            className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
            style={{ willChange: 'transform' }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: LOGO_IN, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: 'transform' }}
                className="px-6"
            >
                {/* 반응형: 모바일 60vw, 데스크탑 최대 320px - 이미지 로고 사용 */}
                <img
                    src="/images/FPlogo.png"
                    alt="FairPlay Logo"
                    className="mx-auto w-[60vw] max-w-[320px]"
                    style={{ willChange: 'transform' }}
                />
                <div className="sr-only">로딩 중</div>
            </motion.div>
        </motion.div>
    );
};

export default SplashIntro;


