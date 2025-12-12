import React, { useState, useRef } from 'react';
import { Camera, MapPin, X } from 'lucide-react';
import Button from './Button';

const ImageAnnotator = ({ image, onImageUpload, onDeleteImage, points, onAddPoint, onPointClick, readOnly = false }) => {
    const imgRef = useRef(null);

    const handleImageClick = (e) => {
        if (readOnly || !imgRef.current || !image) return;

        const rect = imgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        onAddPoint({ x, y });
    };

    const handleFileChange = (e) => {
        if (readOnly) return;
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageUpload(reader.result, file);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`relative w-full bg-[var(--bg-dark)] rounded-lg overflow-hidden border border-[var(--border-glass)] shadow-inner min-h-[400px] flex items-center justify-center group ${readOnly ? 'cursor-default' : ''}`}>
            {image ? (
                <>
                    <img
                        ref={imgRef}
                        src={image}
                        alt="Inspection Area"
                        className={`w-full h-full object-contain ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
                        onClick={handleImageClick}
                    />

                    {/* Points Overlay */}
                    {points.map((point, index) => (
                        <div
                            key={point.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPointClick(point);
                            }}
                            className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-white cursor-pointer transform ${!readOnly && 'hover:scale-125 transition-transform'} flex items-center justify-center shadow-lg group ${point.severity === 'High' ? 'bg-[var(--danger)]' :
                                point.severity === 'Medium' ? 'bg-[var(--warning)]' :
                                    'bg-[var(--success)]'
                                }`}
                            style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        >
                            <span className="text-white font-bold text-xs">{index + 1}</span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                <div className="bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg p-3 shadow-xl border border-white/20 min-w-[200px]">
                                    <div className="font-bold mb-1">Pin #{index + 1}</div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[var(--text-muted)]">Sévérité:</span>
                                        <span className={`font-bold ${point.severity === 'High' ? 'text-red-400' :
                                            point.severity === 'Medium' ? 'text-orange-400' :
                                                'text-green-400'
                                            }`}>
                                            {point.severity === 'High' ? 'Sévère' : point.severity === 'Medium' ? 'Moyen' : 'Léger'}
                                        </span>
                                    </div>
                                    <div className="text-[var(--text-muted)] mb-1">
                                        {point.notes || 'Sans notes'}
                                    </div>
                                    <div className="text-[10px] text-[var(--text-muted)] mt-2 pt-2 border-t border-white/10">
                                        {point.date}
                                    </div>
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/90"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Image Controls */}
                    {!readOnly && (
                        <div className="absolute top-4 right-4 flex gap-2">
                            <label className="cursor-pointer bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                <span className="text-xs">Changer</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                            {onDeleteImage && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Supprimer cette image ?')) onDeleteImage();
                                    }}
                                    className="bg-red-600/80 hover:bg-red-700/90 text-white p-2 rounded-lg backdrop-blur-sm flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="text-xs">Supprimer</span>
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center p-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-glass)] flex items-center justify-center text-[var(--text-muted)]">
                        <Camera className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-[var(--text-main)] mb-2">Aucune image sélectionnée</h3>
                    {readOnly ? (
                        <p className="text-[var(--text-muted)] text-sm mb-6">En attente de l'image de l'opérateur.</p>
                    ) : (
                        <>
                            <p className="text-[var(--text-muted)] text-sm mb-6">Téléchargez une photo de la zone pour commencer l'annotation.</p>
                            <label className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-medium rounded-lg cursor-pointer transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]">
                                <Camera className="w-5 h-5" />
                                <span>Télécharger Photo</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageAnnotator;
