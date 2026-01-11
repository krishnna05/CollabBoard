import React from 'react';
import { MousePointer2 } from 'lucide-react';

const UserCursor = ({ x, y, userName, color }) => {
    return (
        <div
            className="absolute pointer-events-none z-50 top-0 left-0 transition-transform duration-75 ease-linear will-change-transform"
            style={{
                transform: `translate(${x}px, ${y}px)`,
            }}
        >
            <div className="relative">
                {/* Cursor Icon */}
                <MousePointer2
                    className="w-5 h-5 drop-shadow-md"
                    style={{ 
                        fill: color, 
                        color: color === '#000000' || color === '#1e293b' ? '#fff' : color // Stroke color fallback
                    }}
                    strokeWidth={1}
                />

                {/* Username Tag */}
                <div
                    className="absolute left-4 top-4 px-2.5 py-1 rounded-full rounded-tl-none text-[10px] font-bold text-white shadow-md whitespace-nowrap transform translate-y-1"
                    style={{ backgroundColor: color }}
                >
                    {userName}
                </div>
            </div>
        </div>
    );
};

export default UserCursor;