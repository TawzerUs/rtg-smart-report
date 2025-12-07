import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import Card from '../Card';
import Button from '../Button';
import StatusBadge from '../StatusBadge';
import CameraImageUpload from '../CameraImageUpload';
import { Camera, CheckCircle, Upload, AlertCircle } from 'lucide-react';

const LavageModule = ({ rtgId }) => {
    const { workOrders, setWorkOrders } = useProject();

    // Find the Lavage task for this RTG
    const task = workOrders.find(wo => wo.rtgId === rtgId && wo.title === 'Lavage Industriel');

    // Local state for photos (initialized from task)
    const [photosBefore, setPhotosBefore] = useState(task?.photos?.before || []);
    const [photosAfter, setPhotosAfter] = useState(task?.photos?.after || []);

    // Sync photos with task updates (when task changes or page reloads)
    useEffect(() => {
        if (task?.photos) {
            setPhotosBefore(task.photos.before || []);
            setPhotosAfter(task.photos.after || []);
        }
    }, [task?.photos]);

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

    const handleBeforeImageAdd = async (imageData) => {
        try {
            const { uploadImage } = await import('../../services/supabaseStorage');
            const { updateWorkOrder } = await import('../../services/supabaseDb');

            const result = await uploadImage(imageData.file, `lavage/${rtgId}/before_${Date.now()}`);
            const newPhotos = [...photosBefore, result.url];
            setPhotosBefore(newPhotos);

            const currentPhotos = task.photos || { before: [], after: [] };
            await updateWorkOrder(task.id, {
                photos: { ...currentPhotos, before: newPhotos }
            });

            setWorkOrders(prev => prev.map(wo => wo.id === task.id ? { ...wo, photos: { ...currentPhotos, before: newPhotos } } : wo));
        } catch (err) {
            console.error("Upload failed:", err);
            alert(`Erreur upload: ${err.message || 'Erreur inconnue'}`);
        }
    };

    const handleBeforeImageRemove = async (index) => {
        const newPhotos = photosBefore.filter((_, idx) => idx !== index);
        setPhotosBefore(newPhotos);

        try {
            const { updateWorkOrder } = await import('../../services/supabaseDb');
            const currentPhotos = task.photos || { before: [], after: [] };
            await updateWorkOrder(task.id, {
                photos: { ...currentPhotos, before: newPhotos }
            });
            setWorkOrders(prev => prev.map(wo => wo.id === task.id ? { ...wo, photos: { ...currentPhotos, before: newPhotos } } : wo));
        } catch (err) {
            console.error("Remove failed:", err);
        }
    };

    const handleAfterImageAdd = async (imageData) => {
        try {
            const { uploadImage } = await import('../../services/supabaseStorage');
            const { updateWorkOrder } = await import('../../services/supabaseDb');

            const result = await uploadImage(imageData.file, `lavage/${rtgId}/after_${Date.now()}`);
            const newPhotos = [...photosAfter, result.url];
            setPhotosAfter(newPhotos);

            const currentPhotos = task.photos || { before: [], after: [] };
            await updateWorkOrder(task.id, {
                photos: { ...currentPhotos, after: newPhotos }
            });

            setWorkOrders(prev => prev.map(wo => wo.id === task.id ? { ...wo, photos: { ...currentPhotos, after: newPhotos } } : wo));
        } catch (err) {
            console.error("Upload failed:", err);
            alert(`Erreur upload: ${err.message || 'Erreur inconnue'}`);
        }
    };

    const handleAfterImageRemove = async (index) => {
        const newPhotos = photosAfter.filter((_, idx) => idx !== index);
        setPhotosAfter(newPhotos);

        try {
            const { updateWorkOrder } = await import('../../services/supabaseDb');
            const currentPhotos = task.photos || { before: [], after: [] };
            await updateWorkOrder(task.id, {
                photos: { ...currentPhotos, after: newPhotos }
            });
            setWorkOrders(prev => prev.map(wo => wo.id === task.id ? { ...wo, photos: { ...currentPhotos, after: newPhotos } } : wo));
        } catch (err) {
            console.error("Remove failed:", err);
        }
    };

    const allChecked = Object.values(checklist).every(Boolean);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Photos */}
            <div className="lg:col-span-2 space-y-6">
                <Card title="Photos Avant Lavage">
                    <CameraImageUpload
                        images={photosBefore.map(url => ({ url }))}
                        onImageCapture={handleBeforeImageAdd}
                        onImageRemove={handleBeforeImageRemove}
                        multiple={true}
                        maxImages={10}
                        label="Capturer Photo Avant"
                    />
                </Card>

                <Card title="Photos Après Lavage">
                    <CameraImageUpload
                        images={photosAfter.map(url => ({ url }))}
                        onImageCapture={handleAfterImageAdd}
                        onImageRemove={handleAfterImageRemove}
                        multiple={true}
                        maxImages={10}
                        label="Capturer Photo Après"
                    />
                </Card>
            </div>

            {/* Right Column: Controls */}
            <div className="space-y-6">
                <Card title="Statut & Validation">
                    <div className="flex flex-col items-center py-4">
                        <StatusBadge status={task.status} />

                        {task.validated_at && (
                            <div className="mt-4 p-3 bg-[var(--success)]/10 border border-[var(--success)] rounded-lg w-full">
                                <div className="flex items-center gap-2 text-[var(--success)] mb-1">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm font-bold">Validé</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {new Date(task.validated_at).toLocaleString('fr-FR')}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 w-full space-y-3">
                            {task.status === 'Pending' && (
                                <Button variant="primary" className="w-full" onClick={() => handleStatusUpdate('In Progress')}>
                                    Démarrer Lavage
                                </Button>
                            )}
                            {task.status === 'In Progress' && !task.validated_at && (
                                <Button
                                    variant="success"
                                    className="w-full"
                                    disabled={!allChecked || photosBefore.length === 0 || photosAfter.length === 0}
                                    onClick={async () => {
                                        try {
                                            const { updateWorkOrder } = await import('../../services/supabaseDb');

                                            const validationData = {
                                                status: 'Completed',
                                                validated_at: new Date().toISOString(),
                                                photos: {
                                                    before: photosBefore,
                                                    after: photosAfter
                                                },
                                                checklist: checklist
                                            };

                                            await updateWorkOrder(task.id, validationData);

                                            // Update Context
                                            setWorkOrders(prev => prev.map(wo =>
                                                wo.id === task.id ? { ...wo, ...validationData } : wo
                                            ));

                                            alert('Lavage validé avec succès!');
                                        } catch (err) {
                                            console.error('Validation failed:', err);
                                            alert(`Erreur lors de la validation: ${err.message || 'Erreur inconnue'}`);
                                        }
                                    }}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Valider Lavage
                                </Button>
                            )}
                            {!allChecked && task.status === 'In Progress' && (
                                <p className="text-xs text-[var(--warning)] text-center flex items-center gap-1 justify-center">
                                    <AlertCircle className="w-3 h-3" />
                                    Complétez la checklist pour valider
                                </p>
                            )}
                            {(photosBefore.length === 0 || photosAfter.length === 0) && task.status === 'In Progress' && (
                                <p className="text-xs text-[var(--warning)] text-center flex items-center gap-1 justify-center">
                                    <AlertCircle className="w-3 h-3" />
                                    Ajoutez des photos avant et après
                                </p>
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
