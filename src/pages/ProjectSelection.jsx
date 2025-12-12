import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FolderGit2, Plus, ArrowRight, ArrowLeft, Search, Box } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import Modal from '../components/Modal';
import { getCustomerProjects, createProject, subscribeToCustomerProjects } from '../services/supabaseDb';

const ProjectSelection = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, hasAccessToCustomer, userRole } = useAuth();
    const { selectProject } = useProject();

    // State
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clientInfo, setClientInfo] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectType, setNewProjectType] = useState('RTG');
    const [customProjectType, setCustomProjectType] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    // Load Data
    useEffect(() => {
        // Get client from URL param or localStorage
        let clientId = searchParams.get('client');
        const storedClient = localStorage.getItem('selectedClient');

        if (!clientId && storedClient) {
            try {
                const parsed = JSON.parse(storedClient);
                clientId = parsed.id;
            } catch (e) {
                console.error("Error parsing stored client", e);
            }
        }

        if (!clientId) {
            console.warn("No client ID found, redirecting to home");
            navigate('/');
            return;
        }

        // Access Control: Check if user has access to this customer
        if (!hasAccessToCustomer(clientId)) {
            console.warn(`User does not have access to customer: ${clientId}`);
            alert('Access Denied: You do not have permission to access this workspace.');
            navigate('/');
            return;
        }

        if (storedClient) {
            try {
                setClientInfo(JSON.parse(storedClient));
            } catch (e) { /* ignore */ }
        }

        // Load projects for this customer
        console.log("Loading projects for client:", clientId);
        loadProjects(clientId);

        // Subscribe to real-time updates
        const unsubscribe = subscribeToCustomerProjects((data) => {
            setProjects(data);
            setLoading(false);
        }, clientId);

        return () => unsubscribe();
    }, [searchParams, navigate, hasAccessToCustomer]);

    const loadProjects = async (clientId) => {
        setLoading(true);
        const data = await getCustomerProjects(clientId);
        setProjects(data);
        setLoading(false);
    };

    const handleSelectProject = (project) => {
        if (project.type === 'System') {
            navigate('/admin');
            return;
        }

        // Feature Flag: Only RTG projects are currently supported
        const supportedTypes = ['RTG'];

        // You can also check status if preferred: project.status === 'Active'
        if (!supportedTypes.includes(project.type)) {
            alert(`🚧 Project Not Available\n\nThe "${project.name}" workspace has not been created yet.\nPlease contact your administrator.`);
            return;
        }

        // Proceed for supported projects
        selectProject(project);
        navigate('/dashboard');
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const finalType = newProjectType === 'Custom' ? customProjectType : newProjectType;

            if (!finalType.trim()) {
                alert('Please specify a project type');
                return;
            }

            await createProject({
                customer_id: clientInfo.id,
                name: newProjectName,
                type: finalType,
                description: newProjectDescription,
                status: 'Active'
            });
            setShowCreateModal(false);
            setNewProjectName('');
            setNewProjectDescription('');
            setNewProjectType('RTG');
            setCustomProjectType('');
        } catch (error) {
            alert('Error creating project: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{
            backgroundColor: '#0a0a12',
        }}>
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <button
                            onClick={() => navigate('/clients')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Switch Workspace
                        </button>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                {clientInfo?.name || 'Client'}
                            </span>
                            <span className="text-gray-600 font-light">/</span>
                            <span>Projects</span>
                        </h1>
                        <p className="text-gray-400 mt-2">Manage and access your deployed projects</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors w-64"
                            />
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-600/25 font-medium"
                        >
                            <Plus className="w-4 h-4" /> New Project
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => handleSelectProject(project)}
                                className="group bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 cursor-pointer hover:bg-slate-800/60 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p - 3 rounded - lg ${project.type === 'RTG' ? 'bg-blue-500/10 text-blue-400' :
                                        'bg-purple-500/10 text-purple-400'
                                        } `}>
                                        {project.type === 'RTG' ? <Box className="w-6 h-6" /> : <FolderGit2 className="w-6 h-6" />}
                                    </div>
                                    <span className={`px - 2 py - 1 rounded text - xs font - medium ${project.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                        } `}>
                                        {project.status}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-gray-400 mb-6">
                                    {project.type} Operations Project
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-slate-700/50">
                                    <span>Updated {project.lastUpdate}</span>
                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-blue-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                        <FolderGit2 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
                        <p className="text-gray-400 mb-6">This workspace doesn't have any projects yet.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Create First Project
                        </button>
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Project"
            >
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                        <input
                            type="text"
                            required
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Summer Maintenance 2025"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Project Type</label>
                        <select
                            value={newProjectType}
                            onChange={(e) => setNewProjectType(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="RTG">RTG Operations</option>
                            <option value="STS">STS Operations</option>
                            <option value="MHC">Mobile Harbor Cranes</option>
                            <option value="RS">Reach Stackers (RS)</option>
                            <option value="ECH">Empty Container Handlers (ECH)</option>
                            <option value="TT">Terminal Tractors (TT)</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Vessels">Vessel Operations</option>
                            <option value="Construction">Construction</option>
                            <option value="Audit">Audit</option>
                            <option value="Custom">Other (Custom Type)</option>
                        </select>

                        {newProjectType === 'Custom' && (
                            <div className="mt-2">
                                <label className="block text-xs text-blue-400 mb-1 ml-1">Specify Custom Type</label>
                                <input
                                    type="text"
                                    value={customProjectType}
                                    onChange={(e) => setCustomProjectType(e.target.value)}
                                    className="w-full bg-slate-800/80 border border-blue-500/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-400 placeholder-gray-500 transition-all animate-in fade-in slide-in-from-top-1"
                                    placeholder="e.g., Drone Inspection, Warehouse..."
                                    required
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                        <textarea
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Brief description of the project..."
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg"
                        >
                            Deploy Project
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProjectSelection;
