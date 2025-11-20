import React from 'react';

const ProgressChart = ({ label, value, max = 100, color = 'primary' }) => {
    const percentage = Math.min((value / max) * 100, 100);

    const colorClasses = {
        primary: 'bg-[var(--primary)]',
        success: 'bg-[var(--success)]',
        warning: 'bg-[var(--warning)]',
        danger: 'bg-[var(--danger)]',
    };

    const glowColors = {
        primary: 'shadow-[0_0_10px_var(--primary-glow)]',
        success: 'shadow-[0_0_10px_rgba(0,255,157,0.4)]',
        warning: 'shadow-[0_0_10px_rgba(255,184,0,0.4)]',
        danger: 'shadow-[0_0_10px_rgba(255,42,42,0.4)]',
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-muted)]">{label}</span>
                <span className="text-sm font-medium text-[var(--text-main)]">{value}/{max}</span>
            </div>
            <div className="w-full h-2 bg-[var(--bg-glass)] rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClasses[color]} ${glowColors[color]} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressChart;
