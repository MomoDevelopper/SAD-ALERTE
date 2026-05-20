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
                  <tr key={incident.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-700">{new Date(incident.date_incident).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{levelFromIncident(incident)}</td>
                    <td className="px-4 py-3 text-gray-700">{incident.type || "Inconnu"}</td>
                    <td className="px-4 py-3 text-gray-700">{incident.region || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{incident.description || "-"}</td>
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
