"use client";

import { useState } from "react";
import content from "../../../../content.json";

const { modules: copy } = content.admin;

const textareaClass =
  "mt-2 block w-full rounded-xl border border-edge bg-surface-tint/60 px-4 py-3 text-base leading-relaxed text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none transition-all duration-300 ease-out focus-visible:border-accent-hover focus-visible:shadow-[var(--shadow-glow)]";
const inputClass =
  "mt-2 block w-full max-w-[10rem] rounded-xl border border-edge bg-surface-tint/60 px-4 py-3 text-base text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none transition-all duration-300 ease-out focus-visible:border-accent-hover focus-visible:shadow-[var(--shadow-glow)]";

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
    <div className="mt-10 space-y-7">
      <label className="block">
        <span className="text-sm font-medium text-foreground-dim">{copy.nameLabel}</span>
        <input
          type="text"
          value={fields.name}
          onChange={(e) => update("name", e.target.value)}
          className={textareaClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground-dim">{copy.introLabel}</span>
        <textarea
          value={fields.intro}
          onChange={(e) => update("intro", e.target.value)}
          rows={4}
          className={textareaClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground-dim">{copy.coreLessonLabel}</span>
        <textarea
          value={fields.core_lesson}
          onChange={(e) => update("core_lesson", e.target.value)}
          rows={8}
          className={textareaClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground-dim">{copy.reflectionPromptLabel}</span>
        <textarea
          value={fields.reflection_prompt}
          onChange={(e) => update("reflection_prompt", e.target.value)}
          rows={2}
          className={textareaClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground-dim">{copy.microActionLabel}</span>
        <textarea
          value={fields.micro_action}
          onChange={(e) => update("micro_action", e.target.value)}
          rows={3}
          className={textareaClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground-dim">{copy.checkInQuestionLabel}</span>
        <textarea
          value={fields.check_in_question}
          onChange={(e) => update("check_in_question", e.target.value)}
          rows={2}
          className={textareaClass}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground-dim">{copy.checkInDelayLabel}</span>
        <input
          type="number"
          min={0}
          value={fields.check_in_delay_days}
          onChange={(e) => update("check_in_delay_days", Number(e.target.value))}
          className={inputClass}
        />
      </label>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium tracking-wide text-paper shadow-[0_14px_28px_-12px_rgba(130,35,47,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_20px_38px_-10px_rgba(154,44,58,0.6)] active:translate-y-0 active:bg-accent-press disabled:opacity-60"
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
