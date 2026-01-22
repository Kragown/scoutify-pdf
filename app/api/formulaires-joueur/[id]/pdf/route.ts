import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { FormulaireJoueur } from '@/lib/types';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { generateCVHTML } from '@/lib/generateCVHTML';

export const runtime = 'nodejs';

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

const resolveImagePath = (imagePath: string, basePath: string = process.cwd()): string | null => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/photos/') || imagePath.startsWith('/logos/')) {
    const fullPath = join(basePath, 'public', imagePath);
    return existsSync(fullPath) ? fullPath : null;
  }
  
  if (!imagePath.includes('/')) {
    const photosPath = join(basePath, 'public', 'photos', imagePath);
    if (existsSync(photosPath)) return photosPath;
    const logosPath = join(basePath, 'public', 'logos', imagePath);
    if (existsSync(logosPath)) return logosPath;
    return null;
  }
  
  const fullPath = join(basePath, 'public', imagePath);
  return existsSync(fullPath) ? fullPath : null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let browser;
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

    const basePath = process.cwd();
    
    let photoJoueur = (formulaire as any).photo_joueur;
    if (photoJoueur && !photoJoueur.startsWith('http') && !photoJoueur.startsWith('data:')) {
      const photoPath = resolveImagePath(photoJoueur, basePath);
      if (photoPath) {
        const base64Photo = imageToBase64(photoPath);
        if (base64Photo) {
          photoJoueur = base64Photo;
        }
      }
    }
    
    const saisonsWithBase64 = saisons.map((saison: any) => {
      let logoClub = saison.logo_club;
      let logoDivision = saison.logo_division;
      
      if (logoClub && !logoClub.startsWith('http') && !logoClub.startsWith('data:')) {
        const logoPath = resolveImagePath(logoClub, basePath);
        if (logoPath) {
          const base64Logo = imageToBase64(logoPath);
          if (base64Logo) logoClub = base64Logo;
        }
      }
      
      if (logoDivision && !logoDivision.startsWith('http') && !logoDivision.startsWith('data:')) {
        const logoPath = resolveImagePath(logoDivision, basePath);
        if (logoPath) {
          const base64Logo = imageToBase64(logoPath);
          if (base64Logo) logoDivision = base64Logo;
        }
      }
      
      return {
        ...saison,
        logo_club: logoClub,
        logo_division: logoDivision,
      };
    });
    
    const interetsWithBase64 = interets.map((interet: any) => {
      let logoClub = interet.logo_club;
      
      if (logoClub && !logoClub.startsWith('http') && !logoClub.startsWith('data:')) {
        const logoPath = resolveImagePath(logoClub, basePath);
        if (logoPath) {
          const base64Logo = imageToBase64(logoPath);
          if (base64Logo) logoClub = base64Logo;
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

    const htmlContent = generateCVHTML(formulaireData);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    
    await page.setViewport({
      width: 2480,
      height: 3508,
      deviceScaleFactor: 2,
    });

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV_${formulaireData.prenom}_${formulaireData.nom}.pdf"`,
      },
    });

  } catch (error: any) {
    if (browser) {
      await browser.close();
    }
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
