/**
 * WebGL Shader utilities — ported from Framer's shader system.
 * Provides ShaderMount class, warp fragment shader, pattern shapes, 
 * and color conversion utilities for animated gradient backgrounds.
 */

/* ═══════════════════════════════════════════════
   Color conversion: string → [r, g, b, a] (0–1)
   ═══════════════════════════════════════════════ */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function hexToRgba(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (hex.length === 6) hex += "ff";
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
    parseInt(hex.slice(6, 8), 16) / 255,
  ];
}

function parseRgba(rgba) {
  const m = rgba.match(
    /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i
  );
  if (!m) return [0, 0, 0, 1];
  return [
    parseInt(m[1]) / 255,
    parseInt(m[2]) / 255,
    parseInt(m[3]) / 255,
    m[4] === undefined ? 1 : parseFloat(m[4]),
  ];
}

function parseHsla(hsla) {
  const m = hsla.match(
    /^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i
  );
  if (!m) return [0, 0, 0, 1];
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), m[4] === undefined ? 1 : parseFloat(m[4])];
}

function hslaToRgba([h, s, l, a]) {
  const sD = s / 100, lD = l / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = lD;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = lD < 0.5 ? lD * (1 + sD) : lD + sD - lD * sD;
    const p = 2 * lD - q;
    const hD = h / 360;
    r = hue2rgb(p, q, hD + 1 / 3);
    g = hue2rgb(p, q, hD);
    b = hue2rgb(p, q, hD - 1 / 3);
  }
  return [r, g, b, a];
}

export function getShaderColorFromString(colorString, fallback = [0, 0, 0, 1]) {
  if (Array.isArray(colorString)) {
    if (colorString.length === 4) return colorString;
    if (colorString.length === 3) return [...colorString, 1];
    return getShaderColorFromString(fallback);
  }
  if (typeof colorString !== "string") return getShaderColorFromString(fallback);
  let r, g, b, a = 1;
  if (colorString.startsWith("#")) [r, g, b, a] = hexToRgba(colorString);
  else if (colorString.startsWith("rgb")) [r, g, b, a] = parseRgba(colorString);
  else if (colorString.startsWith("hsl")) [r, g, b, a] = hslaToRgba(parseHsla(colorString));
  else return getShaderColorFromString(fallback);
  return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
}

/* ═══════════════════════════════════════════════
   Pattern shapes enum
   ═══════════════════════════════════════════════ */
export const PatternShapes = { Checks: 0, Stripes: 1, Edge: 2 };

/* ═══════════════════════════════════════════════
   Warp fragment shader (GLSL ES 3.0)
   ═══════════════════════════════════════════════ */
