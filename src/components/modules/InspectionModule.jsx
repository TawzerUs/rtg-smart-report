import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import Card from '../Card';
import Button from '../Button';
import ImageAnnotator from '../ImageAnnotator';
import Modal from '../Modal';
import { AlertTriangle, Trash2, Save } from 'lucide-react';

const InspectionModule = ({ rtgId }) => {
    const { zones, corrosionData, setCorrosionData } = useProject();
    const [selectedZone, setSelectedZone] = useState(zones[0].id);

    // Local state for zone images (in a real app, this would be in global state or DB)
    const [zoneImages, setZoneImages] = useState({});

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPoint, setEditingPoint] = useState(null);

    // Filter data for this RTG and Zone
    const zonePoints = corrosionData.filter(c => c.rtgId === rtgId && c.zone === selectedZone);

    const handleImageUpload = (imageData) => {
        setZoneImages(prev => ({ ...prev, [selectedZone]: imageData }));
    };

    const handleAddPoint = (coords) => {
        const newPoint = {
            id: Date.now(),
            rtgId,
            zone: selectedZone,
            x: coords.x,
            y: coords.y,
            severity: 'Medium',
            notes: '',
            date: new Date().toISOString().split('T')[0]
        };
        setEditingPoint(newPoint);
        setIsModalOpen(true);
    };

    const handlePointClick = (point) => {
        setEditingPoint(point);
        setIsModalOpen(true);
    };

    const handleSavePoint = () => {
        if (!editingPoint) return;

        setCorrosionData(prev => {
            const exists = prev.find(p => p.id === editingPoint.id);
            if (exists) {
                return prev.map(p => p.id === editingPoint.id ? editingPoint : p);
            } else {
                return [...prev, editingPoint];
            }
        });
        setIsModalOpen(false);
        setEditingPoint(null);
    };

    const handleDeletePoint = () => {
        if (!editingPoint) return;
        setCorrosionData(prev => prev.filter(p => p.id !== editingPoint.id));
        setIsModalOpen(false);
        setEditingPoint(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone Selection */}
            <div className="space-y-4">
                <Card title="Zones d'Inspection">
                    <div className="space-y-2">
                        {zones.map((zone) => {
                            const count = corrosionData.filter(c => c.rtgId === rtgId && c.zone === zone.id).length;
                            return (
                                <button
                                    key={zone.id}
                                    onClick={() => setSelectedZone(zone.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between ${selectedZone === zone.id
                                        ? 'bg-[var(--primary)]/10 border border-[var(--primary)] text-[var(--primary)]'
                                        : 'bg-[var(--bg-glass)] border border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                >
                                    <span>{zone.name}</span>
                                    {count > 0 && (
                                        <span className="bg-[var(--danger)] text-white text-xs px-2 py-0.5 rounded-full">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Card>

                <Card title="Légende">
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[var(--success)]"></div>
                            <span className="text-[var(--text-muted)]">Léger (Surface)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[var(--warning)]"></div>
                            <span className="text-[var(--text-muted)]">Moyen (Pitting)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[var(--danger)]"></div>
                            <span className="text-[var(--text-muted)]">Sévère (Perforation)</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content: Image Annotator */}
            <div className="lg:col-span-2 space-y-6">
                <Card title={`Inspection Visuelle: ${zones.find(z => z.id === selectedZone)?.name}`}>
                    <ImageAnnotator
                        image={zoneImages[selectedZone]}
                        onImageUpload={handleImageUpload}
                        points={zonePoints}
                        onAddPoint={handleAddPoint}
                        onPointClick={handlePointClick}
                    />

                    <div className="mt-4">
                        <h4 className="font-bold text-[var(--text-main)] mb-2">Liste des Défauts ({zonePoints.length})</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {zonePoints.length === 0 ? (
                                <p className="text-sm text-[var(--text-muted)]">Aucun défaut marqué sur cette zone.</p>
                            ) : (
                                zonePoints.map((point, index) => (
                                    <div key={point.id} onClick={() => handlePointClick(point)} className="flex items-center justify-between p-3 rounded bg-[var(--bg-glass)] border border-[var(--border-glass)] hover:border-[var(--primary)] cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white ${point.severity === 'High' ? 'bg-[var(--danger)]' :
                                                    point.severity === 'Medium' ? 'bg-[var(--warning)]' :
                                                        'bg-[var(--success)]'
                                                }`}>{index + 1}</div>
                                            <div>
                                                <span className="text-sm text-[var(--text-main)] font-medium">#{index + 1}</span>
                                                <span className="text-sm text-[var(--text-muted)] ml-2">{point.notes || 'Sans notes'}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-[var(--text-muted)]">{point.date}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Détails Corrosion">
                {editingPoint && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Sévérité</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setEditingPoint({ ...editingPoint, severity: level })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${editingPoint.severity === level
                                            ? level === 'High' ? 'bg-[var(--danger)] text-white' :
                                                level === 'Medium' ? 'bg-[var(--warning)] text-black' :
                                                    'bg-[var(--success)] text-black'
                                            : 'bg-[var(--bg-glass)] text-[var(--text-muted)] hover:bg-[var(--bg-glass-hover)]'
                                            }`}
                                    >
                                        {level === 'Low' ? 'Léger' : level === 'Medium' ? 'Moyen' : 'Sévère'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Description / Notes</label>
                            <textarea
                                value={editingPoint.notes}
                                onChange={(e) => setEditingPoint({ ...editingPoint, notes: e.target.value })}
                                className="w-full h-24 bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded-lg p-3 text-[var(--text-main)] focus:border-[var(--primary)] outline-none resize-none"
                                placeholder="Décrire le type de corrosion, surface affectée..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            {editingPoint.id && corrosionData.find(p => p.id === editingPoint.id) && (
                                <Button variant="danger" icon={Trash2} onClick={handleDeletePoint} className="flex-1">
                                    Supprimer
                                </Button>
                            )}
                            <Button variant="primary" icon={Save} onClick={handleSavePoint} className="flex-1">
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default InspectionModule;
