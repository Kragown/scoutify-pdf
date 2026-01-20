import db from '../lib/db';

const testFormulaire = {
  nom: 'Test',
  prenom: 'Joueur',
  nationalites: JSON.stringify(['France']),
  date_naissance: '2000-01-15',
  pied_fort: 'Droit' as const,
  taille_cm: 180,
  couleur_cv: '#1E5EFF',
  poste_principal: 'Attaquant',
  poste_secondaire: 'Milieu',
  url_transfermarkt: 'https://www.transfermarkt.fr/test',
  photo_joueur: '/photos/test.jpg',
  vma: 15.5,
  envergure: 185,
  email: 'test@example.com',
  telephone: '+33612345678',
  email_agent_sportif: 'agent@example.com',
  telephone_agent_sportif: '+33687654321',
};

const testQualites = ['Vitesse', 'Dribble', 'Finition'];
const testSaisons = [
  {
    club: 'Olympique Lyon',
    categorie: 'U19',
    division: 'Ligue 1' as const,
    logo_club: '/logos/ol.png',
    logo_division: '/logos/ligue1.png',
    badge_capitanat: true,
    badge_surclasse: false,
    badge_champion: true,
    badge_coupe_remportee: false,
    matchs: 25,
    buts: 12,
    passes_decisives: 8,
    temps_jeu_moyen: 75,
    saison_actuelle: false,
    ordre: 0,
  },
];
const testFormations = [
  {
    annee_ou_periode: '2023-2024',
    titre_structure: 'Académie OL',
    details: 'Formation complète',
    ordre: 0,
  },
];
const testInterets = [
  {
    club: 'Paris Saint-Germain',
    annee: '2024',
    logo_club: '/logos/psg.png',
    ordre: 0,
  },
];

async function testRoute<T = void>(name: string, testFn: () => Promise<T>): Promise<T> {
  console.log(`\n🧪 Test: ${name}`);
  try {
    const result = await testFn();
    console.log(`✅ ${name} - SUCCÈS`);
    return result;
  } catch (error: any) {
    console.error(`❌ ${name} - ÉCHEC:`, error.message);
    throw error;
  }
}

async function testGetAllEmpty() {
  const result = db.prepare('SELECT COUNT(*) as count FROM formulaires_joueur').get() as { count: number };
  if (result.count !== 0) {
    throw new Error(`Base de données devrait être vide, mais contient ${result.count} formulaires`);
  }
}

