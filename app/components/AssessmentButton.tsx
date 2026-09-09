import Link from "next/link";
import content from "../../content.json";

type AssessmentButtonProps = {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
};

export default function AssessmentButton({
  className = "",
  compact = false,
  onClick,
}: AssessmentButtonProps) {
  return (
    <Link
      href="/assessment"
      onClick={onClick}
      className={`group inline-flex items-center rounded-full bg-accent font-body font-medium tracking-wide text-paper transition-all duration-300 ease-out hover:bg-accent-hover active:bg-accent-press ${
        compact
          ? "gap-1.5 px-3.5 py-1.5 text-[0.75rem] shadow-[var(--shadow-cta-compact)] hover:shadow-[var(--shadow-cta-compact-hover)]"
          : "gap-2.5 px-8 py-4 text-[0.95rem] shadow-[var(--shadow-cta)] hover:shadow-[var(--shadow-cta-hover)]"
      } ${className}`}
    >
      {content.site.hero.buttonLabel}
      <span
        aria-hidden="true"
        className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
      >
        &rarr;
      </span>
    </Link>
  );
}
