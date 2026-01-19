import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { CreateFormulaireJoueurDto } from '@/lib/types';

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

    return NextResponse.json({
      success: true,
      data: { ...formulaire, qualites }
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

      const updatedFormulaire = db.prepare('SELECT * FROM formulaires_joueur WHERE id = ?').get(formulaireId);
      const qualites = db.prepare('SELECT * FROM qualites WHERE formulaire_joueur_id = ? ORDER BY ordre')
        .all(formulaireId);

      if (!updatedFormulaire || typeof updatedFormulaire !== 'object') {
        throw new Error('Formulaire non trouvé après mise à jour');
      }

      return { ...(updatedFormulaire as Record<string, any>), qualites };
    });

    if (updates.length === 0 && body.qualites === undefined) {
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
