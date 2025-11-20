import React, { useState } from 'react';
import { Plus, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import SmartSelect from '../components/SmartSelect';

const OTManagement = () => {
    const { rtgs, tasks, users, workOrders, addWorkOrder, updateWorkOrder } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        rtgId: '',
        taskId: '',
        title: '',
        description: '',
        assignedTo: '',
        deadline: '',
        priority: 'Medium',
        status: 'Pending'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addWorkOrder(formData);
        setIsModalOpen(false);
        setFormData({
            rtgId: '',
            taskId: '',
            title: '',
            description: '',
            assignedTo: '',
            deadline: '',
            priority: 'Medium',
            status: 'Pending'
        });
    };

    const handleStatusChange = (id, newStatus) => {
        updateWorkOrder(id, { status: newStatus });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Tasks & OTs</h1>
                    <p className="text-[var(--text-muted)]">Manage Work Orders and Assignments</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
                    New OT
                </Button>
            </div>

            {/* OT List */}
            {workOrders.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-[var(--text-muted)] mb-4">No work orders created yet.</p>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        Create First Work Order
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {workOrders.map((ot) => {
                        const rtg = rtgs.find(r => r.id === ot.rtgId);
                        const user = users.find(u => u.id === ot.assignedTo);

                        return (
                            <Card key={ot.id} className="group hover:border-[var(--primary)] transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${ot.status === 'Completed' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--primary)]/10 text-[var(--primary)]'}`}>
                                            {ot.status === 'Completed' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-bold text-[var(--text-main)]">OT-{ot.id}</h3>
                                                <span className="text-sm text-[var(--text-muted)]">• {rtg?.name || 'Unknown RTG'}</span>
                                                {ot.priority === 'High' && <span className="text-xs bg-[var(--danger)] text-white px-2 py-0.5 rounded-full">High Priority</span>}
                                            </div>
                                            <p className="text-[var(--text-main)] font-medium">{ot.title}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-muted)] flex-wrap">
                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Due: {ot.deadline || 'Not set'}</span>
                                                <span>Assigned to: {user?.name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 self-end md:self-center">
                                        <StatusBadge status={ot.status} />
                                        {ot.status !== 'Completed' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusChange(ot.id, ot.status === 'Pending' ? 'In Progress' : 'Completed')}
                                            >
                                                {ot.status === 'Pending' ? 'Start' : 'Complete'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create OT Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Work Order">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">RTG Unit *</label>
                        <SmartSelect
                            value={formData.rtgId}
                            onChange={(value) => setFormData({ ...formData, rtgId: parseInt(value) })}
                            options={rtgs.map(r => ({ value: r.id, label: r.name }))}
                            placeholder="Select RTG..."
                            addNewLabel="Add New RTG"
                            addNewRoute="/admin"
                            addNewTab="fleet"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Task Type</label>
                        <SmartSelect
                            value={formData.taskId}
                            onChange={(value) => setFormData({ ...formData, taskId: parseInt(value) })}
                            options={tasks.map(t => ({ value: t.id, label: `${t.wbs} - ${t.name}` }))}
                            placeholder="Select Task..."
                            addNewLabel="Add New Task"
                            addNewRoute="/admin"
                            addNewTab="workflow"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Assign To</label>
                        <select
                            value={formData.assignedTo}
                            onChange={(e) => setFormData({ ...formData, assignedTo: parseInt(e.target.value) })}
                            className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                        >
                            <option value="">Select User...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={(e) => { e.preventDefault(); setIsModalOpen(false); }}>Cancel</Button>
                        <Button variant="primary" type="submit">Create Work Order</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OTManagement;
