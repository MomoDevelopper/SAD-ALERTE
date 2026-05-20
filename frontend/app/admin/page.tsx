"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBase, getStoredToken } from "../../lib/client-auth";

type Incident = {
  id: number;
  date_incident: string;
  type: string;
  description: string;
  gravite_ia: number | null;
  region: string | null;
  province: string | null;
  commune: string | null;
  chemin_fichier?: string | null;
  signalant_nom?: string | null;
  signalant_prenom?: string | null;
  signalant_email?: string | null;
  signalant_matricule?: string | null;
  signalant_unite?: string | null;
};

export default function DecideurPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState<Incident | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setError("Session absente. Connectez-vous.");
      setLoading(false);
      return;
    }

    fetch(`${getApiBase()}/api/incidents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Impossible de charger les incidents.");
        setIncidents(Array.isArray(data.incidents) ? data.incidents : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const nowLabel = useMemo(() => new Date().toLocaleString("fr-FR"), []);
  const criticalCount = incidents.filter((i) => (i.gravite_ia ?? 0) >= 4).length;
  const withLocation = incidents.filter((i) => i.region).length;

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const inc of incidents) {
      const key = inc.type || "Inconnu";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [incidents]);

  const byRegion = useMemo(() => {
    const map = new Map<string, number>();
    for (const inc of incidents) {
      const key = inc.region || "Non précisée";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [incidents]);

  const recent = incidents.slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord général</h1>
        <p className="text-sm text-gray-500">Dernière mise à jour: {nowLabel}</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiCard label="Incidents total" value={loading ? "..." : incidents.length} />
        <KpiCard label="Incidents critiques (>=4)" value={loading ? "..." : criticalCount} />
        <KpiCard label="Incidents avec localisation" value={loading ? "..." : withLocation} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-gray-800">Incidents par type</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : byType.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {byType.map((item) => (
                <div key={item.type} className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm">
                  <span className="text-gray-700">{item.type}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-gray-800">Incidents par région</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : byRegion.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {byRegion.map((item) => (
                <div key={item.region} className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm">
                  <span className="text-gray-700">{item.region}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">Derniers incidents</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Gravité IA</th>
                <th className="px-4 py-3">Région</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-5 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-5 text-center text-gray-500">
                    Aucun incident disponible.
                  </td>
                </tr>
              ) : (
                recent.map((inc) => (
                  <tr 
                    key={inc.id} 
                    className="border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedIncidentDetails(inc)}
                  >
                    <td className="px-4 py-3 text-gray-700">{new Date(inc.date_incident).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{inc.type || "Inconnu"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        (inc.gravite_ia ?? 0) >= 4 ? "bg-red-100 text-red-700" : 
                        (inc.gravite_ia ?? 0) >= 3 ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {inc.gravite_ia ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{inc.region || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">{inc.description || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DÉTAILS INCIDENT */}
      {selectedIncidentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0a0a1a] p-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg">Détails du Signalement #{selectedIncidentDetails.id}</h2>
              <button 
                onClick={() => setSelectedIncidentDetails(null)} 
                className="text-gray-400 hover:text-white"
                aria-label="Fermer les détails du signalement"
                title="Fermer les détails du signalement"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex gap-3 mb-6">
                <span className="bg-gray-100 border border-gray-200 text-gray-800 text-xs uppercase font-bold px-3 py-1 rounded">
                  {selectedIncidentDetails.type || "Inconnu"}
                </span>
                {(selectedIncidentDetails.gravite_ia ?? 0) >= 4 && (
                  <span className="bg-red-100 text-red-800 text-xs uppercase font-bold px-3 py-1 rounded border border-red-200">
                    Gravité Critique ({selectedIncidentDetails.gravite_ia})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Date du signalement</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedIncidentDetails.date_incident).toLocaleString("fr-FR")}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Localisation</p>
                  <p className="font-semibold text-gray-900">
                    {selectedIncidentDetails.region || "Région inconnue"} 
                    {selectedIncidentDetails.province ? ` > ${selectedIncidentDetails.province}` : ""}
                    {selectedIncidentDetails.commune ? ` > ${selectedIncidentDetails.commune}` : ""}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">Description complète</h3>
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {selectedIncidentDetails.description || "Aucune description fournie."}
                </p>
              </div>

              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2">Informations du signalant</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div>
                    <p className="text-xs text-blue-700 mb-1">Nom complet</p>
                    <p className="font-semibold text-blue-950">
                      {selectedIncidentDetails.signalant_prenom || selectedIncidentDetails.signalant_nom 
                        ? `${selectedIncidentDetails.signalant_prenom || ""} ${selectedIncidentDetails.signalant_nom || ""}`.trim() 
                        : "Inconnu"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 mb-1">Email</p>
                    <p className="font-semibold text-blue-950">{selectedIncidentDetails.signalant_email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 mb-1">Matricule</p>
                    <p className="font-semibold text-blue-950">{selectedIncidentDetails.signalant_matricule || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 mb-1">Unité</p>
                    <p className="font-semibold text-blue-950">{selectedIncidentDetails.signalant_unite || "-"}</p>
                  </div>
                </div>
              </div>

              {selectedIncidentDetails.chemin_fichier && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">Média attaché</h3>
                  <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                    {selectedIncidentDetails.chemin_fichier.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={`${getApiBase()}/uploads/${selectedIncidentDetails.chemin_fichier}`} alt="Média incident" className="max-h-64 object-contain rounded" />
                    ) : selectedIncidentDetails.chemin_fichier.match(/\.(mp3|wav|ogg)$/i) ? (
                      <audio controls src={`${getApiBase()}/uploads/${selectedIncidentDetails.chemin_fichier}`} className="w-full" />
                    ) : (
                      <a href={`${getApiBase()}/uploads/${selectedIncidentDetails.chemin_fichier}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span>Ouvrir le fichier joint ({selectedIncidentDetails.chemin_fichier})</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedIncidentDetails(null)} 
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded transition-colors"
                aria-label="Fermer les détails du signalement"
                title="Fermer les détails du signalement"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="mb-1 text-sm text-gray-600">{label}</p>
        <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
      </div>
    </div>
  );
}
