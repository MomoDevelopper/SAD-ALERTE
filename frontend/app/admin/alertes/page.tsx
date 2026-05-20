"use client";

import { useEffect, useState } from "react";
import { getApiBase, getStoredToken } from "../../../lib/client-auth";

type Incident = {
  id: number;
  date_incident: string;
  type: string;
  description: string;
  gravite_ia: number | null;
  region: string | null;
  province?: string | null;
  commune?: string | null;
  chemin_fichier?: string | null;
  signalant_nom?: string | null;
  signalant_prenom?: string | null;
  signalant_email?: string | null;
  signalant_matricule?: string | null;
  signalant_unite?: string | null;
  signalant_zone?: string | null;
};

function levelFromIncident(incident: Incident): "Critique" | "Eleve" | "Moyen" {
  const g = incident.gravite_ia ?? 0;
  if (g >= 4) return "Critique";
  if (g >= 3) return "Eleve";
  return "Moyen";
}

export default function AlertesPage() {
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
        if (!res.ok) throw new Error(data?.message || "Impossible de charger les alertes.");
        setIncidents(Array.isArray(data.incidents) ? data.incidents : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const alertes = incidents.slice(0, 20);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Alertes</h1>
          <p className="mt-1 text-sm text-gray-500">Flux réel basé sur les incidents remontés.</p>
        </div>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">Liste des alertes récentes</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Type</th>
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
              ) : alertes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-5 text-center text-gray-500">
                    Aucune alerte disponible.
                  </td>
                </tr>
              ) : (
                alertes.map((incident) => (
                  <tr 
                    key={incident.id} 
                    className="border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedIncidentDetails(incident)}
                  >
                    <td className="px-4 py-3 text-gray-700">{new Date(incident.date_incident).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        levelFromIncident(incident) === "Critique" ? "bg-red-100 text-red-700" : 
                        levelFromIncident(incident) === "Eleve" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {levelFromIncident(incident)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{incident.type || "Inconnu"}</td>
                    <td className="px-4 py-3 text-gray-700">{incident.region || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">{incident.description || "-"}</td>
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
              <h2 className="font-bold text-lg">Détails de l'Alerte #{selectedIncidentDetails.id}</h2>
              <button 
                onClick={() => setSelectedIncidentDetails(null)} 
                className="text-gray-400 hover:text-white"
                aria-label="Fermer les détails de l'alerte"
                title="Fermer les détails de l'alerte"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex gap-3 mb-6">
                <span className="bg-gray-100 border border-gray-200 text-gray-800 text-xs uppercase font-bold px-3 py-1 rounded">
                  {selectedIncidentDetails.type || "Inconnu"}
                </span>
                <span className={`text-xs uppercase font-bold px-3 py-1 rounded border ${
                  levelFromIncident(selectedIncidentDetails) === "Critique" ? "bg-red-100 text-red-800 border-red-200" : 
                  levelFromIncident(selectedIncidentDetails) === "Eleve" ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-blue-100 text-blue-800 border-blue-200"
                }`}>
                  Alerte {levelFromIncident(selectedIncidentDetails)}
                </span>
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

              <div className="bg-gray-50 p-3 rounded border border-gray-100 mb-6 flex flex-col">
                <p className="text-xs text-gray-500 mb-1">Signalé par</p>
                {selectedIncidentDetails.signalant_nom ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                      {selectedIncidentDetails.signalant_nom[0]}{selectedIncidentDetails.signalant_prenom?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedIncidentDetails.signalant_prenom} {selectedIncidentDetails.signalant_nom}</p>
                      <p className="text-xs text-gray-500">
                        {selectedIncidentDetails.signalant_matricule ? `Matricule: ${selectedIncidentDetails.signalant_matricule}` : "Matricule non renseigné"} 
                        {" • "} 
                        {selectedIncidentDetails.signalant_unite ? `Unité: ${selectedIncidentDetails.signalant_unite}` : "Unité non renseignée"}
                        {" • "} 
                        {selectedIncidentDetails.signalant_zone ? `Zone: ${selectedIncidentDetails.signalant_zone}` : "Zone non renseignée"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="font-semibold text-gray-900">Anonyme ou Système IA</p>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">Description complète</h3>
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {selectedIncidentDetails.description || "Aucune description fournie."}
                </p>
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
                aria-label="Fermer les détails de l'alerte"
                title="Fermer les détails de l'alerte"
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
