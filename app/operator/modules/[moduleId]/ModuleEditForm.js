"use client";

import { useState } from "react";
import content from "../../../../content.json";

const { modules: copy } = content.admin;

const textareaClass =
  "mt-2 block w-full rounded-xl border border-edge bg-surface-tint/60 px-4 py-3 text-base leading-relaxed text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none transition-all duration-300 ease-out focus-visible:border-accent-hover focus-visible:shadow-[var(--shadow-glow)]";
const inputClass =
  "mt-2 block w-full max-w-[8rem] rounded-xl border border-edge bg-surface-tint/60 px-4 py-3 text-base text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none transition-all duration-300 ease-out focus-visible:border-accent-hover focus-visible:shadow-[var(--shadow-glow)]";

const STEP_FIELDS = [
  { key: "intro", label: copy.introLabel, rows: 4 },
  { key: "core_lesson", label: copy.coreLessonLabel, rows: 8 },
  { key: "reflection_prompt", label: copy.reflectionPromptLabel, rows: 2 },
  { key: "micro_action", label: copy.microActionLabel, rows: 3 },
  { key: "check_in_question", label: copy.checkInQuestionLabel, rows: 2 },
];

export default function ModuleEditForm({ module }) {
  const [fields, setFields] = useState({
    name: module.name,
    intro: module.intro,
    core_lesson: module.core_lesson,
    reflection_prompt: module.reflection_prompt,
    micro_action: module.micro_action,
    check_in_question: module.check_in_question,
    check_in_delay_days: module.check_in_delay_days,
  });
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  function update(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setSaveState("idle");
  }

  async function handleSave() {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/operator/modules/${module.module_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="mt-10">
      <label className="block">
        <span className="text-sm font-medium text-foreground-dim">{copy.nameLabel}</span>
        <input
          type="text"
          value={fields.name}
          onChange={(e) => update("name", e.target.value)}
          className={textareaClass}
        />
      </label>

      <h2 className="mt-12 text-xs font-semibold uppercase tracking-widest text-foreground-faint">
        The five steps
      </h2>
      <div className="mt-4 divide-y divide-edge border-t border-edge">
        {STEP_FIELDS.map((field, i) => (
          <div key={field.key} className="grid grid-cols-[2.5rem_1fr] gap-x-5 py-7 first:pt-6">
            <span className="font-tabular flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft font-display text-sm text-accent-text">
              {i + 1}
            </span>
            <label className="block">
              <span className="text-sm font-medium text-foreground-dim">{field.label}</span>
              <textarea
                value={fields[field.key]}
                onChange={(e) => update(field.key, e.target.value)}
                rows={field.rows}
                className={textareaClass}
              />
            </label>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xs font-semibold uppercase tracking-widest text-foreground-faint">
        Timing
      </h2>
      <div className="mt-4 border-t border-edge pt-6">
        <label className="block">
          <span className="text-sm font-medium text-foreground-dim">{copy.checkInDelayLabel}</span>
          <input
            type="number"
            min={0}
            value={fields.check_in_delay_days}
            onChange={(e) => update("check_in_delay_days", Number(e.target.value))}
            className={inputClass}
          />
          <span className="mt-2 block text-sm text-foreground-faint">
            The check-in step stays locked until this many days after the module is assigned.
          </span>
        </label>
      </div>

      <div className="mt-10 flex items-center gap-4 border-t border-edge pt-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium tracking-wide text-paper shadow-[var(--shadow-cta)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[var(--shadow-cta-hover-lg)] active:translate-y-0 active:bg-accent-press disabled:opacity-60"
        >
          {saveState === "saving" ? copy.savingLabel : copy.saveLabel}
        </button>
        {saveState === "saved" && (
          <span className="text-sm font-medium text-foreground-dim">{copy.savedLabel}</span>
        )}
        {saveState === "error" && (
          <span className="text-sm font-medium text-accent-text">{copy.saveErrorLabel}</span>
        )}
      </div>
    </div>
  );
}
