import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

/**
 * Reusable camera-enabled image upload component
 * Supports both file selection and mobile camera capture
 */
const CameraImageUpload = ({
    onImageCapture,
    onImageRemove,
    images = [],
    multiple = false,
    maxImages = 10,
    label = "Add Photo",
    className = ""
}) => {
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (event) => {
                onImageCapture({
                    file,
                    preview: event.target.result,
                    timestamp: Date.now()
                });
            };
            reader.readAsDataURL(file);

            if (!multiple) break; // Only process first file if not multiple
        }

        // Reset input
        e.target.value = '';
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const canAddMore = multiple ? images.length < maxImages : images.length === 0;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                        <div
                            key={img.timestamp || index}
                            className="relative aspect-square rounded-lg overflow-hidden bg-slate-800/40 border border-slate-700/50 group"
                        >
                            <img
                                src={img.preview || img.url || img}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {onImageRemove && (
                                <button
                                    onClick={() => onImageRemove(index)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    type="button"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <p className="text-xs text-white truncate">
                                    {img.file?.name || `Image ${index + 1}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {canAddMore && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment" // Use rear camera on mobile
                        multiple={multiple}
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={triggerFileInput}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                        <Camera className="w-5 h-5" />
                        <span>{label}</span>
                        <Upload className="w-4 h-4" />
                    </button>

                    {multiple && (
                        <p className="text-xs text-gray-400 mt-2">
                            {images.length} / {maxImages} images uploaded
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CameraImageUpload;
