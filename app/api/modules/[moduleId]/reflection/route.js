import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabase-admin";

const VALID_STEPS = ["reflection_prompt", "micro_action", "check_in"];
const MAX_RESPONSE_LENGTH = 5000;

// Saves one step's response for one user/module and advances the
// assignment's status: first response moves it to "in_progress", a saved
// check_in response completes it (check_in is always the last step).
export async function POST(request, { params }) {
  const { moduleId } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { userId, step } = body;
  const responseText = typeof body.responseText === "string" ? body.responseText.trim() : "";

  if (!userId || !VALID_STEPS.includes(step)) {
    return NextResponse.json({ error: "Missing or invalid userId/step." }, { status: 400 });
  }
  if (!responseText) {
    return NextResponse.json({ error: "This field is required." }, { status: 400 });
  }
  if (responseText.length > MAX_RESPONSE_LENGTH) {
    return NextResponse.json({ error: "That answer is too long." }, { status: 400 });
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
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
  if (!assignment) {
    return NextResponse.json({ error: "That module was not assigned to you." }, { status: 404 });
  }

  if (step === "check_in") {
    const { data: moduleContent, error: contentError } = await supabaseAdmin
      .from("module_content")
      .select("check_in_delay_days")
      .eq("module_id", moduleId)
      .maybeSingle();

    if (contentError || !moduleContent) {
      console.error("Module content lookup failed:", contentError?.message);
      return NextResponse.json({ error: "Could not save." }, { status: 500 });
    }

    const availableAt = new Date(assignment.assigned_at);
    availableAt.setDate(availableAt.getDate() + moduleContent.check_in_delay_days);
    if (new Date() < availableAt) {
      return NextResponse.json({ error: "This check-in is not available yet." }, { status: 400 });
    }
  }

  const { error: upsertError } = await supabaseAdmin.from("reflection_responses").upsert(
    {
      user_id: userId,
      module_id: moduleId,
      step,
      response_text: responseText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_id,step" }
  );

  if (upsertError) {
    console.error("Reflection response save failed:", upsertError.message);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }

  const nextStatus = step === "check_in" ? "completed" : assignment.status === "assigned" ? "in_progress" : assignment.status;

  if (nextStatus !== assignment.status) {
    const { error: statusError } = await supabaseAdmin
      .from("module_assignments")
      .update({ status: nextStatus })
      .eq("user_id", userId)
      .eq("module_id", moduleId);

    if (statusError) console.error("Module status update failed:", statusError.message);
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
