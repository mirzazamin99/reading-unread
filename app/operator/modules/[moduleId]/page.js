import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin, isMissingTableError } from "../../../../lib/supabase-admin";
import content from "../../../../content.json";
import OperatorHeader from "../../OperatorHeader";
import ModuleEditForm from "./ModuleEditForm";
import SetupNotice from "../../SetupNotice";

const { modules: copy } = content.admin;

export const dynamic = "force-dynamic";

export default async function OperatorModuleEditPage({ params }) {
  const { moduleId } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  const { data: module, error } = await supabaseAdmin
    .from("module_content")
    .select("*")
    .eq("module_id", moduleId)
    .maybeSingle();

  if (error && isMissingTableError(error)) {
    return (
      <>
        <OperatorHeader active="modules" />
        <main className="mx-auto max-w-[760px] px-6 py-12 md:px-10 md:py-16">
          <SetupNotice />
        </main>
      </>
    );
  }
  if (error || !module) notFound();

  return (
    <>
      <OperatorHeader active="modules" />
      <main className="mx-auto max-w-[760px] px-6 py-12 md:px-10 md:py-16">
        <Link
          href="/operator/modules"
          className="text-sm font-medium text-foreground-faint transition-colors duration-300 ease-out hover:text-foreground"
        >
          &larr; {copy.backLabel}
        </Link>

        <h1 className="mt-6 font-display text-3xl font-medium text-foreground md:text-4xl">
          {module.name}
        </h1>

        <ModuleEditForm module={module} />
      </main>
    </>
  );
}
