import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import Card from '../Card';
import Button from '../Button';
import Modal from '../Modal';
import ReportTemplate from '../reports/ReportTemplate';
import { FileText, Download, Eye, Printer } from 'lucide-react';

const ReportModule = ({ rtgId }) => {
    const { rtgs, workOrders, corrosionData, paintingData, headerImage, observations, setObservations } = useProject();

    // Aggregate Data for the Report
    const rtg = rtgs.find(r => r.id === rtgId);
    const tasks = workOrders.filter(wo => wo.rtgId === rtgId);
    const corrosion = corrosionData.filter(c => c.rtgId === rtgId);
    const painting = paintingData.filter(p => p.rtgId === rtgId);

    // Mock Weather (could be passed from global state if available)
    const weather = { temp: 24, humidity: 45 };
    const today = new Date().toISOString().split('T')[0];

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [localObservations, setLocalObservations] = useState(observations[rtgId] || '');

    const handleSaveObservations = () => {
        const updated = { ...observations, [rtgId]: localObservations };
        setObservations(updated);
        localStorage.setItem('reportObservations', JSON.stringify(updated));
    };

    const reportData = {
        rtg,
        tasks,
        corrosion,
        painting,
        weather,
        date: today,
        headerImage,
        observations: localObservations
    };

    const handlePrint = () => {
        const reportContent = document.getElementById('report-preview-content');
        if (!reportContent) {
            console.error('Report content not found');
            return;
        }

        // Get the HTML content as string
        const htmlContent = reportContent.innerHTML;

        // Create print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Rapport - ${rtgId}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        
                        body {
                            margin: 0;
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                </body>
            </html>
        `);

        printWindow.document.close();

        // Wait for Tailwind to load and render, then print
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            setTimeout(() => printWindow.close(), 500);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            {/* Observations Section */}
            <Card title="Observations Générales">
                <div className="space-y-3">
                    <p className="text-sm text-[var(--text-muted)]">
                        Ajoutez des observations ou commentaires qui apparaîtront dans le rapport final.
                    </p>
                    <textarea
                        value={localObservations}
                        onChange={(e) => setLocalObservations(e.target.value)}
                        placeholder="Saisissez vos observations ici..."
                        className="w-full h-32 bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded p-3 text-[var(--text-main)] focus:border-[var(--primary)] outline-none resize-none"
                    />
                    <div className="flex justify-end">
                        <Button variant="primary" size="sm" onClick={handleSaveObservations}>
                            Enregistrer les Observations
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Report Generation */}
            <Card title="Génération de Rapport">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text-main)]">Rapport Technique Complet</h3>
                        <p className="text-[var(--text-muted)]">
                            Génère un PDF incluant l'état d'avancement, les relevés de corrosion, et les données de peinture.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" icon={Eye} onClick={() => setIsPreviewOpen(true)}>
                            Aperçu
                        </Button>
                        <Button variant="primary" icon={Printer} onClick={() => { setIsPreviewOpen(true); setTimeout(handlePrint, 100); }}>
                            Imprimer / PDF
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Aperçu du Rapport" maxWidth="max-w-4xl">
                <div className="flex justify-end mb-4 gap-2">
                    <Button variant="secondary" icon={Printer} onClick={handlePrint}>Imprimer</Button>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[70vh]">
                    <div id="report-preview-content" className="origin-top scale-95">
                        <ReportTemplate data={reportData} />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ReportModule;
