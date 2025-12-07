import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import eurogateLogo from '../assets/logos/eurogate.svg';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { userRole } = useAuth();
    console.log('🔍 Sidebar - userRole:', userRole);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    // Add User Management for admins only
    if (userRole === 'admin') {
        console.log('✅ Adding User Management link for admin');
        navItems.splice(1, 0, { path: '/users', label: 'User Management', icon: Users });
    } else {
        console.log('❌ User Management hidden - userRole is:', userRole);
    }

    return (
        <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 w-64 bg-[#0a0a12] border-r border-[var(--border-glass)]`}>
            <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
                <div className="flex items-center justify-center mb-8 mt-2">
                    <h1 className="text-2xl font-bold text-gradient">RTG Smart</h1>
                </div>
                <ul className="space-y-2 font-medium flex-1">
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

                {/* Customer Logos Footer */}
                <div className="mt-4 pt-4 border-t border-[var(--border-glass)]">
                    <p className="text-[10px] text-[var(--text-muted)] mb-3 text-center uppercase tracking-wider">Client Partenaire</p>
                    <div className="flex justify-center">
                        <div className="bg-white/5 p-2 rounded-lg border border-white/5 hover:border-[var(--primary)] transition-colors">
                            <img src={eurogateLogo} alt="Eurogate" className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
