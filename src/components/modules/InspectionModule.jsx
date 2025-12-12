import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../Card';
import Button from '../Button';
import ImageAnnotator from '../ImageAnnotator';
import Modal from '../Modal';
import Tooltip from '../Tooltip';
import CameraImageUpload from '../CameraImageUpload';
import { Camera, CheckCircle, Trash2, Plus, AlertTriangle, Info, Save, Image as ImageIcon } from 'lucide-react';

const InspectionModule = ({ rtgId }) => {
    const { zones, corrosionData, setCorrosionData, zoneImages, setZoneImages } = useProject();
    const { isOperator } = useAuth();
    const [selectedZone, setSelectedZone] = useState(zones[0].id);

    // Multiple images per zone: { zoneId: [{ id, url, timestamp }] }
    const [zoneImageGallery, setZoneImageGallery] = useState({});
    const [selectedImageId, setSelectedImageId] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPoint, setEditingPoint] = useState(null);
    const [validationError, setValidationError] = useState(null);

    // Filter data for this RTG and Zone
    const zonePoints = corrosionData.filter(c => c.rtgId === rtgId && c.zone === selectedZone);

    // Get images for current zone
    const currentZoneImages = zoneImageGallery[selectedZone] || [];
    const selectedImage = currentZoneImages.find(img => img.id === selectedImageId) || currentZoneImages[0];

    const handleImageUpload = async (imageData, file) => {
        // Optimistic update for immediate feedback
        setZoneImages(prev => ({ ...prev, [selectedZone]: imageData }));

        if (!file) return;

        try {
            // Upload to Supabase
            const { uploadImage } = await import('../../services/supabaseStorage');
            // Update DB (Save to inspections table instead of zones)
            const { saveCorrosionPoints } = await import('../../services/supabaseDb');

            // Upload the image and get the URL
            const result = await uploadImage(file, `inspections/${rtgId}/${selectedZone}_${Date.now()}`);

            // Get current validation status
            const currentValidation = zones.find(z => z.id === selectedZone)?.validated_at;

            // Construct full zone data object
            const newZoneData = {
                points: zonePoints,
                imageUrl: result.url,
                validated_at: currentValidation
            };

            await saveCorrosionPoints(rtgId, selectedZone, newZoneData);

            // Confirm URL update (in case optimistic was base64)
            setZoneImages(prev => ({ ...prev, [selectedZone]: result.url }));

        } catch (err) {
            console.error("Upload failed details:", err);
            alert(`Erreur lors de l'upload de l'image: ${err.message || 'Erreur inconnue'}`);
            // Revert optimistic update on failure
            setZoneImages(prev => {
                const next = { ...prev };
                delete next[selectedZone];
                return next;
            });
        }
    };

    const handleImageDelete = async () => {
        try {
            const { deleteImageByUrl } = await import('../../services/supabaseStorage');
            const { saveCorrosionPoints } = await import('../../services/supabaseDb');

            // Get current validation status
            const currentValidation = zones.find(z => z.id === selectedZone)?.validated_at;

            // Construct full zone data object (without image)
            const newZoneData = {
                points: zonePoints,
                imageUrl: null,
                validated_at: currentValidation
            };

            // Update DB
            await saveCorrosionPoints(rtgId, selectedZone, newZoneData);

            // Update Context
            setZoneImages(prev => {
                const next = { ...prev };
                delete next[selectedZone];
                return next;
            });

        } catch (err) {
            console.error("Delete failed:", err);
            alert("Erreur lors de la suppression");
        }
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
        setValidationError(null);
        setIsModalOpen(true);
    };

    const handlePointClick = (point) => {
        setEditingPoint(point);
        setValidationError(null);
        setIsModalOpen(true);
    };

    const handleSavePoint = async () => {
        if (!editingPoint) return;

        if (!editingPoint.notes || editingPoint.notes.trim() === '') {
            setValidationError("La description est obligatoire.");
            return;
        }

        // Update local state first (optimistic)
        const updatedPoints = corrosionData.map(p => p.id === editingPoint.id ? editingPoint : p);
        if (!corrosionData.find(p => p.id === editingPoint.id)) {
            updatedPoints.push(editingPoint);
        }

        setCorrosionData(prev => {
            const exists = prev.find(p => p.id === editingPoint.id);
            if (exists) {
                return prev.map(p => p.id === editingPoint.id ? editingPoint : p);
            } else {
                return [...prev, editingPoint];
            }
        });

        // Save to DB
        try {
            const { saveCorrosionPoints } = await import('../../services/supabaseDb');
            // Filter points for this zone only
            const zonePointsToSave = updatedPoints.filter(p => p.rtgId === rtgId && p.zone === selectedZone);

            // Get current image and validation
            const currentImage = zoneImages[selectedZone];
            const currentValidation = zones.find(z => z.id === selectedZone)?.validated_at;

            const newZoneData = {
                points: zonePointsToSave,
                imageUrl: currentImage,
                validated_at: currentValidation
            };

            await saveCorrosionPoints(rtgId, selectedZone, newZoneData);
            console.log("Points saved to DB for zone:", selectedZone);
        } catch (err) {
            console.error("Failed to save points:", err);
            alert("Erreur lors de la sauvegarde des points");
        }

        setIsModalOpen(false);
        setEditingPoint(null);
    };

    const handleDeletePoint = async () => {
        if (!editingPoint) return;

        const updatedPoints = corrosionData.filter(p => p.id !== editingPoint.id);
        setCorrosionData(prev => prev.filter(p => p.id !== editingPoint.id));

        // Save to DB
        try {
            const { saveCorrosionPoints } = await import('../../services/supabaseDb');
            // Filter points for this zone only
            const zonePointsToSave = updatedPoints.filter(p => p.rtgId === rtgId && p.zone === selectedZone);

            // Get current image and validation
            const currentImage = zoneImages[selectedZone];
            const currentValidation = zones.find(z => z.id === selectedZone)?.validated_at;

            const newZoneData = {
                points: zonePointsToSave,
                imageUrl: currentImage,
                validated_at: currentValidation
            };

            await saveCorrosionPoints(rtgId, selectedZone, newZoneData);
            console.log("Points saved to DB (after delete) for zone:", selectedZone);
        } catch (err) {
            console.error("Failed to save points after delete:", err);
            alert("Erreur lors de la sauvegarde des points");
        }

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
                        onImageDelete={zoneImages[selectedZone] ? handleImageDelete : null}
                        points={zonePoints}
                        onAddPoint={handleAddPoint}
                        onPointClick={handlePointClick}
                        readOnly={!isOperator}
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

                    {/* Zone Validation */}
                    <div className="mt-6 p-4 bg-[var(--bg-glass)] rounded-lg border border-[var(--border-glass)]">
                        {zones.find(z => z.id === selectedZone)?.validated_at ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-[var(--success)] mb-1">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-bold">Zone Validée</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {new Date(zones.find(z => z.id === selectedZone)?.validated_at).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-[var(--text-muted)] mb-3">
                                    Validez cette zone pour confirmer l'inspection
                                </p>
                                {isOperator && (
                                    <Button
                                        variant="success"
                                        className="w-full"
                                        disabled={!zoneImages[selectedZone]}
                                        onClick={async () => {
                                            try {
                                                const { saveCorrosionPoints } = await import('../../services/supabaseDb');

                                                // Get current image
                                                const currentImage = zoneImages[selectedZone];
                                                const validationTimestamp = new Date().toISOString();

                                                // Save full object
                                                const newZoneData = {
                                                    points: zonePoints,
                                                    imageUrl: currentImage,
                                                    validated_at: validationTimestamp
                                                };

                                                await saveCorrosionPoints(rtgId, selectedZone, newZoneData);

                                                // Update Context
                                                setZones(prev => prev.map(z =>
                                                    z.id === selectedZone ? { ...z, validated_at: new Date().toISOString() } : z
                                                ));

                                                alert(`Zone ${zones.find(z => z.id === selectedZone)?.name} validée avec succès!`);
                                            } catch (err) {
                                                console.error('Validation failed:', err);
                                                alert(`Erreur lors de la validation: ${err.message || 'Erreur inconnue'}`);
                                            }
                                        }}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Valider Zone {zones.find(z => z.id === selectedZone)?.name}
                                    </Button>
                                )}
                                {!zoneImages[selectedZone] && isOperator && (
                                    <p className="text-xs text-[var(--warning)] mt-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Ajoutez une image de la zone pour valider
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isOperator ? "Détails Corrosion" : "Détails Corrosion (Lecture Seule)"}>
                {editingPoint && (
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="block text-sm text-[var(--text-muted)]">Sévérité</label>
                                <Tooltip text="Indiquez le niveau de corrosion observé.">
                                    <Info size={14} className="text-[var(--text-muted)] cursor-help" />
                                </Tooltip>
                            </div>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => isOperator && setEditingPoint({ ...editingPoint, severity: level })}
                                        disabled={!isOperator}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${editingPoint.severity === level
                                            ? level === 'High' ? 'bg-[var(--danger)] text-white' :
                                                level === 'Medium' ? 'bg-[var(--warning)] text-black' :
                                                    'bg-[var(--success)] text-black'
                                            : 'bg-[var(--bg-glass)] text-[var(--text-muted)] hover:bg-[var(--bg-glass-hover)]'
                                            } ${!isOperator ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {level === 'Low' ? 'Léger' : level === 'Medium' ? 'Moyen' : 'Sévère'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Description / Notes <span className="text-[var(--danger)]">*</span></label>
                            <textarea
                                value={editingPoint.notes}
                                onChange={(e) => {
                                    setEditingPoint({ ...editingPoint, notes: e.target.value });
                                    if (e.target.value.trim() !== '') setValidationError(null);
                                }}
                                disabled={!isOperator}
                                className={`w-full h-24 bg-[var(--bg-dark)] border rounded-lg p-3 text-[var(--text-main)] focus:border-[var(--primary)] outline-none resize-none ${validationError ? 'border-[var(--danger)]' : 'border-[var(--border-glass)]'} ${!isOperator ? 'opacity-70 cursor-not-allowed' : ''}`}
                                placeholder="Décrire le type de corrosion, surface affectée..."
                            />
                            {validationError && (
                                <p className="text-[var(--danger)] text-xs mt-1 flex items-center gap-1">
                                    <AlertTriangle size={12} />
                                    {validationError}
                                </p>
                            )}
                        </div>

                        {isOperator && (
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
                        )}
                    </div>
                )}
            </Modal >
        </div >
    );
};

export default InspectionModule;
