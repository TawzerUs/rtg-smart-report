import React, { createContext, useContext, useState } from 'react';

const TutorialContext = createContext();

export const useTutorial = () => {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial must be used within TutorialProvider');
    }
    return context;
};

const tutorialSteps = [
    {
        id: 1,
        title: 'Welcome to RTG Smart Report',
        description: 'This tutorial will guide you through the key features of the application.',
        target: null
    },
    {
        id: 2,
        title: 'Admin Configuration',
        description: 'Start by configuring your RTG fleet, zones, users, and workflow tasks in the Admin section. This is the foundation of your data.',
        target: '/admin'
    },
    {
        id: 3,
        title: 'Dashboard Overview',
        description: 'View your entire RTG fleet status, active work orders, and key metrics on the Dashboard.',
        target: '/'
    },
    {
        id: 4,
        title: 'Create Work Orders',
        description: 'Manage tasks and work orders (OTs) for your RTG units. Assign them to team members and track progress.',
        target: '/tasks'
    },
    {
        id: 5,
        title: 'Daily Work Logs',
        description: 'Log daily work activities for each RTG. These logs will automatically generate reports.',
        target: '/rtg/1/log/new'
    },
    {
        id: 6,
        title: 'Reports Center',
        description: 'View and download generated reports based on your daily logs and work orders. Reports are created automatically!',
        target: '/reports'
    },
    {
        id: 7,
        title: 'You\'re All Set!',
        description: 'You now know the basics. Start by adding RTGs in Admin, then create work orders and daily logs. Reports will generate automatically!',
        target: null
    }
];

export const TutorialProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
        return localStorage.getItem('tutorial_completed') === 'true';
    });

    const startTutorial = () => {
        setCurrentStep(0);
        setIsActive(true);
    };

    const nextStep = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTutorial();
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const skipTutorial = () => {
        setIsActive(false);
        setCurrentStep(0);
    };

    const completeTutorial = () => {
        setIsActive(false);
        setCurrentStep(0);
        setHasCompletedTutorial(true);
        localStorage.setItem('tutorial_completed', 'true');
    };

    const resetTutorial = () => {
        setHasCompletedTutorial(false);
        localStorage.removeItem('tutorial_completed');
    };

    const value = {
        isActive,
        currentStep,
        tutorialSteps,
        hasCompletedTutorial,
        startTutorial,
        nextStep,
        previousStep,
        skipTutorial,
        completeTutorial,
        resetTutorial
    };

    return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
};
