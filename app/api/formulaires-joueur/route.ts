import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { CreateFormulaireJoueurDto } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const formulaires = db.prepare('SELECT * FROM formulaires_joueur ORDER BY created_at DESC').all();
    
    const formulairesAvecQualites = formulaires.map((formulaire: any) => {
      const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre')
        .all(formulaire.id);
      return { ...(formulaire as Record<string, any>), qualites };
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
      
      // Valider chaque qualité
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

      // Insérer les qualités si fournies
      if (body.qualites && body.qualites.length > 0) {
        const insertQualite = db.prepare(`
          INSERT INTO qualites (formulaire_joueur_id, libelle, ordre)
          VALUES (?, ?, ?)
        `);

        body.qualites.forEach((libelle, index) => {
          insertQualite.run(formulaireId, libelle.trim(), index);
        });
      }

      const formulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(formulaireId);
      const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre').all(formulaireId);

      if (!formulaire || typeof formulaire !== 'object') {
        throw new Error('Formulaire non trouvé après création');
      }

      return { ...(formulaire as Record<string, any>), qualites };
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
