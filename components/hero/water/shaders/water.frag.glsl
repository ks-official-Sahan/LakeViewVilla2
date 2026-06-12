// Synced with ../shaders/water.ts — import WATER_FRAGMENT from there in production code.
uniform vec3 uWaterColor;
uniform vec3 uWaterSpecularColor;
uniform vec3 uSkyTop;
uniform vec3 uSkyBottom;
uniform vec3 uSunDirection;
uniform float uSunIntensity;
uniform float uScrollProgress;
uniform float uTime;
uniform float uShoreWorldZ;
uniform vec2 uLakeCenter;
uniform float uLakeRadius;
uniform vec3 uLanternViewPosition;
uniform vec2 uLanternPlanePos;
uniform vec3 uLanternColor;
uniform float uLanternIntensity;
uniform float uMobile;
uniform float uIsNight;
uniform float uWindX;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPos;
varying float vHeight;
varying float vWorldZ;
varying float vWorldX;
varying float vDepth;
varying float vFoamFactor;

float noiseH(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float causticNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = noiseH(i);
  float b = noiseH(i + vec2(1.0, 0.0));
  float c = noiseH(i + vec2(0.0, 1.0));
  float d = noiseH(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float caustics(vec2 uv, float t) {
  float c = 0.0;
  c += causticNoise(uv * 3.5 + vec2(t * 0.4, t * 0.25));
  c += causticNoise(uv * 7.0 - vec2(t * 0.55, t * 0.35)) * 0.5;
  c += causticNoise(uv * 14.0 + vec2(t * 0.3, -t * 0.2)) * 0.25;
  if (uMobile < 0.5) {
    c += causticNoise(uv * 22.0 - vec2(t * 0.15, t * 0.45)) * 0.12;
  }
  return pow(c * 0.48, 1.4);
}

vec3 tropicalAbsorption(float depth, vec3 baseColor) {
  vec3 absorbed = exp(-vec3(0.45, 0.15, 0.08) * depth);
  return baseColor * absorbed + vec3(0.02, 0.12, 0.18) * (1.0 - absorbed);
}

vec3 saturateColor(vec3 c, float amount) {
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  return mix(vec3(luma), c, amount);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  float viewDepth = vDepth;

  float depthFade = smoothstep(4.0, 28.0, viewDepth);
  float heightFactor = clamp((vHeight + 0.12) * 3.5, 0.0, 1.0);

  vec3 lagoonDeep = uWaterColor * 1.25;
  vec3 lagoonMid = uWaterColor * 1.75 + vec3(0.04, 0.14, 0.12);
  vec3 lagoonBright = uWaterColor * 2.1 + vec3(0.08, 0.18, 0.14);
  vec3 col = mix(mix(lagoonDeep, lagoonMid, heightFactor), lagoonBright, heightFactor * 0.45);
  col = mix(col, lagoonDeep * 0.95, depthFade * 0.25);
  col = tropicalAbsorption(depthFade * 2.5, col);

  vec2 lakePos = vec2(vWorldX, vWorldZ);
  float shoreNoise = causticNoise(lakePos * 0.12 + vec2(uWindX * 0.5, 0.0)) * 2.2;
  float distLake = length(lakePos - uLakeCenter);
  float irregularShore = smoothstep(uLakeRadius + shoreNoise, uLakeRadius - 2.8 - shoreNoise * 0.5, distLake);

  float distToShore = abs(vWorldZ - uShoreWorldZ);

  vec3 reflectDir = reflect(-viewDir, normal);
  float skyBlend = reflectDir.y * 0.5 + 0.5;
  vec3 skyReflect = mix(uSkyBottom, uSkyTop, clamp(skyBlend, 0.0, 1.0));
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);
  col = mix(col, skyReflect * 1.15, fresnel * 0.62);

  vec3 halfDir = normalize(uSunDirection + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 28.0);
  col += uWaterSpecularColor * spec * uSunIntensity * 1.45;

  float glintSpec = pow(max(dot(normal, halfDir), 0.0), 180.0);
  col += vec3(1.0, 0.98, 0.9) * glintSpec * uSunIntensity * 2.2;

  if (uMobile < 0.5) {
    vec2 sunXZ = normalize(uSunDirection.xz + vec2(0.001));
    float streak = pow(max(dot(normalize(vWorldPos.xy) * 0.08, sunXZ), 0.0), 6.0);
    col += uWaterSpecularColor * streak * uSunIntensity * 0.18;
  }

  float shallowMask = smoothstep(5.0, 0.3, distToShore) * (1.0 + heightFactor * 0.35);
  float caustic = caustics(vWorldPos.xy * 0.55, uTime) * shallowMask;
  col += vec3(0.55, 0.85, 0.75) * caustic * uSunIntensity * 0.42;

  float floorVar = causticNoise(vWorldPos.xy * 0.22 + vec2(3.7, 1.2));
  col = mix(col, col * 0.82 + vec3(0.14, 0.24, 0.16), floorVar * shallowMask * 0.4);

  vec3 fragPosInView = -vViewPosition;
  vec3 lightDir = normalize(uLanternViewPosition - fragPosInView);
  vec3 halfDirLantern = normalize(lightDir + viewDir);
  float specLantern = pow(max(dot(normal, halfDirLantern), 0.0), 32.0);
  float lightDist = length(uLanternViewPosition - fragPosInView);
  float attenuation = 1.0 / (1.0 + 0.22 * lightDist + 0.12 * lightDist * lightDist);
  col += uLanternColor * specLantern * uLanternIntensity * attenuation * 2.2;

  vec2 lanternDist = vWorldPos.xy - uLanternPlanePos;
  float lanternRipple = sin(length(lanternDist) * 8.0 - uTime * 2.5) * 0.5 + 0.5;
  float causticDisc = exp(-dot(lanternDist, lanternDist) * 0.32) * lanternRipple;
  col += uLanternColor * causticDisc * uLanternIntensity * 0.12;

  vec3 sandShallow = vec3(0.94, 0.88, 0.72);
  vec3 emeraldShallow = vec3(0.35, 0.78, 0.62);
  vec3 tealMid = vec3(0.18, 0.62, 0.58);
  float sandZone = smoothstep(1.4, 0.1, distToShore);
  float shallowZone = smoothstep(4.0, 0.4, distToShore);
  float midZone = smoothstep(7.0, 2.0, distToShore);
  col = mix(col, sandShallow, sandZone * 0.5);
  col = mix(col, emeraldShallow, shallowZone * 0.65);
  col = mix(col, tealMid, midZone * 0.35);

  float wavePhase = uTime * 2.8 + vWorldPos.x * 2.0 + distToShore * 1.5;
  float shoreFoam = smoothstep(0.8, 0.0, distToShore) * (0.5 + 0.5 * sin(wavePhase));
  shoreFoam = max(shoreFoam, vFoamFactor * smoothstep(4.0, 0.5, distToShore) * 0.35);

  vec2 rock1 = vec2(-4.0, 8.5);
  vec2 rock2 = vec2(1.5, 9.0);
  vec2 rock3 = vec2(4.5, 8.0);
  vec2 rock4 = vec2(-1.5, 9.5);
  vec2 rock5 = vec2(0.5, 10.0);
  float minRockDist = min(
    min(min(distance(vWorldPos.xy, rock1), distance(vWorldPos.xy, rock2)),
        min(distance(vWorldPos.xy, rock3), distance(vWorldPos.xy, rock4))),
    distance(vWorldPos.xy, rock5)
  );
  float rockFoam = smoothstep(0.5, 0.0, minRockDist) * (0.5 + 0.5 * sin(uTime * 3.4 + vWorldPos.x * 3.5));
  float finalFoam = max(shoreFoam, rockFoam);
  col = mix(col, vec3(0.96, 0.99, 1.0) * (uSunIntensity * 0.35 + 0.65), finalFoam * 0.72);

  float bio = smoothstep(3.5, 0.4, distToShore) * uIsNight;
  bio *= 0.5 + 0.5 * sin(uTime * 2.2 + vWorldX * 1.7 + vWorldZ * 1.3);
  col += vec3(0.04, 0.22, 0.42) * bio * 0.18;

  float ripple = sin(vWorldPos.x * 4.5 + uTime * 1.6) * sin(vWorldPos.y * 3.8 - uTime * 1.2);
  col += uWaterColor * ripple * 0.04;

  col = saturateColor(col, 1.42);

  float fieldJunction = smoothstep(-9.0, -5.5, vWorldX);
  float lakeMask = irregularShore * fieldJunction;

  float shoreDepthFade = smoothstep(-2.5, -5.5, vWorldZ);
  col = mix(col, emeraldShallow * 1.15, (1.0 - shoreDepthFade) * 0.22);

  col = mix(col * 0.55, col, lakeMask);

  float alpha = 0.94 * lakeMask * (1.0 - uScrollProgress * 0.45);

  gl_FragColor = vec4(col, alpha);
}
