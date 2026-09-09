"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import content from "../../../content.json";
import Reveal from "../../components/Reveal";

const { assessment } = content;
const { form } = assessment;

const inputClass =
  "block w-full rounded-xl border border-edge bg-surface px-4 py-3 text-base text-foreground placeholder:text-foreground-faint shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out outline-none focus-visible:border-accent-hover focus-visible:shadow-[0_0_0_4px_var(--accent-soft),0_2px_10px_rgba(0,0,0,0.15)]";

function storeUserId(userId) {
  try {
    localStorage.setItem("lifeAssessmentUserId", userId);
  } catch {
    // storage unavailable -- the ?userId= link on the next screen still works
  }
}

export default function AssessmentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);

  function updateAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    let result;
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, answers }),
      });
      result = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(result.error || form.genericError);
        return;
      }
    } catch {
      setStatus("error");
      setMessage(form.networkError);
      return;
    }
    storeUserId(result.userId);
    setUserId(result.userId);
    setStatus("done");
  }

  if (status === "done") {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-[720px] flex-col items-center justify-center gap-8 px-6 py-24 text-center md:px-12">
        <div>
          <p className="font-display text-2xl leading-snug text-foreground md:text-3xl">
            {form.successHeading}
          </p>
          <p className="mx-auto mt-3 max-w-[46ch] text-lg text-foreground-dim">{form.successBody}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/modules?userId=${userId}`)}
          className="inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-4 font-body text-[0.95rem] font-medium tracking-wide text-paper shadow-[var(--shadow-cta)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[var(--shadow-cta-hover-lg)] active:bg-accent-press"
        >
          {form.continueLabel}
          <span aria-hidden="true">&rarr;</span>
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12 md:py-24">
      <Reveal>
        <p className="text-lg leading-relaxed text-foreground-dim md:text-xl">{assessment.intro}</p>
      </Reveal>

      <form onSubmit={handleSubmit} className="mt-10">
        <Reveal delay={80}>
          <div className="mb-7">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground-dim">
                {form.nameLabel}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            </label>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <div className="mb-16">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground-dim">
                {form.emailLabel}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </label>
          </div>
        </Reveal>

        <div className="space-y-11 md:space-y-12">
          {assessment.questions.map((q, i) => (
            <Reveal key={q.id} delay={Math.min(i, 4) * 60}>
              <div>
                <label className="block">
                  <span className="mb-3 block text-base font-medium text-foreground md:text-lg">
                    {q.text}
                  </span>
                  <textarea
                    rows={q.rows}
                    value={answers[q.id] || ""}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    required
                    className={inputClass}
                  />
                </label>
              </div>
            </Reveal>
          ))}
        </div>

        {status === "error" && message && (
          <p role="alert" className="mt-8 text-base font-medium text-accent-text">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-12 inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-4 font-body text-[0.95rem] font-medium tracking-wide text-paper shadow-[var(--shadow-cta)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-accent-hover hover:shadow-[var(--shadow-cta-hover-lg)] active:scale-[0.98] active:bg-accent-press disabled:opacity-60 disabled:hover:scale-100 disabled:hover:translate-y-0"
        >
          {status === "submitting" ? form.submittingLabel : form.submitLabel}
        </button>
      </form>
    </main>
  );
}
