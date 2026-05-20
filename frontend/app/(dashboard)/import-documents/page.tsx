"use client";

import { useEffect, useState } from "react";
import { getApiBase, getStoredToken } from "../../../lib/client-auth";

type DocumentItem = {
  id: number;
  titre: string;
  categorie: string;
  statut_ia: string;
  date_upload: string;
  chemin_fichier?: string;
  upload_par_role?: string;
};

export default function DocumentsAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState("rapport_incident");
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const fetchDocuments = async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const res = await fetch(`${getApiBase()}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.documents)) {
        // Filtrer uniquement les documents importés par l'admin (rapport_incident, news_rtb)
        const adminDocuments = data.documents.filter((doc: DocumentItem) => 
          (doc.categorie === 'rapport_incident' || doc.categorie === 'news_rtb') && doc.upload_par_role === 'admin'
        );
        setDocuments(adminDocuments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus({ type: "error", message: "Veuillez sélectionner un fichier PDF." });
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setStatus({ type: "error", message: "Session expirée. Veuillez vous reconnecter." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("titre", titre);
    formData.append("categorie", categorie);

    try {
      setIsUploading(true);
      setStatus(null);

      const response = await fetch(`${getApiBase()}/api/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setStatus({
          type: "error",
          message: data?.message || "Échec de l'upload. Vérifiez vos droits administrateur.",
        });
        return;
      }

      setStatus({ type: "success", message: "Document uploadé et envoyé en file d'attente IA." });
      setFile(null);
      setTitre("");
      setCategorie("rapport_incident");
      fetchDocuments(); // Refresh the list after successful upload
    } catch {
      setStatus({ type: "error", message: "Impossible de joindre le serveur API." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Espace administration documentaire</h1>
      
      <div className="bg-white text-black p-6 rounded shadow max-w-md">
        <h2 className="text-lg font-semibold mb-4">Soumettre un document pour analyse IA</h2>
        {status && (
          <div
            className={`mb-4 rounded border px-3 py-2 text-sm ${
              status.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={titre}
              onChange={e => setTitre(e.target.value)}
              placeholder="Titre du document"
              title="Titre du document"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Catégorie</label>
            <select 
              className="w-full border rounded p-2"
              value={categorie}
              onChange={e => setCategorie(e.target.value)}
              title="Catégorie du document"
            >
              <option value="rapport_incident">Rapport d'Incident</option>
              <option value="news_rtb">News RTB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fichier (format PDF)</label>
            <input 
              type="file" 
              accept=".pdf"
              className="w-full" 
              onChange={e => setFile(e.target.files?.[0] || null)}
              placeholder="Sélectionner un fichier PDF"
              title="Sélectionner un fichier PDF"
              required
            />
            {file && <p className="mt-1 text-xs text-gray-500">Fichier sélectionné: {file.name}</p>}
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUploading ? "Envoi en cours..." : "Envoyer à l'IA"}
          </button>
        </form>
      </div>

      <div className="bg-white text-black p-6 rounded shadow mt-8">
        <h2 className="text-lg font-semibold mb-4">Historique des documents importés</h2>
        {loadingDocs ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun document importé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Statut IA</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-700">{new Date(doc.date_upload).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {doc.chemin_fichier ? (
                        <a href={`${getApiBase()}/uploads/${doc.chemin_fichier}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          {doc.titre}
                        </a>
                      ) : (
                        doc.titre
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.categorie}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${doc.statut_ia === 'traite' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {doc.statut_ia === 'traite' ? 'Traité' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
