"use client";

import { useEffect, useRef } from "react";

/**
 * ParallaxStarfield3D
 *
 * Immersive 3D starfield animation where stars travel toward the camera
 * while smoothly responding to mouse movements with realistic parallax depth.
 *
 * @param {string} starColor - Base color of stars (default "#ffffff")
 * @param {string} accentColor - Color of closer/brighter accent stars (default "#c084fc")
 * @param {number} starDensity - Total star count (default 320)
 * @param {number} travelSpeed - Speed of stars traveling forward (default 1.2)
 * @param {number} parallaxStrength - Mouse parallax response strength (default 0.08)
 * @param {number} fov - Field of view depth (default 300)
 * @param {string} className - Additional CSS classes
 */
export default function ParallaxStarfield3D({
  starColor = "#ffffff",
  accentColor = "#c084fc",
  starDensity = 320,
  travelSpeed = 1.2,
  parallaxStrength = 0.08,
  fov = 320,
  className = "",
}) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const maxZ = 1000;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Initialize stars if empty or resized
      if (starsRef.current.length === 0) {
        initStars();
      }
    };

    const initStars = () => {
      const stars = [];
      const spreadX = width * 1.5;
      const spreadY = height * 1.5;

      for (let i = 0; i < starDensity; i++) {
        stars.push({
          x: (Math.random() - 0.5) * spreadX,
          y: (Math.random() - 0.5) * spreadY,
          z: Math.random() * maxZ,
          pz: 0, // previous z for motion trailing
          baseSize: Math.random() * 1.4 + 0.6,
          isAccent: Math.random() < 0.22, // 22% purple accent stars
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    resize();

    // Resize observer for responsive bounds
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas.parentElement || canvas);

    // Mouse movement listener for parallax
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      // Normalized between -1 and 1
      mouseRef.current.targetX = ((clientX / width) - 0.5) * 2;
      mouseRef.current.targetY = ((clientY / height) - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const cx = width / 2;
      const cy = height / 2;
      const stars = starsRef.current;
      const spreadX = width * 1.5;
      const spreadY = height * 1.5;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Store previous Z for motion streak
        star.pz = star.z;

        // Move star forward toward viewer
        star.z -= travelSpeed;

        // Recycle star when it passes the camera
        if (star.z <= 0) {
          star.z = maxZ;
          star.pz = maxZ;
          star.x = (Math.random() - 0.5) * spreadX;
          star.y = (Math.random() - 0.5) * spreadY;
          star.baseSize = Math.random() * 1.4 + 0.6;
        }

        // Parallax offset based on depth (closer stars shift more)
        const depthFactor = (1 - star.z / maxZ);
        const offsetX = -mouse.x * width * parallaxStrength * depthFactor;
        const offsetY = -mouse.y * height * parallaxStrength * depthFactor;

        // 3D Perspective projection
        const k = fov / star.z;
        const x = cx + (star.x + offsetX) * k;
        const y = cy + (star.y + offsetY) * k;

        // Check if star is inside canvas viewport
        if (x < -20 || x > width + 20 || y < -20 || y > height + 20) {
          continue;
        }

        // Calculate size and opacity
        const size = Math.max(0.4, star.baseSize * k * 0.9);
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = 0.85 + Math.sin(star.twinklePhase) * 0.15;
        const alpha = Math.min(1, Math.max(0.05, depthFactor * 1.2 * twinkle));

        // Subtle motion streak from previous position
        const prevK = fov / star.pz;
        const px = cx + (star.x + offsetX) * prevK;
        const py = cy + (star.y + offsetY) * prevK;

        ctx.beginPath();
        ctx.strokeStyle = star.isAccent ? accentColor : starColor;
        ctx.fillStyle = star.isAccent ? accentColor : starColor;
        ctx.globalAlpha = alpha;

        if (travelSpeed > 1.5 && Math.hypot(x - px, y - py) > 0.8) {
          // Draw subtle motion streak for faster stars
          ctx.lineWidth = size * 0.8;
          ctx.lineCap = "round";
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
        } else {
          // Draw crisp circle
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Soft halo glow for closer/larger accent stars
        if (star.isAccent && size > 1.8) {
          ctx.beginPath();
          ctx.globalAlpha = alpha * 0.25;
          ctx.arc(x, y, size * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = accentColor;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [starColor, accentColor, starDensity, travelSpeed, parallaxStrength, fov]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ display: "block" }}
    />
  );
}
