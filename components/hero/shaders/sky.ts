export const SKY_VERTEX = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uColorTop;
  uniform vec3 uColorBottom;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform float uSunSize;
  uniform float uTime;
  uniform float uGoldenHourBoost;
  uniform float uIsNight;
  uniform float uWindX;
  uniform float uMobile;
  uniform float uMoonPhase;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    int octaves = uMobile > 0.5 ? 3 : 5;
    for (int i = 0; i < 5; i++) {
      if (i >= octaves) break;
      v += a * smoothNoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  vec3 rayleighScatter(vec3 direction, float dayFactor) {
    float elevation = max(direction.y, 0.0);
    vec3 betaR = vec3(0.35, 0.55, 1.0);
    return betaR * pow(elevation, 0.45) * dayFactor * 0.22;
  }

  void main() {
    vec3 direction = normalize(vWorldPosition);
    float h = direction.y * 0.5 + 0.5;
    vec3 skyColor = mix(uColorBottom, uColorTop, h);

    vec3 sunDir = normalize(uSunDirection);
    float sunDot = dot(direction, sunDir);
    float dayFactor = 1.0 - uIsNight;

    skyColor += rayleighScatter(direction, dayFactor);

    float diskSize = mix(uSunSize, uSunSize * 0.5, uIsNight);
    float sunCore = smoothstep(1.0 - diskSize * 0.75, 1.0 - diskSize * 0.15, sunDot);
    float sunCorona = smoothstep(1.0 - diskSize * 2.8, 1.0 - diskSize * 0.55, sunDot);

    float moonMask = 1.0;
    if (uIsNight > 0.4) {
      float phaseEdge = mix(0.15, 0.85, uMoonPhase);
      float crescent = smoothstep(phaseEdge - 0.08, phaseEdge + 0.08, sunDot + direction.x * 0.12);
      moonMask = mix(crescent, 1.0, step(0.92, uMoonPhase));
    }

    vec3 sunDisk = uSunColor * (sunCore * 4.2 * moonMask + sunCorona * 1.4 * (1.0 - uIsNight * 0.55));

    float horizon = exp(-abs(direction.y) * 6.5);
    vec3 scatter = uSunColor * horizon * uGoldenHourBoost * 0.9;
    skyColor += scatter;

    float mie = pow(max(sunDot, 0.0), 8.0) * horizon * 0.35 * dayFactor;
    skyColor += uSunColor * mie;

    float antiSunDot = max(dot(direction, -sunDir), 0.0);
    float afterglow = pow(antiSunDot, 5.0) * horizon * uGoldenHourBoost * dayFactor;
    skyColor += vec3(0.12, 0.16, 0.32) * afterglow * 0.65;

    float dayHaze = smoothstep(0.0, 0.22, direction.y) * (1.0 - smoothstep(0.22, 0.45, direction.y));
    skyColor = mix(skyColor, mix(uColorBottom, vec3(0.75, 0.82, 0.9), 0.5), dayHaze * dayFactor * 0.35);

    float rayAngle = atan(direction.x, direction.z);
    float rayNoise = fbm(vec2(rayAngle * 4.0 + uTime * 0.018, direction.y * 3.5 + uTime * 0.01));
    float rayMask = smoothstep(0.91, 1.0, sunDot) * dayFactor * uGoldenHourBoost;
    skyColor += uSunColor * rayNoise * rayMask * horizon * 0.42;

    float stars = 0.0;
    if (uIsNight > 0.3 && direction.y > 0.05) {
      vec2 starUV = direction.xz / (direction.y + 0.02) * 180.0;
      float starCell = hash(floor(starUV));
      float starBright = step(0.988, starCell);
      float twinkle = sin(uTime * 2.5 + starCell * 120.0) * 0.25 + 0.75;
      stars = starBright * twinkle * uIsNight * smoothstep(0.05, 0.35, direction.y);
      float milky = smoothstep(0.6, 0.8, fbm(direction.xz * 3.0 + vec2(0.0, uTime * 0.002)));
      stars += milky * 0.08 * uIsNight * smoothstep(0.1, 0.5, direction.y);
    }
    skyColor += vec3(1.0, 0.98, 0.93) * stars;

    float cloudMix = 0.0;
    if (direction.y > -0.08) {
      vec2 baseUv = vec2(direction.x, direction.z) / (direction.y + 0.1);

      vec2 cirrusUv = baseUv * 1.4;
      cirrusUv.x += uTime * 0.0035 * uWindX;
      cirrusUv.y += uTime * 0.0008 * abs(uWindX);
      float cirrus = smoothstep(0.55, 0.78, fbm(cirrusUv)) * smoothstep(0.15, 0.55, direction.y);

      vec2 cumulusUv = baseUv * 2.2;
      cumulusUv.x += uTime * 0.007 * uWindX;
      cumulusUv.y += uTime * 0.0012 * uWindX * 0.5;
      float cumulus = smoothstep(0.42, 0.72, fbm(cumulusUv)) * smoothstep(-0.05, 0.35, direction.y);

      vec2 hazeUv = baseUv * 0.9;
      hazeUv.x += uTime * 0.0045 * uWindX;
      float lowHaze = smoothstep(0.35, 0.65, fbm(hazeUv)) * smoothstep(-0.05, 0.18, direction.y);

      vec2 altUv = baseUv * 3.5;
      altUv.x += uTime * 0.005 * uWindX;
      float alto = smoothstep(0.50, 0.75, fbm(altUv)) * smoothstep(0.08, 0.45, direction.y);

      vec2 wispsUv = baseUv * 5.0;
      wispsUv.x += uTime * 0.009 * uWindX;
      float wisps = smoothstep(0.58, 0.82, fbm(wispsUv)) * smoothstep(0.20, 0.60, direction.y);

      cloudMix = cirrus * 0.12 + cumulus * 0.26 + lowHaze * 0.16 + alto * 0.10 + wisps * 0.06;
    }

    vec3 cloudTint = mix(
      vec3(0.92, 0.95, 1.0) * (uSunColor * 0.5 + 0.5),
      vec3(0.06, 0.12, 0.18),
      uIsNight * 0.75
    );
    vec3 goldenCloudTint = mix(cloudTint, uSunColor * 1.2, uGoldenHourBoost * 0.4);
    vec3 finalColor = mix(skyColor + sunDisk, goldenCloudTint, cloudMix * 0.85);

    float skyLuma = dot(finalColor, vec3(0.299, 0.587, 0.114));
    finalColor = mix(vec3(skyLuma), finalColor, 1.18);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
