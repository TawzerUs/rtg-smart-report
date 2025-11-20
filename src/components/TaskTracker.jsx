import React from 'react';
import { Clock, Play, Pause, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from './Card';

const TaskTracker = () => {
    const { tasks, workOrders } = useApp();

    // Get active work orders with their associated tasks
    const activeWorkOrders = workOrders.filter(wo => wo.status !== 'Completed');

    const getTaskInfo = (taskId) => {
        return tasks.find(t => t.id === taskId);
    };

    const calculateProgress = (startTime, endTime) => {
        if (!startTime || !endTime) return 0;

        const now = new Date();
        const start = new Date();
        const end = new Date();

        const [startHour, startMin] = startTime.split(':');
        const [endHour, endMin] = endTime.split(':');

        start.setHours(parseInt(startHour), parseInt(startMin), 0);
        end.setHours(parseInt(endHour), parseInt(endMin), 0);

        if (now < start) return 0;
        if (now > end) return 100;

        const total = end - start;
        const elapsed = now - start;
        return Math.round((elapsed / total) * 100);
    };

    return (
        <Card title="Active Task Tracking" icon={Clock}>
            <div className="space-y-3">
                {activeWorkOrders.length === 0 ? (
                    <p className="text-center text-[var(--text-muted)] py-4">No active tasks to track</p>
                ) : (
                    activeWorkOrders.slice(0, 5).map((wo) => {
                        const task = getTaskInfo(wo.taskId);
                        const progress = task ? calculateProgress(task.startTime, task.endTime) : 0;

                        return (
                            <div key={wo.id} className="p-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] hover:border-[var(--primary)]/30 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-[var(--text-main)] truncate">{wo.title}</h4>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {task ? `${task.wbs} - ${task.name}` : 'No task assigned'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        {wo.status === 'In Progress' ? (
                                            <Play className="w-4 h-4 text-[var(--success)]" />
                                        ) : wo.status === 'Pending' ? (
                                            <Pause className="w-4 h-4 text-[var(--warning)]" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                                        )}
                                    </div>
                                </div>

                                {task && task.startTime && task.endTime && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                                            <span>{task.startTime} - {task.endTime}</span>
                                            <span className="text-[var(--primary)]">{progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[var(--bg-dark)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {task && task.estimatedDuration && (
                                    <p className="text-xs text-[var(--text-muted)] mt-2">
                                        Est. Duration: {task.estimatedDuration}h
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
};

export default TaskTracker;