export const warpFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
    vec3 color1 = c1.rgb * c1.a;
    vec3 color2 = c2.rgb * c2.a;
    vec3 color3 = c3.rgb * c3.a;
    float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);
    float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);
    vec3 blended_color_2 = mix(color1, color2, r1);
    float blended_opacity_2 = mix(c1.a, c2.a, r1);
    vec3 c = mix(blended_color_2, color3, r2);
    float o = mix(blended_opacity_2, c3.a, r2);
    return vec4(c, o);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = .5 * u_time;
    float noise_scale = .0005 + .006 * u_scale;
    uv -= .5;
    uv *= (noise_scale * u_resolution);
    uv = rotate(uv, u_rotation * .5 * PI);
    uv /= u_pixelRatio;
    uv += .5;
    float n1 = noise(uv * 1. + t);
    float n2 = noise(uv * 2. - t);
    float angle = n1 * TWO_PI;
    uv.x += 4. * u_distortion * n2 * cos(angle);
    uv.y += 4. * u_distortion * n2 * sin(angle);
    float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
    for (float i = 1.; i <= iterations_number; i++) {
        uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
        uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);
    }
    float proportion = clamp(u_proportion, 0., 1.);
    float shape = 0.;
    float mixer = 0.;
    if (u_shape < .5) {
      vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);
      shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else if (u_shape < 1.5) {
      vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);
      float f = fract(stripes_shape_uv.y);
      shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else {
      float sh = 1. - uv.y;
      sh -= .5;
      sh /= (noise_scale * u_resolution.y);
      sh += .5;
      float shape_scaling = .2 * (1. - u_shapeScale);
      shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
      mixer = shape;
    }
    vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);
    fragColor = vec4(color_mix.rgb, color_mix.a);
}
`;

/* ═══════════════════════════════════════════════
   ShaderMount class — manages WebGL lifecycle
   ═══════════════════════════════════════════════ */
const vertexShaderSource = `#version 300 es
layout(location = 0) in vec4 a_position;
void main() {
  gl_Position = a_position;
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSrc, fsSrc) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  gl.detachShader(program, vs);
  gl.detachShader(program, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

export class ShaderMount {
  constructor(canvas, fragmentShader, uniforms = {}, speed = 1, seed = 0) {
    this.canvas = canvas;
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.program = null;
    this.uniformLocations = {};
    this.rafId = null;
    this.lastFrameTime = 0;
    this.totalAnimationTime = seed;
    this.speed = speed;
    this.hasBeenDisposed = false;
    this.resolutionChanged = true;
    this.resizeObserver = null;

    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not supported");
    this.gl = gl;

    this._initWebGL();
    this._setupResizeObserver();
    this.setSpeed(speed);
  }

  _initWebGL() {
    const program = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
    if (!program) return;
    this.program = program;

    // Full-screen quad
    const posLoc = this.gl.getAttribLocation(this.program, "a_position");
    const buf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      this.gl.STATIC_DRAW
    );
    this.gl.enableVertexAttribArray(posLoc);
    this.gl.vertexAttribPointer(posLoc, 2, this.gl.FLOAT, false, 0, 0);

    // Uniform locations
    this.uniformLocations = {
      u_time: this.gl.getUniformLocation(this.program, "u_time"),
      u_pixelRatio: this.gl.getUniformLocation(this.program, "u_pixelRatio"),
      u_resolution: this.gl.getUniformLocation(this.program, "u_resolution"),
      ...Object.fromEntries(
        Object.keys(this.providedUniforms).map((k) => [
          k,
          this.gl.getUniformLocation(this.program, k),
        ])
      ),
    };
    this._updateProvidedUniforms();
  }

  _setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => this._handleResize());
    this.resizeObserver.observe(this.canvas);
    this._handleResize();
  }

  _handleResize() {
    const pr = window.devicePixelRatio;
    const w = this.canvas.clientWidth * pr;
    const h = this.canvas.clientHeight * pr;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.resolutionChanged = true;
      this.gl.viewport(0, 0, w, h);
      this._render(performance.now());
    }
  }

  _render = (currentTime) => {
    if (this.hasBeenDisposed) return;
    const dt = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    if (this.speed !== 0) this.totalAnimationTime += dt * this.speed;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.uniformLocations.u_time, this.totalAnimationTime * 0.001);

    if (this.resolutionChanged) {
      this.gl.uniform2f(this.uniformLocations.u_resolution, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform1f(this.uniformLocations.u_pixelRatio, window.devicePixelRatio);
      this.resolutionChanged = false;
    }

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    if (this.speed !== 0) this.rafId = requestAnimationFrame(this._render);
    else this.rafId = null;
  };

  _updateProvidedUniforms() {
    this.gl.useProgram(this.program);
    Object.entries(this.providedUniforms).forEach(([key, value]) => {
      const loc = this.uniformLocations[key];
      if (!loc) return;
      if (Array.isArray(value)) {
        if (value.length === 2) this.gl.uniform2fv(loc, value);
        else if (value.length === 3) this.gl.uniform3fv(loc, value);
        else if (value.length === 4) this.gl.uniform4fv(loc, value);
      } else if (typeof value === "number") {
        this.gl.uniform1f(loc, value);
      }
    });
  }

  setSpeed(newSpeed = 1) {
    this.speed = newSpeed;
    if (this.rafId === null && newSpeed !== 0) {
      this.lastFrameTime = performance.now();
      this.rafId = requestAnimationFrame(this._render);
    }
    if (this.rafId !== null && newSpeed === 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setUniforms(newUniforms) {
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
    this._updateProvidedUniforms();
    this._render(performance.now());
  }

  dispose() {
    this.hasBeenDisposed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
