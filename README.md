# L'univers d'amour ❤️

Un site romantique avec **Amour AI**, une assistante IA dédiée aux conseils de couple et messages personnalisés.

## Fonctionnalités

- 📖 Citations romantiques quotidiennes
- 💬 Conseils pour les couples
- 💌 Messages d'amour prêts à copier
- 🤖 **Amour AI** — assistant romantique avec Gemini
- 🎙️ Saisie vocale
- 💾 Historique conversationnel sauvegardé

## Installation locale

```bash
npm install
npm run dev
```

Accédez à `http://localhost:3000`

## Configuration Vercel

Pour que **Amour AI** fonctionne, configurez la clé Gemini :

### 1. Créer une clé API Gemini

1. Allez sur [Google AI Studio](https://aistudio.google.com/apikey)
2. Cliquez sur **Create API key**
3. Copiez la clé

### 2. Ajouter sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **luniversdamour**
3. Allez dans **Settings → Environment Variables**
4. Ajoutez une nouvelle variable :
   - **Name**: `GEMINI_API_KEY`
   - **Value**: votre clé Gemini
   - **Environments**: Production, Preview et Development
5. Enregistrez, puis redéployez le projet

### 3. Redéployer

Déclenchez un redéploiement sur Vercel (le déploiement actuel peut être en pause) ou poussez un nouveau commit.

## Structure du projet

```
luniversdamour/
├── index.html          # Page principale avec Amour AI
├── api/
│   ├── chat.js         # API serverless Gemini
│   └── health.js       # Diagnostic de la clé
├── package.json
└── .env.example
```

## Dépannage

**Amour AI ne répond pas** ?
- Vérifiez que `GEMINI_API_KEY` est configurée dans **Vercel → Settings → Environment Variables**
- La clé doit être activée pour Production
- Si le site affiche « This deployment is temporarily paused », reprenez le déploiement dans Vercel
- Testez `/api/health` : `gemini_api_key` doit indiquer « Configurée »

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
    { "role": "assistant", "content": "..." }
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

## Modèle

- `gemini-2.5-flash` — rapide, adapté au chat du site

## Licence

MIT
