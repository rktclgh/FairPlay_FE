import React from 'react';

type LogoProps = {
    className?: string;
    title?: string;
};

const Logo: React.FC<LogoProps> = ({ className, title = 'FairPlay Logo' }) => {
    return (
        <svg
            role="img"
            aria-label={title}
            viewBox="0 0 128 128"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title>{title}</title>
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4da3ff" />
                    <stop offset="100%" stopColor="#2b6fe0" />
                </linearGradient>
            </defs>
            <circle cx="64" cy="64" r="58" fill="url(#grad)" />
            <circle cx="64" cy="64" r="52" fill="white" />
            <circle cx="48" cy="60" r="6" fill="#2b6fe0" />
            <circle cx="80" cy="60" r="6" fill="#2b6fe0" />
            <path d="M44 78c6 8 34 8 40 0" stroke="#49b36b" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M64 14 L64 28" stroke="#ff8c3a" strokeWidth="6" strokeLinecap="round" />
            <path d="M58 22 L70 22" stroke="#ff8c3a" strokeWidth="6" strokeLinecap="round" />
        </svg>
    );
};

export default Logo;


