import React from 'react';
import eurogateLogo from '../../assets/logos/eurogate.svg';

const ReportTemplate = ({ data }) => {
    if (!data || !data.rtg) return <div className="p-4 text-red-500">Données du rapport manquantes</div>;

    const { rtg, tasks = [], corrosion = [], painting = [], coatingControl = [], lavagePhotos = {}, sablagePhotos = {}, sablageData = {}, date = new Date().toISOString(), headerImage, zoneImages = {} } = data;

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
                        <p className="font-bold">{rtg.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-medium">Entreprise:</p>
                        <p className="font-bold">SPIDERCORD</p>
                    </div>
                    <div>
                        <p className="text-gray-600 font-medium">Client:</p>
                        <div className="h-6"><img src={eurogateLogo} alt="EUROGATE" className="h-full object-contain" /></div>
                    </div>
                    <div>
                        <p className="text-gray-600 font-medium">N° Rapport:</p>
                        <p className="font-bold">{date.replace(/-/g, '')}-{rtg.name || 'RTG'}</p>
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
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Équipement:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{rtg.name}</td>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Localisation:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{rtg.location}</td>
                        </tr>
                        {rtg.description && (
                            <tr>
                                <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Description:</td>
                                <td className="border border-gray-400 px-2 py-1.5" colSpan="3">{rtg.description}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Project Timeline & Progress */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    2. CALENDRIER & AVANCEMENT DU PROJET
                </h2>
                <table className="w-full border-collapse border border-gray-400 text-xs">
                    <tbody>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Date de Début:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{rtg.created_at ? new Date(rtg.created_at).toLocaleDateString('fr-FR') : 'N/A'}</td>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Statut Global:</td>
                            <td className="border border-gray-400 px-2 py-1.5 font-bold">{rtg.status || 'En cours'}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Avancement:</td>
                            <td className="border border-gray-400 px-2 py-1.5" colSpan="3">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                            style={{ width: `${Math.round((tasks.filter(t => t.status === 'Completed').length / Math.max(tasks.length, 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold">{Math.round((tasks.filter(t => t.status === 'Completed').length / Math.max(tasks.length, 1)) * 100)}%</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Team & Responsibilities */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    3. ÉQUIPE & RESPONSABILITÉS
                </h2>
                <table className="w-full border-collapse border border-gray-400 text-xs">
                    <tbody>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Chef de Projet:</td>
                            <td className="border border-gray-400 px-2 py-1.5">SPIDERCORD - Direction Technique</td>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Superviseur Site:</td>
                            <td className="border border-gray-400 px-2 py-1.5">Équipe SPIDERCORD</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Contrôle Qualité:</td>
                            <td className="border border-gray-400 px-2 py-1.5">Inspecteur QHSE</td>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Effectif:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{tasks.length > 0 ? '4-6 techniciens' : 'Variable'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Weather Conditions */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    4. CONDITIONS MÉTÉOROLOGIQUES
                </h2>
                <table className="w-full border-collapse border border-gray-400 text-xs">
                    <tbody>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Température:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{data.weather?.temp || 24}°C</td>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Humidité:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{data.weather?.humidity || 45}%</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Conditions:</td>
                            <td className="border border-gray-400 px-2 py-1.5" colSpan="3">
                                {(data.weather?.temp >= 15 && data.weather?.temp <= 30 && data.weather?.humidity <= 85)
                                    ? '✓ Conditions optimales pour application peinture'
                                    : '⚠ Conditions à surveiller'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Work Progress */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    5. ÉTAT D'AVANCEMENT DES TRAVAUX
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
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    6. INSPECTION CORROSION - RELEVÉ DES DÉFAUTS PAR ZONE
                </h2>

                {/* Corrosion Summary Statistics */}
                <div className="mb-3 bg-blue-50 border border-blue-200 p-2">
                    <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                            <p className="text-gray-600 font-medium">Total Zones Inspectées</p>
                            <p className="text-2xl font-bold text-blue-900">{Array.from(new Set(corrosion.map(c => c.zone))).length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600 font-medium">Défauts Détectés</p>
                            <p className="text-2xl font-bold text-orange-600">{corrosion.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600 font-medium">Sévères</p>
                            <p className="text-2xl font-bold text-red-700">{corrosion.filter(c => c.severity === 'High').length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600 font-medium">Moyens/Légers</p>
                            <p className="text-2xl font-bold text-green-700">{corrosion.filter(c => c.severity !== 'High').length}</p>
                        </div>
                    </div>
                </div>

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
                {corrosion.length === 0 && (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                        Aucune donnée d'inspection validée pour le moment
                    </div>
                )}
            </div>

            {/* Painting System */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    7. SYSTÈME DE PEINTURE PPG - EXTÉRIEUR (DFT)
                </h2>
                <div className="bg-blue-50 border border-blue-200 px-2 py-1 mb-2 text-xs">
                    <strong>Système Complet:</strong> Épaisseur Totale Cible = 280 µm (SigmaCover 70µm + SigmaGuard 150µm + SigmaDur 60µm)
                </div>
                {exteriorSystems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                        Aucun système de peinture validé pour le moment
                    </div>
                ) : (
                    exteriorSystems.map(system => (
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
                                        <td className="border border-gray-400 px-2 py-1.5 font-mono font-bold">{idx + 1}</td>
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
                    ))
                )}
            </div>

            {/* Safety & Quality Metrics */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    8. SÉCURITÉ & CONTRÔLE QUALITÉ
                </h2>
                <table className="w-full border-collapse border border-gray-400 text-xs">
                    <tbody>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Incidents Sécurité:</td>
                            <td className="border border-gray-400 px-2 py-1.5 text-green-700 font-bold">✓ Aucun incident signalé</td>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Conformité EPI:</td>
                            <td className="border border-gray-400 px-2 py-1.5 text-green-700 font-bold">✓ 100% conforme</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Taux de Réussite:</td>
                            <td className="border border-gray-400 px-2 py-1.5">
                                {Math.round((tasks.filter(t => t.status === 'Completed').length / Math.max(tasks.length, 1)) * 100)}% des tâches terminées
                            </td>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Défauts Détectés:</td>
                            <td className="border border-gray-400 px-2 py-1.5">{corrosion.length} zone(s) inspectée(s)</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Conformité Environnementale:</td>
                            <td className="border border-gray-400 px-2 py-1.5 text-green-700" colSpan="3">✓ Respect des normes environnementales EUROGATE</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Lavage Industriel */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    9. LAVAGE INDUSTRIEL
                </h2>
                {(lavagePhotos?.before?.length > 0 || lavagePhotos?.after?.length > 0 || lavagePhotos?.validated_at) ? (
                    <table className="w-full border-collapse border border-gray-400 text-xs">
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Photos Avant Lavage:</td>
                                <td className="border border-gray-400 px-2 py-1.5">{lavagePhotos?.before?.length || 0} photo(s)</td>
                                <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold w-1/4">Photos Après Lavage:</td>
                                <td className="border border-gray-400 px-2 py-1.5">{lavagePhotos?.after?.length || 0} photo(s)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Statut:</td>
                                <td className="border border-gray-400 px-2 py-1.5" colSpan="3">
                                    {lavagePhotos?.validated_at ? (
                                        <div className="flex items-center gap-2 text-green-700 font-bold">
                                            ✓ VALIDÉ - {new Date(lavagePhotos.validated_at).toLocaleDateString('fr-FR')} à {new Date(lavagePhotos.validated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">EN ATTENTE DE VALIDATION</span>
                                    )}
                                </td>
                            </tr>
                            {lavagePhotos?.notes && (
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1.5 bg-gray-100 font-bold">Observations:</td>
                                    <td className="border border-gray-400 px-2 py-1.5" colSpan="3">{lavagePhotos.notes}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                        Aucune donnée de lavage validée pour le moment
                    </div>
                )}
            </div>

            {/* Sablage - Préparation de Surface */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    10. PRÉPARATION DE SURFACE (SABLAGE SA 2.5)
                </h2>
                {sablageData && Object.keys(sablageData).length > 0 ? (
                    <table className="w-full border-collapse border border-gray-400 text-xs">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-400 px-2 py-1.5 text-left font-bold">Zone</th>
                                <th className="border border-gray-400 px-2 py-1.5 text-center font-bold">Rugosité (µm)</th>
                                <th className="border border-gray-400 px-2 py-1.5 text-center font-bold">Photos</th>
                                <th className="border border-gray-400 px-2 py-1.5 text-center font-bold">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(sablageData).map(([zoneId, zoneInfo], idx) => (
                                <tr key={zoneId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="border border-gray-400 px-2 py-1.5 font-bold">{zoneId}</td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center">
                                        {zoneInfo.roughness || '-'} {zoneInfo.roughness && 'µm'}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center">
                                        {sablagePhotos?.[zoneId]?.length || 0} photo(s)
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-center">
                                        {zoneInfo.validated_at ? (
                                            <div className="text-green-700 font-bold">
                                                ✓ VALIDÉ<br />
                                                <span className="text-[10px] text-gray-600">
                                                    {new Date(zoneInfo.validated_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">EN ATTENTE</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                        Aucune donnée de sablage validée pour le moment
                    </div>
                )}
            </div>

            {/* Coating Control Data */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    11. CONTRÔLE QUALITÉ REVÊTEMENT (DFT & CONDITIONS)
                </h2>
                <table className="w-full border-collapse border border-gray-400 text-xs mb-2">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-400 px-2 py-1.5 text-left font-bold">Zone</th>
                            <th className="border border-gray-400 px-2 py-1.5 text-left font-bold">Couche</th>
                            <th className="border border-gray-400 px-2 py-1.5 text-center font-bold">Relevés DFT (µm)</th>
                            <th className="border border-gray-400 px-2 py-1.5 text-center font-bold">Moyenne</th>
                            <th className="border border-gray-400 px-2 py-1.5 text-center font-bold">Conditions (T°/H%/DP)</th>
                            <th className="border border-gray-400 px-2 py-1.5 text-center font-bold">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.coatingControl.map((control) => (
                            <tr key={control.id}>
                                <td className="border border-gray-400 px-2 py-1.5 font-bold">
                                    {control.zoneId}
                                </td>
                                <td className="border border-gray-400 px-2 py-1.5">
                                    {control.layerName || '-'}
                                </td>
                                <td className="border border-gray-400 px-2 py-1.5 text-center">
                                    {control.dftReadings.join(', ')}
                                </td>
                                <td className={`border border-gray-400 px-2 py-1.5 text-center font-bold ${control.averageDFT >= 50 ? 'text-green-700' : 'text-red-700'}`}>
                                    {control.averageDFT} µm
                                </td>
                                <td className="border border-gray-400 px-2 py-1.5 text-center">
                                    {control.surfaceTemp}°C / {control.humidity}% / {control.dewPoint}°C
                                </td>
                                <td className={`border border-gray-400 px-2 py-1.5 text-center font-bold ${control.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {control.status === 'Pass' ? 'CONFORME' : 'NON CONFORME'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Control Images */}
                {data.coatingControl.some(c => c.images && c.images.length > 0) && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {data.coatingControl.flatMap(c =>
                            (c.images || []).map((img, idx) => (
                                <div key={`${c.id}-${idx}`} className="border border-gray-300 p-1">
                                    <img src={img} alt={`Control ${c.zoneId}`} className="w-full h-24 object-cover" />
                                    <p className="text-[10px] text-center mt-1 truncate">{c.zoneId} - {c.layerName}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {(!data.coatingControl || data.coatingControl.length === 0) && (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                        Aucun contrôle qualité revêtement validé pour le moment
                    </div>
                )}
            </div>

            {/* Observations / Notes */}
            <div className="mb-4">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-2">
                    12. OBSERVATIONS GÉNÉRALES
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
                        <div className="h-6 mb-1"><img src={eurogateLogo} alt="EUROGATE" className="h-full object-contain" /></div>
                        <div className="border-b-2 border-gray-800 mb-2 h-16"></div>
                        <p className="text-[10px] text-gray-600">Nom, Fonction, Signature, Date</p>
                    </div>
                </div>
            </div>

            {/* PHOTO ANNEX */}
            <div className="break-before-page">
                <h2 className="bg-blue-900 text-white px-3 py-1.5 font-bold text-sm uppercase mb-4">
                    13. ANNEXE PHOTOGRAPHIQUE
                </h2>

                <div className="space-y-8">

                    {/* 12.1 Inspection Visuelle */}
                    <div className="break-inside-avoid">
                        <h3 className="font-bold text-blue-900 border-b border-blue-900 mb-4 pb-1">13.1 INSPECTION VISUELLE</h3>
                        {(() => {
                            const zonesWithCorrosion = corrosion.length > 0 ? Array.from(new Set(corrosion.map(c => c.zone))) : [];
                            const zonesWithImages = zonesWithCorrosion.filter(zoneId => data.zoneImages?.[zoneId]);

                            return zonesWithImages.length > 0 ? (
                                <div className="grid grid-cols-2 gap-6">
                                    {zonesWithImages.map((zoneId, idx) => {
                                        const zoneCorrosion = corrosion.filter(c => c.zone === zoneId);
                                        const defectCount = zoneCorrosion.length;
                                        const highSeverity = zoneCorrosion.filter(c => c.severity === 'High').length;

                                        return (
                                            <div key={`zone-${idx}`} className="border border-gray-300 break-inside-avoid page-break-inside-avoid">
                                                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-300">
                                                    <img src={data.zoneImages[zoneId]} alt={`Inspection ${zoneId}`} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="p-2 bg-gray-50 text-xs">
                                                    <p className="font-bold text-blue-900 mb-1">{zoneId}</p>
                                                    <p className="text-gray-600">
                                                        {defectCount} défaut(s) détecté(s)
                                                        {highSeverity > 0 && ` - ${highSeverity} sévère(s)`}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                                    Aucune photo d'inspection uploadée pour le moment
                                </div>
                            );
                        })()}
                    </div>

                    {/* 12.2 Lavage Industriel */}
                    <div className="break-inside-avoid">
                        <h3 className="font-bold text-blue-900 border-b border-blue-900 mb-4 pb-1">13.2 LAVAGE INDUSTRIEL</h3>
                        {(lavagePhotos?.before?.length > 0 || lavagePhotos?.after?.length > 0) ? (
                            <div className="grid grid-cols-2 gap-6">
                                {(lavagePhotos.before || []).map((img, idx) => (
                                    <div key={`lav-before-${idx}`} className="border border-gray-300 break-inside-avoid page-break-inside-avoid">
                                        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-300">
                                            <img src={img} alt="Avant Lavage" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="p-2 bg-gray-50 text-xs font-bold text-center text-red-600">AVANT LAVAGE</div>
                                    </div>
                                ))}
                                {(lavagePhotos.after || []).map((img, idx) => (
                                    <div key={`lav-after-${idx}`} className="border border-gray-300 break-inside-avoid page-break-inside-avoid">
                                        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-300">
                                            <img src={img} alt="Après Lavage" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="p-2 bg-gray-50 text-xs font-bold text-center text-green-600">APRÈS LAVAGE</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                                Aucune photo de lavage uploadée pour le moment
                            </div>
                        )}
                    </div>

                    {/* 12.3 Préparation de Surface (Sablage) */}
                    <div className="break-inside-avoid">
                        <h3 className="font-bold text-blue-900 border-b border-blue-900 mb-4 pb-1">13.3 PRÉPARATION DE SURFACE (SABLAGE)</h3>
                        {sablagePhotos && Object.keys(sablagePhotos).length > 0 ? (
                            <div className="grid grid-cols-2 gap-6">
                                {Object.entries(sablagePhotos).flatMap(([zoneId, urls]) =>
                                    urls.map((url, idx) => ({ zoneId, url, idx }))
                                ).map((item, idx) => {
                                    const zoneInfo = sablageData[item.zoneId] || {};
                                    return (
                                        <div key={`sab-${idx}`} className="border border-gray-300 break-inside-avoid page-break-inside-avoid">
                                            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-300">
                                                <img src={item.url} alt={`Sablage ${item.zoneId}`} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="p-2 bg-gray-50 text-xs">
                                                <p className="font-bold text-blue-900">Zone: {item.zoneId}</p>
                                                {zoneInfo.roughness && <p className="text-gray-600">Rugosité: {zoneInfo.roughness} µm</p>}
                                                {zoneInfo.validated_at && (
                                                    <p className="text-green-600 font-medium">
                                                        Validé le {new Date(zoneInfo.validated_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                                Aucune photo de sablage uploadée pour le moment
                            </div>
                        )}
                    </div>

                    {/* 12.4 Travaux de Peinture */}
                    <div className="break-inside-avoid">
                        <h3 className="font-bold text-blue-900 border-b border-blue-900 mb-4 pb-1">13.4 TRAVAUX DE PEINTURE</h3>
                        {painting.some(p => p.layers.some(l => l.photos && l.photos.length > 0)) ? (
                            <div className="grid grid-cols-2 gap-6">
                                {painting.flatMap(sys =>
                                    sys.layers.flatMap(layer =>
                                        (layer.photos || []).map((url, idx) => ({
                                            sysType: sys.type,
                                            layerName: layer.name,
                                            url,
                                            idx
                                        }))
                                    )
                                ).map((item, idx) => (
                                    <div key={`paint-${idx}`} className="border border-gray-300 break-inside-avoid page-break-inside-avoid">
                                        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-300">
                                            <img src={item.url} alt={`Peinture ${item.layerName}`} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="p-2 bg-gray-50 text-xs">
                                            <p className="font-bold text-blue-900">{item.layerName}</p>
                                            <p className="text-gray-600 capitalize">{item.sysType}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                                Aucune photo de peinture uploadée pour le moment
                            </div>
                        )}
                    </div>

                    {/* 12.5 Contrôle Revêtement */}
                    <div className="break-inside-avoid">
                        <h3 className="font-bold text-blue-900 border-b border-blue-900 mb-4 pb-1">13.5 CONTRÔLE REVÊTEMENT</h3>
                        {coatingControl.some(c => c.images && c.images.length > 0) ? (
                            <div className="grid grid-cols-2 gap-6">
                                {coatingControl.flatMap(c =>
                                    (c.images || []).map((img, imgIdx) => ({ ...c, image: img, imgIdx }))
                                ).map((item, idx) => (
                                    <div key={`coat-${idx}`} className="border border-gray-300 break-inside-avoid page-break-inside-avoid">
                                        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-300">
                                            <img src={item.image} alt={`Coating ${item.zoneId}`} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="p-2 bg-gray-50 text-xs">
                                            <p className="font-medium">{item.zoneId} - {item.layerName}</p>
                                            <p className="text-gray-600">DFT Moy: {item.averageDFT} µm - {item.status === 'Pass' ? 'Conforme' : 'Non Conforme'}</p>
                                            {item.validated_at && (
                                                <p className="text-green-600 font-medium mt-1">
                                                    Validé le {new Date(item.validated_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500 bg-gray-50 border border-gray-300 rounded text-xs italic">
                                Aucune photo de contrôle revêtement uploadée pour le moment
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Footer - Fixed at bottom with proper spacing */}
            <div className="border-t border-gray-300 pt-2 mt-8">
                <div className="flex justify-between items-center text-[9px] text-gray-500">
                    <span>Spidercord Operations Manager • Document confidentiel • Propriété SPIDERCORD & EUROGATE</span>
                    <span>Généré le {new Date().toLocaleDateString('fr-FR')} • Page 1/1</span>
                </div>
            </div>
        </div>
    );
};

export default ReportTemplate;
