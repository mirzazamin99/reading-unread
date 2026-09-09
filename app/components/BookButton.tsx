type BookButtonProps = {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
};

export default function BookButton({
  className = "",
  compact = false,
  onClick,
}: BookButtonProps) {
  return (
    <a
      href="mailto:hello@draamir.com?subject=Consultation%20Request"
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 rounded-full bg-accent font-body font-medium tracking-wide text-paper shadow-[var(--shadow-cta)] transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-[var(--shadow-cta-hover)] active:bg-accent-press ${compact ? "px-4 py-2 text-[0.8rem]" : "px-8 py-4 text-[0.95rem]"} ${className}`}
    >
      Book a Consultation
      <span
        aria-hidden="true"
        className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
      >
        &rarr;
      </span>
    </a>
  );
}
