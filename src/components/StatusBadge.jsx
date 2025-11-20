import React from 'react';

const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-[var(--success)] text-[#0a0a12] shadow-[0_0_10px_rgba(0,255,157,0.4)]';
            case 'in progress': return 'bg-[var(--warning)] text-[#0a0a12] shadow-[0_0_10px_rgba(255,184,0,0.4)]';
            case 'cleaning': return 'bg-[var(--info)] text-[#0a0a12] shadow-[0_0_10px_rgba(0,204,255,0.4)]';
            case 'painting': return 'bg-[var(--secondary)] text-white shadow-[0_0_10px_var(--secondary-glow)]';
            case 'issue': return 'bg-[var(--danger)] text-white shadow-[0_0_10px_rgba(255,42,42,0.4)]';
            default: return 'glass-button text-[var(--text-muted)]';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(status)}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
