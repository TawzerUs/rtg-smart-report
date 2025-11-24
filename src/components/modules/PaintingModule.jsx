import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import Card from '../Card';
import Button from '../Button';
import StatusBadge from '../StatusBadge';
import { CloudRain, Thermometer, CheckCircle, Camera } from 'lucide-react';

const PaintingModule = ({ rtgId }) => {
    const { paintingData, setPaintingData, workOrders, zones } = useProject();

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

    const handleFileChange = (e, zoneId, layerId) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => addLayerPhoto(zoneId, layerId, reader.result);
            reader.readAsDataURL(file);
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
                                className="w-full bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
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
                                className="w-full bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-2 text-[var(--text-main)] focus:border-[var(--primary)] outline-none"
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
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            {photos.map((photo, idx) => (
                                                <div key={idx} className="aspect-square bg-[var(--bg-glass)] rounded overflow-hidden">
                                                    <img src={photo} alt={`${layer.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {photos.length < 3 && (
                                                <label className="aspect-square rounded border-2 border-dashed border-[var(--border-glass)] flex flex-col items-center justify-center hover:border-[var(--primary)] transition-colors cursor-pointer">
                                                    <Camera className="w-5 h-5 text-[var(--text-muted)]" />
                                                    <span className="text-xs text-[var(--text-muted)] mt-1">Photo</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(e, selectedZone, layer.id)}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <Button
                                                variant={layer.status === 'Completed' ? 'success' : 'primary'}
                                                size="sm"
                                                disabled={layer.status === 'Completed'}
                                                onClick={() => handleValidateLayer(system.id, layer.id)}
                                                icon={layer.status === 'Completed' ? CheckCircle : undefined}
                                            >
                                                {layer.status === 'Completed' ? 'Couche Validée' : 'Valider Couche'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default PaintingModule;
