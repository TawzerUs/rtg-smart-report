import React from 'react';

const ReportTemplate = ({ data }) => {
    const { rtg, tasks, corrosion, painting, date, headerImage } = data;

    // Filter only exterior systems
    const exteriorSystems = painting.filter(p => p.type === 'exterior');

    return (
        <div className="bg-white text-black p-6 max-w-[210mm] mx-auto min-h-[297mm] relative text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header Image Space */}
            <div className="mb-4 min-h-[120px] flex items-center justify-center border-2 border-dashed border-gray-300">
                {headerImage ? (
                    <img src={headerImage} alt="Report Header" className="max-h-[120px] w-full object-contain" />
                ) : (
                    <p className="text-gray-400 text-xs">En-tête du rapport (à configurer dans Paramètres)</p>
                )}
            </div>

            {/* Professional Header - Centered Title with Details on Same Line */}
            <div className="border-b-4 border-blue-900 pb-3 mb-4">
                <h1 className="text-2xl font-bold uppercase text-blue-900 text-center mb-3">RAPPORT TECHNIQUE</h1>
                <p className="text-center text-sm text-gray-700 font-medium mb-3">Projet Anti-Corrosion RTG - Eurogate</p>
                <div className="grid grid-cols-5 gap-2 text-xs">
                    <div>
                        <p className="text-gray-600 font-medium">Projet:</p>
                        <p className="font-bold">RTG {rtg.id}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-medium">Entreprise:</p>
                        <p className="font-bold">SPIDERCORD</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-medium">Client:</p>
                        <p className="font-bold">EUROGATE</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-medium">N° Rapport:</p>
                        <p className="font-bold">{date.replace(/-/g, '')}-{rtg.id}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-medium">Date:</p>
                        <p className="font-bold">{new Date(date).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
            </div>

            {/* Equipment Information */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    1. IDENTIFICATION DE L'ÉQUIPEMENT
                </h2>
                <table className="w-full border-collapse border border-gray-400 text-xs">
                    <tbody>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Équipement ID:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{rtg.id}</td>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Marque / Modèle:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{rtg.brand}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Capacité:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{rtg.capacity}</td>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Localisation:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{rtg.location}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Work Progress */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    2. ÉTAT D'AVANCEMENT DES TRAVAUX
                </h2>
                <table className="w-full border-collapse border border-gray-400 text-xs">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-400 px-2 py-1.5 text-left font-bold">Module de Travail</th>
                            <th className="border border-gray-400 px-2 py-1.5 text-center font-bold w-32">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task, idx) => (
                            <tr key={task.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-400 px-2 py-1.5">{task.title}</td>
                                <td className={`border border-gray-400 px-2 py-1.5 text-center font-bold ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {task.status === 'Completed' ? '✓ TERMINÉ' : task.status === 'In Progress' ? '⟳ EN COURS' : '○ EN ATTENTE'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Corrosion Inspection - Grouped by Zone */}
            {corrosion.length > 0 && (
                <div className="mb-4">
                    <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                        3. INSPECTION CORROSION - RELEVÉ DES DÉFAUTS PAR ZONE
                    </h2>
                    {/* Group corrosion by zone */}
                    {Array.from(new Set(corrosion.map(c => c.zone))).sort().map(zone => {
                        const zoneDefects = corrosion.filter(c => c.zone === zone);
                        return (
                            <div key={zone} className="mb-3">
                                <div className="bg-gray-200 px-2 py-1 font-bold text-xs border-x border-t border-gray-400">
                                    {zone} - {zoneDefects.length} défaut(s) détecté(s)
                                </div>
                                <table className="w-full border-collapse border border-gray-400 text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-400 px-2 py-1.5 text-left font-bold w-24">Sévérité</th>
                                            <th className="border border-gray-400 px-2 py-1.5 text-left font-bold">Description / Observations</th>
                                            <th className="border border-gray-400 px-2 py-1.5 text-left font-bold w-24">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {zoneDefects.map((item, idx) => (
                                            <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className={`border border-gray-400 px-2 py-1.5 font-bold ${item.severity === 'High' ? 'text-red-700' :
                                                    item.severity === 'Medium' ? 'text-orange-600' : 'text-green-700'
                                                    }`}>
                                                    {item.severity === 'High' ? '● SÉVÈRE' : item.severity === 'Medium' ? '● MOYEN' : '● LÉGER'}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1.5">{item.notes || 'Aucune observation'}</td>
                                                <td className="border border-gray-400 px-2 py-1.5 text-xs">{item.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                    {/* Corrosion Images - Show first 3 if available */}
                    {corrosion.some(c => c.image) && (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            {corrosion.filter(c => c.image).slice(0, 3).map((item, idx) => (
                                <div key={idx} className="border border-gray-300 p-1">
                                    <img src={item.image} alt={`Corrosion ${item.zone}`} className="w-full h-24 object-cover" />
                                    <p className="text-[10px] text-center mt-1">{item.zone}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Painting System */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    4. SYSTÈME DE PEINTURE PPG - EXTÉRIEUR (DFT)
                </h2>
                <div className="bg-blue-50 border border-blue-200 px-2 py-1 mb-2 text-xs">
                    <strong>Système Complet:</strong> Épaisseur Totale Cible = 280 µm (SigmaCover 70µm + SigmaGuard 150µm + SigmaDur 60µm)
                </div>
                {exteriorSystems.map(system => (
                    <table key={system.id} className="w-full border-collapse border border-gray-400 text-xs">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-400 px-2 py-1.5 text-left font-bold w-12">ID</th>
                                <th className="border border-gray-400 px-2 py-1.5 text-left font-bold">Produit / Couche</th>
                                <th className="border border-gray-400 px-2 py-1.5 text-center font-bold w-20">Cible (µm)</th>
                                <th className="border border-gray-400 px-2 py-1.5 text-left font-bold w-16">Zone</th>
                                <th className="border border-gray-400 px-2 py-1.5 text-left font-bold w-28">Conditions</th>
                                <th className="border border-gray-400 px-2 py-1.5 text-left font-bold w-36">Validation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {system.layers.map((layer, idx) => (
                                <tr key={layer.id} className={
                                    layer.status === 'Completed' ? 'bg-green-50' :
                                        (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')
                                }>
                                    <td className="border border-gray-400 px-2 py-1.5 font-mono font-bold">{layer.id}</td>
                                    <td className="border border-gray-400 px-2 py-1.5 font-medium">{layer.name}</td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center font-bold">{layer.target}</td>
                                    <td className="border border-gray-400 px-2 py-1.5">{layer.validatedZone || '-'}</td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-xs">
                                        {layer.weather ? (
                                            <div>
                                                <div>{layer.weather.temp}°C</div>
                                                <div className="text-gray-600">{layer.weather.humidity}% HR</div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5">
                                        {layer.status === 'Completed' ? (
                                            <div>
                                                <div className="text-green-700 font-bold">✓ VALIDÉ</div>
                                                {layer.validatedAt && (
                                                    <div className="text-[10px] text-gray-600">
                                                        {new Date(layer.validatedAt).toLocaleString('fr-FR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">EN ATTENTE</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))}
            </div>

            {/* Observations / Notes */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    5. OBSERVATIONS GÉNÉRALES
                </h2>
                <div className="border border-gray-400 p-3 min-h-[60px] text-xs bg-gray-50">
                    {data.observations ? (
                        <p className="whitespace-pre-wrap">{data.observations}</p>
                    ) : (
                        <p className="text-gray-600 italic">Aucune observation particulière à signaler.</p>
                    )}
                </div>
            </div>

            {/* Signatures */}
            <div className="mt-8 border-t-2 border-gray-400 pt-4 mb-16">
                <div className="grid grid-cols-2 gap-12">
                    <div>
                        <p className="font-bold mb-6 uppercase text-xs">POUR L'ENTREPRISE</p>
                        <p className="text-xs mb-1">SPIDERCORD</p>
                        <div className="border-b-2 border-gray-800 mb-2 h-16"></div>
                        <p className="text-[10px] text-gray-600">Nom, Fonction, Signature, Date</p>
                    </div>
                    <div>
                        <p className="font-bold mb-6 uppercase text-xs">POUR LE CLIENT</p>
                        <p className="text-xs mb-1">EUROGATE</p>
                        <div className="border-b-2 border-gray-800 mb-2 h-16"></div>
                        <p className="text-[10px] text-gray-600">Nom, Fonction, Signature, Date</p>
                    </div>
                </div>
            </div>

            {/* Footer - Fixed at bottom with proper spacing */}
            <div className="border-t border-gray-300 pt-2 mt-8">
                <div className="flex justify-between items-center text-[9px] text-gray-500">
                    <span>RTG Smart Report • Document confidentiel • Propriété SPIDERCORD & EUROGATE</span>
                    <span>Généré le {new Date().toLocaleDateString('fr-FR')} • Page 1/1</span>
                </div>
            </div>
        </div>
    );
};

export default ReportTemplate;
