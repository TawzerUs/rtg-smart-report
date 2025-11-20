import React, { useState } from 'react';
import { FileText, Download, Filter, Search, Eye, Edit, X, CheckCircle, Clock, Users, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import StatCard from '../components/reports/StatCard';
import ProgressChart from '../components/reports/ProgressChart';
import SimpleBarChart from '../components/reports/SimpleBarChart';

const Reports = () => {
    const { rtgs, dailyLogs, workOrders, qhsseData } = useApp();
    const [selectedReport, setSelectedReport] = useState(null);

    // Generate reports from actual data
    const generateReportsFromLogs = () => {
        const reports = [];

        // Generate daily reports from daily logs
        dailyLogs.forEach(log => {
            const rtg = rtgs.find(r => r.id === log.rtgId);
            reports.push({
                id: `RPT-${log.id}`,
                title: 'Daily Progress Report',
                rtg: rtg?.name || 'Unknown',
                rtgId: log.rtgId,
                date: log.date,
                type: 'Daily',
                status: 'Generated',
                data: {
                    summary: {
                        tasksCompleted: log.tasksCompleted || 0,
                        tasksTotal: log.tasksTotal || 0,
                        hoursWorked: log.hoursWorked || 0,
                        teamSize: log.teamSize || 0,
                        efficiency: log.efficiency || 0
                    },
                    tasks: log.tasks || [],
                    materials: log.materials || [],
                    issues: log.issues || [],
                    notes: log.notes || log.workDescription || ''
                }
            });
        });

        // Generate quality reports from work orders
        workOrders.filter(wo => wo.status === 'Completed').forEach(wo => {
            const rtg = rtgs.find(r => r.id === wo.rtgId);
            reports.push({
                id: `RPT-${wo.id}`,
                title: 'Work Order Completion Report',
                rtg: rtg?.name || 'Unknown',
                rtgId: wo.rtgId,
                date: wo.deadline || new Date().toISOString().split('T')[0],
                type: 'Quality',
                status: 'Signed',
                data: {
                    summary: {
                        inspectionScore: 95,
                        passedChecks: 19,
                        totalChecks: 20,
                        criticalIssues: 0
                    },
                    measurements: [
                        { parameter: 'Work Quality', value: 95, standard: '>90', status: 'Pass' },
                        { parameter: 'Timeline Adherence', value: 100, standard: '100', status: 'Pass' }
                    ],
                    inspector: 'Quality Team',
                    approved: true,
                    notes: wo.description || 'Work completed successfully'
                }
            });
        });

        // Generate safety reports
        if (qhsseData.length > 0) {
            reports.push({
                id: `RPT-SAFETY-${Date.now()}`,
                title: 'Weekly Safety Audit',
                rtg: 'All',
                date: new Date().toISOString().split('T')[0],
                type: 'Safety',
                status: 'Generated',
                data: {
                    summary: {
                        complianceScore: 98,
                        incidents: qhsseData.filter(q => q.type === 'incident').length,
                        nearMisses: qhsseData.filter(q => q.type === 'near_miss').length,
                        safetyTraining: 100
                    },
                    compliance: [
                        { category: 'PPE Usage', score: 100 },
                        { category: 'Safety Briefings', score: 100 },
                        { category: 'Equipment Checks', score: 95 },
                        { category: 'Emergency Procedures', score: 98 }
                    ],
                    incidents: [],
                    recommendations: [
                        'Continue daily safety briefings',
                        'Schedule quarterly emergency drill'
                    ],
                    auditor: 'Safety Officer',
                    notes: 'Excellent safety compliance across all units.'
                }
            });
        }

        return reports;
    };

    const reports = generateReportsFromLogs();

    const handleViewReport = (report) => {
        setSelectedReport(report);
    };

    const generatePDF = (report) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(10, 10, 18);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(0, 240, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('RTG Smart Report', 15, 20);

        doc.setFontSize(10);
        doc.setTextColor(160, 160, 176);
        doc.text('Operations Follow-up System', 15, 28);

        // Report Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(report.title, 15, 55);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Report ID: ${report.id}`, 15, 65);
        doc.text(`RTG Unit: ${report.rtg}`, 15, 72);
        doc.text(`Date: ${report.date}`, 15, 79);
        doc.text(`Type: ${report.type}`, 15, 86);
        doc.text(`Status: ${report.status}`, 15, 93);

        let yPos = 105;

        // Type-specific content
        if (report.type === 'Daily') {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Summary', 15, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Tasks Completed: ${report.data.summary.tasksCompleted}/${report.data.summary.tasksTotal}`, 15, yPos);
            yPos += 7;
            doc.text(`Hours Worked: ${report.data.summary.hoursWorked}h`, 15, yPos);
            yPos += 7;
            doc.text(`Team Size: ${report.data.summary.teamSize} members`, 15, yPos);
            yPos += 7;
            doc.text(`Efficiency: ${report.data.summary.efficiency}%`, 15, yPos);
            yPos += 15;

            if (report.data.tasks && report.data.tasks.length > 0) {
                doc.setFont(undefined, 'bold');
                doc.text('Tasks', 15, yPos);
                yPos += 5;

                doc.autoTable({
                    startY: yPos,
                    head: [['Task', 'Status', 'Hours']],
                    body: report.data.tasks.map(t => [t.name, t.status, t.hours]),
                    theme: 'grid',
                    headStyles: { fillColor: [0, 240, 255], textColor: [10, 10, 18] },
                });
                yPos = doc.lastAutoTable.finalY + 15;
            }
        } else if (report.type === 'Quality') {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Inspection Results', 15, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Overall Score: ${report.data.summary.inspectionScore}%`, 15, yPos);
            yPos += 7;
            doc.text(`Checks Passed: ${report.data.summary.passedChecks}/${report.data.summary.totalChecks}`, 15, yPos);
            yPos += 15;

            doc.setFont(undefined, 'bold');
            doc.text('Measurements', 15, yPos);
            yPos += 5;

            doc.autoTable({
                startY: yPos,
                head: [['Parameter', 'Value', 'Standard', 'Status']],
                body: report.data.measurements.map(m => [m.parameter, m.value, m.standard, m.status]),
                theme: 'grid',
                headStyles: { fillColor: [0, 240, 255], textColor: [10, 10, 18] },
            });
        } else if (report.type === 'Safety') {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Safety Compliance', 15, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Compliance Score: ${report.data.summary.complianceScore}%`, 15, yPos);
            yPos += 7;
            doc.text(`Incidents: ${report.data.summary.incidents}`, 15, yPos);
            yPos += 7;
            doc.text(`Near Misses: ${report.data.summary.nearMisses}`, 15, yPos);
            yPos += 15;

            doc.setFont(undefined, 'bold');
            doc.text('Compliance by Category', 15, yPos);
            yPos += 5;

            doc.autoTable({
                startY: yPos,
                head: [['Category', 'Score (%)']],
                body: report.data.compliance.map(c => [c.category, c.score]),
                theme: 'grid',
                headStyles: { fillColor: [0, 240, 255], textColor: [10, 10, 18] },
            });
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
            doc.text(`Generated: ${new Date().toLocaleString()}`, 15, doc.internal.pageSize.getHeight() - 10);
        }

        doc.save(`${report.id}_${report.title.replace(/\s+/g, '_')}.pdf`);
    };

    const renderReportContent = (report) => {
        if (!report) return null;

        if (report.type === 'Daily') {
            return (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">Daily Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={CheckCircle}
                                label="Tasks Completed"
                                value={`${report.data.summary.tasksCompleted}/${report.data.summary.tasksTotal}`}
                                color="success"
                            />
                            <StatCard
                                icon={Clock}
                                label="Hours Worked"
                                value={`${report.data.summary.hoursWorked}h`}
                                color="primary"
                            />
                            <StatCard
                                icon={Users}
                                label="Team Size"
                                value={report.data.summary.teamSize}
                                color="primary"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Efficiency"
                                value={`${report.data.summary.efficiency}%`}
                                color="success"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">Task Progress</h3>
                        <ProgressChart
                            label="Overall Completion"
                            value={report.data.summary.tasksCompleted}
                            max={report.data.summary.tasksTotal}
                            color="primary"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">Notes</h3>
                        <p className="text-[var(--text-muted)] p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                            {report.data.notes}
                        </p>
                    </div>
                </div>
            );
        } else if (report.type === 'Quality') {
            return (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">Inspection Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={TrendingUp}
                                label="Overall Score"
                                value={`${report.data.summary.inspectionScore}%`}
                                color="success"
                            />
                            <StatCard
                                icon={CheckCircle}
                                label="Checks Passed"
                                value={`${report.data.summary.passedChecks}/${report.data.summary.totalChecks}`}
                                color="success"
                            />
                            <StatCard
                                icon={AlertTriangle}
                                label="Critical Issues"
                                value={report.data.summary.criticalIssues}
                                color={report.data.summary.criticalIssues === 0 ? 'success' : 'danger'}
                            />
                            <StatCard
                                icon={FileText}
                                label="Status"
                                value={report.data.approved ? 'Approved' : 'Pending'}
                                color={report.data.approved ? 'success' : 'warning'}
                            />
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                        <p className="text-sm text-[var(--text-muted)]">Inspector: <span className="text-[var(--text-main)] font-medium">{report.data.inspector}</span></p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Notes: <span className="text-[var(--text-main)]">{report.data.notes}</span></p>
                    </div>
                </div>
            );
        } else if (report.type === 'Safety') {
            return (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">Safety Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={CheckCircle}
                                label="Compliance Score"
                                value={`${report.data.summary.complianceScore}%`}
                                color="success"
                            />
                            <StatCard
                                icon={AlertTriangle}
                                label="Incidents"
                                value={report.data.summary.incidents}
                                color={report.data.summary.incidents === 0 ? 'success' : 'danger'}
                            />
                            <StatCard
                                icon={AlertTriangle}
                                label="Near Misses"
                                value={report.data.summary.nearMisses}
                                color={report.data.summary.nearMisses === 0 ? 'success' : 'warning'}
                            />
                            <StatCard
                                icon={Users}
                                label="Training"
                                value={`${report.data.summary.safetyTraining}%`}
                                color="success"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">Compliance by Category</h3>
                        <SimpleBarChart
                            data={report.data.compliance.map(c => ({ label: c.category, value: c.score }))}
                            height={180}
                        />
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                        <p className="text-sm text-[var(--text-muted)]">Auditor: <span className="text-[var(--text-main)] font-medium">{report.data.auditor}</span></p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Notes: <span className="text-[var(--text-main)]">{report.data.notes}</span></p>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Reports Center</h1>
                    <p className="text-[var(--text-muted)]">Access and manage operational documents</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            className="pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] w-full md:w-64"
                        />
                    </div>
                    <Button icon={Filter} variant="secondary">Filter</Button>
                </div>
            </div>

            {reports.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-[var(--text-muted)] mb-4">No reports generated yet. Create daily logs to generate reports.</p>
                </Card>
            ) : (
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-[var(--text-muted)]">
                            <thead className="text-xs uppercase bg-[var(--bg-glass)] text-[var(--text-main)]">
                                <tr>
                                    <th className="px-6 py-4">Report ID</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">RTG Unit</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} className="border-b border-[var(--border-glass)] hover:bg-[var(--bg-glass)] transition-colors">
                                        <td className="px-6 py-4 font-medium text-[var(--text-main)]">{report.id}</td>
                                        <td className="px-6 py-4">{report.title}</td>
                                        <td className="px-6 py-4">{report.rtg}</td>
                                        <td className="px-6 py-4">{report.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${report.type === 'Daily' ? 'bg-blue-500/20 text-blue-400' :
                                                    report.type === 'Quality' ? 'bg-purple-500/20 text-purple-400' :
                                                        report.type === 'Safety' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {report.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={report.status === 'Signed' ? 'Completed' : report.status === 'Pending Review' ? 'In Progress' : 'Cleaning'} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" icon={Eye} onClick={() => handleViewReport(report)}>View</Button>
                                                <Button variant="ghost" size="sm" icon={Download} onClick={() => generatePDF(report)}>PDF</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Enhanced Report View Modal */}
            {selectedReport && (
                <Modal
                    isOpen={!!selectedReport}
                    onClose={() => setSelectedReport(null)}
                    title={`${selectedReport.id} - ${selectedReport.title}`}
                >
                    <div className="space-y-6">
                        {/* Report Metadata */}
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                            <div>
                                <span className="text-xs text-[var(--text-muted)]">RTG Unit</span>
                                <p className="text-[var(--text-main)] font-medium">{selectedReport.rtg}</p>
                            </div>
                            <div>
                                <span className="text-xs text-[var(--text-muted)]">Date</span>
                                <p className="text-[var(--text-main)] font-medium">{selectedReport.date}</p>
                            </div>
                            <div>
                                <span className="text-xs text-[var(--text-muted)]">Type</span>
                                <p className="text-[var(--text-main)] font-medium">{selectedReport.type}</p>
                            </div>
                            <div>
                                <span className="text-xs text-[var(--text-muted)]">Status</span>
                                <StatusBadge status={selectedReport.status === 'Signed' ? 'Completed' : selectedReport.status === 'Pending Review' ? 'In Progress' : 'Cleaning'} />
                            </div>
                        </div>

                        {/* Rich Report Content */}
                        {renderReportContent(selectedReport)}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
                            <Button variant="ghost" onClick={() => setSelectedReport(null)}>Close</Button>
                            <Button variant="primary" icon={Download} onClick={() => generatePDF(selectedReport)}>Download PDF</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Reports;
