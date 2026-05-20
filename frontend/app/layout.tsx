import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SAD-ALERTE",
  description: "Système d’Aide à la Décision pour l’Alerte Précoce",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

