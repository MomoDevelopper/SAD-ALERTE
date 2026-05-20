"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { clearStoredToken, getApiBase, getStoredToken } from "../../lib/client-auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (data?.profile?.role !== "admin") {
          clearStoredToken();
          router.replace("/login");
        }
      })
      .catch(() => undefined)
      .finally(() => setAuthReady(true));
  }, [router]);

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Vérification de session...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f3f5f9]">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 w-full flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 pr-8 border-r border-gray-100">
            <div className="rounded overflow-hidden flex items-center justify-center">
              <Image src="/logo.jpeg" alt="Logo SAD-ALERTE" width={40} height={40} className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-gray-900">d'Alerte Précoce</span>
              <span className="text-[10px] text-gray-500 leading-tight">Burkina Faso - Sécurité Nationale</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex items-center px-4 overflow-x-auto hide-scrollbar gap-1">
            <NavItem href="/" label="Tableau de bord" icon="dashboard" currentPath={pathname} />
            <NavItem href="/carte" label="Carte des menaces" icon="map" currentPath={pathname} />
            <NavItem href="/prediction" label="Prédiction IA" icon="trending_up" currentPath={pathname} />
            <NavItem href="/alertes" label="Alertes" icon="notifications" currentPath={pathname} />
            <NavItem href="/analyses" label="Analyses" icon="analytics" currentPath={pathname} />
            <NavItem href="/aide" label="Aide à la décision" icon="lightbulb" currentPath={pathname} />
            <NavItem href="/import-documents" label="Import documents" icon="upload" currentPath={pathname} />
            <NavItem href="/manipulations" label="Détection manipulations" icon="find_in_page" currentPath={pathname} />
            <NavItem href="/utilisateurs" label="Gestion utilisateurs" icon="group" currentPath={pathname} />
          </div>

          {/* Profile & Settings */}
          <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
            <button className="text-gray-400 hover:text-gray-600" title="Rechercher" aria-label="Rechercher">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600" title="Paramètres" aria-label="Paramètres">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              <Image src="/logo.jpeg" alt="Avatar" width={32} height={32} className="object-cover" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-gray-700">Moumouni O.</span>
              <span className="text-[10px] text-gray-500">Utilisateur</span>
            </div>
            <button
              onClick={() => {
                clearStoredToken();
                router.push("/login");
              }}
              className="ml-2 rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              Déconnexion
            </button>
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-4 py-8">
        {children}
      </main>

    </div>
  );
}

function NavItem({ href, label, icon, currentPath, badge }: { href: string, label: string, icon: string, currentPath: string, badge?: string }) {
  const active = currentPath === href || (href !== "/" && currentPath?.startsWith(href));

  // SVG Icon mapping placeholder for simplicity
  const getIcon = () => {
    return (
      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    );
  };

  return (
    <Link href={href} className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg min-w-[100px] hover:bg-gray-50 transition-colors relative ${active ? 'bg-red-50 text-sadred' : 'text-gray-600'}`}>
      <div className="mb-1">{getIcon()}</div>
      <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
      {badge && (
        <span className="absolute top-1 right-2 bg-sadred text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-sadred rounded-t-full"></div>
      )}
    </Link>
  );
}
