"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBase } from "../../../lib/client-auth";

type TokenPayload = {
  role?: "admin" | "agent";
};

function readTokenPayload(token: string): TokenPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      const response = await fetch(`${getApiBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = (await response.json().catch(() => ({}))) as { accessToken?: string; error?: string };
      if (response.ok && data.accessToken) {
        const payload = readTokenPayload(data.accessToken);
        if (payload?.role !== "admin") {
          setErrorMessage("Accès web refusé pour ce rôle. Les agents utilisent uniquement l'application mobile.");
          return;
        }
        localStorage.setItem("sad_token", data.accessToken);
        router.replace("/admin");
        router.refresh();
      } else {
        setErrorMessage("Identifiants invalides.");
      }
    } catch {
      setErrorMessage("Impossible de joindre le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sadblue flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col">
        {/* Logo Section */}
        <div className="flex justify-center mb-4">
          <Image 
            src="/logo.jpeg" 
            alt="Logo BF" 
            width={64} 
            height={64} 
            className="rounded-full object-cover"
          />
        </div>

        {/* Titles */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SAD-ALERTE</h1>
          <p className="text-sm text-gray-600 mt-2">
            Système d'Aide à la Décision pour l'Alerte Précoce
          </p>
          <p className="text-xs text-gray-400 mt-1">Connexion sécurisée</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMessage && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800" htmlFor="email">Email *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                id="email"
                type="email" 
                placeholder="votre.email@forces.bf"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sadred focus:border-sadred"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800" htmlFor="password">Mot de passe *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sadred focus:border-sadred"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 4.5 9 7 0 1.06-.72 2.52-1.96 3.84M6.1 6.1C3.9 7.57 2 9.85 2 12c0 2.5 4 7 10 7 2.14 0 4-.58 5.53-1.44" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <input 
                id="remember" 
                type="checkbox" 
                className="h-4 w-4 text-sadred focus:ring-sadred border-gray-300 rounded" 
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-2 bg-sadred hover:bg-[#a60000] text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sadred"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">Vous n'avez pas encore de compte ?</p>
          <Link 
            href="/demander-acces" 
            className="block w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            Demander un accès
          </Link>
        </div>

        {/* Security Info Box */}
        <div className="mt-6 bg-[#ebf3f9] border border-[#d0e3f2] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-800 font-semibold">
            <svg className="h-4 w-4 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm3 7H7V7a3 3 0 016 0v2z" clipRule="evenodd" />
            </svg>
            Connexion sécurisée
          </div>
          <ul className="list-disc list-inside text-xs text-blue-800 space-y-1">
            <li>Authentification à 2 facteurs (2FA) activée</li>
            <li>Votre compte doit être validé par un administrateur</li>
            <li>Accès réservé au personnel autorisé uniquement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
