import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { FormulaireJoueur } from '@/lib/types';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    padding: 0,
    size: 'A4',
  },
  header: {
    backgroundColor: '#000000',
    padding: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  flag: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  playerName: {
    fontSize: 26,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: 1,
  },
  playerPosition: {
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerPhoto: {
    width: 90,
    height: 90,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  headerPhotoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  contentContainer: {
    flexDirection: 'row',
    flex: 1,
    maxHeight: 600,
  },
  leftColumn: {
    width: '35%',
    backgroundColor: '#DC2626', // Rouge
    padding: 18,
    color: '#FFFFFF',
  },
  rightColumn: {
    width: '65%',
    backgroundColor: '#FFFFFF', // Blanc
    padding: 18,
    color: '#000000',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  sectionTitleRight: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    color: '#000000',
    letterSpacing: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
    paddingBottom: 4,
  },
  sectionContent: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  profileItem: {
    marginBottom: 8,
    fontSize: 9,
    color: '#FFFFFF',
  },
  qualitiesList: {
    marginTop: 5,
  },
  qualityItem: {
    fontSize: 9,
    marginBottom: 5,
    color: '#FFFFFF',
    paddingLeft: 5,
  },
  contactItem: {
    marginBottom: 8,
    fontSize: 9,
    color: '#FFFFFF',
  },
  videoSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  careerSection: {
    marginBottom: 15,
  },
  careerItem: {
    marginBottom: 14,
    paddingLeft: 0,
  },
  careerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  careerPeriodText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },
  careerClub: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  careerCategory: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 8,
  },
  careerLogo: {
    width: 50,
    height: 50,
    marginLeft: 8,
    objectFit: 'contain',
  },
  careerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  careerBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8,
  },
  badge: {
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: '#DC2626',
    padding: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontWeight: 'bold',
    marginRight: 4,
    marginBottom: 4,
  },
  badgeBlack: {
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: '#000000',
    padding: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontWeight: 'bold',
    marginRight: 4,
    marginBottom: 4,
  },
  badgeGold: {
    fontSize: 8,
    color: '#000000',
    backgroundColor: '#FFD700',
    padding: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontWeight: 'bold',
    marginRight: 4,
    marginBottom: 4,
  },
  badgeGreen: {
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: '#10B981',
    padding: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontWeight: 'bold',
    marginRight: 4,
    marginBottom: 4,
  },
  badgeBlue: {
    fontSize: 7,
    color: '#FFFFFF',
    backgroundColor: '#3B82F6',
    padding: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
    fontWeight: 'bold',
    marginRight: 4,
    marginBottom: 4,
  },
  statBox: {
    backgroundColor: '#E5E5E5',
    color: '#000000',
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 5,
    marginRight: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
  },
  formationItem: {
    marginBottom: 6,
    fontSize: 9,
    color: '#000000',
    paddingLeft: 5,
  },
  interetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  interetText: {
    fontSize: 9,
    color: '#000000',
    flex: 1,
  },
  interetLogo: {
    width: 35,
    height: 35,
    objectFit: 'contain',
  },
  careerInfo: {
    flex: 1,
  },
});

interface PlayerCVProps {
  formulaire: FormulaireJoueur;
}

