import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props { className?: string }

export const SupportSideNav: React.FC<Props> = ({ className = '' }) => {
    const location = useLocation();
    const active = (path: string) => location.pathname === path ? 'font-bold text-black' : 'text-[#00000080]';

    return (
        <div className={`w-[240px] bg-white ${className}`}>
            <div className="p-6">
                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl leading-[40px] mb-4 text-left">SUPPORT</h2>
                <nav className="text-left space-y-1">
                    <Link to="/support/notices" className={`block text-[15px] no-underline ${active('/support/notices')}`} style={{ textDecoration: 'none' }}>공지사항</Link>
                    <Link to="/support/faq" className={`block text-[15px] no-underline ${active('/support/faq')}`} style={{ textDecoration: 'none' }}>자주 묻는 질문</Link>
                </nav>
            </div>
        </div>
    );
}

export default SupportSideNav;


