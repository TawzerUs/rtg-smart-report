import React from 'react';
import { Shield, Trash2, CheckSquare, AlertTriangle } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const QHSSEModule = () => {
    const safetyChecklist = [
        { id: 1, label: 'PPE Compliance (Helmet, Harness, Gloves)', checked: true },
        { id: 2, label: 'Work Area Barricaded', checked: true },
        { id: 3, label: 'Fire Extinguishers Available', checked: true },
        { id: 4, label: 'Scaffolding Inspected', checked: false },
        { id: 5, label: 'No Chemical Spills', checked: true },
    ];

    const wasteLog = [
        { id: 1, type: 'Abrasive Dust', amount: '50 kg', method: 'Sealed Bags', hazard: 'Non-Hazardous' },
        { id: 2, type: 'Paint Cans', amount: '12 units', method: 'Hazardous Bin', hazard: 'Hazardous' },
        { id: 3, type: 'Solvent Rags', amount: '5 kg', method: 'Hazardous Bin', hazard: 'Hazardous' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Safety Checklist */}
            <Card title="Daily Safety Compliance (QHSSE)" icon={Shield}>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-[var(--success)]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[var(--text-main)]">Safety Score: 92%</h4>
                            <p className="text-sm text-[var(--text-muted)]">Last inspection: Today, 08:30 AM</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {safetyChecklist.map((item) => (
                            <label key={item.id} className="flex items-center justify-between p-3 rounded hover:bg-[var(--bg-glass)] cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--text-muted)]'}`}>
                                        {item.checked && <CheckSquare className="w-3 h-3 text-black" />}
                                    </div>
                                    <span className={item.checked ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}>{item.label}</span>
                                </div>
                                {!item.checked && <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />}
                            </label>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button variant="primary" size="sm">Submit Inspection</Button>
                    </div>
                </div>
            </Card>

            {/* Waste Management */}
            <Card title="Waste Management Log" icon={Trash2}>
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-[var(--text-muted)]">
                            <thead className="text-xs uppercase bg-[var(--bg-glass)] text-[var(--text-main)]">
                                <tr>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Hazard</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wasteLog.map((log) => (
                                    <tr key={log.id} className="border-b border-[var(--border-glass)] hover:bg-[var(--bg-glass)]">
                                        <td className="px-4 py-3 font-medium text-[var(--text-main)]">{log.type}</td>
                                        <td className="px-4 py-3">{log.amount}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${log.hazard === 'Hazardous' ? 'bg-[var(--danger)]/20 text-[var(--danger)]' : 'bg-[var(--success)]/20 text-[var(--success)]'}`}>
                                                {log.hazard}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <Button variant="ghost" size="sm">View Full Log</Button>
                        <Button variant="secondary" size="sm" icon={Trash2}>Log Waste</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default QHSSEModule;
