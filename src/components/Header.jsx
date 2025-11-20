import React from 'react';
import { Bell, Menu, User } from 'lucide-react';
import Button from './Button';

const Header = ({ toggleSidebar }) => {
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
                        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-glass)]">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-[var(--text-main)]">Adil Tawzer</p>
                                <p className="text-xs text-[var(--text-muted)]">Ops Manager</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_10px_var(--primary-glow)]">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
