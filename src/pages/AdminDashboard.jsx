import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, FolderGit2, Activity, Settings, Shield, Plus, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import CustomerManagement from './CustomerManagement';
import UserManagement from './UserManagement';
import { useAuth } from '../context/AuthContext';
import { getAllProjects, getCustomers, deleteProject, subscribeToAllProjects } from '../services/supabaseDb';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allProjects, setAllProjects] = useState([]);
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        loadData();
        const unsubscribe = subscribeToAllProjects(setAllProjects);
        return () => unsubscribe();
    }, []);

    const loadData = async () => {
        const [projectsData, customersData] = await Promise.all([
            getAllProjects(),
            getCustomers()
        ]);
        setAllProjects(projectsData);
        setCustomers(customersData);
    };

    const handleDeleteProject = async (project) => {
        if (!confirm(`Are you sure you want to delete project "${project.name}"?`)) {
            return;
        }
        try {
            await deleteProject(project.id);
        } catch (error) {
            alert('Error deleting project: ' + error.message);
        }
    };

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer?.name || customerId;
    };

    const stats = [
        { title: 'Total Customers', value: customers.length.toString(), icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { title: 'Active Projects', value: allProjects.length.toString(), icon: FolderGit2, color: 'text-green-400', bg: 'bg-green-500/10' },
        { title: 'System Status', value: 'Healthy', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'customers':
                return <CustomerManagement />;
            case 'users':
                return (
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                        <UserManagement />
                    </div>
                );
            case 'projects':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
                                <FolderGit2 className="w-8 h-8 text-green-400" />
                                All Projects
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="group relative bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-300"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-green-500/10 rounded-lg">
                                            <FolderGit2 className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDeleteProject(project)}
                                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                                    <p className="text-sm text-gray-400 mb-4">{project.type} Project</p>

                                    <div className="space-y-2 pt-4 border-t border-slate-700/50">
                                        <div className="flex items-center text-sm text-gray-400">
                                            <Building2 className="w-4 h-4 mr-2" />
                                            {getCustomerName(project.customer_id)}
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${project.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'overview':
            default:
                return (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                        {index === 3 && (
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                                    <p className="text-gray-400 text-sm">{stat.title}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                onClick={() => setActiveTab('customers')}
                                className="group cursor-pointer bg-gradient-to-br from-blue-900/20 to-slate-900/20 border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <Building2 className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Manage Customers</h3>
                                <p className="text-gray-400">Create new client workspaces, manage access, and configure environments.</p>
                            </div>

                            <div
                                onClick={() => setActiveTab('users')}
                                className="group cursor-pointer bg-gradient-to-br from-purple-900/20 to-slate-900/20 border border-slate-700/50 hover:border-purple-500/50 rounded-xl p-6 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <Users className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                                <p className="text-gray-400">Oversee user accounts, assign roles, and manage permissions across the platform.</p>
                            </div>
                        </div>

                        {/* Recent Activity (Mock) */}
                        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Recent System Activity</h3>
                            <div className="space-y-4">
                                {[
                                    { action: 'New Customer Created', subject: 'Global Ports', time: '2 hours ago', user: 'Admin' },
                                    { action: 'Project Deployed', subject: 'RTG Maintenance (Eurogate)', time: '5 hours ago', user: 'System' },
                                    { action: 'User Role Updated', subject: 'John Doe -> Operator', time: '1 day ago', user: 'Manager' },
                                ].map((activity, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">{activity.action}</p>
                                                <p className="text-xs text-gray-400">{activity.subject}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">{activity.time}</p>
                                            <p className="text-xs text-gray-500">{activity.user}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-400" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Spidercord Admin
                        </span>
                    </h1>
                    <p className="text-gray-400 mt-2">Super Admin Console</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Customers
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Projects
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;
