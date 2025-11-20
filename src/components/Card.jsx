import React from 'react';
import '../index.css';

const Card = ({ children, className = '', title, action }) => {
    return (
        <div className={`glass-panel rounded-xl p-6 ${className}`}>
            {(title || action) && (
                <div className="flex justify-between items-center mb-4">
                    {title && <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
