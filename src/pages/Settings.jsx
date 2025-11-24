import React, { useState } from 'react';
import { User, Bell, Shield, Moon, LogOut, GraduationCap, Sun, Database, PlayCircle } from 'lucide-react';
import { useTutorial } from '../context/TutorialContext';
import Card from '../components/Card';
import Button from '../components/Button';

import { useApp } from '../context/AppContext';

const Settings = () => {
    const { startTutorial, hasCompletedTutorial, resetTutorial } = useTutorial();
    const { theme, toggleTheme, loadDemoData } = useApp();
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>

            {/* Profile Section */}
            <Card title="User Profile" icon={User}>
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)]">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-main)]">Adil Tawzer</h3>
                        <p className="text-[var(--text-muted)]">Operations Manager</p>
                        <p className="text-sm text-[var(--text-muted)]">adil.tawzer@eurogate.com</p>
                    </div>
                    <div className="ml-auto">
                        <Button variant="secondary" size="sm">Edit Profile</Button>
                    </div>
                </div>
            </Card>

            {/* Data Management */}
            <Card title="Data Management" icon={Database}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                        <div>
                            <h3 className="font-bold text-[var(--text-main)]">Demo Scenario</h3>
                            <p className="text-sm text-[var(--text-muted)]">Reset app and load end-to-end demo data</p>
                        </div>
                        <Button variant="primary" icon={PlayCircle} onClick={loadDemoData}>Load Demo</Button>
                    </div>
                </div>
            </Card>

            {/* Tutorial Section */}
            <Card title="Tutorial & Help" icon={GraduationCap}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded hover:bg-[var(--bg-glass)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--text-main)]">App Tutorial</p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {hasCompletedTutorial ? 'Completed - Click to restart' : 'Learn how to use the app'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={hasCompletedTutorial ? resetTutorial : startTutorial}
                        >
                            {hasCompletedTutorial ? 'Restart Tutorial' : 'Start Tutorial'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* App Preferences */}
            <Card title="Application Preferences">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded hover:bg-[var(--bg-glass)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                                <Moon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--text-main)]">Dark Mode</p>
                                <p className="text-xs text-[var(--text-muted)]">Toggle application theme</p>
                            </div>
                        </div>
                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="toggle"
                                id="toggle"
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-[var(--primary)]"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                            />
                            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer"></label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded hover:bg-[var(--bg-glass)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-[var(--secondary)]/10 text-[var(--secondary)]">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--text-main)]">Notifications</p>
                                <p className="text-xs text-[var(--text-muted)]">Email and push alerts</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Configure</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded hover:bg-[var(--bg-glass)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-[var(--success)]/10 text-[var(--success)]">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--text-main)]">Security</p>
                                <p className="text-xs text-[var(--text-muted)]">Password and 2FA</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Manage</Button>
                    </div>
                </div>
            </Card>

            <div className="flex justify-center pt-6">
                <Button variant="danger" icon={LogOut}>Sign Out</Button>
            </div>
        </div>
    );
};

export default Settings;
