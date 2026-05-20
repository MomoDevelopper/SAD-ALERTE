"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { clearStoredToken, getApiBase, getStoredToken } from "../../lib/client-auth";

type UserProfile = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "agent" | "admin";
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = React.useState(false);

  React.useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${getApiBase()}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          clearStoredToken();
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.profile) {
          if (data.profile.role !== "admin") {
            clearStoredToken();
            router.replace("/login");
            return;
          }
          setProfile(data.profile);
        }
      })
      .catch(() => {
        // Keep current token on transient API/CORS errors.
        // We only force logout when backend explicitly returns 401.
      })
      .finally(() => setAuthReady(true));
  }, [router]);

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Vérification de session...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f3f5f9]">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100 shrink-0">
           <div className="rounded overflow-hidden flex items-center justify-center shrink-0">
             <Image src="/logo.jpeg" alt="Logo SAD-ALERTE" width={32} height={32} className="object-cover" />
           </div>
           <div className="flex flex-col overflow-hidden">
             <span className="font-bold text-sm leading-tight text-gray-900 truncate">SAD-ALERTE</span>
             <span className="text-[10px] text-gray-500 leading-tight truncate">Sécurité Nationale</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 hide-scrollbar">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-2">Général</p>
           <NavItem href="/admin" label="Tableau de bord" icon="dashboard" currentPath={pathname} />
           <NavItem href="/admin/carte" label="Carte des menaces" icon="map" currentPath={pathname} />
           <NavItem href="/admin/alertes" label="Alertes" icon="notifications" currentPath={pathname} />
           
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-2">Analytique</p>
           <NavItem href="/admin/prediction" label="Prédiction IA" icon="trending_up" currentPath={pathname} />
           <NavItem href="/admin/analyses" label="Analyses" icon="analytics" currentPath={pathname} />
           <NavItem href="/admin/manipulations" label="Contre-manipulation" icon="find_in_page" currentPath={pathname} />
           <NavItem href="/admin/aide" label="Aide à la décision" icon="lightbulb" currentPath={pathname} />

           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-2">Administration</p>
           <NavItem href="/admin/import-documents" label="Import documents" icon="upload" currentPath={pathname} />
           <NavItem href="/admin/utilisateurs" label="Utilisateurs et Rôles" icon="group" currentPath={pathname} />
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
           {/* Global Search Bar */}
           <div className="flex-1 max-w-xl">
             <div className="relative group">
               <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-sadred transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               <input 
                 type="text" 
                 placeholder="Rechercher alertes, menaces, régions..." 
                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm text-gray-800 outline-none focus:bg-white focus:border-gray-200 focus:shadow-sm transition-all"
                 title="Rechercher dans le système"
                 aria-label="Rechercher dans le système"
               />
               <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden md:inline-block bg-white border border-gray-200 text-gray-400 text-[10px] px-1.5 py-0.5 rounded font-bold">⌘K</kbd>
             </div>
           </div>

           {/* Profile & Settings Components */}
           <div className="flex items-center gap-5 pl-6 ml-6 border-l border-gray-100 relative">
              <button 
                className="text-gray-400 hover:text-gray-700 transition-colors relative" 
                onClick={() => alert("Overture des réglages...")}
                aria-label="Paramètres et réglages"
                title="Paramètres et réglages"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-1 px-2 rounded-lg transition-colors"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                role="button"
                tabIndex={0}
                aria-label={`Profil utilisateur: ${profile ? `${profile.prenom} ${profile.nom}` : 'Agent SAD'}, ${profile ? profile.role : 'Connecté'}`}
                title="Profil utilisateur"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsProfileOpen(!isProfileOpen);
                  }
                }}
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                  <Image src="/logo.jpeg" alt="Avatar" width={32} height={32} className="object-cover" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-bold text-gray-800">{profile ? `${profile.prenom} ${profile.nom}` : 'Agent SAD'}</span>
                  <span className="text-[10px] text-gray-500 capitalize">{profile ? profile.role : 'Connecté'}</span>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute top-12 right-0 w-48 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden py-1 z-50">
                   <Link 
                     href="/admin/profil" 
                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                     aria-label="Voir mon profil"
                     title="Voir mon profil"
                   >
                     Mon Profil
                   </Link>
                   <Link 
                     href="/admin/securite" 
                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                     aria-label="Paramètres de sécurité et authentification à deux facteurs"
                     title="Paramètres de sécurité et authentification à deux facteurs"
                   >
                     Sécurité & 2FA
                   </Link>
                   <div className="h-px bg-gray-100 my-1"></div>
                   <button
                     onClick={() => {
                       clearStoredToken();
                       router.push("/login");
                     }}
                     className="w-full text-left block px-4 py-2 text-sm font-semibold text-sadred hover:bg-red-50"
                     aria-label="Se déconnecter du système"
                     title="Se déconnecter du système"
                   >
                     Déconnexion
                   </button>
                </div>
              )}
           </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}

function NavItem({ href, label, icon, currentPath, badge }: { href: string, label: string, icon: string, currentPath: string, badge?: string }) {
  const active = currentPath === href || (href !== "/admin" && currentPath?.startsWith(href));

  // SVG Icon mapping placeholder for simplicity
  const getIcon = () => {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    );
  };

  return (
    <Link 
      href={href} 
      className={`flex items-center px-3 py-2.5 rounded-lg transition-all group ${
        active 
        ? 'bg-red-50 text-sadred font-semibold' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
      }`}
    >
      <div className={`mr-3 ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
        {getIcon()}
      </div>
      <span className="text-sm flex-1">{label}</span>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${
          active ? 'bg-sadred text-white' : 'bg-gray-200 text-gray-700'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
