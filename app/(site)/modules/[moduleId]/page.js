"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import content from "../../../../content.json";
import Reveal from "../../../components/Reveal";

const { modules: copy } = content;

const STEPS = ["intro", "core_lesson", "reflection_prompt", "micro_action", "check_in"];
const MICRO_ACTION_DONE_MARKER = "Completed";

const textareaClass =
  "mt-4 block w-full rounded-xl border border-edge bg-surface px-4 py-3 text-base leading-relaxed text-foreground shadow-[0_2px_6px_rgba(0,0,0,0.12)] outline-none transition-all duration-300 ease-out focus-visible:border-accent-hover focus-visible:shadow-[0_0_0_4px_var(--accent-soft),0_2px_10px_rgba(0,0,0,0.15)]";
const buttonClass =
  "mt-6 inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-4 font-body text-[0.95rem] font-medium tracking-wide text-paper shadow-[var(--shadow-cta)] transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[var(--shadow-cta-hover)] active:bg-accent-press disabled:opacity-60";

function initialStepIndex(responses) {
  if (!responses.reflection_prompt) return 0;
  if (!responses.micro_action) return 3;
  if (!responses.check_in) return 4;
  return 4;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ParagraphBlock({ text }) {
  const paragraphs = (text || "").split("\n").filter((p) => p.trim());
  if (!paragraphs.length) return null;
  return (
    <div className="space-y-4 text-lg leading-relaxed text-foreground-dim">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function ModuleDetail() {
  const searchParams = useSearchParams();
  const params = useParams();
  const moduleId = params.moduleId;
  const urlUserId = searchParams.get("userId");

  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [reflectionText, setReflectionText] = useState("");
  const [checkInText, setCheckInText] = useState("");
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [microActionDone, setMicroActionDone] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Resolves the user id from the URL, or from localStorage saved right
    // after the assessment -- reading that external system's value here,
    // before the fetch below, is exactly the case this rule means to allow.
    let resolvedId = urlUserId;
    if (!resolvedId) {
      try {
        resolvedId = localStorage.getItem("lifeAssessmentUserId");
      } catch {
        resolvedId = null;
      }
    }
    if (!resolvedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("noUser");
      return;
    }
    setUserId(resolvedId);
    fetch(`/api/modules/${moduleId}?userId=${resolvedId}`)
      .then((res) => res.json().then((result) => ({ ok: res.ok, result })))
      .then(({ ok, result }) => {
        if (!ok) {
          setStatus(result.error === "That module was not assigned to you." ? "notFound" : "error");
          return;
        }
        setData(result);
        setReflectionText(result.responses.reflection_prompt || "");
        setCheckInText(result.responses.check_in || "");
        setMicroActionDone(Boolean(result.responses.micro_action));
        setStepIndex(initialStepIndex(result.responses));
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [moduleId, urlUserId]);

  async function saveStep(step, responseText) {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/modules/${moduleId}/reflection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, step, responseText }),
      });
      const result = await res.json();
      if (!res.ok) {
        setSaveState("error");
        return false;
      }
      setSaveState("saved");
      setData((prev) => ({ ...prev, assignment: { ...prev.assignment, status: result.status } }));
      return true;
    } catch {
      setSaveState("error");
      return false;
    }
  }

  if (status === "noUser") {
    return (
      <main className="mx-auto max-w-[720px] px-6 py-16 text-center md:px-12">
        <p className="text-lg text-foreground-dim">{copy.missingUserLabel}</p>
      </main>
    );
  }
  if (status === "loading") {
    return (
      <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12">
        <p className="text-lg text-foreground-dim">Loading</p>
      </main>
    );
  }
  if (status === "notFound") {
    return (
      <main className="mx-auto max-w-[720px] px-6 py-16 text-center md:px-12">
        <p className="text-lg font-medium text-accent-text">{copy.notFoundLabel}</p>
      </main>
    );
  }
  if (status === "error") {
    return (
      <main className="mx-auto max-w-[720px] px-6 py-16 text-center md:px-12">
        <p className="text-lg font-medium text-accent-text">{copy.loadErrorLabel}</p>
      </main>
    );
  }

  const { content: moduleContent, assignment } = data;
  const step = STEPS[stepIndex];

  const checkInAvailableAt = new Date(assignment.assignedAt);
  checkInAvailableAt.setDate(checkInAvailableAt.getDate() + moduleContent.check_in_delay_days);
  const checkInUnlocked = new Date() >= checkInAvailableAt;

  return (
    <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12 md:py-24">
      <Link
        href={`/modules?userId=${userId}`}
        className="text-sm font-medium text-foreground-faint transition-colors duration-300 ease-out hover:text-foreground"
      >
        &larr; {copy.backToModulesLabel}
      </Link>

      <Reveal>
        <p className="mt-6 text-sm font-medium uppercase tracking-widest text-accent-text">
          {copy.stepLabels[step]} &middot; {stepIndex + 1}/{STEPS.length}
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium text-foreground md:text-4xl">
          {moduleContent.name}
        </h1>
      </Reveal>

      <div className="mt-10">
        {step === "intro" && (
          <>
            <ParagraphBlock text={moduleContent.intro} />
            <button type="button" onClick={() => setStepIndex(1)} className={buttonClass}>
              {copy.continueLabel}
            </button>
          </>
        )}

        {step === "core_lesson" && (
          <>
            <ParagraphBlock text={moduleContent.core_lesson} />
            <button type="button" onClick={() => setStepIndex(2)} className={buttonClass}>
              {copy.continueLabel}
            </button>
          </>
        )}

        {step === "reflection_prompt" && (
          <>
            <p className="text-lg font-medium text-foreground">{moduleContent.reflection_prompt}</p>
            <textarea
              rows={6}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              className={textareaClass}
            />
            <button
              type="button"
              disabled={saveState === "saving" || !reflectionText.trim()}
              onClick={async () => {
                const ok = await saveStep("reflection_prompt", reflectionText);
                if (ok) setStepIndex(3);
              }}
              className={buttonClass}
            >
              {saveState === "saving" ? copy.savingLabel : copy.saveContinueLabel}
            </button>
            {saveState === "error" && (
              <p className="mt-3 text-sm font-medium text-accent-text">{copy.saveErrorLabel}</p>
            )}
          </>
        )}

        {step === "micro_action" && (
          <>
            <p className="text-lg leading-relaxed text-foreground-dim">{moduleContent.micro_action}</p>
            {microActionDone ? (
              <p className="mt-4 text-base font-medium text-accent-text">{copy.doneLabel}</p>
            ) : (
              <button
                type="button"
                disabled={saveState === "saving"}
                onClick={async () => {
                  const ok = await saveStep("micro_action", MICRO_ACTION_DONE_MARKER);
                  if (ok) setMicroActionDone(true);
                }}
                className={buttonClass}
              >
                {saveState === "saving" ? copy.savingLabel : copy.markDoneLabel}
              </button>
            )}
            {microActionDone && (
              <button type="button" onClick={() => setStepIndex(4)} className={buttonClass}>
                {copy.continueLabel}
              </button>
            )}
            {saveState === "error" && (
              <p className="mt-3 text-sm font-medium text-accent-text">{copy.saveErrorLabel}</p>
            )}
          </>
        )}

        {step === "check_in" && (
          <>
            <p className="text-lg font-medium text-foreground">{moduleContent.check_in_question}</p>
            {checkInUnlocked ? (
              <>
                <textarea
                  rows={4}
                  value={checkInText}
                  onChange={(e) => setCheckInText(e.target.value)}
                  className={textareaClass}
                />
                <button
                  type="button"
                  disabled={saveState === "saving" || !checkInText.trim()}
                  onClick={() => saveStep("check_in", checkInText)}
                  className={buttonClass}
                >
                  {saveState === "saving" ? copy.savingLabel : copy.saveContinueLabel}
                </button>
                {saveState === "saved" && (
                  <p className="mt-3 text-sm font-medium text-foreground-dim">{copy.savedLabel}</p>
                )}
                {saveState === "error" && (
                  <p className="mt-3 text-sm font-medium text-accent-text">{copy.saveErrorLabel}</p>
                )}
              </>
            ) : (
              <p className="mt-4 text-base text-foreground-faint">
                {copy.checkInLockedLabel} {copy.checkInAvailableFromLabel} {formatDate(checkInAvailableAt)}.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function ModuleDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12">
          <p className="text-lg text-foreground-dim">Loading</p>
        </main>
      }
    >
      <ModuleDetail />
    </Suspense>
  );
}
