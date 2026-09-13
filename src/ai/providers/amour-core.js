import { AIProvider } from "../AIProvider.js";

const TOPICS = [
  {
    test: /(est-ce qu'il m'aime|est-ce qu'elle m'aime|m'aime|m aime|sentiments)/i,
    answers: [
      (q) => `Tu ne peux pas savoir ce que quelqu’un ressent à partir d’un seul signe. Regarde plutôt l’ensemble : présence, respect, écoute, constance et volonté de faire une place à la relation.\n\nTa question porte sur une situation précise : « ${q} ». Si tu me donnes les comportements que tu as observés, je peux les analyser sans tirer de conclusion trop vite.`,
      () => `Il peut y avoir des signes d’intérêt, mais aucun comportement isolé ne permet de conclure avec certitude. Observe surtout la régularité des actes, la qualité de la communication et le respect de tes limites.\n\nAu lieu d’essayer de deviner, une question simple comme « Comment vois-tu notre relation aujourd’hui ? » peut apporter une réponse plus claire.`,
      () => `Pour comprendre les sentiments d’une personne, cherche la cohérence entre ses paroles et ses actes. Est-elle disponible, attentive, respectueuse et prête à construire quelque chose avec toi ?\n\nDécris-moi ce qu’elle fait concrètement et je pourrai t’aider à distinguer les signes d’intérêt, les ambiguïtés et les fausses interprétations.`
    ]
  },
  {
    test: /(rupture|quitter|séparation|separation|ex\b|ancien partenaire)/i,
    answers: [
      () => `Après une rupture, évite de décider sous le choc. Respecte la décision exprimée, donne de l’espace si nécessaire et regarde ce qui a réellement conduit à la séparation.\n\nUne éventuelle reprise ne peut être saine que si les causes du problème sont comprises et si des changements concrets sont possibles.`,
      () => `Une séparation ne signifie pas automatiquement qu’il faut couper tout contact ni qu’il faut absolument revenir ensemble. Commence par identifier ce que tu ressens, ce que l’autre a demandé et ce qui est réaliste aujourd’hui.`,
      () => `Le plus utile après une rupture est de séparer le manque de la compatibilité réelle. Qu’est-ce qui fonctionnait ? Qu’est-ce qui faisait souffrir ? Qu’est-ce qui devrait changer pour recommencer autrement ?`
    ]
  },
  {
    test: /(jalousie|jaloux|jalouse|infidélité|infidelite|trompe|tromper)/i,
    answers: [
      () => `La jalousie est une émotion, pas une preuve. Avant d’accuser, distingue ce que tu sais réellement de ce que tu imagines. Ensuite, parle du comportement qui te dérange et de son effet sur toi.`,
      () => `Demande-toi ce qui alimente ta jalousie : un fait préoccupant, une expérience passée ou une peur personnelle. Les trois peuvent se ressembler, mais la bonne réponse n’est pas la même.`,
      () => `Avant de conclure à une infidélité, cherche des éléments vérifiables. Une discussion calme peut révéler un malentendu, un manque de transparence ou un vrai problème de confiance.`
    ]
  },
  {
    test: /(confiance|respect|communication|dispute|conflit|se comprendre|écouter)/i,
    answers: [
      () => `Dans un conflit, parle d’un comportement précis, explique ton ressenti et formule une demande concrète. Évite les « toujours » et « jamais », qui transforment facilement une discussion en accusation.`,
      () => `Le but d’une discussion de couple n’est pas de gagner. C’est de comprendre le problème, reconnaître ce qui est vrai des deux côtés et décider de la prochaine action.`,
      () => `La confiance se construit dans le temps : paroles claires, actes cohérents, respect des limites et capacité à reconnaître ses erreurs. Une promesse isolée ne suffit pas.`
    ]
  },
  {
    test: /(limite|limites|contrôle|controle|possessif|possessive|vie privée)/i,
    answers: [
      () => `Une limite saine indique ce que tu acceptes et ce que tu feras pour te protéger. Elle ne sert pas à contrôler l’autre. Chacun doit pouvoir garder son intimité et ses relations sociales tout en respectant les accords du couple.`,
      () => `Contrôler le téléphone, les amis ou les déplacements d’une personne n’est pas une preuve d’amour. Une relation saine repose sur des accords explicites, le consentement et le respect de l’autonomie de chacun.`,
      () => `Tu peux poser une limite sans menace : « Ce comportement ne me convient pas. J’ai besoin que nous trouvions une autre manière de faire. » Cela protège la relation sans chercher à diriger l’autre.`
    ]
  },
  {
    test: /(distance|loin|relation à distance|relation a distance)/i,
    answers: [
      () => `Une relation à distance fonctionne mieux quand les attentes sont claires : fréquence des échanges, exclusivité, visites, horaires et projet commun. La qualité des échanges compte plus que la quantité de messages.`,
      () => `À distance, chacun doit garder sa vie personnelle tout en créant des rendez-vous réguliers pour se retrouver. Les incompréhensions diminuent quand les attentes sont dites explicitement.`,
      () => `Le point essentiel d’une relation à distance est de savoir où vous allez. Sans projet ni attentes partagées, l’incertitude augmente. Avec un accord clair, la distance devient plus gérable.`
    ]
  },
  {
    test: /(manipulation|manipuler|gaslight|culpabilise|chantage affectif|menace affective)/i,
    answers: [
      () => `Une manipulation peut prendre la forme d’une culpabilisation répétée, d’un contrôle, d’un isolement ou d’un renversement systématique de la faute. Un seul épisode ne suffit pas : regarde les comportements répétés et leur effet sur toi.`,
      () => `Si quelqu’un te menace de partir, de se faire du mal ou de te punir chaque fois que tu poses une limite, ce n’est pas une communication saine. Cherche du soutien extérieur et protège-toi.`,
      () => `Le signe important n’est pas seulement ce qui est dit, mais ce qui se répète : pression, peur, culpabilité, contrôle ou impossibilité de dire non librement.`
    ]
  },
  {
    test: /(rendez-vous|date|premier rendez|première rencontre|premiere rencontre)/i,
    answers: [
      () => `Pour un premier rendez-vous, choisis un lieu public et confortable, une activité simple et un budget raisonnable. L’objectif est de parler et de voir si vous êtes à l’aise ensemble.`,
      () => `Un bon premier rendez-vous n’a pas besoin d’être coûteux. Café, promenade dans un lieu fréquenté ou activité courte permettent de discuter sans pression.`,
      () => `Pense surtout au confort et au consentement : lieu sûr, durée raisonnable et possibilité pour chacun de partir facilement s’il ne se sent pas à l’aise.`
    ]
  },
  {
    test: /(désolé|desole|pardon|excuse|réconciliation|reconciliation)/i,
    answers: [
      () => `Une vraie excuse nomme ce qui s’est passé, reconnaît l’impact et annonce un changement concret. Évite « désolé si tu l’as mal pris ».`,
      () => `Tu peux commencer par : « J’ai fait… Je comprends que cela t’ait blessé. Je le regrette et je vais faire… différemment. » Ensuite, laisse à l’autre le temps de répondre.`,
      () => `Demander pardon ne signifie pas exiger une réconciliation immédiate. L’autre peut avoir besoin de temps avant de retrouver confiance.`
    ]
  },
  {
    test: /(message|écrire|ecrire|sms|whatsapp|texte)/i,
    answers: [
      () => `Je peux te rédiger le message directement. Donne-moi simplement l’objectif : séduire, rassurer, s’excuser, remercier, se réconcilier ou dire au revoir.`,
      () => `Un message efficace doit sonner comme toi. Donne-moi quelques mots sur la situation et je peux écrire une version naturelle, courte ou romantique.`,
      () => `Tu n’as pas besoin de connaître les bons mots à l’avance. Explique-moi ce que tu veux faire comprendre et je le transforme en message prêt à envoyer.`
    ]
  },
  {
    test: /(trist|déprim|déprime|pleur|souffre|solitude|seul|seule)/i,
    answers: [
      () => `Quand une situation affective fait mal, commence par retrouver un peu de stabilité avant de décider. Parle à une personne de confiance et évite les décisions impulsives.`,
      () => `Tu n’as pas besoin de tout résoudre aujourd’hui. Mets des mots sur ce qui te fait souffrir, identifie ce qui dépend de toi et avance une étape à la fois.`,
      () => `La douleur émotionnelle peut brouiller le jugement. Prends du recul, garde un soutien humain autour de toi et donne-toi du temps.`
    ]
  },
  {
    test: /(salut|bonjour|bonsoir|hello|coucou|ça va|ca va)/i,
    answers: [
      () => `Bonjour 💜 Je suis Amour AI. Pose-moi directement ta question et je vais essayer de t’aider concrètement.`,
      () => `Bienvenue dans L’univers d’amour ❤️ Dis-moi ce qui se passe, ce que tu veux écrire ou ce que tu veux comprendre.`,
      () => `Coucou ✨ Je suis là. Explique-moi simplement ta situation et on va chercher une réponse ensemble.`
    ]
  }
];

function stableIndex(text, length) {
  let hash = 0;
  for (const char of String(text)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % Math.max(1, length);
}

function buildKnowledgeAnswer(knowledge, question) {
  const items = knowledge
    .filter((item) => item?.title && item?.content)
    .slice(0, 3);
  if (!items.length) return "";

  const ordered = [...items].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
  const first = ordered[stableIndex(question, ordered.length)];
  return `${first.content}\n\nApplication à ta situation : explique-moi ce qui s’est passé concrètement et je peux t’aider à adapter ce principe.`;
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
      const answer = match.answers[stableIndex(question, match.answers.length)];
      return {
        text: answer(question),
        provider: this.name,
        model: "amour-core-v3"
      };
    }

    const knowledgeAnswer = buildKnowledgeAnswer(knowledge, question);
    if (knowledgeAnswer) {
      return {
        text: knowledgeAnswer,
        provider: this.name,
        model: "amour-core-rag-v3"
      };
    }

    const error = new Error("LOCAL_NO_MATCH");
    error.recoverable = true;
    throw error;
  }

  fallbackText() {
    return `Je n’ai pas encore assez de connaissances locales pour répondre correctement à cette question. Un modèle génératif open source peut prendre le relais lorsqu’il est configuré.`;
  }
}
