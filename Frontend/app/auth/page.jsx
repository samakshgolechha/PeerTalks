"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { apiUrl } from "@/lib/api";
import ParallaxStarfield3D from "@/components/LandingPage/ParallaxStarfield3D";
import logo from "public/image/logo.png";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Country Code state for phone number
  const [countryCode, setCountryCode] = useState("+91");

  // Touch & Mouse Light Emission on outer box
  const [boxLight, setBoxLight] = useState({ x: 50, y: 30, isInteracting: false });

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBoxLight({ x, y, isInteracting: true });
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
    setBoxLight({ x, y, isInteracting: true });
  };

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    cpassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg("");
    setSuccessMsg("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      username: "",
      email: "",
      phone: "",
      password: "",
      cpassword: "",
    });
  };

  // ── Handle Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        const identifier = formData.username.trim();
        const password = formData.password;

        if (!identifier || !password) {
          setErrorMsg("Please provide your username/email and password.");
          setLoading(false);
          return;
        }

        let res;
        try {
          res = await axios.post(apiUrl("/api/login"), { identifier, password });
        } catch (err) {
          setErrorMsg(err.response?.data?.message || "Login failed. Please check your connection and try again.");
          setLoading(false);
          return;
        }

        if (res.data && res.data.success) {
          localStorage.setItem("username", res.data.username || identifier);
          localStorage.setItem("password", password); // kept for legacy chat auth compat
          router.push("/chat");
        } else {
          setErrorMsg(res.data?.message || "Invalid username or password. Please try again.");
        }
      } else if (mode === "signup") {
        const { username, email, phone, password, cpassword } = formData;

        if (!username || !email || !phone || !password) {
          setErrorMsg("Please fill out all required fields.");
          setLoading(false);
          return;
        }

        if (password !== cpassword) {
          setErrorMsg("Passwords do not match.");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMsg("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        const formattedPhone = `${countryCode} ${phone.trim()}`;

        let res;
        try {
          res = await axios.post(apiUrl("/api/register"), {
            username: username.trim(),
            email: email.trim().toLowerCase(),
            phone: formattedPhone,
            password,
          });
        } catch (err) {
          console.error("Registration Error details:", err);
          setErrorMsg(err.response?.data?.message || `Connection error: ${err.message}. Please ensure backend is reachable.`);
          setLoading(false);
          return;
        }

        if (res.data && res.data.success) {
          setSuccessMsg("Account created successfully! Redirecting to sign in...");
          setTimeout(() => {
            switchMode("login");
          }, 1500);
        } else {
          setErrorMsg(res.data?.message || "Registration failed. Please try again.");
        }
      } else if (mode === "forgot") {
        const email = formData.email.trim();
        if (!email) {
          setErrorMsg("Please enter your email address.");
          setLoading(false);
          return;
        }

        try {
          const res = await axios.post(apiUrl("/api/auth/forgot-password"), { email });
          if (res.data && res.data.success) {
            setSuccessMsg("Password reset link has been sent to your email.");
          } else {
            setErrorMsg(res.data?.message || "Could not process request. Please try again.");
          }
        } catch (err) {
          setSuccessMsg("If that email is registered, a password reset link has been sent.");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrorMsg(
        error.response?.data?.message ||
        "An unexpected error occurred. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* ── Background Atmosphere with 3D Infinite Starfield (Pure Dark Space) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ParallaxStarfield3D
          starColor="#ffffff"
          accentColor="#e4e4e7"
          starDensity={320}
        />

        {/* Fine Noise Texture for studio finish */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      {/* ── Obsidian Studio Card with Interactive Touch/Hover Light Emission ── */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handlePointerMove}
        onTouchStart={() => setBoxLight((prev) => ({ ...prev, isInteracting: true }))}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setBoxLight((prev) => ({ ...prev, isInteracting: false }))}
        onMouseLeave={() => setBoxLight((prev) => ({ ...prev, isInteracting: false }))}
        className={`relative z-10 w-full max-w-[420px] rounded-[28px] bg-[#0a0a0d]/90 backdrop-blur-2xl border transition-all duration-300 p-7 sm:p-9 ${
          boxLight.isInteracting
            ? "border-purple-500/35 shadow-[0_0_50px_rgba(168,85,247,0.18),0_25px_60px_-15px_rgba(0,0,0,0.95)]"
            : "border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_1px_1px_rgba(255,255,255,0.05)_inset]"
        }`}
      >
        {/* Dynamic Light Emission Layer Following Touch / Mouse */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[28px] transition-opacity duration-300 overflow-hidden"
          style={{
            opacity: boxLight.isInteracting ? 1 : 0.2,
            background: `radial-gradient(400px circle at ${boxLight.x}% ${boxLight.y}%, rgba(168, 85, 247, 0.2), rgba(126, 34, 206, 0.06) 35%, transparent 75%)`,
          }}
        />

        {/* Top 1px Specular Edge Highlight */}
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* 1. Brand Logo */}
        <div className="relative z-10 flex flex-col items-center text-center mb-6">
          <Link
            href="/"
            className="group inline-flex items-center justify-center p-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06] transition-all duration-200"
          >
            <Image
              src={logo}
              alt="PeerTalks"
              className="h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Header Title with User's WELCOME */}
          <div className="mt-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {mode === "login" && "WELCOME"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
            </h1>
            <p className="text-xs sm:text-[13px] text-zinc-400 mt-1 font-normal leading-relaxed">
              {mode === "login" && "Enter your credentials to access your chats"}
              {mode === "signup" && "Connect and talk with your peers in real time"}
              {mode === "forgot" && "We'll send a secure password reset link"}
            </p>
          </div>
        </div>

        {/* 2. Segmented Pill Tabs */}
        {mode !== "forgot" && (
          <div className="relative z-10 mb-6 p-1 rounded-full bg-zinc-900/80 border border-white/[0.06] flex items-center">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`relative z-10 flex-1 py-1.5 text-xs font-medium tracking-wide transition-colors duration-150 ${mode === "login" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
              {mode === "login" && (
                <motion.div
                  layoutId="activeAuthPill"
                  className="absolute inset-0 rounded-full bg-white/[0.1] border border-white/[0.12] shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`relative z-10 flex-1 py-1.5 text-xs font-medium tracking-wide transition-colors duration-150 ${mode === "signup" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
              {mode === "signup" && (
                <motion.div
                  layoutId="activeAuthPill"
                  className="absolute inset-0 rounded-full bg-white/[0.1] border border-white/[0.12] shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">Create Account</span>
            </button>
          </div>
        )}

        {/* ── Feedback Banner ── */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="relative z-10 overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-300 text-xs leading-snug">
                <svg className="w-4 h-4 flex-shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="relative z-10 overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs leading-snug">
                <svg className="w-4 h-4 flex-shrink-0 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMsg}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Form Inputs with Fully Visible Z-10 Icons & Zero Silver Tap Flash ── */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div
                key="login-fields"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                className="space-y-3.5"
              >
                {/* Username or Email */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-3">
                    Username or Email
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Enter your username or email"
                      style={{
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                        caretColor: "#c084fc",
                      }}
                      className="w-full pl-11 pr-5 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-white text-sm placeholder-zinc-500 outline-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-colors duration-150 backdrop-blur-sm"
                    />
                    <svg
                      className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-400 pointer-events-none transition-colors duration-150"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-3 mr-2">
                    <label className="text-xs font-medium text-zinc-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors focus:outline-none font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      style={{
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                        caretColor: "#c084fc",
                      }}
                      className="w-full pl-11 pr-12 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-white text-sm placeholder-zinc-500 outline-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-colors duration-150 backdrop-blur-sm"
                    />
                    <svg
                      className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-400 pointer-events-none transition-colors duration-150"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {mode === "signup" && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                {/* Username */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 ml-3">
                    Username
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Choose a username"
                      style={{
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                        caretColor: "#c084fc",
                      }}
                      className="w-full pl-11 pr-5 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-white text-sm placeholder-zinc-500 outline-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-colors duration-150 backdrop-blur-sm"
                    />
                    <svg
                      className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-400 pointer-events-none transition-colors duration-150"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 ml-3">
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@example.com"
                      style={{
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                        caretColor: "#c084fc",
                      }}
                      className="w-full pl-11 pr-5 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-white text-sm placeholder-zinc-500 outline-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-colors duration-150 backdrop-blur-sm"
                    />
                    <svg
                      className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-400 pointer-events-none transition-colors duration-150"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Phone Number with Country Code Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 ml-3">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Country Code Select */}
                    <div className="relative flex-shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="appearance-none pl-3.5 pr-7 py-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 cursor-pointer backdrop-blur-sm transition-colors duration-150"
                        style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                      >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                      </select>
                      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Phone Input */}
                    <div className="relative flex-1 group">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="(555) 000-0000"
                        style={{
                          outline: "none",
                          WebkitTapHighlightColor: "transparent",
                          caretColor: "#c084fc",
                        }}
                        className="w-full pl-11 pr-5 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-white text-sm placeholder-zinc-500 outline-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-colors duration-150 backdrop-blur-sm"
                      />
                      <svg
                        className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-400 pointer-events-none transition-colors duration-150"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 ml-3">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Minimum 6 characters"
                      style={{
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                        caretColor: "#c084fc",
                      }}
                      className="w-full pl-11 pr-12 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-white text-sm placeholder-zinc-500 outline-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-colors duration-150 backdrop-blur-sm"
                    />
                    <svg
                      className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-400 pointer-events-none transition-colors duration-150"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 ml-3">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="cpassword"
                      value={formData.cpassword}
                      onChange={handleChange}
                      required
                      placeholder="Re-enter password"
                      style={{
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                        caretColor: "#c084fc",
                      }}
                      className="w-full pl-11 pr-12 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-white text-sm placeholder-zinc-500 outline-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-colors duration-150 backdrop-blur-sm"
                    />
                    <svg
                      className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-400 pointer-events-none transition-colors duration-150"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none p-1"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {mode === "forgot" && (
              <motion.div
                key="forgot-fields"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-3">
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your registered email"
                      style={{
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                        caretColor: "#c084fc",
                      }}
                      className="w-full pl-11 pr-5 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-white text-sm placeholder-zinc-500 outline-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-colors duration-150 backdrop-blur-sm"
                    />
                    <svg
                      className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-400 pointer-events-none transition-colors duration-150"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Submit Button: Compact, Centered with Circular Arrow Right Next to It ── */}
          <div className="pt-1 flex justify-center">
            <motion.button
              whileHover="hover"
              whileTap={{ scale: 0.97 }}
              initial="idle"
              type="submit"
              disabled={loading}
              className="group relative inline-flex items-center justify-center gap-2.5 cursor-pointer select-none bg-white text-[#0a0a0a] font-semibold text-xs tracking-wide rounded-full transition-all duration-200 py-2 px-5 shadow-lg"
              style={{
                borderRadius: 9999,
                boxShadow:
                  "0px 2px 8px -1px rgba(0, 0, 0, 0.4), 0px 0px 15px rgba(255, 255, 255, 0.2)",
              }}
            >
              <span>
                {loading
                  ? "Processing..."
                  : mode === "login"
                    ? "Sign In"
                    : mode === "signup"
                      ? "Create Account"
                      : "Send Reset Link"}
              </span>

              {/* Compact Circular Dark Arrow Disc directly next to text */}
              <motion.div
                className="relative flex items-center justify-center rounded-full bg-[#0a0a0a] text-white flex-shrink-0"
                style={{
                  width: 24,
                  height: 24,
                  boxShadow:
                    "0px 1px 3px rgba(0,0,0,0.3)",
                }}
                variants={{
                  idle: { scale: 1 },
                  hover: { scale: 1.08 },
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              >
                {loading ? (
                  <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <motion.svg
                    width="10"
                    height="10"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    variants={{
                      idle: { rotate: 0, scale: 1 },
                      hover: { rotate: -45, scale: 1.15 },
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                  >
                    <path
                      d="M10.653 7.875L0 7.875L0 6.125L10.653 6.125L5.753 1.225L7 0L14 7L7 14L5.753 12.775L10.653 7.875Z"
                      fill="white"
                    />
                  </motion.svg>
                )}
              </motion.div>
            </motion.button>
          </div>
        </form>

        {/* ── Mode Switching Shortcut for Forgot Password ── */}
        {mode === "forgot" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors focus:outline-none"
            >
              <span>← Back to login</span>
            </button>
          </div>
        )}

        {/* ── Social OAuth Section with Seamless Gradient Lines (No black cut-out box) ── */}
        {mode !== "forgot" && (
          <div className="relative z-10 mt-5">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-800 to-zinc-800" />
              <span className="text-[10.5px] uppercase tracking-wider text-zinc-400/80 font-medium whitespace-nowrap select-none">
                or continue with
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-zinc-800 to-zinc-800" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = apiUrl("/api/auth/google");
                }}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 active:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-150 text-xs text-zinc-200 font-medium group"
              >
                <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                <span>Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = apiUrl("/api/auth/github");
                }}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 active:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-150 text-xs text-zinc-200 font-medium group"
              >
                <svg className="w-3.5 h-3.5 fill-white transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Secure Note ── */}
        <p className="relative z-10 mt-5 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5 font-normal">
          <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>End-to-end encrypted & secure</span>
        </p>
      </motion.div>
    </div>
  );
}
