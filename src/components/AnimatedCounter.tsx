import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  value: string;
  className?: string;
}

export default function AnimatedCounter({ value, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  // Extract numeric part and suffix
  const match = value.match(/^([\d.]+)(.*)$/);
  const numericTarget = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const isNumeric = !!match;

  useEffect(() => {
    if (!isInView || !isNumeric) {
      if (!isNumeric) setDisplay(value);
      return;
    }

    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numericTarget);
      setDisplay(`${current}${suffix}`);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, value, isNumeric, numericTarget, suffix]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {display}
    </motion.span>
  );
}
