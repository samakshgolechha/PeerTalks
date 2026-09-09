"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function CursorDotTrail({
  color = "#c084fc",
  size = 10,
  hoverSize = 25,
  borderWidth = 1.5,
  spring = 0.18,
  friction = 0.52,
  trailDuration = 220,
  transitionSpeed = 0.15,
  zIndex = 5,
}) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const ballRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animRef = useRef();
  const radiusRef = useRef(size / 2);
  const fillOpacityRef = useRef(1);
  const strokeOpacityRef = useRef(0);
  const rgbRef = useRef({ r: 192, g: 132, b: 252 });
  const isRingRef = useRef(false);
  const isVisibleRef = useRef(false);
  const visibilityOpacityRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setMounted(true);
  }, []);

  // Parse color only when it changes, not in the RAF loop
  useEffect(() => {
    const hex = color?.startsWith("#") ? color : "#c084fc";
    let r = 192,
      g = 132,
      b = 252;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    rgbRef.current = { r, g, b };
  }, [color]);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const onMouseMove = (e) => {
      if (!isVisibleRef.current) {
        ballRef.current = { x: e.clientX, y: e.clientY };
        velocityRef.current = { x: 0, y: 0 };
        isVisibleRef.current = true;
      }
      targetRef.current = { x: e.clientX, y: e.clientY };
      isRingRef.current = !!e.target?.closest(
        "a, button, [role='button'], input, textarea, select, [tabindex]:not([tabindex='-1'])"
      );
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
    };

    const onMouseEnter = (e) => {
      ballRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };
      isVisibleRef.current = true;
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    const lerp = (from, to, amt) => from + (to - from) * amt;

    const rgba = (alpha) => {
      const { r, g, b } = rgbRef.current;
      return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
    };

    const animate = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smoothly fade in/out when entering/leaving window
      visibilityOpacityRef.current = lerp(
        visibilityOpacityRef.current,
        isVisibleRef.current ? 1 : 0,
        0.1
      );

      if (visibilityOpacityRef.current > 0.01) {
        // Physics
        const dx = targetRef.current.x - ballRef.current.x;
        const dy = targetRef.current.y - ballRef.current.y;
        velocityRef.current.x += dx * spring;
        velocityRef.current.y += dy * spring;
        velocityRef.current.x *= friction;
        velocityRef.current.y *= friction;
        ballRef.current.x += velocityRef.current.x;
        ballRef.current.y += velocityRef.current.y;

        // Trail history with absolute timestamps (no loop mutation bug)
        const pts = pointsRef.current;
        pts.push({ x: ballRef.current.x, y: ballRef.current.y, time: now });

        const cutoff = now - trailDuration;
        let expiredCount = 0;
        while (expiredCount < pts.length && pts[expiredCount].time < cutoff) {
          expiredCount++;
        }
        if (expiredCount > 0) {
          pointsRef.current = pts.slice(expiredCount);
        }

        const isRing = isRingRef.current;
        const currentPts = pointsRef.current;
        const globalAlpha = visibilityOpacityRef.current;

        // Draw trail line
        if (currentPts.length > 1) {
          ctx.beginPath();
          ctx.moveTo(currentPts[0].x, currentPts[0].y);
          for (let i = 1; i < currentPts.length; i++) {
            ctx.lineTo(currentPts[i].x, currentPts[i].y);
          }

          const oldest = currentPts[0];
          const newest = currentPts[currentPts.length - 1];
          const oldestAge = now - oldest.time;
          const oldestOpacity = Math.max(0, 1 - oldestAge / trailDuration);

          const dist = Math.hypot(newest.x - oldest.x, newest.y - oldest.y);
          if (dist > 1) {
            const gradient = ctx.createLinearGradient(
              oldest.x,
              oldest.y,
              newest.x,
              newest.y
            );
            gradient.addColorStop(0, rgba(oldestOpacity * 0.1 * globalAlpha));
            gradient.addColorStop(1, rgba(0.75 * globalAlpha));
            ctx.strokeStyle = gradient;
          } else {
            ctx.strokeStyle = rgba(0.75 * globalAlpha);
          }

          ctx.lineWidth = Math.max(2, size / 3.5);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }

        // Radius & Opacity morphing
        const targetRadius = isRing ? hoverSize / 2 : size / 2;
        radiusRef.current = lerp(radiusRef.current, targetRadius, transitionSpeed);
        fillOpacityRef.current = lerp(
          fillOpacityRef.current,
          isRing ? 0 : 1,
          transitionSpeed
        );
        strokeOpacityRef.current = lerp(
          strokeOpacityRef.current,
          isRing ? 1 : 0,
          transitionSpeed
        );

        // Draw Cursor Ball / Ring
        ctx.beginPath();
        ctx.arc(
          ballRef.current.x,
          ballRef.current.y,
          radiusRef.current,
          0,
          Math.PI * 2
        );

        if (strokeOpacityRef.current > 0.01) {
          ctx.strokeStyle = rgba(strokeOpacityRef.current * globalAlpha);
          ctx.lineWidth = borderWidth;
          ctx.stroke();
        }

        if (fillOpacityRef.current > 0.01) {
          ctx.fillStyle = rgba(fillOpacityRef.current * globalAlpha);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [
    mounted,
    size,
    hoverSize,
    borderWidth,
    spring,
    friction,
    trailDuration,
    transitionSpeed,
  ]);

  if (!mounted) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
        pointerEvents: "none",
        zIndex: zIndex,
      }}
    />,
    document.body
  );
}
