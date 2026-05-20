"use client";

import { useIncidents } from "../../../lib/incidents-client";

export default function AidePage() {
  const { incidents, byRegion, loading, error } = useIncidents();
  const critical = incidents.filter((i) => (i.gravite_ia ?? 0) >= 4).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aide à la décision</h1>
        <p className="text-sm text-gray-500">Recommandations générées à partir des incidents en temps réel.</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Priorités opérationnelles</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : critical.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune priorité critique détectée.</p>
          ) : (
            <ul className="space-y-3">
              {critical.map((c) => (
                <li key={c.id} className="rounded border border-red-100 bg-red-50 p-3 text-sm text-gray-800">
                  <span className="font-bold text-sadred">Priorité:</span> {c.type || "Incident"} - {c.region || "Zone non précisée"}.
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Régions à traiter en premier</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : byRegion.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune région disponible.</p>
          ) : (
            <div className="flex flex-col gap-3 text-sm">
              {byRegion.slice(0, 6).map((r, idx) => (
                <div key={r.name} className="rounded border border-gray-200 p-4">
                  <h4 className="mb-1 font-bold text-gray-900">
                    Axe prioritaire #{idx + 1}: {r.name}
                  </h4>
                  <p className="text-gray-700">{r.count} incident(s) recensé(s).</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
