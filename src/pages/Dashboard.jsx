import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import StatusBadge from '../components/StatusBadge';
import { ArrowRight, Calendar, Building2, Loader2, Package } from 'lucide-react';

const Dashboard = () => {
    const { rtgs, getRTGProgress, selectedProject, loading } = useProject();
    const navigate = useNavigate();

    // Get customer info from localStorage (set during client selection)
    const [customerInfo, setCustomerInfo] = React.useState(null);

    React.useEffect(() => {
        const storedProject = localStorage.getItem('selectedProject');
        const storedClient = localStorage.getItem('selectedClient');
        
        if (!storedProject) {
            navigate('/');
            return;
        }

        if (storedClient) {
            try {
                setCustomerInfo(JSON.parse(storedClient));
            } catch (e) {
                console.error('Failed to parse client info', e);
            }
        }
    }, [navigate]);

    // Dynamic project/customer name
    const projectName = selectedProject?.name || 'Project';
    const customerName = customerInfo?.name || 'Customer';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Dynamic logo or fallback icon */}
                    <div className="p-2 bg-white/5 rounded-lg border border-[var(--border-glass)]">
                        {customerInfo?.logo_url ? (
                            <img 
                                src={customerInfo.logo_url} 
                                alt={customerName} 
                                className="h-8 md:h-10 w-auto"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                        ) : null}
                        <Building2 
                            className="h-8 md:h-10 w-auto text-[var(--primary)]" 
                            style={{ display: customerInfo?.logo_url ? 'none' : 'block' }}
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gradient">Tableau de Bord RTG</h1>
                        <p className="text-[var(--text-muted)]">
                            {projectName} — {customerName}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                        <span className="text-sm text-[var(--text-muted)]">Total Équipements</span>
                        <p className="text-xl font-bold text-[var(--primary)]">{rtgs.length}</p>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-[var(--primary)]" />
                        <p className="text-[var(--text-muted)]">Chargement des équipements...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && rtgs.length === 0 && (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center max-w-md">
                        <Package className="w-16 h-16 mx-auto mb-4 text-[var(--text-dim)]" />
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">
                            Aucun équipement RTG
                        </h3>
                        <p className="text-[var(--text-muted)]">
                            Aucun équipement RTG n'a été ajouté à ce projet. 
                            Contactez un administrateur pour configurer la flotte.
                        </p>
                    </div>
                </div>
            )}

            {/* Fleet Grid */}
            {!loading && rtgs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rtgs.map((rtg) => {
                    const progress = getRTGProgress(rtg.id);
                    return (
                        <div
                            key={rtg.id}
                            onClick={() => navigate(`/rtg/${rtg.name}`)}
                            className="group relative p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] hover:border-[var(--primary)] transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                                            {rtg.name}
                                        </h3>
                                        {rtg.description && (
                                            <p className="text-sm text-[var(--text-muted)]">{rtg.description}</p>
                                        )}
                                    </div>
                                    <StatusBadge status={rtg.status} />
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[var(--text-muted)]">Avancement Global</span>
                                        <span className="text-[var(--primary)] font-bold">{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-[var(--bg-glass)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-[var(--text-muted)] pt-4 border-t border-[var(--border-glass)]">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>MAJ: {rtg.lastUpdate}</span>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}
        </div>
    );
};

export default Dashboard;
