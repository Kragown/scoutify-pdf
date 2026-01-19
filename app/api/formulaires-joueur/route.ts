import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { CreateFormulaireJoueurDto, CreateSaisonDto, DIVISIONS } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const formulaires = db.prepare('SELECT * FROM formulaires_joueur ORDER BY created_at DESC').all();
    
    const formulairesAvecQualites = formulaires.map((formulaire: any) => {
      const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre')
        .all(formulaire.id);
      const saisons = db.prepare('SELECT * FROM saisons WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
        .all(formulaire.id)
        .map((saison: any) => ({
          ...saison,
          badge_capitanat: Boolean(saison.badge_capitanat),
          badge_surclasse: Boolean(saison.badge_surclasse),
          badge_champion: Boolean(saison.badge_champion),
          badge_coupe_remportee: Boolean(saison.badge_coupe_remportee),
          saison_actuelle: Boolean(saison.saison_actuelle),
        }));
      return { ...(formulaire as Record<string, any>), qualites, saisons };
    });
    
    return NextResponse.json({
      success: true,
      data: formulairesAvecQualites,
      count: formulairesAvecQualites.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des formulaires:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des formulaires' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateFormulaireJoueurDto = await request.json();
    
    if (!body.nom || !body.prenom || !body.nationalites || !body.date_naissance || 
        !body.pied_fort || !body.taille_cm || !body.couleur_cv || 
        !body.poste_principal || !body.photo_joueur || !body.email || !body.telephone) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Format email invalide' },
        { status: 400 }
      );
    }

    if (body.email_agent_sportif && !emailRegex.test(body.email_agent_sportif)) {
      return NextResponse.json(
        { success: false, error: 'Format email agent sportif invalide' },
        { status: 400 }
      );
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(body.telephone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Format téléphone invalide. Utilisez le format international (ex: +33 6 12 34 56 78)' },
        { status: 400 }
      );
    }

    if (body.telephone_agent_sportif && !phoneRegex.test(body.telephone_agent_sportif.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Format téléphone agent sportif invalide. Utilisez le format international' },
        { status: 400 }
      );
    }

    if (!['Droit', 'Gauche', 'Ambidextre'].includes(body.pied_fort)) {
      return NextResponse.json(
        { success: false, error: 'Pied fort doit être Droit, Gauche ou Ambidextre' },
        { status: 400 }
      );
    }

    if (body.url_transfermarkt) {
      try {
        new URL(body.url_transfermarkt);
      } catch {
        return NextResponse.json(
          { success: false, error: 'URL Transfermarkt invalide' },
          { status: 400 }
        );
      }
    }

    if (body.qualites !== undefined) {
      if (!Array.isArray(body.qualites)) {
        return NextResponse.json(
          { success: false, error: 'Les qualités doivent être un tableau' },
          { status: 400 }
        );
      }
      
      if (body.qualites.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Au moins une qualité est requise' },
          { status: 400 }
        );
      }
      
      if (body.qualites.length > 6) {
        return NextResponse.json(
          { success: false, error: 'Maximum 6 qualités autorisées' },
          { status: 400 }
        );
      }
      
      for (const qualite of body.qualites) {
        if (typeof qualite !== 'string' || qualite.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: 'Chaque qualité doit être une chaîne non vide' },
            { status: 400 }
          );
        }
        if (qualite.length > 24) {
          return NextResponse.json(
            { success: false, error: `La qualité "${qualite}" dépasse 24 caractères` },
            { status: 400 }
          );
        }
      }
    }

    if (body.saisons !== undefined) {
      if (!Array.isArray(body.saisons)) {
        return NextResponse.json(
          { success: false, error: 'Les saisons doivent être un tableau' },
          { status: 400 }
        );
      }
      
      if (body.saisons.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Au moins une saison est requise' },
          { status: 400 }
        );
      }
      
      for (let i = 0; i < body.saisons.length; i++) {
        const saison = body.saisons[i];
        
        if (!saison.club || typeof saison.club !== 'string' || saison.club.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `La saison ${i + 1}: le nom du club est requis` },
            { status: 400 }
          );
        }
        
        if (!saison.categorie || typeof saison.categorie !== 'string' || saison.categorie.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `La saison ${i + 1}: la catégorie est requise` },
            { status: 400 }
          );
        }
        
        if (!saison.division || !DIVISIONS.includes(saison.division)) {
          return NextResponse.json(
            { success: false, error: `La saison ${i + 1}: division invalide. Doit être parmi: ${DIVISIONS.join(', ')}` },
            { status: 400 }
          );
        }
        
        if (!saison.logo_club || typeof saison.logo_club !== 'string' || saison.logo_club.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `La saison ${i + 1}: le logo du club est obligatoire` },
            { status: 400 }
          );
        }
        
        if (!saison.logo_division || typeof saison.logo_division !== 'string' || saison.logo_division.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `La saison ${i + 1}: le logo de la division est obligatoire` },
            { status: 400 }
          );
        }
        
        const isSaisonActuelle = saison.saison_actuelle === true;
        if (!isSaisonActuelle && (saison.matchs === null || saison.matchs === undefined)) {
          return NextResponse.json(
            { success: false, error: `La saison ${i + 1}: le nombre de matchs est obligatoire sauf pour la saison actuelle` },
            { status: 400 }
          );
        }
        
        if (saison.matchs !== null && saison.matchs !== undefined && (typeof saison.matchs !== 'number' || saison.matchs < 0)) {
          return NextResponse.json(
            { success: false, error: `La saison ${i + 1}: le nombre de matchs doit être un nombre positif` },
            { status: 400 }
          );
        }
        
        if (saison.buts !== null && saison.buts !== undefined && (typeof saison.buts !== 'number' || saison.buts < 0)) {
          return NextResponse.json(
            { success: false, error: `La saison ${i + 1}: le nombre de buts doit être un nombre positif` },
            { status: 400 }
          );
        }
        
        if (saison.passes_decisives !== null && saison.passes_decisives !== undefined && (typeof saison.passes_decisives !== 'number' || saison.passes_decisives < 0)) {
          return NextResponse.json(
            { success: false, error: `La saison ${i + 1}: le nombre de passes décisives doit être un nombre positif` },
            { status: 400 }
          );
        }
        
        if (saison.temps_jeu_moyen !== null && saison.temps_jeu_moyen !== undefined) {
          if (typeof saison.temps_jeu_moyen !== 'number' || saison.temps_jeu_moyen < 1 || saison.temps_jeu_moyen > 90) {
            return NextResponse.json(
              { success: false, error: `La saison ${i + 1}: le temps de jeu moyen doit être entre 1 et 90 minutes` },
              { status: 400 }
            );
          }
        }
      }
    }

    const nationalitesStr = Array.isArray(body.nationalites) 
      ? JSON.stringify(body.nationalites) 
      : body.nationalites;

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
        body.nom,
        body.prenom,
        nationalitesStr,
        body.date_naissance,
        body.pied_fort,
        body.taille_cm,
        body.couleur_cv,
        body.poste_principal,
        body.poste_secondaire || null,
        body.url_transfermarkt || null,
        body.photo_joueur,
        body.vma || null,
        body.envergure || null,
        body.email,
        body.telephone,
        body.email_agent_sportif || null,
        body.telephone_agent_sportif || null
      );

      const formulaireId = result.lastInsertRowid;

      if (body.qualites && body.qualites.length > 0) {
        const insertQualite = db.prepare(`
          INSERT INTO qualites (formulaire_joueur_id, libelle, ordre)
          VALUES (?, ?, ?)
        `);

        body.qualites.forEach((libelle, index) => {
          insertQualite.run(formulaireId, libelle.trim(), index);
        });
      }

      if (body.saisons && body.saisons.length > 0) {
        const insertSaison = db.prepare(`
          INSERT INTO saisons (
            formulaire_joueur_id, club, categorie, division, logo_club, logo_division,
            badge_capitanat, badge_surclasse, badge_champion, badge_coupe_remportee,
            matchs, buts, passes_decisives, temps_jeu_moyen, saison_actuelle, ordre
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        body.saisons.forEach((saison: CreateSaisonDto, index: number) => {
          insertSaison.run(
            formulaireId,
            saison.club.trim(),
            saison.categorie.trim(),
            saison.division,
            saison.logo_club,
            saison.logo_division,
            saison.badge_capitanat ? 1 : 0,
            saison.badge_surclasse ? 1 : 0,
            saison.badge_champion ? 1 : 0,
            saison.badge_coupe_remportee ? 1 : 0,
            saison.matchs ?? null,
            saison.buts ?? null,
            saison.passes_decisives ?? null,
            saison.temps_jeu_moyen ?? null,
            saison.saison_actuelle ? 1 : 0,
            saison.ordre ?? index
          );
        });
      }

      const formulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(formulaireId);
      const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre').all(formulaireId);
      const saisons = db.prepare('SELECT * FROM saisons WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
        .all(formulaireId)
        .map((saison: any) => ({
          ...saison,
          badge_capitanat: Boolean(saison.badge_capitanat),
          badge_surclasse: Boolean(saison.badge_surclasse),
          badge_champion: Boolean(saison.badge_champion),
          badge_coupe_remportee: Boolean(saison.badge_coupe_remportee),
          saison_actuelle: Boolean(saison.saison_actuelle),
        }));

      if (!formulaire || typeof formulaire !== 'object') {
        throw new Error('Formulaire non trouvé après création');
      }

      return { ...(formulaire as Record<string, any>), qualites, saisons };
    });

    const formulaireAvecQualites = insertFormulaire();

    return NextResponse.json({
      success: true,
      data: formulaireAvecQualites,
      message: 'Formulaire de joueur créé avec succès'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erreur lors de la création du formulaire:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création du formulaire' },
      { status: 500 }
    );
  }
}
