import React from 'react';

const UserCursor = ({ x, y, userName, color }) => {
    return (
        <div
            className="absolute pointer-events-none z-50 transition-all duration-75 ease-out"
            style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-2px, -2px)',
            }}
        >
            {/* Cursor SVG */}
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
                <path
                    d="M5.65376 12.3673L18.8747 5.84967L12.3671 19.0606L10.4028 12.9788L5.65376 12.3673Z"
                    fill={color}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Username Label */}
            <div
                className="absolute top-6 left-4 px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap"
                style={{
                    backgroundColor: color,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
            >
                {userName}
            </div>
        </div>
    );
};

export default UserCursor;
