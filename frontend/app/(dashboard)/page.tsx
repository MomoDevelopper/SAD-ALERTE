"use client";
import { useEffect, useMemo, useState } from "react";
import { getApiBase, getStoredToken } from "../../lib/client-auth";
import type { Incident } from "../../lib/incidents-client";

export default function DecideurPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.message || "Impossible de charger les incidents.");
        setIncidents(Array.isArray(data.incidents) ? data.incidents : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const lastUpdate = useMemo(() => new Date().toLocaleString("fr-FR"), []);
  const totalActives = loading ? "..." : incidents.length;
  const critiquesCount = incidents.filter((i) => (i.gravite_ia ?? 0) >= 4).length;
  const critiques = loading ? "..." : critiquesCount;
  const withLocation = loading ? "..." : incidents.filter((i) => i.region).length;
  const uniqueRegions = loading ? "..." : new Set(incidents.map((i) => i.region).filter(Boolean)).size;
  const recent = incidents.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord général</h1>
        <p className="text-sm text-gray-500">Dernière mise à jour: {lastUpdate}</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Incidents total</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{totalActives}</h2>
            <p className="text-xs text-gray-500">Données API</p>
          </div>
          <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center text-sadred">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Incidents critiques</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{critiques}</h2>
            <p className="text-xs text-gray-500">Gravité IA &gt;= 4</p>
          </div>
          <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Incidents localisés</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{withLocation}</h2>
            <p className="text-xs text-gray-500">{uniqueRegions} région(s) concernée(s)</p>
          </div>
          <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
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
                  <tr key={inc.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-700">{new Date(inc.date_incident).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{inc.type || "Inconnu"}</td>
                    <td className="px-4 py-3 text-gray-700">{inc.gravite_ia ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{inc.region || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{inc.description || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
