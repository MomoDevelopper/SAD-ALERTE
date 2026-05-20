"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Shield, Mail, Calendar, Key } from "lucide-react";
import { clearStoredToken, getApiBase, getStoredToken } from "../../../lib/client-auth";

type UserProfile = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "agent" | "admin";
  score_confiance: number;
  actif: boolean;
  date_creation: string;
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${getApiBase()}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          clearStoredToken();
          router.replace("/login");
          return null;
        }
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.message || "Impossible de charger le profil.");
        return data;
      })
      .then((data) => {
        if (data?.profile) setProfile(data.profile);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  if(loading) return <div className="p-8 text-center text-gray-500">Chargement du profil dynamique...</div>;
  if(!profile) return <div className="p-8 text-center text-red-500">{error || "Vous avez été déconnecté ou la session a expiré. Veuillez vous reconnecter."}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil d'Assistance</h1>
        <p className="text-sm text-gray-500">Consultez vos informations opérationnelles (reliées directement à la base PostgreSQL).</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex items-start gap-8">
        <div className="bg-blue-50 text-sadblue p-6 rounded-full flex-shrink-0">
          <UserCircle size={80} strokeWidth={1.5} />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 uppercase">{profile.prenom} {profile.nom}</h2>
          <span className="inline-block mt-2 px-3 py-1 bg-sadblue text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-sm">
            Grade: {profile.role}
          </span>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-xs text-gray-500">Adresse Email</p>
                <p className="text-sm font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="text-green-500" size={20} />
              <div>
                <p className="text-xs text-gray-500">Score de Confiance du Profil</p>
                <p className="text-sm font-medium text-green-700">Equivaut à {(profile.score_confiance * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-xs text-gray-500">Membre autorisé depuis le</p>
                <p className="text-sm font-medium">{new Date(profile.date_creation).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Key className="text-red-400" size={20} />
              <div>
                <p className="text-xs text-gray-500">Statut Réseau</p>
                <p className="text-sm font-medium text-green-600">{profile.actif ? 'Opérationnel' : 'Bloqué'}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-100 flex gap-4">
            <button 
              className="px-5 py-2 bg-sadred text-white text-sm font-medium rounded-lg hover:bg-red-800 transition shadow-sm"
              aria-label="Modifier le mot de passe"
              title="Modifier le mot de passe"
            >
              Modifier le mot de passe
            </button>
            <button 
              className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition" 
              onClick={() => {
                clearStoredToken();
                router.push("/login");
              }}
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              Se Déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
