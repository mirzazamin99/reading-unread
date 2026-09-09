import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { validateSubmission } from "../../../lib/validate-assessment";
import { routeModules } from "../../../lib/route-modules";
import content from "../../../content.json";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: content.assessment.form.genericError }, { status: 400 });
  }

  const { errors, data } = validateSubmission(body);
  if (errors.length) {
    return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (err) {
    console.error(err.message);
    return NextResponse.json(
      { error: "The server is not set up to store submissions yet." },
      { status: 500 }
    );
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .insert({ name: data.name, email: data.email })
    .select("id")
    .single();

  if (userError || !user?.id) {
    console.error("User insert failed:", userError?.message);
    return NextResponse.json({ error: content.assessment.form.genericError }, { status: 500 });
  }

  const answerRows = Object.entries(data.answers).map(([question_id, answer_text]) => ({
    user_id: user.id,
    question_id,
    answer_text,
  }));

  const { error: answersError } = await supabaseAdmin.from("assessment_answers").insert(answerRows);
  if (answersError) {
    console.error("Assessment answers insert failed:", answersError.message);
    return NextResponse.json({ error: content.assessment.form.genericError }, { status: 500 });
  }

  const moduleIds = routeModules(data.answers);
  const assignmentRows = moduleIds.map((module_id) => ({ user_id: user.id, module_id }));

  const { error: assignError } = await supabaseAdmin.from("module_assignments").insert(assignmentRows);
  if (assignError) {
    console.error("Module assignment insert failed:", assignError.message);
    return NextResponse.json({ error: content.assessment.form.genericError }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId: user.id, moduleIds });
}
