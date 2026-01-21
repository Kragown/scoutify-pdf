import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import PlayerCV from '@/components/PlayerCV';
import { FormulaireJoueur } from '@/lib/types';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

export const runtime = 'nodejs';

// Fonction pour convertir une image locale en base64
const imageToBase64 = (imagePath: string): string | null => {
  try {
    if (!existsSync(imagePath)) {
      console.warn(`Image non trouvée: ${imagePath}`);
      return null;
    }
    const imageBuffer = readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = imagePath.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Erreur lors de la conversion de l'image ${imagePath}:`, error);
    return null;
  }
};

// Fonction pour résoudre le chemin d'une image
const resolveImagePath = (imagePath: string, basePath: string = process.cwd()): string | null => {
  if (!imagePath) return null;
  
  // Si c'est déjà une URL ou base64, retourner tel quel
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Chemin relatif depuis public
  if (imagePath.startsWith('/photos/') || imagePath.startsWith('/logos/')) {
    const fullPath = join(basePath, 'public', imagePath);
    return existsSync(fullPath) ? fullPath : null;
  }
  
  // Si c'est juste un nom de fichier, essayer dans photos puis logos
  if (!imagePath.includes('/')) {
    const photosPath = join(basePath, 'public', 'photos', imagePath);
    if (existsSync(photosPath)) return photosPath;
    const logosPath = join(basePath, 'public', 'logos', imagePath);
    if (existsSync(logosPath)) return logosPath;
    return null;
  }
  
  // Chemin absolu ou relatif
  const fullPath = join(basePath, 'public', imagePath);
  return existsSync(fullPath) ? fullPath : null;
};

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

    // Récupérer le formulaire complet avec toutes les relations
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

    // Convertir les images locales en base64
    const basePath = process.cwd();
    
    // Convertir la photo du joueur
    let photoJoueur = (formulaire as any).photo_joueur;
    if (photoJoueur && !photoJoueur.startsWith('http') && !photoJoueur.startsWith('data:')) {
      const photoPath = resolveImagePath(photoJoueur, basePath);
      if (photoPath) {
        const base64Photo = imageToBase64(photoPath);
        if (base64Photo) {
          photoJoueur = base64Photo;
        } else {
          console.warn(`Impossible de convertir la photo: ${photoPath}`);
          photoJoueur = null; // Garder null si la conversion échoue
        }
      } else {
        console.warn(`Photo non trouvée: ${photoJoueur}`);
        photoJoueur = null; // Garder null si le fichier n'existe pas
      }
    }
    
    // Convertir les logos des saisons
    const saisonsWithBase64 = saisons.map((saison: any) => {
      let logoClub = saison.logo_club;
      let logoDivision = saison.logo_division;
      
      if (logoClub && !logoClub.startsWith('http') && !logoClub.startsWith('data:')) {
        const logoPath = resolveImagePath(logoClub, basePath);
        if (logoPath) {
          const base64Logo = imageToBase64(logoPath);
          if (base64Logo) {
            logoClub = base64Logo;
          } else {
            console.warn(`Impossible de convertir le logo du club: ${logoPath}`);
            logoClub = null;
          }
        } else {
          console.warn(`Logo du club non trouvé: ${logoClub}`);
          logoClub = null;
        }
      }
      
      if (logoDivision && !logoDivision.startsWith('http') && !logoDivision.startsWith('data:')) {
        const logoPath = resolveImagePath(logoDivision, basePath);
        if (logoPath) {
          const base64Logo = imageToBase64(logoPath);
          if (base64Logo) {
            logoDivision = base64Logo;
          } else {
            console.warn(`Impossible de convertir le logo de division: ${logoPath}`);
            logoDivision = null;
          }
        } else {
          console.warn(`Logo de division non trouvé: ${logoDivision}`);
          logoDivision = null;
        }
      }
      
      return {
        ...saison,
        logo_club: logoClub,
        logo_division: logoDivision,
      };
    });
    
    // Convertir les logos des intérêts
    const interetsWithBase64 = interets.map((interet: any) => {
      let logoClub = interet.logo_club;
      
      if (logoClub && !logoClub.startsWith('http') && !logoClub.startsWith('data:')) {
        const logoPath = resolveImagePath(logoClub, basePath);
        if (logoPath) {
          const base64Logo = imageToBase64(logoPath);
          if (base64Logo) {
            logoClub = base64Logo;
          } else {
            console.warn(`Impossible de convertir le logo d'intérêt: ${logoPath}`);
            logoClub = null;
          }
        } else {
          console.warn(`Logo d'intérêt non trouvé: ${logoClub}`);
          logoClub = null;
        }
      }
      
      return {
        ...interet,
        logo_club: logoClub,
      };
    });

    const formulaireData = {
      ...formulaire,
      archive: Boolean((formulaire as any).archive),
      photo_joueur: photoJoueur,
      qualites,
      saisons: saisonsWithBase64,
      formations,
      interets: interetsWithBase64,
    } as FormulaireJoueur;

    const pdfBuffer = await renderToBuffer(
      React.createElement(PlayerCV, { formulaire: formulaireData }) as any
    );

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV_${formulaireData.prenom}_${formulaireData.nom}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
