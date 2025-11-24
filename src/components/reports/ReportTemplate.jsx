import React from 'react';

const ReportTemplate = ({ data }) => {
    const { rtg, tasks, corrosion, painting, date } = data;

    // Filter only exterior systems
    const exteriorSystems = painting.filter(p => p.type === 'exterior');

    return (
        <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-2xl relative text-sm leading-relaxed">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-500">LOGO</div>
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wider">Rapport Technique</h1>
                        <p className="text-gray-600 font-medium">Suivi de Projet RTG • Eurogate / Spidercord</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">Rapport N°: {date.replace(/-/g, '')}-{rtg.id}</p>
                    <p className="text-gray-600">Date: {date}</p>
                </div>
            </div>

            {/* 1. Equipment Identification */}
            <section className="mb-8">
                <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 text-[#00b8cc]">1. Identification Équipement</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-gray-600">Équipement ID:</span>
                        <span className="font-bold">{rtg.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-gray-600">Marque / Modèle:</span>
                        <span className="font-bold">{rtg.brand}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-gray-600">Capacité:</span>
                        <span className="font-bold">{rtg.capacity}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-gray-600">Localisation:</span>
                        <span className="font-bold">{rtg.location}</span>
                    </div>
                </div>
            </section>

            {/* 2. Executive Summary */}
            <section className="mb-8">
                <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 text-[#00b8cc]">2. Synthèse des Travaux</h2>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <p className="mb-2">
                        État d'avancement global des travaux sur l'équipement <strong>{rtg.id}</strong>.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        {tasks.map(task => (
                            <li key={task.id} className="flex justify-between w-full max-w-md">
                                <span>{task.title}</span>
                                <span className={`font-bold ${task.status === 'Completed' ? 'text-green-600' :
                                        task.status === 'In Progress' ? 'text-orange-500' : 'text-gray-500'
                                    }`}>{task.status === 'Completed' ? 'Terminé' : task.status === 'In Progress' ? 'En Cours' : 'En Attente'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* 3. Inspection Findings */}
            <section className="mb-8">
                <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 text-[#00b8cc]">3. Inspection Corrosion</h2>
                {corrosion.length === 0 ? (
                    <p className="text-gray-500 italic">Aucune corrosion majeure signalée.</p>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 text-xs uppercase">
                                <th className="p-2 border border-gray-200">Zone</th>
                                <th className="p-2 border border-gray-200">Sévérité</th>
                                <th className="p-2 border border-gray-200">Description</th>
                                <th className="p-2 border border-gray-200">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {corrosion.map(item => (
                                <tr key={item.id} className="text-sm">
                                    <td className="p-2 border border-gray-200 font-medium">{item.zone}</td>
                                    <td className={`p-2 border border-gray-200 font-bold ${item.severity === 'High' ? 'text-red-600' :
                                            item.severity === 'Medium' ? 'text-orange-500' : 'text-green-600'
                                        }`}>{item.severity === 'High' ? 'Sévère' : item.severity === 'Medium' ? 'Moyen' : 'Léger'}</td>
                                    <td className="p-2 border border-gray-200">{item.notes || 'N/A'}</td>
                                    <td className="p-2 border border-gray-200">{item.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* 4. Painting Data */}
            <section className="mb-8">
                <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 pb-1 text-[#00b8cc]">4. Système Peinture PPG Extérieur</h2>

                {exteriorSystems.map(system => (
                    <div key={system.id} className="mb-4">
                        <h3 className="font-bold text-gray-800 mb-3">Épaisseur Totale: 280 µm</h3>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 text-xs uppercase">
                                    <th className="p-2 border border-gray-200">Couche</th>
                                    <th className="p-2 border border-gray-200">Produit</th>
                                    <th className="p-2 border border-gray-200">Cible (µm)</th>
                                    <th className="p-2 border border-gray-200">Zone</th>
                                    <th className="p-2 border border-gray-200">Conditions</th>
                                    <th className="p-2 border border-gray-200">Validation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {system.layers.map(layer => (
                                    <tr key={layer.id} className="text-sm">
                                        <td className="p-2 border border-gray-200">{layer.id}</td>
                                        <td className="p-2 border border-gray-200">{layer.name}</td>
                                        <td className="p-2 border border-gray-200">{layer.target}</td>
                                        <td className="p-2 border border-gray-200">{layer.validatedZone || '-'}</td>
                                        <td className="p-2 border border-gray-200">
                                            {layer.weather ? `${layer.weather.temp}°C, ${layer.weather.humidity}%` : '-'}
                                        </td>
                                        <td className="p-2 border border-gray-200">
                                            {layer.status === 'Completed' ? (
                                                <div>
                                                    <span className="text-green-600 font-bold block">✓ Validé</span>
                                                    {layer.validatedAt && (
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(layer.validatedAt).toLocaleString('fr-FR')}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">En Attente</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </section>

            {/* Footer / Signatures */}
            <section className="mt-12 pt-8 border-t-2 border-gray-800 break-inside-avoid">
                <div className="grid grid-cols-2 gap-12">
                    <div>
                        <p className="font-bold mb-8">Pour l'Entreprise (Spidercord):</p>
                        <div className="border-b border-gray-400 mb-2"></div>
                        <p className="text-xs text-gray-500">Nom / Signature / Date</p>
                    </div>
                    <div>
                        <p className="font-bold mb-8">Pour le Client (Eurogate):</p>
                        <div className="border-b border-gray-400 mb-2"></div>
                        <p className="text-xs text-gray-500">Nom / Signature / Date</p>
                    </div>
                </div>
            </section>

            {/* Page Footer */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-400">
                Généré automatiquement par RTG Smart Report • Page 1/1
            </div>
        </div>
    );
};

export default ReportTemplate;
