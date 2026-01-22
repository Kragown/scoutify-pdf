"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, MapPin, Filter, ChevronDown, X, EllipsisVertical, Eye, Trash2, Copy, FileText } from "lucide-react";
import { FormulaireJoueur } from "@/lib/types";

export default function StaffPage() {
  const [formulaires, setFormulaires] = useState<FormulaireJoueur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'À traiter' | 'Traité' | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openActionsMenu, setOpenActionsMenu] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);
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
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status?: string) => {
    if (status === "Traité") {
      return "bg-green-500/20 text-green-400 border-green-500/50";
    }
    return "bg-scout-orange/20 text-scout-orange border-scout-orange/50";
  };

  const toggleStatus = async (formulaireId: number, currentStatus?: string) => {
    const newStatus = currentStatus === "Traité" ? "À traiter" : "Traité";
    setUpdatingStatus(formulaireId);

    try {
      const response = await fetch(`/api/formulaires-joueur/${formulaireId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setFormulaires((prev) =>
          prev.map((f) =>
            f.id === formulaireId ? { ...f, status: newStatus as 'À traiter' | 'Traité' } : f
          )
        );
      } else {
        setError(data.error || "Erreur lors de la mise à jour du statut");
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour du statut");
      console.error(err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredFormulaires = statusFilter
    ? formulaires.filter((f) => (f.status || "À traiter") === statusFilter)
    : formulaires;

  const getFilterLabel = () => {
    if (statusFilter === null) return "Tous les statuts";
    return statusFilter;
  };

  const generatePDF = async (formulaireId: number) => {
    setGeneratingPdfId(formulaireId);
    try {
      const response = await fetch(`/api/formulaires-joueur/${formulaireId}/pdf`);
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors de la génération du PDF");
        return;
      }

      // Créer un blob et télécharger le PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${formulaires.find(f => f.id === formulaireId)?.prenom}_${formulaires.find(f => f.id === formulaireId)?.nom}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setOpenActionsMenu(null);
    } catch (err) {
      setError("Erreur lors de la génération du PDF");
      console.error(err);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const duplicateFormulaire = async (formulaireId: number) => {
    setDuplicatingId(formulaireId);
    try {
      const response = await fetch(`/api/formulaires-joueur/${formulaireId}`);
      const data = await response.json();

      if (!data.success || !data.data) {
        setError("Erreur lors de la récupération du formulaire");
        return;
      }

      const formulaire = data.data;

      const duplicateData = {
        nom: formulaire.nom,
        prenom: formulaire.prenom,
        nationalites: formulaire.nationalites,
        date_naissance: formulaire.date_naissance,
        pied_fort: formulaire.pied_fort,
        taille_cm: formulaire.taille_cm,
        couleur_cv: formulaire.couleur_cv,
        poste_principal: formulaire.poste_principal,
        poste_secondaire: formulaire.poste_secondaire,
        url_transfermarkt: formulaire.url_transfermarkt,
        photo_joueur: formulaire.photo_joueur,
        vma: formulaire.vma,
        envergure: formulaire.envergure,
        email: formulaire.email,
        telephone: formulaire.telephone,
        email_agent_sportif: formulaire.email_agent_sportif,
        telephone_agent_sportif: formulaire.telephone_agent_sportif,
        qualites: formulaire.qualites?.map((q: any) => q.libelle) || [],
        saisons: formulaire.saisons?.map((s: any) => ({
          club: s.club,
          categorie: s.categorie,
          division: s.division,
          periode: s.periode,
          mi_saison: s.mi_saison,
          periode_type: s.periode_type,
          logo_club: s.logo_club,
          logo_division: s.logo_division,
          badge_capitanat: s.badge_capitanat,
          badge_surclasse: s.badge_surclasse,
          badge_champion: s.badge_champion,
          badge_coupe_remportee: s.badge_coupe_remportee,
          matchs: s.matchs,
          buts: s.buts,
          passes_decisives: s.passes_decisives,
          temps_jeu_moyen: s.temps_jeu_moyen,
          saison_actuelle: s.saison_actuelle,
          ordre: s.ordre,
        })) || [],
        formations: formulaire.formations?.map((f: any) => ({
          annee_ou_periode: f.annee_ou_periode,
          titre_structure: f.titre_structure,
          details: f.details,
          ordre: f.ordre,
        })) || [],
        interets: formulaire.interets?.map((i: any) => ({
          club: i.club,
          annee: i.annee,
          logo_club: i.logo_club,
          ordre: i.ordre,
        })) || [],
      };

      const createResponse = await fetch("/api/formulaires-joueur", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateData),
      });

      const createData = await createResponse.json();

      if (createData.success) {
        const listResponse = await fetch("/api/formulaires-joueur");
        const listData = await listResponse.json();
        
        if (listData.success) {
          setFormulaires(listData.data || []);
        }
        setOpenActionsMenu(null);
      } else {
        setError(createData.error || "Erreur lors de la duplication");
      }
    } catch (err) {
      setError("Erreur lors de la duplication du formulaire");
      console.error(err);
    } finally {
      setDuplicatingId(null);
    }
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2 uppercase">
                  Liste des Formulaires
                </h1>
                <p className="text-white/60 text-sm uppercase tracking-wide">
                  {filteredFormulaires.length} formulaire{filteredFormulaires.length > 1 ? "s" : ""} 
                  {statusFilter && ` (${formulaires.length} au total)`}
                </p>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="bg-scout-card border border-white/10 hover:border-scout-orange/50 text-white font-bold text-sm py-2 px-4 rounded-lg uppercase tracking-wide transition-all flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>{getFilterLabel()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 z-20 bg-scout-card border border-white/10 rounded-lg shadow-xl min-w-[200px] overflow-hidden">
                      <button
                        onClick={() => {
                          setStatusFilter(null);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                          statusFilter === null
                            ? "bg-scout-orange/20 text-scout-orange"
                            : "text-white hover:bg-white/5"
                        }`}
                      >
                        Tous les statuts
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("À traiter");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors border-t border-white/10 ${
                          statusFilter === "À traiter"
                            ? "bg-scout-orange/20 text-scout-orange"
                            : "text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-scout-orange"></span>
                          À traiter
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("Traité");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors border-t border-white/10 ${
                          statusFilter === "Traité"
                            ? "bg-green-500/20 text-green-400"
                            : "text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          Traité
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {statusFilter && (
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStatusFilter(null)}
                  className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide hover:bg-blue-500/30 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Filtrer par: {statusFilter}
                </button>
              </div>
            )}
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
              ) : filteredFormulaires.length === 0 ? (
                <div className="bg-scout-card border border-white/10 rounded-lg p-12 text-center">
                  <p className="text-white/60 text-lg">Aucun formulaire avec le statut "{statusFilter}"</p>
                  <button
                    onClick={() => setStatusFilter(null)}
                    className="mt-4 text-scout-orange hover:text-scout-orange/80 text-sm font-bold uppercase tracking-wide"
                  >
                    Réinitialiser le filtre
                  </button>
                </div>
              ) : (
                <div className="bg-scout-card border border-white/10 rounded-lg">
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
                          <th className="text-right px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFormulaires.map((formulaire) => (
                          <tr
                            key={formulaire.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="text-white font-bold">
                                    {formulaire.prenom} {formulaire.nom}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
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
                              <button
                                onClick={() => toggleStatus(formulaire.id!, formulaire.status)}
                                disabled={updatingStatus === formulaire.id}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border transition-all cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(
                                  formulaire.status
                                )}`}
                                title={`Cliquer pour changer le statut en ${formulaire.status === "Traité" ? "À traiter" : "Traité"}`}
                              >
                                {updatingStatus === formulaire.id ? (
                                  <span className="flex items-center gap-2">
                                    <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                    ...
                                  </span>
                                ) : (
                                  formulaire.status || "À traiter"
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative flex justify-end">
                                <button
                                  onClick={() => setOpenActionsMenu(openActionsMenu === formulaire.id ? null : formulaire.id!)}
                                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                  title="Actions"
                                >
                                  <EllipsisVertical className="w-5 h-5" />
                                </button>

                                {openActionsMenu === formulaire.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setOpenActionsMenu(null)}
                                    />
                                    <div className="absolute right-0 mt-2 z-20 bg-scout-card border border-white/10 rounded-lg shadow-xl min-w-[180px] overflow-hidden">
                                      <button
                                        onClick={() => {
                                          router.push(`/staff/${formulaire.id}/edit`);
                                          setOpenActionsMenu(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                      >
                                        <Eye className="w-4 h-4" />
                                        Editer
                                      </button>
                                      <button
                                        onClick={() => {
                                          generatePDF(formulaire.id!);
                                        }}
                                        disabled={generatingPdfId === formulaire.id}
                                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {generatingPdfId === formulaire.id ? (
                                          <>
                                            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                            Génération...
                                          </>
                                        ) : (
                                          <>
                                            <FileText className="w-4 h-4" />
                                            Générer CV
                                          </>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => {
                                          duplicateFormulaire(formulaire.id!);
                                          setOpenActionsMenu(null);
                                        }}
                                        disabled={duplicatingId === formulaire.id}
                                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {duplicatingId === formulaire.id ? (
                                          <>
                                            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                            Duplication...
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-4 h-4" />
                                            Dupliquer
                                          </>
                                        )}
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (confirm(`Êtes-vous sûr de vouloir supprimer le formulaire de ${formulaire.prenom} ${formulaire.nom} ?`)) {
                                            try {
                                              const response = await fetch(`/api/formulaires-joueur/${formulaire.id}`, {
                                                method: "DELETE",
                                              });
                                              const data = await response.json();
                                              
                                              if (data.success) {
                                                setFormulaires((prev) => prev.filter((f) => f.id !== formulaire.id));
                                                setOpenActionsMenu(null);
                                              } else {
                                                setError(data.error || "Erreur lors de la suppression");
                                              }
                                            } catch (err) {
                                              setError("Erreur lors de la suppression");
                                              console.error(err);
                                            }
                                          }
                                          setOpenActionsMenu(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/10"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
