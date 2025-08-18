import React from 'react';
import SplashIntro from './SplashIntro';
import { useFirstVisitGate } from '../hooks/useFirstVisitGate';

type AppLayoutProps = {
    children: React.ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { shouldShow, dismiss } = useFirstVisitGate();

    return (
        <div className="min-h-screen bg-white">
            {children}
            {shouldShow && <SplashIntro onFinish={dismiss} />}
        </div>
    );
};

export default AppLayout;


