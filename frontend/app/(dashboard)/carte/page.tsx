"use client";
import { useEffect, useState } from "react";
import { clearStoredToken, getApiBase, getStoredToken } from "../../../lib/client-auth";
import type { Incident } from "../../../lib/incidents-client";

const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  "SOUROU": { lat: 13.07, lng: -2.97 },
  "BANKUI": { lat: 12.46, lng: -3.46 },
  "GUIRIKO": { lat: 11.18, lng: -4.30 },
  "TANNOUNYAN": { lat: 10.64, lng: -4.76 },
  "DJORO": { lat: 10.33, lng: -3.08 },
  "YAAGDA": { lat: 13.58, lng: -2.41 },
  "NANDO": { lat: 12.25, lng: -2.37 },
  "SOUM": { lat: 14.10, lng: -1.63 },
  "KUILSE": { lat: 13.09, lng: -1.08 },
  "OUBRI": { lat: 12.58, lng: -0.99 },
  "KADIOGO": { lat: 12.37, lng: -1.52 },
  "NAZINON": { lat: 11.66, lng: -1.07 },
  "NAKAMBE": { lat: 11.78, lng: -0.37 },
  "LIPTAKO": { lat: 14.03, lng: -0.03 },
  "GOULMOU": { lat: 12.06, lng: 0.36 },
  "TAPOA": { lat: 12.07, lng: 1.78 },
  "SIRBA": { lat: 12.97, lng: -0.14 },
  // Fallback for old regions if they exist in DB
  "Centre": { lat: 12.37, lng: -1.52 },
  "Hauts-Bassins": { lat: 11.18, lng: -4.30 },
  "Nord": { lat: 13.58, lng: -2.41 },
  "Sahel": { lat: 14.03, lng: -0.03 },
  "Boucle du Mouhoun": { lat: 12.46, lng: -3.46 },
  "Cascades": { lat: 10.64, lng: -4.76 },
  "Centre-Est": { lat: 11.78, lng: -0.37 },
  "Centre-Nord": { lat: 13.09, lng: -1.08 },
  "Centre-Ouest": { lat: 12.25, lng: -2.37 },
  "Centre-Sud": { lat: 11.66, lng: -1.07 },
  "Est": { lat: 12.06, lng: 0.36 },
  "Plateau-Central": { lat: 12.58, lng: -0.99 },
  "Sud-Ouest": { lat: 10.33, lng: -3.08 },
};

