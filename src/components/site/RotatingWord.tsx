"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, [words.length]);

  if (!words.length) return null;

  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-semibold text-fg underline decoration-accent decoration-2 underline-offset-[6px]"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
