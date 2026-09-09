# L'univers d'amour ❤️

Un site romantique avec **Amour AI**, une assistante IA intelligente dédiée aux conseils de couple et messages personnalisés.

## Fonctionnalités

- 📖 Citations romantiques quotidiennes
- 💬 Conseils pour les couples
- 💌 Messages d'amour prêts à copier
- 🤖 **Amour AI** - Assistant romantico-romantique avec Gemini
- 🎙️ Saisie vocale
- 💾 Historique conversationnel sauvegardé

## Installation locale

```bash
npm install
npm run dev
```

Accédez à `http://localhost:3000`

## Configuration Vercel

Pour que **Amour AI** fonctionne, vous devez configurer la clé Gemini :

### 1. Créer une clé API Gemini

1. Allez sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Cliquez sur **"Get API Key"** ou **"Create API Key"**
3. Choisissez le projet ou créez-en un nouveau
4. Copiez la clé API

### 2. Ajouter sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **luniversdamour**
3. Allez dans **Settings → Environment Variables**
4. Ajoutez une nouvelle variable :
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `votre_clé_api_gemini_ici`
   - **Environments**: Cochez `Production`
5. Cliquez **Save**

### 3. Redéployer

Déclenchez un redéploiement manuellement sur Vercel ou poussez un nouveau commit.

## Structure du projet

```
luniversdamour/
├── index.html          # Page principale avec Amour AI
├── api/
│   └── chat.js         # API serverless Gemini
├── package.json        # Configuration Node.js
└── .env.example        # Modèle de configuration
```

## Dépannage

**Amour AI répond "Erreur 502"** ?
- Vérifiez que `GEMINI_API_KEY` est configurée dans **Vercel → Settings → Environment Variables**
- La clé doit être pour le projet `Production`
- Attendez 1-2 minutes après le redéploiement que Vercel relance les fonctions

**Le chat ne se sauvegarde pas** ?
- Votre navigateur a peut-être les cookies/localStorage bloqués
- Vérifiez en mode navigation privée

## API

### POST `/api/chat`

Envoie un message et reçoit la réponse d'Amour AI.

**Requête** :
```json
{
  "message": "Ma copine ne me parle plus",
  "conversation": [
    { "role": "user", "content": "..." },
    { "role": "model", "content": "..." }
  ]
}
```

**Réponse** (200 OK) :
```json
{
  "reply": "Je comprends que c'est difficile...",
  "text": "Je comprends que c'est difficile..."
}
```

## Modèles supportés

- `gemini-2.5-flash` - Rapide et léger
- `gemini-2.5-pro` (optionnel pour réponses plus longues)

## Licence

MIT
