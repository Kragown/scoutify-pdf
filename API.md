# Documentation des Routes API - Formulaires Joueur

## Base URL
```
/api/formulaires-joueur
```

## Routes disponibles

### 1. GET /api/formulaires-joueur
Récupère tous les formulaires joueur avec leurs relations.

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Test",
      "prenom": "Joueur",
      "qualites": [...],
      "saisons": [...],
      "formations": [...],
      "interets": [...]
    }
  ],
  "count": 1
}
```

### 2. GET /api/formulaires-joueur/[id]
Récupère un formulaire joueur spécifique par son ID.

**Paramètres:**
- `id` (number): ID du formulaire

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Test",
    "prenom": "Joueur",
    "qualites": [...],
    "saisons": [...],
    "formations": [...],
    "interets": [...]
  }
}
```

**Erreurs:**
- `400`: ID invalide
- `404`: Formulaire non trouvé

### 3. POST /api/formulaires-joueur
Crée un nouveau formulaire joueur.

**Body:**
```json
{
  "nom": "Test",
  "prenom": "Joueur",
  "nationalites": ["France"],
  "date_naissance": "2000-01-15",
  "pied_fort": "Droit",
  "taille_cm": 180,
  "couleur_cv": "#1E5EFF",
  "poste_principal": "Attaquant",
  "poste_secondaire": "Milieu",
  "url_transfermarkt": "https://www.transfermarkt.fr/test",
  "photo_joueur": "/photos/test.jpg",
  "vma": 15.5,
  "envergure": 185,
  "email": "test@example.com",
  "telephone": "+33612345678",
  "email_agent_sportif": "agent@example.com",
  "telephone_agent_sportif": "+33687654321",
  "qualites": ["Vitesse", "Dribble", "Finition"],
  "saisons": [
    {
      "club": "Olympique Lyon",
      "categorie": "U19",
      "division": "Ligue 1",
      "logo_club": "/logos/ol.png",
      "logo_division": "/logos/ligue1.png",
      "badge_capitanat": true,
      "badge_surclasse": false,
      "badge_champion": true,
      "badge_coupe_remportee": false,
      "matchs": 25,
      "buts": 12,
      "passes_decisives": 8,
      "temps_jeu_moyen": 75,
      "saison_actuelle": false,
      "ordre": 0
    }
  ],
  "formations": [
    {
      "annee_ou_periode": "2023-2024",
      "titre_structure": "Académie OL",
      "details": "Formation complète",
      "ordre": 0
    }
  ],
  "interets": [
    {
      "club": "Paris Saint-Germain",
      "annee": "2024",
      "logo_club": "/logos/psg.png",
      "ordre": 0
    }
  ]
}
```

**Réponse:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Formulaire de joueur créé avec succès"
}
```

**Erreurs:**
- `400`: Champs obligatoires manquants ou invalides
- `500`: Erreur serveur

### 4. PUT /api/formulaires-joueur/[id]
Met à jour un formulaire joueur existant.

**Paramètres:**
- `id` (number): ID du formulaire

**Body:** (tous les champs sont optionnels, seuls ceux fournis seront mis à jour)
```json
{
  "nom": "Test Modifié",
  "qualites": ["Technique", "Vision"],
  "saisons": [...],
  "formations": [...],
  "interets": [...]
}
```

**Réponse:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Formulaire mis à jour avec succès"
}
```

**Erreurs:**
- `400`: ID invalide ou aucun champ à mettre à jour
- `404`: Formulaire non trouvé
- `500`: Erreur serveur

### 5. DELETE /api/formulaires-joueur/[id]
Supprime un formulaire joueur et toutes ses relations (CASCADE).

**Paramètres:**
- `id` (number): ID du formulaire

**Réponse:**
```json
{
  "success": true,
  "message": "Formulaire supprimé avec succès"
}
```

**Erreurs:**
- `400`: ID invalide
- `404`: Formulaire non trouvé
- `500`: Erreur serveur

## Relations

Chaque formulaire peut avoir:
- **Qualités** (1 à 6): Liste de qualités sportives (max 24 caractères chacune)
- **Saisons** (1 à plusieurs): Historique des saisons du joueur
- **Formations** (1 à plusieurs): Historique des formations
- **Intérêts** (1 à plusieurs): Clubs d'intérêt du joueur

## Validation

### Champs obligatoires pour POST:
- `nom`, `prenom`, `nationalites`, `date_naissance`
- `pied_fort`, `taille_cm`, `couleur_cv`, `poste_principal`
- `photo_joueur`, `email`, `telephone`
- Au moins 1 qualité
- Au moins 1 saison
- Au moins 1 formation
- Au moins 1 intérêt

### Divisions disponibles:
- Ligue 1, Ligue 2, National, National 2, National 3
- Régional 1, Régional 2, Régional 3
- Départemental 1, Départemental 2, Départemental 3
- Autre

## Tests

Pour exécuter les tests des routes API:
```bash
npm run test:api
```

Les tests vérifient:
- ✅ GET all (vide et avec données)
- ✅ POST (création complète avec relations)
- ✅ GET by id
- ✅ PUT (mise à jour)
- ✅ DELETE (suppression avec CASCADE)
- ✅ Relations (qualités, saisons, formations, intérêts)
