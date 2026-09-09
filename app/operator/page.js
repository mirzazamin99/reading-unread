import Link from "next/link";
import { getSupabaseAdmin, isMissingTableError } from "../../lib/supabase-admin";
import content from "../../content.json";
import OperatorHeader from "./OperatorHeader";
import SetupNotice from "./SetupNotice";

const { queue } = content.admin;

export const dynamic = "force-dynamic";

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function OperatorQueuePage() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("id, name, email, created_at")
    .order("created_at", { ascending: false });

  if (error) console.error("Queue load failed:", error.message);

  const { data: assignments } = await supabaseAdmin
    .from("module_assignments")
    .select("user_id, status");

  const countsByUser = {};
  let totalAssigned = 0;
  let totalCompleted = 0;
  for (const a of assignments || []) {
    countsByUser[a.user_id] = countsByUser[a.user_id] || { total: 0, completed: 0 };
    countsByUser[a.user_id].total += 1;
    totalAssigned += 1;
    if (a.status === "completed") {
      countsByUser[a.user_id].completed += 1;
      totalCompleted += 1;
    }
  }

  const rows = users || [];
  const stats = [
    { label: "People", value: rows.length },
    { label: "Modules assigned", value: totalAssigned },
    { label: "Completed", value: totalCompleted },
  ];

  return (
    <>
      <OperatorHeader active="users" />
      <main className="mx-auto max-w-[1100px] px-6 py-12 md:px-10 md:py-16">
        <h1 className="font-display text-3xl font-medium text-foreground md:text-4xl">
          {queue.heading}
        </h1>

        {!error && rows.length > 0 && (
          <div className="mt-8 grid grid-cols-3 divide-x divide-edge overflow-hidden rounded-2xl border border-edge bg-surface shadow-[var(--shadow-card)]">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-5 text-center sm:px-6">
                <p className="font-display text-2xl text-foreground md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-foreground-faint sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {error && isMissingTableError(error) && <SetupNotice />}
        {error && !isMissingTableError(error) && (
          <p className="mt-8 text-base font-medium text-accent-text">{queue.loadErrorLabel}</p>
        )}

        {!error && rows.length === 0 && (
          <p className="mt-8 text-base text-foreground-faint">{queue.emptyLabel}</p>
        )}

        {!error && rows.length > 0 && (
          <div className="mt-10 flex flex-col gap-4">
            {rows.map((user) => {
              const counts = countsByUser[user.id] || { total: 0, completed: 0 };
              return (
                <Link
                  key={user.id}
                  href={`/operator/${user.id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-edge bg-surface px-5 py-5 shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent-hover/40 hover:shadow-[var(--shadow-card-hover)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
                >
                  <div>
                    <p className="font-display text-lg text-foreground">{user.name}</p>
                    <p className="text-sm text-foreground-faint">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span
                      className={
                        counts.total > 0 && counts.completed === counts.total
                          ? "rounded-full bg-accent px-3 py-1 text-xs font-medium text-paper"
                          : "rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-text"
                      }
                    >
                      {counts.completed}/{counts.total} modules complete
                    </span>
                    <p className="text-sm text-foreground-faint">{formatDate(user.created_at)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
