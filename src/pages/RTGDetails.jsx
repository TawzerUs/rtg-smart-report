import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, Image, FileText, Activity, MapPin, Layers, Shield } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import CorrosionMap from '../components/CorrosionMap';
import PaintingTracker from '../components/PaintingTracker';
import QHSSEModule from '../components/QHSSEModule';
import Modal from '../components/Modal';

// Sub-components (Placeholders for now)
const RTGOverview = ({ id }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Current Status">
                <div className="flex flex-col items-center justify-center py-4">
                    <StatusBadge status="Painting" />
                    <p className="mt-4 text-4xl font-bold text-[var(--primary)]">60%</p>
                    <p className="text-[var(--text-muted)]">Overall Progress</p>
                </div>
            </Card>
            <Card title="Next Step">
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-glass)] flex items-center justify-center mb-4 border border-[var(--primary)] shadow-[0_0_15px_var(--primary-glow)]">
                        <Activity className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-main)]">Layer 2 Application</h3>
                    <p className="text-[var(--text-muted)] text-center mt-2">Scheduled for Tomorrow</p>
                </div>
            </Card>
            <Card title="Active Team">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded bg-[var(--bg-glass)]">
                        <span className="text-[var(--text-main)]">Team Alpha</span>
                        <span className="text-xs text-[var(--success)]">On Site</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-[var(--bg-glass)]">
                        <span className="text-[var(--text-main)]">Supervisor</span>
                        <span className="text-xs text-[var(--text-muted)]">Adil T.</span>
                    </div>
                </div>
            </Card>
        </div>

        <Card title="Recent Activity">
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-[var(--border-glass)] last:border-0">
                        <div className="w-2 h-2 mt-2 rounded-full bg-[var(--primary)]"></div>
                        <div>
                            <p className="text-[var(--text-main)]">Layer 1 thickness validation completed</p>
                            <p className="text-xs text-[var(--text-muted)]">2 hours ago by Quality Supervisor</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    </div>
);

const RTGTasks = () => (
    <Card title="Operational Tasks">
        <div className="space-y-4">
            {['Surface Cleaning', 'Salt Test', 'Primer Application', 'Mid-coat Application'].map((task, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] hover:border-[var(--primary)] transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${i < 2 ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--text-muted)]'}`}>
                            {i < 2 && <span className="text-black font-bold">✓</span>}
                        </div>
                        <span className={i < 2 ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'}>{task}</span>
                    </div>
                    <StatusBadge status={i < 2 ? 'Completed' : i === 2 ? 'In Progress' : 'Pending'} />
                </div>
            ))}
        </div>
    </Card>
);

const RTGPhotos = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] flex items-center justify-center relative group overflow-hidden cursor-pointer">
                <Image className="w-8 h-8 text-[var(--text-muted)]" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm">View</span>
                </div>
            </div>
        ))}
        <div className="aspect-square rounded-lg border-2 border-dashed border-[var(--text-muted)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--text-muted)]">
            <span className="text-2xl">+</span>
            <span className="text-sm">Upload</span>
        </div>
    </div>
);

const RTGReports = () => (
    <Card title="Generated Reports">
        <div className="space-y-2">
            {['Daily Report - Nov 19', 'Daily Report - Nov 18', 'Surface Prep Validation'].map((report, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded hover:bg-[var(--bg-glass)] cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[var(--secondary)]" />
                        <span className="text-[var(--text-main)]">{report}</span>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                </div>
            ))}
        </div>
    </Card>
);

const RTGDetails = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'tasks', label: 'Tasks', icon: ClipboardList },
        { id: 'corrosion', label: 'Corrosion Map', icon: MapPin },
        { id: 'painting', label: 'Painting & Prep', icon: Layers },
        { id: 'qhsse', label: 'QHSSE & Waste', icon: Shield },
        { id: 'photos', label: 'Photos', icon: Image },
        { id: 'reports', label: 'Reports', icon: FileText },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">{id} Operations</h1>
                    <p className="text-[var(--text-muted)]">Manage and track daily operations</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => navigate(`/rtg/${id}/log/new`)}>New Daily Log</Button>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>Create OT</Button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-[var(--border-glass)] overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative whitespace-nowrap ${activeTab === tab.id
                            ? 'text-[var(--primary)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'overview' && <RTGOverview id={id} />}
                {activeTab === 'tasks' && <RTGTasks />}
                {activeTab === 'corrosion' && <CorrosionMap onSave={(data) => console.log('Saved:', data)} />}
                {activeTab === 'painting' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PaintingTracker type="exterior" />
                        <PaintingTracker type="interior" />
                    </div>
                )}
                {activeTab === 'qhsse' && <QHSSEModule />}
                {activeTab === 'photos' && <RTGPhotos />}
                {activeTab === 'reports' && <RTGReports />}
            </div>

            {/* Create OT Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Create OT for ${id}`}>
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">RTG Unit</label>
                            <input type="text" value={id} disabled className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-muted)] cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Deadline</label>
                            <input type="date" className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Scope of Work</label>
                        <textarea rows="4" className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none" placeholder="Describe the tasks..."></textarea>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Safety Constraints</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-[var(--text-muted)]">
                                <input type="checkbox" className="accent-[var(--primary)]" /> Work at Height
                            </label>
                            <label className="flex items-center gap-2 text-[var(--text-muted)]">
                                <input type="checkbox" className="accent-[var(--primary)]" /> Confined Space
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={(e) => { e.preventDefault(); setIsModalOpen(false); }}>Cancel</Button>
                        <Button variant="primary" onClick={(e) => { e.preventDefault(); setIsModalOpen(false); }}>Create OT</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RTGDetails;
