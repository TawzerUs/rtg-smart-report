import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, ShieldCheck, Shield } from 'lucide-react';
import { getCustomers } from '../services/supabaseDb';
import { useAuth } from '../context/AuthContext';
import eurogateLogo from '../assets/logos/eurogate.svg';
import marsaMarocLogo from '../assets/logos/marsamaroc.svg';

const ClientSelection = () => {
    const navigate = useNavigate();
    const { user, userRole, hasAccessToCustomer } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClients();
    }, [user]);

    const loadClients = async () => {
        setLoading(true);
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout')), 10000)
            );

            // Race query against timeout
            const data = await Promise.race([
                getCustomers(),
                timeoutPromise
            ]);

            // Filter customers based on user access
            let filteredClients = data;

            if (user) {
                filteredClients = userRole === 'admin'
                    ? data
                    : data.filter(client => hasAccessToCustomer(client.id));
            }

            setClients(filteredClients);
        } catch (err) {
            console.error("Failed to load clients:", err);
            // Fallback for demo/offline if needed, or just stop loading
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClient = (client) => {
        // Save selected client context even before login
        localStorage.setItem('selectedClient', JSON.stringify(client));

        if (!user) {
            navigate(`/login?client=${client.id}`);
        } else {
            // If already logged in, proceed to projects
            navigate('/projects');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a12' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{
            backgroundColor: '#0a0a12',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a12 100%)'
        }}>
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12 relative">
                    {/* Logout / Home Button */}
                    {/* Removed as this is now a pre-login screen */}

                    <h1 className="text-5xl font-bold mb-4" style={{
                        background: 'linear-gradient(135deg, #00f0ff 0%, #00ff9d 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
                    }}>
                        Spidercord OM
                    </h1>
                    <p className="text-gray-400 text-lg">Select your workspace to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {clients.map((client) => {
                        const isSuperAdmin = client.id === 'spidercord';
                        return (
                            <div
                                key={client.id}
                                onClick={() => handleSelectClient(client)}
                                className={`group relative p-6 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 ${isSuperAdmin ? 'md:col-span-full lg:col-span-full flex flex-col items-center py-8 bg-blue-900/10 border-blue-500/30' : ''
                                    }`}
                                style={{
                                    backgroundColor: isSuperAdmin ? 'rgba(0, 240, 255, 0.03)' : 'rgba(30, 41, 59, 0.4)',
                                    backdropFilter: 'blur(10px)',
                                    border: isSuperAdmin ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(148, 163, 184, 0.1)',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        boxShadow: `0 0 30px ${client.color}20`,
                                        border: `1px solid ${client.color}50`
                                    }}
                                />

                                <div className={`relative z-10 flex text-center space-y-4 ${isSuperAdmin ? 'flex-row items-center gap-6 space-y-0' : 'flex-col items-center'
                                    }`}>
                                    <div className={`${isSuperAdmin ? 'w-20 h-20' : 'w-16 h-16'} rounded-full flex items-center justify-center overflow-hidden`}
                                        style={{
                                            backgroundColor: `${client.color}10`,
                                            border: `1px solid ${client.color}30`
                                        }}
                                    >
                                        {client.id === 'eurogate' ? (
                                            <img src={eurogateLogo} alt="Eurogate" className="w-12 h-auto object-contain" />
                                        ) : client.id === 'marsa-maroc' || client.id === 'marsamaroc' ? (
                                            <img src={marsaMarocLogo} alt="Marsa Maroc" className="w-12 h-auto object-contain" />
                                        ) : isSuperAdmin ? (
                                            <Shield className="w-10 h-10" style={{ color: client.color }} />
                                        ) : (
                                            <Building2 className="w-8 h-8" style={{ color: client.color }} />
                                        )}
                                    </div>

                                    <div className={isSuperAdmin ? 'text-left' : ''}>
                                        <h3 className={`font-bold text-white mb-1 ${isSuperAdmin ? 'text-3xl' : 'text-xl'}`}>
                                            {client.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">{client.type} WORKSPACE</p>
                                    </div>

                                    <div className={`pt-4 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-y-0 translate-y-2 ${isSuperAdmin ? 'ml-auto w-auto pt-0' : ''}`}>
                                        <span className="flex items-center gap-2 text-sm font-medium" style={{ color: client.color }}>
                                            Sign In <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center text-xs text-gray-600">
                    &copy; 2025 Tawzer AppLabs. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default ClientSelection;
