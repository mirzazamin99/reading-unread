import Link from "next/link";
import SignOutButton from "./SignOutButton";
import ThemeToggle from "../components/ThemeToggle";
import content from "../../content.json";

const { queue } = content.admin;

const NAV = [
  { key: "users", href: "/operator", label: "Users" },
  { key: "modules", href: "/operator/modules", label: "Module content" },
];

export default function OperatorHeader({ active }) {
  return (
    <header className="border-b border-edge bg-surface">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-5 md:px-10">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-lg text-foreground md:text-xl">Dr. Aamir</span>
            <span className="text-sm font-medium text-foreground-faint">Admin</span>
          </div>
          <nav className="flex items-center gap-5">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active === item.key ? "page" : undefined}
                className={`text-sm font-medium transition-colors duration-300 ease-out ${
                  active === item.key
                    ? "text-accent-text"
                    : "text-foreground-faint hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton label={queue.signOutLabel} />
        </div>
      </div>
    </header>
  );
}
