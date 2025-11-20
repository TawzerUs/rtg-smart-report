import React from 'react';

const SimpleBarChart = ({ data, height = 200 }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 100 / data.length;

    return (
        <div className="w-full p-4 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-glass)]">
            <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                                <div
                                    className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--secondary)] rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                                    style={{ height: `${barHeight}%`, minHeight: '4px' }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-dark)] px-2 py-1 rounded text-xs text-[var(--text-main)] whitespace-nowrap">
                                        {item.value}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-[var(--text-muted)] text-center">{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SimpleBarChart;
