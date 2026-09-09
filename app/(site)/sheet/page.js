"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import content from "../../../content.json";

const { morning, evening } = content.sheet;

const inputClass =
  "block w-full rounded-xl border border-edge bg-surface px-4 py-3 text-base text-foreground placeholder:text-foreground-faint";
const buttonClass =
  "mt-6 inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-4 font-body text-[0.95rem] font-medium tracking-wide text-paper shadow-[var(--shadow-cta)] transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[var(--shadow-cta-hover)] active:bg-accent-press disabled:opacity-60";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SheetForm() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");
  const date = todayISO();

  const [morningEntry, setMorningEntry] = useState("");
  const [didIt, setDidIt] = useState(null);
  const [eveningDetail, setEveningDetail] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!submissionId) return;
    fetch(`/api/day?submissionId=${submissionId}&date=${date}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.day) {
          setMorningEntry(result.day.morning_entry || "");
          setDidIt(result.day.did_it === undefined ? null : result.day.did_it);
          setEveningDetail(result.day.evening_detail || "");
        }
        setStatus("idle");
      })
      .catch(() => setStatus("idle"));
  }, [submissionId, date]);

  async function handleSave() {
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, date, morningEntry, didIt, eveningDetail }),
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
      <p className="font-display text-2xl text-foreground md:text-3xl">{date}</p>

      <div className="mt-10">
        <label className="block">
          <span className="mb-2 block text-base font-medium text-foreground md:text-lg">
            {morning.question}
          </span>
          <input
            type="text"
            value={morningEntry}
            onChange={(e) => setMorningEntry(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-10">
        <p className="mb-3 text-base font-medium text-foreground md:text-lg">
          {evening.didItQuestion}
        </p>
        <div className="flex flex-wrap gap-6">
          {[
            { value: true, label: evening.didItOptions[0] },
            { value: false, label: evening.didItOptions[1] },
            { value: null, label: evening.didItOptions[2] },
          ].map((option) => (
            <label
              key={option.label}
              className="flex items-center gap-2 text-base text-foreground-dim"
            >
              <input
                type="radio"
                name="didIt"
                checked={didIt === option.value}
                onChange={() => setDidIt(option.value)}
                className="accent-accent h-4 w-4"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <label className="block">
          <span className="mb-2 block text-base font-medium text-foreground md:text-lg">
            {evening.detailQuestion}
          </span>
          <input
            type="text"
            value={eveningDetail}
            onChange={(e) => setEveningDetail(e.target.value)}
            className={inputClass}
          />
        </label>
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

export default function SheetPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12">
          <p className="text-lg text-foreground-dim">Loading</p>
        </main>
      }
    >
      <SheetForm />
    </Suspense>
  );
}
