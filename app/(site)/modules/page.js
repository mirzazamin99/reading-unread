"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import content from "../../../content.json";
import Reveal from "../../components/Reveal";

const { modules: copy } = content;

function ModulesList() {
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId");

  const [status, setStatus] = useState("loading");
  const [modules, setModules] = useState([]);
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
    fetch(`/api/modules?userId=${resolvedId}`)
      .then((res) => res.json())
      .then((result) => {
        if (!result.ok) {
          setStatus("error");
          return;
        }
        setModules(result.modules);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [urlUserId]);

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

  if (status === "error") {
    return (
      <main className="mx-auto max-w-[720px] px-6 py-16 text-center md:px-12">
        <p className="text-lg font-medium text-accent-text">{copy.loadErrorLabel}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[840px] px-6 py-16 md:px-12 md:py-24">
      <Reveal>
        <h1 className="font-display text-3xl font-medium text-foreground md:text-4xl">
          {copy.pageHeading}
        </h1>
        <p className="mt-3 text-lg text-foreground-dim">{copy.pageIntro}</p>
      </Reveal>

      {modules.length === 0 && (
        <p className="mt-10 text-base text-foreground-faint">{copy.emptyLabel}</p>
      )}

      <div className="mt-10 flex flex-col gap-4">
        {modules.map((module, i) => (
          <Reveal key={module.moduleId} delay={i * 80}>
            <Link
              href={`/modules/${module.moduleId}?userId=${userId}`}
              className="flex flex-col gap-2 rounded-2xl border border-edge bg-surface px-6 py-6 shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent-hover/40 hover:shadow-[var(--shadow-card-hover)] sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="font-display text-xl text-foreground">{module.name}</p>
              <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-text">
                {copy.statusLabels[module.status] || module.status}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </main>
  );
}

export default function ModulesPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12">
          <p className="text-lg text-foreground-dim">Loading</p>
        </main>
      }
    >
      <ModulesList />
    </Suspense>
  );
}
