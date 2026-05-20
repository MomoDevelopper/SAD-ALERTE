"use client";

import { useState } from "react";
import { useIncidents } from "../../../lib/incidents-client";

export default function PredictionPage() {
  const { incidents, byRegion, loading, error } = useIncidents();
  const [modalData, setModalData] = useState<{ title: string; items: any[]; type: 'prediction' | 'incident' | 'region' } | null>(null);
  const predictions = incidents
    .filter((i) => (i.gravite_ia ?? 0) >= 3)
    .slice(0, 12)
    .map((i) => ({
      id: i.id,
      zone: i.region || "Non précisée",
      type: i.type || "Inconnu",
      probability: Math.min(95, Math.max(40, Math.round(((i.gravite_ia ?? 1) / 5) * 100))),
      confidence: Math.round((i.confiance ?? 0.5) * 100),
      description: i.description,
      eta: (i.gravite_ia ?? 0) >= 4 ? "24-48h" : "3-5 jours",
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Système de prédiction des menaces</h1>
          <p className="text-sm text-gray-500">Prédictions dynamiques dérivées du flux d'incidents réel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard 
          title="Prédictions actives" 
          value={loading ? "..." : predictions.length} 
          onClick={() => setModalData({ title: "Prédictions actives", items: predictions, type: 'prediction' })}
        />
        <KPICard 
          title="Incidents critiques" 
          value={loading ? "..." : incidents.filter((i) => (i.gravite_ia ?? 0) >= 4).length} 
          onClick={() => {
            const criticalIncidents = incidents.filter((i) => (i.gravite_ia ?? 0) >= 4);
            setModalData({ title: "Incidents critiques", items: criticalIncidents, type: 'incident' });
          }}
        />
        <KPICard 
          title="Régions surveillées" 
          value={loading ? "..." : byRegion.length} 
          onClick={() => setModalData({ title: "Régions surveillées", items: byRegion, type: 'region' })}
        />
        <KPICard
          title="Confiance moyenne"
          value={
            loading
              ? "..."
              : `${Math.round((incidents.reduce((acc, i) => acc + (i.confiance ?? 0.5), 0) / Math.max(1, incidents.length)) * 100)}%`
          }
        />
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
        <h3 className="text-sm font-bold text-gray-800">Menaces prédites (issues du flux en cours)</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : predictions.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune prédiction active.</p>
        ) : (
          predictions.map((p) => (
            <PredictionCard
              key={p.id}
              location={p.zone}
              threat={p.type}
              time={p.eta}
              confidence={`${p.confidence}%`}
              probability={`${p.probability}%`}
              description={p.description}
            />
          ))
        )}
      </div>

      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0a0a1a] p-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg">{modalData.title}</h2>
              <button 
                onClick={() => setModalData(null)} 
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {modalData.items.length === 0 ? (
                <p className="text-gray-500">Aucun élément à afficher.</p>
              ) : (
                <ul className="space-y-3">
                  {modalData.items.map((item, idx) => (
                    <li key={item.id || idx} className="p-3 border border-gray-100 rounded bg-gray-50">
                      {modalData.type === 'prediction' && (
                        <>
                          <div className="font-bold text-gray-900">{item.type || item.threat} <span className="text-sm text-gray-500 font-normal">({item.zone || item.location})</span></div>
                          <div className="text-sm text-gray-700 mt-1">{item.description}</div>
                        </>
                      )}
                      {modalData.type === 'incident' && (
                        <>
                          <div className="font-bold text-gray-900">{item.type} <span className="text-sm text-gray-500 font-normal">({item.region})</span></div>
                          <div className="text-sm text-gray-700 mt-1">{item.description}</div>
                        </>
                      )}
                      {modalData.type === 'region' && (
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">{item.name}</span>
                          <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded font-bold">{item.count} incident(s)</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
              <button onClick={() => setModalData(null)} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded transition-colors">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, onClick }: { title: string; value: string | number; onClick?: () => void }) {
  return (
    <div 
      role="button"
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${title}: ${value}` : undefined}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col pt-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        {onClick && <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
      </div>
    </div>
  );
}

function PredictionCard({
  location,
  threat,
  time,
  confidence,
  probability,
  description,
}: {
  location: string;
  threat: string;
  time: string;
  confidence: string;
  probability: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="mb-1 flex items-center gap-2 font-bold text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {location}
          </div>
          <p className="text-sm text-gray-800">{threat}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-sadred">{probability}</div>
          <p className="text-[10px] text-gray-500 uppercase">Probabilité</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-4 border-b border-gray-200/50 pb-4">
         <span className="flex items-center gap-1"><svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {location}</span>
         <span className="flex items-center gap-1"><svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {time}</span>
         <span className="flex items-center gap-1"><svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> Confiance: {confidence}</span>
      </div>

      <p className="text-xs text-gray-700 leading-relaxed">{description || "Sans description"}</p>
    </div>
  );
}
