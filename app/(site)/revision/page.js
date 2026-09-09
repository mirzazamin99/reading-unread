"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import content from "../../../content.json";

const { revision } = content.sheet;

const inputClass =
  "block w-full rounded-xl border border-edge bg-surface px-4 py-3 text-base text-foreground placeholder:text-foreground-faint";
const buttonClass =
  "mt-6 inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-4 font-body text-[0.95rem] font-medium tracking-wide text-paper shadow-[var(--shadow-cta)] transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[var(--shadow-cta-hover)] active:bg-accent-press disabled:opacity-60";

function RevisionForm() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");

  const [counts, setCounts] = useState(null);
  const [missedDay, setMissedDay] = useState("");
  const [directionCheck, setDirectionCheck] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!submissionId) return;
    fetch(`/api/revision?submissionId=${submissionId}`)
      .then((res) => res.json())
      .then((result) => {
        setCounts(result.counts);
        if (result.revision) {
          setMissedDay(result.revision.missed_day || "");
          setDirectionCheck(result.revision.direction_check || "");
        }
        setStatus("idle");
      })
      .catch(() => setStatus("idle"));
  }, [submissionId]);

  async function handleSave() {
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, missedDay, directionCheck }),
      });
      const result = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(result.error || "Could not save.");
        return;
      }
      setStatus("saved");
      setMessage("Saved.");
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  }

  if (!submissionId) {
    return (
      <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12">
        <p className="text-lg text-foreground-dim">No submissionId given in the page address.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12 md:py-24">
      <p className="text-lg leading-relaxed text-foreground-dim md:text-xl">{revision.intro}</p>

      {counts && (
        <div className="mt-8 grid grid-cols-2 gap-4 border-y border-edge py-6 sm:grid-cols-4">
          <div>
            <p className="text-2xl font-medium text-foreground">{counts.totalDays}</p>
            <p className="text-sm text-foreground-faint">Days with an entry</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-foreground">{counts.yes}</p>
            <p className="text-sm text-foreground-faint">Yes</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-foreground">{counts.no}</p>
            <p className="text-sm text-foreground-faint">No</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-foreground">{counts.notAnswered}</p>
            <p className="text-sm text-foreground-faint">Not answered</p>
          </div>
        </div>
      )}

      <div className="mt-10 space-y-8">
        {revision.questions.map((q) => (
          <div key={q.id}>
            <label className="block">
              <span className="mb-2 block text-base font-medium text-foreground md:text-lg">
                {q.question}
              </span>
              <textarea
                rows={3}
                value={q.id === "missedDay" ? missedDay : directionCheck}
                onChange={(e) =>
                  q.id === "missedDay"
                    ? setMissedDay(e.target.value)
                    : setDirectionCheck(e.target.value)
                }
                className={inputClass}
              />
            </label>
          </div>
        ))}
      </div>

      {status === "error" && message && (
        <p role="alert" className="mt-6 text-base font-medium text-accent-text">
          {message}
        </p>
      )}
      {status === "saved" && (
        <p className="mt-6 text-base font-medium text-foreground-dim">{message}</p>
      )}
      <button
        onClick={handleSave}
        disabled={status === "saving" || status === "loading"}
        className={buttonClass}
      >
        {status === "saving" ? "Saving" : "Save"}
      </button>
    </main>
  );
}

export default function RevisionPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12">
          <p className="text-lg text-foreground-dim">Loading</p>
        </main>
      }
    >
      <RevisionForm />
    </Suspense>
  );
}
