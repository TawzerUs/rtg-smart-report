import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import Card from '../Card';
import Button from '../Button';
import Tooltip from '../Tooltip';
import Modal from '../Modal';
import CameraImageUpload from '../CameraImageUpload';
import { Save, AlertCircle, CheckCircle, Trash2, Copy, Info, Settings, AlertTriangle } from 'lucide-react';

const CoatingControlModule = ({ rtgId }) => {
    console.log('🔧 NEW CoatingControlModule loaded for RTG:', rtgId);

    // Hardcoded test zones
    const { coatingControlData = [], setCoatingControlData, zones } = useProject();

    // Initialize selectedZone with first available zone
    useEffect(() => {
        if (zones && zones.length > 0 && !selectedZone) {
            setSelectedZone(zones[0].id);
        }
    }, [zones]);

    // Hardcoded test layers
    const testLayers = [
        { id: 'L1', name: 'Primaire PPG SigmaCover', target: 70 },
        { id: 'L2', name: 'Intermédiaire PPG SigmaGuard', target: 150 },
        { id: 'L3', name: 'Finale PPG SigmaDur', target: 60 }
    ];

    const [selectedZone, setSelectedZone] = useState('');
    const [selectedLayer, setSelectedLayer] = useState('L1');
    const [editingRecord, setEditingRecord] = useState(null);
    const [readings, setReadings] = useState({
        dft1: '',
        dft2: '',
        dft3: '',
        dft4: '',
        dft5: '',
        temp: '',
        humidity: '',
        images: []
    });

    // Device Calibration State
    const [calibrationDate, setCalibrationDate] = useState('2023-01-01'); // Default to old date to show warning
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    // Context loaded above
    const savedRecords = (coatingControlData || []).filter(c => c.rtgId === rtgId);

    // Check calibration status
    const isCalibrationOverdue = () => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return new Date(calibrationDate) < oneYearAgo;
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setSelectedZone(record.zone_id || record.zoneId);

        // Find layer by name
        const layer = testLayers.find(l => l.name === record.layer_name || l.name === record.layerName);
        setSelectedLayer(layer ? layer.id : 'L1');

        const dftReadings = record.dft_readings || record.dftReadings || [];
        setReadings({
            dft1: dftReadings[0] || '',
            dft2: dftReadings[1] || '',
            dft3: dftReadings[2] || '',
            dft4: dftReadings[3] || '',
            dft5: dftReadings[4] || '',
            temp: record.surface_temp || record.surfaceTemp || '',
            humidity: record.humidity || '',
            images: record.images || []
        });
    };

    const handleCancelEdit = () => {
        setEditingRecord(null);
        setReadings({
            dft1: '', dft2: '', dft3: '', dft4: '', dft5: '',
            temp: '', humidity: '', images: []
        });
        setSelectedZone(zones?.[0]?.id || '');
        setSelectedLayer('L1');
    };

    const handleCopyPrevious = () => {
        // Find the most recent record
        if (savedRecords.length === 0) return;

        // Sort by date descending (assuming created_at is ISO string)
        const sorted = [...savedRecords].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const lastRecord = sorted[0];

        if (lastRecord) {
            const dftReadings = lastRecord.dft_readings || lastRecord.dftReadings || [];
            setReadings(prev => ({
                ...prev,
                dft1: dftReadings[0] || '',
                dft2: dftReadings[1] || '',
                dft3: dftReadings[2] || '',
                dft4: dftReadings[3] || '',
                dft5: dftReadings[4] || '',
                temp: lastRecord.surface_temp || lastRecord.surfaceTemp || '',
                humidity: lastRecord.humidity || ''
            }));
            alert("Données copiées du dernier relevé.");
        }
    };

    const handleDelete = async (record) => {
        if (!confirm('Supprimer ce contrôle et toutes ses images ?')) return;

        console.log('🗑️ Starting delete for record:', record.id);

        try {
            const { deleteCoatingControl, getCoatingControls } = await import('../../services/supabaseDb');
            const { deleteImageByUrl } = await import('../../services/supabaseStorage');

            // Delete all images from storage
            const images = record.images || [];
            console.log(`🗑️ Deleting ${images.length} images...`);

            for (const imageUrl of images) {
                try {
                    await deleteImageByUrl(imageUrl);
                    console.log('✅ Deleted image:', imageUrl);
                } catch (imgErr) {
                    console.error('❌ Failed to delete image:', imageUrl, imgErr);
                    // Continue even if image delete fails
                }
            }

            // Delete record from database
            console.log('🗑️ Deleting record from database...');
            const result = await deleteCoatingControl(record.id);
            console.log('✅ Delete result:', result);

            // Force refresh the data since real-time might not trigger immediately
            console.log('🔄 Manually refreshing coating control data...');
            const refreshedData = await getCoatingControls(rtgId);
            console.log('✅ Refreshed data:', refreshedData);

            // Update the context manually
            const mapped = (refreshedData || []).map(c => ({
                ...c,
                rtgId: c.rtg_id,
                zoneId: c.zone_id,
                averageDFT: c.average_dft,
                layerName: c.layer_name,
                dftReadings: c.dft_readings,
                surfaceTemp: c.surface_temp
            }));
            setCoatingControlData(mapped);

            alert('Contrôle supprimé avec succès');
        } catch (err) {
            console.error('❌ Delete failed:', err);
            alert(`Erreur lors de la suppression: ${err.message || 'Erreur inconnue'}`);
        }
    };

    const handleRecordingImageAdd = async (imageData) => {
        try {
            const { uploadImage } = await import('../../services/supabaseStorage');
            const result = await uploadImage(imageData.file, `coating/${rtgId}/${selectedZone}_${Date.now()}`);
            setReadings(prev => ({
                ...prev,
                images: [...(prev.images || []), result.url]
            }));
        } catch (err) {
            console.error("Upload failed:", err);
            alert(`Erreur upload: ${err.message || 'Erreur inconnue'}`);
        }
    };

    const handleRecordingImageRemove = async (index) => {
        const imageToDelete = readings.images[index];
        if (!confirm("Supprimer cette photo ?")) return;

        try {
            const { deleteImageByUrl } = await import('../../services/supabaseStorage');
            // Optimistically remove from UI first
            const newImages = readings.images.filter((_, i) => i !== index);
            setReadings(prev => ({ ...prev, images: newImages }));

            await deleteImageByUrl(imageToDelete);
        } catch (err) {
            console.error("Delete failed:", err);
            // Revert on failure? Or just log.
        }
    };

    const handleSave = async () => {
        const zone = zones.find(z => z.id === selectedZone);
        const layer = testLayers.find(l => l.id === selectedLayer);

        if (!zone) {
            alert("Veuillez sélectionner une zone valide.");
            return;
        }

        if (readings.temp > 50 || readings.humidity > 85) {
            if (!confirm("Conditions environnementales hors limites standard (Temp > 50°C ou Humidité > 85%). Voulez-vous continuer ?")) return;
        }

        const dftValues = [
            readings.dft1,
            readings.dft2,
            readings.dft3,
            readings.dft4,
            readings.dft5
        ].filter(v => v !== '').map(Number);

        const average = dftValues.length > 0
            ? (dftValues.reduce((a, b) => a + b, 0) / dftValues.length).toFixed(1)
            : 0;

        const status = average >= layer.target ? 'Pass' : 'Fail';

        const record = {
            rtg_id: rtgId,
            zone_id: zone.id,
            layer_name: layer.name,
            dft_readings: dftValues,
            average_dft: average,
            surface_temp: readings.temp || 0,
            humidity: readings.humidity || 0,
            status,
            images: readings.images || []
        };

        try {
            if (editingRecord) {
                // Update existing record
                const { updateCoatingControl } = await import('../../services/supabaseDb');
                await updateCoatingControl(editingRecord.id, record);
                alert(`Contrôle mis à jour: ${status === 'Pass' ? 'Conforme' : 'Non Conforme'}`);
                setEditingRecord(null);
            } else {
                // Create new record
                const { createCoatingControl } = await import('../../services/supabaseDb');
                await createCoatingControl(record);
                alert(`Contrôle enregistré: ${status === 'Pass' ? 'Conforme' : 'Non Conforme'}`);
            }

            // Reset form
            setReadings({
                dft1: '', dft2: '', dft3: '', dft4: '', dft5: '',
                temp: '', humidity: '', images: []
            });
            setSelectedZone(zones?.[0]?.id || '');
            setSelectedLayer('L1');
        } catch (err) {
            console.error("Save failed details:", err);
            alert(`Erreur lors de l'enregistrement: ${err.message || 'Erreur inconnue'}`);
        }
    };

    const currentLayer = testLayers.find(l => l.id === selectedLayer);

    // Calculate current average for display
    const currentDftValues = [
        readings.dft1,
        readings.dft2,
        readings.dft3,
        readings.dft4,
        readings.dft5
    ].filter(v => v !== '').map(Number);

    const currentAverage = currentDftValues.length > 0
        ? (currentDftValues.reduce((a, b) => a + b, 0) / currentDftValues.length).toFixed(1)
        : 0;

    const delta = currentAverage > 0 ? (currentAverage - currentLayer.target).toFixed(1) : 0;

    // Debug logging
    console.log('🔧 CoatingControlModule render:', {
        rtgId,
        coatingControlData,
        savedRecords: savedRecords.length
    });

    // Error boundary
    if (!rtgId) {
        return (
            <Card title="Contrôle Qualité Revêtement">
                <div className="p-4 text-center text-red-500">
                    Erreur: RTG ID manquant
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Calibration Warning */}
            {isCalibrationOverdue() && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle size={20} />
                        <span className="font-medium">Attention: Étalonnage de l'appareil expiré !</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setIsConfigModalOpen(true)} className="text-red-400 hover:bg-red-500/10">
                        Configurer
                    </Button>
                </div>
            )}

            {/* Editing Mode Banner */}
            {editingRecord && (
                <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500 flex items-center justify-between">
                    <div>
                        <div className="font-medium text-cyan-400">Mode Édition</div>
                        <div className="text-sm text-[var(--text-muted)]">
                            Modification du contrôle: {zones.find(z => z.id === (editingRecord.zone_id || editingRecord.zoneId))?.name} - {editingRecord.layer_name || editingRecord.layerName}
                        </div>
                    </div>
                    <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                        Annuler
                    </Button>
                </div>
            )}

            <Card title="Contrôle Qualité Revêtement">
                <div className="flex justify-end mb-4">
                    <Button variant="ghost" size="sm" onClick={() => setIsConfigModalOpen(true)} title="Configuration Appareil">
                        <Settings size={16} className="mr-2" />
                        Config. Appareil
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Zone Selection */}
                    <div>
                        <h3 className="font-medium mb-3">Zone</h3>
                        <div className="space-y-2">
                            {zones.length === 0 ? (
                                <div className="p-4 text-center text-[var(--text-muted)] bg-[var(--bg-glass)] rounded-lg border border-[var(--border-glass)]">
                                    <p className="mb-2">Aucune zone disponible</p>
                                    <p className="text-xs">Les zones doivent être créées dans la base de données Supabase.</p>
                                </div>
                            ) : (
                                zones.map(zone => (
                                    <button
                                        key={zone.id}
                                        onClick={() => setSelectedZone(zone.id)}
                                        className={`w-full p-3 rounded-lg text-left transition-all ${selectedZone === zone.id
                                            ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                            : 'bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)]'
                                            }`}
                                    >
                                        {zone.name}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Layer Selection */}
                    <div>
                        <h3 className="font-medium mb-3">Couche</h3>
                        <div className="space-y-2">
                            {testLayers.map(layer => (
                                <button
                                    key={layer.id}
                                    onClick={() => setSelectedLayer(layer.id)}
                                    className={`w-full p-3 rounded-lg text-left transition-all ${selectedLayer === layer.id
                                        ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                        : 'bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)]'
                                        }`}
                                >
                                    <div>{layer.name}</div>
                                    <div className="text-sm opacity-75">Cible: {layer.target} µm</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DFT Readings */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium">Mesures DFT (µm)</h3>
                                <Tooltip text="Saisir 5 mesures d'épaisseur de film sec (Dry Film Thickness).">
                                    <Info size={14} className="text-[var(--text-muted)] cursor-help" />
                                </Tooltip>
                            </div>
                            {savedRecords.length > 0 && (
                                <button
                                    onClick={handleCopyPrevious}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                    title="Copier les valeurs du dernier enregistrement"
                                >
                                    <Copy size={12} /> Copier Précédent
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <input
                                    key={i}
                                    type="number"
                                    placeholder={`Mesure ${i}`}
                                    value={readings[`dft${i}`]}
                                    onChange={(e) => setReadings({ ...readings, [`dft${i}`]: e.target.value })}
                                    className="w-full p-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]"
                                />
                            ))}
                        </div>

                        {/* Live Calculation Display */}
                        {currentAverage > 0 && (
                            <div className="mt-3 p-3 rounded bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-[var(--text-muted)]">Moyenne:</span>
                                    <span className="font-bold">{currentAverage} µm</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">Écart / Cible ({currentLayer.target} µm):</span>
                                    <span className={`font-bold ${Number(delta) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {Number(delta) > 0 ? '+' : ''}{delta} µm
                                    </span>
                                </div>
                            </div>
                        )}

                        <h3 className="font-medium mb-3 mt-4">Conditions</h3>
                        <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <label className="text-xs text-[var(--text-muted)]">Température (°C)</label>
                                <Tooltip text="Température de surface.">
                                    <Info size={12} className="text-[var(--text-muted)] cursor-help" />
                                </Tooltip>
                            </div>
                            <input
                                type="number"
                                placeholder="Température (°C)"
                                value={readings.temp}
                                onChange={(e) => setReadings({ ...readings, temp: e.target.value })}
                                className="w-full p-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="text-xs text-[var(--text-muted)]">Humidité (%)</label>
                                <Tooltip text="Humidité relative de l'air.">
                                    <Info size={12} className="text-[var(--text-muted)] cursor-help" />
                                </Tooltip>
                            </div>
                            <input
                                type="number"
                                placeholder="Humidité (%)"
                                value={readings.humidity}
                                onChange={(e) => setReadings({ ...readings, humidity: e.target.value })}
                                className="w-full p-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]"
                            />
                        </div>
                        {(readings.temp > 50 || readings.humidity > 85) && (
                            <div className="flex items-center gap-2 mt-2 p-2 rounded bg-yellow-500/20 text-yellow-200 text-xs border border-yellow-500/30">
                                <AlertTriangle size={14} />
                                <span>Attention: Conditions environnementales hors limites (Temp &gt; 50°C ou Humidité &gt; 85%)</span>
                            </div>
                        )}

                        {/* Image Upload for Coating Control */}
                        <div className="mt-4 border-t border-[var(--border-glass)] pt-4">
                            <CameraImageUpload
                                images={(readings.images || []).map(url => ({ url }))}
                                onImageCapture={handleRecordingImageAdd}
                                onImageRemove={handleRecordingImageRemove}
                                multiple={true}
                                maxImages={10}
                                label="Photos Preuves"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSave} className="flex-1">
                                <Save className="w-4 h-4 mr-2" />
                                {editingRecord ? 'Mettre à jour' : 'Enregistrer'}
                            </Button>
                            {editingRecord && (
                                <Button onClick={handleCancelEdit} variant="secondary" className="flex-1">
                                    Annuler
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Saved Records */}
            {savedRecords.length > 0 && (
                <Card title="Contrôles Enregistrés">
                    <div className="space-y-3">
                        {savedRecords.map(record => (
                            <div key={record.id} className={`p-4 rounded-lg border ${editingRecord?.id === record.id
                                ? 'bg-cyan-500/10 border-cyan-500'
                                : 'bg-[var(--bg-glass)] border-[var(--border-glass)]'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="font-medium">
                                            {zones.find(z => z.id === (record.zone_id || record.zoneId))?.name || 'Zone Inconnue'} - {record.layer_name || record.layerName}
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)]">
                                            {new Date(record.created_at).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${record.status === 'Pass'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {record.status === 'Pass' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            {record.status === 'Pass' ? 'Conforme' : 'Non Conforme'}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                    <div>
                                        <span className="text-[var(--text-muted)]">Moyenne: </span>
                                        <span className="font-medium">{record.average_dft || record.averageDFT} µm</span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)]">Temp: </span>
                                        <span className="font-medium">{record.surface_temp || record.surfaceTemp}°C</span>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)]">Humidité: </span>
                                        <span className="font-medium">{record.humidity}%</span>
                                    </div>
                                </div>
                                <div className="text-sm mb-3">
                                    <span className="text-[var(--text-muted)]">Mesures: </span>
                                    <span className="font-medium">{(record.dft_readings || record.dftReadings || []).join(', ')} µm</span>
                                </div>

                                {/* Images */}
                                {record.images && record.images.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-sm text-[var(--text-muted)] mb-2">Photos ({record.images.length}):</div>
                                        <div className="flex flex-wrap gap-2">
                                            {record.images.map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    alt={`Photo ${idx + 1}`}
                                                    className="w-16 h-16 object-cover rounded border border-[var(--border-glass)] cursor-pointer hover:scale-110 transition-transform"
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-glass)]">
                                    {record.validated_at ? (
                                        <div className="p-2 bg-[var(--success)]/10 border border-[var(--success)] rounded flex items-center justify-center gap-2 text-[var(--success)] mb-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-xs font-bold">Validé le {new Date(record.validated_at).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    const { updateCoatingControl } = await import('../../services/supabaseDb');
                                                    const validationTimestamp = new Date().toISOString();

                                                    await updateCoatingControl(record.id, {
                                                        validated_at: validationTimestamp
                                                    });

                                                    // Update Context
                                                    const updatedData = coatingControlData.map(c =>
                                                        c.id === record.id ? { ...c, validated_at: validationTimestamp } : c
                                                    );
                                                    setCoatingControlData(updatedData);

                                                    alert('Contrôle validé avec succès!');
                                                } catch (err) {
                                                    console.error('Validation failed:', err);
                                                    alert(`Erreur validation: ${err.message}`);
                                                }
                                            }}
                                            variant="success"
                                            size="sm"
                                            className="w-full mb-2"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Valider ce Contrôle
                                        </Button>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleEdit(record)}
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1"
                                            disabled={editingRecord?.id === record.id || !!record.validated_at}
                                        >
                                            {editingRecord?.id === record.id ? 'En cours...' : 'Modifier'}
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(record)}
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 text-red-500 hover:bg-red-500/10"
                                            disabled={!!record.validated_at}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Device Config Modal */}
            <Modal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title="Configuration Appareil">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-1">Date du dernier étalonnage</label>
                        <input
                            type="date"
                            value={calibrationDate}
                            onChange={(e) => setCalibrationDate(e.target.value)}
                            className="w-full bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)]"
                        />
                    </div>
                    <div className="p-3 rounded bg-[var(--bg-glass)] text-sm text-[var(--text-muted)]">
                        <p>Rappel: L'étalonnage doit être effectué tous les 12 mois.</p>
                    </div>
                    <Button onClick={() => setIsConfigModalOpen(false)} className="w-full">
                        Enregistrer
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default CoatingControlModule;
