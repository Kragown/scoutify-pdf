"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, CheckCircle2, XCircle, Plus, X } from "lucide-react";
import { FormulaireJoueur, POSTES } from "@/lib/types";

export default function EditFormulairePage() {
  const params = useParams();
  const router = useRouter();
  const formulaireId = params.id as string;

  const [formulaire, setFormulaire] = useState<FormulaireJoueur | null>(null);
  const [qualites, setQualites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFormulaire = async () => {
      try {
        const response = await fetch(`/api/formulaires-joueur/${formulaireId}`);
        const data = await response.json();

        if (data.success) {
          setFormulaire(data.data);
          // Initialiser les qualités depuis le formulaire
          const qualitesArray = data.data.qualites?.map((q: any) => q.libelle) || [];
          setQualites(qualitesArray);
        } else {
          setError(data.error || "Erreur lors du chargement du formulaire");
        }
      } catch (err) {
        setError("Erreur lors de la récupération du formulaire");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (formulaireId) {
      fetchFormulaire();
    }
  }, [formulaireId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formulaire) return;

    // Validation des qualités
    const validQualites = qualites.filter((q) => q.trim().length > 0);
    if (validQualites.length === 0) {
      setError("Au moins une qualité est requise");
      return;
    }
    if (validQualites.length > 6) {
      setError("Maximum 6 qualités autorisées");
      return;
    }
    for (const qualite of validQualites) {
      if (qualite.length > 24) {
        setError(`La qualité "${qualite}" dépasse 24 caractères`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/formulaires-joueur/${formulaireId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
          status: formulaire.status,
          archive: formulaire.archive,
          qualites: validQualites,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/staff");
        }, 1500);
      } else {
        setError(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FormulaireJoueur, value: any) => {
    if (!formulaire) return;
    setFormulaire({ ...formulaire, [field]: value });
  };

  const addQualite = () => {
    if (qualites.length >= 6) {
      setError("Maximum 6 qualités autorisées");
      return;
    }
    setQualites([...qualites, ""]);
  };

  const removeQualite = (index: number) => {
    if (qualites.length <= 1) {
      setError("Au moins une qualité est requise");
      return;
    }
    setQualites(qualites.filter((_, i) => i !== index));
  };

  const updateQualite = (index: number, value: string) => {
    if (value.length > 24) {
      setError("Une qualité ne peut pas dépasser 24 caractères");
      return;
    }
    const newQualites = [...qualites];
    newQualites[index] = value;
    setQualites(newQualites);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-scout-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-scout-orange animate-spin mx-auto mb-4" />
          <p className="text-white/60">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  if (error && !formulaire) {
    return (
      <div className="min-h-screen bg-scout-dark flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push("/staff")}
            className="bg-scout-orange hover:bg-orange-600 text-black font-bold py-2 px-6 rounded-full uppercase tracking-wide transition-all"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!formulaire) return null;

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
            onClick={() => router.push("/staff")}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm py-2 px-6 rounded-full uppercase tracking-wide transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2 uppercase">
              Éditer le Formulaire
            </h1>
            <p className="text-white/60 text-sm uppercase tracking-wide">
              {formulaire.prenom} {formulaire.nom}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg px-6 py-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-bold">Formulaire mis à jour avec succès !</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg px-6 py-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 font-bold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations Personnelles */}
            <div className="bg-scout-card border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wide border-b border-white/10 pb-3">
                Informations Personnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formulaire.prenom || ""}
                    onChange={(e) => handleChange("prenom", e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formulaire.nom || ""}
                    onChange={(e) => handleChange("nom", e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    value={formulaire.date_naissance || ""}
                    onChange={(e) => handleChange("date_naissance", e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Nationalités *
                  </label>
                  <input
                    type="text"
                    value={formulaire.nationalites || ""}
                    onChange={(e) => handleChange("nationalites", e.target.value)}
                    required
                    className="input-field"
                    placeholder="Ex: France, Espagne"
                  />
                </div>
              </div>
            </div>

            {/* Poste */}
            <div className="bg-scout-card border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wide border-b border-white/10 pb-3">
                Poste
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Poste Principal *
                  </label>
                  <select
                    value={formulaire.poste_principal || ""}
                    onChange={(e) => handleChange("poste_principal", e.target.value)}
                    required
                    className="input-field"
                  >
                    <option value="">Sélectionner un poste</option>
                    {POSTES.map((poste) => (
                      <option key={poste} value={poste}>
                        {poste}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Poste Secondaire
                  </label>
                  <select
                    value={formulaire.poste_secondaire || ""}
                    onChange={(e) => handleChange("poste_secondaire", e.target.value || null)}
                    className="input-field"
                  >
                    <option value="">Aucun</option>
                    {POSTES.map((poste) => (
                      <option key={poste} value={poste}>
                        {poste}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Caractéristiques Physiques */}
            <div className="bg-scout-card border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wide border-b border-white/10 pb-3">
                Caractéristiques Physiques
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Taille (cm) *
                  </label>
                  <input
                    type="number"
                    value={formulaire.taille_cm || ""}
                    onChange={(e) => handleChange("taille_cm", parseInt(e.target.value) || 0)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Pied Fort *
                  </label>
                  <select
                    value={formulaire.pied_fort || "Droit"}
                    onChange={(e) => handleChange("pied_fort", e.target.value as "Droit" | "Gauche" | "Ambidextre")}
                    required
                    className="input-field"
                  >
                    <option value="Droit">Droit</option>
                    <option value="Gauche">Gauche</option>
                    <option value="Ambidextre">Ambidextre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    VMA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formulaire.vma || ""}
                    onChange={(e) => handleChange("vma", e.target.value ? parseFloat(e.target.value) : null)}
                    className="input-field"
                  />
                </div>
                {(formulaire.poste_principal === 'GB' || formulaire.poste_secondaire === 'GB') && (
                  <div>
                    <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                      Envergure
                    </label>
                    <input
                      type="number"
                      value={formulaire.envergure || ""}
                      onChange={(e) => handleChange("envergure", e.target.value ? parseFloat(e.target.value) : null)}
                      className="input-field"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-scout-card border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wide border-b border-white/10 pb-3">
                Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formulaire.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formulaire.telephone || ""}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    required
                    className="input-field"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Email Agent Sportif
                  </label>
                  <input
                    type="email"
                    value={formulaire.email_agent_sportif || ""}
                    onChange={(e) => handleChange("email_agent_sportif", e.target.value || null)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Téléphone Agent Sportif
                  </label>
                  <input
                    type="tel"
                    value={formulaire.telephone_agent_sportif || ""}
                    onChange={(e) => handleChange("telephone_agent_sportif", e.target.value || null)}
                    className="input-field"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Autres Informations */}
            <div className="bg-scout-card border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wide border-b border-white/10 pb-3">
                Autres Informations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    URL Transfermarkt
                  </label>
                  <input
                    type="url"
                    value={formulaire.url_transfermarkt || ""}
                    onChange={(e) => handleChange("url_transfermarkt", e.target.value || null)}
                    className="input-field"
                    placeholder="https://www.transfermarkt.fr/..."
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Photo Joueur *
                  </label>
                  <input
                    type="text"
                    value={formulaire.photo_joueur || ""}
                    onChange={(e) => handleChange("photo_joueur", e.target.value)}
                    required
                    className="input-field"
                    placeholder="/photos/joueur.jpg"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Couleur CV *
                  </label>
                  <input
                    type="color"
                    value={formulaire.couleur_cv || "#1E5EFF"}
                    onChange={(e) => handleChange("couleur_cv", e.target.value)}
                    required
                    className="input-field h-12"
                  />
                </div>
              </div>
            </div>

            {/* Qualités */}
            <div className="bg-scout-card border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide border-b border-white/10 pb-3 flex-1">
                  Qualités
                </h2>
                <button
                  type="button"
                  onClick={addQualite}
                  disabled={qualites.length >= 6}
                  className="bg-scout-orange/20 hover:bg-scout-orange/30 text-scout-orange font-bold py-2 px-4 rounded-lg uppercase tracking-wide transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {qualites.map((qualite, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={qualite}
                      onChange={(e) => updateQualite(index, e.target.value)}
                      maxLength={24}
                      placeholder={`Qualité ${index + 1} (max 24 caractères)`}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeQualite(index)}
                      disabled={qualites.length <= 1}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Supprimer cette qualité"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {qualites.length === 0 && (
                  <p className="text-white/40 text-sm italic">Aucune qualité. Cliquez sur "Ajouter" pour en ajouter une.</p>
                )}
                <p className="text-white/60 text-xs mt-2">
                  {qualites.length}/6 qualités • Maximum 24 caractères par qualité
                </p>
              </div>
            </div>

            {/* Statut */}
            <div className="bg-scout-card border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wide border-b border-white/10 pb-3">
                Statut
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Statut
                  </label>
                  <select
                    value={formulaire.status || "À traiter"}
                    onChange={(e) => handleChange("status", e.target.value as "À traiter" | "Traité")}
                    className="input-field"
                  >
                    <option value="À traiter">À traiter</option>
                    <option value="Traité">Traité</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/staff")}
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wide transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-scout-orange hover:bg-orange-600 text-black font-extrabold py-3 px-8 rounded-lg uppercase tracking-wide transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
