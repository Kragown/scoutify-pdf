# Exemples JSON pour tester l'API

## Fichiers disponibles

### 1. `post-formulaire-example.json`
Exemple complet avec tous les champs remplis :
- Tous les champs obligatoires
- Tous les champs optionnels
- Plusieurs saisons
- Plusieurs formations
- Plusieurs intérêts
- Exemple réaliste (joueur professionnel)

### 2. `post-formulaire-minimal.json`
Exemple minimal avec uniquement les champs obligatoires :
- Champs obligatoires uniquement
- 1 saison minimum
- 1 formation minimum
- 1 intérêt minimum
- Parfait pour tester rapidement

### 3. `post-formulaire-cr7.json`
Formulaire complet pour Cristiano Ronaldo :
- Carrière complète (Al-Nassr, Manchester United, Real Madrid)
- 6 qualités caractéristiques
- Formations et sélections
- Données réalistes

### 4. `post-formulaire-messi.json`
Formulaire complet pour Lionel Messi :
- Carrière complète (Inter Miami, PSG, FC Barcelone)
- 6 qualités caractéristiques
- Formations (Newell's, La Masia)
- Données réalistes

### 5. `post-formulaire-zlatan.json`
Formulaire complet pour Zlatan Ibrahimović :
- Carrière complète (AC Milan, LA Galaxy, Manchester United, PSG)
- 6 qualités caractéristiques
- Formations (Malmö FF)
- Données réalistes

#### GET all - Récupérer tous les formulaires

```bash
curl -X GET http://localhost:3000/api/formulaires-joueur
```

#### GET by ID - Récupérer un formulaire par son ID

```bash
curl -X GET http://localhost:3000/api/formulaires-joueur/{id}
```

#### POST - Créer un nouveau formulaire

```bash
# Exemple complet (Mbappé)
curl -X POST http://localhost:3000/api/formulaires-joueur \
  -H "Content-Type: application/json" \
  -d @examples/post-formulaire-example.json

# Exemple minimal
curl -X POST http://localhost:3000/api/formulaires-joueur \
  -H "Content-Type: application/json" \
  -d @examples/post-formulaire-minimal.json

# Cristiano Ronaldo
curl -X POST http://localhost:3000/api/formulaires-joueur \
  -H "Content-Type: application/json" \
  -d @examples/post-formulaire-cr7.json

# Lionel Messi
curl -X POST http://localhost:3000/api/formulaires-joueur \
  -H "Content-Type: application/json" \
  -d @examples/post-formulaire-messi.json

# Zlatan Ibrahimović
curl -X POST http://localhost:3000/api/formulaires-joueur \
  -H "Content-Type: application/json" \
  -d @examples/post-formulaire-zlatan.json
```

#### PUT by ID - Mettre à jour un formulaire

```bash
curl -X PUT http://localhost:3000/api/formulaires-joueur/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Giroud",
    "prenom": "Olivier",
    "qualites": ["Technique", "Vision", "Leadership"]
  }'
```

#### DELETE by ID - Supprimer un formulaire

```bash
curl -X DELETE http://localhost:3000/api/formulaires-joueur/{id}
```
