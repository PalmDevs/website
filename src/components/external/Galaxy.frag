precision mediump float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uScrollOffset;
uniform float uWarpSpeed;
uniform float uFadeOut;
uniform float uWarpZoom;
uniform float uRandomSeed;

varying vec2 vUv;

// 1 / LAYERS
#define NUM_LAYER_DIVIDED 0.34
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - abs(2.0 * t - 1.0);
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - abs(2.0 * t - 1.0)) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 0.6667, 0.3333, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float star(vec2 uv, float flare) {
  float d2 = dot(uv, uv);
  if (d2 > 1.0) return 0.0;
  
  float d = sqrt(d2);
  float m = (0.05 * uGlowIntensity) / max(d, 0.001);

  float ray = abs(uv.x * uv.y) * 1000.0;
  float rays = max(0.0, 1.0 - ray);
  m += rays * flare * uGlowIntensity * 0.7;

  uv *= MAT45;
  ray = abs(uv.x * uv.y) * 1000.0;
  rays = max(0.0, 1.0 - ray);
  m += rays * flare * uGlowIntensity * 0.2;

  return m * smoothstep(1.0, 0.2, d);
}

vec3 starAt(vec2 id, vec2 gv, float seed, float tSpeed) {
  float size = fract(seed * 345.32);
  float flare = smoothstep(0.9, 1.0, size) * abs(fract(uStarSpeed / (PERIOD * seed + 1.0)) * 2.0 - 1.0);

  vec2 pad = vec2(tris(seed * 34.0 + tSpeed * 0.1),
                  tris(seed * 38.0 + tSpeed * 0.033)) - 0.5;
                  
  float starV = star(gv - pad, flare);
  if (starV <= 0.001) return vec3(0.0);

  float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, hash21(id + 1.0)) + STAR_COLOR_CUTOFF;
  float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, hash21(id + 3.0)) + STAR_COLOR_CUTOFF;
  float grn = min(red, blu) * seed;
  vec3 base = vec3(red, grn, blu);

  float hue = fract(uHueShift + 0.05 * (hash21(id) - 0.5));
  float gray = dot(base, vec3(0.299, 0.587, 0.114));
  float sat = length(base - vec3(gray)) * uSaturation;
  float val = max(max(base.r, base.g), base.b);
  vec3 color = hsv2rgb(vec3(hue, sat, val));

  float twinkle = mix(1.0, trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0, uTwinkleIntensity);

  return starV * size * color * twinkle;
}

vec3 starLayer(vec2 uv, float tSpeed) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 cell = id + offset;
      float seed = hash21(cell);
      col += starAt(cell, gv - offset, seed, tSpeed);
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / max(uResolution.y, 1.0);
  float dist = length(uv);

  uv.y += uScrollOffset;
  uv = mix(uv, uv / max(dist, 0.001) * (dist + uWarpSpeed * 5.0), uWarpSpeed);
  uv *= mix(1.0, 0.5, uWarpZoom);

  float a = uTime * uRotationSpeed;
  float ca = cos(a), sa = sin(a);
  mat2 rot = mat2(ca, -sa, sa, ca);
  mat2 userRot = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x);
  uv = rot * (userRot * uv);

  vec3 col = vec3(0.0);
  float warpOffset = uWarpSpeed * 2.0;
  float tSpeed = uTime * uSpeed;

  for (int i = 0; i < 3; i++) {
    float layer = float(i) * NUM_LAYER_DIVIDED;
    float depth = fract(layer + uStarSpeed * uSpeed + warpOffset);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * (1.0 - smoothstep(0.9, 1.0, depth));
    col += starLayer(uv * scale + layer * 453.32 + uRandomSeed, tSpeed) * fade;
  }

  col *= (1.0 - uFadeOut);

  float alpha = clamp(smoothstep(0.0, 0.3, length(col)), 0.0, 1.0);
  alpha *= (1.0 - uFadeOut);
  gl_FragColor = vec4(col, alpha);
}