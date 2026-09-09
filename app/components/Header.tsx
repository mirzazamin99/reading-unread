"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import content from "../../content.json";
import AssessmentButton from "./AssessmentButton";
import ThemeToggle, { useTheme } from "./ThemeToggle";
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from "./icons";

const { nav } = content.site;

const NAV_LINKS = [
  { href: "/#how-it-works", label: nav.howItWorks },
  { href: "/#who-its-for", label: nav.whoItsFor },
  { href: "/services", label: nav.services },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    // Reads a value an external system (localStorage) already holds before
    // this component's first render -- exactly the case this rule means to
    // allow.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedUserId(localStorage.getItem("lifeAssessmentUserId"));
    } catch {
      // storage unavailable -- the link just won't show
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-edge/70 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-12 md:py-5">
        <Link
          href="/"
          onClick={closeMenu}
          className="font-display text-lg tracking-tight text-foreground md:text-xl"
        >
          {nav.wordmark}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground-dim transition-colors duration-300 ease-out hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {savedUserId && (
            <Link
              href={`/modules?userId=${savedUserId}`}
              className="text-sm font-medium text-foreground-dim transition-colors duration-300 ease-out hover:text-foreground"
            >
              {nav.yourModules}
            </Link>
          )}
          <Link
            href="/#consultation"
            className="text-sm font-medium text-foreground-dim transition-colors duration-300 ease-out hover:text-foreground"
          >
            {nav.secondaryCta}
          </Link>
          <AssessmentButton compact />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center text-foreground"
          >
            {menuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          style={{ height: "100dvh" }}
          className="fixed inset-0 top-0 z-40 flex animate-[rise_0.35s_cubic-bezier(0.16,1,0.3,1)_backwards] flex-col bg-surface pt-[4.5rem] md:hidden"
        >
          <nav className="flex flex-col px-6 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="border-b border-edge py-5 font-display text-2xl text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-6 pb-10 pt-6">
            <button
              type="button"
              onClick={toggle}
              className="mb-4 flex w-full items-center justify-between rounded-2xl bg-surface-tint px-5 py-4 text-foreground"
            >
              <span className="text-sm font-medium">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </span>
              {theme === "dark" ? (
                <SunIcon className="h-[1.1rem] w-[1.1rem]" />
              ) : (
                <MoonIcon className="h-[1.1rem] w-[1.1rem]" />
              )}
            </button>
            <AssessmentButton className="w-full justify-center" onClick={closeMenu} />
            {savedUserId && (
              <Link
                href={`/modules?userId=${savedUserId}`}
                onClick={closeMenu}
                className="mt-4 block text-center text-sm font-medium text-foreground-dim underline-offset-4 hover:underline"
              >
                {nav.yourModules}
              </Link>
            )}
            <Link
              href="/#consultation"
              onClick={closeMenu}
              className="mt-4 block text-center text-sm font-medium text-foreground-dim underline-offset-4 hover:underline"
            >
              {nav.secondaryCta}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
