import { AIProvider } from "../AIProvider.js";

const TOPICS = [
  {
    test: /(aime|amour|sentiment|m'aime|m aime|m\'aime)/i,
    answer: (q) => `Je comprends que cette question te préoccupe. À partir d'un seul comportement, on ne peut pas savoir avec certitude ce qu'une personne ressent. Regarde plutôt la constance de ses actes : communication, respect, disponibilité, cohérence entre ses paroles et ses actions.\n\nPour avancer, demande clairement ce que vous voulez tous les deux. Si tu me décris la situation précise, je peux l'analyser avec toi.\n\nQuestion reçue : « ${q} »`
  },
  {
    test: /(rupture|quitter|separation|séparation|ex|ancien.ne? partenaire)/i,
    answer: () => `Une rupture ne se résout pas uniquement en essayant de convaincre l'autre. Commence par distinguer trois choses : ce que tu ressens, ce que l'autre a demandé et ce qui est réellement possible. Respecte une décision clairement exprimée, évite les messages répétitifs et concentre-toi sur une communication calme et honnête.\n\nSi tu veux, donne-moi le contexte et je peux t'aider à préparer une réponse adaptée.`
  },
  {
    test: /(jalousie|jaloux|jalouse|infidélité|infidelite|trompe|tromper)/i,
    answer: () => `La jalousie peut signaler une peur, un manque de confiance ou un problème réel, mais elle ne constitue pas à elle seule une preuve d'infidélité. Cherche des faits observables, puis parle du comportement qui te dérange sans accusation immédiate.\n\nFormulation utile : « Ce que j'ai observé me met mal à l'aise. J'aimerais comprendre ce qui se passe et savoir comment nous pouvons rétablir la confiance. »`
  },
  {
    test: /(confiance|confiance en soi|respect|communication|dispute|conflit)/i,
    answer: () => `Dans une relation, une communication saine repose sur trois éléments : dire clairement ce que l'on ressent, écouter sans interrompre et convenir d'une action concrète. Évite les généralisations comme « toujours » ou « jamais » et parle d'un comportement précis.\n\nExemple : « Quand cela arrive, je me sens... J'aimerais que nous... »`
  },
  {
    test: /(message|écrire|ecrire|sms|whatsapp|texte à|texte a)/i,
    answer: () => `Je peux t'aider à rédiger un message naturel. Pour qu'il soit vraiment adapté, indique simplement à qui tu écris, ce qui s'est passé et le ton souhaité : doux, romantique, direct, réconciliation, excuse ou séparation.\n\nJe peux aussi partir de quelques mots seulement et construire le message complet.`
  },
  {
    test: /(trist|déprim|deprime|pleur|souffre|solitude|seul|seule)/i,
    answer: () => `Ce que tu ressens mérite d'être pris au sérieux. Essaie de ne pas rester isolé : parle à une personne de confiance, repose-toi et donne-toi du temps avant de prendre une décision importante. Si ta sécurité est en jeu ou si tu risques de te faire du mal, cherche immédiatement une aide humaine locale ou les services d'urgence.\n\nJe peux rester avec toi dans la conversation et t'aider à mettre les choses en ordre.`
  },
  {
    test: /(salut|bonjour|bonsoir|hello|coucou|ça va|ca va)/i,
    answer: () => `Bonjour 💜 Je suis Amour AI, l'assistante de L'univers d'amour. Je peux t'aider sur les relations, les émotions, la communication, les messages, mais aussi sur de nombreux sujets généraux. Que souhaites-tu faire aujourd'hui ?`
  }
];

export class AmourCoreProvider extends AIProvider {
  get name() {
    return "amour-core";
  }

  async generateText({ messages, knowledge = [] }) {
    const last = [...messages].reverse().find((item) => item.role === "user");
    const question = String(last?.content || last?.text || "").trim();
    if (!question) throw new Error("EMPTY_USER_MESSAGE");

    const match = TOPICS.find((topic) => topic.test.test(question));
    if (match) {
      return {
        text: match.answer(question),
        provider: this.name,
        model: "amour-core-v1"
      };
    }

    const first = knowledge.find((item) => item?.title && item?.content);
    if (first) {
      return {
        text: `Selon la base de connaissances de L'univers d'amour :\n\n${first.content}\n\nJe peux aussi approfondir ce sujet si tu me donnes davantage de contexte.`,
        provider: this.name,
        model: "amour-core-rag-v1"
      };
    }

    const error = new Error("LOCAL_NO_MATCH");
    error.recoverable = true;
    throw error;
  }

  fallbackText() {
    return `Je suis Amour AI Core, le moteur local de L'univers d'amour. Je fonctionne sans Gemini pour les réponses intégrées à notre cœur de connaissances. Pour une question qui dépasse encore ce cœur local, le système peut utiliser un modèle open source compatible optionnel.`;
  }
}
