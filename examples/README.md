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
# Exemple complet
curl -X POST http://localhost:3000/api/formulaires-joueur \
  -H "Content-Type: application/json" \
  -d @examples/post-formulaire-example.json

# Exemple minimal
curl -X POST http://localhost:3000/api/formulaires-joueur \
  -H "Content-Type: application/json" \
  -d @examples/post-formulaire-minimal.json
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
