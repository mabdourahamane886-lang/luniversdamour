export const QUIZZES = [
  {
    slug: "compatibilite",
    title: "Compatibilité",
    category: "couple",
    questions: [
      { id: "c1", text: "Vous riez souvent ensemble au quotidien ?", options: ["Rarement", "Parfois", "Souvent", "Presque toujours"] },
      { id: "c2", text: "Vos projets d’avenir se rejoignent-ils ?", options: ["Pas du tout", "Un peu", "Assez", "Beaucoup"] },
      { id: "c3", text: "Vous vous sentez respecté(e) dans les désaccords ?", options: ["Non", "Parfois", "Oui", "Toujours"] },
      { id: "c4", text: "Les silences entre vous sont-ils plutôt apaisants ?", options: ["Non", "Mitigés", "Souvent", "Oui"] }
    ]
  },
  {
    slug: "confiance",
    title: "Confiance",
    category: "relation",
    questions: [
      { id: "t1", text: "Vous pouvez dire une vérité inconfortable sans peur du mépris ?", options: ["Non", "Difficilement", "Oui", "Toujours"] },
      { id: "t2", text: "Les engagements pris sont tenus ?", options: ["Rarement", "Parfois", "Souvent", "Presque toujours"] },
      { id: "t3", text: "Vous n’avez pas besoin de vérifier son téléphone pour vous rassurer ?", options: ["Si, souvent", "Parfois", "Rarement", "Jamais"] },
      { id: "t4", text: "Vous croyez ce qu’il/elle dit de ses journées ?", options: ["Non", "Mitigé", "Oui", "Totalement"] }
    ]
  },
  {
    slug: "communication",
    title: "Communication",
    category: "relation",
    questions: [
      { id: "m1", text: "Vous écoutez jusqu’au bout avant de répondre ?", options: ["Rarement", "Parfois", "Souvent", "Presque toujours"] },
      { id: "m2", text: "Vous parlez de vos besoins sans accuser ?", options: ["Non", "Difficilement", "Oui", "Naturellement"] },
      { id: "m3", text: "Les conflits se referment avec une clarification ?", options: ["Non", "Parfois", "Souvent", "Oui"] },
      { id: "m4", text: "Vous savez dire non sans casser le lien ?", options: ["Non", "Un peu", "Oui", "Très bien"] }
    ]
  },
  {
    slug: "connaissance",
    title: "Connaissance du partenaire",
    category: "couple",
    questions: [
      { id: "k1", text: "Vous connaissez sa façon de se ressourcer après une journée difficile ?", options: ["Non", "Un peu", "Oui", "Très bien"] },
      { id: "k2", text: "Vous savez ce qui le/la fait se sentir aimé(e) ?", options: ["Non", "Vaguement", "Oui", "Précisément"] },
      { id: "k3", text: "Vous connaissez un rêve important pour lui/elle cette année ?", options: ["Non", "Approximativement", "Oui", "Oui et j’y contribue"] },
      { id: "k4", text: "Vous remarquez tôt quand son humeur change ?", options: ["Rarement", "Parfois", "Souvent", "Presque toujours"] }
    ]
  }
];

export function scoreQuiz(quiz, answers) {
  const values = quiz.questions.map((question) => {
    const answer = answers?.[question.id];
    const index = question.options.indexOf(answer);
    return index < 0 ? 0 : index;
  });
  const max = quiz.questions.length * 3;
  const raw = values.reduce((sum, value) => sum + value, 0);
  return Math.round((raw / max) * 100);
}
