"use client";

import { useState } from "react";
import { useIncidents } from "../../../lib/incidents-client";

export default function AnalysesPage() {
  const [activeTab, setActiveTab] = useState("tendances");
  const [modalData, setModalData] = useState<{ title: string; items: any[]; type: 'incident' | 'region' } | null>(null);
  const { incidents, byRegion, byType, loading, error } = useIncidents();
  const critiques = incidents.filter((i) => (i.gravite_ia ?? 0) >= 4).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analyses et rapports</h1>
        <p className="text-sm text-gray-500">Analyses alimentées en temps réel depuis les incidents.</p>
      </div>

      <div className="flex items-center gap-2">
        <TabButton label="Tendances" isActive={activeTab === "tendances"} onClick={() => setActiveTab("tendances")} />
        <TabButton label="Ressources" isActive={activeTab === "ressources"} onClick={() => setActiveTab("ressources")} />
        <TabButton label="Évaluation des risques" isActive={activeTab === "risques"} onClick={() => setActiveTab("risques")} />
        <TabButton label="Rapports" isActive={activeTab === "rapports"} onClick={() => setActiveTab("rapports")} />
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {activeTab === "tendances" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card 
            title="Incidents total" 
            value={loading ? "..." : incidents.length} 
            onClick={() => setModalData({ title: "Incidents total", items: incidents, type: 'incident' })}
          />
          <Card 
            title="Incidents critiques" 
            value={loading ? "..." : critiques} 
            onClick={() => {
              const criticalIncidents = incidents.filter((i) => (i.gravite_ia ?? 0) >= 4);
              setModalData({ title: "Incidents critiques", items: criticalIncidents, type: 'incident' });
            }}
          />
          <Card 
            title="Régions touchées" 
            value={loading ? "..." : byRegion.length} 
            onClick={() => setModalData({ title: "Régions touchées", items: byRegion, type: 'region' })}
          />
        </div>
      )}

      {activeTab === "ressources" && (
        <ListCard
          title="Top régions (volume)"
          rows={byRegion.slice(0, 8).map((r) => ({ label: r.name, value: r.count }))}
          loading={loading}
          emptyText="Aucune donnée région."
        />
      )}

      {activeTab === "risques" && (
        <ListCard
          title="Top types de risques"
          rows={byType.slice(0, 10).map((t) => ({ label: t.name, value: t.count }))}
          loading={loading}
          emptyText="Aucune donnée type."
        />
      )}

      {activeTab === "rapports" && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-800">Rapport instantané</h3>
          <p className="text-sm text-gray-600">
            Total incidents: <strong>{loading ? "..." : incidents.length}</strong> | Critiques:{" "}
            <strong>{loading ? "..." : critiques}</strong> | Top région:{" "}
            <strong>{loading ? "..." : byRegion[0]?.name || "-"}</strong>
          </p>
        </div>
      )}

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

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${isActive ? "bg-gray-200 text-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
    >
      {label}
    </button>
  );
}

function Card({ title, value, onClick }: { title: string; value: string | number; onClick?: () => void }) {
  return (
    <div 
      role="button"
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${title}: ${value}` : undefined}
      className={`rounded-xl border border-gray-100 bg-white p-6 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <p className="text-sm text-gray-600">{title}</p>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {onClick && <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
      </div>
    </div>
  );
}

function ListCard({
  title,
  rows,
  loading,
  emptyText,
}: {
  title: string;
  rows: Array<{ label: string; value: number }>;
  loading: boolean;
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-800">{title}</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm">
              <span className="text-gray-700">{row.label}</span>
              <span className="font-semibold text-gray-900">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
