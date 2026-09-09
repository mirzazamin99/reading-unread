import Link from "next/link";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import content from "../../../content.json";
import OperatorHeader from "../OperatorHeader";

const { modules: copy } = content.admin;

export const dynamic = "force-dynamic";

export default async function OperatorModulesPage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: modules, error } = await supabaseAdmin
    .from("module_content")
    .select("module_id, name")
    .order("module_id", { ascending: true });

  return (
    <>
      <OperatorHeader />
      <main className="mx-auto max-w-[900px] px-6 py-12 md:px-10 md:py-16">
        <Link
          href="/operator"
          className="text-sm font-medium text-foreground-faint transition-colors duration-300 ease-out hover:text-foreground"
        >
          &larr; {copy.backLabel}
        </Link>

        <h1 className="mt-6 font-display text-3xl font-medium text-foreground md:text-4xl">
          {copy.heading}
        </h1>
        <p className="mt-3 max-w-[60ch] text-lg text-foreground-dim">{copy.intro}</p>

        {error && (
          <p className="mt-8 text-base font-medium text-accent-text">{copy.saveErrorLabel}</p>
        )}

        <div className="mt-10 flex flex-col gap-4">
          {(modules || []).map((module) => (
            <Link
              key={module.module_id}
              href={`/operator/modules/${module.module_id}`}
              className="flex items-center justify-between rounded-2xl border border-edge bg-surface px-6 py-5 shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent-hover/40 hover:shadow-[var(--shadow-card-hover)]"
            >
              <p className="font-display text-lg text-foreground">{module.name}</p>
              <span aria-hidden="true" className="text-foreground-faint">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
