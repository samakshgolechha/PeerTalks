"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AnimatedLiquidBackground from "./AnimatedLiquidBackground";
import CTAButton from "./CTAButton";
import logo from "public/image/logo.png";
import { apiUrl } from "@/lib/api";

export default function Hero() {
  const router = useRouter();

  // Auto-login check
  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (username && password) {
      axios
        .post(apiUrl("/api/login"), { username, password })
        .then((response) => {
          if (response.data.success) {
            router.push("/chat");
          }
        })
        .catch((error) => console.log(error));
    }
  }, []);

  /* ── Animation variants ── */
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.4 },
    },
  };

  const fadeBlur = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#050507] flex items-center justify-center">
      {/* ── Animated Liquid Background ── */}
      <AnimatedLiquidBackground
        preset="PeerTalks"
        speed={25}
        className="z-0"
      />

      {/* Noise overlay for texture */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Top/bottom vignette */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#050507]/80 to-transparent z-[2] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050507]/80 to-transparent z-[2] pointer-events-none" />

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <div className="backdrop-blur-md bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 inline-block">
            <Image
              src={logo}
              alt="PeerTalks"
              className="h-10 sm:h-12 w-auto"
              priority
            />
          </div>
        </motion.div>

        {/* Headline — kept small and elegant */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <motion.h1
            variants={fadeBlur}
            className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-snug tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className="text-white/80">Where minds </span>
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent font-bold">
              meet
            </span>
            <span className="text-white/80">,</span>
          </motion.h1>

          <motion.h1
            variants={fadeBlur}
            className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-snug tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className="text-white/80">Ideas </span>
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent font-bold">
              greet
            </span>
            <span className="text-white/80"> and</span>
          </motion.h1>

          <motion.h1
            variants={fadeBlur}
            className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-snug tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className="text-white/80">Conversations take the </span>
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent font-bold">
              lead
            </span>
          </motion.h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.9 }}
          className="text-sm sm:text-base text-white/35 max-w-md mx-auto mb-10 leading-relaxed font-light"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Connect with peers, share ideas, and build meaningful conversations,
          all in real time.
        </motion.p>

        {/* CTA Buttons — Framer-style */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <CTAButton label="Get Started" href="/auth" variant="primary" />
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span
            className="text-white/15 text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Scroll
          </span>
          <div className="w-4 h-7 rounded-full border border-white/10 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1 h-1 rounded-full bg-purple-400/50"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
