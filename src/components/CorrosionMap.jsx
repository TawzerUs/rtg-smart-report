import React, { useState, useRef } from 'react';
import { MapPin, X, Save } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const CorrosionMap = ({ imageUrl, onSave }) => {
    const [pins, setPins] = useState([]);
    const [activePin, setActivePin] = useState(null);
    const imageRef = useRef(null);

    const handleImageClick = (e) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newPin = {
            id: Date.now(),
            x,
            y,
            severity: 'Low',
            notes: '',
        };

        setPins([...pins, newPin]);
        setActivePin(newPin.id);
    };

    const updatePin = (id, field, value) => {
        setPins(pins.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const removePin = (id) => {
        setPins(pins.filter(p => p.id !== id));
        if (activePin === id) setActivePin(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card title="Interactive Map (Click to Add Pin)">
                    <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-crosshair group">
                        {/* Placeholder for RTG Image if no URL provided */}
                        {imageUrl ? (
                            <img
                                ref={imageRef}
                                src={imageUrl}
                                alt="RTG Diagram"
                                className="w-full h-full object-contain"
                                onClick={handleImageClick}
                            />
                        ) : (
                            <div
                                ref={imageRef}
                                className="w-full h-full flex items-center justify-center bg-[var(--bg-glass)] border border-[var(--border-glass)]"
                                onClick={handleImageClick}
                            >
                                <p className="text-[var(--text-muted)]">RTG Diagram Placeholder (Click anywhere)</p>
                            </div>
                        )}

                        {pins.map((pin) => (
                            <button
                                key={pin.id}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 ${activePin === pin.id ? 'text-[var(--primary)] z-10 scale-125' : 'text-[var(--danger)]'
                                    }`}
                                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                                onClick={(e) => { e.stopPropagation(); setActivePin(pin.id); }}
                            >
                                <MapPin className="w-6 h-6 drop-shadow-md" fill="currentColor" />
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button icon={Save} onClick={() => onSave(pins)}>Save Mapping</Button>
                    </div>
                </Card>
            </div>

            <div>
                <Card title="Corrosion Details">
                    {activePin ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-[var(--text-main)]">Point #{activePin}</h3>
                                <button onClick={() => removePin(activePin)} className="text-[var(--danger)] hover:text-red-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Severity</label>
                                <select
                                    className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                    value={pins.find(p => p.id === activePin)?.severity}
                                    onChange={(e) => updatePin(activePin, 'severity', e.target.value)}
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                    <option>Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Notes</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                    placeholder="Describe corrosion..."
                                    value={pins.find(p => p.id === activePin)?.notes}
                                    onChange={(e) => updatePin(activePin, 'notes', e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-[var(--text-muted)]">
                            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>Select a pin on the map to view details</p>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-[var(--border-glass)]">
                        <h4 className="text-sm font-medium text-[var(--text-muted)] mb-3">Summary</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-muted)]">Total Points</span>
                                <span className="text-[var(--text-main)]">{pins.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-muted)]">Critical</span>
                                <span className="text-[var(--danger)]">{pins.filter(p => p.severity === 'Critical').length}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CorrosionMap;
