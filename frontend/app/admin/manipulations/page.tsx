"use client";

import { useState } from "react";
import { useIncidents } from "../../../lib/incidents-client";

export default function DetectionManipulationsPage() {
  const [modalData, setModalData] = useState<{ title: string; items: any[]; type: 'incident' | 'type' } | null>(null);
  const { incidents, loading, error, byType } = useIncidents();
  const suspicious = incidents.filter((i) => (i.confiance ?? 0.5) < 0.45).slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Détection de manipulations</h1>
        <p className="text-sm text-gray-500">Surveillance des incidents à faible confiance pour revue humaine.</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-800">Signalements à vérifier</h3>
          <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-bold">
            {loading ? "..." : `${suspicious.length} alerte(s)`}
          </span>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : suspicious.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun incident à faible confiance pour le moment.</p>
          ) : (
            suspicious.map((inc) => (
              <div key={inc.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-bold text-gray-900">{inc.type || "Incident"} - {inc.region || "Non précisée"}</h4>
                  <span className="text-xs font-bold text-orange-700">
                    Confiance: {Math.round((inc.confiance ?? 0.5) * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-700">{inc.description || "Sans description"}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Statistiques d'analyse</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className="border border-gray-100 bg-gray-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setModalData({ title: "Incidents analysés", items: incidents, type: 'incident' })}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Incidents analysés</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{loading ? "..." : incidents.length}</p>
          </div>
          <div 
            className="border border-gray-100 bg-gray-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setModalData({ title: "Signalements suspects", items: suspicious, type: 'incident' })}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Signalements suspects</p>
            <p className="text-2xl font-bold text-sadred mt-2">{loading ? "..." : suspicious.length}</p>
          </div>
          <div 
            className="border border-gray-100 bg-gray-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setModalData({ title: "Types suivis", items: byType, type: 'type' })}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Types suivis</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{loading ? "..." : byType.length}</p>
          </div>
        </div>
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
                      {modalData.type === 'incident' && (
                        <>
                          <div className="font-bold text-gray-900">{item.type} <span className="text-sm text-gray-500 font-normal">({item.region})</span></div>
                          <div className="text-sm text-gray-700 mt-1">{item.description}</div>
                        </>
                      )}
                      {modalData.type === 'type' && (
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
