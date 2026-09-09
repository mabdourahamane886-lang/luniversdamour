# L'univers d'amour ❤️

Un site romantique avec **Amour AI**, une assistante IA dédiée aux conseils de couple et messages personnalisés.

## Fonctionnalités

- 📖 Citations romantiques quotidiennes
- 💬 Conseils pour les couples
- 💌 Messages d'amour prêts à copier
- 🤖 **Amour AI** — Gemini (`gemini-2.5-flash`) via Vercel `/api/chat`
- 🎙️ Saisie vocale
- 💾 Historique conversationnel sauvegardé

## Backend : Vercel + Gemini

Sur [luniversdamour.vercel.app](https://luniversdamour.vercel.app), Amour AI appelle d’abord `/api/chat`. La clé reste dans les variables d’environnement Vercel.

1. Créez une clé sur [Google AI Studio](https://aistudio.google.com/apikey)
2. Dans [Vercel → Settings → Environment Variables](https://vercel.com/dashboard) :
   - **Name** : `GEMINI_API_KEY`
   - **Value** : votre clé Gemini
   - **Environments** : Production, Preview, Development
3. Redéployez le projet

Le navigateur n’envoie jamais la clé. Test : `https://luniversdamour.vercel.app/api/health` doit indiquer `gemini_api_key: Configurée`.

## Backend de secours : Supabase

La clé Gemini peut aussi rester dans **Supabase Secrets**. Le navigateur n’appelle alors que la fonction `chat`.

### 1. Créer le projet

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un projet (nom : `luniversdamour`)
3. Dans **Project Settings → API**, copiez :
   - **Project URL**
   - **anon public** (jamais la `service_role`)

### 2. Coller l’URL et la clé anon dans le site

Ouvrez `js/supabase-config.js` :

```js
window.LUNIVERS_SUPABASE = {
  url: "https://VOTRE_PROJET.supabase.co",
  anonKey: "eyJ..."
};
```

### 3. Enregistrer la clé Gemini dans Supabase

1. Créez une clé sur [Google AI Studio](https://aistudio.google.com/apikey)
2. Dans un terminal, à la racine du dépôt :

```bash
npx supabase login
npx supabase link --project-ref VOTRE_PROJECT_REF
npx supabase secrets set GEMINI_API_KEY=votre_cle_gemini
npx supabase functions deploy chat
```

`VOTRE_PROJECT_REF` est le préfixe de l’URL (`https://abcdef.supabase.co` → `abcdef`).

### 4. Publier le site

Poussez les changements vers GitHub. Le site Vercel :

https://luniversdamour.vercel.app/

GitHub Pages :

https://mabdourahamane886-lang.github.io/luniversdamour/

## Installation locale

```bash
npm install
npm run dev
```

Accédez à `http://localhost:3000`

## Structure du projet

```
luniversdamour/
├── index.html
├── js/supabase-config.js          # URL + clé anon (publiques)
├── supabase/functions/chat/       # Gemini côté serveur (secours)
├── api/chat.js                    # Gemini sur Vercel (`GEMINI_API_KEY`)
└── .env.example
```

## Dépannage

**Amour AI ne répond pas** ?
- Vérifiez `GEMINI_API_KEY` dans Vercel, puis redéployez
- Testez `/api/health` : `gemini_api_key` doit indiquer « Configurée »
- Si Vercel est en pause (402), reprenez le projet dans le dashboard
- Secours : `js/supabase-config.js` + fonction `chat` déployée

**Ne jamais coller** la clé Gemini ou la `service_role` dans le chat ou dans GitHub.

## Licence

MIT
