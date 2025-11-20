import React, { useState } from 'react';
import { Camera, Download, X, Upload, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import SmartSelect from '../components/SmartSelect';

const Photos = () => {
    const { rtgs, tasks, photos, addPhoto, deletePhoto } = useApp();
    const [activeRTG, setActiveRTG] = useState('all');
    const [groupBy, setGroupBy] = useState('task'); // 'task', 'type', 'date'
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadData, setUploadData] = useState({
        rtgId: '',
        taskId: '',
        beforeAfter: '',
        description: '',
        file: null,
        filePreview: null
    });

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadData(prev => ({
                    ...prev,
                    file: file,
                    filePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();

        const photoData = {
            rtgId: parseInt(uploadData.rtgId),
            taskId: parseInt(uploadData.taskId),
            beforeAfter: uploadData.beforeAfter,
            description: uploadData.description,
            url: uploadData.filePreview,
            timestamp: new Date().toISOString(),
            uploadedBy: 'Current User'
        };

        addPhoto(photoData);

        setUploadData({
            rtgId: '',
            taskId: '',
            beforeAfter: '',
            description: '',
            file: null,
            filePreview: null
        });
        setIsUploadModalOpen(false);
    };

    // Get photos for active RTG
    const getFilteredPhotos = () => {
        if (activeRTG === 'all') return photos;
        return photos.filter(p => p.rtgId === parseInt(activeRTG));
    };

    // Group photos based on selected grouping
    const getGroupedPhotos = () => {
        const filtered = getFilteredPhotos();
        const groups = {};

        filtered.forEach(photo => {
            let groupKey;
            let groupLabel;

            if (groupBy === 'task') {
                const task = tasks.find(t => t.id === photo.taskId);
                groupKey = photo.taskId;
                groupLabel = task ? `${task.wbs} - ${task.name}` : 'Unknown Task';
            } else if (groupBy === 'type') {
                groupKey = photo.beforeAfter;
                groupLabel = photo.beforeAfter || 'Unknown Type';
            } else if (groupBy === 'date') {
                const date = new Date(photo.timestamp);
                groupKey = date.toLocaleDateString();
                groupLabel = date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    label: groupLabel,
                    photos: []
                };
            }
            groups[groupKey].photos.push(photo);
        });

        return groups;
    };

    const getRTGName = (rtgId) => {
        const rtg = rtgs.find(r => r.id === rtgId);
        return rtg ? rtg.name : 'Unknown';
    };

    const getTaskName = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        return task ? `${task.wbs} - ${task.name}` : 'Unknown';
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const groupedPhotos = getGroupedPhotos();
    const photoCount = getFilteredPhotos().length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Photo Gallery</h1>
                    <p className="text-[var(--text-muted)]">
                        Visual documentation of operations · {photoCount} photo{photoCount !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button icon={Camera} variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                    Upload New
                </Button>
            </div>

            {/* RTG Tabs */}
            <div className="border-b border-[var(--border-glass)]">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveRTG('all')}
                        className={`px-4 py-2 rounded-t-lg font-medium transition-all whitespace-nowrap ${activeRTG === 'all'
                            ? 'bg-[var(--bg-glass)] text-[var(--primary)] border-b-2 border-[var(--primary)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-glass)]/50'
                            }`}
                    >
                        All RTGs ({photos.length})
                    </button>
                    {rtgs.map(rtg => {
                        const rtgPhotoCount = photos.filter(p => p.rtgId === rtg.id).length;
                        return (
                            <button
                                key={rtg.id}
                                onClick={() => setActiveRTG(rtg.id.toString())}
                                className={`px-4 py-2 rounded-t-lg font-medium transition-all whitespace-nowrap ${activeRTG === rtg.id.toString()
                                    ? 'bg-[var(--bg-glass)] text-[var(--primary)] border-b-2 border-[var(--primary)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-glass)]/50'
                                    }`}
                            >
                                {rtg.name} ({rtgPhotoCount})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Group By Controls */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                <span className="text-sm font-medium text-[var(--text-muted)]">Group by:</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setGroupBy('task')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${groupBy === 'task'
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--bg-dark)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                    >
                        <Tag className="w-4 h-4 inline mr-1" />
                        Task
                    </button>
                    <button
                        onClick={() => setGroupBy('type')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${groupBy === 'type'
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--bg-dark)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                    >
                        <ImageIcon className="w-4 h-4 inline mr-1" />
                        Type
                    </button>
                    <button
                        onClick={() => setGroupBy('date')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${groupBy === 'date'
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--bg-dark)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                    >
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date
                    </button>
                </div>
            </div>

            {/* Photo Groups */}
            {photoCount === 0 ? (
                <Card className="text-center py-12">
                    <Camera className="w-16 h-16 mx-auto text-[var(--text-muted)] opacity-50 mb-4" />
                    <p className="text-[var(--text-muted)] mb-4">
                        {activeRTG === 'all'
                            ? 'No photos uploaded yet.'
                            : `No photos for ${getRTGName(parseInt(activeRTG))} yet.`}
                    </p>
                    <Button variant="primary" icon={Camera} onClick={() => setIsUploadModalOpen(true)}>
                        Upload First Photo
                    </Button>
                </Card>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedPhotos).map(([groupKey, group]) => (
                        <div key={groupKey}>
                            <h2 className="text-xl font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] rounded-full"></span>
                                {group.label}
                                <span className="text-sm font-normal text-[var(--text-muted)]">
                                    ({group.photos.length} photo{group.photos.length !== 1 ? 's' : ''})
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {group.photos.map((photo) => (
                                    <Card key={photo.id} className="group cursor-pointer hover:border-[var(--primary)] transition-colors p-0 overflow-hidden">
                                        <div className="aspect-square bg-[var(--bg-dark)] relative flex items-center justify-center">
                                            {photo.url ? (
                                                <img src={photo.url} alt={photo.description} className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-12 h-12 text-[var(--text-muted)] opacity-50" />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button variant="glass" size="sm" icon={Download}>Save</Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('Delete this photo?')) {
                                                            deletePhoto(photo.id);
                                                        }
                                                    }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            {activeRTG === 'all' && (
                                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                                    {getRTGName(photo.rtgId)}
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-[var(--primary)]/80 px-2 py-1 rounded text-xs text-white font-medium">
                                                {photo.beforeAfter}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-medium text-[var(--text-main)] truncate mb-1">{photo.description}</h4>
                                            {groupBy !== 'task' && (
                                                <p className="text-xs text-[var(--text-muted)] truncate mb-2">{getTaskName(photo.taskId)}</p>
                                            )}
                                            <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatTimestamp(photo.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                title="Upload Photo"
            >
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">
                            Select Photo <span className="text-[var(--danger)]">*</span>
                        </label>
                        <div className="border-2 border-dashed border-[var(--border-glass)] rounded-lg p-6 text-center hover:border-[var(--primary)] transition-colors">
                            {uploadData.filePreview ? (
                                <div className="relative">
                                    <img src={uploadData.filePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                                    <button
                                        type="button"
                                        onClick={() => setUploadData(prev => ({ ...prev, file: null, filePreview: null }))}
                                        className="absolute top-2 right-2 bg-[var(--danger)] text-white p-1 rounded-full hover:bg-[var(--danger)]/80"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-2" />
                                    <p className="text-[var(--text-muted)] mb-2">Click to upload or drag and drop</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="photo-upload"
                                        required
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="inline-block px-4 py-2 bg-[var(--primary)] text-white rounded-lg cursor-pointer hover:bg-[var(--primary)]/80"
                                    >
                                        Choose File
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">
                            RTG Asset <span className="text-[var(--danger)]">*</span>
                        </label>
                        <SmartSelect
                            value={uploadData.rtgId}
                            onChange={(value) => setUploadData(prev => ({ ...prev, rtgId: parseInt(value) || value }))}
                            options={rtgs.map(r => ({ value: r.id, label: r.name }))}
                            placeholder="Select RTG..."
                            addNewLabel="Add New RTG"
                            addNewRoute="/admin"
                            addNewTab="fleet"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">
                            Related Task <span className="text-[var(--danger)]">*</span>
                        </label>
                        <SmartSelect
                            value={uploadData.taskId}
                            onChange={(value) => setUploadData(prev => ({ ...prev, taskId: parseInt(value) || value }))}
                            options={tasks.map(t => ({ value: t.id, label: `${t.wbs} - ${t.name}` }))}
                            placeholder="Select Task..."
                            addNewLabel="Add New Task"
                            addNewRoute="/admin"
                            addNewTab="workflow"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">
                            Photo Type <span className="text-[var(--danger)]">*</span>
                        </label>
                        <select
                            value={uploadData.beforeAfter}
                            onChange={(e) => setUploadData(prev => ({ ...prev, beforeAfter: e.target.value }))}
                            className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            required
                        >
                            <option value="">Select Type...</option>
                            <option value="Before">Before</option>
                            <option value="After">After</option>
                            <option value="During">During</option>
                            <option value="Reference">Reference</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">
                            Description <span className="text-[var(--danger)]">*</span>
                        </label>
                        <textarea
                            value={uploadData.description}
                            onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            rows="3"
                            placeholder="Describe what this photo shows..."
                            required
                        />
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                        <p className="text-xs text-[var(--text-muted)]">
                            📅 Date & time will be automatically stamped when you upload
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" icon={Upload}>
                            Upload Photo
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Photos;
