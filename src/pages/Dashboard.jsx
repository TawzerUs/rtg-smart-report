import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { Activity, ArrowRight, Battery, Calendar } from 'lucide-react';

const Dashboard = () => {
    const { rtgs, getRTGProgress } = useProject();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Tableau de Bord RTG</h1>
                    <p className="text-[var(--text-muted)]">Suivi de projet Eurogate / Spidercord</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                        <span className="text-sm text-[var(--text-muted)]">Total Équipements</span>
                        <p className="text-xl font-bold text-[var(--primary)]">{rtgs.length}</p>
                    </div>
                </div>
            </div>

            {/* Fleet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rtgs.map((rtg) => {
                    const progress = getRTGProgress(rtg.id);
                    return (
                        <div
                            key={rtg.id}
                            onClick={() => navigate(`/rtg/${rtg.id}`)}
                            className="group relative p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] hover:border-[var(--primary)] transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                                            {rtg.id}
                                        </h3>
                                        <p className="text-sm text-[var(--text-muted)]">{rtg.brand} • {rtg.capacity}</p>
                                    </div>
                                    <StatusBadge status={rtg.status} />
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[var(--text-muted)]">Avancement Global</span>
                                        <span className="text-[var(--primary)] font-bold">{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-[var(--bg-glass)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-[var(--text-muted)] pt-4 border-t border-[var(--border-glass)]">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>MAJ: {rtg.lastUpdate}</span>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dashboard;
