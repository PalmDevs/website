precision highp float;

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

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;

  float rayProduct = uv.x * uv.y * 1000.0;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(rayProduct));
  m += rays * flare * uGlowIntensity;

  uv *= MAT45;
  rayProduct = uv.x * uv.y * 1000.0;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(rayProduct));
  m += rays * 0.3 * flare * uGlowIntensity;
  
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    vec2 si0 = id + vec2(-1.0, float(y));
    vec2 si1 = id + vec2(0.0, float(y));
    vec2 si2 = id + vec2(1.0, float(y));
    
    float seed0 = Hash21(si0);
    float seed1 = Hash21(si1);
    float seed2 = Hash21(si2);
    
    // x=-1
    {
      float size = fract(seed0 * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed0 + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si0 + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si0 + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed0;
      vec3 base = vec3(red, grn, blu);
      
      float hue = fract(uHueShift + 0.05 * (Hash21(si0) - 0.5));
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      vec3 color = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed0 * 34.0 + uTime * uSpeed / 10.0), tris(seed0 * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      float star = Star(gv - vec2(-1.0, float(y)) - pad, flareSize);
      float twinkle = trisn(uTime * uSpeed + seed0 * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * size * color * twinkle;
    }
    
    //x=0
    {
      float size = fract(seed1 * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed1 + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si1 + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si1 + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed1;
      vec3 base = vec3(red, grn, blu);
      
      float hue = fract(uHueShift + 0.05 * (Hash21(si1) - 0.5));
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      vec3 color = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed1 * 34.0 + uTime * uSpeed / 10.0), tris(seed1 * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      float star = Star(gv - vec2(0.0, float(y)) - pad, flareSize);
      float twinkle = trisn(uTime * uSpeed + seed1 * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * size * color * twinkle;
    }
    
    // x=1
    {
      float size = fract(seed2 * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed2 + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si2 + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si2 + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed2;
      vec3 base = vec3(red, grn, blu);
      
      float hue = fract(uHueShift + 0.05 * (Hash21(si2) - 0.5));
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      vec3 color = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed2 * 34.0 + uTime * uSpeed / 10.0), tris(seed2 * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      float star = Star(gv - vec2(1.0, float(y)) - pad, flareSize);
      float twinkle = trisn(uTime * uSpeed + seed2 * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * size * color * twinkle;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  vec2 uvCenter = uv;
  float distFromCenter = length(uvCenter);

  uv.y += uScrollOffset;
  uv = mix(uv, normalize(uv) * (distFromCenter + uWarpSpeed * 5.0), uWarpSpeed);
  uv *= mix(1.0, 0.5, uWarpZoom);

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += NUM_LAYER_DIVIDED) {
    float warpOffset = uWarpSpeed * 2.0;
    float depth = fract(i + uStarSpeed * uSpeed + warpOffset);

    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32 + uRandomSeed) * fade;
  }

  col *= (1.0 - uFadeOut);

  float alpha = length(col);
  alpha = smoothstep(0.0, 0.3, alpha);
  alpha = min(alpha, 1.0);
  alpha *= (1.0 - uFadeOut);
  gl_FragColor = vec4(col, alpha);
}