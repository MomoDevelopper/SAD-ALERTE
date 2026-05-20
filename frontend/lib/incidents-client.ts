"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBase, getStoredToken } from "./client-auth";

export type Incident = {
  id: number;
  date_incident: string;
  type: string;
  description: string;
  gravite_ia: number | null;
  confiance: number | null;
  region: string | null;
  province: string | null;
  commune: string | null;
  latitude: number | null;
  longitude: number | null;
  chemin_fichier: string | null;
  upload_par: number | null;
  signaleur_nom?: string;
  signaleur_role?: string;
};

export function useIncidents() {
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
        if (!res.ok) throw new Error(data?.message || "Impossible de charger les incidents.");
        setIncidents(Array.isArray(data.incidents) ? data.incidents : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const byRegion = useMemo(() => {
    const map = new Map<string, number>();
    for (const incident of incidents) {
      const key = incident.region || "Non précisée";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const incident of incidents) {
      const key = incident.type || "Inconnu";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  return { incidents, loading, error, byRegion, byType };
}
