import React from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../Modal';
import Button from '../Button';

const EntityModal = ({ isOpen, onClose, title, fields, initialData, onSubmit }) => {
    const { resources } = useApp();
    const [formData, setFormData] = React.useState(initialData || {});

    React.useEffect(() => {
        setFormData(initialData || {});
    }, [initialData, isOpen]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((field) => (
                    <div key={field.key}>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">
                            {field.label} {field.required && <span className="text-[var(--danger)]">*</span>}
                        </label>
                        {field.type === 'select' ? (
                            <select
                                value={formData[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                required={field.required}
                            >
                                <option value="">Select...</option>
                                {field.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : field.type === 'textarea' ? (
                            <textarea
                                value={formData[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                rows="3"
                                required={field.required}
                            />
                        ) : field.type === 'multiselect' ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)]">
                                {(field.key === 'resources' ? resources : field.options || []).map(opt => (
                                    <label key={opt.id || opt} className="flex items-center gap-2 p-2 rounded hover:bg-[var(--bg-glass)] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(formData[field.key] || []).includes(opt.id || opt)}
                                            onChange={(e) => {
                                                const current = formData[field.key] || [];
                                                const value = opt.id || opt;
                                                handleChange(
                                                    field.key,
                                                    e.target.checked
                                                        ? [...current, value]
                                                        : current.filter(v => v !== value)
                                                );
                                            }}
                                            className="w-4 h-4 accent-[var(--primary)]"
                                        />
                                        <span className="text-[var(--text-main)] text-sm">{opt.name || opt}</span>
                                    </label>
                                ))}
                            </div>
                        ) : field.type === 'checkpoints' ? (
                            <div className="space-y-2">
                                {(formData[field.key] || []).map((checkpoint, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={checkpoint}
                                            onChange={(e) => {
                                                const newCheckpoints = [...(formData[field.key] || [])];
                                                newCheckpoints[index] = e.target.value;
                                                handleChange(field.key, newCheckpoints);
                                            }}
                                            className="flex-1 p-2 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                            placeholder={`Checkpoint ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newCheckpoints = (formData[field.key] || []).filter((_, i) => i !== index);
                                                handleChange(field.key, newCheckpoints);
                                            }}
                                            className="px-3 py-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleChange(field.key, [...(formData[field.key] || []), ''])}
                                    className="w-full p-2 text-sm text-[var(--primary)] border border-[var(--primary)]/30 rounded-lg hover:bg-[var(--primary)]/10 transition-colors"
                                >
                                    + Add Checkpoint
                                </button>
                            </div>
                        ) : (
                            <input
                                type={field.type || 'text'}
                                value={formData[field.key] || ''}
                                onChange={(e) => handleChange(field.key, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                step={field.step}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                required={field.required}
                            />
                        )}
                    </div>
                ))}
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={(e) => { e.preventDefault(); onClose(); }}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EntityModal;
