export interface Qualite {
  id?: number;
  formulaire_joueur_id: number;
  libelle: string;
  ordre: number;
  created_at?: string;
}

export interface FormulaireJoueur {
  id?: number;
  nom: string;
  prenom: string;
  nationalites: string;
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
  email: string;
  telephone: string; // format international
  email_agent_sportif?: string | null;
  telephone_agent_sportif?: string | null; // format international
  created_at?: string;
  updated_at?: string;
  qualites?: Qualite[]; // Qualités associées (optionnel, chargé séparément)
  saisons?: Saison[]; // Saisons associées (optionnel, chargé séparément)
  formations?: Formation[]; // Formations associées (optionnel, chargé séparément)
  interets?: Interet[]; // Intérêts associés (optionnel, chargé séparément)
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
  email: string;
  telephone: string; // format international
  email_agent_sportif?: string | null;
  telephone_agent_sportif?: string | null; // format international
  qualites?: string[]; // Array de qualités (1 à 6, max 24 caractères chacune)
  saisons?: CreateSaisonDto[]; // Array de saisons (1 à plusieurs)
  formations?: CreateFormationDto[]; // Array de formations (1 à plusieurs)
  interets?: CreateInteretDto[]; // Array d'intérêts (1 à plusieurs)
}

export const DIVISIONS = [
  'Ligue 1',
  'Ligue 2',
  'National',
  'National 2',
  'National 3',
  'Régional 1',
  'Régional 2',
  'Régional 3',
  'Départemental 1',
  'Départemental 2',
  'Départemental 3',
  'Autre'
] as const;

export type Division = typeof DIVISIONS[number];

export interface Saison {
  id?: number;
  formulaire_joueur_id: number;
  club: string;
  categorie: string;
  division: Division;
  logo_club: string; // Chemin vers l'image, obligatoire (staff uniquement)
  logo_division: string; // Chemin vers l'image, obligatoire (staff uniquement)
  badge_capitanat: boolean;
  badge_surclasse: boolean;
  badge_champion: boolean;
  badge_coupe_remportee: boolean;
  matchs?: number | null;
  buts?: number | null;
  passes_decisives?: number | null;
  temps_jeu_moyen?: number | null;
  saison_actuelle: boolean; // Pour savoir si c'est la saison en cours
  ordre: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSaisonDto {
  club: string;
  categorie: string;
  division: Division;
  logo_club: string;
  logo_division: string;
  badge_capitanat?: boolean;
  badge_surclasse?: boolean;
  badge_champion?: boolean;
  badge_coupe_remportee?: boolean;
  matchs?: number | null;
  buts?: number | null;
  passes_decisives?: number | null;
  temps_jeu_moyen?: number | null; // 1 à 90
  saison_actuelle?: boolean;
  ordre?: number;
}

export interface Formation {
  id?: number;
  formulaire_joueur_id: number;
  annee_ou_periode: string;
  titre_structure: string;
  details?: string | null;
  ordre: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFormationDto {
  annee_ou_periode: string;
  titre_structure: string;
  details?: string | null;
  ordre?: number;
}

export interface Interet {
  id?: number;
  formulaire_joueur_id: number;
  club: string;
  annee: string;
  logo_club: string; // Chemin vers l'image, obligatoire (staff uniquement)
  ordre: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInteretDto {
  club: string;
  annee: string;
  logo_club: string; // Chemin vers l'image, obligatoire (staff uniquement)
  ordre?: number;
}

