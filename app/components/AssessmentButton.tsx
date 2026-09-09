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
          ? "gap-1.5 px-3.5 py-1.5 text-[0.75rem] shadow-[0_4px_10px_-4px_rgba(130,35,47,0.4)] hover:shadow-[0_6px_14px_-4px_rgba(154,44,58,0.45)]"
          : "gap-2.5 px-8 py-4 text-[0.95rem] shadow-[0_14px_28px_-12px_rgba(130,35,47,0.5)] hover:shadow-[0_18px_34px_-10px_rgba(154,44,58,0.55)]"
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