const PlayerCV: React.FC<PlayerCVProps> = ({ formulaire }) => {
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

  const getPhotoPath = () => {
    return formulaire.photo_joueur || null;
  };

  const getLogoPath = (logoPath: string) => {
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
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec nom, position et photo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.flag}>{getNationalityFlag(primaryNationality)}</Text>
            <View style={styles.headerText}>
              <Text style={styles.playerName}>
                {formulaire.prenom?.toUpperCase()} {formulaire.nom?.toUpperCase()}
              </Text>
              <Text style={styles.playerPosition}>
                {getPosteLabel(formulaire.poste_principal || '')}
              </Text>
            </View>
          </View>
          {formulaire.photo_joueur && getPhotoPath() && (
            <View style={styles.headerPhoto}>
              <Image
                src={getPhotoPath() || ''}
                style={styles.headerPhotoImage}
              />
            </View>
          )}
        </View>

        {/* Contenu en deux colonnes */}
        <View style={styles.contentContainer}>
          {/* Colonne de gauche - Fond rouge */}
          <View style={styles.leftColumn}>
            {/* Section PROFIL */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PROFIL</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.profileItem}>
                  Né le {formatDate(formulaire.date_naissance)}
                </Text>
                <Text style={styles.profileItem}>
                  Pied fort - {formulaire.pied_fort || 'N/A'}
                </Text>
                <Text style={styles.profileItem}>
                  Taille - {formulaire.taille_cm} cm
                </Text>
                {formulaire.envergure && (
                  <Text style={styles.profileItem}>
                    Envergure - {formulaire.envergure} cm
                  </Text>
                )}
              </View>
              
              {/* Section vidéo optionnelle */}
              {formulaire.url_transfermarkt && (
                <View style={styles.videoSection}>
                  <Text style={{ fontSize: 8, color: '#000000' }}>Lien vidéo disponible</Text>
                </View>
              )}
            </View>

            {/* Section QUALITÉS */}
            {formulaire.qualites && formulaire.qualites.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>QUALITÉS</Text>
                <View style={styles.qualitiesList}>
                  {formulaire.qualites.map((qualite, index) => (
                    <Text key={index} style={styles.qualityItem}>
                      • {qualite.libelle || qualite}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Section CONTACT */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CONTACT</Text>
              <View style={styles.sectionContent}>
                <Text style={styles.contactItem}>
                  {formulaire.email}
                </Text>
                {formulaire.telephone && (
                  <Text style={styles.contactItem}>
                    {formulaire.telephone}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Colonne de droite - Fond blanc */}
          <View style={styles.rightColumn}>
            {/* Section CARRIÈRE & STATISTIQUES */}
            {formulaire.saisons && formulaire.saisons.length > 0 && (
              <View style={styles.careerSection}>
                <Text style={styles.sectionTitleRight}>CARRIÈRE & STATISTIQUES</Text>
                {formulaire.saisons
                  .sort((a, b) => (b.ordre || 0) - (a.ordre || 0))
                  .map((saison, index) => (
                    <View key={index} style={styles.careerItem}>
                      <View style={styles.careerHeader}>
                        <View style={styles.careerInfo}>
                          <Text style={styles.careerPeriodText}>
                            {formatSaisonPeriod(saison, index, formulaire.saisons || [])}
                          </Text>
                          <Text style={styles.careerClub}>{saison.club}</Text>
                          <Text style={styles.careerCategory}>
                            {saison.categorie} {saison.division}
                          </Text>
                        </View>
                        <View style={styles.careerLogoContainer}>
                          {saison.logo_club && getLogoPath(saison.logo_club) && (
                            <Image
                              src={getLogoPath(saison.logo_club) || ''}
                              style={styles.careerLogo}
                            />
                          )}
                          {saison.logo_division && getLogoPath(saison.logo_division) && (
                            <Image
                              src={getLogoPath(saison.logo_division) || ''}
                              style={styles.careerLogo}
                            />
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.careerBadges}>
                        {saison.saison_actuelle && (
                          <Text style={styles.badgeGreen}>En cours</Text>
                        )}
                        {!saison.saison_actuelle && (
                          <Text style={styles.badgeBlack}>Complète</Text>
                        )}
                        {saison.badge_surclasse && (
                          <Text style={styles.badgeBlack}>Surclassé</Text>
                        )}
                        {saison.badge_capitanat && (
                          <Text style={styles.badgeGold}>Capitaine</Text>
                        )}
                        {saison.badge_champion && (
                          <Text style={styles.badgeGold}>Champion</Text>
                        )}
                        {saison.badge_coupe_remportee && (
                          <Text style={styles.badgeGold}>Coupe</Text>
                        )}
                        {/* Badge catégorie */}
                        {saison.categorie && (
                          <Text style={styles.badgeBlue}>{saison.categorie}</Text>
                        )}
                        {/* Badge division si R1, R2, etc. */}
                        {saison.division && saison.division.includes('Régional') && (
                          <Text style={styles.badgeBlue}>
                            {saison.division.replace('Régional ', 'R')}
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.statsContainer}>
                        {saison.clean_sheets !== null && saison.clean_sheets !== undefined && (
                          <Text style={styles.statBox}>
                            {saison.clean_sheets} clean sheets
                          </Text>
                        )}
                        {saison.buts !== null && saison.buts !== undefined && (
                          <Text style={styles.statBox}>
                            {saison.buts} buts
                          </Text>
                        )}
                        {saison.passes_decisives !== null && saison.passes_decisives !== undefined && (
                          <Text style={styles.statBox}>
                            {saison.passes_decisives} passes décisives
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Section FORMATION */}
            {formulaire.formations && formulaire.formations.length > 0 && (
              <View style={styles.careerSection}>
                <Text style={styles.sectionTitleRight}>FORMATION</Text>
                {formulaire.formations
                  .sort((a, b) => (b.ordre || 0) - (a.ordre || 0))
                  .map((formation, index) => {
                    let periode = formation.annee_ou_periode || '';
                    periode = periode.replace(/(\d{4})-(\d{4})/g, '$1 - $2');
                    periode = periode.replace(/▶|¶|->|→/g, ' - ');
                    periode = periode.replace(/\s*-\s*/g, ' - ');
                    
                    return (
                      <Text key={index} style={styles.formationItem}>
                        • {periode}: {formation.titre_structure}
                        {formation.details && ` - ${formation.details}`}
                      </Text>
                    );
                  })}
              </View>
            )}

            {/* Section INTÉRÊTS */}
            {formulaire.interets && formulaire.interets.length > 0 && (
              <View style={styles.careerSection}>
                <Text style={styles.sectionTitleRight}>INTÉRÊTS</Text>
                {formulaire.interets
                  .sort((a, b) => (b.ordre || 0) - (a.ordre || 0))
                  .map((interet, index) => (
                    <View key={index} style={styles.interetItem}>
                      <Text style={styles.interetText}>
                        • {interet.annee}: {interet.club} (invitation)
                      </Text>
                      {interet.logo_club && getLogoPath(interet.logo_club) && (
                        <Image
                          src={getLogoPath(interet.logo_club) || ''}
                          style={styles.interetLogo}
                        />
                      )}
                    </View>
                  ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PlayerCV;
