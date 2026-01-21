"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, CheckCircle2, XCircle, Plus, X, Calendar } from "lucide-react";
import { FormulaireJoueur, POSTES, CreateSaisonDto, DIVISIONS } from "@/lib/types";

export default function EditFormulairePage() {
  const params = useParams();
  const router = useRouter();
  const formulaireId = params.id as string;

  const [formulaire, setFormulaire] = useState<FormulaireJoueur | null>(null);
  const [qualites, setQualites] = useState<string[]>([]);
  const [saisons, setSaisons] = useState<CreateSaisonDto[]>([]);
  const [nationalites, setNationalites] = useState<string[]>([]);
  const [newNationalite, setNewNationalite] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [logoPreviews, setLogoPreviews] = useState<Record<string, string>>({});
  const [uploadingLogos, setUploadingLogos] = useState<Record<string, boolean>>({});
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
          const qualitesArray = data.data.qualites?.map((q: any) => q.libelle) || [];
          setQualites(qualitesArray);
          const saisonsArray = data.data.saisons?.map((s: any) => ({
            club: s.club || '',
            categorie: s.categorie || '',
            division: s.division || 'Autre',
            periode: s.periode || null,
            mi_saison: s.mi_saison || false,
            periode_type: s.periode_type || null,
            logo_club: s.logo_club || '',
            logo_division: s.logo_division || '',
            badge_capitanat: s.badge_capitanat || false,
            badge_surclasse: s.badge_surclasse || false,
            badge_champion: s.badge_champion || false,
            badge_coupe_remportee: s.badge_coupe_remportee || false,
            matchs: s.matchs || null,
            buts: s.buts || null,
            passes_decisives: s.passes_decisives || null,
            temps_jeu_moyen: s.temps_jeu_moyen || null,
            saison_actuelle: s.saison_actuelle || false,
            ordre: s.ordre || 0,
          })) || [];
          setSaisons(saisonsArray);
          // Initialiser les prévisualisations des logos
          const logoPreviewsMap: Record<string, string> = {};
          saisonsArray.forEach((s: any, index: number) => {
            if (s.logo_club) {
              logoPreviewsMap[`${index}-club`] = s.logo_club;
            }
            if (s.logo_division) {
              logoPreviewsMap[`${index}-division`] = s.logo_division;
            }
          });
          setLogoPreviews(logoPreviewsMap);
          let nationalitesArray: string[] = [];
          if (data.data.nationalites) {
            try {
              nationalitesArray = typeof data.data.nationalites === 'string' 
                ? JSON.parse(data.data.nationalites) 
                : Array.isArray(data.data.nationalites)
                ? data.data.nationalites
                : [data.data.nationalites];
            } catch {
              nationalitesArray = [data.data.nationalites];
            }
          }
          setNationalites(nationalitesArray.filter(Boolean));
          if (data.data.photo_joueur) {
            setPhotoPreview(data.data.photo_joueur);
          }
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

    if (nationalites.length === 0) {
      setError("Au moins une nationalité est requise");
      return;
    }

    if (!formulaire.photo_joueur || formulaire.photo_joueur.trim() === "") {
      setError("Une photo de joueur est requise");
      return;
    }

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
          nationalites: nationalites.length > 0 ? nationalites : [""],
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
          saisons: saisons.map((s, index) => ({
            ...s,
            ordre: index,
          })),
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

  const addNationalite = () => {
    const trimmed = newNationalite.trim();
    if (!trimmed) return;
    if (nationalites.includes(trimmed)) {
      setError("Cette nationalité est déjà ajoutée");
      return;
    }
    setNationalites([...nationalites, trimmed]);
    setNewNationalite("");
    setError(null);
  };

  const removeNationalite = (nationalite: string) => {
    setNationalites(nationalites.filter((n) => n !== nationalite));
  };

  const handleNationaliteKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNationalite();
    }
  };

  const addSaison = () => {
    setSaisons([...saisons, {
      club: '',
      categorie: '',
      division: 'Autre',
      periode: null,
      mi_saison: false,
      periode_type: null,
      logo_club: '',
      logo_division: '',
      badge_capitanat: false,
      badge_surclasse: false,
      badge_champion: false,
      badge_coupe_remportee: false,
      matchs: null,
      buts: null,
      passes_decisives: null,
      temps_jeu_moyen: null,
      saison_actuelle: false,
      ordre: saisons.length,
    }]);
  };

  const removeSaison = (index: number) => {
    setSaisons(saisons.filter((_, i) => i !== index));
    // Supprimer les prévisualisations associées
    const newPreviews = { ...logoPreviews };
    delete newPreviews[`${index}-club`];
    delete newPreviews[`${index}-division`];
    // Réindexer les prévisualisations pour les saisons suivantes
    const updatedPreviews: Record<string, string> = {};
    Object.keys(newPreviews).forEach((key) => {
      const [oldIndex, type] = key.split('-');
      const oldIdx = parseInt(oldIndex);
      if (oldIdx > index) {
        updatedPreviews[`${oldIdx - 1}-${type}`] = newPreviews[key];
      } else if (oldIdx < index) {
        updatedPreviews[key] = newPreviews[key];
      }
    });
    setLogoPreviews(updatedPreviews);
  };

  const updateSaison = (index: number, field: keyof CreateSaisonDto, value: any) => {
    const newSaisons = [...saisons];
    newSaisons[index] = { ...newSaisons[index], [field]: value };
    setSaisons(newSaisons);
  };

  const cropImageToPortrait = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Impossible de créer le contexte canvas'));
            return;
          }

          // Dimensions cibles en format portrait (ratio 3:4)
          const targetWidth = 600;
          const targetHeight = 800;
          
          // Calculer les dimensions pour recadrer au centre
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;
          
          // Calculer le ratio pour remplir le format portrait
          const imageRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight;
          
          if (imageRatio > targetRatio) {
            // L'image est plus large, on recadre les côtés
            sourceWidth = img.height * targetRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            // L'image est plus haute, on recadre le haut/bas
            sourceHeight = img.width / targetRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }
          
          // Configurer le canvas
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          // Dessiner l'image recadrée
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, targetWidth, targetHeight
          );
          
          // Convertir en blob puis en File
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la conversion'));
              return;
            }
            const croppedFile = new File([blob], file.name, { type: file.type });
            resolve(croppedFile);
          }, file.type, 0.9);
        };
        img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Le fichier doit être une image");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      setUploadingPhoto(true);
      try {
        const croppedFile = await cropImageToPortrait(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPhotoPreview(result);
        };
        reader.readAsDataURL(croppedFile);

        const formData = new FormData();
        formData.append('file', croppedFile);
        formData.append('type', 'photo');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          handleChange("photo_joueur", data.path);
          setPhotoPreview(data.path);
          setError(null);
        } else {
          setError(data.error || "Erreur lors de l'upload de l'image");
          setPhotoPreview(null);
        }
      } catch (err) {
        setError("Erreur lors du recadrage ou de l'upload de l'image");
        setPhotoPreview(null);
        console.error(err);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    handleChange("photo_joueur", url);
    setPhotoPreview(url || null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, saisonIndex: number, logoType: 'club' | 'division') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Le fichier doit être une image");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      const key = `${saisonIndex}-${logoType}`;
      setUploadingLogos({ ...uploadingLogos, [key]: true });
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'logo');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          updateSaison(saisonIndex, logoType === 'club' ? 'logo_club' : 'logo_division', data.path);
          setLogoPreviews({ ...logoPreviews, [key]: data.path });
          setError(null);
        } else {
          setError(data.error || "Erreur lors de l'upload de l'image");
        }
      } catch (err) {
        setError("Erreur lors de l'upload de l'image");
        console.error(err);
      } finally {
        setUploadingLogos({ ...uploadingLogos, [key]: false });
      }
    }
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>, saisonIndex: number, logoType: 'club' | 'division') => {
    const url = e.target.value;
    const key = `${saisonIndex}-${logoType}`;
    updateSaison(saisonIndex, logoType === 'club' ? 'logo_club' : 'logo_division', url);
    setLogoPreviews({ ...logoPreviews, [key]: url || '' });
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
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Nationalités *
                  </label>
                  <div className="space-y-3">
                    {/* Tags des nationalités */}
                    {nationalites.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {nationalites.map((nationalite, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 bg-scout-orange/20 text-scout-orange border border-scout-orange/50 rounded-full px-3 py-1 text-sm font-bold"
                          >
                            {nationalite}
                            <button
                              type="button"
                              onClick={() => removeNationalite(nationalite)}
                              className="hover:text-red-400 transition-colors"
                              title="Supprimer cette nationalité"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Input pour ajouter une nationalité */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNationalite}
                        onChange={(e) => setNewNationalite(e.target.value)}
                        onKeyPress={handleNationaliteKeyPress}
                        placeholder="Ajouter une nationalité (Appuyez sur Entrée)"
                        className="input-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={addNationalite}
                        disabled={!newNationalite.trim()}
                        className="bg-scout-orange hover:bg-orange-600 text-black font-bold py-2 px-4 rounded-lg uppercase tracking-wide transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter
                      </button>
                    </div>
                    {nationalites.length === 0 && (
                      <p className="text-white/40 text-sm italic">Aucune nationalité. Ajoutez-en au moins une.</p>
                    )}
                  </div>
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
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                    Photo Joueur *
                  </label>
                  <div className="space-y-4">
                    {/* Prévisualisation */}
                    {photoPreview && (
                      <div className="relative w-full max-w-xs mx-auto" style={{ aspectRatio: '3/4' }}>
                        <img
                          src={photoPreview}
                          alt="Photo du joueur"
                          className="w-full h-full object-cover rounded-lg border border-white/10"
                          onError={() => setPhotoPreview(null)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            handleChange("photo_joueur", "");
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                          title="Supprimer la photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Upload de fichier */}
                    <div>
                      <label className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-wide">
                        Télécharger une image
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-scout-orange file:text-black hover:file:bg-orange-600 file:cursor-pointer file:transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {uploadingPhoto && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-5 h-5 text-scout-orange animate-spin" />
                          </div>
                        )}
                      </div>
                      <p className="text-white/40 text-xs mt-1">Formats acceptés: JPG, PNG, GIF • Max 5MB</p>
                    </div>

                    {/* Ou URL */}
                    <div>
                      <label className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-wide">
                        Ou entrer une URL ou un chemin
                      </label>
                      <input
                        type="text"
                        value={formulaire.photo_joueur?.startsWith('data:') ? '' : (formulaire.photo_joueur || '')}
                        onChange={handlePhotoUrlChange}
                        className="input-field"
                        placeholder="https://example.com/photo.jpg ou /photos/joueur.jpg"
                      />
                    </div>
                  </div>
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

            {/* Carrière (Saisons) */}
            <div className="bg-scout-card border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide border-b border-white/10 pb-3 flex-1">
                  Carrière
                </h2>
                <button
                  type="button"
                  onClick={addSaison}
                  className="bg-scout-orange/20 hover:bg-scout-orange/30 text-scout-orange font-bold py-2 px-4 rounded-lg uppercase tracking-wide transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une saison
                </button>
              </div>
              <div className="space-y-6">
                {saisons.map((saison, index) => (
                  <div key={index} className="border border-white/10 rounded-lg p-4 bg-black/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold uppercase tracking-wide">Saison {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeSaison(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Supprimer cette saison"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Club *
                        </label>
                        <input
                          type="text"
                          value={saison.club}
                          onChange={(e) => updateSaison(index, 'club', e.target.value)}
                          required
                          className="input-field"
                          placeholder="Nom du club"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Catégorie *
                        </label>
                        <div className="flex items-center gap-4">
                          <select
                            value={saison.categorie.replace(' National', '')}
                            onChange={(e) => {
                              const baseCategorie = e.target.value;
                              const currentCategorie = saison.categorie;
                              const isNational = currentCategorie.includes(' National');
                              updateSaison(index, 'categorie', isNational ? `${baseCategorie} National` : baseCategorie);
                            }}
                            required
                            className="input-field flex-1"
                          >
                            <option value="">Sélectionner une catégorie</option>
                            {['U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U14', 'U13'].map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={saison.categorie.includes(' National')}
                              onChange={(e) => {
                                const baseCategorie = saison.categorie.replace(' National', '');
                                updateSaison(index, 'categorie', e.target.checked ? `${baseCategorie} National` : baseCategorie);
                              }}
                              className="w-5 h-5 rounded border-white/20 bg-scout-card text-scout-orange focus:ring-scout-orange focus:ring-2"
                            />
                            <span className="text-white/80 text-sm font-bold uppercase tracking-wide">
                              National
                            </span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Division *
                        </label>
                        <select
                          value={saison.division}
                          onChange={(e) => updateSaison(index, 'division', e.target.value)}
                          required
                          className="input-field"
                        >
                          {DIVISIONS.map((div) => (
                            <option key={div} value={div}>
                              {div}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Période
                        </label>
                        <select
                          value={saison.periode || ''}
                          onChange={(e) => updateSaison(index, 'periode', e.target.value || null)}
                          className="input-field"
                        >
                          <option value="">Sélectionner une période</option>
                          {['2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026'].map((periode) => (
                            <option key={periode} value={periode}>
                              {periode}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saison.mi_saison || false}
                            onChange={(e) => updateSaison(index, 'mi_saison', e.target.checked)}
                            className="w-5 h-5 rounded border-white/20 bg-scout-card text-scout-orange focus:ring-scout-orange focus:ring-2"
                          />
                          <span className="text-white/80 text-sm font-bold uppercase tracking-wide">
                            Mi-saison
                          </span>
                        </label>
                        {saison.mi_saison && (
                          <select
                            value={saison.periode_type || ''}
                            onChange={(e) => updateSaison(index, 'periode_type', e.target.value || null)}
                            className="input-field"
                          >
                            <option value="">Sélectionner</option>
                            <option value="Hiver">Hiver</option>
                            <option value="Été">Été</option>
                          </select>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saison.saison_actuelle || false}
                            onChange={(e) => updateSaison(index, 'saison_actuelle', e.target.checked)}
                            className="w-5 h-5 rounded border-white/20 bg-scout-card text-scout-orange focus:ring-scout-orange focus:ring-2"
                          />
                          <span className="text-white/80 text-sm font-bold uppercase tracking-wide">
                            Saison actuelle
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Logo Club
                        </label>
                        <div className="space-y-4">
                          {/* Prévisualisation Logo Club */}
                          {logoPreviews[`${index}-club`] && (
                            <div className="relative w-full max-w-xs">
                              <img
                                src={logoPreviews[`${index}-club`]}
                                alt="Logo du club"
                                className="w-24 h-24 object-contain rounded-lg border border-white/10 bg-white/5 p-2"
                                onError={() => {
                                  const newPreviews = { ...logoPreviews };
                                  delete newPreviews[`${index}-club`];
                                  setLogoPreviews(newPreviews);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  updateSaison(index, 'logo_club', '');
                                  const newPreviews = { ...logoPreviews };
                                  delete newPreviews[`${index}-club`];
                                  setLogoPreviews(newPreviews);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                title="Supprimer le logo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          
                          {/* Upload de fichier */}
                          <div>
                            <label className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-wide">
                              Télécharger une image
                            </label>
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleLogoUpload(e, index, 'club')}
                                disabled={uploadingLogos[`${index}-club`]}
                                className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-scout-orange file:text-black hover:file:bg-orange-600 file:cursor-pointer file:transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              {uploadingLogos[`${index}-club`] && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <Loader2 className="w-5 h-5 text-scout-orange animate-spin" />
                                </div>
                              )}
                            </div>
                            <p className="text-white/40 text-xs mt-1">Formats acceptés: JPG, PNG, GIF • Max 5MB</p>
                          </div>

                          {/* Ou URL */}
                          <div>
                            <label className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-wide">
                              Ou entrer une URL ou un chemin
                            </label>
                            <input
                              type="text"
                              value={saison.logo_club?.startsWith('data:') ? '' : (saison.logo_club || '')}
                              onChange={(e) => handleLogoUrlChange(e, index, 'club')}
                              className="input-field"
                              placeholder="https://example.com/logo.jpg ou /logos/club.jpg"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Logo Division
                        </label>
                        <div className="space-y-4">
                          {/* Prévisualisation Logo Division */}
                          {logoPreviews[`${index}-division`] && (
                            <div className="relative w-full max-w-xs">
                              <img
                                src={logoPreviews[`${index}-division`]}
                                alt="Logo de la division"
                                className="w-24 h-24 object-contain rounded-lg border border-white/10 bg-white/5 p-2"
                                onError={() => {
                                  const newPreviews = { ...logoPreviews };
                                  delete newPreviews[`${index}-division`];
                                  setLogoPreviews(newPreviews);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  updateSaison(index, 'logo_division', '');
                                  const newPreviews = { ...logoPreviews };
                                  delete newPreviews[`${index}-division`];
                                  setLogoPreviews(newPreviews);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                title="Supprimer le logo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          
                          {/* Upload de fichier */}
                          <div>
                            <label className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-wide">
                              Télécharger une image
                            </label>
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleLogoUpload(e, index, 'division')}
                                disabled={uploadingLogos[`${index}-division`]}
                                className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-scout-orange file:text-black hover:file:bg-orange-600 file:cursor-pointer file:transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              {uploadingLogos[`${index}-division`] && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <Loader2 className="w-5 h-5 text-scout-orange animate-spin" />
                                </div>
                              )}
                            </div>
                            <p className="text-white/40 text-xs mt-1">Formats acceptés: JPG, PNG, GIF • Max 5MB</p>
                          </div>

                          {/* Ou URL */}
                          <div>
                            <label className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-wide">
                              Ou entrer une URL ou un chemin
                            </label>
                            <input
                              type="text"
                              value={saison.logo_division?.startsWith('data:') ? '' : (saison.logo_division || '')}
                              onChange={(e) => handleLogoUrlChange(e, index, 'division')}
                              className="input-field"
                              placeholder="https://example.com/logo.jpg ou /logos/division.jpg"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Badges
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saison.badge_capitanat || false}
                              onChange={(e) => updateSaison(index, 'badge_capitanat', e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-scout-card text-scout-orange focus:ring-scout-orange focus:ring-2"
                            />
                            <span className="text-white/60 text-sm">Capitaine</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saison.badge_surclasse || false}
                              onChange={(e) => updateSaison(index, 'badge_surclasse', e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-scout-card text-scout-orange focus:ring-scout-orange focus:ring-2"
                            />
                            <span className="text-white/60 text-sm">Surclassé</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saison.badge_champion || false}
                              onChange={(e) => updateSaison(index, 'badge_champion', e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-scout-card text-scout-orange focus:ring-scout-orange focus:ring-2"
                            />
                            <span className="text-white/60 text-sm">Champion</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saison.badge_coupe_remportee || false}
                              onChange={(e) => updateSaison(index, 'badge_coupe_remportee', e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-scout-card text-scout-orange focus:ring-scout-orange focus:ring-2"
                            />
                            <span className="text-white/60 text-sm">Coupe remportée</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Matchs
                        </label>
                        <input
                          type="number"
                          value={saison.matchs || ''}
                          onChange={(e) => updateSaison(index, 'matchs', e.target.value ? parseInt(e.target.value) : null)}
                          className="input-field"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Buts
                        </label>
                        <input
                          type="number"
                          value={saison.buts || ''}
                          onChange={(e) => updateSaison(index, 'buts', e.target.value ? parseInt(e.target.value) : null)}
                          className="input-field"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Passes décisives
                        </label>
                        <input
                          type="number"
                          value={saison.passes_decisives || ''}
                          onChange={(e) => updateSaison(index, 'passes_decisives', e.target.value ? parseInt(e.target.value) : null)}
                          className="input-field"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">
                          Temps de jeu moyen (min)
                        </label>
                        <input
                          type="number"
                          value={saison.temps_jeu_moyen || ''}
                          onChange={(e) => updateSaison(index, 'temps_jeu_moyen', e.target.value ? parseInt(e.target.value) : null)}
                          className="input-field"
                          min="1"
                          max="90"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {saisons.length === 0 && (
                  <p className="text-white/40 text-sm italic">Aucune saison. Cliquez sur "Ajouter une saison" pour en ajouter une.</p>
                )}
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
