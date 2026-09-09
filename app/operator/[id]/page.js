import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import content from "../../../content.json";
import OperatorHeader from "../OperatorHeader";

const { detail } = content.admin;
const { modules: modulesCopy } = content;
const QUESTION_BY_ID = Object.fromEntries(content.assessment.questions.map((q) => [q.id, q.text]));
const QUESTION_ORDER = content.assessment.questions.map((q) => q.id);

export const dynamic = "force-dynamic";

export default async function OperatorUserPage({ params }) {
  const { id } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (userError || !user) notFound();

  const [{ data: answers }, { data: assignments }, { data: responses }] = await Promise.all([
    supabaseAdmin.from("assessment_answers").select("question_id, answer_text").eq("user_id", id),
    supabaseAdmin
      .from("module_assignments")
      .select("module_id, status, assigned_at")
      .eq("user_id", id)
      .order("assigned_at", { ascending: true }),
    supabaseAdmin
      .from("reflection_responses")
      .select("module_id, step, response_text, updated_at")
      .eq("user_id", id),
  ]);

  const moduleIds = (assignments || []).map((a) => a.module_id);
  const { data: moduleContentRows } = moduleIds.length
    ? await supabaseAdmin.from("module_content").select("module_id, name").in("module_id", moduleIds)
    : { data: [] };
  const nameByModuleId = Object.fromEntries((moduleContentRows || []).map((r) => [r.module_id, r.name]));

  const answerByQuestionId = Object.fromEntries((answers || []).map((a) => [a.question_id, a.answer_text]));

  const responsesByModuleId = {};
  for (const r of responses || []) {
    responsesByModuleId[r.module_id] = responsesByModuleId[r.module_id] || {};
    responsesByModuleId[r.module_id][r.step] = r;
  }

  return (
    <>
      <OperatorHeader />
      <main className="mx-auto max-w-[1100px] px-6 py-12 md:px-10 md:py-16">
        <Link
          href="/operator"
          className="text-sm font-medium text-foreground-faint transition-colors duration-300 ease-out hover:text-foreground"
        >
          &larr; {detail.backLabel}
        </Link>

        <div className="mt-6">
          <h1 className="font-display text-3xl font-medium text-foreground md:text-4xl">
            {user.name}
          </h1>
          <p className="mt-1 text-base text-foreground-faint">{user.email}</p>
        </div>

        <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
          <section>
            <h2 className="flex items-center gap-3 font-display text-xl font-medium text-foreground">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              {detail.answersHeading}
            </h2>
            <div className="mt-8 space-y-4">
              {QUESTION_ORDER.map((qid) => (
                <div
                  key={qid}
                  className="rounded-2xl border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]"
                >
                  <p className="text-sm font-semibold text-accent-text">{QUESTION_BY_ID[qid]}</p>
                  <p className="mt-2 text-base leading-relaxed text-foreground">
                    {answerByQuestionId[qid] || ""}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-3 font-display text-xl font-medium text-foreground">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              {detail.modulesHeading}
            </h2>
            <div className="mt-8 space-y-3">
              {(assignments || []).map((a) => (
                <div
                  key={a.module_id}
                  className="flex items-center justify-between rounded-2xl border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]"
                >
                  <p className="font-display text-lg text-foreground">
                    {nameByModuleId[a.module_id] || a.module_id}
                  </p>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-text">
                    {modulesCopy.statusLabels[a.status] || a.status}
                  </span>
                </div>
              ))}
            </div>

            <h2 className="mt-12 flex items-center gap-3 font-display text-xl font-medium text-foreground">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              {detail.responsesHeading}
            </h2>
            <div className="mt-8 space-y-8">
              {(assignments || []).map((a) => {
                const moduleResponses = responsesByModuleId[a.module_id] || {};
                const steps = ["reflection_prompt", "micro_action", "check_in"];
                return (
                  <div key={a.module_id}>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground-faint">
                      {nameByModuleId[a.module_id] || a.module_id}
                    </h3>
                    <div className="mt-4 space-y-3">
                      {steps.map((step) => (
                        <div
                          key={step}
                          className="rounded-2xl border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]"
                        >
                          <p className="text-sm font-semibold text-accent-text">
                            {modulesCopy.stepLabels[step]}
                          </p>
                          <p className="mt-2 text-base leading-relaxed text-foreground">
                            {moduleResponses[step]?.response_text || detail.noResponsesLabel}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
