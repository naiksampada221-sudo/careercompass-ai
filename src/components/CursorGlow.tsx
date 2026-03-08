import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 200 });
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, [visible]);

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-50 mix-blend-screen"
      style={{
        x: smoothX,
        y: smoothY,
        width: 500,
        height: 500,
        marginLeft: -250,
        marginTop: -250,
        background: "radial-gradient(circle, hsla(258, 90%, 65%, 0.06) 0%, transparent 70%)",
        opacity: visible ? 1 : 0,
      }}
      transition={{ opacity: { duration: 0.3 } }}
    />
  );
}
