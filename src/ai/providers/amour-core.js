import { AIProvider } from "../AIProvider.js";

const TOPICS = [
  {
    test: /(aime|amour|sentiment|m'aime|m aime|m\'aime)/i,
    answer: (q) => `Je comprends que cette question te préoccupe. À partir d'un seul comportement, on ne peut pas savoir avec certitude ce qu'une personne ressent. Regarde plutôt la constance de ses actes : communication, respect, disponibilité, cohérence entre ses paroles et ses actions.\n\nPour avancer, demande clairement ce que vous voulez tous les deux. Si tu me décris la situation précise, je peux l'analyser avec toi.\n\nQuestion reçue : « ${q} »`
  },
  {
    test: /(rupture|quitter|separation|séparation|ex|ancien.ne? partenaire)/i,
    answer: () => `Après une rupture, donne-toi du temps avant d'agir sous le coup de l'émotion. Respecte une décision clairement exprimée, évite les messages répétitifs et reconstruis progressivement ta routine, tes liens sociaux et tes projets. Revenir vers un ex n'est pas une obligation.\n\nSi tu me racontes ce qui s'est passé, je peux t'aider à distinguer ce que tu ressens, ce que l'autre a demandé et ce que tu peux réellement faire maintenant.`
  },
  {
    test: /(jalousie|jaloux|jalouse|infidélité|infidelite|trompe|tromper)/i,
    answer: () => `La jalousie peut signaler une peur, un manque de confiance ou un problème réel, mais elle ne constitue pas à elle seule une preuve d'infidélité. Cherche des faits observables, puis parle du comportement qui te dérange sans accusation immédiate.\n\nFormulation utile : « Ce que j'ai observé me met mal à l'aise. J'aimerais comprendre ce qui se passe et savoir comment nous pouvons rétablir la confiance. »`
  },
  {
    test: /(confiance|confiance en soi|respect|communication|dispute|conflit)/i,
    answer: () => `Dans une relation, une communication saine repose sur trois éléments : dire clairement ce que l'on ressent, écouter sans interrompre et convenir d'une action concrète. Évite les généralisations comme « toujours » ou « jamais » et parle d'un comportement précis.\n\nLa confiance se construit surtout par la cohérence dans le temps : tenir ses engagements, reconnaître ses erreurs et respecter les limites convenues.`
  },
  {
    test: /(limite|limites|trop contrôler|controle|contrôle|possessif|possessive|vie privée)/i,
    answer: () => `Une limite saine décrit ce que tu acceptes, ce que tu refuses et ce que tu feras pour te protéger. Elle ne sert pas à contrôler l'autre. Dans un couple, chacun doit pouvoir conserver sa vie personnelle, ses proches et ses choix tout en respectant les accords communs.\n\nTu peux dire : « Je veux que nous puissions parler de ce sujet sans contrôler nos téléphones ni nous menacer. »`
  },
  {
    test: /(distance|loin|relation à distance|relation a distance)/i,
    answer: () => `Une relation à distance fonctionne mieux quand les attentes sont explicites : fréquence des échanges, disponibilité, exclusivité, visites et projets futurs. La qualité de la communication compte davantage que l'envoi permanent de messages. Garder une vie personnelle équilibrée aide aussi la relation.`
  },
  {
    test: /(manipulation|manipuler|gaslight|culpabilise|chantage affectif|menace affective)/i,
    answer: () => `Une manipulation peut se manifester par une culpabilisation répétée, des menaces affectives, le contrôle des contacts, l'isolement ou le renversement systématique de la faute. Un signe isolé ne suffit pas à conclure : observe les comportements répétés et leur impact sur toi.\n\nSi tu te sens en danger ou fortement contrôlé, cherche le soutien d'une personne de confiance et protège ta sécurité.`
  },
  {
    test: /(rendez-vous|date|premier rendez|première rencontre|premiere rencontre)/i,
    answer: () => `Pour un premier rendez-vous, privilégie un lieu public et confortable, un budget réaliste et une activité qui permet de parler. Respecte les limites de chacun et ne considère jamais l'attention ou l'argent dépensé comme une dette affective. L'objectif est simplement de mieux se connaître.`
  },
  {
    test: /(désolé|desole|pardon|excuse|réconciliation|reconciliation)/i,
    answer: () => `Une bonne excuse reconnaît précisément ce qui s'est passé et son impact. Évite « désolé si tu l'as mal pris ». Préfère : « J'ai fait X, je comprends que cela t'ait blessé, je le regrette et je vais faire Y différemment. » Ensuite, laisse à l'autre le temps de répondre sans exiger un pardon immédiat.`
  },
  {
    test: /(trist|déprim|deprime|pleur|souffre|solitude|seul|seule)/i,
    answer: () => `Ce que tu ressens mérite d'être pris au sérieux. Essaie de ne pas rester isolé : parle à une personne de confiance, repose-toi et donne-toi du temps avant de prendre une décision importante. Si ta sécurité est en jeu ou si tu risques de te faire du mal, cherche immédiatement une aide humaine locale ou les services d'urgence.\n\nJe peux aussi t'aider à mettre la situation en ordre, étape par étape.`
  },
  {
    test: /(message|écrire|ecrire|sms|whatsapp|texte à|texte a)/i,
    answer: () => `Je peux t'aider à rédiger un message naturel. Pour qu'il soit vraiment adapté, indique simplement la personne à qui tu écris, ce qui s'est passé et le ton souhaité : doux, romantique, direct, réconciliation, excuse ou séparation.\n\nPour un message romantique, une petite attention personnelle vaut souvent mieux qu'une longue déclaration générique.`
  },
  {
    test: /(salut|bonjour|bonsoir|hello|coucou|ça va|ca va)/i,
    answer: () => `Bonjour 💜 Je suis Amour AI, l'assistante de L'univers d'amour. Je peux t'aider sur les relations, les émotions, la communication, les messages, mais aussi réfléchir avec toi sur une situation générale. Que souhaites-tu faire aujourd'hui ?`
  }
];

function buildKnowledgeAnswer(question, knowledge) {
  const items = knowledge
    .filter((item) => item?.title && item?.content)
    .slice(0, 3);
  if (!items.length) return "";

  const parts = items.map((item) => `• ${item.title} : ${String(item.content).trim()}`);
  return `Je m'appuie sur les connaissances disponibles de L'univers d'amour pour te répondre. Voici les éléments les plus pertinents :\n\n${parts.join("\n\n")}\n\nSi tu me donnes davantage de contexte, je peux t'aider à appliquer ces principes à ta situation.`;
}

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
        model: "amour-core-v2"
      };
    }

    const knowledgeAnswer = buildKnowledgeAnswer(question, knowledge);
    if (knowledgeAnswer) {
      return {
        text: knowledgeAnswer,
        provider: this.name,
        model: "amour-core-rag-v2"
      };
    }

    const error = new Error("LOCAL_NO_MATCH");
    error.recoverable = true;
    throw error;
  }

  fallbackText() {
    return `Je suis Amour AI Core, le moteur local de L'univers d'amour. Je peux fonctionner sans Gemini avec notre base de connaissances et notre moteur conversationnel. Pour les questions qui dépassent encore cette base, un modèle génératif open source compatible peut prendre le relais.`;
  }
}
