import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useTutorial } from '../context/TutorialContext';
import Button from './Button';

const TutorialOverlay = () => {
    const { isActive, currentStep, tutorialSteps, nextStep, previousStep, skipTutorial } = useTutorial();
    const navigate = useNavigate();

    if (!isActive) return null;

    const step = tutorialSteps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === tutorialSteps.length - 1;

    const handleNext = () => {
        if (step.target) {
            navigate(step.target);
        }
        nextStep();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl">
                <div className="relative rounded-xl glass-panel shadow-[0_0_50px_rgba(0,0,0,0.7)] border border-[var(--primary)]/30 p-8">
                    {/* Close Button */}
                    <button
                        onClick={skipTutorial}
                        className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-[var(--text-muted)]">
                                Step {currentStep + 1} of {tutorialSteps.length}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[var(--bg-glass)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500"
                                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gradient mb-4">{step.title}</h2>
                        <p className="text-lg text-[var(--text-muted)]">{step.description}</p>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <div>
                            {!isFirstStep && (
                                <Button variant="ghost" onClick={previousStep} icon={ArrowLeft}>
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={skipTutorial}>
                                Skip Tutorial
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                icon={isLastStep ? Check : ArrowRight}
                            >
                                {isLastStep ? 'Finish' : 'Next'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
