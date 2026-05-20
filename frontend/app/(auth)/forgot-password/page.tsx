"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getApiBase } from "../../../lib/client-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${getApiBase()}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage("Une erreur est survenue. Veuillez réessayer plus tard.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Impossible de joindre le serveur. Vérifiez votre connexion.");
    }
  };

  return (
    <div className="min-h-screen bg-sadblue flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col">
        {/* Logo Section */}
        <div className="flex justify-center mb-4">
          <Link href="/login">
            <Image 
              src="/logo.jpeg" 
              alt="Logo BF" 
              width={64} 
              height={64} 
              className="rounded-full object-cover"
            />
          </Link>
        </div>

        {/* Titles */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mot de passe oublié</h1>
          <p className="text-sm text-gray-600 mt-2">
            Entrez votre adresse email pour recevoir un lien de réinitialisation sécurisé.
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-6">
              <p className="text-green-800 text-sm">
                Si un compte actif correspond à cette adresse email, un lien de réinitialisation a été envoyé.
              </p>
              <p className="text-green-800 text-sm mt-2 font-semibold">
                Pensez à vérifier vos courriers indésirables (spams).
              </p>
            </div>
            <Link 
              href="/login" 
              className="inline-block w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-sadred bg-red-50 hover:bg-red-100 transition-colors"
            >
              Retour à la connexion
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

            <button 
              type="submit" 
              disabled={status === "loading"}
              className="w-full mt-2 bg-sadred hover:bg-[#a60000] text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sadred disabled:opacity-70"
            >
              {status === "loading" ? "Envoi en cours..." : "Envoyer le lien"}
            </button>

            <div className="text-center mt-2">
              <Link href="/login" className="text-sm text-gray-600 hover:text-sadred transition-colors">
                Retour à la page de connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
