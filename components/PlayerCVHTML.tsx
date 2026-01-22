import React from 'react';
import { FormulaireJoueur } from '@/lib/types';

interface PlayerCVHTMLProps {
  formulaire: FormulaireJoueur;
}

const PlayerCVHTML: React.FC<PlayerCVHTMLProps> = ({ formulaire }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getNationalityFlag = (nationality: string) => {
    const flags: Record<string, string> = {
      'France': '🇫🇷',
      'Algérie': '🇩🇿',
      'Maroc': '🇲🇦',
      'Tunisie': '🇹🇳',
      'Sénégal': '🇸🇳',
      'Côte d\'Ivoire': '🇨🇮',
      'Cameroun': '🇨🇲',
      'Mali': '🇲🇱',
      'Belgique': '🇧🇪',
      'Espagne': '🇪🇸',
      'Portugal': '🇵🇹',
      'Italie': '🇮🇹',
      'Allemagne': '🇩🇪',
      'Angleterre': '🇬🇧',
      'Brésil': '🇧🇷',
      'Argentine': '🇦🇷',
    };
    return flags[nationality] || '🏳️';
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

  const getPhotoUrl = () => {
    return formulaire.photo_joueur || null;
  };

  const getLogoUrl = (logoPath: string) => {
    return logoPath || null;
  };

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

  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            background: white;
            color: #000;
            font-size: 10pt;
            line-height: 1.5;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto;
            padding: 0;
          }
          .header {
            background: #000;
            color: white;
            padding: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 5px solid #DC2626;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
            flex: 1;
          }
          .flag {
            font-size: 28px;
          }
          .player-name {
            font-size: 34px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 5px;
          }
          .player-position {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            color: #DC2626;
            letter-spacing: 1px;
          }
          .header-photo {
            width: 100px;
            height: 100px;
            border: 4px solid white;
            border-radius: 6px;
            overflow: hidden;
            background: white;
          }
          .header-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .content-container {
            display: flex;
            min-height: calc(297mm - 150px);
          }
          .left-column {
            width: 35%;
            background: #DC2626;
            color: white;
            padding: 20px;
          }
          .right-column {
            width: 65%;
            background: white;
            color: #000;
            padding: 20px;
          }
          .section {
            margin-bottom: 18px;
          }
          .section-title {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 12px;
            color: white;
            letter-spacing: 1px;
            padding-bottom: 5px;
            border-bottom: 2px solid white;
          }
          .section-title-right {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 12px;
            color: #000;
            letter-spacing: 1px;
            border-bottom: 3px solid #DC2626;
            padding-bottom: 5px;
          }
          .section-content {
            font-size: 11px;
            line-height: 1.7;
          }
          .profile-item {
            margin-bottom: 10px;
            font-size: 11px;
            line-height: 1.6;
          }
          .quality-item {
            font-size: 11px;
            margin-bottom: 7px;
            padding-left: 8px;
            line-height: 1.6;
          }
          .contact-item {
            margin-bottom: 10px;
            font-size: 11px;
            line-height: 1.6;
          }
          .video-section {
            margin-top: 12px;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border: 2px dashed white;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .video-text {
            font-size: 9px;
            color: #DC2626;
            font-weight: bold;
          }
          .career-section {
            margin-bottom: 16px;
          }
          .career-item {
            margin-bottom: 16px;
            padding-bottom: 14px;
            border-bottom: 1px solid #E5E5E5;
          }
          .career-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
          }
          .career-info {
            flex: 1;
          }
          .career-period {
            font-size: 19px;
            font-weight: bold;
            color: #DC2626;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
          }
          .career-club {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .career-category {
            font-size: 11px;
            color: #666;
            margin-bottom: 10px;
          }
          .career-logo-container {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .career-logo {
            width: 50px;
            height: 50px;
            object-fit: contain;
          }
          .career-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 10px;
          }
          .badge {
            font-size: 9px;
            color: white;
            background: #DC2626;
            padding: 6px 10px;
            border-radius: 4px;
            font-weight: bold;
            letter-spacing: 0.3px;
          }
          .badge-black {
            font-size: 9px;
            color: white;
            background: #1F1F1F;
            padding: 6px 10px;
            border-radius: 4px;
            font-weight: bold;
            letter-spacing: 0.3px;
          }
          .badge-gold {
            font-size: 9px;
            color: #000;
            background: #FFD700;
            padding: 6px 10px;
            border-radius: 4px;
            font-weight: bold;
            letter-spacing: 0.3px;
          }
          .badge-green {
            font-size: 9px;
            color: white;
            background: #10B981;
            padding: 6px 10px;
            border-radius: 4px;
            font-weight: bold;
            letter-spacing: 0.3px;
          }
          .badge-blue {
            font-size: 8.5px;
            color: white;
            background: #3B82F6;
            padding: 5px 8px;
            border-radius: 3px;
            font-weight: bold;
            letter-spacing: 0.2px;
          }
          .stats-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 10px;
          }
          .stat-box {
            background: #F3F4F6;
            color: #000;
            padding: 8px 16px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: bold;
            border: 1px solid #E5E7EB;
          }
          .formation-item {
            margin-bottom: 9px;
            font-size: 11px;
            padding-left: 8px;
            line-height: 1.7;
          }
          .formation-year {
            font-weight: bold;
            color: #DC2626;
          }
          .interet-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            gap: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #F3F4F6;
          }
          .interet-text {
            font-size: 11px;
            flex: 1;
            line-height: 1.7;
          }
          .interet-year {
            font-weight: bold;
            color: #DC2626;
          }
          .interet-logo {
            width: 38px;
            height: 38px;
            object-fit: contain;
          }
          @media print {
            .page {
              margin: 0;
              padding: 0;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="page">
          <div className="header">
            <div className="header-left">
              <span className="flag">{getNationalityFlag(primaryNationality)}</span>
              <div>
                <div className="player-name">
                  {formulaire.prenom?.toUpperCase()} {formulaire.nom?.toUpperCase()}
                </div>
                <div className="player-position">
                  {getPosteLabel(formulaire.poste_principal || '')}
                </div>
              </div>
            </div>
            {formulaire.photo_joueur && getPhotoUrl() && (
              <div className="header-photo">
                <img src={getPhotoUrl() || ''} alt="Photo du joueur" />
              </div>
            )}
          </div>

          <div className="content-container">
            <div className="left-column">
              <div className="section">
                <div className="section-title">PROFIL</div>
                <div className="section-content">
                  <div className="profile-item">
                    Né le {formatDate(formulaire.date_naissance)}
                  </div>
                  <div className="profile-item">
                    Pied fort - {formulaire.pied_fort || 'N/A'}
                  </div>
                  <div className="profile-item">
                    Taille - {formulaire.taille_cm} cm
                  </div>
                  {formulaire.envergure && (
                    <div className="profile-item">
                      Envergure - {formulaire.envergure} cm
                    </div>
                  )}
                </div>
                
                {formulaire.url_transfermarkt && (
                  <div className="video-section">
                    <div className="video-text">📹 Lien vidéo disponible</div>
                  </div>
                )}
              </div>

              {formulaire.qualites && formulaire.qualites.length > 0 && (
                <div className="section">
                  <div className="section-title">QUALITÉS</div>
                  <div className="section-content">
                    {formulaire.qualites.map((qualite, index) => (
                      <div key={index} className="quality-item">
                        • {typeof qualite === 'string' ? qualite : (qualite.libelle || String(qualite))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="section">
                <div className="section-title">CONTACT</div>
                <div className="section-content">
                  <div className="contact-item">
                    📧 {formulaire.email}
                  </div>
                  {formulaire.telephone && (
                    <div className="contact-item">
                      📱 {formulaire.telephone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="right-column">
              {formulaire.saisons && formulaire.saisons.length > 0 && (
                <div className="career-section">
                  <div className="section-title-right">CARRIÈRE & STATISTIQUES</div>
                  {formulaire.saisons
                    .sort((a, b) => (b.ordre || 0) - (a.ordre || 0))
                    .map((saison, index) => (
                      <div key={index} className="career-item">
                        <div className="career-header">
                          <div className="career-info">
                            <div className="career-period">
                              {formatSaisonPeriod(saison, index, formulaire.saisons || [])}
                            </div>
                            <div className="career-club">{saison.club}</div>
                            <div className="career-category">
                              {saison.categorie} {saison.division}
                            </div>
                          </div>
                          <div className="career-logo-container">
                            {saison.logo_club && getLogoUrl(saison.logo_club) && (
                              <img
                                src={getLogoUrl(saison.logo_club) || ''}
                                alt={`Logo ${saison.club}`}
                                className="career-logo"
                              />
                            )}
                            {saison.logo_division && getLogoUrl(saison.logo_division) && (
                              <img
                                src={getLogoUrl(saison.logo_division) || ''}
                                alt={`Logo ${saison.division}`}
                                className="career-logo"
                              />
                            )}
                          </div>
                        </div>
                        
                        <div className="career-badges">
                          {saison.saison_actuelle && (
                            <span className="badge-green">En cours</span>
                          )}
                          {!saison.saison_actuelle && (
                            <span className="badge-black">Complète</span>
                          )}
                          {saison.badge_surclasse && (
                            <span className="badge-black">Surclassé</span>
                          )}
                          {saison.badge_capitanat && (
                            <span className="badge-gold">Capitaine</span>
                          )}
                          {saison.badge_champion && (
                            <span className="badge-gold">Champion</span>
                          )}
                          {saison.badge_coupe_remportee && (
                            <span className="badge-gold">Coupe</span>
                          )}
                          {saison.categorie && (
                            <span className="badge-blue">{saison.categorie}</span>
                          )}
                          {saison.division && saison.division.includes('Régional') && (
                            <span className="badge-blue">
                              {saison.division.replace('Régional ', 'R')}
                            </span>
                          )}
                        </div>
                        
                        {(saison.clean_sheets !== null || saison.buts !== null || saison.passes_decisives !== null) && (
                          <div className="stats-container">
                            {saison.clean_sheets !== null && saison.clean_sheets !== undefined && (
                              <span className="stat-box">
                                {saison.clean_sheets} clean sheets
                              </span>
                            )}
                            {saison.buts !== null && saison.buts !== undefined && (
                              <span className="stat-box">
                                {saison.buts} buts
                              </span>
                            )}
                            {saison.passes_decisives !== null && saison.passes_decisives !== undefined && (
                              <span className="stat-box">
                                {saison.passes_decisives} passes décisives
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {formulaire.formations && formulaire.formations.length > 0 && (
                <div className="career-section">
                  <div className="section-title-right">FORMATION</div>
                  {formulaire.formations
                    .sort((a, b) => (b.ordre || 0) - (a.ordre || 0))
                    .map((formation, index) => {
                      let periode = formation.annee_ou_periode || '';
                      periode = periode.replace(/(\d{4})-(\d{4})/g, '$1 - $2');
                      periode = periode.replace(/▶|¶|->|→/g, ' - ');
                      periode = periode.replace(/\s*-\s*/g, ' - ');
                      
                      return (
                        <div key={index} className="formation-item">
                          <span className="formation-year">{periode}</span>
                          : {formation.titre_structure}
                          {formation.details && ` - ${formation.details}`}
                        </div>
                      );
                    })}
                </div>
              )}

              {formulaire.interets && formulaire.interets.length > 0 && (
                <div className="career-section">
                  <div className="section-title-right">INTÉRÊTS</div>
                  {formulaire.interets
                    .sort((a, b) => (b.ordre || 0) - (a.ordre || 0))
                    .map((interet, index) => (
                      <div key={index} className="interet-item">
                        <div className="interet-text">
                          <span className="interet-year">{interet.annee}</span>
                          : {interet.club} (invitation)
                        </div>
                        {interet.logo_club && getLogoUrl(interet.logo_club) && (
                          <img
                            src={getLogoUrl(interet.logo_club) || ''}
                            alt={`Logo ${interet.club}`}
                            className="interet-logo"
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default PlayerCVHTML;
