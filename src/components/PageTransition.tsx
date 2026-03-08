import { motion } from "framer-motion";
import { ReactNode } from "react";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.97,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.97,
    filter: "blur(6px)",
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  duration: 0.5,
};

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}
