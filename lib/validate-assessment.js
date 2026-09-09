import content from "../content.json";

const { form } = content.assessment;

export const MAX_ANSWER_LENGTH = 5000;

// Spreadsheet formula injection: if this data is ever opened in Excel,
// Google Sheets or similar, a cell whose text begins with one of these
// characters can be interpreted as a formula. We reject rather than
// strip/escape, so an honest answer is never silently rewritten -- the
// person is asked to rephrase instead.
const FORMULA_INJECTION_CHARS = ["=", "+", "-", "@"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getQuestionIds() {
  return content.assessment.questions.map((q) => q.id);
}

// Validates a raw assessment submission body. Returns { errors: string[] }
// if invalid, or { errors: [], data: { name, email, answers } } with
// trimmed values if valid.
export function validateSubmission(body) {
  if (!body || typeof body !== "object") {
    return { errors: [form.genericError] };
  }

  const errors = [];

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};

  if (!name) errors.push(form.nameRequiredError);

  if (!email) {
    errors.push(form.emailRequiredError);
  } else if (!EMAIL_RE.test(email)) {
    errors.push(form.invalidEmailError);
  }

  const cleanAnswers = {};

  for (const id of getQuestionIds()) {
    const raw = typeof answers[id] === "string" ? answers[id] : "";
    const trimmed = raw.trim();

    if (!trimmed) {
      errors.push(`${id}: ${form.blankAnswerError}`);
      continue;
    }

    if (trimmed.length > MAX_ANSWER_LENGTH) {
      errors.push(`${id}: ${form.tooLongError}`);
      continue;
    }

    const startsWithFormulaChar = trimmed
      .split("\n")
      .some((line) => FORMULA_INJECTION_CHARS.includes(line[0]));

    if (startsWithFormulaChar) {
      errors.push(`${id}: ${form.formulaCharError}`);
      continue;
    }

    cleanAnswers[id] = trimmed;
  }

  if (errors.length) return { errors };

  return { errors: [], data: { name, email, answers: cleanAnswers } };
}
