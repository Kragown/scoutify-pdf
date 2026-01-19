export interface Qualite {
  id?: number;
  formulaire_joueur_id: number;
  libelle: string; // Maximum 24 caractères
  ordre: number; // Ordre d'affichage
  created_at?: string;
}

export interface FormulaireJoueur {
  id?: number;
  nom: string;
  prenom: string;
  nationalites: string; // JSON string ou texte séparé par virgules
  date_naissance: string; // Format YYYY-MM-DD
  pied_fort: 'Droit' | 'Gauche' | 'Ambidextre';
  taille_cm: number;
  couleur_cv: string;
  poste_principal: string;
  poste_secondaire?: string | null;
  url_transfermarkt?: string | null;
  photo_joueur: string;
  vma?: number | null;
  envergure?: number | null;
  email: string; // Obligatoire
  telephone: string; // Obligatoire, format international
  email_agent_sportif?: string | null; // Optionnel
  telephone_agent_sportif?: string | null; // Optionnel, format international
  created_at?: string;
  updated_at?: string;
  qualites?: Qualite[]; // Qualités associées (optionnel, chargé séparément)
}

export interface CreateFormulaireJoueurDto {
  nom: string;
  prenom: string;
  nationalites: string | string[];
  date_naissance: string;
  pied_fort: 'Droit' | 'Gauche' | 'Ambidextre';
  taille_cm: number;
  couleur_cv: string;
  poste_principal: string;
  poste_secondaire?: string | null;
  url_transfermarkt?: string | null;
  photo_joueur: string;
  vma?: number | null;
  envergure?: number | null;
  email: string; // Obligatoire
  telephone: string; // Obligatoire, format international
  email_agent_sportif?: string | null; // Optionnel
  telephone_agent_sportif?: string | null; // Optionnel, format international
  qualites?: string[]; // Array de qualités (1 à 6, max 24 caractères chacune)
}

