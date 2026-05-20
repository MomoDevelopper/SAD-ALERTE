"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBase } from "../../../lib/client-auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setErrorMessage("Lien invalide ou expiré.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return;

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 10) {
      setStatus("error");
      setErrorMessage("Le mot de passe doit contenir au moins 10 caractères.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${getApiBase()}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password })
      });

      if (response.ok) {
        setStatus("success");
      } else {
        const data = await response.json().catch(() => ({}));
        setStatus("error");
        if (data.error === "INVALID_TOKEN" || data.error === "EXPIRED_TOKEN") {
          setErrorMessage("Le lien est invalide ou a expiré. Veuillez refaire une demande.");
        } else {
          setErrorMessage("Une erreur est survenue lors de la réinitialisation.");
        }
      }
    } catch {
      setStatus("error");
      setErrorMessage("Impossible de joindre le serveur. Vérifiez votre connexion.");
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-sadblue flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="text-red-500 mb-4 flex justify-center">
             <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h2>
          <p className="text-gray-600 mb-6">Le lien de réinitialisation est incomplet ou invalide.</p>
          <Link href="/forgot-password" className="text-sadred hover:underline font-medium">
            Faire une nouvelle demande
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nouveau mot de passe</h1>
          <p className="text-sm text-gray-600 mt-2">
            Veuillez définir votre nouveau mot de passe pour {email}
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-6 flex flex-col items-center">
              <svg className="w-12 h-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-semibold">
                Mot de passe modifié avec succès !
              </p>
              <p className="text-green-700 text-sm mt-1">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
            </div>
            <Link 
              href="/login" 
              className="inline-block w-full py-3 px-4 bg-sadred hover:bg-[#a60000] text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sadred"
            >
              Aller à la page de connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {status === "error" && (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800" htmlFor="password">Nouveau mot de passe *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Au moins 10 caractères"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sadred focus:border-sadred"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
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

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800" htmlFor="confirmPassword">Confirmer le mot de passe *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input 
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Retapez le mot de passe"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sadred focus:border-sadred"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status === "loading"}
              className="w-full mt-2 bg-sadred hover:bg-[#a60000] text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sadred disabled:opacity-70"
            >
              {status === "loading" ? "Réinitialisation..." : "Réinitialiser"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sadblue flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center text-gray-600">
          Chargement...
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
