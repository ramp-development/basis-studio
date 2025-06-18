uniform vec3 uMain;
uniform vec3 uBg;
uniform vec3 uMidColor;
uniform vec3 uColors[2];
uniform float uTime;

varying vec2 vUv;
varying vec3 vColor;

#include ../../math/simplexNoise.glsl

void main()
{
    vUv = uv;
    vec4 modelPoisition = modelMatrix * vec4(position, 1.0);

    vec2 noiseCoords = uv * vec2(3.0, 4.0);

    float noise = snoise(vec3(noiseCoords.x + uTime * 0.02, noiseCoords.y, uTime * 0.05));

    float tilt = -0.8 * uv.y;
    float incline = uv.x * 0.8;
    float offset = incline * mix(-0.75, 0.75, uv.y);

    noise = max(0.0, noise);

    vec3 pos = vec3(position.x, position.y, position.z + noise * 0.6 + tilt + incline + offset);

    vColor = uBg;

    for(int i = 0; i < 2; i++)
    {
        float noiseFlow = 5. + float(i) * 0.3;
        float noiseSpeed = 10. + float(i) * 0.3;
        float noiseSeed = 1. + float(i) * 10.;
        vec2 noiseFreq = vec2(0.3, 0.4);
        float noiseFloor = 0.1;
        float noiseCeil = 0.8 + float(i) * 0.08;

        float colorNoise = smoothstep(noiseFloor, noiseCeil, snoise(
            vec3(
                noiseCoords.x * noiseFreq.x + uTime * 0.01 * noiseFlow,
                noiseCoords.y * noiseFreq.y,
                uTime * 0.01 * noiseSpeed + noiseSeed
            )
        ) * 0.5 + 0.1);

        vColor = mix(vColor, uColors[i], colorNoise);
    }

    // float colorNoise = snoise(vec3(noiseCoords.x + uTime * 0.04, noiseCoords.y, uTime * .1));
    // vColor = mix(vColor, uMain, colorNoise * 0.5 + 0.5);

    // Final Posisiotn
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}