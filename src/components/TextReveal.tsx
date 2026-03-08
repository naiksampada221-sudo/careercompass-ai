import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function TextReveal({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.div
        variants={{
          hidden: { y: "100%", opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.6,
              delay,
              ease: [0.22, 1, 0.36, 1],
            },
          },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
