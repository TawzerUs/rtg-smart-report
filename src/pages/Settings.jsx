import React, { useState, useRef } from 'react';
import { User, Moon, FileText, LogOut } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { theme, toggleTheme } = useApp();
    const { headerImage, setHeaderImage } = useProject();
    const { user, userRole } = useAuth();
    const fileInputRef = useRef(null);

    const handleSignOut = () => {
        // Clear all auth data
        localStorage.removeItem('rtg_core_token');
        localStorage.removeItem('rtg_core_refresh_token');
        localStorage.removeItem('rtg_core_user');

        // Redirect to login
        window.location.href = '/login';
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeaderImage(reader.result);
                localStorage.setItem('reportHeaderImage', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveHeader = () => {
        setHeaderImage(null);
        localStorage.removeItem('reportHeaderImage');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getRoleName = (role) => {
        const roleNames = {
            admin: 'Administrator',
            operator: 'Operator',
            viewer: 'Viewer'
        };
        return roleNames[role] || 'User';
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>

            {/* Profile Section */}
            <Card title="User Profile" icon={User}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)]">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-main)]">
                                {user?.displayName || user?.email?.split('@')[0] || 'User'}
                            </h3>
                            <p className="text-[var(--text-muted)]">{getRoleName(userRole)}</p>
                            <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        icon={LogOut}
                        onClick={handleSignOut}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        Sign Out
                    </Button>
                </div>
            </Card>

            {/* App Preferences - Dark Mode Only */}
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
                </div>
            </Card>

            {/* Report Header Image */}
            <Card title="Report Configuration" icon={FileText}>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                        <div className="mb-3">
                            <h3 className="font-bold text-[var(--text-main)] mb-1">Report Header Image</h3>
                            <p className="text-sm text-[var(--text-muted)]">Upload a custom header image for PDF reports (recommended: 800x150px)</p>
                        </div>
                        {headerImage && (
                            <div className="mb-3 p-2 bg-white rounded border border-gray-300">
                                <img src={headerImage} alt="Report Header" className="max-h-24 mx-auto" />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="primary"
                                size="sm"
                                className="w-full"
                                onClick={handleUploadClick}
                            >
                                {headerImage ? 'Change Header' : 'Upload Header'}
                            </Button>

                            {headerImage && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleRemoveHeader}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
