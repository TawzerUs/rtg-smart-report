import React from 'react';

const StatCard = ({ icon: Icon, label, value, trend, color = 'primary' }) => {
    const colorClasses = {
        primary: 'from-[var(--primary)]/20 to-[var(--primary)]/5 border-[var(--primary)]/30',
        success: 'from-[var(--success)]/20 to-[var(--success)]/5 border-[var(--success)]/30',
        warning: 'from-[var(--warning)]/20 to-[var(--warning)]/5 border-[var(--warning)]/30',
        danger: 'from-[var(--danger)]/20 to-[var(--danger)]/5 border-[var(--danger)]/30',
    };

    const iconColors = {
        primary: 'text-[var(--primary)]',
        success: 'text-[var(--success)]',
        warning: 'text-[var(--warning)]',
        danger: 'text-[var(--danger)]',
    };

    return (
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm overflow-hidden`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1 truncate">{label}</p>
                    <p className="text-2xl font-bold text-[var(--text-main)] mb-1 break-words">{value}</p>
                    {trend && (
                        <p className={`text-xs ${trend.positive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                            {trend.positive ? '↑' : '↓'} {trend.value}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-lg bg-[var(--bg-glass)] ${iconColors[color]} flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
