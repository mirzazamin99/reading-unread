"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import content from "../../../content.json";

const { plot } = content.sheet;

const inputClass =
  "block w-full rounded-xl border border-edge bg-surface px-4 py-3 text-base text-foreground placeholder:text-foreground-faint";
const buttonClass =
  "mt-6 inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-4 font-body text-[0.95rem] font-medium tracking-wide text-paper shadow-[var(--shadow-cta)] transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[var(--shadow-cta-hover)] active:bg-accent-press disabled:opacity-60";

function PlotForm() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");

  const [direction, setDirection] = useState("");
  const [cost, setCost] = useState("");
  const [givingUp1, setGivingUp1] = useState("");
  const [givingUp2, setGivingUp2] = useState("");
  const [givingUp3, setGivingUp3] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!submissionId) return;
    fetch(`/api/plot?submissionId=${submissionId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.plot) {
          setDirection(result.plot.direction || "");
          setCost(result.plot.cost || "");
          const givingUp = result.plot.giving_up || [];
          setGivingUp1(givingUp[0] || "");
          setGivingUp2(givingUp[1] || "");
          setGivingUp3(givingUp[2] || "");
        }
        setStatus("idle");
      })
      .catch(() => setStatus("idle"));
  }, [submissionId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    const givingUp = [givingUp1, givingUp2, givingUp3].filter((item) => item.trim() !== "");
    try {
      const res = await fetch("/api/plot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, direction, cost, givingUp }),
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
      <p className="text-lg leading-relaxed text-foreground-dim md:text-xl">{plot.intro}</p>
      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        {plot.questions.map((q) => {
          if (q.id === "direction" || q.id === "cost") {
            const value = q.id === "direction" ? direction : cost;
            const setValue = q.id === "direction" ? setDirection : setCost;
            return (
              <div key={q.id}>
                <label className="block">
                  <span className="mb-2 block text-base font-medium text-foreground md:text-lg">
                    {q.question}
                  </span>
                  <textarea
                    rows={3}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    className={inputClass}
                  />
                </label>
              </div>
            );
          }
          if (q.id === "givingUp") {
            return (
              <div key={q.id}>
                <span className="mb-2 block text-base font-medium text-foreground md:text-lg">
                  {q.question}
                </span>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={givingUp1}
                    onChange={(e) => setGivingUp1(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={givingUp2}
                    onChange={(e) => setGivingUp2(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={givingUp3}
                    onChange={(e) => setGivingUp3(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            );
          }
          return null;
        })}
        {status === "error" && message && (
          <p role="alert" className="text-base font-medium text-accent-text">
            {message}
          </p>
        )}
        {status === "saved" && (
          <p className="text-base font-medium text-foreground-dim">{message}</p>
        )}
        <button
          type="submit"
          disabled={status === "saving" || status === "loading"}
          className={buttonClass}
        >
          {status === "saving" ? "Saving" : "Save"}
        </button>
      </form>
    </main>
  );
}

export default function PlotPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12">
          <p className="text-lg text-foreground-dim">Loading</p>
        </main>
      }
    >
      <PlotForm />
    </Suspense>
  );
}
