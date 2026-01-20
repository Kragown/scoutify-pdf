import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const dbPath = join(process.cwd(), 'data', 'scoutify.db');

const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS formulaires_joueur (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    nationalites TEXT NOT NULL,
    date_naissance TEXT NOT NULL,
    pied_fort TEXT NOT NULL CHECK(pied_fort IN ('Droit', 'Gauche', 'Ambidextre')),
    taille_cm INTEGER NOT NULL,
    couleur_cv TEXT NOT NULL,
    poste_principal TEXT NOT NULL,
    poste_secondaire TEXT,
    url_transfermarkt TEXT,
    photo_joueur TEXT NOT NULL,
    vma REAL,
    envergure REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_formulaires_joueur_timestamp 
  AFTER UPDATE ON formulaires_joueur
  BEGIN
    UPDATE formulaires_joueur SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END
`);

try {
  db.exec(`
    ALTER TABLE formulaires_joueur ADD COLUMN email TEXT DEFAULT '';
  `);
} catch (error: any) {
  if (!error.message.includes('duplicate column name')) {
    console.warn('Erreur lors de l\'ajout de la colonne email:', error.message);
  }
}

try {
  db.exec(`
    ALTER TABLE formulaires_joueur ADD COLUMN telephone TEXT DEFAULT '';
  `);
} catch (error: any) {
  if (!error.message.includes('duplicate column name')) {
    console.warn('Erreur lors de l\'ajout de la colonne telephone:', error.message);
  }
}

try {
  db.exec(`
    ALTER TABLE formulaires_joueur ADD COLUMN email_agent_sportif TEXT;
  `);
} catch (error: any) {
  if (!error.message.includes('duplicate column name')) {
    console.warn('Erreur lors de l\'ajout de la colonne email_agent_sportif:', error.message);
  }
}

try {
  db.exec(`
    ALTER TABLE formulaires_joueur ADD COLUMN telephone_agent_sportif TEXT;
  `);
} catch (error: any) {
  if (!error.message.includes('duplicate column name')) {
    console.warn('Erreur lors de l\'ajout de la colonne telephone_agent_sportif:', error.message);
  }
}

try {
  db.exec(`
    ALTER TABLE formulaires_joueur ADD COLUMN status TEXT DEFAULT 'À traiter' CHECK(status IN ('À traiter', 'Traité'));
  `);
} catch (error: any) {
  if (!error.message.includes('duplicate column name')) {
    console.warn('Erreur lors de l\'ajout de la colonne status:', error.message);
  }
}

try {
  db.exec(`
    ALTER TABLE saisons ADD COLUMN periode TEXT;
  `);
} catch (error: any) {
  if (!error.message.includes('duplicate column name')) {
    console.warn('Erreur lors de l\'ajout de la colonne periode:', error.message);
  }
}

try {
  db.exec(`
    ALTER TABLE saisons ADD COLUMN mi_saison INTEGER DEFAULT 0 CHECK(mi_saison IN (0, 1));
  `);
} catch (error: any) {
  if (!error.message.includes('duplicate column name')) {
    console.warn('Erreur lors de l\'ajout de la colonne mi_saison:', error.message);
  }
}

try {
  db.exec(`
    ALTER TABLE saisons ADD COLUMN periode_type TEXT CHECK(periode_type IN ('Hiver', 'Été'));
  `);
} catch (error: any) {
  if (!error.message.includes('duplicate column name')) {
    console.warn('Erreur lors de l\'ajout de la colonne periode_type:', error.message);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS qualites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formulaire_joueur_id INTEGER NOT NULL,
    libelle TEXT NOT NULL CHECK(LENGTH(libelle) <= 24),
    ordre INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (formulaire_joueur_id) REFERENCES formulaires_joueur(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_qualites_formulaire_joueur_id 
  ON qualites(formulaire_joueur_id)
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS saisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formulaire_joueur_id INTEGER NOT NULL,
    club TEXT NOT NULL,
    categorie TEXT NOT NULL,
    division TEXT NOT NULL,
    logo_club TEXT NOT NULL,
    logo_division TEXT NOT NULL,
    badge_capitanat INTEGER DEFAULT 0 CHECK(badge_capitanat IN (0, 1)),
    badge_surclasse INTEGER DEFAULT 0 CHECK(badge_surclasse IN (0, 1)),
    badge_champion INTEGER DEFAULT 0 CHECK(badge_champion IN (0, 1)),
    badge_coupe_remportee INTEGER DEFAULT 0 CHECK(badge_coupe_remportee IN (0, 1)),
    matchs INTEGER,
    buts INTEGER,
    passes_decisives INTEGER,
    temps_jeu_moyen INTEGER CHECK(temps_jeu_moyen IS NULL OR (temps_jeu_moyen >= 1 AND temps_jeu_moyen <= 90)),
    saison_actuelle INTEGER DEFAULT 0 CHECK(saison_actuelle IN (0, 1)),
    ordre INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (formulaire_joueur_id) REFERENCES formulaires_joueur(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_saisons_formulaire_joueur_id 
  ON saisons(formulaire_joueur_id)
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_saisons_timestamp 
  AFTER UPDATE ON saisons
  BEGIN
    UPDATE saisons SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS formations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formulaire_joueur_id INTEGER NOT NULL,
    annee_ou_periode TEXT NOT NULL,
    titre_structure TEXT NOT NULL CHECK(LENGTH(titre_structure) <= 1000),
    details TEXT CHECK(LENGTH(details) <= 1000),
    ordre INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (formulaire_joueur_id) REFERENCES formulaires_joueur(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_formations_formulaire_joueur_id 
  ON formations(formulaire_joueur_id)
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_formations_timestamp 
  AFTER UPDATE ON formations
  BEGIN
    UPDATE formations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS interets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formulaire_joueur_id INTEGER NOT NULL,
    club TEXT NOT NULL,
    annee TEXT NOT NULL,
    logo_club TEXT NOT NULL,
    ordre INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (formulaire_joueur_id) REFERENCES formulaires_joueur(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_interets_formulaire_joueur_id 
  ON interets(formulaire_joueur_id)
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_interets_timestamp 
  AFTER UPDATE ON interets
  BEGIN
    UPDATE interets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END
`);

export default db;
