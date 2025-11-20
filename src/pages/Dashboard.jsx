import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import TaskTracker from '../components/TaskTracker';

const Dashboard = () => {
    const navigate = useNavigate();
    const { rtgs, workOrders, qhsseData, getRTGStats } = useApp();

    // Calculate real metrics from actual data
    const activeWorkOrders = workOrders.filter(wo => wo.status !== 'Completed').length;
    const pendingValidation = workOrders.filter(wo => wo.status === 'Pending Review').length;
    const safetyIncidents = qhsseData.filter(q => q.type === 'incident').length;
    const completedRTGs = rtgs.filter(r => r.status === 'Completed').length;

    const metrics = [
        { label: 'Active OTs', value: activeWorkOrders.toString(), icon: Activity, color: 'text-[var(--primary)]' },
        { label: 'Pending Validation', value: pendingValidation.toString(), icon: Clock, color: 'text-[var(--warning)]' },
        { label: 'Safety Incidents', value: safetyIncidents.toString(), icon: AlertTriangle, color: safetyIncidents === 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]' },
        { label: 'Completed RTGs', value: completedRTGs.toString(), icon: CheckCircle, color: 'text-[var(--secondary)]' },
    ];

    // Calculate progress for each RTG based on work orders
    const getRTGProgress = (rtgId) => {
        const rtgWorkOrders = workOrders.filter(wo => wo.rtgId === rtgId);
        if (rtgWorkOrders.length === 0) return 0;

        const completed = rtgWorkOrders.filter(wo => wo.status === 'Completed').length;
        return Math.round((completed / rtgWorkOrders.length) * 100);
    };

    // Get next step for RTG
    const getNextStep = (rtgId) => {
        const activeWO = workOrders.find(wo => wo.rtgId === rtgId && wo.status !== 'Completed');
        return activeWO ? activeWO.title : 'No active tasks';
    };

    // Get last update time
    const getLastUpdate = (rtgId) => {
        const rtgWorkOrders = workOrders.filter(wo => wo.rtgId === rtgId);
        if (rtgWorkOrders.length === 0) return 'No updates';

        // For prototype, return 'Today' - in real app would calculate from timestamps
        return 'Today';
    };

    // Get current task name for RTG
    const getCurrentTask = (rtgId) => {
        const activeWO = workOrders.find(wo => wo.rtgId === rtgId && wo.status === 'In Progress');
        if (!activeWO) return 'No active task';
        const task = tasks.find(t => t.id === activeWO.taskId);
        return task ? `${task.wbs} - ${task.name}` : activeWO.title;
    };

    return (
        <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <Card key={index} className="flex items-center justify-between">
                        <div>
                            <p className="text-[var(--text-muted)] text-sm">{metric.label}</p>
                            <h2 className="text-3xl font-bold text-[var(--text-main)] mt-1">{metric.value}</h2>
                        </div>
                        <metric.icon className={`w-10 h-10 ${metric.color} opacity-80`} />
                    </Card>
                ))}
            </div>

            {/* Task Tracker Widget */}
            <TaskTracker />

            {/* RTG Fleet Status */}
            <div>
                <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">RTG Fleet Status</h2>
                {rtgs.length === 0 ? (
                    <Card className="text-center py-12">
                        <p className="text-[var(--text-muted)] mb-4">No RTG units configured yet.</p>
                        <Button variant="primary" onClick={() => navigate('/admin')}>
                            Go to Admin to Add RTGs
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {rtgs.map((rtg) => {
                            const progress = getRTGProgress(rtg.id);
                            const nextStep = getNextStep(rtg.id);
                            const lastUpdate = getLastUpdate(rtg.id);
                            const currentTask = getCurrentTask(rtg.id);

                            return (
                                <Card key={rtg.id} className="hover:border-[var(--primary)] transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-bold text-gradient">{rtg.name}</h3>
                                        <StatusBadge status={rtg.status} />
                                    </div>

                                    {/* Current Task */}
                                    <div className="mb-4 p-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                                        <p className="text-xs text-[var(--text-muted)] mb-1">Current Task</p>
                                        <p className="text-sm font-medium text-[var(--primary)] truncate">{currentTask}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-[var(--text-muted)]">Progress</span>
                                                <span className="text-[var(--primary)]">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-[var(--bg-glass)] rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full shadow-[0_0_10px_var(--primary-glow)] transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-[var(--text-muted)] text-xs">Last Update</p>
                                                <p className="text-[var(--text-main)]">{lastUpdate}</p>
                                            </div>
                                            <div>
                                                <p className="text-[var(--text-muted)] text-xs">Next Step</p>
                                                <p className="text-[var(--text-main)] truncate">{nextStep}</p>
                                            </div>
                                        </div>

                                        {rtg.location && (
                                            <div className="text-sm">
                                                <p className="text-[var(--text-muted)] text-xs">Location</p>
                                                <p className="text-[var(--text-main)]">{rtg.location}</p>
                                            </div>
                                        )}

                                        <Button
                                            variant="glass"
                                            size="sm"
                                            className="w-full group-hover:bg-[var(--primary)] group-hover:text-[#0a0a12] group-hover:border-transparent"
                                            onClick={() => navigate(`/rtg/${rtg.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
