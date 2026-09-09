# L'univers d'amour ❤️

Un site romantique avec **Amour AI**, une assistante IA intelligente dédiée aux conseils de couple et messages personnalisés.

## Fonctionnalités

- 📖 Citations romantiques quotidiennes
- 💬 Conseils pour les couples
- 💌 Messages d'amour prêts à copier
- 🤖 **Amour AI** - Assistant romantico-romantique avec OpenAI
- 🎙️ Saisie vocale
- 💾 Historique conversationnel sauvegardé

## Installation locale

```bash
npm install
npm run dev
```

Accédez à `http://localhost:3000`

## Configuration Vercel

Pour que **Amour AI** fonctionne, vous devez configurer la clé OpenAI :

### 1. Créer une clé API OpenAI

1. Allez sur [OpenAI Platform](https://platform.openai.com/api-keys)
2. Cliquez sur **Create new secret key**
3. Donnez-lui un nom (ex: "Amour AI")
4. Copiez la clé API

### 2. Ajouter sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **luniversdamour**
3. Allez dans **Settings → Environment Variables** (ou **Paramètres → Variables d'environnement**)
4. Ajoutez une nouvelle variable :
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-...` (votre clé API OpenAI)
   - **Environments**: Cochez `Production`, `Preview` et `Development`
5. Cliquez **Save** (ou **Enregistrer**)

### 3. Redéployer

Déclenchez un redéploiement manuellement sur Vercel ou poussez un nouveau commit.

## Structure du projet

```
luniversdamour/
├── index.html          # Page principale avec Amour AI
├── api/
│   └── chat.js         # API serverless OpenAI
├── package.json        # Configuration Node.js
└── .env.example        # Modèle de configuration
```

## Dépannage

**Amour AI répond "Erreur 502"** ?
- Vérifiez que `OPENAI_API_KEY` est configurée dans **Vercel → Settings → Environment Variables**
- La clé doit être pour le projet `Production`
- Attendez 1-2 minutes après le redéploiement que Vercel relance les fonctions
- Assurez-vous que votre compte OpenAI dispose de crédits

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

## Modèles supportés

- `gpt-3.5-turbo` - Rapide et économique
- `gpt-4` - Plus puissant (coûts plus élevés)

## Licence

MIT

