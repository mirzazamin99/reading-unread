import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabase-admin";

const TEXT_FIELDS = ["name", "intro", "core_lesson", "reflection_prompt", "micro_action", "check_in_question"];

// Protected by proxy.js's /api/operator/:path* matcher, same as the rest of
// the admin API.
export async function PATCH(request, { params }) {
  const { moduleId } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const update = {};
  for (const field of TEXT_FIELDS) {
    if (typeof body[field] === "string") update[field] = body[field];
  }
  if (typeof body.check_in_delay_days === "number" && Number.isFinite(body.check_in_delay_days)) {
    update.check_in_delay_days = Math.max(0, Math.round(body.check_in_delay_days));
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  update.updated_at = new Date().toISOString();

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("module_content")
    .update(update)
    .eq("module_id", moduleId)
    .select()
    .single();

  if (error) {
    console.error("Module content update failed:", error.message);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, module: data });
}
