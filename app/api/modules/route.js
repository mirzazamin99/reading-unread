import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { MODULES } from "../../../lib/route-modules";

// Merges a user's module_assignments, the editable module_content for each,
// and any reflection_responses already saved, into one shape the /modules
// list page can render without doing its own joins.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId." }, { status: 400 });
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (err) {
    console.error(err.message);
    return NextResponse.json({ error: "Server not set up." }, { status: 500 });
  }

  const { data: assignments, error: assignError } = await supabaseAdmin
    .from("module_assignments")
    .select("module_id, status, assigned_at")
    .eq("user_id", userId)
    .order("assigned_at", { ascending: true });

  if (assignError) {
    console.error("Module assignments lookup failed:", assignError.message);
    return NextResponse.json({ error: "Could not load your modules." }, { status: 500 });
  }

  if (!assignments?.length) {
    return NextResponse.json({ ok: true, modules: [] });
  }

  const moduleIds = assignments.map((a) => a.module_id);

  const { data: contentRows, error: contentError } = await supabaseAdmin
    .from("module_content")
    .select("module_id, name")
    .in("module_id", moduleIds);

  if (contentError) {
    console.error("Module content lookup failed:", contentError.message);
    return NextResponse.json({ error: "Could not load your modules." }, { status: 500 });
  }

  const nameByModuleId = Object.fromEntries(
    (contentRows || []).map((row) => [row.module_id, row.name])
  );

  const modules = assignments.map((a) => ({
    moduleId: a.module_id,
    name: nameByModuleId[a.module_id] || MODULES.find((m) => m.id === a.module_id)?.name || a.module_id,
    status: a.status,
    assignedAt: a.assigned_at,
  }));

  return NextResponse.json({ ok: true, modules });
}
