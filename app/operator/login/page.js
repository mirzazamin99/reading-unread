"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import content from "../../../content.json";

const { login } = content.operator;

export default function OperatorLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    let ok = false;
    try {
      const res = await fetch("/api/operator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }

    if (!ok) {
      setSubmitting(false);
      setError(login.errorLabel);
      return;
    }

    router.push("/operator");
    router.refresh();
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-6 py-16"
      style={{ background: "var(--auth-vignette)" }}
    >
      <div className="w-full max-w-[400px]">
        <p className="text-center font-display text-lg text-foreground">{login.panelTitle}</p>
        <p className="mt-1.5 text-center text-sm text-foreground-faint">{login.tagline}</p>

        <div className="mt-10 rounded-3xl border border-edge bg-surface px-8 py-10 shadow-[var(--shadow-card)]">
          <h1 className="text-center font-display text-2xl font-medium text-foreground">
            {login.heading}
          </h1>
          <form onSubmit={handleSubmit} className="mt-8">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground-dim">
                {login.passwordLabel}
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoFocus
                className="block w-full rounded-xl border border-edge bg-surface-tint/60 px-4 py-3 text-base text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none transition-all duration-300 ease-out focus-visible:border-accent-hover focus-visible:shadow-[var(--shadow-glow)]"
              />
            </label>

            {error && (
              <p role="alert" className="mt-3 text-sm font-medium text-accent-text">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-accent px-8 py-3.5 text-[0.95rem] font-medium tracking-wide text-paper shadow-[var(--shadow-cta)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[var(--shadow-cta-hover-lg)] focus-visible:shadow-[var(--shadow-glow)] active:translate-y-0 active:bg-accent-press disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? login.submittingLabel : login.submitLabel}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
