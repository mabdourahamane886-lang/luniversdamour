# L'univers d'amour ❤️

Site romantique statique avec **Amour AI**, une assistante francophone pour les conseils de couple et les messages personnalisés.

## Fonctionnalités

- Citations, catégories, recherche et favoris dans le navigateur
- Messages doux et partage WhatsApp
- Conversation Amour AI avec historique local
- Saisie vocale et réponses accessibles
- Limitation de débit, quota quotidien, modération et fournisseurs IA de secours

## Configuration Vercel

Les clés API restent uniquement côté serveur. Ne les ajoutez jamais dans `index.html`, `localStorage` ou GitHub.

Dans **Vercel → Settings/Paramètres → Environment Variables/Variables d’environnement**, ajoutez au minimum l’un des fournisseurs suivants pour **Production**, **Preview** et **Development** :

```text
AI_PRIMARY_API_KEY=votre_cle_gemini
AI_PRIMARY_MODEL=gemini-2.5-flash
AI_SECONDARY_API_KEY=votre_cle_openai
AI_SECONDARY_MODEL=gpt-4o-mini
```

Le serveur essaie d’abord le fournisseur principal puis le fournisseur secondaire si le premier échoue. Vous pouvez utiliser directement `GEMINI_API_KEY` ou `OPENAI_API_KEY` pour une configuration rétrocompatible, mais les variables `AI_*` sont recommandées.

Variables optionnelles :

```text
AI_TIMEOUT_MS=30000
AI_MAX_OUTPUT_TOKENS=900
APP_URL=https://luniversdamour.vercel.app
ADMIN_TOKEN=un_token_admin
```

Après toute modification des variables, lancez un **redéploiement** Vercel.

## Installation locale

```bash
npm install
npm run dev
```

Le site est ensuite disponible sur `http://localhost:3000`.

## API

- `POST /api/chat` : conversation Amour AI
- `GET /api/health` : état de la configuration des fournisseurs
- `POST /api/generate` : génération de contenus
- `POST /api/analyze-message` : analyse d’un message
- `POST /api/quiz` : quiz relationnel

Les réponses JSON de l’API utilisent la forme :

```json
{
  "success": true,
  "data": {
    "reply": "Réponse d'Amour AI"
  }
}
```

## Sécurité

- Les secrets sont lus avec `process.env` côté serveur.
- Les messages sont validés et limités en longueur.
- Un quota gratuit et une limitation horaire protègent les endpoints.
- Les clés déjà publiées dans une conversation doivent être révoquées depuis leur fournisseur.

## Structure

```text
index.html                    # Site et interface Amour AI
api/chat.js                  # Endpoint conversationnel
api/_lib/http.js             # Validation HTTP, CORS et quotas
src/ai/                      # Fournisseurs, prompts et modération
src/services/                # Quotas et logique métier
js/frontend/                 # Modules frontend complémentaires
```
