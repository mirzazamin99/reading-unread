import content from "../../content.json";
import BookButton from "../components/BookButton";
import AssessmentButton from "../components/AssessmentButton";
import Reveal from "../components/Reveal";
import { CheckIcon } from "../components/icons";

const { hero, credibility, protocol, method, audience, closing } = content.site;

export default function Home() {
  return (
    <main>
      {/* Hero — first viewport thesis, the reading itself is the hook */}
      <section className="mx-auto max-w-[1000px] px-6 pt-20 pb-24 text-center md:px-12 md:pt-36 md:pb-40">
        <h1 className="mx-auto max-w-[20ch] animate-[rise_0.9s_cubic-bezier(0.16,1,0.3,1)_backwards] font-display text-[clamp(2.25rem,7vw,5rem)] leading-[1.1] font-medium tracking-[-0.02em] text-foreground">
          {hero.line1}
          <br />
          <em className="text-accent-text not-italic">{hero.line2}</em>
        </h1>
        <p
          style={{ animationDelay: "150ms" }}
          className="mx-auto mt-8 max-w-[52ch] animate-[rise_0.9s_cubic-bezier(0.16,1,0.3,1)_backwards] text-lg leading-relaxed text-foreground-dim md:text-xl"
        >
          {hero.body}
        </p>
        <div
          style={{ animationDelay: "300ms" }}
          className="mt-10 flex animate-[rise_0.9s_cubic-bezier(0.16,1,0.3,1)_backwards] flex-col items-center gap-4"
        >
          <AssessmentButton />
          <BookButton compact className="!bg-transparent !text-foreground-faint !shadow-none hover:!bg-transparent hover:!text-foreground-dim" />
        </div>
      </section>

      {/* Credibility */}
      <section className="bg-surface-tint">
        <div className="mx-auto max-w-[840px] px-6 py-24 md:px-12 md:py-36">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-medium text-foreground md:text-4xl">
              {credibility.heading}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto mt-8 max-w-[62ch] space-y-5 text-lg leading-relaxed text-foreground-dim md:text-xl">
              {credibility.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="mx-auto mt-10 flex max-w-[62ch] flex-wrap justify-center gap-3">
              {credibility.pills.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-edge px-4 py-2 text-sm font-medium text-foreground-dim"
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* The Direction Protocol — Read, Plot, Draft, Revise */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto max-w-[1000px] px-6 py-24 md:px-12 md:py-36">
          <Reveal>
            <p className="text-center font-display text-xl font-medium text-accent-text md:text-2xl">
              {protocol.name}
            </p>
            <h2 className="mt-3 text-center font-display text-3xl font-medium text-foreground md:text-4xl">
              {protocol.heading}
            </h2>
            <p className="mx-auto mt-5 max-w-[56ch] text-center text-lg text-foreground-dim">
              {protocol.intro}
            </p>
          </Reveal>
          <div className="mt-16 divide-y divide-edge border-t border-edge md:mt-20">
            {method.moves.map((move, i) => (
              <Reveal key={move.number} delay={i * 80}>
                <div className="grid grid-cols-[3rem_1fr] items-start gap-x-6 gap-y-3 py-10 md:grid-cols-[4rem_14rem_1fr] md:items-center md:gap-x-10 md:py-12">
                  <span className="font-tabular flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft font-display text-base text-accent-text md:h-12 md:w-12 md:text-lg">
                    {move.number}
                  </span>
                  <div className="md:contents">
                    <h3 className="font-display text-2xl font-medium text-foreground md:col-start-2">
                      {move.title}
                    </h3>
                    <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-foreground-dim md:col-start-3 md:mt-0 md:text-lg">
                      {move.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section id="who-its-for" className="scroll-mt-20 bg-surface-tint">
        <div className="mx-auto max-w-[840px] px-6 py-24 md:px-12 md:py-36">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-medium text-foreground md:text-4xl">
              {audience.heading}
            </h2>
            <p className="mt-5 text-center text-lg text-foreground-dim">{audience.intro}</p>
          </Reveal>
          <Reveal delay={100}>
            <ul className="mx-auto mt-12 max-w-[60ch] space-y-5">
              {audience.items.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-4 text-lg leading-relaxed text-foreground-dim md:text-xl"
                >
                  <CheckIcon className="mt-1.5 h-5 w-5 flex-shrink-0 text-accent-text" />
                  <span>People who {line}.</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA — deliberate contrast band */}
      <section id="consultation" className="bg-cta-band">
        <div className="mx-auto max-w-[900px] px-6 py-28 text-center md:px-12 md:py-44">
          <p className="mx-auto max-w-[22ch] font-display text-4xl leading-[1.1] font-medium text-paper md:text-6xl">
            {closing.heading}
          </p>
          <div className="mt-12 flex flex-col items-center gap-4">
            <AssessmentButton />
            <BookButton compact className="!bg-transparent !text-paper-dim !shadow-none hover:!bg-transparent hover:!text-paper" />
          </div>
        </div>
      </section>
    </main>
  );
}
