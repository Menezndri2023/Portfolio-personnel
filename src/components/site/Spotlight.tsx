"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";

/** Halo lumineux qui suit le pointeur dans le hero. */
export function Spotlight() {
  const x = useMotionValue(70);
  const y = useMotionValue(30);
  const sx = useSpring(x, { stiffness: 60, damping: 20 });
  const sy = useSpring(y, { stiffness: 60, damping: 20 });
  const background = useMotionTemplate`radial-gradient(600px circle at ${sx}% ${sy}%, var(--accent-soft), transparent 65%)`;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set((e.clientX / window.innerWidth) * 100);
      y.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background }} />;
}
