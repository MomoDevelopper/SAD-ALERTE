"use client";

import { useIncidents } from "../../../lib/incidents-client";

export default function UtilisateursPage() {
  const { incidents, byRegion, loading, error } = useIncidents();
  const activeContributors = new Set(incidents.map((i) => `${i.region || "non_precise"}:${i.type || "incident"}`)).size;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs et activité</h1>
        <p className="text-sm text-gray-500">Vue dynamique de l'activité issue des incidents collectés.</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard label="Incidents saisis" value={loading ? "..." : incidents.length} />
        <StatCard label="Zones actives" value={loading ? "..." : byRegion.length} />
        <StatCard label="Contributeurs estimés" value={loading ? "..." : activeContributors} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">Répartition activité par région</div>
        <div className="p-4">
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : byRegion.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune activité détectée.</p>
          ) : (
            <div className="space-y-2">
              {byRegion.slice(0, 12).map((r) => (
                <div key={r.name} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-sm">
                  <span className="text-gray-700">{r.name}</span>
                  <span className="font-semibold text-gray-900">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
