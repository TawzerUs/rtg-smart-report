import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import {
    Activity, Droplets, Search, Layers, Brush, Shield, FileText,
    Info, Calendar, MapPin
} from 'lucide-react';

import LavageModule from '../components/modules/LavageModule';
import InspectionModule from '../components/modules/InspectionModule';
import SablageModule from '../components/modules/SablageModule';
import PaintingModule from '../components/modules/PaintingModule';
import QHSEModule from '../components/modules/QHSEModule';
import ReportModule from '../components/modules/ReportModule';

const RTGView = () => {
    const { id } = useParams();
    const { rtgs, getRTGProgress } = useProject();
    const [activeTab, setActiveTab] = useState('lavage');

    const rtg = rtgs.find(r => r.id === id);
    if (!rtg) return <div className="text-center py-10">RTG Not Found</div>;

    const progress = getRTGProgress(id);

    const tabs = [
        { id: 'lavage', label: 'Lavage', icon: Droplets, color: 'text-blue-400' },
        { id: 'inspection', label: 'Inspection', icon: Search, color: 'text-red-400' },
        { id: 'sablage', label: 'Sablage', icon: Layers, color: 'text-orange-400' },
        { id: 'peinture', label: 'Peinture PPG', icon: Brush, color: 'text-purple-400' },
        { id: 'qhse', label: 'QHSE', icon: Shield, color: 'text-green-400' },
        { id: 'rapport', label: 'Rapport', icon: FileText, color: 'text-gray-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Technical Header */}
            <div className="relative p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <h1 className="text-9xl font-bold text-[var(--text-main)]">{rtg.id.replace('RTG', '')}</h1>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gradient">{rtg.id}</h1>
                            <StatusBadge status={rtg.status} />
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                <span>{rtg.brand} • {rtg.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{rtg.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>MAJ: {rtg.lastUpdate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-[var(--text-muted)]">Avancement Global</p>
                            <p className="text-2xl font-bold text-[var(--primary)]">{progress}%</p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-[var(--bg-glass)] flex items-center justify-center relative">
                            <svg className="w-full h-full absolute inset-0 transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    className="text-[var(--bg-glass)]"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={175}
                                    strokeDashoffset={175 - (175 * progress) / 100}
                                    className="text-[var(--primary)] transition-all duration-1000"
                                />
                            </svg>
                            <Activity className="w-6 h-6 text-[var(--primary)]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Navigation */}
            <div className="flex border-b border-[var(--border-glass)] overflow-x-auto pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative whitespace-nowrap ${activeTab === tab.id
                            ? 'text-[var(--text-main)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-current ${tab.color} shadow-[0_0_10px_currentColor]`}></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Module Content */}
            <div className="animate-fade-in min-h-[400px]">
                {activeTab === 'lavage' && <LavageModule rtgId={id} />}
                {activeTab === 'inspection' && <InspectionModule rtgId={id} />}
                {activeTab === 'sablage' && <SablageModule rtgId={id} />}
                {activeTab === 'peinture' && <PaintingModule rtgId={id} />}
                {activeTab === 'qhse' && <QHSEModule rtgId={id} />}
                {activeTab === 'rapport' && <ReportModule rtgId={id} />}
            </div>
        </div>
    );
};

export default RTGView;
