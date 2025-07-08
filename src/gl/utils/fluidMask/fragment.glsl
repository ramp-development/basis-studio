uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;
uniform float uLoading;

varying vec2 vUv;
varying vec2 screenUv;

#include ../../math/fakeBlur.glsl

void main()
{
    vec2 uv = vUv;

    uv -= 0.5;
    uv *= 1.1 - uLoading * 0.1;
    uv += 0.5;

    vec4 color = texture2D(uTexture, uv);
    float cursor = texture2D(uFluid, screenUv).r;
    float oldCursor = cursor;
    cursor = smoothstep(0.2, 1.0, cursor);
    cursor = clamp(cursor, 0.0, 1.0);
    cursor = pow(cursor, 2.5); // Adjust cursor sensitivity

    vec4 blurColor = fakeBlur(uTexture, uv, 2.0);
    color.rgb = mix(color.rgb, uColor, cursor);

    color = mix(blurColor, color, uLoading);
    color.a *= uLoading;

    gl_FragColor = color;
}