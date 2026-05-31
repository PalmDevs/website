/**
 * Modified version of: React Bits - Galaxy
 * License: MIT
 * Source: https://reactbits.dev/backgrounds/galaxy
 */

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
uniform float uQuality;

varying vec2 vUv;

// 1 / LAYERS
#define NUM_LAYER_DIVIDED 0.34
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

#define NEBULA_OPACITY 0.67
#define NEBULA_THRESHOLD_MIN 0.3
#define NEBULA_THRESHOLD_MAX 0.6
#define NEBULA_SCALE_MIN 5.0
#define NEBULA_SCALE_MAX 2.0
#define GLITTER_DENSITY 0.7
#define GLITTER_BRIGHTNESS_MIN 15.0
#define GLITTER_BRIGHTNESS_MAX 25.0
#define GLITTER_PULSE_POWER 200.0
#define GLITTER_GRID_MIN 700.0
#define GLITTER_GRID_MAX 400.0

// Dave Hoskins hash
float hash21(vec2 p) {
  vec3 p3  = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);
    
    // Bilinear interpolation with fewer hash calls if possible? 
    // No, standard 4-point is required for quality.
    float res = mix(
        mix(hash21(ip), hash21(ip + vec2(1.0, 0.0)), u.x),
        mix(hash21(ip + vec2(0.0, 1.0)), hash21(ip + vec2(1.0, 1.0)), u.x), u.y);
    return res;
}

float fbm(vec2 p, int octaves) {
    float f = 0.0;
    // Unrolled FBM to avoid loop overhead
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    
    f += 0.5 * noise(p);
    if (octaves > 1) {
        p = m * p;
        f += 0.25 * noise(p);
    }
    if (octaves > 2) {
        p = m * p;
        f += 0.125 * noise(p);
    }
    return f;
}

float tris(float x) {
  return 1.0 - abs(fract(x) * 2.0 - 1.0);
}

