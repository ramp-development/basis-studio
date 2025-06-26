uniform sampler2D uTexture;
uniform sampler2D uFluid;
uniform vec3 uColor;
uniform vec2 uRes;
uniform vec2 uSize;
uniform vec2 uAspect;
uniform float uBorder;
uniform float uReveal;
uniform float uRotate;
uniform float uRotateX;
uniform float uRotateY;
uniform float uRadius; // Add this uniform for border radius control
uniform float uZoom;

varying vec2 vUv;
varying vec2 screenUv;

#include ../../../../math/getCoverUv.glsl
#include ../../../../math/getAlpha.glsl
#include ../../../../math/rotateUv.glsl
#include ../../../../math/fakeBlur.glsl
#include ../../../../math/tint.glsl
#include ../../../../math/remap.glsl


// Function to create rounded rectangle
float roundedRect(vec2 uv, vec2 size, float radius) {
    vec2 center = vec2(0.5);
    vec2 pos = abs(uv - center) - (size * 0.5 - radius);
    return length(max(pos, 0.0)) + min(max(pos.x, pos.y), 0.0) - radius;
}

void main()
{
    vec2 uv = vUv;
    vec2 coverUv = getCoverUv(uv, uAspect, uSize);
    vec4 color = texture2D(uTexture, coverUv);
    float alpha = getAlpha(uSize, uBorder, uv);
    float cursor = texture2D(uFluid, screenUv).r;
    float oldCursor = cursor;
    cursor = smoothstep(0.2, 1.0, cursor);
    cursor = clamp(cursor, 0.0, 1.0);
    cursor = pow(cursor, 2.5); // Adjust cursor sensitivity

    color.a *= alpha;

    float tintAmount = smoothstep(0.0, 1.0, cursor) * 0.1;

    // color.rgb = mix(color.rgb, 1.0 - color.rgb, cursor);
    vec3 blurColor = 1.0 - fastGaussianBlur(uTexture, coverUv, oldCursor * 5.).rgb;
    color.rgb = mix(color.rgb, blurColor, cursor * 2.0);

    float fadeArea = smoothstep(0.0, 0.5, uv.y);
    color.rgb = mix(color.rgb * 0.2, color.rgb, fadeArea);

    gl_FragColor = color;
    // gl_FragColor = vec4(cursor, 0.0, 0.0, 1.0);
}