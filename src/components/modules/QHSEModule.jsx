import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const QHSEModule = ({ rtgId }) => {
    const [checklist, setChecklist] = useState({
        ppe: false,
        safetyZone: false,
        toolsInspected: false,
        permitToWork: false
    });

    const [incidents, setIncidents] = useState([]);

    const handleCheck = (key) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAddIncident = () => {
        setIncidents([...incidents, {
            id: Date.now(),
            type: 'Observation',
            desc: 'Zone de travail encombrée',
            date: new Date().toISOString().split('T')[0]
        }]);
    };

    const score = Math.round((Object.values(checklist).filter(Boolean).length / 4) * 100);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card title="Checklist Sécurité Quotidienne">
                    <div className="space-y-4">
                        {[
                            { key: 'ppe', label: 'EPI complets portés (Casque, Chaussures, Gilet)' },
                            { key: 'safetyZone', label: 'Balisage zone de travail en place' },
                            { key: 'toolsInspected', label: 'Outillage inspecté et conforme' },
                            { key: 'permitToWork', label: 'Permis de travail validé' },
                        ].map((item) => (
                            <label key={item.key} className="flex items-center gap-4 p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] cursor-pointer hover:border-[var(--primary)] transition-colors">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${checklist[item.key]
                                        ? 'bg-[var(--success)] border-[var(--success)]'
                                        : 'border-[var(--text-muted)]'
                                    }`}>
                                    {checklist[item.key] && <CheckCircle className="w-4 h-4 text-black" />}
                                </div>
                                <span className={checklist[item.key] ? 'text-[var(--text-main)] font-medium' : 'text-[var(--text-muted)]'}>
                                    {item.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </Card>

                <Card title="Journal QHSE">
                    <div className="space-y-4">
                        {incidents.length === 0 ? (
                            <p className="text-[var(--text-muted)] text-center py-4">Aucun incident signalé.</p>
                        ) : (
                            incidents.map((inc) => (
                                <div key={inc.id} className="flex items-center justify-between p-3 rounded bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
                                        <div>
                                            <p className="text-[var(--text-main)]">{inc.desc}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{inc.date}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded bg-[var(--warning)]/20 text-[var(--warning)]">{inc.type}</span>
                                </div>
                            ))
                        )}
                        <Button variant="secondary" onClick={handleAddIncident} className="w-full">Signaler Observation</Button>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card title="Score Sécurité">
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="60" stroke="var(--bg-glass)" strokeWidth="8" fill="transparent" />
                                <circle
                                    cx="64" cy="64" r="60"
                                    stroke={score === 100 ? 'var(--success)' : score > 50 ? 'var(--warning)' : 'var(--danger)'}
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={377}
                                    strokeDashoffset={377 - (377 * score) / 100}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Shield className="w-8 h-8 mb-1 text-[var(--text-muted)]" />
                                <span className="text-2xl font-bold text-[var(--text-main)]">{score}%</span>
                            </div>
                        </div>
                        <p className="mt-4 text-[var(--text-muted)] text-center">Conformité du Jour</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default QHSEModule;
