// Rule-based module routing: no AI, no ML. Every assessment question has a
// baseline theme mapping (so every user gets some coverage even from a thin
// answer), and each answer is then scanned for theme keywords to weight the
// scoring toward what the person actually wrote. Fully deterministic and
// easy to audit or tune by hand.

export const MODULES = [
  { id: "confidence_selfworth", name: "Confidence & Self-Worth", themes: ["confidence", "self_worth"] },
  { id: "speaking_communication", name: "Speaking & Communication", themes: ["speaking", "relationships"] },
  { id: "discipline_habits", name: "Discipline & Habits", themes: ["discipline", "habits"] },
  { id: "purpose_direction", name: "Purpose & Direction", themes: ["purpose", "direction"] },
  { id: "decision_making_fear", name: "Decision-Making & Fear", themes: ["fear"] },
];

export const MAX_MODULES_PER_USER = 3;

// Which themes each question is expected to surface, regardless of what
// keywords show up in the answer. Guarantees a baseline signal even from a
// short or vague answer.
const QUESTION_THEMES = {
  q1_dream: ["purpose", "direction"],
  q2_obstacle: ["fear", "confidence", "discipline"],
  q3_daily_behavior: ["discipline", "habits"],
  q4_self_talk: ["confidence", "self_worth"],
  q5_avoided_conversation: ["speaking", "relationships"],
  q6_money_freedom: ["purpose", "direction"],
};

const THEME_KEYWORDS = {
  fear: ["afraid", "fear", "scared", "anxious", "anxiety", "nervous", "worried", "worry", "avoid", "avoiding", "avoidance", "doubt", "hesitant", "hesitate", "procrastinat", "risk", "failure", "panic", "overwhelm"],
  confidence: ["confidence", "confident", "insecure", "doubt myself", "not good enough", "imposter", "believe in myself", "inadequate", "incapable"],
  self_worth: ["worth", "worthless", "deserve", "undeserving", "self-esteem", "self esteem", "ashamed", "shame", "not enough"],
  discipline: ["discipline", "consistent", "consistency", "procrastinate", "lazy", "motivation", "distracted", "distraction", "focus", "structure", "schedule", "routine"],
  habits: ["habit", "scroll", "scrolling", "phone", "screen time", "sleep", "wake up", "exercise", "diet", "addicted", "binge"],
  purpose: ["purpose", "meaning", "dream", "passion", "calling", "lost", "aimless", "drifting"],
  direction: ["direction", "goal", "plan", "path", "decide", "decision", "choice", "unclear", "confused", "stuck"],
  speaking: ["conversation", "talk", "tell", "say", "speak", "confront", "communicate", "express"],
  relationships: ["relationship", "partner", "friend", "family", "mother", "father", "spouse", "husband", "wife", "colleague", "boss", "conflict"],
};

const MAX_KEYWORD_BONUS_PER_QUESTION = 4;

function scoreThemes(answers) {
  const scores = Object.fromEntries(Object.keys(THEME_KEYWORDS).map((theme) => [theme, 0]));

  for (const themes of Object.values(QUESTION_THEMES)) {
    for (const theme of themes) scores[theme] += 1;
  }

  for (const text of Object.values(answers)) {
    if (typeof text !== "string" || !text) continue;
    const lower = text.toLowerCase();
    for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
      const hits = keywords.reduce((count, word) => (lower.includes(word) ? count + 1 : count), 0);
      scores[theme] += Math.min(hits, MAX_KEYWORD_BONUS_PER_QUESTION);
    }
  }

  return scores;
}

// Takes { [questionId]: answerText } and returns up to MAX_MODULES_PER_USER
// module ids, highest scoring first. Ties break by MODULES declaration order.
export function routeModules(answers) {
  const themeScores = scoreThemes(answers || {});

  return MODULES.map((module) => ({
    id: module.id,
    score: module.themes.reduce((sum, theme) => sum + (themeScores[theme] || 0), 0),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MODULES_PER_USER)
    .map((m) => m.id);
}
