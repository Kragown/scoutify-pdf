"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, MapPin } from "lucide-react";
import { FormulaireJoueur } from "@/lib/types";

export default function StaffPage() {
  const [formulaires, setFormulaires] = useState<FormulaireJoueur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFormulaires = async () => {
      try {
        const response = await fetch("/api/formulaires-joueur");
        const data = await response.json();
        
        if (data.success) {
          setFormulaires(data.data || []);
        } else {
          setError(data.error || "Erreur lors du chargement des formulaires");
        }
      } catch (err) {
        setError("Erreur lors de la récupération des formulaires");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormulaires();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status?: string) => {
    if (status === "Traité") {
      return "bg-green-500/20 text-green-400 border-green-500/50";
    }
    return "bg-scout-orange/20 text-scout-orange border-scout-orange/50";
  };

  return (
    <div className="min-h-screen bg-scout-dark font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tighter italic">
              <span className="text-white">#S</span>
              <span className="text-white">COUTIFY</span>
            </span>
          </div>

          <button
            onClick={() => router.push("/")}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm py-2 px-6 rounded-full uppercase tracking-wide transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2 uppercase">
              Liste des Formulaires
            </h1>
            <p className="text-white/60 text-sm uppercase tracking-wide">
              {formulaires.length} formulaire{formulaires.length > 1 ? "s" : ""} enregistré{formulaires.length > 1 ? "s" : ""}
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-scout-orange border-t-transparent"></div>
              <p className="text-white/60 mt-4">Chargement des formulaires...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-6 py-4 text-red-400 mb-6">
              <p className="font-bold">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {formulaires.length === 0 ? (
                <div className="bg-scout-card border border-white/10 rounded-lg p-12 text-center">
                  <p className="text-white/60 text-lg">Aucun formulaire enregistré</p>
                </div>
              ) : (
                <div className="bg-scout-card border border-white/10 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black/30 border-b border-white/10">
                        <tr>
                          <th className="text-left px-6 py-4 text-white/80 font-bold text-sm uppercase tracking-wide">
                            Joueur
                          </th>
                          <th className="text-left px-6 py-4 text-white/80 font-bold text-sm uppercase tracking-wide">
                            Poste
                          </th>
                          <th className="text-left px-6 py-4 text-white/80 font-bold text-sm uppercase tracking-wide">
                            Date de création
                          </th>
                          <th className="text-left px-6 py-4 text-white/80 font-bold text-sm uppercase tracking-wide">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formulaires.map((formulaire) => (
                          <tr
                            key={formulaire.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-scout-orange/20 flex items-center justify-center">
                                  <User className="w-5 h-5 text-scout-orange" />
                                </div>
                                <div>
                                  <p className="text-white font-bold">
                                    {formulaire.prenom} {formulaire.nom}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-white/40" />
                                <span className="text-white/80">
                                  {formulaire.poste_principal}
                                  {formulaire.poste_secondaire && (
                                    <span className="text-white/50">
                                      {" "}| {formulaire.poste_secondaire}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-white/40" />
                                <span className="text-white/80 text-sm">
                                  {formatDate(formulaire.created_at)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(
                                  formulaire.status
                                )}`}
                              >
                                {formulaire.status || "À traiter"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
