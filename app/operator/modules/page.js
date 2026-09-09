import Link from "next/link";
import { getSupabaseAdmin, isMissingTableError } from "../../../lib/supabase-admin";
import content from "../../../content.json";
import OperatorHeader from "../OperatorHeader";
import SetupNotice from "../SetupNotice";

const { modules: copy } = content.admin;

export const dynamic = "force-dynamic";

function isWritten(module) {
  return Boolean(
    module.intro?.trim() ||
      module.core_lesson?.trim() ||
      module.reflection_prompt?.trim() ||
      module.micro_action?.trim() ||
      module.check_in_question?.trim()
  );
}

export default async function OperatorModulesPage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: modules, error } = await supabaseAdmin
    .from("module_content")
    .select("module_id, name, intro, core_lesson, reflection_prompt, micro_action, check_in_question")
    .order("module_id", { ascending: true });

  return (
    <>
      <OperatorHeader active="modules" />
      <main className="mx-auto max-w-[900px] px-6 py-12 md:px-10 md:py-16">
        <h1 className="font-display text-3xl font-medium text-foreground md:text-4xl">
          {copy.heading}
        </h1>
        <p className="mt-3 max-w-[60ch] text-lg text-foreground-dim">{copy.intro}</p>

        {error && isMissingTableError(error) && <SetupNotice />}
        {error && !isMissingTableError(error) && (
          <p className="mt-8 text-base font-medium text-accent-text">{copy.saveErrorLabel}</p>
        )}

        <div className="mt-10 flex flex-col gap-4">
          {(modules || []).map((module) => {
            const written = isWritten(module);
            return (
              <Link
                key={module.module_id}
                href={`/operator/modules/${module.module_id}`}
                className="flex items-center justify-between rounded-2xl border border-edge bg-surface px-6 py-5 shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent-hover/40 hover:shadow-[var(--shadow-card-hover)]"
              >
                <p className="font-display text-lg text-foreground">{module.name}</p>
                <div className="flex items-center gap-4">
                  <span
                    className={
                      written
                        ? "rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-text"
                        : "rounded-full border border-edge px-3 py-1 text-xs font-medium text-foreground-faint"
                    }
                  >
                    {written ? "Written" : "Not written yet"}
                  </span>
                  <span aria-hidden="true" className="text-foreground-faint">
                    &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
