"use client";
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * CTAButton — Inspired by Framer's CTA Action Button.
 * Pill-shaped button with text + circular arrow icon.
 * On hover: the circle expands to fill the button and the arrow rotates.
 *
 * @param {string} label - Button text
 * @param {string} href - Link destination
 * @param {"primary"|"ghost"} variant - Button style
 */
export default function CTAButton({
  label = "Get Started",
  href = "/register",
  variant = "primary",
}) {
  const isPrimary = variant === "primary";

  return (
    <Link href={href}>
      <motion.div
        className="group relative flex items-center gap-3 cursor-pointer select-none"
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        initial="idle"
        style={{
          padding: isPrimary ? "6px 6px 6px 20px" : "6px 6px 6px 18px",
          borderRadius: 33,
          background: isPrimary
            ? "rgba(255, 255, 255, 1)"
            : "rgba(255, 255, 255, 0.06)",
          border: isPrimary
            ? "none"
            : "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: isPrimary
            ? "0px 1px 1px -0.75px rgba(196, 196, 196, 0.22), 0px 1.7px 1.7px -1.5px rgba(196, 196, 196, 0.21), 0px 3.7px 3.7px -2.25px rgba(196, 196, 196, 0.2), 0px 8.3px 8.3px -3px rgba(196, 196, 196, 0.17), 0px 21px 21px -3.75px rgba(196, 196, 196, 0.08)"
            : "none",
        }}
      >
        {/* Button label */}
        <motion.span
          className="relative z-10 text-sm font-semibold tracking-wide"
          style={{
            color: isPrimary ? "#0a0a0a" : "rgba(255, 255, 255, 0.7)",
            fontFamily: "'Inter', sans-serif",
          }}
          variants={{
            idle: {},
            hover: {
              color: isPrimary ? "#0a0a0a" : "rgba(255, 255, 255, 0.9)",
            },
          }}
        >
          {label}
        </motion.span>

        {/* Arrow circle */}
        <motion.div
          className="relative flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: isPrimary ? "#0a0a0a" : "rgba(255, 255, 255, 0.08)",
            boxShadow: isPrimary
              ? "0px 0.66px 0.4px -0.58px rgba(0,0,0,0.22), 0px 2.5px 1.5px -1.17px rgba(0,0,0,0.25), 0px 11px 6.6px -1.75px rgba(0,0,0,0.39)"
              : "none",
          }}
          variants={{
            idle: { width: 36 },
            hover: { width: 40 },
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        >
          <motion.svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            variants={{
              idle: { rotate: 0, scale: 1 },
              hover: { rotate: -45, scale: 1.15 },
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          >
            <path
              d="M10.653 7.875L0 7.875L0 6.125L10.653 6.125L5.753 1.225L7 0L14 7L7 14L5.753 12.775L10.653 7.875Z"
              fill={isPrimary ? "white" : "rgba(255, 255, 255, 0.7)"}
            />
          </motion.svg>
        </motion.div>
      </motion.div>
    </Link>
  );
}
