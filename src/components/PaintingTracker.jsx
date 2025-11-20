import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Droplet, Layers } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import StatusBadge from './StatusBadge';

const PaintingTracker = ({ type = 'exterior' }) => {
    // Mock Data based on CPS
    const layers = type === 'exterior' ? [
        { id: 1, name: 'Primer: GALVOSIL 15700', target: 70, unit: 'µm', status: 'Completed', actual: 72, humidity: 45 },
        { id: 2, name: 'Intermediate: HEMPADUR 45140', target: 150, unit: 'µm', status: 'In Progress', actual: null, humidity: null },
        { id: 3, name: 'Final: HEMPATHANE Topcoat 55210', target: 60, unit: 'µm', status: 'Pending', actual: null, humidity: null },
    ] : [
        { id: 1, name: 'Primer: HEMPADUR 15360', target: 70, unit: 'µm', status: 'Pending', actual: null, humidity: null },
        { id: 2, name: 'Final: HEMPADUR 45150', target: 150, unit: 'µm', status: 'Pending', actual: null, humidity: null },
    ];

    const [expandedLayer, setExpandedLayer] = useState(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Layers className="w-6 h-6 text-[var(--primary)]" />
                    {type === 'exterior' ? 'Exterior System (280 µm)' : 'Interior System (220 µm)'}
                </h3>
                <div className="text-sm text-[var(--text-muted)]">
                    Total Progress: <span className="text-[var(--primary)] font-bold">33%</span>
                </div>
            </div>

            <div className="space-y-4">
                {layers.map((layer, index) => (
                    <Card key={layer.id} className={`transition-all duration-300 ${expandedLayer === layer.id ? 'ring-2 ring-[var(--primary)]' : ''}`}>
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${layer.status === 'Completed' ? 'bg-[var(--success)] text-black' :
                                        layer.status === 'In Progress' ? 'bg-[var(--warning)] text-black' :
                                            'bg-[var(--bg-glass)] text-[var(--text-muted)] border border-[var(--border-glass)]'
                                    }`}>
                                    {layer.status === 'Completed' ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[var(--text-main)]">{layer.name}</h4>
                                    <p className="text-sm text-[var(--text-muted)]">Target: {layer.target} {layer.unit}</p>
                                </div>
                            </div>
                            <StatusBadge status={layer.status} />
                        </div>

                        {/* Expanded Details */}
                        {(expandedLayer === layer.id || layer.status === 'In Progress') && (
                            <div className="mt-6 pt-6 border-t border-[var(--border-glass)] animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Thickness Reading ({layer.unit})</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder={`Target: ${layer.target}`}
                                                defaultValue={layer.actual}
                                                className="flex-1 p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                            />
                                            <div className={`flex items-center justify-center px-3 rounded-lg border ${layer.actual && layer.actual >= layer.target ? 'border-[var(--success)] text-[var(--success)]' : 'border-[var(--border-glass)] text-[var(--text-muted)]'
                                                }`}>
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Humidity (%)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Max 85%"
                                                defaultValue={layer.humidity}
                                                className="flex-1 p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                            />
                                            <div className="flex items-center justify-center px-3 rounded-lg border border-[var(--border-glass)] text-[var(--text-muted)]">
                                                <Droplet className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3">
                                    <Button variant="ghost" size="sm">Upload Photo</Button>
                                    <Button variant="primary" size="sm">Validate Layer</Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default PaintingTracker;