export default function CarteMenacesPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("Tous les types");
  const [filterGravity, setFilterGravity] = useState("Toutes les gravités");

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
      .then(async (r) => {
        if (r.status === 401) {
          clearStoredToken();
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.message || "Impossible de charger les incidents.");
        const rows = Array.isArray(data.incidents) ? data.incidents : [];
        setIncidents(rows);
        if (rows.length > 0) setSelectedIncident(rows[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const getCoordinates = (lat: number, lng: number) => {
    const minLat = 9.4, maxLat = 15.1, minLng = -5.5, maxLng = 2.5;
    const top = ((maxLat - lat) / (maxLat - minLat)) * 100;
    const left = ((lng - minLng) / (maxLng - minLng)) * 100;
    return { top: `${Math.max(5, Math.min(95, top))}%`, left: `${Math.max(5, Math.min(95, left))}%` };
  };

  const typesUniques = Array.from(new Set(incidents.map(i => i.type || "Inconnu")));

  const filteredIncidents = incidents.filter(i => {
    if (filterType !== "Tous les types" && (i.type || "Inconnu") !== filterType) return false;
    
    if (filterGravity !== "Toutes les gravités") {
      const g = i.gravite_ia ?? 0;
      if (filterGravity === "Critique" && g < 4) return false;
      if (filterGravity === "Elevé" && (g < 3 || g >= 4)) return false;
      if (filterGravity === "Moyen" && g >= 3) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carte des menaces</h1>
        <p className="text-sm text-gray-500">Visualisation géographique des menaces sécuritaires</p>
      </div>
      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <span className="font-semibold">Filtres:</span>
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2"
          >
            <option value="Tous les types">Tous les types</option>
            {typesUniques.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            value={filterGravity}
            onChange={(e) => setFilterGravity(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2"
          >
            <option value="Toutes les gravités">Toutes les gravités</option>
            <option value="Critique">Critique</option>
            <option value="Elevé">Elevé</option>
            <option value="Moyen">Moyen</option>
          </select>
        </div>
        <div className="text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full">
          {filteredIncidents.length} menace(s) affichée(s)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Carte interactive du Burkina Faso</h3>
          <div className="flex-1 bg-[#fdfaf2] border border-orange-100 rounded-lg relative min-h-[500px] overflow-hidden">
            {filteredIncidents.filter((i) => (i.latitude !== null && i.longitude !== null) || (i.region && REGION_COORDS[i.region.toUpperCase()] || REGION_COORDS[i.region || ""])).map((inc) => {
              
              let lat = inc.latitude;
              let lng = inc.longitude;
              
              if (lat === null || lng === null) {
                const mapped = REGION_COORDS[inc.region?.toUpperCase() || ""] || REGION_COORDS[inc.region || ""];
                if (mapped) {
                  // Add a slight random offset so they don't exactly overlap in the region center
                  lat = mapped.lat + (Math.random() - 0.5) * 0.1;
                  lng = mapped.lng + (Math.random() - 0.5) * 0.1;
                }
              }

              const pos = getCoordinates(lat as number, lng as number);
              const isCrit = (inc.gravite_ia ?? 0) >= 4;
              const colorClass = isCrit ? "bg-sadred" : "bg-orange-500";
              const pulseClass = isCrit ? "animate-pulse ring-4 ring-red-500/30" : "";
              return (
                <div 
                  key={inc.id} 
                  className={`absolute w-10 h-10 ${colorClass}/20 rounded-full flex items-center justify-center cursor-pointer`}
                  style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
                  onClick={() => setSelectedIncident(inc)}
                >
                  <div className={`w-6 h-6 ${colorClass} rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg ${pulseClass}`}>
                    {isCrit ? "!" : ""}
                  </div>
                  <span className="absolute -bottom-5 text-[10px] font-bold text-gray-700">{inc.region}</span>
                </div>
              );
            })}


            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow border border-gray-200 text-xs">
              <div className="font-bold mb-2">Niveau de menace</div>
              <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-sadred"></div> Critique</div>
              <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Élevé</div>
              <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Moyen</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Faible</div>
            </div>
          </div>
        </div>

        {/* Details Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 mb-6">Détails de la menace</h3>
          
          {selectedIncident ? (
          <div className="flex-1 flex flex-col gap-5">
            <div>
              <h4 className="font-bold text-lg text-gray-900 leading-tight">{selectedIncident.description || "Incident"}</h4>
              <div className="flex gap-2 mt-2">
                {(selectedIncident.gravite_ia ?? 0) >= 4 && <span className="bg-sadred text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Critique</span>}
                <span className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{selectedIncident.type || "Inconnu"}</span>
              </div>
            </div>

            <div className="grid grid-cols-[24px_1fr] gap-x-2 gap-y-4 text-sm text-gray-600 mt-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div>
                <p className="text-xs text-gray-500">Région</p>
                <p className="font-medium text-gray-900">{selectedIncident.region || "Non spécifiée"}</p>
              </div>

              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{new Date(selectedIncident.date_incident).toLocaleString('fr-FR')}</p>
              </div>

              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <div>
                <p className="text-xs text-gray-500">IA Confiance</p>
                <p className="font-medium text-gray-900">{selectedIncident.confiance ? (selectedIncident.confiance * 100).toFixed(0) : 0}%</p>
              </div>

              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-gray-900 leading-relaxed">{selectedIncident.description}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Statut IA</p>
              <div className="flex gap-2">
                <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded">Analysé</span>
              </div>
            </div>
          </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              {loading ? "Chargement..." : "Aucun incident sélectionné"}
            </div>
          )}
          
          <button className="w-full mt-6 bg-[#0a0a1a] hover:bg-black text-white font-medium py-3 px-4 rounded-lg transition-colors">
            Générer un rapport
          </button>
        </div>

      </div>
    </div>
  );
}
