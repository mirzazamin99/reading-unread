import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";

// Full detail for one module: its editable content, this user's assignment
// (confirming they were actually routed here), and any responses already
// saved for its steps -- everything the module step-through page needs.
export async function GET(request, { params }) {
  const { moduleId } = await params;
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

  const { data: assignment, error: assignError } = await supabaseAdmin
    .from("module_assignments")
    .select("status, assigned_at")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (assignError) {
    console.error("Module assignment lookup failed:", assignError.message);
    return NextResponse.json({ error: "Could not load this module." }, { status: 500 });
  }

  if (!assignment) {
    return NextResponse.json({ error: "That module was not assigned to you." }, { status: 404 });
  }

  const { data: moduleContent, error: contentError } = await supabaseAdmin
    .from("module_content")
    .select("*")
    .eq("module_id", moduleId)
    .maybeSingle();

  if (contentError || !moduleContent) {
    console.error("Module content lookup failed:", contentError?.message);
    return NextResponse.json({ error: "Could not load this module." }, { status: 500 });
  }

  const { data: responseRows, error: responsesError } = await supabaseAdmin
    .from("reflection_responses")
    .select("step, response_text")
    .eq("user_id", userId)
    .eq("module_id", moduleId);

  if (responsesError) {
    console.error("Reflection responses lookup failed:", responsesError.message);
    return NextResponse.json({ error: "Could not load this module." }, { status: 500 });
  }

  const responses = Object.fromEntries((responseRows || []).map((r) => [r.step, r.response_text]));

  return NextResponse.json({
    ok: true,
    assignment: { status: assignment.status, assignedAt: assignment.assigned_at },
    content: moduleContent,
    responses,
  });
}
