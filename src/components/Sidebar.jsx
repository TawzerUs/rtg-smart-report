import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, Settings, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import eurogateLogo from '../assets/logos/eurogate.svg';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { userRole, signOut } = useAuth();
    console.log('🔍 Sidebar - userRole:', userRole);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    ];

    // Add User Management and Settings for admins only
    if (userRole === 'admin') {
        console.log('✅ Adding Admin links');
        navItems.push({ path: '/users', label: 'User Management', icon: Users });
        navItems.push({ path: '/settings', label: 'Settings', icon: Settings });
    } else {
        console.log('❌ Admin links hidden - userRole is:', userRole);
    }

    const [clientInfo, setClientInfo] = React.useState(null);

    React.useEffect(() => {
        const stored = localStorage.getItem('selectedClient');
        if (stored) {
            try {
                setClientInfo(JSON.parse(stored));
            } catch (e) {
                console.error("Error parsing stored client", e);
            }
        }
    }, []);

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

                {/* Sign Out Button */}
                <div className="px-1 mb-4 mt-auto">
                    <button
                        onClick={async () => {
                            await signOut();
                            window.location.href = '/';
                        }}
                        className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="ml-3 font-medium">Sign Out</span>
                    </button>
                </div>

                {/* Dynamic Customer Logo Footer */}
                {clientInfo && (
                    <div className="pt-4 border-t border-[var(--border-glass)]">
                        <p className="text-[10px] text-[var(--text-muted)] mb-3 text-center uppercase tracking-wider">
                            {clientInfo.name}
                        </p>
                        <div className="flex justify-center">
                            <div className="bg-white/5 p-2 rounded-lg border border-white/5 transition-colors">
                                {clientInfo.logo_url ? (
                                    <img
                                        src={clientInfo.logo_url}
                                        alt={clientInfo.name}
                                        className="h-8 w-auto object-contain opacity-90"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<span class="text-xs text-gray-400">No Logo</span>';
                                        }}
                                    />
                                ) : (
                                    <div className="h-8 w-8 flex items-center justify-center bg-blue-900/30 rounded">
                                        <span className="text-blue-400 font-bold text-xs">
                                            {clientInfo.name.substring(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
