import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import Card from '../Card';
import Button from '../Button';
import StatusBadge from '../StatusBadge';
import { Camera, CheckCircle, Ruler } from 'lucide-react';

const SablageModule = ({ rtgId }) => {
    const { workOrders, setWorkOrders, zones } = useProject();

    const task = workOrders.find(wo => wo.rtgId === rtgId && wo.title === 'Sablage SA 2.5');

    const [selectedZone, setSelectedZone] = useState(zones[0].id);

    // Zone-specific state (mock DB)
    const [zoneData, setZoneData] = useState({});

    const getZoneData = (zoneId) => zoneData[zoneId] || {
        photos: [],
        roughness: '',
        checklist: {
            degreasingDone: false,
            protectionInstalled: false,
            dustRemoved: false,
            bureauControlApproved: false
        }
    };

    const updateZoneData = (zoneId, field, value) => {
        setZoneData(prev => ({
            ...prev,
            [zoneId]: { ...getZoneData(zoneId), [field]: value }
        }));
    };

    const updateChecklist = (zoneId, key) => {
        const currentChecklist = getZoneData(zoneId).checklist;
        updateZoneData(zoneId, 'checklist', { ...currentChecklist, [key]: !currentChecklist[key] });
    };

    if (!task) return <div>Task not initialized</div>;

    const currentData = getZoneData(selectedZone);
    const allChecked = Object.values(currentData.checklist).every(Boolean) && currentData.roughness !== '';

    const handleStatusUpdate = (newStatus) => {
        setWorkOrders(prev => prev.map(wo =>
            wo.id === task.id ? { ...wo, status: newStatus } : wo
        ));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone Selector */}
            <div className="space-y-4">
                <Card title="Zone à Traiter">
                    <div className="space-y-2">
                        {zones.map((zone) => (
                            <button
                                key={zone.id}
                                onClick={() => setSelectedZone(zone.id)}
                                className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between ${selectedZone === zone.id
                                    ? 'bg-[var(--primary)]/10 border border-[var(--primary)] text-[var(--primary)]'
                                    : 'bg-[var(--bg-glass)] border border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <span>{zone.name}</span>
                                {zoneData[zone.id]?.checklist.bureauControlApproved && (
                                    <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <Card title={`Préparation de Surface: ${zones.find(z => z.id === selectedZone)?.name}`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {currentData.photos.map((p, i) => (
                            <div key={i} className="aspect-square bg-[var(--bg-glass)] rounded-lg overflow-hidden">
                                <img src={p} alt="Sablage" className="w-full h-full object-cover" />
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-[var(--border-glass)] flex flex-col items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--text-muted)] cursor-pointer">
                            <Camera className="w-6 h-6 mb-2" />
                            <span className="text-xs">Ajouter Photo</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => updateZoneData(selectedZone, 'photos', [...currentData.photos, reader.result]);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[var(--bg-glass)] rounded-lg">
                            <Ruler className="w-6 h-6 text-[var(--secondary)]" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Rugosité (µm)</label>
                            <input
                                type="number"
                                value={currentData.roughness}
                                onChange={(e) => updateZoneData(selectedZone, 'roughness', e.target.value)}
                                placeholder="Ex: 65"
                                className="w-full bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-[var(--border-glass)]">
                        <h4 className="font-bold text-[var(--text-main)]">Checklist Validation</h4>
                        {[
                            { key: 'degreasingDone', label: 'Dégraissage avant sablage' },
                            { key: 'protectionInstalled', label: 'Protections installées' },
                            { key: 'dustRemoved', label: 'Poussières éliminées' },
                            { key: 'bureauControlApproved', label: 'Approbation Bureau Contrôle' },
                        ].map((item) => (
                            <label key={item.key} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--bg-glass)] cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={currentData.checklist[item.key]}
                                    onChange={() => updateChecklist(selectedZone, item.key)}
                                    className="w-5 h-5 rounded border-[var(--border-glass)] bg-[var(--bg-dark)] text-[var(--primary)] focus:ring-0 focus:ring-offset-0"
                                />
                                <span className={currentData.checklist[item.key] ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}>
                                    {item.label}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-6">
                        <Button
                            variant="success"
                            className="w-full"
                            disabled={!allChecked}
                            onClick={() => handleStatusUpdate('In Progress')} // Just updates global task status for now
                        >
                            Valider Zone {selectedZone}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SablageModule;