float trisn(float x) {
  return 2.0 * (1.0 - abs(fract(x) * 2.0 - 1.0)) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 0.6667, 0.3333, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float star(vec2 uv, float flare) {
  float d2 = dot(uv, uv);
  if (d2 > 1.0) return 0.0;
  
  // Use inversesqrt for faster falloff calculation
  float invd = inversesqrt(max(d2, 1e-6));
  float m = (0.05 * uGlowIntensity) * invd;

  // Axis rays
  float ray = abs(uv.x * uv.y) * 1000.0;
  m += max(0.0, 1.0 - ray) * flare * uGlowIntensity * 0.7;

  // Rotated rays
  vec2 uvRot = uv * MAT45;
  ray = abs(uvRot.x * uvRot.y) * 1000.0;
  m += max(0.0, 1.0 - ray) * flare * uGlowIntensity * 0.2;

  return m * smoothstep(1.0, 0.2, d2 * invd); // d2 * invd = sqrt(d2)
}

vec3 starAt(vec2 id, vec2 gv, float seed, float tSpeed) {
  float size = fract(seed * 345.32);
  float flare = smoothstep(0.9, 1.0, size) * abs(fract(uStarSpeed / (PERIOD * seed + 1.0)) * 2.0 - 1.0);

  vec2 pad = vec2(tris(seed * 34.0 + tSpeed * 0.1),
                  tris(seed * 38.0 + tSpeed * 0.033)) - 0.5;
                  
  float starV = star(gv - pad, flare);
  if (starV <= 0.001) return vec3(0.0);

  // Reuse seed for colors to avoid extra hash calls
  float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, fract(seed * 123.456)) + STAR_COLOR_CUTOFF;
  float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, fract(seed * 567.890)) + STAR_COLOR_CUTOFF;
  float grn = min(red, blu) * seed;
  vec3 base = vec3(red, grn, blu);

  float hue = fract(uHueShift + 0.05 * (seed - 0.5));
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

  // Unrolled loop for common cases (-1, 0, 1) could be faster but less readable.
  // We keep the loop as it is standard and usually optimized by compiler, 
  // but we minimize work inside starAt.
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
  
  float warpFade = 1.0 - smoothstep(0.0, 0.1, abs(uWarpSpeed));

  for (int i = 0; i < 3; i++) {
    if (float(i) > uQuality) break;
    
    float layer = float(i) * NUM_LAYER_DIVIDED;
    float depth = fract(layer + uStarSpeed * uSpeed + warpOffset);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * (1.0 - smoothstep(0.9, 1.0, depth));
    
    // Rotate each layer differently to break up grid alignment and patterns
    float layerAngle = layer * 6.283 + uRandomSeed;
    float cL = cos(layerAngle), sL = sin(layerAngle);
    mat2 layerRot = mat2(cL, -sL, sL, cL);
    vec2 rotatedUv = uv * layerRot;
    
    vec2 layerUv = rotatedUv * scale + layer * 453.32 + uRandomSeed;
    col += starLayer(layerUv, tSpeed) * fade;

    // Nebula (dust clouds), skipped on lowest quality tier (tier 0)
    if (uQuality >= 1.0) {
      float nebulaScale = mix(NEBULA_SCALE_MIN, NEBULA_SCALE_MAX, depth);
      vec2 nUv = rotatedUv * nebulaScale + layer * 10.0 + uRandomSeed;
      
      int octaves = uQuality < 2.0 ? 2 : 3;
      
      // Softer clouds, rarer threshold
      float n = fbm(nUv - vec2(tSpeed * 0.01, tSpeed * 0.02), octaves);
      n = smoothstep(NEBULA_THRESHOLD_MIN, NEBULA_THRESHOLD_MAX, n); 
      
      if (n > 0.0) {
        // Sparkle (glitter) grid - Keep coordinates small to maintain high precision
        vec2 glitterUv = rotatedUv;

        // Golden angle (137.5 deg) rotation is mathematically optimal for breaking grid artifacts
        glitterUv *= mat2(-0.608, -0.793, 0.793, -0.608); 

        glitterUv *= mix(GLITTER_GRID_MIN, GLITTER_GRID_MAX, depth);
        glitterUv += (layer + uRandomSeed) * 13.37;

        vec2 glitterId = floor(glitterUv);
        vec2 glitterFract = fract(glitterUv);
        float glitterHash = hash21(glitterId);
        
        // Single hash-based sparkles
        if (glitterHash > 1.0 - GLITTER_DENSITY) {
          // Use independent hash calls for x and y to ensure maximum decorrelation
          vec2 randomPos = vec2(
            hash21(glitterId + 0.156), 
            hash21(glitterId + 0.842)
          );
          float sizeHash = fract(glitterHash * 123.456);
          
          float distG = length(glitterFract - randomPos);
          float sparkleRadius = mix(0.12, 0.4, sizeHash);
          float sparkleShape = smoothstep(sparkleRadius, mix(0.01, 0.05, sizeHash), distG);
          
          float individualPhase = tSpeed * (0.4 + sizeHash * 0.6) + glitterHash * 6.28;
          float individualPulse = pow(max(0.0, sin(individualPhase)), GLITTER_PULSE_POWER);
          
          float brightness = mix(GLITTER_BRIGHTNESS_MIN, GLITTER_BRIGHTNESS_MAX, sizeHash);
          float glitter = sparkleShape * individualPulse * depth * brightness;
          
          float hue = fract(uHueShift + layer * 0.2 - n * 0.15);
          vec3 nebulaCol = hsv2rgb(vec3(hue, mix(0.2, 0.8, uSaturation), max(0.15, uGlowIntensity * 0.6)));
          
          col += nebulaCol * n * fade * warpFade * NEBULA_OPACITY * (1.0 + glitter * uTwinkleIntensity);
        } else {
          // Just nebula if no sparkle in this cell
          float hue = fract(uHueShift + layer * 0.2 - n * 0.15);
          vec3 nebulaCol = hsv2rgb(vec3(hue, mix(0.2, 0.8, uSaturation), max(0.15, uGlowIntensity * 0.6)));
          col += nebulaCol * n * fade * warpFade * NEBULA_OPACITY;
        }
      }
    }
  }

  col *= (1.0 - uFadeOut);

  float alpha = clamp(smoothstep(0.0, 0.3, length(col)), 0.0, 1.0);
  alpha *= (1.0 - uFadeOut);
  gl_FragColor = vec4(col, alpha);
}