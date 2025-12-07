import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Info, ArrowRight } from 'lucide-react';

const WORKFLOW_STEPS = [
    {
        id: 'lavage',
        title: '1. Lavage Industriel',
        description: 'Industrial cleaning of RTG surfaces',
        details: [
            'Upload "Before" photos showing initial surface condition',
            'Perform high-pressure industrial cleaning',
            'Upload "After" photos to document cleaned surfaces',
            'Validate completion to proceed to next step'
        ],
        module: 'Lavage',
        required: true
    },
    {
        id: 'inspection',
        title: '2. Inspection Visuelle',
        description: 'Visual inspection and corrosion mapping',
        details: [
            'Select zone to inspect from dropdown',
            'Upload reference image for the zone',
            'Mark corrosion points by clicking on the image',
            'Add severity level and notes for each point',
            'Validate zone when inspection is complete',
            'Repeat for all zones'
        ],
        module: 'Inspection',
        required: true
    },
    {
        id: 'sablage',
        title: '3. Préparation de Surface (Sablage SA 2.5)',
        description: 'Surface preparation by sandblasting',
        details: [
            'Select zone for surface preparation',
            'Upload photos of sandblasted surface',
            'Measure and record surface roughness (μm)',
            'Complete preparation checklist',
            'Validate zone completion',
            'Repeat for all zones'
        ],
        module: 'Sablage',
        required: true
    },
    {
        id: 'painting',
        title: '4. Application Peinture',
        description: 'Paint system application',
        details: [
            'Select painting system from dropdown',
            'For each layer (Primaire, Intermédiaire, Finition):',
            '  - Upload application photos',
            '  - Record application date and conditions',
            '  - Document weather conditions',
            'Validate complete painting system'
        ],
        module: 'Peinture',
        required: true
    },
    {
        id: 'coating',
        title: '5. Contrôle Qualité Revêtement',
        description: 'Coating quality control measurements',
        details: [
            'Select zone for quality control',
            'Measure dry film thickness (DFT) in μm',
            'Perform adhesion test (cross-cut method)',
            'Record test results and observations',
            'Upload test photos as evidence',
            'Validate zone measurements',
            'Repeat for all zones'
        ],
        module: 'Contrôle Revêtement',
        required: true
    },
    {
        id: 'observations',
        title: '6. Observations Générales',
        description: 'General observations and notes',
        details: [
            'Document any anomalies or special conditions',
            'Add general project observations',
            'Include recommendations if needed',
            'Upload supporting photos'
        ],
        module: 'Observations',
        required: false
    },
    {
        id: 'report',
        title: '7. Génération Rapport',
        description: 'Generate final inspection report',
        details: [
            'Review all completed modules',
            'Ensure all required data is validated',
            'Navigate to Reports page',
            'Select RTG and generate PDF report',
            'Download and archive report'
        ],
        module: 'Rapports',
        required: true
    }
];

const RTGWorkflowGuide = ({ currentModule, completedModules = [] }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedStep, setExpandedStep] = useState(null);

    const getStepStatus = (step) => {
        if (completedModules.includes(step.module)) {
            return 'completed';
        }
        if (currentModule === step.module) {
            return 'current';
        }
        return 'pending';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-400" />;
            case 'current':
                return <Circle className="w-5 h-5 text-blue-400 animate-pulse" />;
            default:
                return <Circle className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'border-green-500/50 bg-green-500/5';
            case 'current':
                return 'border-blue-500/50 bg-blue-500/5';
            default:
                return 'border-gray-700/50 bg-gray-800/20';
        }
    };

    const completedCount = WORKFLOW_STEPS.filter(step =>
        completedModules.includes(step.module)
    ).length;
    const progress = (completedCount / WORKFLOW_STEPS.length) * 100;

    return (
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden">
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-slate-800/60 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-blue-400" />
                        <div>
                            <h3 className="text-lg font-bold text-white">RTG Workflow Guide</h3>
                            <p className="text-sm text-gray-400">
                                {completedCount} of {WORKFLOW_STEPS.length} steps completed
                            </p>
                        </div>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Steps */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-3">
                    {WORKFLOW_STEPS.map((step, index) => {
                        const status = getStepStatus(step);
                        const isStepExpanded = expandedStep === step.id;

                        return (
                            <div
                                key={step.id}
                                className={`border rounded-lg overflow-hidden transition-all ${getStatusColor(status)}`}
                            >
                                {/* Step Header */}
                                <div
                                    className="p-3 cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => setExpandedStep(isStepExpanded ? null : step.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        {getStatusIcon(status)}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-white">{step.title}</h4>
                                                {step.required && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                                            {status === 'current' && (
                                                <div className="flex items-center gap-2 mt-2 text-xs text-blue-400">
                                                    <ArrowRight className="w-3 h-3" />
                                                    <span>Current step - complete to proceed</span>
                                                </div>
                                            )}
                                        </div>
                                        {isStepExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>

                                {/* Step Details */}
                                {isStepExpanded && (
                                    <div className="px-3 pb-3 pt-0">
                                        <div className="ml-8 pl-4 border-l-2 border-gray-700">
                                            <ul className="space-y-2">
                                                {step.details.map((detail, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="text-sm text-gray-300 flex items-start gap-2"
                                                    >
                                                        <span className="text-blue-400 mt-1">•</span>
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Help Text */}
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-300">
                            <strong>Tip:</strong> Follow the workflow in order for best results.
                            Each step builds on the previous one. Click on any step to see detailed instructions.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RTGWorkflowGuide;
