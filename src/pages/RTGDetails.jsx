import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, Image, FileText, Activity, MapPin, Layers, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import CorrosionMap from '../components/CorrosionMap';
import PaintingTracker from '../components/PaintingTracker';
import QHSSEModule from '../components/QHSSEModule';
import Modal from '../components/Modal';

// Sub-components (Placeholders for now)
const RTGOverview = ({ id }) => {
    const { getRTGStats } = useApp();
    const stats = getRTGStats(id);

    // Calculate overall progress (simple average for now)
    // In a real app, this would be weighted
    const overallProgress = Math.round(
        (stats.paintingProgress * 0.4) +
        ((stats.activeWorkOrders === 0 ? 100 : 50) * 0.4) +
        (stats.corrosionPoints === 0 ? 100 : 80) * 0.2
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Current Status">
                    <div className="flex flex-col items-center justify-center py-4">
                        <StatusBadge status={overallProgress === 100 ? 'Completed' : 'In Progress'} />
                        <p className="mt-4 text-4xl font-bold text-[var(--primary)]">{overallProgress}%</p>
                        <p className="text-[var(--text-muted)]">Overall Progress</p>
                    </div>
                </Card>
                <Card title="Next Step">
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--bg-glass)] flex items-center justify-center mb-4 border border-[var(--primary)] shadow-[0_0_15px_var(--primary-glow)]">
                            <Activity className="w-8 h-8 text-[var(--primary)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)]">Maintenance</h3>
                        <p className="text-[var(--text-muted)] text-center mt-2">{stats.activeWorkOrders} Active Tasks</p>
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
                    {/* Real activity would go here, for now we keep the mock or fetch logs */}
                    <div className="flex items-start gap-4 pb-4 border-b border-[var(--border-glass)] last:border-0">
                        <div className="w-2 h-2 mt-2 rounded-full bg-[var(--primary)]"></div>
                        <div>
                            <p className="text-[var(--text-main)]">System updated</p>
                            <p className="text-xs text-[var(--text-muted)]">Just now</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const RTGTasks = ({ id, filter }) => {
    const { workOrders, updateWorkOrder } = useApp();
    const rtgTasks = workOrders.filter(wo => wo.rtgId === id && (!filter || wo.title === filter));

    const handleStatusToggle = (taskId, currentStatus) => {
        const newStatus = currentStatus === 'Pending' ? 'In Progress' : currentStatus === 'In Progress' ? 'Completed' : 'Pending';
        updateWorkOrder(taskId, { status: newStatus });
    };

    return (
        <Card title={filter || "Operational Tasks"}>
            <div className="space-y-4">
                {rtgTasks.length === 0 ? (
                    <p className="text-[var(--text-muted)] text-center py-4">No tasks assigned.</p>
                ) : (
                    rtgTasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] hover:border-[var(--primary)] transition-colors cursor-pointer"
                            onClick={() => handleStatusToggle(task.id, task.status)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${task.status === 'Completed' ? 'bg-[var(--success)] border-[var(--success)]' : 'border-[var(--text-muted)]'}`}>
                                    {task.status === 'Completed' && <span className="text-black font-bold">✓</span>}
                                </div>
                                <span className={task.status === 'Completed' ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'}>{task.title}</span>
                            </div>
                            <StatusBadge status={task.status} />
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

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

const RTGReports = () => {
    const [reports, setReports] = useState([
        { id: 1, name: 'Daily Report - Nov 19', status: 'Pending Validation' },
        { id: 2, name: 'Daily Report - Nov 18', status: 'Validated' },
        { id: 3, name: 'Surface Prep Validation', status: 'Validated' }
    ]);

    const toggleValidation = (id) => {
        setReports(reports.map(r => r.id === id ? { ...r, status: r.status === 'Validated' ? 'Pending Validation' : 'Validated' } : r));
    };

    return (
        <Card title="Generated Reports">
            <div className="space-y-2">
                {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 rounded hover:bg-[var(--bg-glass)] cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[var(--secondary)]" />
                            <div>
                                <span className="text-[var(--text-main)] block">{report.name}</span>
                                <span className={`text-xs ${report.status === 'Validated' ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>{report.status}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleValidation(report.id)}>
                                {report.status === 'Validated' ? 'Invalidate' : 'Validate'}
                            </Button>
                            <Button variant="ghost" size="sm">Download</Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const RTGDetails = () => {
    const { id } = useParams();
    const { addWorkOrder } = useApp();
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    const tabs = [
        { id: 'overview', label: 'Vue Détaillée', icon: Activity },
        { id: 'lavage', label: 'Lavage Industriel', icon: ClipboardList },
        { id: 'corrosion', label: 'Inspection Corrosion', icon: MapPin },
        { id: 'sablage', label: 'Sablage SA 2.5', icon: Layers }, // Using Layers icon for sandblasting too for now
        { id: 'painting', label: 'Peinture PPG', icon: Layers },
        { id: 'qhsse', label: 'Checklist QHSE', icon: Shield },
        { id: 'reports', label: 'Rapports PDF', icon: FileText },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [deadline, setDeadline] = useState('');
    const [scope, setScope] = useState('');
    const [safetyConstraints, setSafetyConstraints] = useState({
        workAtHeight: false,
        confinedSpace: false
    });

    const handleCreateOT = (e) => {
        e.preventDefault();

        const newOT = {
            id: Date.now(), // Simple ID generation
            rtgId: id,
            title: scope.length > 30 ? scope.substring(0, 30) + '...' : scope,
            status: 'Pending',
            priority: 'Normal',
            deadline: deadline,
            description: scope,
            safety: safetyConstraints,
            assignedTo: null // To be assigned
        };

        addWorkOrder(newOT);

        // Reset and close
        setDeadline('');
        setScope('');
        setSafetyConstraints({ workAtHeight: false, confinedSpace: false });
        setIsModalOpen(false);
    };

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
                {activeTab === 'lavage' && <RTGTasks id={id} filter="Lavage Industriel" />}
                {activeTab === 'corrosion' && <CorrosionMap rtgId={id} onSave={(data) => console.log('Saved:', data)} />}
                {activeTab === 'sablage' && <RTGTasks id={id} filter="Sablage SA 2.5" />}
                {activeTab === 'painting' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PaintingTracker rtgId={id} type="exterior" />
                        <PaintingTracker rtgId={id} type="interior" />
                    </div>
                )}
                {activeTab === 'qhsse' && <QHSSEModule rtgId={id} />}
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
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Scope of Work</label>
                        <textarea
                            rows="4"
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            placeholder="Describe the tasks..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Safety Constraints</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-[var(--text-muted)]">
                                <input
                                    type="checkbox"
                                    checked={safetyConstraints.workAtHeight}
                                    onChange={(e) => setSafetyConstraints({ ...safetyConstraints, workAtHeight: e.target.checked })}
                                    className="accent-[var(--primary)]"
                                /> Work at Height
                            </label>
                            <label className="flex items-center gap-2 text-[var(--text-muted)]">
                                <input
                                    type="checkbox"
                                    checked={safetyConstraints.confinedSpace}
                                    onChange={(e) => setSafetyConstraints({ ...safetyConstraints, confinedSpace: e.target.checked })}
                                    className="accent-[var(--primary)]"
                                /> Confined Space
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={(e) => { e.preventDefault(); setIsModalOpen(false); }}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreateOT}>Create OT</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RTGDetails;
