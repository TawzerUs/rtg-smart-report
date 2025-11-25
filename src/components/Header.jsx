import React, { useState } from 'react';
import { Bell, Menu, User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, userRole, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
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
        <header className="fixed top-0 z-30 w-full sm:ml-64 bg-[var(--bg-dark)]/80 backdrop-blur-md border-b border-[var(--border-glass)]">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <button
                            onClick={toggleSidebar}
                            type="button"
                            className="inline-flex items-center p-2 text-sm text-[var(--text-muted)] rounded-lg sm:hidden hover:bg-[var(--bg-glass)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden sm:block ml-4">
                            <span className="text-sm text-[var(--text-muted)]">Operations Follow-up</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent)] rounded-full"></span>
                        </button>
                        <div className="relative flex items-center gap-3 pl-4 border-l border-[var(--border-glass)]">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-[var(--text-main)]">
                                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {getRoleName(userRole)}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_10px_var(--primary-glow)] hover:scale-105 transition-transform"
                            >
                                <User className="w-5 h-5 text-white" />
                            </button>

                            {/* User dropdown menu */}
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 top-12 z-50 w-48 bg-[var(--bg-dark)] border border-[var(--border-glass)] rounded-lg shadow-xl overflow-hidden">
                                        <div className="px-4 py-3 border-b border-[var(--border-glass)]">
                                            <p className="text-sm font-medium text-[var(--text-main)] truncate">
                                                {user?.email}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {getRoleName(userRole)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate('/settings');
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-[var(--text-main)] hover:bg-[var(--bg-glass)] transition-colors flex items-center gap-2"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-[var(--bg-glass)] transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
