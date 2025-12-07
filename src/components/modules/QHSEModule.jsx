import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import Modal from '../Modal';
import { Shield, AlertTriangle, CheckCircle, ExternalLink, BookOpen, Plus, Save } from 'lucide-react';

const QHSEModule = ({ rtgId }) => {
    const [checklist, setChecklist] = useState({
        ppe: false,
        safetyZone: false,
        toolsInspected: false,
        permitToWork: false,
        // Pre-use inspection
        fluidLevels: false,
        visualDamage: false,
        hydraulicLeaks: false,
        tracksCondition: false,
        emergencyStop: false
    });

    const [incidents, setIncidents] = useState([]);

    // Modals State
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

    // Incident Form State
    const [incidentForm, setIncidentForm] = useState({
        type: 'Observation',
        desc: '',
        correctiveAction: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Risk Assessment State
    const [risks, setRisks] = useState({
        weather: false,
        heights: false,
        traffic: false,
        electrical: false,
        mitigation: ''
    });

    const handleCheck = (key) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveIncident = () => {
        if (!incidentForm.desc) return alert("Description requise");

        setIncidents([...incidents, {
            id: Date.now(),
            ...incidentForm
        }]);
        setIsIncidentModalOpen(false);
        setIncidentForm({
            type: 'Observation',
            desc: '',
            correctiveAction: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleSaveRiskAssessment = () => {
        alert("Analyse de risque enregistrée et validée.");
        setIsRiskModalOpen(false);
        // Could save this to a 'riskAssessments' state or DB
    };

    const score = Math.round((Object.values(checklist).filter(Boolean).length / 4) * 100);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card title="Checklist Sécurité & Pré-utilisation">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium text-[var(--text-main)] mb-3">Sécurité Personnelle & Zone</h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'ppe', label: 'EPI complets portés (Casque, Chaussures, Gilet)' },
                                    { key: 'safetyZone', label: 'Balisage zone de travail en place' },
                                    { key: 'toolsInspected', label: 'Outillage inspecté et conforme' },
                                    { key: 'permitToWork', label: 'Permis de travail validé' },
                                ].map((item) => (
                                    <label key={item.key} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] cursor-pointer hover:border-[var(--primary)] transition-colors">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checklist[item.key]
                                            ? 'bg-[var(--success)] border-[var(--success)]'
                                            : 'border-[var(--text-muted)]'
                                            }`}>
                                            {checklist[item.key] && <CheckCircle className="w-3 h-3 text-black" />}
                                        </div>
                                        <span className={checklist[item.key] ? 'text-[var(--text-main)] font-medium' : 'text-[var(--text-muted)]'}>
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-[var(--text-main)] mb-3">Inspection Équipement (Pré-utilisation)</h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'fluidLevels', label: 'Niveaux de fluides (Huile, Liquide ref.)' },
                                    { key: 'visualDamage', label: 'Inspection visuelle dommages structurels' },
                                    { key: 'hydraulicLeaks', label: 'Absence de fuites hydrauliques' },
                                    { key: 'tracksCondition', label: 'État des pneus / chenilles' },
                                    { key: 'emergencyStop', label: 'Test Arrêt d\'Urgence' },
                                ].map((item) => (
                                    <label key={item.key} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] cursor-pointer hover:border-[var(--primary)] transition-colors">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checklist[item.key]
                                            ? 'bg-[var(--success)] border-[var(--success)]'
                                            : 'border-[var(--text-muted)]'
                                            }`}>
                                            {checklist[item.key] && <CheckCircle className="w-3 h-3 text-black" />}
                                        </div>
                                        <span className={checklist[item.key] ? 'text-[var(--text-main)] font-medium' : 'text-[var(--text-muted)]'}>
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
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
                        <Button variant="secondary" onClick={() => setIsIncidentModalOpen(true)} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Signaler Observation / Incident
                        </Button>
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

                        <div className="mt-6 w-full">
                            <Button variant="primary" className="w-full" onClick={() => setIsRiskModalOpen(true)}>
                                <Shield className="w-4 h-4 mr-2" />
                                Analyse de Risque
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card title="Formation & Ressources">
                    <div className="space-y-3">
                        <a href="#" className="flex items-center gap-3 p-3 rounded bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] transition-colors group">
                            <BookOpen className="w-5 h-5 text-[var(--primary)]" />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-[var(--text-main)] group-hover:text-[var(--primary)]">Guide Opérateur</div>
                                <div className="text-xs text-[var(--text-muted)]">Manuel d'utilisation RTG</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                        </a>
                        <a href="#" className="flex items-center gap-3 p-3 rounded bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] transition-colors group">
                            <Shield className="w-5 h-5 text-[var(--success)]" />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-[var(--text-main)] group-hover:text-[var(--primary)]">Procédures Sécurité</div>
                                <div className="text-xs text-[var(--text-muted)]">Consignes d'urgence</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                        </a>
                    </div>
                </Card>
            </div>

            {/* Incident Modal */}
            <Modal isOpen={isIncidentModalOpen} onClose={() => setIsIncidentModalOpen(false)} title="Signaler un Incident / Observation">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-1">Type</label>
                        <select
                            value={incidentForm.type}
                            onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })}
                            className="w-full bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)]"
                        >
                            <option value="Observation">Observation</option>
                            <option value="Near Miss">Presque Accident (Near Miss)</option>
                            <option value="Accident">Accident</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-1">Description</label>
                        <textarea
                            value={incidentForm.desc}
                            onChange={(e) => setIncidentForm({ ...incidentForm, desc: e.target.value })}
                            className="w-full h-24 bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)]"
                            placeholder="Décrivez l'incident ou l'observation..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-1">Action Corrective Immédiate</label>
                        <input
                            type="text"
                            value={incidentForm.correctiveAction}
                            onChange={(e) => setIncidentForm({ ...incidentForm, correctiveAction: e.target.value })}
                            className="w-full bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)]"
                            placeholder="Ex: Zone balisée, nettoyage effectué..."
                        />
                    </div>
                    <Button onClick={handleSaveIncident} className="w-full">
                        Enregistrer
                    </Button>
                </div>
            </Modal>

            {/* Risk Assessment Modal */}
            <Modal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} title="Analyse de Risque (LMRA)">
                <div className="space-y-4">
                    <p className="text-sm text-[var(--text-muted)]">Identifiez les risques présents avant de commencer le travail.</p>

                    <div className="space-y-2">
                        {[
                            { key: 'weather', label: 'Conditions Météo (Vent, Pluie)' },
                            { key: 'heights', label: 'Travail en Hauteur' },
                            { key: 'traffic', label: 'Trafic / Engins en mouvement' },
                            { key: 'electrical', label: 'Risque Électrique' },
                        ].map((risk) => (
                            <label key={risk.key} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--bg-glass)] cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={risks[risk.key]}
                                    onChange={() => setRisks({ ...risks, [risk.key]: !risks[risk.key] })}
                                    className="w-4 h-4 rounded border-[var(--border-glass)] bg-[var(--bg-dark)] text-[var(--primary)]"
                                />
                                <span className="text-[var(--text-main)]">{risk.label}</span>
                            </label>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-1">Mesures d'atténuation prévues</label>
                        <textarea
                            value={risks.mitigation}
                            onChange={(e) => setRisks({ ...risks, mitigation: e.target.value })}
                            className="w-full h-20 bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)]"
                            placeholder="Comment allez-vous contrôler ces risques ?"
                        />
                    </div>

                    <Button onClick={handleSaveRiskAssessment} className="w-full" variant="success">
                        Valider l'Analyse
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default QHSEModule;
