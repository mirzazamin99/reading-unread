export default function SetupNotice() {
  return (
    <div className="mt-8 rounded-2xl border border-edge bg-surface-tint/60 px-6 py-5">
      <p className="text-base font-medium text-foreground">Database not set up yet</p>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-foreground-dim">
        Run{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em]">
          supabase/migrations/0006_life_assessment_modules.sql
        </code>{" "}
        in the Supabase dashboard&apos;s SQL editor (Project settings &rarr; SQL Editor &rarr; New
        query &rarr; paste &rarr; Run), then refresh this page.
      </p>
    </div>
  );
}
