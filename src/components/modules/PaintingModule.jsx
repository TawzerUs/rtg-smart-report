import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import Card from '../Card';
import Button from '../Button';
import StatusBadge from '../StatusBadge';
import CameraImageUpload from '../CameraImageUpload';
import { CloudRain, Thermometer, CheckCircle, Camera, Loader2, AlertCircle } from 'lucide-react';

const PaintingModule = ({ rtgId }) => {
    const { paintingData, setPaintingData, workOrders, zones, loading } = useProject();
    const { isOperator } = useAuth();

    const systems = paintingData.filter(p => p.rtgId === rtgId && p.type === 'exterior'); // Only exterior

    const [selectedZone, setSelectedZone] = useState(zones[0].id);

    // Zone-specific weather conditions
    const [zoneWeather, setZoneWeather] = useState({});

    // Zone and layer specific photos
    const [layerPhotos, setLayerPhotos] = useState({});

    const getZoneWeather = (zoneId) => zoneWeather[zoneId] || { temp: 24, humidity: 45 };

    const updateZoneWeather = (zoneId, field, value) => {
        setZoneWeather(prev => ({
            ...prev,
            [zoneId]: { ...getZoneWeather(zoneId), [field]: value }
        }));
    };

    const getLayerPhotos = (zoneId, layerId) => layerPhotos[`${zoneId}-${layerId}`] || [];

    const addLayerPhoto = (zoneId, layerId, photo) => {
        setLayerPhotos(prev => ({
            ...prev,
            [`${zoneId}-${layerId}`]: [...getLayerPhotos(zoneId, layerId), photo]
        }));
    };

    const handleLayerImageAdd = async (imageData, zoneId, layerId) => {
        try {
            const { uploadImage } = await import('../../services/supabaseStorage');
            const { updatePaintingSystem, createPaintingSystem } = await import('../../services/supabaseDb');

            const system = systems[0];
            if (!system) return;

            let systemId = system.id;
            const isMockId = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(system.id);

            if (isMockId) {
                const { id, rtgId: oldRtgId, ...systemData } = system;
                systemData.rtg_id = rtgId;
                const newSystem = await createPaintingSystem(systemData);
                if (newSystem) {
                    systemId = newSystem.id;
                    setPaintingData(prev => prev.map(s => s.id === system.id ? { ...s, id: systemId } : s));
                } else {
                    throw new Error("Failed to create painting system record");
                }
            }

            const result = await uploadImage(imageData.file, `painting/${rtgId}/${systemId}/${layerId}_${Date.now()}`);
            addLayerPhoto(zoneId, layerId, result.url);

            const updatedLayers = system.layers.map(layer => {
                if (layer.id === layerId) {
                    const currentPhotos = layer.photos || [];
                    return { ...layer, photos: [...currentPhotos, result.url] };
                }
                return layer;
            });

            await updatePaintingSystem(systemId, { layers: updatedLayers });
            setPaintingData(prev => prev.map(s => s.id === systemId || s.id === system.id ? { ...s, id: systemId, layers: updatedLayers } : s));

        } catch (err) {
            console.error("Upload failed:", err);
            alert(`Erreur upload: ${err.message || 'Erreur inconnue'}`);
        }
    };

    const handleLayerImageRemove = async (index, zoneId, layerId) => {
        const currentPhotos = getLayerPhotos(zoneId, layerId);
        const newPhotos = currentPhotos.filter((_, idx) => idx !== index);

        // Update local state is tricky because addLayerPhoto appends. 
        // We need a proper setLayerPhotos helper or verify how state works.
        // Looking at line 33: setLayerPhotos(prev => ({...prev, [`${zoneId}-${layerId}`]: [...prev, photo]}))
        // So we can override it directly.
        setLayerPhotos(prev => ({
            ...prev,
            [`${zoneId}-${layerId}`]: newPhotos
        }));

        const system = systems[0];
        if (!system) return;

        try {
            const { updatePaintingSystem } = await import('../../services/supabaseDb');
            const updatedLayers = system.layers.map(layer => {
                if (layer.id === layerId) {
                    return { ...layer, photos: newPhotos }; // Assuming we sync this correctly
                    // Note: layer.photos in the system object might be different from local layerPhotos derived state
                    // The system.layers.photos is the source of truth for DB.
                    // Actually, line 30: getLayerPhotos returns local state.
                    // The component seems to mix local state and system state.
                    // Let's ensure we update both.
                }
                return layer;
            });

            await updatePaintingSystem(system.id, { layers: updatedLayers });
            setPaintingData(prev => prev.map(s => s.id === system.id ? { ...s, layers: updatedLayers } : s));
        } catch (err) {
            console.error("Remove failed:", err);
        }
    };

    const handleValidateLayer = (systemId, layerId) => {
        const timestamp = new Date().toISOString();
        setPaintingData(prev => prev.map(system => {
            if (system.id === systemId) {
                return {
                    ...system,
                    layers: system.layers.map(layer =>
                        layer.id === layerId ? {
                            ...layer,
                            status: 'Completed',
                            validatedAt: timestamp,
                            validatedZone: selectedZone,
                            weather: getZoneWeather(selectedZone)
                        } : layer
                    )
                };
            }
            return system;
        }));
    };

    const currentWeather = getZoneWeather(selectedZone);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--primary)]" />
                    <p className="text-[var(--text-muted)]">Chargement des données de peinture...</p>
                </div>
            </div>
        );
    }

    // Empty state - no painting systems for this RTG
    if (systems.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[var(--warning)]" />
                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">
                        Aucun système de peinture
                    </h3>
                    <p className="text-[var(--text-muted)] mb-4">
                        Aucun système de peinture extérieur n'a été configuré pour cet équipement.
                    </p>
                    {isOperator && (
                        <p className="text-sm text-[var(--text-dim)]">
                            Contactez un administrateur pour configurer le système de peinture.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone Selector */}
            <div className="space-y-4">
                <Card title="Zone à Peindre">
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
                            </button>
                        ))}
                    </div>
                </Card>

                <Card title="Conditions Climatiques">
                    <p className="text-xs text-[var(--text-muted)] mb-3">Pour {zones.find(z => z.id === selectedZone)?.name}</p>
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
                                <Thermometer className="w-4 h-4" /> Température (°C)
                            </label>
                            <input
                                type="number"
                                value={currentWeather.temp}
                                onChange={(e) => updateZoneWeather(selectedZone, 'temp', e.target.value)}
                                disabled={!isOperator}
                                className={`w-full bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)] focus:border-[var(--primary)] outline-none ${!isOperator ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
                                <CloudRain className="w-4 h-4" /> Humidité (%)
                            </label>
                            <input
                                type="number"
                                value={currentWeather.humidity}
                                onChange={(e) => updateZoneWeather(selectedZone, 'humidity', e.target.value)}
                                disabled={!isOperator}
                                className={`w-full bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)] focus:border-[var(--primary)] outline-none ${!isOperator ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">
                    Système Extérieur: {zones.find(z => z.id === selectedZone)?.name}
                </h2>

                {systems.map((system) => (
                    <Card key={system.id} title="Système Peinture PPG Extérieur (280 µm)">
                        <div className="space-y-6">
                            {system.layers.map((layer) => {
                                const photos = getLayerPhotos(selectedZone, layer.id);
                                return (
                                    <div key={layer.id} className="relative pl-6 border-l-2 border-[var(--border-glass)] last:border-0 pb-6 last:pb-0">
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${layer.status === 'Completed'
                                            ? 'bg-[var(--success)] border-[var(--success)]'
                                            : 'bg-[var(--bg-dark)] border-[var(--text-muted)]'
                                            }`}></div>

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-[var(--text-main)]">{layer.name}</h4>
                                                <p className="text-xs text-[var(--text-muted)]">Épaisseur cible: {layer.target} {layer.unit}</p>
                                                {layer.validatedAt && (
                                                    <p className="text-xs text-[var(--success)] mt-1">
                                                        ✓ Validé le {new Date(layer.validatedAt).toLocaleString('fr-FR')}
                                                    </p>
                                                )}
                                            </div>
                                            <StatusBadge status={layer.status} />
                                        </div>

                                        {/* Photos */}
                                        <div className="mb-3">
                                            <CameraImageUpload
                                                images={photos.map(url => ({ url }))}
                                                onImageCapture={(data) => handleLayerImageAdd(data, selectedZone, layer.id)}
                                                onImageRemove={(idx) => handleLayerImageRemove(idx, selectedZone, layer.id)}
                                                multiple={true}
                                                maxImages={10}
                                                label={`Capturer ${layer.name}`}
                                                readOnly={!isOperator}
                                            />
                                        </div>

                                        {/* Validation Section */}
                                        <div className="mt-4 p-3 bg-[var(--bg-glass)] rounded-lg border border-[var(--border-glass)]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    {layer.status === 'Completed' ? (
                                                        <div>
                                                            <p className="text-sm font-bold text-[var(--success)] flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4" />
                                                                Couche Validée
                                                            </p>
                                                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                                                {new Date(layer.validatedAt).toLocaleString('fr-FR')}
                                                            </p>
                                                            {layer.validatedZone && (
                                                                <p className="text-xs text-[var(--text-muted)]">
                                                                    Zone: {zones.find(z => z.id === layer.validatedZone)?.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p className="text-sm font-medium text-[var(--text-main)]">Validation de la couche</p>
                                                            <p className="text-xs text-[var(--text-muted)]">Cliquez pour valider l'application</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {isOperator && (
                                                    <Button
                                                        variant={layer.status === 'Completed' ? 'success' : 'primary'}
                                                        size="md"
                                                        disabled={layer.status === 'Completed'}
                                                        onClick={() => handleValidateLayer(system.id, layer.id)}
                                                        icon={layer.status === 'Completed' ? CheckCircle : CheckCircle}
                                                    >
                                                        {layer.status === 'Completed' ? 'Validé' : 'Valider'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>
        </div >
    );
};

export default PaintingModule;
