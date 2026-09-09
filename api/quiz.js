import { handlePreflight, fail, ok, readJson } from "./_lib/http.js";
import { QUIZZES, scoreQuiz } from "../src/ai/quizzes.js";
import { runGeneration } from "../src/services/conversation-service.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;

  if (request.method === "GET") {
    return ok(response, {
      quizzes: QUIZZES.map(({ questions, ...quiz }) => ({
        ...quiz,
        questionCount: questions.length
      }))
    });
  }

  if (request.method !== "POST") {
    return fail(response, 405, "METHOD_NOT_ALLOWED", "Méthode non autorisée.");
  }

  const payload = await readJson(request).catch(() => null);
  if (!payload) {
    return fail(response, 400, "VALIDATION_ERROR", "Corps invalide.");
  }

  const quiz = QUIZZES.find((item) => item.slug === payload.slug);
  if (!quiz) {
    return fail(response, 404, "NOT_FOUND", "Quiz introuvable.");
  }

  if (!payload.answers) {
    return ok(response, { quiz });
  }

  const score = scoreQuiz(quiz, payload.answers);
  let commentary = `Score ${score}/100 au quiz « ${quiz.title} ». Ce chiffre n’est pas un verdict, seulement un miroir du moment.`;
  try {
    const generated = await runGeneration({
      payload: {
        messages: [
          {
            role: "user",
            content: `Quiz ${quiz.title}, score ${score}/100. Commentaire bienveillant et 2 pistes concrètes.`
          }
        ]
      },
      tool: "quiz"
    });
    commentary = generated.text;
  } catch {
    // static commentary is enough if AI is down
  }

  return ok(response, { slug: quiz.slug, score, commentary });
}
