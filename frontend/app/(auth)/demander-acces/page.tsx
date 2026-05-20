"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getApiBase } from "../../../lib/client-auth";

export default function RegisterPage() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [zone, setZone] = useState("");
  const [matricule, setMatricule] = useState("");
  const [unite, setUnite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 10) {
      setErrorMessage("Le mot de passe doit contenir au moins 10 caractères (exigence du serveur).");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(`${getApiBase()}/api/auth/request-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
      };

      if (!response.ok) {
        if (data.error === "VALIDATION_ERROR" && data.details?.fieldErrors) {
          const parts = Object.values(data.details.fieldErrors).flat();
          setErrorMessage(parts.length ? parts.join(" ") : "Données invalides.");
        } else if (data.error === "EMAIL_TAKEN" || response.status === 409) {
          setErrorMessage("Cette adresse e-mail est déjà enregistrée. Utilisez une autre adresse ou connectez-vous.");
        } else if (data.error === "SIGNUP_INTERNAL_ERROR" || response.status >= 500) {
          setErrorMessage(
            "Une erreur technique s'est produite côté serveur. Réessayez dans quelques instants. Si le problème continue, contactez l'administrateur."
          );
        } else {
          setErrorMessage("La demande a été refusée. Réessayez ou contactez l'administrateur.");
        }
        return;
      }

      setSuccessMessage(
        "Demande enregistrée. Votre compte sera activé par un administrateur après vérification. Vous pouvez vous connecter une fois activé."
      );
      setPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("Impossible de joindre le serveur. Vérifiez que l'API est démarrée.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sadblue flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col">
        <div className="flex justify-center mb-4">
          <Image src="/logo.jpeg" alt="Logo BF" width={64} height={64} className="rounded-full object-cover" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SAD-ALERTE - Demande d'inscription</h1>
          <p className="text-sm text-gray-600 mt-2">Système d'Aide à la Décision pour l'Alerte Précoce</p>
        </div>

        <div className="mb-6 bg-[#fffbea] border border-[#fef08a] rounded-lg p-4 flex gap-3">
          <div className="mt-0.5">
            <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">Accès réservé au personnel autorisé</h3>
            <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
              Toute demande frauduleuse sera signalée aux autorités compétentes. Votre compte sera activé uniquement
              après vérification de votre identité par un administrateur.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Nom *</label>
              <input
                type="text"
                placeholder="OUEDRAOGO"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sadred focus:outline-none"
                title="Nom de famille"
                aria-label="Nom de famille"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Prénom(s) *</label>
              <input
                type="text"
                placeholder="Moumouni"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sadred focus:outline-none"
                title="Prénom(s)"
                aria-label="Prénom(s)"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Email *</label>
              <input
                type="email"
                placeholder="exemple@forces.bf"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sadred focus:outline-none"
                title="Adresse email"
                aria-label="Adresse email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Téléphone *</label>
              <input
                type="tel"
                placeholder="+226 XX XX XX XX"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sadred focus:outline-none"
                title="Numéro de téléphone"
                aria-label="Numéro de téléphone"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Profil *</label>
              <input
                type="text"
                value="Agent de terrain"
                disabled
                className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600"
                title="Profil utilisateur"
                aria-label="Profil utilisateur"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Zone d'affectation *</label>
              <select
                required
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sadred focus:outline-none text-gray-600"
                title="Zone d'affectation"
                aria-label="Zone d'affectation"
              >
                <option value="" disabled>
                  Sélectionnez une région
                </option>
                <option value="sahel">Sahel</option>
                <option value="nord">Nord</option>
                <option value="centre-nord">Centre-Nord</option>
                <option value="est">Est</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Matricule / Numéro d'identification *</label>
              <input
                type="text"
                placeholder="Ex: FAN-12345"
                required
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sadred focus:outline-none"
                title="Matricule ou numéro d'identification"
                aria-label="Matricule ou numéro d'identification"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Unité / Service *</label>
              <input
                type="text"
                placeholder="Ex: 3ème Régiment d'Infanterie"
                required
                value={unite}
                onChange={(e) => setUnite(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sadred focus:outline-none"
                title="Unité ou service"
                aria-label="Unité ou service"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Mot de passe *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Au moins 10 caractères"
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sadred focus:outline-none"
                  title="Mot de passe (au moins 10 caractères)"
                  aria-label="Mot de passe (au moins 10 caractères)"
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
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">Confirmer le mot de passe *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Retapez votre mot de passe"
                  required
                  minLength={10}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sadred focus:outline-none"
                  title="Confirmation du mot de passe"
                  aria-label="Confirmation du mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showConfirmPassword ? (
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
          </div>

          <div className="mt-2 bg-[#ebf3f9] border border-[#d0e3f2] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-800 font-semibold">
              <svg className="h-4 w-4 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm3 7H7V7a3 3 0 016 0v2z"
                  clipRule="evenodd"
                />
              </svg>
              Sécurité de votre compte :
            </div>
            <ul className="list-disc list-inside text-xs text-blue-800 space-y-1 ml-1">
              <li>Votre mot de passe doit contenir au moins 10 caractères (politique serveur)</li>
              <li>Utilisez un mélange de lettres, chiffres et caractères spéciaux</li>
              <li>Ne partagez jamais vos identifiants</li>
              <li>Double authentification (2FA) activée après validation</li>
            </ul>
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              required
              className="mt-1 h-4 w-4 text-sadred focus:ring-sadred border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-3 block text-xs text-gray-600 leading-relaxed">
              J'accepte les conditions d'utilisation et je certifie que les informations fournies sont exactes. Je
              comprends que toute fausse déclaration peut entraîner des poursuites judiciaires.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0a0a1a] hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {isSubmitting ? "Envoi en cours…" : "Soumettre ma demande"}
          </button>

          <div className="text-center mt-2">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Retour à la page de connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
