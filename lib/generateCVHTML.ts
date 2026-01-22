import { FormulaireJoueur } from '@/lib/types';

export function generateCVHTML(formulaire: FormulaireJoueur): string {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Fonction pour générer une icône de drapeau rectangulaire avec les couleurs du pays
  const getFlagIcon = (nationality: string, size: number = 28) => {
    const height = size * 0.7;
    const width = size;
    
    // Couleurs simplifiées des drapeaux (juste les couleurs principales, pas de symboles)
    const flagColors: Record<string, string> = {
      'France': 'vertical', // Bleu, Blanc, Rouge (vertical)
      'Algérie': 'horizontal', // Vert, Blanc, Rouge (horizontal)
      'Maroc': 'solid', // Rouge uni
      'Tunisie': 'solid', // Rouge uni
      'Sénégal': 'horizontal', // Vert, Jaune, Rouge (horizontal)
      'Côte d\'Ivoire': 'horizontal', // Orange, Blanc, Vert (horizontal)
      'Cameroun': 'horizontal', // Vert, Rouge, Jaune (horizontal)
      'Mali': 'horizontal', // Vert, Jaune, Rouge (horizontal)
      'Belgique': 'vertical', // Noir, Jaune, Rouge (vertical)
      'Espagne': 'horizontal', // Rouge, Jaune, Rouge (horizontal)
      'Portugal': 'vertical', // Vert, Rouge (vertical)
      'Italie': 'vertical', // Vert, Blanc, Rouge (vertical)
      'Allemagne': 'horizontal', // Noir, Rouge, Jaune (horizontal)
      'Angleterre': 'cross', // Croix rouge sur blanc
      'Brésil': 'solid', // Vert uni (simplifié)
      'Argentine': 'horizontal', // Bleu clair, Blanc, Bleu clair (horizontal)
    };

    const flagType = flagColors[nationality] || 'solid';
    
    // Génération du SVG selon le type de drapeau
    let svgContent = '';
    
    if (flagType === 'solid') {
      // Drapeaux unis (simplifiés)
      const colors: Record<string, string> = {
        'Maroc': '#C1272D',
        'Tunisie': '#E70013',
        'Brésil': '#009739',
      };
      const color = colors[nationality] || '#DC2626';
      svgContent = `<rect x="2" y="2" width="20" height="12" rx="1" fill="${color}"/>`;
    } else if (flagType === 'horizontal') {
      // Bande horizontales
      const bands: Record<string, string[]> = {
        'Algérie': ['#006233', '#FFFFFF', '#D21034'],
        'Sénégal': ['#00853F', '#FCD116', '#CE1126'],
        'Côte d\'Ivoire': ['#F77F00', '#FFFFFF', '#009639'],
        'Cameroun': ['#007A5E', '#CE1126', '#FCD116'],
        'Mali': ['#14B53A', '#FCD116', '#CE1126'],
        'Espagne': ['#AA151B', '#F1BF00', '#AA151B'],
        'Allemagne': ['#000000', '#DD0000', '#FFCE00'],
        'Argentine': ['#75AADB', '#FFFFFF', '#75AADB'],
      };
      const colors = bands[nationality] || ['#DC2626', '#FFFFFF', '#DC2626'];
      const bandHeight = 12 / colors.length;
      colors.forEach((color, index) => {
        svgContent += `<rect x="2" y="${2 + (bandHeight * index)}" width="20" height="${bandHeight}" fill="${color}"/>`;
      });
      svgContent += `<rect x="2" y="2" width="20" height="12" rx="1" fill="none" stroke="#000000" stroke-width="0.5" opacity="0.2"/>`;
    } else if (flagType === 'vertical') {
      // Bandes verticales
      const bands: Record<string, string[]> = {
        'France': ['#0055A4', '#FFFFFF', '#EF4135'],
        'Belgique': ['#000000', '#FAE042', '#ED2939'],
        'Portugal': ['#006600', '#FF0000'],
        'Italie': ['#009246', '#FFFFFF', '#CE2B37'],
      };
      const colors = bands[nationality] || ['#DC2626', '#FFFFFF', '#DC2626'];
      const bandWidth = 20 / colors.length;
      colors.forEach((color, index) => {
        svgContent += `<rect x="${2 + (bandWidth * index)}" y="2" width="${bandWidth}" height="12" fill="${color}"/>`;
      });
      svgContent += `<rect x="2" y="2" width="20" height="12" rx="1" fill="none" stroke="#000000" stroke-width="0.5" opacity="0.2"/>`;
    } else if (flagType === 'cross') {
      // Croix (Angleterre)
      svgContent = `
        <rect x="2" y="2" width="20" height="12" rx="1" fill="#FFFFFF"/>
        <rect x="2" y="6" width="20" height="4" fill="#C8102E"/>
        <rect x="10" y="2" width="4" height="12" fill="#C8102E"/>
      `;
    } else {
      // Par défaut, rectangle uni rouge
      svgContent = `<rect x="2" y="2" width="20" height="12" rx="1" fill="#DC2626"/>`;
    }
    
    return `<svg width="${width}" height="${height}" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${svgContent}
    </svg>`;
  };

  const parseNationalities = (nationalities: string): string[] => {
    try {
      const parsed = JSON.parse(nationalities);
      return Array.isArray(parsed) ? parsed : [nationalities];
    } catch {
      return [nationalities];
    }
  };

  const nationalities = parseNationalities(formulaire.nationalites || '');
  const primaryNationality = nationalities[0] || '';

  const formatSaisonPeriod = (saison: any, index: number, allSaisons: any[]) => {
    if (saison.periode) {
      let period = saison.periode;
      period = period.replace(/▶|¶|->|→/g, ' - ');
      period = period.replace(/\s*-\s*/g, ' - ');
      if (period.match(/^\d{4}\s*-\s*\d{4}$/)) {
        return period;
      }
      const years = period.match(/\d{4}/g);
      if (years && years.length >= 2) {
        return `${years[0]} - ${years[1]}`;
      }
      return period;
    }
    
    const currentYear = new Date().getFullYear();
    const sortedSaisons = [...allSaisons].sort((a, b) => (b.ordre || 0) - (a.ordre || 0));
    const currentIndex = sortedSaisons.findIndex(s => s === saison);
    
    if (saison.saison_actuelle) {
      return `${currentYear - 1} - ${currentYear}`;
    }
    
    const yearsAgo = currentIndex + 1;
    const startYear = currentYear - yearsAgo - 1;
    const endYear = currentYear - yearsAgo;
    return `${startYear} - ${endYear}`;
  };

  const getPosteLabel = (poste: string) => {
    const posteLabels: Record<string, string> = {
      'GB': 'GARDIEN',
      'DG': 'DÉFENSEUR GAUCHE',
      'DC': 'DÉFENSEUR CENTRAL',
      'DD': 'DÉFENSEUR DROIT',
      'MDC': 'MILIEU DÉFENSIF',
      'MC': 'MILIEU CENTRAL',
      'MOC': 'MILIEU OFFENSIF',
      'AG': 'AILIER GAUCHE',
      'AD': 'AILIER DROIT',
      'BU': 'BUTEUR',
      'Piston G': 'PISTON GAUCHE',
      'Piston D': 'PISTON DROIT',
    };
    return posteLabels[poste] || poste.toUpperCase();
  };

  // Fonction pour générer le terrain de football avec les positions
  const getPitchVisualization = (poste: string) => {
    // Grille des postes selon la formation 4-3-3
    const allPositions = [
      { code: 'GB', x: 50, y: 90, label: 'GB' }, // Gardien de But
      { code: 'DC', x: 40, y: 75, label: 'DC' }, // Défenseur Central gauche
      { code: 'DC', x: 60, y: 75, label: 'DC' }, // Défenseur Central droit
      { code: 'DG', x: 20, y: 70, label: 'DG' }, // Défenseur Gauche (écarté)
      { code: 'DD', x: 80, y: 70, label: 'DD' }, // Défenseur Droit (écarté)
      { code: 'MDC', x: 50, y: 55, label: 'MDC' }, // Milieu Défensif Centre
      { code: 'MC', x: 35, y: 45, label: 'MC' }, // Milieu Centre (monté)
      { code: 'MOC', x: 65, y: 45, label: 'MOC' }, // Milieu Offensif Centre (monté)
      { code: 'BU', x: 50, y: 20, label: 'BU' }, // Buteur
      { code: 'AG', x: 30, y: 25, label: 'AG' }, // Aile Gauche
      { code: 'AD', x: 70, y: 25, label: 'AD' }, // Aile Droite
    ];

    // Déterminer si le joueur correspond à une position
    const isPlayerPosition = (code: string): boolean => {
      if (poste === code) return true;
      // Si le joueur est DC, mettre en évidence les deux DC
      if (poste === 'DC' && code === 'DC') return true;
      return false;
    };

    return `
      <div class="pitch-container">
        <svg viewBox="0 0 200 200" class="pitch-svg" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
          <!-- Fond du terrain - rectangle parfait -->
          <rect x="0" y="0" width="200" height="200" fill="#4a7c59"/>
          
          <!-- Ligne médiane - droite -->
          <line x1="0" y1="100" x2="200" y2="100" stroke="#ffffff" stroke-width="3" stroke-linecap="butt"/>
          
          <!-- Cercle central -->
          <circle cx="100" cy="100" r="30" fill="none" stroke="#ffffff" stroke-width="3" shape-rendering="geometricPrecision"/>
          <circle cx="100" cy="100" r="4" fill="#ffffff"/>
          
          <!-- Surface de réparation haut - rectangles droits -->
          <rect x="40" y="0" width="120" height="50" fill="none" stroke="#ffffff" stroke-width="3"/>
          <rect x="70" y="0" width="60" height="24" fill="none" stroke="#ffffff" stroke-width="3"/>
          
          <!-- Surface de réparation bas - rectangles droits -->
          <rect x="40" y="150" width="120" height="50" fill="none" stroke="#ffffff" stroke-width="3"/>
          <rect x="70" y="176" width="60" height="24" fill="none" stroke="#ffffff" stroke-width="3"/>
          
          <!-- Bordures du terrain - lignes droites -->
          <rect x="0" y="0" width="200" height="200" fill="none" stroke="#ffffff" stroke-width="3"/>
          
          <!-- Points des joueurs (formation 4-3-3) - coordonnées doublées pour viewBox 200x200 -->
          ${allPositions.map(pos => {
            const isPlayer = isPlayerPosition(pos.code);
            const x = pos.x * 2;
            const y = pos.y * 2;
            return `
              <circle 
                cx="${x}" 
                cy="${y}" 
                r="${isPlayer ? '12' : '8'}" 
                fill="${isPlayer ? '#DC2626' : '#ffffff'}" 
                stroke="${isPlayer ? '#ffffff' : '#999999'}" 
                stroke-width="${isPlayer ? '3' : '2'}"
              />
            `;
          }).join('')}
        </svg>
      </div>
    `;
  };

  const escapeHtml = (text: string) => {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const getMailIcon = (size: number = 16, color: string = 'white') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>`;
  };

  const getPhoneIcon = (size: number = 16, color: string = 'white') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>`;
  };

  const getCalendarIcon = (size: number = 16, color: string = 'white') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>`;
  };

  const getShoeIcon = (size: number = 16, color: string = 'white') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16c1 0 2 1 2 2v3.28a1 1 0 0 1-.684.948L15 11l-3 3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/>
      <path d="m8 11 4-4"/>
      <path d="M10 19h4"/>
    </svg>`;
  };

  const getRulerVerticalIcon = (size: number = 16, color: string = 'white') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="M7.5 4.27 9 5.09"/>
      <path d="M7.5 19.73 9 18.91"/>
      <path d="M12 4.5v15"/>
      <path d="M15 5.09 16.5 4.27"/>
      <path d="M15 18.91 16.5 19.73"/>
    </svg>`;
  };

  const getMoveHorizontalIcon = (size: number = 16, color: string = 'white') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 8 22 12 18 16"/>
      <polyline points="6 8 2 12 6 16"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>`;
  };

  const getCrownIcon = (size: number = 12, color: string = '#000') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519L20.5 12.5a1 1 0 0 1-.396 1.124l-3.528 2.117a1 1 0 0 0-.618 1.09l.853 4.26a.5.5 0 0 1-.724.561l-3.93-2.88a1 1 0 0 0-1.17 0l-3.93 2.88a.5.5 0 0 1-.724-.56l.853-4.261a1 1 0 0 0-.618-1.09L3.896 13.624A1 1 0 0 1 3.5 12.5l1.485-6.481a.5.5 0 0 1 .798-.519L9.094 9.164a1 1 0 0 0 1.516-.294z"/>
    </svg>`;
  };

  const getTrophyIcon = (size: number = 12, color: string = '#000') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>`;
  };

  const getAwardIcon = (size: number = 12, color: string = '#000') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>`;
  };

  const getTargetIcon = (size: number = 16, color: string = '#DC2626') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>`;
  };

  const getPassIcon = (size: number = 16, color: string = '#3B82F6') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 2 11 13"/>
      <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>`;
  };

  const getClockIcon = (size: number = 16, color: string = '#10B981') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`;
  };

  const getShieldIcon = (size: number = 16, color: string = '#8B5CF6') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`;
  };

  const getCalendarMatchesIcon = (size: number = 16, color: string = '#8B5CF6') => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>`;
  };

  const photoUrl = formulaire.photo_joueur || '';
  const playerName = `${formulaire.prenom?.toUpperCase() || ''} ${formulaire.nom?.toUpperCase() || ''}`.trim();
  const playerPosition = getPosteLabel(formulaire.poste_principal || '');

  const qualitesHTML = (formulaire.qualites || [])
    .map(q => {
      const qualiteText = typeof q === 'string' ? q : (q.libelle || String(q));
      return `<div class="quality-item">• ${escapeHtml(qualiteText)}</div>`;
    })
    .join('');

  const saisonsHTML = (formulaire.saisons || [])
    .sort((a, b) => {
      if (a.saison_actuelle && !b.saison_actuelle) return -1;
      if (!a.saison_actuelle && b.saison_actuelle) return 1;
      
      const ordreDiff = (b.ordre || 0) - (a.ordre || 0);
      if (ordreDiff !== 0) return ordreDiff;
      
      const getYearFromPeriod = (period: string) => {
        if (!period) return 0;
        const years = period.match(/\d{4}/g);
        if (years && years.length > 0) {
          return parseInt(years[years.length - 1]); // Prendre la dernière année
        }
        return 0;
      };
      
      const yearA = getYearFromPeriod(a.periode || '');
      const yearB = getYearFromPeriod(b.periode || '');
      
      return yearB - yearA;
    })
    .map((saison, index) => {
      const period = formatSaisonPeriod(saison, index, formulaire.saisons || []);
      const club = escapeHtml(saison.club || '');
      const category = escapeHtml(`${saison.categorie || ''} ${saison.division || ''}`.trim());
      
      const badges = [];
      if (saison.saison_actuelle) badges.push('<span class="badge-green">En cours</span>');
      if (!saison.saison_actuelle) badges.push('<span class="badge-black">Complète</span>');
      if (saison.badge_surclasse) badges.push('<span class="badge-black">Surclassé</span>');
      if (saison.badge_capitanat) badges.push(`<span class="badge-gold">${getCrownIcon(10, '#000')} Capitaine</span>`);
      if (saison.badge_champion) badges.push(`<span class="badge-gold">${getTrophyIcon(10, '#000')} Champion</span>`);
      if (saison.badge_coupe_remportee) badges.push(`<span class="badge-gold">${getAwardIcon(10, '#000')} Coupe</span>`);

      const stats = [];
      if (saison.buts !== null && saison.buts !== undefined) {
        stats.push(`<div class="stat-card stat-card-goals">
          <div class="stat-icon">${getTargetIcon(14, '#DC2626')}</div>
          <div class="stat-content">
            <div class="stat-value">${saison.buts}</div>
            <div class="stat-label">Buts</div>
          </div>
        </div>`);
      }
      if (saison.passes_decisives !== null && saison.passes_decisives !== undefined) {
        stats.push(`<div class="stat-card stat-card-assists">
          <div class="stat-icon">${getPassIcon(14, '#3B82F6')}</div>
          <div class="stat-content">
            <div class="stat-value">${saison.passes_decisives}</div>
            <div class="stat-label">Passes décisives</div>
          </div>
        </div>`);
      }
      if (saison.temps_jeu_moyen !== null && saison.temps_jeu_moyen !== undefined) {
        stats.push(`<div class="stat-card stat-card-time">
          <div class="stat-icon">${getClockIcon(14, '#10B981')}</div>
          <div class="stat-content">
            <div class="stat-value">${saison.temps_jeu_moyen}'</div>
            <div class="stat-label">Temps de jeu moyen</div>
          </div>
        </div>`);
      }
      if (saison.matchs !== null && saison.matchs !== undefined) {
        stats.push(`<div class="stat-card stat-card-matches">
          <div class="stat-icon">${getCalendarMatchesIcon(14, '#8B5CF6')}</div>
          <div class="stat-content">
            <div class="stat-value">${saison.matchs}</div>
            <div class="stat-label">Matchs</div>
          </div>
        </div>`);
      }
      if (saison.clean_sheets !== null && saison.clean_sheets !== undefined) {
        stats.push(`<div class="stat-card stat-card-cleansheets">
          <div class="stat-icon">${getShieldIcon(14, '#8B5CF6')}</div>
          <div class="stat-content">
            <div class="stat-value">${saison.clean_sheets}</div>
            <div class="stat-label">Clean sheets</div>
          </div>
        </div>`);
      }

      const logoClub = saison.logo_club ? `<img src="${escapeHtml(saison.logo_club)}" alt="Logo ${club}" class="career-logo" />` : '';
      const logoDivision = saison.logo_division ? `<img src="${escapeHtml(saison.logo_division)}" alt="Logo ${saison.division}" class="career-logo" />` : '';

      return `
        <div class="career-item">
          <div class="career-header">
            <div class="career-info">
              <div class="career-period">${escapeHtml(period)}</div>
              <div class="career-club">${club}</div>
              <div class="career-category">${category}</div>
            </div>
            <div class="career-logo-container">
              ${logoClub}
              ${logoDivision}
            </div>
          </div>
          <div class="career-badges">
            ${badges.join('')}
          </div>
          ${stats.length > 0 ? `<div class="stats-container">${stats.join('')}</div>` : ''}
        </div>
      `;
    })
    .join('');

  const formationsHTML = (formulaire.formations || [])
    .sort((a, b) => {
      const ordreDiff = (b.ordre || 0) - (a.ordre || 0);
      if (ordreDiff !== 0) return ordreDiff;
      
      const getYearFromPeriod = (period: string) => {
        if (!period) return 0;
        const years = period.match(/\d{4}/g);
        if (years && years.length > 0) {
          return parseInt(years[years.length - 1]);
        }
        return 0;
      };
      
      const yearA = getYearFromPeriod(a.annee_ou_periode || '');
      const yearB = getYearFromPeriod(b.annee_ou_periode || '');
      
      return yearB - yearA;
    })
    .map((formation) => {
      let periode = formation.annee_ou_periode || '';
      periode = periode.replace(/(\d{4})-(\d{4})/g, '$1 - $2');
      periode = periode.replace(/▶|¶|->|→/g, ' - ');
      periode = periode.replace(/\s*-\s*/g, ' - ');
      const titre = escapeHtml(formation.titre_structure || '');
      const details = formation.details ? ` - ${escapeHtml(formation.details)}` : '';
      return `<div class="formation-item"><span class="formation-year">${escapeHtml(periode)}</span>: ${titre}${details}</div>`;
    })
    .join('');

  const interetsHTML = (formulaire.interets || [])
    .sort((a, b) => {
      const ordreDiff = (b.ordre || 0) - (a.ordre || 0);
      if (ordreDiff !== 0) return ordreDiff;
      
      const yearA = parseInt(a.annee || '0') || 0;
      const yearB = parseInt(b.annee || '0') || 0;
      
      return yearB - yearA;
    })
    .map((interet) => {
      const club = escapeHtml(interet.club || '');
      const annee = escapeHtml(interet.annee || '');
      const logo = interet.logo_club ? `<img src="${escapeHtml(interet.logo_club)}" alt="Logo ${club}" class="interet-logo" />` : '';
      return `
        <div class="interet-item">
          <div class="interet-text">
            <span class="interet-year">${annee}</span>: ${club} (invitation)
          </div>
          ${logo}
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif;
        background: white;
        color: #000;
        font-size: 12pt;
        line-height: 1.6;
        font-weight: 400;
      }
      .page {
        width: 210mm;
        height: 297mm;
        background: white;
        margin: 0 auto;
        padding: 0;
        overflow: hidden;
        position: relative;
      }
      .header {
        background: #000;
        color: white;
        padding: 35px 20px 20px 20px;
        min-height: 140px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
        overflow: visible;
      }
      .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 15px;
        background: #DC2626;
        transform: skewY(-2deg);
        transform-origin: top left;
      }
      .header-left-content {
        display: flex;
        flex-direction: column;
        gap: 15px;
        flex: 1;
        z-index: 2;
        position: relative;
      }
      .header-name-section {
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 25;
        position: relative;
        margin-bottom: 10px;
      }
      .header-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 0 0 auto;
        z-index: 2;
        margin-top: 10px;
      }
      .pitch-container {
        width: 350px;
        height: 220px;
        position: relative;
        filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
      }
      .pitch-svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .player-dot-active {
        filter: drop-shadow(0 0 4px rgba(220, 38, 38, 1));
        animation: pulse-ring 2s infinite;
      }
      @keyframes pulse-ring {
        0% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.1);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      .player-dot-active::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
        animation: ripple 2s infinite;
      }
      @keyframes ripple {
        0% {
          transform: scale(1);
          opacity: 0.8;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
      .flag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 24px;
        color: white;
        flex-shrink: 0;
        border: 2px solid white;
        border-radius: 2px;
      }
      .player-name {
        font-size: 48px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 2.5px;
        line-height: 1.1;
        color: #ffffff;
        text-shadow: 3px 3px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px 1px 0px rgba(0, 0, 0, 0.8);
        position: relative;
        z-index: 30;
        white-space: nowrap;
      }
      .player-position {
        font-size: 20px;
        font-weight: 700;
        text-transform: uppercase;
        color: #ffffff;
        letter-spacing: 1.8px;
        line-height: 1.2;
        text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px 1px 0px rgba(0, 0, 0, 0.8);
        margin-top: 6px;
      }
      .header-photo {
        width: 180px;
        height: 280px;
        border: 3px solid white;
        border-radius: 4px;
        overflow: hidden;
        background: white;
        position: absolute;
        top: 100px;
        left: 30px;
        z-index: 15;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .header-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .content-container {
        display: flex;
        height: calc(297mm - 150px);
        margin-top: 0;
        position: relative;
      }
      .left-column {
        width: 35%;
        background: #DC2626;
        color: white;
        padding: 12px 15px;
        padding-top: 140px;
        overflow: visible;
        position: relative;
      }
      .right-column {
        width: 65%;
        background: white;
        color: #000;
        padding: 12px 15px;
        overflow: hidden;
      }
      .section {
        margin-bottom: 10px;
      }
      .section-title {
        font-size: 15px;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 10px;
        color: white;
        letter-spacing: 1.2px;
        padding-bottom: 5px;
        border-bottom: 2px solid white;
      }
      .section-title-right {
        font-size: 15px;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 10px;
        color: #000;
        letter-spacing: 1.2px;
        border-bottom: 3px solid #DC2626;
        padding-bottom: 5px;
      }
      .section-content {
        font-size: 12px;
        line-height: 1.7;
      }
      .profile-item {
        margin-bottom: 8px;
        font-size: 12px;
        line-height: 1.6;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
      }
      .profile-icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .quality-item {
        font-size: 12px;
        margin-bottom: 6px;
        padding-left: 8px;
        line-height: 1.6;
        font-weight: 500;
      }
      .contact-item {
        margin-bottom: 8px;
        font-size: 12px;
        line-height: 1.6;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
      .contact-icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .video-section {
        margin-top: 6px;
        padding: 6px;
        background: white;
        border-radius: 3px;
        border: 1.5px dashed white;
        min-height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .video-text {
        font-size: 10px;
        color: #DC2626;
        font-weight: 700;
      }
      .career-section {
        margin-bottom: 10px;
      }
      .career-item {
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #E5E5E5;
      }
      .career-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 6px;
      }
      .career-info {
        flex: 1;
      }
      .career-period {
        font-size: 20px;
        font-weight: 800;
        color: #DC2626;
        margin-bottom: 5px;
        letter-spacing: 0.5px;
        line-height: 1.3;
      }
      .career-club {
        font-size: 16px;
        font-weight: 700;
        color: #000;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1.3;
      }
      .career-category {
        font-size: 11px;
        color: #666;
        margin-bottom: 8px;
        line-height: 1.4;
        font-weight: 500;
      }
      .career-logo-container {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .career-logo {
        width: 35px;
        height: 35px;
        object-fit: contain;
      }
      .career-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 5px;
      }
      .badge {
        font-size: 9px;
        color: white;
        background: #DC2626;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: 700;
        letter-spacing: 0.3px;
      }
      .badge-black {
        font-size: 9px;
        color: white;
        background: #1F1F1F;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: 700;
        letter-spacing: 0.3px;
      }
      .badge-gold {
        font-size: 9px;
        color: #000;
        background: #FFD700;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: 700;
        letter-spacing: 0.3px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .badge-gold svg {
        flex-shrink: 0;
      }
      .badge-green {
        font-size: 9px;
        color: white;
        background: #10B981;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: 700;
        letter-spacing: 0.3px;
      }
      .badge-blue {
        font-size: 7px;
        color: white;
        background: #3B82F6;
        padding: 2px 5px;
        border-radius: 2px;
        font-weight: bold;
        letter-spacing: 0.15px;
      }
      .stats-container {
        display: flex;
        flex-wrap: nowrap;
        gap: 8px;
        margin-top: 10px;
        overflow-x: auto;
      }
      .stat-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border: 2px solid #E5E7EB;
        border-radius: 6px;
        padding: 6px 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s;
        flex-shrink: 0;
        min-width: 90px;
      }
      .stat-card-goals {
        border-left: 3px solid #DC2626;
      }
      .stat-card-assists {
        border-left: 3px solid #3B82F6;
      }
      .stat-card-time {
        border-left: 3px solid #10B981;
      }
      .stat-card-matches {
        border-left: 3px solid #8B5CF6;
      }
      .stat-card-cleansheets {
        border-left: 3px solid #8B5CF6;
      }
      .stat-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 4px;
      }
      .stat-content {
        flex: 1;
        min-width: 0;
      }
      .stat-value {
        font-size: 14px;
        font-weight: 800;
        color: #000;
        line-height: 1.2;
        margin-bottom: 1px;
      }
      .stat-label {
        font-size: 8px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.2px;
        line-height: 1.2;
      }
      .formation-item {
        margin-bottom: 8px;
        font-size: 12px;
        padding-left: 8px;
        line-height: 1.7;
        font-weight: 500;
      }
      .formation-year {
        font-weight: 800;
        color: #DC2626;
        font-size: 13px;
      }
      .interet-item {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        gap: 8px;
        padding-bottom: 5px;
        border-bottom: 1px solid #F3F4F6;
      }
      .interet-text {
        font-size: 12px;
        flex: 1;
        line-height: 1.7;
        font-weight: 500;
      }
      .interet-year {
        font-weight: 800;
        color: #DC2626;
        font-size: 13px;
      }
      .interet-logo {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }
      @media print {
        .page {
          margin: 0;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div class="header-left-content">
          <div class="header-name-section">
            <span class="flag">${getFlagIcon(primaryNationality, 32)}</span>
            <div style="position: relative; z-index: 30;">
              <div class="player-name">${escapeHtml(playerName)}</div>
              <div class="player-position">${escapeHtml(playerPosition)}</div>
            </div>
          </div>
          ${photoUrl ? `<div class="header-photo"><img src="${escapeHtml(photoUrl)}" alt="Photo du joueur" /></div>` : ''}
        </div>
        <div class="header-right">
          ${getPitchVisualization(formulaire.poste_principal || '')}
        </div>
      </div>
      <div class="content-container">
        <div class="left-column">
          <div class="section">
            <div class="section-title">PROFIL</div>
            <div class="section-content">
              <div class="profile-item">
                <span class="profile-icon">${getCalendarIcon(14, 'white')}</span>
                <span>Né le ${formatDate(formulaire.date_naissance)}</span>
              </div>
              <div class="profile-item">
                <span class="profile-icon">${getShoeIcon(14, 'white')}</span>
                <span>Pied fort - ${escapeHtml(formulaire.pied_fort || 'N/A')}</span>
              </div>
              <div class="profile-item">
                <span class="profile-icon">${getRulerVerticalIcon(14, 'white')}</span>
                <span>Taille - ${formulaire.taille_cm} cm</span>
              </div>
              ${formulaire.envergure ? `
                <div class="profile-item">
                  <span class="profile-icon">${getMoveHorizontalIcon(14, 'white')}</span>
                  <span>Envergure - ${formulaire.envergure} cm</span>
                </div>
              ` : ''}
            </div>
            ${formulaire.url_transfermarkt ? `
              <div class="video-section">
                <div class="video-text">📹 Lien vidéo disponible</div>
              </div>
            ` : ''}
          </div>
          ${qualitesHTML ? `
            <div class="section">
              <div class="section-title">QUALITÉS</div>
              <div class="section-content">
                ${qualitesHTML}
              </div>
            </div>
          ` : ''}
          <div class="section">
            <div class="section-title">CONTACT</div>
            <div class="section-content">
              <div class="contact-item">
                <span class="contact-icon">${getMailIcon(16, 'white')}</span>
                <span>${escapeHtml(formulaire.email || '')}</span>
              </div>
              ${formulaire.telephone ? `
                <div class="contact-item">
                  <span class="contact-icon">${getPhoneIcon(16, 'white')}</span>
                  <span>${escapeHtml(formulaire.telephone)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        <div class="right-column">
          ${saisonsHTML ? `
            <div class="career-section">
              <div class="section-title-right">CARRIÈRE & STATISTIQUES</div>
              ${saisonsHTML}
            </div>
          ` : ''}
          ${formationsHTML ? `
            <div class="career-section">
              <div class="section-title-right">FORMATION</div>
              ${formationsHTML}
            </div>
          ` : ''}
          ${interetsHTML ? `
            <div class="career-section">
              <div class="section-title-right">INTÉRÊTS</div>
              ${interetsHTML}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  </body>
</html>`;
}
