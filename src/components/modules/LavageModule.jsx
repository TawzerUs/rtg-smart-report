import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import Card from '../Card';
import Button from '../Button';
import StatusBadge from '../StatusBadge';
import { Camera, CheckCircle, Upload, AlertCircle } from 'lucide-react';

const LavageModule = ({ rtgId }) => {
    const { workOrders, setWorkOrders } = useProject();

    // Find the Lavage task for this RTG
    const task = workOrders.find(wo => wo.rtgId === rtgId && wo.title === 'Lavage Industriel');

    // Local state for photos (mock)
    const [photosBefore, setPhotosBefore] = useState([]);
    const [photosAfter, setPhotosAfter] = useState([]);

    // Checklist state
    const [checklist, setChecklist] = useState({
        greaseRemoved: false,
        sweepingDone: false,
        biodegradableUsed: false,
        hotWaterUsed: false,
        dryingDone: false
    });

    if (!task) return <div>Task not initialized</div>;

    const handleCheck = (key) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleStatusUpdate = (newStatus) => {
        setWorkOrders(prev => prev.map(wo =>
            wo.id === task.id ? { ...wo, status: newStatus } : wo
        ));
    };

    const allChecked = Object.values(checklist).every(Boolean);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Photos */}
            <div className="lg:col-span-2 space-y-6">
                <Card title="Photos Avant Lavage">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photosBefore.map((p, i) => (
                            <div key={i} className="aspect-square bg-[var(--bg-glass)] rounded-lg overflow-hidden relative group">
                                <img src={p} alt="Avant" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setPhotosBefore(photosBefore.filter((_, idx) => idx !== i))}
                                    className="absolute top-1 right-1 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-500"
                                >
                                    <Upload className="w-3 h-3 rotate-45" />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-[var(--border-glass)] flex flex-col items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--text-muted)] cursor-pointer">
                            <Camera className="w-6 h-6 mb-2" />
                            <span className="text-xs">Ajouter</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setPhotosBefore([...photosBefore, reader.result]);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </Card>

                <Card title="Photos Après Lavage">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photosAfter.map((p, i) => (
                            <div key={i} className="aspect-square bg-[var(--bg-glass)] rounded-lg overflow-hidden relative group">
                                <img src={p} alt="Après" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setPhotosAfter(photosAfter.filter((_, idx) => idx !== i))}
                                    className="absolute top-1 right-1 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-500"
                                >
                                    <Upload className="w-3 h-3 rotate-45" />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-[var(--border-glass)] flex flex-col items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--text-muted)] cursor-pointer">
                            <Camera className="w-6 h-6 mb-2" />
                            <span className="text-xs">Ajouter</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setPhotosAfter([...photosAfter, reader.result]);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </Card>
            </div>

            {/* Right Column: Controls */}
            <div className="space-y-6">
                <Card title="Statut & Validation">
                    <div className="flex flex-col items-center py-4">
                        <StatusBadge status={task.status} />
                        <div className="mt-6 w-full space-y-3">
                            {task.status === 'Pending' && (
                                <Button variant="primary" className="w-full" onClick={() => handleStatusUpdate('In Progress')}>
                                    Démarrer Lavage
                                </Button>
                            )}
                            {task.status === 'In Progress' && (
                                <Button
                                    variant="success"
                                    className="w-full"
                                    disabled={!allChecked}
                                    onClick={() => handleStatusUpdate('Completed')}
                                >
                                    Terminer & Valider
                                </Button>
                            )}
                            {task.status === 'Completed' && (
                                <div className="p-3 bg-[var(--success)]/10 border border-[var(--success)] rounded-lg flex items-center gap-2 text-[var(--success)]">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Validé par Chef d'Équipe</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <Card title="Checklist Qualité">
                    <div className="space-y-3">
                        {[
                            { key: 'greaseRemoved', label: 'Graisses éliminées' },
                            { key: 'sweepingDone', label: 'Balayage OK' },
                            { key: 'biodegradableUsed', label: 'Produit biodégradable' },
                            { key: 'hotWaterUsed', label: 'HP Eau Chaude' },
                            { key: 'dryingDone', label: 'Séchage cavités' },
                        ].map((item) => (
                            <label key={item.key} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--bg-glass)] cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checklist[item.key]}
                                    onChange={() => handleCheck(item.key)}
                                    className="w-5 h-5 rounded border-[var(--border-glass)] bg-[var(--bg-dark)] text-[var(--primary)] focus:ring-0 focus:ring-offset-0"
                                />
                                <span className={checklist[item.key] ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}>
                                    {item.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LavageModule;
