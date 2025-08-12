import React from 'react';

interface EventMapPinProps {
    category: string;
    color: string;
}

const EventMapPin: React.FC<EventMapPinProps> = ({ category, color }) => {
    return (
        <div 
            className="event-map-pin"
            style={{
                position: 'relative',
                width: '40px',
                height: '48px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
        >
            {/* 핀 원형 부분 */}
            <div 
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: color,
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: 'white',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                }}
                className="pin-circle"
            >
                {category.charAt(0)}
            </div>
            
            {/* 핀 꼬리 부분 */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: `10px solid ${color}`,
                    transform: 'translateX(-50%)',
                }}
            />
        </div>
    );
};

export default EventMapPin;