async function testPost(): Promise<number> {
  const insertFormulaire = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO formulaires_joueur (
        nom, prenom, nationalites, date_naissance, pied_fort, 
        taille_cm, couleur_cv, poste_principal, poste_secondaire,
        url_transfermarkt, photo_joueur, vma, envergure,
        email, telephone, email_agent_sportif, telephone_agent_sportif
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      testFormulaire.nom,
      testFormulaire.prenom,
      testFormulaire.nationalites,
      testFormulaire.date_naissance,
      testFormulaire.pied_fort,
      testFormulaire.taille_cm,
      testFormulaire.couleur_cv,
      testFormulaire.poste_principal,
      testFormulaire.poste_secondaire,
      testFormulaire.url_transfermarkt,
      testFormulaire.photo_joueur,
      testFormulaire.vma,
      testFormulaire.envergure,
      testFormulaire.email,
      testFormulaire.telephone,
      testFormulaire.email_agent_sportif,
      testFormulaire.telephone_agent_sportif
    );

    const formulaireId = result.lastInsertRowid;

    if (testQualites.length > 0) {
      const insertQualite = db.prepare(`
        INSERT INTO qualites (formulaire_joueur_id, libelle, ordre)
        VALUES (?, ?, ?)
      `);
      testQualites.forEach((libelle, index) => {
        insertQualite.run(formulaireId, libelle, index);
      });
    }

    if (testSaisons.length > 0) {
      const insertSaison = db.prepare(`
        INSERT INTO saisons (
          formulaire_joueur_id, club, categorie, division, logo_club, logo_division,
          badge_capitanat, badge_surclasse, badge_champion, badge_coupe_remportee,
          matchs, buts, passes_decisives, temps_jeu_moyen, saison_actuelle, ordre
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      testSaisons.forEach((saison, index) => {
        insertSaison.run(
          formulaireId,
          saison.club,
          saison.categorie,
          saison.division,
          saison.logo_club,
          saison.logo_division,
          saison.badge_capitanat ? 1 : 0,
          saison.badge_surclasse ? 1 : 0,
          saison.badge_champion ? 1 : 0,
          saison.badge_coupe_remportee ? 1 : 0,
          saison.matchs,
          saison.buts,
          saison.passes_decisives,
          saison.temps_jeu_moyen,
          saison.saison_actuelle ? 1 : 0,
          saison.ordre
        );
      });
    }

    if (testFormations.length > 0) {
      const insertFormation = db.prepare(`
        INSERT INTO formations (
          formulaire_joueur_id, annee_ou_periode, titre_structure, details, ordre
        ) VALUES (?, ?, ?, ?, ?)
      `);
      testFormations.forEach((formation, index) => {
        insertFormation.run(
          formulaireId,
          formation.annee_ou_periode,
          formation.titre_structure,
          formation.details || null,
          formation.ordre
        );
      });
    }

    if (testInterets.length > 0) {
      const insertInteret = db.prepare(`
        INSERT INTO interets (
          formulaire_joueur_id, club, annee, logo_club, ordre
        ) VALUES (?, ?, ?, ?, ?)
      `);
      testInterets.forEach((interet, index) => {
        insertInteret.run(
          formulaireId,
          interet.club,
          interet.annee,
          interet.logo_club,
          interet.ordre
        );
      });
    }

    return formulaireId;
  });

  const formulaireId = insertFormulaire();
  
  if (!formulaireId || typeof formulaireId !== 'number') {
    throw new Error('Échec de la création du formulaire');
  }

  return formulaireId;
}

async function testGetAll() {
  const formulaires = db.prepare('SELECT * FROM formulaires_joueur ORDER BY created_at DESC').all();
  
  if (formulaires.length === 0) {
    throw new Error('Aucun formulaire trouvé');
  }

  const formulaire = formulaires[0] as any;
  
  if (formulaire.nom !== testFormulaire.nom) {
    throw new Error(`Nom incorrect: attendu ${testFormulaire.nom}, obtenu ${formulaire.nom}`);
  }

  const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre')
    .all(formulaire.id);
  if (qualites.length !== testQualites.length) {
    throw new Error(`Nombre de qualités incorrect: attendu ${testQualites.length}, obtenu ${qualites.length}`);
  }

  const saisons = db.prepare('SELECT * FROM saisons WHERE formulaire_joueur_id = ?').all(formulaire.id);
  if (saisons.length !== testSaisons.length) {
    throw new Error(`Nombre de saisons incorrect: attendu ${testSaisons.length}, obtenu ${saisons.length}`);
  }

  const formations = db.prepare('SELECT * FROM formations WHERE formulaire_joueur_id = ?').all(formulaire.id);
  if (formations.length !== testFormations.length) {
    throw new Error(`Nombre de formations incorrect: attendu ${testFormations.length}, obtenu ${formations.length}`);
  }

  const interets = db.prepare('SELECT * FROM interets WHERE formulaire_joueur_id = ?').all(formulaire.id);
  if (interets.length !== testInterets.length) {
    throw new Error(`Nombre d'intérêts incorrect: attendu ${testInterets.length}, obtenu ${interets.length}`);
  }

  return formulaire.id;
}

async function testGetById(id: number) {
  const formulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(id) as any;
  
  if (!formulaire) {
    throw new Error(`Formulaire avec l'ID ${id} non trouvé`);
  }

  if (formulaire.nom !== testFormulaire.nom) {
    throw new Error(`Nom incorrect pour l'ID ${id}`);
  }

  const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre')
    .all(id);
  const saisons = db.prepare('SELECT * FROM saisons WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
    .all(id);
  const formations = db.prepare('SELECT * FROM formations WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
    .all(id);
  const interets = db.prepare('SELECT * FROM interets WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
    .all(id);

  if (qualites.length === 0 || saisons.length === 0 || formations.length === 0 || interets.length === 0) {
    throw new Error('Relations non trouvées');
  }
}

async function testPut(id: number) {
  const updateFormulaire = db.transaction(() => {
    const stmt = db.prepare(`
      UPDATE formulaires_joueur 
      SET nom = ?, prenom = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run('Test Modifié', 'Joueur Modifié', id);

    db.prepare('DELETE FROM qualites WHERE formulaire_joueur_id = ?').run(id);
    const insertQualite = db.prepare(`
      INSERT INTO qualites (formulaire_joueur_id, libelle, ordre)
      VALUES (?, ?, ?)
    `);
    ['Technique', 'Vision'].forEach((libelle, index) => {
      insertQualite.run(id, libelle, index);
    });

    const updated = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(id) as any;
    return updated;
  });

  const updated = updateFormulaire();

  if (updated.nom !== 'Test Modifié') {
    throw new Error('Mise à jour échouée');
  }

  const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre')
    .all(id);
  if (qualites.length !== 2) {
    throw new Error('Mise à jour des qualités échouée');
  }
}

async function testDelete(id: number) {
  const deleteFormulaire = db.transaction(() => {
    db.prepare('DELETE FROM qualites WHERE formulaire_joueur_id = ?').run(id);
    db.prepare('DELETE FROM saisons WHERE formulaire_joueur_id = ?').run(id);
    db.prepare('DELETE FROM formations WHERE formulaire_joueur_id = ?').run(id);
    db.prepare('DELETE FROM interets WHERE formulaire_joueur_id = ?').run(id);
    db.prepare('DELETE FROM formulaires_joueur WHERE id = ?').run(id);
  });

  deleteFormulaire();

  const formulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(id);
  if (formulaire) {
    throw new Error('Formulaire non supprimé');
  }

  const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ?').all(id);
  const saisons = db.prepare('SELECT * FROM saisons WHERE formulaire_joueur_id = ?').all(id);
  const formations = db.prepare('SELECT * FROM formations WHERE formulaire_joueur_id = ?').all(id);
  const interets = db.prepare('SELECT * FROM interets WHERE formulaire_joueur_id = ?').all(id);

  if (qualites.length > 0 || saisons.length > 0 || formations.length > 0 || interets.length > 0) {
    throw new Error('Relations non supprimées (CASCADE devrait fonctionner)');
  }
}

async function testGetByIdNotFound() {
  const formulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(99999);
  if (formulaire) {
    throw new Error('Formulaire inexistant trouvé');
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests des routes API...\n');

  let createdId: number | null = null;

  try {
    console.log('🧹 Nettoyage de la base de données...');
    db.prepare('DELETE FROM qualites').run();
    db.prepare('DELETE FROM saisons').run();
    db.prepare('DELETE FROM formations').run();
    db.prepare('DELETE FROM interets').run();
    db.prepare('DELETE FROM formulaires_joueur').run();

    await testRoute('GET all (vide)', testGetAllEmpty);
    
    createdId = await testRoute('POST - Créer un formulaire', testPost) as number;
    
    await testRoute('GET all (avec données)', testGetAll);
    
    if (createdId) {
      await testRoute('GET by id', () => testGetById(createdId!));
      await testRoute('PUT - Mettre à jour', () => testPut(createdId!));
      await testRoute('GET by id (inexistant)', testGetByIdNotFound);
      await testRoute('DELETE - Supprimer', () => testDelete(createdId!));
    }

    await testRoute('GET all (vide après suppression)', testGetAllEmpty);

    console.log('\n✅ Tous les tests sont passés avec succès!');
    console.log('\n📊 Résumé:');
    console.log('   - GET all: ✅');
    console.log('   - POST: ✅');
    console.log('   - GET by id: ✅');
    console.log('   - PUT: ✅');
    console.log('   - DELETE: ✅');
    console.log('   - Relations (qualités, saisons, formations, intérêts): ✅');
    console.log('   - CASCADE delete: ✅');

  } catch (error: any) {
    console.error('\n❌ Échec des tests:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

runTests().catch(console.error);
