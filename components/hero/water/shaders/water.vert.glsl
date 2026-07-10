// Synced with ../shaders/water.ts — import WATER_VERTEX from there in production code.
uniform float uTime;
uniform float uWaveSpeed;
uniform float uWaveAmplitude;
uniform float uMobile;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPos;
varying float vHeight;
varying float vWorldZ;
varying float vWorldX;
varying float vDepth;
varying float vFoamFactor;

struct Wave {
  vec2 dir;
  float amp;
  float freq;
  float steepness;
  float speed;
};

void main() {
  vUv = uv;
  vec3 pos = position;

  Wave waves[4];
  waves[0] = Wave(normalize(vec2(1.0, 0.4)), uWaveAmplitude * 0.7, 0.35, 0.6, uWaveSpeed * 0.8);
  waves[1] = Wave(normalize(vec2(-0.8, 0.8)), uWaveAmplitude * 0.35, 0.65, 0.45, uWaveSpeed * 1.3);
  waves[2] = Wave(normalize(vec2(0.3, -0.9)), uWaveAmplitude * 0.18, 1.20, 0.3, uWaveSpeed * 2.1);
  waves[3] = Wave(normalize(vec2(0.6, 0.2)), uWaveAmplitude * 0.12, 2.10, 0.22, uWaveSpeed * 2.8);

  int waveCount = uMobile > 0.5 ? 2 : 4;
  float steepSum = 0.0;

  vec3 displaced = pos;
  vec3 tangent = vec3(1.0, 0.0, 0.0);
  vec3 binormal = vec3(0.0, 1.0, 0.0);

  for (int i = 0; i < 4; i++) {
    if (i >= waveCount) break;
    float phase = dot(waves[i].dir, pos.xy) * waves[i].freq + uTime * waves[i].speed;
    float c = cos(phase);
    float s = sin(phase);
    float QA = waves[i].steepness * waves[i].amp;
    steepSum += abs(s) * waves[i].steepness;

    displaced.x += waves[i].dir.x * QA * c;
    displaced.y += waves[i].dir.y * QA * c;
    displaced.z += waves[i].amp * s;

    float kAmpSin = waves[i].freq * waves[i].amp * s;
    float kAmpCos = waves[i].freq * waves[i].amp * c;

    tangent.x -= waves[i].dir.x * waves[i].dir.x * waves[i].steepness * kAmpSin;
    tangent.y -= waves[i].dir.x * waves[i].dir.y * waves[i].steepness * kAmpSin;
    tangent.z += waves[i].dir.x * kAmpCos;

    binormal.x -= waves[i].dir.x * waves[i].dir.y * waves[i].steepness * kAmpSin;
    binormal.y -= waves[i].dir.y * waves[i].dir.y * waves[i].steepness * kAmpSin;
    binormal.z += waves[i].dir.y * kAmpCos;
  }

  float detail = sin(pos.x * 3.2 + uTime * uWaveSpeed * 2.5) * uWaveAmplitude * 0.08;
  detail += cos(pos.y * 2.8 - uTime * uWaveSpeed * 1.9) * uWaveAmplitude * 0.05;
  displaced.z += detail;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vViewPosition = -mvPosition.xyz;
  vNormal = normalize(cross(tangent, binormal));
  vWorldPos = displaced;
  vHeight = displaced.z;
  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldX = worldPos.x;
  vWorldZ = worldPos.z;
  vDepth = length(vViewPosition);
  vFoamFactor = clamp(steepSum * 0.35 + abs(detail) * 12.0, 0.0, 1.0);
}
