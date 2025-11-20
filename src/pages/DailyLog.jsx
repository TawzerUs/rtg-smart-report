import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Camera, AlertTriangle, Trash2, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';

const DailyLog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { zones, tasks, users, addDailyLog } = useApp();

    const [formData, setFormData] = useState({
        rtgId: parseInt(id),
        date: new Date().toISOString().split('T')[0],
        teamLeader: '',
        teamSize: 4,
        zone: '',
        workDescription: '',
        tasksCompleted: 0,
        tasksTotal: 0,
        hoursWorked: 0,
        efficiency: 0,
        tasks: [],
        materials: [],
        safetyChecks: {
            ppeWorn: true,
            areaBarricaded: true,
            fireExtinguisher: true
        },
        wasteType: 'None',
        wasteQuantity: 0,
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addDailyLog(formData);
        alert('Daily log saved successfully!');
        navigate(`/rtg/${id}`);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Daily Work Log</h1>
                    <p className="text-[var(--text-muted)]">Report for RTG {id} - {new Date().toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Team Section */}
                <Card title="Team Composition" icon={Users}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Team Leader</label>
                            <select
                                value={formData.teamLeader}
                                onChange={(e) => setFormData({ ...formData, teamLeader: parseInt(e.target.value) })}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            >
                                <option value="">Select Team Leader...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Technicians Count</label>
                            <input
                                type="number"
                                value={formData.teamSize}
                                onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) })}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            />
                        </div>
                    </div>
                </Card>

                {/* Work Performed */}
                <Card title="Work Performed">
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Zone / Area</label>
                            <select
                                value={formData.zone}
                                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                            >
                                <option value="">Select Zone...</option>
                                {zones.map(zone => (
                                    <option key={zone.id} value={zone.name}>{zone.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Description of Tasks</label>
                            <textarea
                                rows="3"
                                value={formData.workDescription}
                                onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                                className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                placeholder="Detailed description of work done..."
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Tasks Completed</label>
                                <input
                                    type="number"
                                    value={formData.tasksCompleted}
                                    onChange={(e) => setFormData({ ...formData, tasksCompleted: parseInt(e.target.value) })}
                                    className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Total Tasks</label>
                                <input
                                    type="number"
                                    value={formData.tasksTotal}
                                    onChange={(e) => setFormData({ ...formData, tasksTotal: parseInt(e.target.value) })}
                                    className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Hours Worked</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.hoursWorked}
                                    onChange={(e) => setFormData({ ...formData, hoursWorked: parseFloat(e.target.value) })}
                                    className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Efficiency %</label>
                                <input
                                    type="number"
                                    value={formData.efficiency}
                                    onChange={(e) => setFormData({ ...formData, efficiency: parseInt(e.target.value) })}
                                    className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Safety & Waste */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Safety Check">
                        <div className="space-y-2">
                            {[
                                { key: 'ppeWorn', label: 'PPE Worn' },
                                { key: 'areaBarricaded', label: 'Area Barricaded' },
                                { key: 'fireExtinguisher', label: 'Fire Extinguisher Present' }
                            ].map((check) => (
                                <label key={check.key} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--bg-glass)] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.safetyChecks[check.key]}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            safetyChecks: { ...formData.safetyChecks, [check.key]: e.target.checked }
                                        })}
                                        className="w-5 h-5 accent-[var(--primary)]"
                                    />
                                    <span className="text-[var(--text-main)]">{check.label}</span>
                                </label>
                            ))}
                        </div>
                    </Card>

                    <Card title="Waste Management">
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Waste Type</label>
                                <select
                                    value={formData.wasteType}
                                    onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
                                    className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                >
                                    <option>None</option>
                                    <option>Abrasive Dust</option>
                                    <option>Paint Cans</option>
                                    <option>Solvents</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-[var(--text-muted)]">Quantity (kg/L)</label>
                                <input
                                    type="number"
                                    value={formData.wasteQuantity}
                                    onChange={(e) => setFormData({ ...formData, wasteQuantity: parseFloat(e.target.value) })}
                                    className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Notes */}
                <Card title="Additional Notes">
                    <textarea
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"
                        placeholder="Any additional observations, issues, or comments..."
                    />
                </Card>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                    <Button variant="primary" size="lg" icon={Save} type="submit">
                        Submit Daily Log
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DailyLog;
