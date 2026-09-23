"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: 1.4, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{n}</span>;
}

export function Stats({ label, items }: { label: string; items: { value: number; suffix?: string; label: string }[] }) {
  return (
    <section aria-label={label} className="border-y border-line bg-elev/40">
      <dl className="container-page grid grid-cols-2 md:grid-cols-4">
        {items.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col-reverse px-2 py-8 md:py-10 ${i % 2 ? "border-l border-line" : ""} ${i >= 2 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
          >
            <dt className="mt-1 text-sm text-muted md:px-6">{s.label}</dt>
            <dd className="font-display text-4xl font-semibold tracking-tight md:px-6 md:text-5xl">
              <Counter value={s.value} />
              <span className="text-accent">{s.suffix}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
