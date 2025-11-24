import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, Settings, Shield } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { path: '/admin', label: 'Admin', icon: Shield },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 w-64 bg-[#0a0a12] border-r border-[var(--border-glass)]`}>
            <div className="h-full px-3 py-4 overflow-y-auto">
                <div className="flex items-center justify-center mb-8 mt-2">
                    <h1 className="text-2xl font-bold text-gradient">RTG Smart</h1>
                </div>
                <ul className="space-y-2 font-medium">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-lg group transition-all duration-200 ${isActive
                                        ? 'bg-[var(--bg-glass-hover)] text-[var(--primary)] border border-[var(--primary-glow)] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-main)]'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5 transition duration-75 group-hover:text-[var(--primary)]" />
                                <span className="ml-3">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
