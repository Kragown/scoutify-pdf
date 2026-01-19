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

// Créer la table qualites pour stocker les qualités sportives
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

// Créer un index pour améliorer les performances
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_qualites_formulaire_joueur_id 
  ON qualites(formulaire_joueur_id)
`);

export default db;
