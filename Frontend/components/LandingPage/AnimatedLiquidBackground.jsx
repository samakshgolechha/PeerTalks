"use client";
import { useEffect, useRef, useMemo } from "react";
import {
  ShaderMount,
  warpFragmentShader,
  PatternShapes,
  getShaderColorFromString,
} from "./shaderUtils";

/**
 * Preset configurations matching Framer's AnimatedLiquidBackground.
 * Using the "Plasma" preset with purple colors for PeerTalks brand.
 */
const presets = {
  Prism: {
    color1: "#050505",
    color2: "#66B3FF",
    color3: "#FFFFFF",
    rotation: -50,
    proportion: 1,
    scale: 0.01,
    speed: 30,
    distortion: 0,
    swirl: 50,
    swirlIterations: 16,
    softness: 47,
    offset: -299,
    shape: "Checks",
    shapeSize: 45,
  },
  Plasma: {
    color1: "#B566FF",
    color2: "#000000",
    color3: "#000000",
    rotation: 0,
    proportion: 63,
    scale: 0.75,
    speed: 30,
    distortion: 5,
    swirl: 61,
    swirlIterations: 5,
    softness: 100,
    offset: -168,
    shape: "Checks",
    shapeSize: 28,
  },
  Mist: {
    color1: "#050505",
    color2: "#FF66B8",
    color3: "#050505",
    rotation: 0,
    proportion: 33,
    scale: 0.48,
    speed: 39,
    distortion: 4,
    swirl: 65,
    swirlIterations: 5,
    softness: 100,
    offset: -235,
    shape: "Edge",
    shapeSize: 48,
  },
  // Custom purple preset for PeerTalks
  PeerTalks: {
    color1: "#0a0010",
    color2: "#9B30FF",
    color3: "#1a0030",
    rotation: -30,
    proportion: 45,
    scale: 0.4,
    speed: 25,
    distortion: 3,
    swirl: 55,
    swirlIterations: 8,
    softness: 85,
    offset: -200,
    shape: "Checks",
    shapeSize: 35,
  },
};

const speedEase = (t) => {
  // cubic bezier approximation (.65, 0, .88, .77)
  return t * t * (3 - 2 * t);
};

/**
 * AnimatedLiquidBackground — WebGL animated gradient background.
 * Ported from Framer component, runs as a standalone React component.
 *
 * @param {string} preset - One of: "Prism", "Plasma", "Mist", "PeerTalks" or "custom"
 * @param {string} color1 - Custom color 1 (used when preset="custom")
 * @param {string} color2 - Custom color 2
 * @param {string} color3 - Custom color 3
 * @param {number} speed - Animation speed 0-100
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 */
export default function AnimatedLiquidBackground({
  preset = "PeerTalks",
  color1,
  color2,
  color3,
  speed,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const mountRef = useRef(null);

  const values = preset === "custom"
    ? { color1, color2, color3 }
    : presets[preset] || presets.PeerTalks;

  const finalSpeed = speed !== undefined ? speed : values.speed;

  const uniforms = useMemo(() => {
    return {
      u_scale: values.scale ?? 0.4,
      u_rotation: ((values.rotation ?? 0) * Math.PI) / 180,
      u_color1: getShaderColorFromString(
        preset === "custom" ? color1 : values.color1,
        [0, 0, 0, 1]
      ),
      u_color2: getShaderColorFromString(
        preset === "custom" ? color2 : values.color2,
        [0.5, 0.5, 1, 1]
      ),
      u_color3: getShaderColorFromString(
        preset === "custom" ? color3 : values.color3,
        [0, 0, 0, 1]
      ),
      u_proportion: (values.proportion ?? 50) / 100,
      u_softness: (values.softness ?? 100) / 100,
      u_distortion: (values.distortion ?? 5) / 50,
      u_swirl: (values.swirl ?? 50) / 100,
      u_swirlIterations:
        (values.swirl ?? 50) === 0 ? 0 : values.swirlIterations ?? 8,
      u_shapeScale: (values.shapeSize ?? 30) / 100,
      u_shape: PatternShapes[values.shape] ?? PatternShapes.Checks,
    };
  }, [preset, color1, color2, color3, values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const computedSpeed = speedEase(finalSpeed / 100) * 5;
      const seed = (values.offset ?? 0) * 10;

      mountRef.current = new ShaderMount(
        canvas,
        warpFragmentShader,
        uniforms,
        computedSpeed,
        seed
      );
    } catch (e) {
      console.warn("WebGL not available for liquid background:", e);
    }

    return () => {
      mountRef.current?.dispose();
      mountRef.current = null;
    };
  }, []);

  // Update uniforms when they change
  useEffect(() => {
    if (mountRef.current) {
      mountRef.current.setUniforms(uniforms);
    }
  }, [uniforms]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }}
    />
  );
}
