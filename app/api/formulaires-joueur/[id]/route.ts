import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { CreateFormulaireJoueurDto, CreateSaisonDto, CreateFormationDto, CreateInteretDto, DIVISIONS } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formulaireId = parseInt(id);

    if (isNaN(formulaireId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    const formulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(formulaireId);

    if (!formulaire) {
      return NextResponse.json(
        { success: false, error: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre')
      .all(formulaireId);
    const saisons = db.prepare('SELECT * FROM saisons WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
      .all(formulaireId)
      .map((saison: any) => ({
        ...saison,
        badge_capitanat: Boolean(saison.badge_capitanat),
        badge_surclasse: Boolean(saison.badge_surclasse),
        badge_champion: Boolean(saison.badge_champion),
        badge_coupe_remportee: Boolean(saison.badge_coupe_remportee),
        mi_saison: Boolean(saison.mi_saison),
        saison_actuelle: Boolean(saison.saison_actuelle),
      }));
    const formations = db.prepare('SELECT * FROM formations WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
      .all(formulaireId);
    const interets = db.prepare('SELECT * FROM interets WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
      .all(formulaireId);

    const formulaireData = formulaire as Record<string, any>;
    return NextResponse.json({
      success: true,
      data: { 
        ...formulaireData, 
        archive: Boolean(formulaireData.archive),
        qualites, 
        saisons, 
        formations, 
        interets 
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du formulaire:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du formulaire' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formulaireId = parseInt(id);

    if (isNaN(formulaireId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    const existingFormulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(formulaireId);
    if (!existingFormulaire) {
      return NextResponse.json(
        { success: false, error: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    const body: Partial<CreateFormulaireJoueurDto> = await request.json();

    if (body.pied_fort && !['Droit', 'Gauche', 'Ambidextre'].includes(body.pied_fort)) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (body.email !== undefined && !emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Format email invalide' },
        { status: 400 }
      );
    }

    if (body.email_agent_sportif !== undefined && body.email_agent_sportif !== null && !emailRegex.test(body.email_agent_sportif)) {
      return NextResponse.json(
        { success: false, error: 'Format email agent sportif invalide' },
        { status: 400 }
      );
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (body.telephone !== undefined && !phoneRegex.test(body.telephone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Format téléphone invalide. Utilisez le format international (ex: +33 6 12 34 56 78)' },
        { status: 400 }
      );
    }

    if (body.telephone_agent_sportif !== undefined && body.telephone_agent_sportif !== null && !phoneRegex.test(body.telephone_agent_sportif.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Format téléphone agent sportif invalide. Utilisez le format international' },
        { status: 400 }
      );
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

    if (body.formations !== undefined) {
      if (!Array.isArray(body.formations)) {
        return NextResponse.json(
          { success: false, error: 'Les formations doivent être un tableau' },
          { status: 400 }
        );
      }
      
      for (let i = 0; i < body.formations.length; i++) {
        const formation = body.formations[i];
        
        if (!formation.annee_ou_periode || typeof formation.annee_ou_periode !== 'string' || formation.annee_ou_periode.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `La formation ${i + 1}: l'année ou période est requise` },
            { status: 400 }
          );
        }
        
        if (!formation.titre_structure || typeof formation.titre_structure !== 'string' || formation.titre_structure.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `La formation ${i + 1}: le titre ou structure est requis` },
            { status: 400 }
          );
        }
        
        if (formation.titre_structure.length > 1000) {
          return NextResponse.json(
            { success: false, error: `La formation ${i + 1}: le titre ou structure ne peut pas dépasser 1000 caractères` },
            { status: 400 }
          );
        }
        
        if (formation.details !== null && formation.details !== undefined) {
          if (typeof formation.details !== 'string') {
            return NextResponse.json(
              { success: false, error: `La formation ${i + 1}: les détails doivent être une chaîne de caractères` },
              { status: 400 }
            );
          }
          
          if (formation.details.length > 1000) {
            return NextResponse.json(
              { success: false, error: `La formation ${i + 1}: les détails ne peuvent pas dépasser 1000 caractères` },
              { status: 400 }
            );
          }
        }
      }
    }

    if (body.interets !== undefined) {
      if (!Array.isArray(body.interets)) {
        return NextResponse.json(
          { success: false, error: 'Les intérêts doivent être un tableau' },
          { status: 400 }
        );
      }
      
      for (let i = 0; i < body.interets.length; i++) {
        const interet = body.interets[i];
        
        if (!interet.club || typeof interet.club !== 'string' || interet.club.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `L'intérêt ${i + 1}: le nom du club est requis` },
            { status: 400 }
          );
        }
        
        if (!interet.annee || typeof interet.annee !== 'string' || interet.annee.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `L'intérêt ${i + 1}: l'année est requise` },
            { status: 400 }
          );
        }
        
        if (!interet.logo_club || typeof interet.logo_club !== 'string' || interet.logo_club.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `L'intérêt ${i + 1}: le logo du club est obligatoire` },
            { status: 400 }
          );
        }
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.nom !== undefined) {
      updates.push('nom = ?');
      values.push(body.nom);
    }
    if (body.prenom !== undefined) {
      updates.push('prenom = ?');
      values.push(body.prenom);
    }
    if (body.nationalites !== undefined) {
      updates.push('nationalites = ?');
      const nationalitesStr = Array.isArray(body.nationalites) 
        ? JSON.stringify(body.nationalites) 
        : body.nationalites;
      values.push(nationalitesStr);
    }
    if (body.date_naissance !== undefined) {
      updates.push('date_naissance = ?');
      values.push(body.date_naissance);
    }
    if (body.pied_fort !== undefined) {
      updates.push('pied_fort = ?');
      values.push(body.pied_fort);
    }
    if (body.taille_cm !== undefined) {
      updates.push('taille_cm = ?');
      values.push(body.taille_cm);
    }
    if (body.couleur_cv !== undefined) {
      updates.push('couleur_cv = ?');
      values.push(body.couleur_cv);
    }
    if (body.poste_principal !== undefined) {
      updates.push('poste_principal = ?');
      values.push(body.poste_principal);
    }
    if (body.poste_secondaire !== undefined) {
      updates.push('poste_secondaire = ?');
      values.push(body.poste_secondaire);
    }
    if (body.url_transfermarkt !== undefined) {
      updates.push('url_transfermarkt = ?');
      values.push(body.url_transfermarkt);
    }
    if (body.photo_joueur !== undefined) {
      updates.push('photo_joueur = ?');
      values.push(body.photo_joueur);
    }
    if (body.vma !== undefined) {
      updates.push('vma = ?');
      values.push(body.vma);
    }
    if (body.envergure !== undefined) {
      updates.push('envergure = ?');
      values.push(body.envergure);
    }
    if (body.email !== undefined) {
      updates.push('email = ?');
      values.push(body.email);
    }
    if (body.telephone !== undefined) {
      updates.push('telephone = ?');
      values.push(body.telephone);
    }
    if (body.email_agent_sportif !== undefined) {
      updates.push('email_agent_sportif = ?');
      values.push(body.email_agent_sportif);
    }
    if (body.telephone_agent_sportif !== undefined) {
      updates.push('telephone_agent_sportif = ?');
      values.push(body.telephone_agent_sportif);
    }
    if (body.status !== undefined) {
      if (body.status !== 'À traiter' && body.status !== 'Traité') {
        return NextResponse.json(
          { success: false, error: 'Le statut doit être "À traiter" ou "Traité"' },
          { status: 400 }
        );
      }
      updates.push('status = ?');
      values.push(body.status);
    }
    if (body.archive !== undefined) {
      updates.push('archive = ?');
      values.push(body.archive ? 1 : 0);
    }

    const updateFormulaire = db.transaction(() => {
      if (updates.length > 0) {
        values.push(formulaireId);
        const stmt = db.prepare(`UPDATE formulaires_joueur SET ${updates.join(', ')} WHERE id = ?`);
        stmt.run(...values);
      }

      if (body.qualites !== undefined) {
        db.prepare('DELETE FROM qualites WHERE formulaire_joueur_id = ?').run(formulaireId);
        
        if (body.qualites.length > 0) {
          const insertQualite = db.prepare(`
            INSERT INTO qualites (formulaire_joueur_id, libelle, ordre)
            VALUES (?, ?, ?)
          `);

          body.qualites.forEach((libelle, index) => {
            insertQualite.run(formulaireId, libelle.trim(), index);
          });
        }
      }

      if (body.saisons !== undefined) {
        db.prepare('DELETE FROM saisons WHERE formulaire_joueur_id = ?').run(formulaireId);
        
        if (body.saisons.length > 0) {
          const insertSaison = db.prepare(`
            INSERT INTO saisons (
              formulaire_joueur_id, club, categorie, division, periode, mi_saison, periode_type, logo_club, logo_division,
              badge_capitanat, badge_surclasse, badge_champion, badge_coupe_remportee,
              matchs, buts, passes_decisives, temps_jeu_moyen, clean_sheets, saison_actuelle, ordre
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          body.saisons.forEach((saison: CreateSaisonDto, index: number) => {
            insertSaison.run(
              formulaireId,
              saison.club.trim(),
              saison.categorie.trim(),
              saison.division,
              saison.periode || null,
              saison.mi_saison ? 1 : 0,
              saison.periode_type || null,
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
              saison.clean_sheets ?? null,
              saison.saison_actuelle ? 1 : 0,
              saison.ordre ?? index
            );
          });
        }
      }

      if (body.formations !== undefined) {
        db.prepare('DELETE FROM formations WHERE formulaire_joueur_id = ?').run(formulaireId);
        
        if (body.formations.length > 0) {
          const insertFormation = db.prepare(`
            INSERT INTO formations (
              formulaire_joueur_id, annee_ou_periode, titre_structure, details, ordre
            ) VALUES (?, ?, ?, ?, ?)
          `);

          body.formations.forEach((formation: CreateFormationDto, index: number) => {
            insertFormation.run(
              formulaireId,
              formation.annee_ou_periode.trim(),
              formation.titre_structure.trim(),
              formation.details?.trim() || null,
              formation.ordre ?? index
            );
          });
        }
      }

      if (body.interets !== undefined) {
        db.prepare('DELETE FROM interets WHERE formulaire_joueur_id = ?').run(formulaireId);
        
        if (body.interets.length > 0) {
          const insertInteret = db.prepare(`
            INSERT INTO interets (
              formulaire_joueur_id, club, annee, logo_club, ordre
            ) VALUES (?, ?, ?, ?, ?)
          `);

          body.interets.forEach((interet: CreateInteretDto, index: number) => {
            insertInteret.run(
              formulaireId,
              interet.club.trim(),
              interet.annee.trim(),
              interet.logo_club,
              interet.ordre ?? index
            );
          });
        }
      }

      const updatedFormulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(formulaireId);
      const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre')
        .all(formulaireId);
      const saisons = db.prepare('SELECT * FROM saisons WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
        .all(formulaireId)
        .map((saison: any) => ({
          ...saison,
          badge_capitanat: Boolean(saison.badge_capitanat),
          badge_surclasse: Boolean(saison.badge_surclasse),
          badge_champion: Boolean(saison.badge_champion),
          badge_coupe_remportee: Boolean(saison.badge_coupe_remportee),
          mi_saison: Boolean(saison.mi_saison),
          saison_actuelle: Boolean(saison.saison_actuelle),
        }));
      const formations = db.prepare('SELECT * FROM formations WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
        .all(formulaireId);
      const interets = db.prepare('SELECT * FROM interets WHERE formulaire_joueur_id = ? ORDER BY ordre, created_at')
        .all(formulaireId);

      if (!updatedFormulaire || typeof updatedFormulaire !== 'object') {
        throw new Error('Formulaire non trouvé après mise à jour');
      }

      const updatedFormulaireData = updatedFormulaire as Record<string, any>;
      return { 
        ...updatedFormulaireData, 
        archive: Boolean(updatedFormulaireData.archive),
        qualites, 
        saisons, 
        formations, 
        interets 
      };
    });

    if (updates.length === 0 && body.qualites === undefined && body.saisons === undefined && body.formations === undefined && body.interets === undefined) {
      return NextResponse.json(
        { success: false, error: 'Aucun champ à mettre à jour' },
        { status: 400 }
      );
    }

    const formulaireAvecQualites = updateFormulaire();

    return NextResponse.json({
      success: true,
      data: formulaireAvecQualites,
      message: 'Formulaire mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du formulaire:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la mise à jour du formulaire' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formulaireId = parseInt(id);

    if (isNaN(formulaireId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    const formulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(formulaireId);
    if (!formulaire) {
      return NextResponse.json(
        { success: false, error: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM formulaires_joueur WHERE id = ?').run(formulaireId);

    return NextResponse.json({
      success: true,
      message: 'Formulaire supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du formulaire:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du formulaire' },
      { status: 500 }
    );
  }
}
